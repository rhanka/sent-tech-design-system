import React from "react";
import { classNames } from "./classNames.js";
import {
  buildLinearPath,
  buildSmoothPath,
  CHART_MARGIN,
  ChartDataList,
  extendValueDomain,
  formatTick,
  isNumeric,
  linearRegression,
  niceTicks,
  overlayDataListItems,
  overlayToneClass,
  scaleLinear,
  type ChartBand,
  type ChartGoalLine,
  type ChartReferenceLine,
} from "./chartScale.js";

export type LineChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type LineChartDatum = {
  x: number | string;
  y: number;
};

export type LineChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: LineChartDatum[];
  width?: number;
  height?: number;
  tone?: LineChartTone;
  smooth?: boolean;
  area?: boolean;
  label: string;
  /** Reference lines (default `axis: "y"` → horizontal at `value`). */
  referenceLines?: ChartReferenceLine[];
  /** Shaded value-axis bands between `from`..`to`. */
  bands?: ChartBand[];
  /** A single goal line, emphasised above the data. */
  goalLine?: ChartGoalLine;
  /** Least-squares trend line over the data points. */
  trend?: boolean;
  className?: string;
};

const MARGIN = CHART_MARGIN;

export function LineChart({
  data,
  width = 480,
  height = 240,
  tone = "category1",
  smooth = false,
  area = false,
  label,
  referenceLines,
  bands,
  goalLine,
  trend = false,
  className,
  ...rest
}: LineChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  const xDomain = (() => {
    if (data.length === 0) return { kind: "ordinal" as const, values: [] as (number | string)[] };
    const allNumeric = data.every((d) => isNumeric(d.x));
    if (allNumeric) {
      const xs = data.map((d) => d.x as number);
      return { kind: "numeric" as const, min: Math.min(...xs), max: Math.max(...xs) };
    }
    return { kind: "ordinal" as const, values: data.map((d) => d.x) };
  })();

  // A valid goal line needs a finite value; otherwise it is ignored entirely.
  const goal = goalLine && Number.isFinite(goalLine.value) ? goalLine : null;

  const yTicks = (() => {
    const ys = data.map((d) => d.y).filter((y) => Number.isFinite(y));
    if (ys.length === 0 && !referenceLines?.length && !bands?.length && !goal) return [0];
    let minRaw = ys.length ? Math.min(...ys) : 0;
    let maxRaw = ys.length ? Math.max(...ys) : 0;
    // Fold overlay values into the domain so they never fall outside the plot.
    [minRaw, maxRaw] = extendValueDomain(minRaw, maxRaw, {
      referenceLines,
      bands,
      goalLine: goal,
    });
    const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
    return niceTicks(minRaw - padded, maxRaw + padded, 5);
  })();

  const yDomain = yTicks.length === 0 ? { min: 0, max: 1 } : { min: yTicks[0], max: yTicks[yTicks.length - 1] };

  const points = (() => {
    if (data.length === 0) return [] as Array<{ x: number; y: number; datum: LineChartDatum; index: number }>;
    return data.map((d, i) => {
      let x: number;
      if (xDomain.kind === "numeric") {
        x = scaleLinear(d.x as number, xDomain.min, xDomain.max, 0, plotWidth);
      } else {
        const denom = Math.max(data.length - 1, 1);
        x = data.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
      }
      const y = scaleLinear(d.y, yDomain.min, yDomain.max, plotHeight, 0);
      return { x: MARGIN.left + x, y: MARGIN.top + y, datum: d, index: i };
    });
  })();

  // --- Analytical overlays -------------------------------------------------
  // All overlays live in the chart's coordinate space, below the data series
  // (the goal line is the single exception, drawn above for emphasis).
  const valueToY = (v: number) => MARGIN.top + scaleLinear(v, yDomain.min, yDomain.max, plotHeight, 0);
  const dataValueToX = (v: number) =>
    xDomain.kind === "numeric"
      ? MARGIN.left + scaleLinear(v, xDomain.min, xDomain.max, 0, plotWidth)
      : null;

  const bandRects = (bands ?? [])
    .filter((b) => Number.isFinite(b.from) && Number.isFinite(b.to))
    .map((b, i) => {
      const y1 = valueToY(b.from);
      const y2 = valueToY(b.to);
      return {
        key: i,
        x: MARGIN.left,
        y: Math.min(y1, y2),
        width: plotWidth,
        height: Math.max(Math.abs(y2 - y1), 0.5),
        label: b.label,
        tone: b.tone,
      };
    });

  const refLines = (referenceLines ?? [])
    .filter((r) => Number.isFinite(r.value))
    .map((r, i) => {
      const axis = r.axis ?? "y";
      if (axis === "x") {
        const x = dataValueToX(r.value);
        if (x === null) return null; // x reference needs a numeric x domain
        return { key: i, axis, x1: x, x2: x, y1: MARGIN.top, y2: MARGIN.top + plotHeight, label: r.label, tone: r.tone };
      }
      const y = valueToY(r.value);
      return { key: i, axis, x1: MARGIN.left, x2: MARGIN.left + plotWidth, y1: y, y2: y, label: r.label, tone: r.tone };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  const goalGeom = goal
    ? { y: valueToY(goal.value), x1: MARGIN.left, x2: MARGIN.left + plotWidth, label: goal.label, value: goal.value }
    : null;

  // Trend = least-squares regression in DATA space, then projected to pixels.
  const trendModel =
    trend && xDomain.kind === "numeric"
      ? linearRegression(data.map((d) => ({ x: d.x as number, y: d.y })))
      : null;
  const trendLine =
    trendModel && xDomain.kind === "numeric"
      ? {
          x1: MARGIN.left + scaleLinear(trendModel.minX, xDomain.min, xDomain.max, 0, plotWidth),
          y1: valueToY(trendModel.slope * trendModel.minX + trendModel.intercept),
          x2: MARGIN.left + scaleLinear(trendModel.maxX, xDomain.min, xDomain.max, 0, plotWidth),
          y2: valueToY(trendModel.slope * trendModel.maxX + trendModel.intercept),
        }
      : null;

  const dataValueItems = [
    ...data.map((d) => `${d.x}: ${d.y}`),
    ...overlayDataListItems({ referenceLines, bands, goalLine: goal, trend: trendModel }),
  ];

  const linePath = points.length === 0 ? "" : smooth ? buildSmoothPath(points) : buildLinearPath(points);

  const areaPath = (() => {
    if (!area || points.length === 0) return "";
    const base = MARGIN.top + plotHeight;
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L${last.x.toFixed(2)},${base.toFixed(2)} L${first.x.toFixed(2)},${base.toFixed(2)} Z`;
  })();

  const gridLines = yTicks.map((tick) => ({
    value: tick,
    y: MARGIN.top + scaleLinear(tick, yDomain.min, yDomain.max, plotHeight, 0),
  }));

  const xTickEntries = (() => {
    if (data.length === 0) return [] as Array<{ x: number; label: string }>;
    if (xDomain.kind === "ordinal") {
      return points.map((p, i) => ({ x: p.x, label: String(data[i].x) }));
    }
    const target = Math.min(5, data.length);
    const stride = Math.max(1, Math.round((data.length - 1) / (target - 1 || 1)));
    const entries: { x: number; label: string }[] = [];
    for (let i = 0; i < data.length; i += stride) {
      entries.push({ x: points[i].x, label: String(data[i].x) });
    }
    const lastIdx = data.length - 1;
    if (entries[entries.length - 1]?.label !== String(data[lastIdx].x)) {
      entries.push({ x: points[lastIdx].x, label: String(data[lastIdx].x) });
    }
    return entries;
  })();

  function handleLeave() {
    setHoveredIndex(null);
  }
  function handleVisualPointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredIndex(null);
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(index) ? index : null);
  }

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-lineChart", `st-lineChart--${tone}`, className)}>
      <div
        className="st-lineChart__visual"
        role="img"
        aria-label={label}
        onPointerMove={handleVisualPointerMove}
        onPointerLeave={handleLeave}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          {gridLines.map((g) => (
            <React.Fragment key={g.value}>
              <line className="st-lineChart__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={g.y} y2={g.y} />
              <text
                className="st-lineChart__tickLabel"
                x={MARGIN.left - 6}
                y={g.y}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {formatTick(g.value)}
              </text>
            </React.Fragment>
          ))}

          <line className="st-lineChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line
            className="st-lineChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {xTickEntries.map((tick, i) => (
            <text
              key={i}
              className="st-lineChart__tickLabel"
              x={tick.x}
              y={height - MARGIN.bottom + 16}
              textAnchor="middle"
            >
              {tick.label}
            </text>
          ))}

          {/* Analytical overlays — bands + reference lines + trend sit BELOW the
              data (markers, not series); the goal line is drawn above. */}
          {bandRects.map((b) => (
            <React.Fragment key={`band-${b.key}`}>
              <rect
                className={classNames("st-lineChart__band", overlayToneClass("st-lineChart__band", b.tone))}
                x={b.x}
                y={b.y}
                width={b.width}
                height={b.height}
              />
              {b.label ? (
                <text className="st-lineChart__overlayLabel" x={b.x + 4} y={b.y + 11}>
                  {b.label}
                </text>
              ) : null}
            </React.Fragment>
          ))}

          {refLines.map((r) => (
            <React.Fragment key={`ref-${r.key}`}>
              <line
                className={classNames("st-lineChart__refLine", overlayToneClass("st-lineChart__refLine", r.tone))}
                x1={r.x1}
                x2={r.x2}
                y1={r.y1}
                y2={r.y2}
              />
              {r.label ? (
                <text
                  className="st-lineChart__overlayLabel"
                  x={r.axis === "x" ? r.x1 + 4 : MARGIN.left + plotWidth - 4}
                  y={r.axis === "x" ? MARGIN.top + 11 : r.y1 - 4}
                  textAnchor={r.axis === "x" ? "start" : "end"}
                >
                  {r.label}
                </text>
              ) : null}
            </React.Fragment>
          ))}

          {trendLine ? (
            <line
              className="st-lineChart__trend"
              x1={trendLine.x1}
              y1={trendLine.y1}
              x2={trendLine.x2}
              y2={trendLine.y2}
            />
          ) : null}

          {area && areaPath ? <path className="st-lineChart__area" d={areaPath} /> : null}
          {linePath ? (
            <path
              className="st-lineChart__line"
              d={linePath}
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {points.map((p) => (
            <circle key={p.index} className="st-lineChart__dot" cx={p.x} cy={p.y} r="4" data-chart-index={p.index} />
          ))}

          {/* Goal line — emphasised, ABOVE the data. */}
          {goalGeom ? (
            <>
              <line
                className="st-lineChart__goalLine"
                x1={goalGeom.x1}
                x2={goalGeom.x2}
                y1={goalGeom.y}
                y2={goalGeom.y}
              />
              <text
                className="st-lineChart__goalLabel"
                x={MARGIN.left + plotWidth - 4}
                y={goalGeom.y - 4}
                textAnchor="end"
              >
                {goalGeom.label ?? `Objectif ${goalGeom.value}`}
              </text>
            </>
          ) : null}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredPoint ? (
        <div
          className="st-lineChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: `${(hoveredPoint.y / height) * 100}%` }}
        >
          <span className="st-lineChart__tooltipLabel">{hoveredPoint.datum.x}</span>
          <span className="st-lineChart__tooltipValue">{hoveredPoint.datum.y}</span>
        </div>
      ) : null}
    </div>
  );
}

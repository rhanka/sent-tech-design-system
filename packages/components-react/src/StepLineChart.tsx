import React from "react";
import { classNames } from "./classNames.js";
import {
  CHART_MARGIN,
  ChartDataList,
  formatTick,
  isNumeric,
  niceTicks,
  scaleLinear,
} from "./chartScale.js";

export type StepLineChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type StepLineChartDatum = {
  x: number | string;
  y: number;
};

export type StepLineChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: StepLineChartDatum[];
  width?: number;
  height?: number;
  tone?: StepLineChartTone;
  label: string;
  className?: string;
};

const MARGIN = CHART_MARGIN;

function isValidDatum(datum: StepLineChartDatum): boolean {
  return Number.isFinite(datum.y) && (typeof datum.x === "string" || isNumeric(datum.x));
}

function buildStepPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  let path = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) {
    const point = pts[i];
    path += ` H${point.x.toFixed(2)} V${point.y.toFixed(2)}`;
  }
  return path;
}

export function StepLineChart({
  data = [],
  width = 480,
  height = 240,
  tone = "category1",
  label,
  className,
  ...rest
}: StepLineChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const safeData = data.filter(isValidDatum);
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  const xDomain = (() => {
    if (safeData.length === 0) return { kind: "ordinal" as const, values: [] as (number | string)[] };
    const allNumeric = safeData.every((d) => isNumeric(d.x));
    if (allNumeric) {
      const xs = safeData.map((d) => d.x as number);
      return { kind: "numeric" as const, min: Math.min(...xs), max: Math.max(...xs) };
    }
    return { kind: "ordinal" as const, values: safeData.map((d) => d.x) };
  })();

  const yTicks = (() => {
    const ys = safeData.map((d) => d.y);
    if (ys.length === 0) return [0];
    const minRaw = Math.min(...ys);
    const maxRaw = Math.max(...ys);
    const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
    return niceTicks(minRaw - padded, maxRaw + padded, 5);
  })();

  const yDomain = yTicks.length === 0 ? { min: 0, max: 1 } : { min: yTicks[0], max: yTicks[yTicks.length - 1] };

  const points = (() => {
    if (safeData.length === 0) return [] as Array<{ x: number; y: number; datum: StepLineChartDatum; index: number }>;
    return safeData.map((d, i) => {
      let x: number;
      if (xDomain.kind === "numeric") {
        x = scaleLinear(d.x as number, xDomain.min, xDomain.max, 0, plotWidth);
      } else {
        const denom = Math.max(safeData.length - 1, 1);
        x = safeData.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
      }
      const y = scaleLinear(d.y, yDomain.min, yDomain.max, plotHeight, 0);
      return { x: MARGIN.left + x, y: MARGIN.top + y, datum: d, index: i };
    });
  })();

  const dataValueItems = safeData.map((d) => `${d.x}: ${d.y}`);
  const linePath = buildStepPath(points);

  const gridLines = yTicks.map((tick) => ({
    value: tick,
    y: MARGIN.top + scaleLinear(tick, yDomain.min, yDomain.max, plotHeight, 0),
  }));

  const xTickEntries = (() => {
    if (safeData.length === 0) return [] as Array<{ x: number; label: string }>;
    if (xDomain.kind === "ordinal") {
      return points.map((p, i) => ({ x: p.x, label: String(safeData[i].x) }));
    }
    const target = Math.min(5, safeData.length);
    const stride = Math.max(1, Math.round((safeData.length - 1) / (target - 1 || 1)));
    const entries: { x: number; label: string }[] = [];
    for (let i = 0; i < safeData.length; i += stride) {
      entries.push({ x: points[i].x, label: String(safeData[i].x) });
    }
    const lastIdx = safeData.length - 1;
    if (entries[entries.length - 1]?.label !== String(safeData[lastIdx].x)) {
      entries.push({ x: points[lastIdx].x, label: String(safeData[lastIdx].x) });
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
    <div {...rest} className={classNames("st-stepLineChart", `st-stepLineChart--${tone}`, className)}>
      <div
        className="st-stepLineChart__visual"
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
              <line className="st-stepLineChart__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={g.y} y2={g.y} />
              <text
                className="st-stepLineChart__tickLabel"
                x={MARGIN.left - 6}
                y={g.y}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {formatTick(g.value)}
              </text>
            </React.Fragment>
          ))}

          <line className="st-stepLineChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line
            className="st-stepLineChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {xTickEntries.map((tick, i) => (
            <text
              key={i}
              className="st-stepLineChart__tickLabel"
              x={tick.x}
              y={height - MARGIN.bottom + 16}
              textAnchor="middle"
            >
              {tick.label}
            </text>
          ))}

          {linePath ? (
            <path
              className="st-stepLineChart__line"
              d={linePath}
              fill="none"
              strokeWidth="2"
              strokeLinecap="butt"
              strokeLinejoin="round"
            />
          ) : null}

          {points.map((p) => (
            <circle key={p.index} className="st-stepLineChart__dot" cx={p.x} cy={p.y} r="4" data-chart-index={p.index} />
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredPoint ? (
        <div
          className="st-stepLineChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: `${(hoveredPoint.y / height) * 100}%` }}
        >
          <span className="st-stepLineChart__tooltipLabel">{hoveredPoint.datum.x}</span>
          <span className="st-stepLineChart__tooltipValue">{hoveredPoint.datum.y}</span>
        </div>
      ) : null}
    </div>
  );
}

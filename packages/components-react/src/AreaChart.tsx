import React from "react";
import { classNames } from "./classNames.js";
import {
  buildLinearPath,
  buildSmoothPath,
  CHART_MARGIN,
  ChartDataList,
  formatTick,
  isNumeric,
  niceTicks,
  scaleLinear,
} from "./chartScale.js";

export type AreaChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type AreaChartDatum = {
  x: number | string;
  y: number;
};

export type AreaChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: (number | AreaChartDatum)[];
  width?: number;
  height?: number;
  tone?: AreaChartTone;
  smooth?: boolean;
  label: string;
  className?: string;
};

const MARGIN = CHART_MARGIN;

export function AreaChart({
  data = [],
  width = 480,
  height = 240,
  tone = "category1",
  smooth = false,
  label,
  className,
  ...rest
}: AreaChartProps) {
  const reactId = React.useId();
  const gradientId = `st-areachart-gradient-${reactId.replace(/:/g, "")}`;
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  const normalizedData: AreaChartDatum[] = data.map((d, i) =>
    typeof d === "number" ? ({ x: i, y: d } as AreaChartDatum) : d,
  );

  const dataValueItems = normalizedData.map((d) => `${d.x}: ${d.y}`);

  const xDomain = (() => {
    if (normalizedData.length === 0) return { kind: "ordinal" as const, values: [] as (number | string)[] };
    const allNumeric = normalizedData.every((d) => isNumeric(d.x));
    if (allNumeric) {
      const xs = normalizedData.map((d) => d.x as number);
      return { kind: "numeric" as const, min: Math.min(...xs), max: Math.max(...xs) };
    }
    return { kind: "ordinal" as const, values: normalizedData.map((d) => d.x) };
  })();

  const yTicks = (() => {
    const ys = normalizedData.map((d) => d.y);
    if (ys.length === 0) return [0];
    const minRaw = Math.min(...ys);
    const maxRaw = Math.max(...ys);
    const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
    const minTickVal = Math.min(0, minRaw - padded);
    return niceTicks(minTickVal, maxRaw + padded, 5);
  })();

  const yDomain = yTicks.length === 0 ? { min: 0, max: 1 } : { min: yTicks[0], max: yTicks[yTicks.length - 1] };

  const points = (() => {
    if (normalizedData.length === 0) return [] as Array<{ x: number; y: number; datum: AreaChartDatum; index: number }>;
    return normalizedData.map((d, i) => {
      let x: number;
      if (xDomain.kind === "numeric") {
        x = scaleLinear(d.x as number, xDomain.min, xDomain.max, 0, plotWidth);
      } else {
        const denom = Math.max(normalizedData.length - 1, 1);
        x = normalizedData.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
      }
      const y = scaleLinear(d.y, yDomain.min, yDomain.max, plotHeight, 0);
      return { x: MARGIN.left + x, y: MARGIN.top + y, datum: d, index: i };
    });
  })();

  const linePath = points.length === 0 ? "" : smooth ? buildSmoothPath(points) : buildLinearPath(points);

  const areaPath = (() => {
    if (points.length === 0) return "";
    const base = MARGIN.top + scaleLinear(Math.max(0, yDomain.min), yDomain.min, yDomain.max, plotHeight, 0);
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L${last.x.toFixed(2)},${base.toFixed(2)} L${first.x.toFixed(2)},${base.toFixed(2)} Z`;
  })();

  const gridLines = yTicks.map((tick) => ({
    value: tick,
    y: MARGIN.top + scaleLinear(tick, yDomain.min, yDomain.max, plotHeight, 0),
  }));

  const xTickEntries = (() => {
    if (normalizedData.length === 0) return [] as Array<{ x: number; label: string }>;
    if (xDomain.kind === "ordinal") {
      return points.map((p, i) => ({ x: p.x, label: String(normalizedData[i].x) }));
    }
    const target = Math.min(5, normalizedData.length);
    const stride = Math.max(1, Math.round((normalizedData.length - 1) / (target - 1 || 1)));
    const entries: { x: number; label: string }[] = [];
    for (let i = 0; i < normalizedData.length; i += stride) {
      entries.push({ x: points[i].x, label: String(normalizedData[i].x) });
    }
    const lastIdx = normalizedData.length - 1;
    if (entries[entries.length - 1]?.label !== String(normalizedData[lastIdx].x)) {
      entries.push({ x: points[lastIdx].x, label: String(normalizedData[lastIdx].x) });
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
    <div {...rest} className={classNames("st-areaChart", `st-areaChart--${tone}`, className)}>
      <div
        className="st-areaChart__visual"
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
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {gridLines.map((g) => (
            <React.Fragment key={g.value}>
              <line className="st-areaChart__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={g.y} y2={g.y} />
              <text
                className="st-areaChart__tickLabel"
                x={MARGIN.left - 6}
                y={g.y}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {formatTick(g.value)}
              </text>
            </React.Fragment>
          ))}

          <line className="st-areaChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line
            className="st-areaChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {xTickEntries.map((tick, i) => (
            <text
              key={i}
              className="st-areaChart__tickLabel"
              x={tick.x}
              y={height - MARGIN.bottom + 16}
              textAnchor="middle"
            >
              {tick.label}
            </text>
          ))}

          {areaPath ? <path className="st-areaChart__area" d={areaPath} fill={`url(#${gradientId})`} /> : null}
          {linePath ? (
            <path
              className="st-areaChart__line"
              d={linePath}
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {points.map((p) => (
            <circle key={p.index} className="st-areaChart__dot" cx={p.x} cy={p.y} r="4" data-chart-index={p.index} />
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredPoint ? (
        <div
          className="st-areaChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: `${(hoveredPoint.y / height) * 100}%` }}
        >
          <span className="st-areaChart__tooltipLabel">{hoveredPoint.datum.x}</span>
          <span className="st-areaChart__tooltipValue">{hoveredPoint.datum.y}</span>
        </div>
      ) : null}
    </div>
  );
}

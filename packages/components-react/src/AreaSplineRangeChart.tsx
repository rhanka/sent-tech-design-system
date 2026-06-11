import React from "react";
import { classNames } from "./classNames.js";
import {
  buildSmoothPath,
  CHART_MARGIN,
  ChartDataList,
  formatTick,
  isNumeric,
  niceTicks,
  scaleLinear,
} from "./chartScale.js";

export type AreaSplineRangeChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type AreaSplineRangeChartDatum = {
  x: number | string;
  low: number;
  high: number;
};

export type AreaSplineRangeChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: AreaSplineRangeChartDatum[];
  width?: number;
  height?: number;
  tone?: AreaSplineRangeChartTone;
  label: string;
  className?: string;
};

const MARGIN = CHART_MARGIN;

// Normalise a datum: finite low/high, ordered (lo <= hi).
function normalize(d: AreaSplineRangeChartDatum): { lo: number; hi: number } | null {
  if (!Number.isFinite(d.low) || !Number.isFinite(d.high)) return null;
  return { lo: Math.min(d.low, d.high), hi: Math.max(d.low, d.high) };
}

// Continue an existing path along `pts` WITHOUT a leading `M` (the band chains
// the smoothed high line then the smoothed reversed low line into one sub-path).
function continuePath(prefix: string, pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return prefix;
  const full = buildSmoothPath(pts);
  return `${prefix} L${full.slice(1)}`;
}

export function AreaSplineRangeChart({
  data = [],
  width = 480,
  height = 240,
  tone = "category1",
  label,
  className,
  ...rest
}: AreaSplineRangeChartProps) {
  const reactId = React.useId();
  const gradientId = `st-areasplinerangechart-gradient-${reactId.replace(/:/g, "")}`;
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // Valid data: finite low + high.
  const validData = data.filter((d) => normalize(d) !== null);

  const dataValueItems = validData.map((d) => {
    const r = normalize(d)!;
    return `${d.x}: ${r.lo} – ${r.hi}`;
  });

  const xDomain = (() => {
    if (validData.length === 0) return { kind: "ordinal" as const, values: [] as (number | string)[] };
    const allNumeric = validData.every((d) => isNumeric(d.x));
    if (allNumeric) {
      const xs = validData.map((d) => d.x as number);
      return { kind: "numeric" as const, min: Math.min(...xs), max: Math.max(...xs) };
    }
    return { kind: "ordinal" as const, values: validData.map((d) => d.x) };
  })();

  const yTicks = (() => {
    if (validData.length === 0) return [0];
    const lows = validData.map((d) => normalize(d)!.lo);
    const highs = validData.map((d) => normalize(d)!.hi);
    const minRaw = Math.min(...lows);
    const maxRaw = Math.max(...highs);
    const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
    return niceTicks(minRaw - padded, maxRaw + padded, 5);
  })();

  const yDomain = yTicks.length === 0 ? { min: 0, max: 1 } : { min: yTicks[0], max: yTicks[yTicks.length - 1] };

  type RangePoint = {
    x: number;
    yLow: number;
    yHigh: number;
    datum: AreaSplineRangeChartDatum;
    range: { lo: number; hi: number };
    index: number;
  };

  const points: RangePoint[] = (() => {
    if (validData.length === 0) return [];
    return validData.map((d, i) => {
      let x: number;
      if (xDomain.kind === "numeric") {
        x = scaleLinear(d.x as number, xDomain.min, xDomain.max, 0, plotWidth);
      } else {
        const denom = Math.max(validData.length - 1, 1);
        x = validData.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
      }
      const r = normalize(d)!;
      const yLow = scaleLinear(r.lo, yDomain.min, yDomain.max, plotHeight, 0);
      const yHigh = scaleLinear(r.hi, yDomain.min, yDomain.max, plotHeight, 0);
      return {
        x: MARGIN.left + x,
        yLow: MARGIN.top + yLow,
        yHigh: MARGIN.top + yHigh,
        datum: d,
        range: r,
        index: i,
      };
    });
  })();

  const highPts = points.map((p) => ({ x: p.x, y: p.yHigh }));
  const lowPts = points.map((p) => ({ x: p.x, y: p.yLow }));

  const highPath = points.length === 0 ? "" : buildSmoothPath(highPts);
  const lowPath = points.length === 0 ? "" : buildSmoothPath(lowPts);

  // Band: smoothed high line (left→right) then smoothed low line reversed (right→left) + Z.
  const areaPath = (() => {
    if (points.length === 0) return "";
    const lowReversed = [...points].reverse().map((p) => ({ x: p.x, y: p.yLow }));
    return `${continuePath(highPath, lowReversed)} Z`;
  })();

  const gridLines = yTicks.map((tick) => ({
    value: tick,
    y: MARGIN.top + scaleLinear(tick, yDomain.min, yDomain.max, plotHeight, 0),
  }));

  const xTickEntries = (() => {
    if (validData.length === 0) return [] as Array<{ x: number; label: string }>;
    if (xDomain.kind === "ordinal") {
      return points.map((p, i) => ({ x: p.x, label: String(validData[i].x) }));
    }
    const target = Math.min(5, validData.length);
    const stride = Math.max(1, Math.round((validData.length - 1) / (target - 1 || 1)));
    const entries: { x: number; label: string }[] = [];
    for (let i = 0; i < validData.length; i += stride) {
      entries.push({ x: points[i].x, label: String(validData[i].x) });
    }
    const lastIdx = validData.length - 1;
    if (entries[entries.length - 1]?.label !== String(validData[lastIdx].x)) {
      entries.push({ x: points[lastIdx].x, label: String(validData[lastIdx].x) });
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
    <div {...rest} className={classNames("st-areaSplineRangeChart", `st-areaSplineRangeChart--${tone}`, className)}>
      <div
        className="st-areaSplineRangeChart__visual"
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
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.32" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.12" />
            </linearGradient>
          </defs>

          {gridLines.map((g) => (
            <React.Fragment key={g.value}>
              <line className="st-areaSplineRangeChart__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={g.y} y2={g.y} />
              <text
                className="st-areaSplineRangeChart__tickLabel"
                x={MARGIN.left - 6}
                y={g.y}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {formatTick(g.value)}
              </text>
            </React.Fragment>
          ))}

          <line className="st-areaSplineRangeChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line
            className="st-areaSplineRangeChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {xTickEntries.map((tick, i) => (
            <text
              key={i}
              className="st-areaSplineRangeChart__tickLabel"
              x={tick.x}
              y={height - MARGIN.bottom + 16}
              textAnchor="middle"
            >
              {tick.label}
            </text>
          ))}

          {areaPath ? <path className="st-areaSplineRangeChart__area" d={areaPath} fill={`url(#${gradientId})`} /> : null}
          {highPath ? (
            <path
              className="st-areaSplineRangeChart__line st-areaSplineRangeChart__line--high"
              d={highPath}
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          {lowPath ? (
            <path
              className="st-areaSplineRangeChart__line st-areaSplineRangeChart__line--low"
              d={lowPath}
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {points.map((p) => (
            <React.Fragment key={p.index}>
              <circle className="st-areaSplineRangeChart__dot" cx={p.x} cy={p.yHigh} r="3.5" data-chart-index={p.index} />
              <circle className="st-areaSplineRangeChart__dot" cx={p.x} cy={p.yLow} r="3.5" data-chart-index={p.index} />
            </React.Fragment>
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredPoint ? (
        <div
          className="st-areaSplineRangeChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: `${(hoveredPoint.yHigh / height) * 100}%` }}
        >
          <span className="st-areaSplineRangeChart__tooltipLabel">{hoveredPoint.datum.x}</span>
          <span className="st-areaSplineRangeChart__tooltipValue">{`${hoveredPoint.range.lo} – ${hoveredPoint.range.hi}`}</span>
        </div>
      ) : null}
    </div>
  );
}

import React from "react";
import { classNames } from "./classNames.js";
import { CHART_MARGIN, ChartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import { GraphLegend } from "./ForceGraph.js";

export type ErrorBarChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ErrorBarChartDatum = {
  category: string;
  value: number;
  low: number;
  high: number;
};

export type ErrorBarChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: ErrorBarChartDatum[];
  width?: number;
  height?: number;
  tone?: ErrorBarChartTone;
  label: string;
  className?: string;
};

// Categories sit on the vertical axis (one row each); the value axis is
// horizontal. A wider left margin holds the category labels.
const MARGIN = { ...CHART_MARGIN, left: 96, right: 20, top: 16 };
const MARKER_RADIUS = 4;
const CAP_HALF = 5; // half-height of the perpendicular cap

// Normalise a datum: finite value/low/high, ordered (lo <= value <= hi).
function normalize(d: ErrorBarChartDatum): { lo: number; mid: number; hi: number } | null {
  if (!Number.isFinite(d.value) || !Number.isFinite(d.low) || !Number.isFinite(d.high)) return null;
  const lo = Math.min(d.low, d.high);
  const hi = Math.max(d.low, d.high);
  const mid = Math.min(hi, Math.max(lo, d.value));
  return { lo, mid, hi };
}

export function ErrorBarChart({
  data = [],
  width = 480,
  height = 240,
  tone = "category1",
  label,
  className,
  ...rest
}: ErrorBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // Valid data: finite value + low + high.
  const validData = data.filter((d) => normalize(d) !== null);

  const dataValueItems = validData.map((d) => {
    const r = normalize(d)!;
    return `${d.category}: ${r.mid} (${r.lo} – ${r.hi})`;
  });

  // Shrink the category-label font when the reserved left margin is tighter
  // than the reference default, to avoid clipping (cf. lollipop fix).
  const categoryFontSize = Math.max(0.5, 0.6875 * Math.min(1, MARGIN.left / 96));

  const xTicks = (() => {
    if (validData.length === 0) return [0];
    const lows = validData.map((d) => normalize(d)!.lo);
    const highs = validData.map((d) => normalize(d)!.hi);
    const minRaw = Math.min(...lows);
    const maxRaw = Math.max(...highs);
    const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
    return niceTicks(minRaw - padded, maxRaw + padded, 5);
  })();

  const xDomain = xTicks.length === 0 ? { min: 0, max: 1 } : { min: xTicks[0], max: xTicks[xTicks.length - 1] };

  type ErrorBarRow = {
    datum: ErrorBarChartDatum;
    range: { lo: number; mid: number; hi: number };
    cy: number;
    xLow: number;
    xMid: number;
    xHigh: number;
    index: number;
  };

  const rows: ErrorBarRow[] = (() => {
    if (validData.length === 0) return [];
    const band = plotHeight / validData.length;
    return validData.map((d, i) => {
      const r = normalize(d)!;
      const cy = MARGIN.top + band * (i + 0.5);
      const xLow = MARGIN.left + scaleLinear(r.lo, xDomain.min, xDomain.max, 0, plotWidth);
      const xMid = MARGIN.left + scaleLinear(r.mid, xDomain.min, xDomain.max, 0, plotWidth);
      const xHigh = MARGIN.left + scaleLinear(r.hi, xDomain.min, xDomain.max, 0, plotWidth);
      return { datum: d, range: r, cy, xLow, xMid, xHigh, index: i };
    });
  })();

  const gridLines = xTicks.map((tick) => ({
    value: tick,
    x: MARGIN.left + scaleLinear(tick, xDomain.min, xDomain.max, 0, plotWidth),
  }));

  const legendEntries = [{ label, shape: "circle" as const, tone }];

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

  const hoveredRow = hoveredIndex !== null ? rows[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-errorBarChart", className)}>
      <div
        className="st-errorBarChart__visual"
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
              <line className="st-errorBarChart__grid" x1={g.x} x2={g.x} y1={MARGIN.top} y2={height - MARGIN.bottom} />
              <text className="st-errorBarChart__tickLabel" x={g.x} y={height - MARGIN.bottom + 16} textAnchor="middle">
                {formatTick(g.value)}
              </text>
            </React.Fragment>
          ))}

          <line className="st-errorBarChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line
            className="st-errorBarChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {rows.map((row) => (
            <React.Fragment key={row.index}>
              <text
                className="st-errorBarChart__categoryLabel"
                x={MARGIN.left - 8}
                y={row.cy}
                textAnchor="end"
                dominantBaseline="middle"
                style={{ fontSize: `${categoryFontSize}rem` }}
              >
                {row.datum.category}
              </text>
              <line
                className={`st-errorBarChart__whisker st-errorBarChart__whisker--${tone}`}
                x1={row.xLow}
                x2={row.xHigh}
                y1={row.cy}
                y2={row.cy}
              />
              <line
                className={`st-errorBarChart__cap st-errorBarChart__cap--low st-errorBarChart__cap--${tone}`}
                x1={row.xLow}
                x2={row.xLow}
                y1={row.cy - CAP_HALF}
                y2={row.cy + CAP_HALF}
              />
              <line
                className={`st-errorBarChart__cap st-errorBarChart__cap--high st-errorBarChart__cap--${tone}`}
                x1={row.xHigh}
                x2={row.xHigh}
                y1={row.cy - CAP_HALF}
                y2={row.cy + CAP_HALF}
              />
              <circle
                className={`st-errorBarChart__marker st-errorBarChart__marker--${tone}`}
                cx={row.xMid}
                cy={row.cy}
                r={MARKER_RADIUS}
                data-chart-index={row.index}
              />
            </React.Fragment>
          ))}
        </svg>
        <GraphLegend className="st-errorBarChart__legend" entries={legendEntries} />
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredRow ? (
        <div
          className="st-errorBarChart__tooltip"
          role="presentation"
          style={{
            left: `${(hoveredRow.xMid / width) * 100}%`,
            top: `${(hoveredRow.cy / height) * 100}%`,
          }}
        >
          <span className="st-errorBarChart__tooltipLabel">{hoveredRow.datum.category}</span>
          <span className="st-errorBarChart__tooltipValue">{`${hoveredRow.range.mid} (${hoveredRow.range.lo} – ${hoveredRow.range.hi})`}</span>
        </div>
      ) : null}
    </div>
  );
}

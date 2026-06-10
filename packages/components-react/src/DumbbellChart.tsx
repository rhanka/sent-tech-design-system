import React from "react";
import { classNames } from "./classNames.js";
import { CHART_MARGIN, ChartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import { GraphLegend } from "./ForceGraph.js";

export type DumbbellChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type DumbbellChartDatum = {
  category: string;
  low: number;
  high: number;
};

export type DumbbellChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: DumbbellChartDatum[];
  width?: number;
  height?: number;
  lowTone?: DumbbellChartTone;
  highTone?: DumbbellChartTone;
  lowLabel?: string;
  highLabel?: string;
  label: string;
  className?: string;
};

// Categories sit on the vertical axis (one row each); the value axis is
// horizontal. A wider left margin holds the category labels.
const MARGIN = { ...CHART_MARGIN, left: 96, right: 20, top: 16 };
const DOT_RADIUS = 5;

// Normalise a datum: finite low/high, ordered (lo <= hi).
function normalize(d: DumbbellChartDatum): { lo: number; hi: number } | null {
  if (!Number.isFinite(d.low) || !Number.isFinite(d.high)) return null;
  return { lo: Math.min(d.low, d.high), hi: Math.max(d.low, d.high) };
}

export function DumbbellChart({
  data = [],
  width = 480,
  height = 240,
  lowTone = "category1",
  highTone = "category2",
  lowLabel = "Bas",
  highLabel = "Haut",
  label,
  className,
  ...rest
}: DumbbellChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // Valid data: finite low + high.
  const validData = data.filter((d) => normalize(d) !== null);

  const dataValueItems = validData.map((d) => {
    const r = normalize(d)!;
    return `${d.category}: ${r.lo} – ${r.hi}`;
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

  type DumbbellRow = {
    datum: DumbbellChartDatum;
    range: { lo: number; hi: number };
    cy: number;
    xLow: number;
    xHigh: number;
    index: number;
  };

  const rows: DumbbellRow[] = (() => {
    if (validData.length === 0) return [];
    const band = plotHeight / validData.length;
    return validData.map((d, i) => {
      const r = normalize(d)!;
      const cy = MARGIN.top + band * (i + 0.5);
      const xLow = MARGIN.left + scaleLinear(r.lo, xDomain.min, xDomain.max, 0, plotWidth);
      const xHigh = MARGIN.left + scaleLinear(r.hi, xDomain.min, xDomain.max, 0, plotWidth);
      return { datum: d, range: r, cy, xLow, xHigh, index: i };
    });
  })();

  const gridLines = xTicks.map((tick) => ({
    value: tick,
    x: MARGIN.left + scaleLinear(tick, xDomain.min, xDomain.max, 0, plotWidth),
  }));

  const legendEntries = [
    { label: lowLabel, shape: "circle" as const, tone: lowTone },
    { label: highLabel, shape: "circle" as const, tone: highTone },
  ];

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
    <div {...rest} className={classNames("st-dumbbellChart", className)}>
      <div
        className="st-dumbbellChart__visual"
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
              <line className="st-dumbbellChart__grid" x1={g.x} x2={g.x} y1={MARGIN.top} y2={height - MARGIN.bottom} />
              <text className="st-dumbbellChart__tickLabel" x={g.x} y={height - MARGIN.bottom + 16} textAnchor="middle">
                {formatTick(g.value)}
              </text>
            </React.Fragment>
          ))}

          <line className="st-dumbbellChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line
            className="st-dumbbellChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {rows.map((row) => (
            <React.Fragment key={row.index}>
              <text
                className="st-dumbbellChart__categoryLabel"
                x={MARGIN.left - 8}
                y={row.cy}
                textAnchor="end"
                dominantBaseline="middle"
                style={{ fontSize: `${categoryFontSize}rem` }}
              >
                {row.datum.category}
              </text>
              <line className="st-dumbbellChart__connector" x1={row.xLow} x2={row.xHigh} y1={row.cy} y2={row.cy} />
              <circle
                className={`st-dumbbellChart__dot st-dumbbellChart__dot--low st-dumbbellChart__dot--${lowTone}`}
                cx={row.xLow}
                cy={row.cy}
                r={DOT_RADIUS}
                data-chart-index={row.index}
              />
              <circle
                className={`st-dumbbellChart__dot st-dumbbellChart__dot--high st-dumbbellChart__dot--${highTone}`}
                cx={row.xHigh}
                cy={row.cy}
                r={DOT_RADIUS}
                data-chart-index={row.index}
              />
            </React.Fragment>
          ))}
        </svg>
        <GraphLegend className="st-dumbbellChart__legend" entries={legendEntries} />
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredRow ? (
        <div
          className="st-dumbbellChart__tooltip"
          role="presentation"
          style={{
            left: `${(((hoveredRow.xLow + hoveredRow.xHigh) / 2) / width) * 100}%`,
            top: `${(hoveredRow.cy / height) * 100}%`,
          }}
        >
          <span className="st-dumbbellChart__tooltipLabel">{hoveredRow.datum.category}</span>
          <span className="st-dumbbellChart__tooltipValue">{`${hoveredRow.range.lo} – ${hoveredRow.range.hi}`}</span>
        </div>
      ) : null}
    </div>
  );
}

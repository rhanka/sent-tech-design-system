import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList, formatTick, niceTicks } from "./chartScale.js";

export type ColumnRangeChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ColumnRangeChartDatum = {
  category: string;
  low: number;
  high: number;
  tone?: ColumnRangeChartTone;
};

export type ColumnRangeChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: ColumnRangeChartDatum[];
  width?: number;
  height?: number;
  orientation?: "vertical" | "horizontal";
  label: string;
  /**
   * Fixed value-axis domain `[min, max]`. When provided (and finite), the value
   * scale uses it instead of the data-derived min/max — letting several
   * ColumnRangeCharts in a grid share one scale. When absent or invalid, the
   * scale falls back to the auto data range (unchanged).
   */
  domain?: [number, number];
  className?: string;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 44 };

// Normalise a datum: finite low/high, ordered (lo <= hi).
function normalize(d: ColumnRangeChartDatum): { lo: number; hi: number } | null {
  if (!Number.isFinite(d.low) || !Number.isFinite(d.high)) return null;
  return { lo: Math.min(d.low, d.high), hi: Math.max(d.low, d.high) };
}

export function ColumnRangeChart({
  data = [],
  width = 480,
  height = 240,
  orientation = "vertical",
  label,
  domain,
  className,
  ...rest
}: ColumnRangeChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // Valid data: finite low + high.
  const validData = data.filter((d) => normalize(d) !== null);

  // A domain is honoured only when finite and ordered (min < max).
  const validDomain: [number, number] | null = (() => {
    if (!domain) return null;
    const [d0, d1] = domain;
    if (!Number.isFinite(d0) || !Number.isFinite(d1) || d0 >= d1) return null;
    return [d0, d1];
  })();

  const lows = validData.map((d) => Math.min(d.low, d.high));
  const highs = validData.map((d) => Math.max(d.low, d.high));
  const minRaw = validDomain ? validDomain[0] : Math.min(...lows, ...highs);
  const maxRaw = validDomain ? validDomain[1] : Math.max(...lows, ...highs);
  const ticks = niceTicks(minRaw, maxRaw, 5);
  const domainMin = ticks[0];
  const domainMax = ticks[ticks.length - 1];
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // Fraction [0,1] of a value along the value axis (0 = domainMin, 1 = domainMax).
  const valueFraction = (v: number) => {
    if (domainMax === domainMin) return 0;
    const f = (v - domainMin) / (domainMax - domainMin);
    return Math.min(1, Math.max(0, f));
  };

  type Bar = {
    x: number;
    y: number;
    width: number;
    height: number;
    cx: number;
    cy: number;
    datum: ColumnRangeChartDatum;
    range: { lo: number; hi: number };
    tone: ColumnRangeChartTone;
  };

  const bars: Bar[] = (() => {
    if (validData.length === 0) return [];
    if (orientation === "vertical") {
      const band = plotWidth / validData.length;
      const barWidth = band * 0.62;
      const yOf = (v: number) => plotHeight * (1 - valueFraction(v));
      return validData.map((d, i) => {
        const range = normalize(d)!;
        const yLow = yOf(range.lo);
        const yHigh = yOf(range.hi);
        const y = Math.min(yLow, yHigh);
        const h = Math.abs(yLow - yHigh);
        const x = MARGIN.left + band * i + (band - barWidth) / 2;
        return {
          x,
          y: MARGIN.top + y,
          width: barWidth,
          height: Math.max(h, 0.5),
          cx: MARGIN.left + band * (i + 0.5),
          cy: MARGIN.top + (yLow + yHigh) / 2,
          datum: d,
          range,
          tone: (d.tone ?? "category1") as ColumnRangeChartTone,
        };
      });
    }
    const band = plotHeight / validData.length;
    const barHeight = band * 0.62;
    const xOf = (v: number) => plotWidth * valueFraction(v);
    return validData.map((d, i) => {
      const range = normalize(d)!;
      const xLow = xOf(range.lo);
      const xHigh = xOf(range.hi);
      const x = Math.min(xLow, xHigh);
      const w = Math.abs(xHigh - xLow);
      const y = MARGIN.top + band * i + (band - barHeight) / 2;
      return {
        x: MARGIN.left + x,
        y,
        width: Math.max(w, 0.5),
        height: barHeight,
        cx: MARGIN.left + (xLow + xHigh) / 2,
        cy: MARGIN.top + band * (i + 0.5),
        datum: d,
        range,
        tone: (d.tone ?? "category1") as ColumnRangeChartTone,
      };
    });
  })();

  const dataValueItems = bars.map((bar) => `${bar.datum.category}: ${bar.range.lo} – ${bar.range.hi}`);

  const valueAxisTicks = ticks.map((tick) => {
    if (orientation === "vertical") {
      return {
        value: tick,
        x1: MARGIN.left,
        x2: MARGIN.left + plotWidth,
        y: MARGIN.top + plotHeight * (1 - valueFraction(tick)),
        x: undefined as number | undefined,
        y1: undefined as number | undefined,
        y2: undefined as number | undefined,
      };
    }
    return {
      value: tick,
      x: MARGIN.left + plotWidth * valueFraction(tick),
      y1: MARGIN.top,
      y2: MARGIN.top + plotHeight,
      x1: undefined as number | undefined,
      x2: undefined as number | undefined,
      y: undefined as number | undefined,
    };
  });

  function handlePointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredIndex(null);
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(index) ? index : null);
  }

  const hovered = hoveredIndex !== null ? bars[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-columnRangeChart", className)}>
      <div
        className="st-columnRangeChart__visual"
        role="img"
        aria-label={label}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoveredIndex(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          {/* gridlines + value axis ticks */}
          {valueAxisTicks.map((tick) =>
            orientation === "vertical" ? (
              <React.Fragment key={tick.value}>
                <line className="st-columnRangeChart__grid" x1={tick.x1} x2={tick.x2} y1={tick.y} y2={tick.y} />
                <text
                  className="st-columnRangeChart__tickLabel"
                  x={MARGIN.left - 6}
                  y={tick.y}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {formatTick(tick.value)}
                </text>
              </React.Fragment>
            ) : (
              <React.Fragment key={tick.value}>
                <line className="st-columnRangeChart__grid" x1={tick.x} x2={tick.x} y1={tick.y1} y2={tick.y2} />
                <text
                  className="st-columnRangeChart__tickLabel"
                  x={tick.x}
                  y={height - MARGIN.bottom + 16}
                  textAnchor="middle"
                >
                  {formatTick(tick.value)}
                </text>
              </React.Fragment>
            )
          )}

          {/* axes */}
          <line
            className="st-columnRangeChart__axis"
            x1={MARGIN.left}
            x2={MARGIN.left}
            y1={MARGIN.top}
            y2={height - MARGIN.bottom}
          />
          <line
            className="st-columnRangeChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {/* category labels */}
          {bars.map((bar) =>
            orientation === "vertical" ? (
              <text
                key={`cat-${bar.datum.category}`}
                className="st-columnRangeChart__categoryLabel"
                x={bar.x + bar.width / 2}
                y={height - MARGIN.bottom + 16}
                textAnchor="middle"
              >
                {bar.datum.category}
              </text>
            ) : (
              <text
                key={`cat-${bar.datum.category}`}
                className="st-columnRangeChart__categoryLabel"
                x={MARGIN.left - 6}
                y={bar.y + bar.height / 2}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {bar.datum.category}
              </text>
            )
          )}

          {/* range bars (decorative, inside aria-hidden SVG) */}
          {bars.map((bar, i) => (
            <rect
              key={`bar-${bar.datum.category}`}
              className={`st-columnRangeChart__bar st-columnRangeChart__bar--${bar.tone}`}
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              rx="2"
              data-chart-index={i}
            />
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hovered ? (
        <div
          className="st-columnRangeChart__tooltip"
          role="presentation"
          style={{
            left: `${(hovered.cx / width) * 100}%`,
            top: `${(hovered.cy / height) * 100}%`,
          }}
        >
          <span className="st-columnRangeChart__tooltipLabel">{hovered.datum.category}</span>
          <span className="st-columnRangeChart__tooltipValue">{`${hovered.range.lo} – ${hovered.range.hi}`}</span>
        </div>
      ) : null}
    </div>
  );
}

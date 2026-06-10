import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type OHLCChartDatum = {
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type OHLCChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: OHLCChartDatum[];
  label: string;
  width?: number;
  height?: number;
  className?: string;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 52 };

function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d1 === d0) return r0;
  return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
}

function niceTicks(min: number, max: number, target = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    const base = Number.isFinite(max) ? max : 0;
    return [base];
  }
  const range = max - min;
  const rough = range / Math.max(target - 1, 1);
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / pow;
  let step: number;
  if (norm < 1.5) step = 1 * pow;
  else if (norm < 3) step = 2 * pow;
  else if (norm < 7) step = 5 * pow;
  else step = 10 * pow;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) {
    ticks.push(Number(v.toFixed(10)));
  }
  return ticks;
}

function formatTick(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

export function OHLCChart({
  data = [],
  label,
  width = 480,
  height = 240,
  className,
  ...rest
}: OHLCChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // Filter invalid bars BEFORE domain
  const validData = data.filter(
    (d) =>
      Number.isFinite(d.open) &&
      Number.isFinite(d.high) &&
      Number.isFinite(d.low) &&
      Number.isFinite(d.close)
  );

  const allVals: number[] = [];
  for (const d of validData) {
    // Domain includes open/high/low/close (not just high/low)
    allVals.push(d.open, d.high, d.low, d.close);
  }
  const rawMin = allVals.length === 0 ? 0 : Math.min(...allVals);
  const rawMax = allVals.length === 0 ? 1 : Math.max(...allVals);
  // Flat domain → fallback range 1 to avoid division by zero
  const safeRawMax = rawMax === rawMin ? rawMin + 1 : rawMax;

  const ticks = niceTicks(rawMin, safeRawMax, 5);
  const domainMin = ticks[0] ?? rawMin;
  const domainMax = ticks[ticks.length - 1] ?? safeRawMax;

  const bars = React.useMemo(() => {
    if (validData.length === 0) return [];
    const band = plotWidth / validData.length;
    // length of the open/close tick (each side of the bar)
    const tickW = Math.min(band * 0.3, 12);

    return validData.map((d, i) => {
      // clamp high/low to guarantee high≥max(O,C) and low≤min(O,C)
      const clampedHigh = Math.max(d.high, d.open, d.close);
      const clampedLow = Math.min(d.low, d.open, d.close);

      const bullish = d.close >= d.open;
      const centerX = MARGIN.left + band * i + band / 2;

      const highY = MARGIN.top + scaleLinear(clampedHigh, domainMin, domainMax, plotHeight, 0);
      const lowY = MARGIN.top + scaleLinear(clampedLow, domainMin, domainMax, plotHeight, 0);
      const openY = MARGIN.top + scaleLinear(d.open, domainMin, domainMax, plotHeight, 0);
      const closeY = MARGIN.top + scaleLinear(d.close, domainMin, domainMax, plotHeight, 0);

      return {
        datum: d,
        index: i,
        bullish,
        centerX,
        barHighY: highY,
        barLowY: lowY,
        openY,
        closeY,
        openX: centerX - tickW,
        closeX: centerX + tickW,
        tooltipY: Math.min(highY, openY, closeY),
      };
    });
  }, [validData, plotWidth, domainMin, domainMax, plotHeight]);

  const dataValueItems = validData.map(
    (d) => `${d.label}: O ${d.open} H ${d.high} L ${d.low} C ${d.close}`
  );

  function handlePointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) { setHoveredIndex(null); return; }
    const idx = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(idx) ? idx : null);
  }

  const hoveredBar = hoveredIndex !== null ? bars[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-ohlcChart", className)}>
      <div
        className="st-ohlcChart__visual"
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
          {/* gridlines + tick labels */}
          {ticks.map((tick) => {
            const ty = MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0);
            return (
              <React.Fragment key={tick}>
                <line
                  className="st-ohlcChart__grid"
                  x1={MARGIN.left}
                  x2={width - MARGIN.right}
                  y1={ty}
                  y2={ty}
                />
                <text
                  className="st-ohlcChart__tickLabel"
                  x={MARGIN.left - 6}
                  y={ty}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {formatTick(tick)}
                </text>
              </React.Fragment>
            );
          })}

          {/* axes */}
          <line
            className="st-ohlcChart__axis"
            x1={MARGIN.left}
            x2={MARGIN.left}
            y1={MARGIN.top}
            y2={height - MARGIN.bottom}
          />
          <line
            className="st-ohlcChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {/* composite key to avoid duplicates */}
          {bars.map((b, i) => (
            <React.Fragment key={`${i}-${b.datum.label}`}>
              <g
                className={classNames(
                  "st-ohlcChart__bar",
                  `st-ohlcChart__bar--${b.bullish ? "up" : "down"}`,
                  hoveredIndex !== null && hoveredIndex !== i
                    ? "st-ohlcChart__bar--dim"
                    : undefined
                )}
              >
                {/* vertical low → high range */}
                <line
                  className="st-ohlcChart__range"
                  x1={b.centerX}
                  x2={b.centerX}
                  y1={b.barHighY}
                  y2={b.barLowY}
                  data-chart-index={i}
                />
                {/* open tick (left) */}
                <line
                  className="st-ohlcChart__open"
                  x1={b.openX}
                  x2={b.centerX}
                  y1={b.openY}
                  y2={b.openY}
                  data-chart-index={i}
                />
                {/* close tick (right) */}
                <line
                  className="st-ohlcChart__close"
                  x1={b.centerX}
                  x2={b.closeX}
                  y1={b.closeY}
                  y2={b.closeY}
                  data-chart-index={i}
                />
              </g>
              {/* category label */}
              <text
                className="st-ohlcChart__categoryLabel"
                x={b.centerX}
                y={height - MARGIN.bottom + 16}
                textAnchor="middle"
              >
                {b.datum.label}
              </text>
            </React.Fragment>
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredBar ? (
        <div
          className="st-ohlcChart__tooltip"
          role="presentation"
          style={{
            left: `${(hoveredBar.centerX / width) * 100}%`,
            top: `${(hoveredBar.tooltipY / height) * 100}%`,
          }}
        >
          <span className="st-ohlcChart__tooltipLabel">{hoveredBar.datum.label}</span>
          <span className="st-ohlcChart__tooltipValue">
            O {hoveredBar.datum.open} H {hoveredBar.datum.high} L {hoveredBar.datum.low}{" "}
            C {hoveredBar.datum.close}
          </span>
        </div>
      ) : null}
    </div>
  );
}

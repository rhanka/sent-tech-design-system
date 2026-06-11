import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type HeikinAshiChartDatum = {
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type HeikinAshiChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: HeikinAshiChartDatum[];
  label: string;
  width?: number;
  height?: number;
  className?: string;
};

type HACandle = {
  label: string;
  haOpen: number;
  haHigh: number;
  haLow: number;
  haClose: number;
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

function fmt(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
}

// Heikin-Ashi : récurrence sur haOpen
function computeHeikinAshi(rows: HeikinAshiChartDatum[]): HACandle[] {
  const out: HACandle[] = [];
  for (let i = 0; i < rows.length; i++) {
    const d = rows[i];
    const haClose = (d.open + d.high + d.low + d.close) / 4;
    const haOpen =
      i === 0 ? (d.open + d.close) / 2 : (out[i - 1].haOpen + out[i - 1].haClose) / 2;
    const haHigh = Math.max(d.high, haOpen, haClose);
    const haLow = Math.min(d.low, haOpen, haClose);
    out.push({ label: d.label, haOpen, haHigh, haLow, haClose });
  }
  return out;
}

export function HeikinAshiChart({
  data = [],
  label,
  width = 480,
  height = 240,
  className,
  ...rest
}: HeikinAshiChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // filter invalid candles BEFORE HA computation and domain
  const validData = data.filter(
    (d) =>
      Number.isFinite(d.open) &&
      Number.isFinite(d.high) &&
      Number.isFinite(d.low) &&
      Number.isFinite(d.close)
  );

  const haData = React.useMemo(() => computeHeikinAshi(validData), [validData]);

  const allVals: number[] = [];
  for (const d of haData) {
    // Domain over HA values (haOpen/haHigh/haLow/haClose)
    allVals.push(d.haOpen, d.haHigh, d.haLow, d.haClose);
  }
  const rawMin = allVals.length === 0 ? 0 : Math.min(...allVals);
  const rawMax = allVals.length === 0 ? 1 : Math.max(...allVals);
  // Flat domain → fallback range 1 to avoid division by zero
  const safeRawMax = rawMax === rawMin ? rawMin + 1 : rawMax;

  const ticks = niceTicks(rawMin, safeRawMax, 5);
  const domainMin = ticks[0] ?? rawMin;
  const domainMax = ticks[ticks.length - 1] ?? safeRawMax;

  const candles = React.useMemo(() => {
    if (haData.length === 0) return [];
    const band = plotWidth / haData.length;
    const bodyW = band * 0.55;

    return haData.map((d, i) => {
      const bullish = d.haClose >= d.haOpen;
      const centerX = MARGIN.left + band * i + band / 2;

      const bodyTop =
        MARGIN.top + scaleLinear(Math.max(d.haOpen, d.haClose), domainMin, domainMax, plotHeight, 0);
      const bodyBot =
        MARGIN.top + scaleLinear(Math.min(d.haOpen, d.haClose), domainMin, domainMax, plotHeight, 0);
      const highY = MARGIN.top + scaleLinear(d.haHigh, domainMin, domainMax, plotHeight, 0);
      const lowY = MARGIN.top + scaleLinear(d.haLow, domainMin, domainMax, plotHeight, 0);

      return {
        datum: d,
        index: i,
        bullish,
        centerX,
        bodyX: centerX - bodyW / 2,
        bodyY: bodyTop,
        bodyW,
        bodyH: Math.max(bodyBot - bodyTop, 0.5),
        wickHighY: highY,
        wickLowY: lowY,
        tooltipY: bodyTop,
      };
    });
  }, [haData, plotWidth, domainMin, domainMax, plotHeight]);

  const dataValueItems = haData.map(
    (d) => `${d.label}: O ${fmt(d.haOpen)} H ${fmt(d.haHigh)} L ${fmt(d.haLow)} C ${fmt(d.haClose)}`
  );

  function handlePointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) { setHoveredIndex(null); return; }
    const idx = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(idx) ? idx : null);
  }

  const hoveredCandle = hoveredIndex !== null ? candles[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-heikinAshiChart", className)}>
      <div
        className="st-heikinAshiChart__visual"
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
                  className="st-heikinAshiChart__grid"
                  x1={MARGIN.left}
                  x2={width - MARGIN.right}
                  y1={ty}
                  y2={ty}
                />
                <text
                  className="st-heikinAshiChart__tickLabel"
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
            className="st-heikinAshiChart__axis"
            x1={MARGIN.left}
            x2={MARGIN.left}
            y1={MARGIN.top}
            y2={height - MARGIN.bottom}
          />
          <line
            className="st-heikinAshiChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {candles.map((c, i) => (
            <React.Fragment key={`${i}-${c.datum.label}`}>
              {/* wick */}
              <line
                className={`st-heikinAshiChart__wick st-heikinAshiChart__wick--${c.bullish ? "up" : "down"}`}
                x1={c.centerX}
                x2={c.centerX}
                y1={c.wickHighY}
                y2={c.wickLowY}
                data-chart-index={i}
              />
              {/* body */}
              <rect
                className={classNames(
                  "st-heikinAshiChart__body",
                  `st-heikinAshiChart__body--${c.bullish ? "up" : "down"}`,
                  hoveredIndex !== null && hoveredIndex !== i
                    ? "st-heikinAshiChart__body--dim"
                    : undefined
                )}
                x={c.bodyX}
                y={c.bodyY}
                width={c.bodyW}
                height={c.bodyH}
                rx={1}
                data-chart-index={i}
              />
              {/* category label */}
              <text
                className="st-heikinAshiChart__categoryLabel"
                x={c.centerX}
                y={height - MARGIN.bottom + 16}
                textAnchor="middle"
              >
                {c.datum.label}
              </text>
            </React.Fragment>
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredCandle ? (
        <div
          className="st-heikinAshiChart__tooltip"
          role="presentation"
          style={{
            left: `${(hoveredCandle.centerX / width) * 100}%`,
            top: `${(hoveredCandle.tooltipY / height) * 100}%`,
          }}
        >
          <span className="st-heikinAshiChart__tooltipLabel">{hoveredCandle.datum.label}</span>
          <span className="st-heikinAshiChart__tooltipValue">
            O {fmt(hoveredCandle.datum.haOpen)} H {fmt(hoveredCandle.datum.haHigh)} L{" "}
            {fmt(hoveredCandle.datum.haLow)} C {fmt(hoveredCandle.datum.haClose)}
          </span>
        </div>
      ) : null}
    </div>
  );
}

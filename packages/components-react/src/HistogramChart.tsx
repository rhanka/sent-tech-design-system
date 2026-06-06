import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type HistogramChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type HistogramChartDatum = {
  label: string;
  value: number;
  tone?: HistogramChartTone;
};

export type HistogramChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: HistogramChartDatum[] | number[];
  bins?: number;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

const MARGIN = { top: 14, right: 16, bottom: 36, left: 44 } as const;
const TONES: HistogramChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

type HistogramBin = {
  label: string;
  value: number;
  tone: HistogramChartTone;
};

function isNumberArray(values: HistogramChartDatum[] | number[]): values is number[] {
  return values.every((value) => typeof value === "number");
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function buildNumericBins(values: number[], count: number): HistogramBin[] {
  const finite = values.filter(Number.isFinite);
  if (finite.length === 0) return [];
  const binCount = Math.max(1, Math.floor(count));
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const step = max === min ? 1 : (max - min) / binCount;
  const out = Array.from({ length: binCount }, (_, index) => {
    const start = min + step * index;
    const end = index === binCount - 1 ? max : min + step * (index + 1);
    return {
      label: `${formatNumber(start)}-${formatNumber(end)}`,
      value: 0,
      tone: TONES[index % TONES.length],
    };
  });

  for (const value of finite) {
    const index = value === max ? binCount - 1 : Math.max(0, Math.min(binCount - 1, Math.floor((value - min) / step)));
    out[index].value += 1;
  }

  return out;
}

function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d1 === d0) return r0;
  return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
}

export function HistogramChart({
  data,
  bins,
  width = 480,
  height = 240,
  label,
  className,
  ...rest
}: HistogramChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // bins = 10 fixe par défaut (pas ceil(√n)) pour parité Svelte/React/Vue
  const normalizedBins: HistogramBin[] = isNumberArray(data)
    ? buildNumericBins(data, bins ?? 10)
    : data.map((datum, index) => ({
        label: datum.label,
        value: Number.isFinite(datum.value) ? datum.value : 0,
        tone: datum.tone ?? TONES[index % TONES.length],
      }));

  const maxValue = Math.max(0, ...normalizedBins.map((bin) => bin.value));
  const safeMax = maxValue > 0 ? maxValue : 1;
  const band = normalizedBins.length > 0 ? plotWidth / normalizedBins.length : plotWidth;
  const barWidth = Math.max(band * 0.68, 1);

  const bars = normalizedBins.map((bin, index) => {
    const h = scaleLinear(bin.value, 0, safeMax, 0, plotHeight);
    return {
      bin,
      x: MARGIN.left + band * index + (band - barWidth) / 2,
      y: MARGIN.top + plotHeight - h,
      width: barWidth,
      height: Math.max(h, 0.5),
      labelX: MARGIN.left + band * (index + 0.5),
    };
  });

  const dataValueItems = normalizedBins.map((bin) => `${bin.label}: ${bin.value}`);

  function handleVisualPointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredIndex(null);
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(index) ? index : null);
  }

  const hoveredBar = hoveredIndex !== null ? bars[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-histogramChart", className)}>
      <div
        className="st-histogramChart__visual"
        role="img"
        aria-label={label}
        onPointerMove={handleVisualPointerMove}
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
          <line className="st-histogramChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line className="st-histogramChart__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

          {bars.map((bar, i) => (
            <React.Fragment key={`${bar.bin.label}-${i}`}>
              <rect
                className={classNames(
                  "st-histogramChart__bar",
                  `st-histogramChart__bar--${bar.bin.tone}`,
                  hoveredIndex !== null && hoveredIndex !== i ? "st-histogramChart__bar--dim" : undefined,
                )}
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                data-chart-index={i}
              />
              <text className="st-histogramChart__label" x={bar.labelX} y={height - MARGIN.bottom + 16} textAnchor="middle">
                {bar.bin.label}
              </text>
            </React.Fragment>
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredBar ? (
        <div
          className="st-histogramChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredBar.labelX / width) * 100}%`, top: `${(hoveredBar.y / height) * 100}%` }}
        >
          <span className="st-histogramChart__tooltipLabel">{hoveredBar.bin.label}</span>
          <span className="st-histogramChart__tooltipValue">{hoveredBar.bin.value}</span>
        </div>
      ) : null}
    </div>
  );
}

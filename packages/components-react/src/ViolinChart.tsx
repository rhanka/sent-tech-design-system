import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type ViolinChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ViolinChartDatum = {
  label: string;
  values: number[];
  tone?: ViolinChartTone;
};

export type ViolinChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: ViolinChartDatum[];
  bins?: number;
  quartiles?: boolean;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

const MARGIN = { top: 16, right: 20, bottom: 38, left: 48 } as const;
const TONES: ViolinChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d1 === d0) return r0;
  return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sorted[base + 1];
  return next !== undefined ? sorted[base] + rest * (next - sorted[base]) : sorted[base];
}

export function ViolinChart({
  data,
  bins = 20,
  quartiles = true,
  width = 480,
  height = 280,
  label,
  className,
  ...rest
}: ViolinChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
  const binCount = Math.max(1, Math.floor(bins));

  const cleaned = data
    .map((datum, index) => ({ datum, index, finite: datum.values.filter(Number.isFinite) }))
    .filter((entry) => entry.finite.length > 0);

  const all = cleaned.flatMap((entry) => entry.finite);
  let domainMin = 0;
  let domainMax = 1;
  if (all.length > 0) {
    const min = Math.min(...all);
    const max = Math.max(...all);
    if (min === max) {
      const pad = Math.max(Math.abs(max), 1) * 0.1;
      domainMin = min - pad;
      domainMax = max + pad;
    } else {
      const pad = (max - min) * 0.06;
      domainMin = min - pad;
      domainMax = max + pad;
    }
  }

  const band = cleaned.length > 0 ? plotWidth / cleaned.length : plotWidth;
  const halfWidth = Math.min(54, Math.max(14, band * 0.36));
  const step = (domainMax - domainMin) / binCount;
  const yOf = (value: number) => MARGIN.top + scaleLinear(value, domainMin, domainMax, plotHeight, 0);

  const violins = cleaned.map((entry, position) => {
    const cx = MARGIN.left + band * (position + 0.5);
    const tone = entry.datum.tone ?? TONES[entry.index % TONES.length];

    const counts = new Array<number>(binCount).fill(0);
    for (const value of entry.finite) {
      const raw = step > 0 ? Math.floor((value - domainMin) / step) : 0;
      const bin = Math.max(0, Math.min(binCount - 1, raw));
      counts[bin] += 1;
    }
    const maxCount = Math.max(1, ...counts);

    const profile = counts.map((count, bin) => {
      const center = domainMin + step * (bin + 0.5);
      return { y: yOf(center), w: (count / maxCount) * halfWidth };
    });

    const right = profile.map((p) => `${cx + p.w},${p.y}`);
    const left = [...profile].reverse().map((p) => `${cx - p.w},${p.y}`);
    const path = `M ${right.join(" L ")} L ${left.join(" L ")} Z`;

    const sorted = [...entry.finite].sort((a, b) => a - b);
    const median = quantile(sorted, 0.5);
    const q1 = quantile(sorted, 0.25);
    const q3 = quantile(sorted, 0.75);

    return {
      datum: entry.datum,
      tone,
      cx,
      path,
      n: entry.finite.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median,
      medianY: yOf(median),
      q1Y: yOf(q1),
      q3Y: yOf(q3),
      boxWidth: Math.max(halfWidth * 0.4, 4),
    };
  });

  const dataValueItems = violins.map(
    (v) =>
      `${v.datum.label}: ${v.n} points, min ${formatNumber(v.min)}, median ${formatNumber(v.median)}, max ${formatNumber(v.max)}`,
  );

  function handleVisualPointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredIndex(null);
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(index) ? index : null);
  }

  const hovered = hoveredIndex !== null ? violins[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-violinChart", className)}>
      <div
        className="st-violinChart__visual"
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
          <line className="st-violinChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line className="st-violinChart__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

          {violins.map((violin, i) => (
            <React.Fragment key={`${violin.datum.label}-${i}`}>
              <path
                className={classNames(
                  "st-violinChart__shape",
                  `st-violinChart__shape--${violin.tone}`,
                  hoveredIndex !== null && hoveredIndex !== i ? "st-violinChart__shape--dim" : undefined,
                )}
                d={violin.path}
                data-chart-index={i}
              />
              {quartiles ? (
                <>
                  <rect
                    className="st-violinChart__box"
                    x={violin.cx - violin.boxWidth / 2}
                    y={Math.min(violin.q1Y, violin.q3Y)}
                    width={violin.boxWidth}
                    height={Math.max(Math.abs(violin.q1Y - violin.q3Y), 1)}
                    data-chart-index={i}
                  />
                  <line
                    className="st-violinChart__median"
                    x1={violin.cx - violin.boxWidth / 2}
                    x2={violin.cx + violin.boxWidth / 2}
                    y1={violin.medianY}
                    y2={violin.medianY}
                    data-chart-index={i}
                  />
                </>
              ) : null}
              <text className="st-violinChart__label" x={violin.cx} y={height - MARGIN.bottom + 16} textAnchor="middle">
                {violin.datum.label}
              </text>
            </React.Fragment>
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hovered ? (
        <div
          className="st-violinChart__tooltip"
          role="presentation"
          style={{ left: `${(hovered.cx / width) * 100}%`, top: `${(hovered.medianY / height) * 100}%` }}
        >
          <span className="st-violinChart__tooltipLabel">{hovered.datum.label}</span>
          <span className="st-violinChart__tooltipValue">Median {formatNumber(hovered.median)}</span>
        </div>
      ) : null}
    </div>
  );
}

import React from "react";
import { classNames } from "./classNames.js";
import { buildLinearPath, buildSmoothPath, ChartDataList, scaleLinear } from "./chartScale.js";

export type StreamgraphChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type StreamgraphChartSeriesValue = {
  label: string;
  value: number;
  tone?: StreamgraphChartTone;
};

export type StreamgraphChartDatum = {
  category: string;
  values: StreamgraphChartSeriesValue[];
};

export type StreamgraphChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: StreamgraphChartDatum[];
  width?: number;
  height?: number;
  label: string;
  smooth?: boolean;
  showLegend?: boolean;
  className?: string;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 16 } as const;

const TONES: StreamgraphChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

// Valeur non-finie ou négative → 0 (le streamgraph empile des grandeurs ≥ 0).
const safeValue = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0);

export function StreamgraphChart({
  data = [],
  width = 480,
  height = 240,
  label,
  smooth = true,
  showLegend = true,
  className,
  ...rest
}: StreamgraphChartProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // Ordre stable des séries (1re apparition) + ton associé.
  const series = (() => {
    const seen = new Map<string, StreamgraphChartTone>();
    data.forEach((d) =>
      d.values.forEach((sv) => {
        if (!seen.has(sv.label)) seen.set(sv.label, sv.tone ?? TONES[seen.size % TONES.length]);
      }),
    );
    return [...seen.entries()].map(([seriesLabel, tone]) => ({ seriesLabel, tone }));
  })();

  // Échelle Y symétrique : demi-amplitude = max des sommes empilées / 2.
  const halfMax = (() => {
    let max = 0;
    for (const d of data) {
      let sum = 0;
      for (const sv of d.values) sum += safeValue(sv.value);
      if (sum > max) max = sum;
    }
    return max / 2 || 1;
  })();

  const n = data.length;
  const xs = data.map((_, i) => {
    const denom = Math.max(n - 1, 1);
    const xRatio = n === 1 ? 0.5 : i / denom;
    return MARGIN.left + xRatio * plotWidth;
  });
  const midY = MARGIN.top + plotHeight / 2;
  const valToY = (signed: number) => midY - scaleLinear(signed, 0, halfMax, 0, plotHeight / 2);

  // bands[seriesIndex][xIndex] = { x, top, bottom } en px (baseline « wiggle » centrée).
  const bands: { x: number; top: number; bottom: number }[][] = series.map(() => []);
  data.forEach((d, xi) => {
    const total = d.values.reduce((s, sv) => s + safeValue(sv.value), 0);
    let acc = -total / 2;
    series.forEach((s, si) => {
      const sv = d.values.find((v) => v.label === s.seriesLabel);
      const v = sv ? safeValue(sv.value) : 0;
      const lower = acc;
      const upper = acc + v;
      acc = upper;
      bands[si].push({ x: xs[xi], top: valToY(upper), bottom: valToY(lower) });
    });
  });

  const areas = series.map((s, si) => {
    const band = bands[si];
    if (!band || band.length === 0) return { tone: s.tone, seriesLabel: s.seriesLabel, d: "" };
    const topPts = band.map((b) => ({ x: b.x, y: b.top }));
    const bottomPts = band.map((b) => ({ x: b.x, y: b.bottom })).reverse();
    const topPath = smooth ? buildSmoothPath(topPts) : buildLinearPath(topPts);
    const bottomPath = (smooth ? buildSmoothPath(bottomPts) : buildLinearPath(bottomPts)).replace(/^M/, "L");
    return { tone: s.tone, seriesLabel: s.seriesLabel, d: `${topPath} ${bottomPath} Z` };
  });

  const xTickEntries = (() => {
    if (n === 0) return [] as { x: number; label: string }[];
    const target = Math.min(5, n);
    const stride = Math.max(1, Math.round((n - 1) / (target - 1 || 1)));
    const entries: { x: number; label: string }[] = [];
    for (let i = 0; i < n; i += stride) entries.push({ x: xs[i], label: data[i].category });
    const lastIdx = n - 1;
    if (entries[entries.length - 1]?.label !== data[lastIdx].category) {
      entries.push({ x: xs[lastIdx], label: data[lastIdx].category });
    }
    return entries;
  })();

  const dataValueItems = (() => {
    const items = series.map((s) => {
      const total = data.reduce((sum, d) => {
        const sv = d.values.find((v) => v.label === s.seriesLabel);
        return sum + (sv ? safeValue(sv.value) : 0);
      }, 0);
      return `${s.seriesLabel}: ${total}`;
    });
    const grand = data.reduce((sum, d) => sum + d.values.reduce((s, sv) => s + safeValue(sv.value), 0), 0);
    if (series.length > 0) items.push(`Total: ${grand}`);
    return items;
  })();

  function handleLeave() {
    setHovered(null);
  }
  function handleVisualPointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHovered(null);
      return;
    }
    const si = Number(target.getAttribute("data-series-index"));
    setHovered(Number.isInteger(si) ? si : null);
  }

  const tooltip = (() => {
    if (hovered === null || !series[hovered]) return null;
    const s = series[hovered];
    const band = bands[hovered];
    if (!band || band.length === 0) return null;
    const mid = band[Math.floor(band.length / 2)];
    const total = data.reduce((sum, d) => {
      const sv = d.values.find((v) => v.label === s.seriesLabel);
      return sum + (sv ? safeValue(sv.value) : 0);
    }, 0);
    return { label: s.seriesLabel, value: total, cx: mid.x, cy: (mid.top + mid.bottom) / 2 };
  })();

  return (
    <div {...rest} className={classNames("st-streamgraphChart", className)}>
      <div
        className="st-streamgraphChart__visual"
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
          <line
            className="st-streamgraphChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {xTickEntries.map((tick, i) => (
            <text
              key={i}
              className="st-streamgraphChart__tickLabel"
              x={tick.x}
              y={height - MARGIN.bottom + 16}
              textAnchor="middle"
            >
              {tick.label}
            </text>
          ))}

          {areas.map((area, si) =>
            area.d ? (
              <path
                key={area.seriesLabel}
                className={classNames(
                  "st-streamgraphChart__area",
                  `st-streamgraphChart__area--${area.tone}`,
                  hovered !== null && hovered !== si && "st-streamgraphChart__area--dim",
                )}
                d={area.d}
                data-series-index={si}
              />
            ) : null,
          )}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {tooltip ? (
        <div
          className="st-streamgraphChart__tooltip"
          role="presentation"
          style={{ left: `${(tooltip.cx / width) * 100}%`, top: `${(tooltip.cy / height) * 100}%` }}
        >
          <span className="st-streamgraphChart__tooltipLabel">{tooltip.label}</span>
          <span className="st-streamgraphChart__tooltipValue">{tooltip.value}</span>
        </div>
      ) : null}

      {showLegend && series.length > 0 ? (
        <ul className="st-streamgraphChart__legend">
          {series.map((item) => (
            <li key={item.seriesLabel} className="st-streamgraphChart__legendItem">
              <span
                className={classNames("st-streamgraphChart__legendSwatch", `st-streamgraphChart__legendSwatch--${item.tone}`)}
                aria-hidden="true"
              />
              {item.seriesLabel}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

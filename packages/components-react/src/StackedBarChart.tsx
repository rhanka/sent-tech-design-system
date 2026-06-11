import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";

export type StackedBarTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type StackedBarSegment = {
  label: string;
  value: number;
  tone?: StackedBarTone;
};

export type StackedBarDatum = {
  label: string;
  segments: StackedBarSegment[];
};

export type StackedBarChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: StackedBarDatum[];
  width?: number;
  height?: number;
  label: string;
  showLegend?: boolean;
  /**
   * Per-segment value labels. `false`/absent (default) → none. `true` → each
   * segment's value with the chart's numeric formatter. Object → `format(value)`
   * and/or a `position` override (default `center` of the segment). Segments too
   * short to host a legible label are skipped. Labels are `aria-hidden` — the
   * values already live in the accessible ChartDataList.
   */
  dataLabels?: DataLabelsProp;
  className?: string;
};

const MARGIN = { top: 14, right: 16, bottom: 34, left: 44 } as const;

// A segment must be at least this tall (px) to host a legible label.
const DATA_LABEL_MIN_SEG_PX = 14;

const TONES: StackedBarTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

type Seg = {
  x: number;
  y: number;
  width: number;
  height: number;
  seg: StackedBarSegment;
  tone: StackedBarTone;
  cx: number;
  cy: number;
};

type Bar = { x: number; band: number; label: string; segs: Seg[]; cxLabel: number };

export function StackedBarChart({
  data,
  width = 480,
  height = 260,
  label,
  showLegend = true,
  dataLabels,
  className,
  ...rest
}: StackedBarChartProps) {
  const [hovered, setHovered] = React.useState<{ bar: number; seg: number } | null>(null);

  // Légende : tones par label de série (ordre de la 1re barre).
  const legend = (() => {
    const seen = new Map<string, StackedBarTone>();
    data.forEach((bar) =>
      bar.segments.forEach((seg, i) => {
        if (!seen.has(seg.label)) seen.set(seg.label, seg.tone ?? TONES[i % TONES.length]);
      }),
    );
    return [...seen.entries()].map(([seriesLabel, tone]) => ({ seriesLabel, tone }));
  })();

  const totals = data.map((b) => b.segments.reduce((s, x) => s + Math.max(x.value, 0), 0));
  const ticks = niceTicks(0, Math.max(0, ...totals));
  const domainMax = ticks[ticks.length - 1];
  const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  const bars: Bar[] = (() => {
    if (data.length === 0) return [];
    const band = plotW / data.length;
    const barWidth = band * 0.6;
    return data.map((bar, bi) => {
      const x = MARGIN.left + band * bi + (band - barWidth) / 2;
      let acc = 0;
      const segs = bar.segments.map((seg, si) => {
        const v = Math.max(seg.value, 0);
        const yTop = MARGIN.top + scaleLinear(acc + v, 0, domainMax, plotH, 0);
        const yBottom = MARGIN.top + scaleLinear(acc, 0, domainMax, plotH, 0);
        acc += v;
        return {
          x,
          y: yTop,
          width: barWidth,
          height: Math.max(yBottom - yTop, 0),
          seg,
          tone: seg.tone ?? TONES[si % TONES.length],
          cx: x + barWidth / 2,
          cy: yTop + (yBottom - yTop) / 2,
        };
      });
      return { x, band, label: bar.label, segs, cxLabel: MARGIN.left + band * (bi + 0.5) };
    });
  })();

  const dataValueItems = data.flatMap((bar) => bar.segments.map((seg) => `${bar.label}, ${seg.label}: ${seg.value}`));

  // --- Data labels ----------------------------------------------------------
  // One value label centred in each segment (default `center`). Segments shorter
  // than DATA_LABEL_MIN_SEG_PX are skipped so labels stay legible. aria-hidden
  // (values are in the ChartDataList already).
  const dataLabelOpts = normalizeDataLabels(dataLabels);
  const dataLabelItems = dataLabelOpts.enabled
    ? bars.flatMap((bar) =>
        bar.segs
          .filter((s) => s.height >= DATA_LABEL_MIN_SEG_PX)
          .map((s) => ({
            key: `${bar.label}-${s.seg.label}`,
            x: s.cx,
            y: s.cy,
            text: formatDataLabel(s.seg.value, dataLabelOpts, formatTick),
          })),
      )
    : [];

  function handleLeave() {
    setHovered(null);
  }
  function handleVisualPointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHovered(null);
      return;
    }
    const bar = Number(target.getAttribute("data-bar-index"));
    const seg = Number(target.getAttribute("data-segment-index"));
    setHovered(Number.isInteger(bar) && Number.isInteger(seg) ? { bar, seg } : null);
  }

  const hoveredSeg = hovered && bars[hovered.bar]?.segs[hovered.seg];

  return (
    <div {...rest} className={classNames("st-stackedBar", className)}>
      <div
        className="st-stackedBar__visual"
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
          {ticks.map((t) => {
            const y = MARGIN.top + scaleLinear(t, 0, domainMax, plotH, 0);
            return (
              <React.Fragment key={t}>
                <line className="st-stackedBar__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={y} y2={y} />
                <text className="st-stackedBar__tick" x={MARGIN.left - 6} y={y} textAnchor="end" dominantBaseline="middle">
                  {formatTick(t)}
                </text>
              </React.Fragment>
            );
          })}

          <line className="st-stackedBar__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line
            className="st-stackedBar__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {bars.map((bar, bi) => (
            <React.Fragment key={bar.label}>
              <text
                className="st-stackedBar__categoryLabel"
                x={bar.cxLabel}
                y={height - MARGIN.bottom + 16}
                textAnchor="middle"
              >
                {bar.label}
              </text>
              {bar.segs.map((s, si) => (
                <rect
                  key={s.seg.label}
                  className={classNames(
                    "st-stackedBar__seg",
                    `st-stackedBar__seg--${s.tone}`,
                    hovered !== null && !(hovered.bar === bi && hovered.seg === si) && "st-stackedBar__seg--dim",
                  )}
                  x={s.x}
                  y={s.y}
                  width={s.width}
                  height={s.height}
                  data-bar-index={bi}
                  data-segment-index={si}
                />
              ))}
            </React.Fragment>
          ))}

          {/* Data labels — one value per segment, drawn on top. aria-hidden. */}
          {dataLabelItems.length > 0 ? (
            <g className="st-stackedBar__dataLabels" aria-hidden="true">
              {dataLabelItems.map((d) => (
                <text
                  key={d.key}
                  className="st-stackedBar__dataLabel"
                  x={d.x}
                  y={d.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {d.text}
                </text>
              ))}
            </g>
          ) : null}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredSeg ? (
        <div
          className="st-stackedBar__tooltip"
          role="presentation"
          style={{ left: `${(hoveredSeg.cx / width) * 100}%`, top: `${(hoveredSeg.cy / height) * 100}%` }}
        >
          <span className="st-stackedBar__tooltipLabel">{hoveredSeg.seg.label}</span>
          <span className="st-stackedBar__tooltipValue">{hoveredSeg.seg.value}</span>
        </div>
      ) : null}

      {showLegend && legend.length > 0 ? (
        <ul className="st-stackedBar__legend">
          {legend.map((item) => (
            <li key={item.seriesLabel} className="st-stackedBar__legendItem">
              <span
                className={classNames("st-stackedBar__legendSwatch", `st-stackedBar__legendSwatch--${item.tone}`)}
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

import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";
import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";

export type DonutChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type DonutChartDatum = {
  label: string;
  value: number;
  tone?: DonutChartTone;
};

export type DonutChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: DonutChartDatum[];
  /** Diamètre du SVG. */
  size?: number;
  /** Épaisseur de l'anneau. */
  thickness?: number;
  /** Texte au centre (sinon le total). null pour masquer. */
  centerLabel?: string | null;
  /**
   * Per-slice value labels. `false`/absent (default) → none. `true` → each
   * slice's value with the default formatter. Object → `format(value)` and/or a
   * `position` override (default `center` of the arc). Slices too thin to fit a
   * legible label are skipped. Labels are `aria-hidden` — the values already
   * live in the accessible ChartDataList.
   */
  dataLabels?: DataLabelsProp;
  label: string;
  className?: string;
};

const TONES: DonutChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

const fmtPct = (p: number) => `${p.toFixed(p < 10 ? 1 : 0)}%`;

// A slice must span at least this many degrees to host a legible label.
const DATA_LABEL_MIN_DEG = 18;

type Slice = {
  d: DonutChartDatum;
  path: string;
  tone: DonutChartTone;
  pct: number;
  spanDeg: number;
  labelX: number;
  labelY: number;
};

export function DonutChart({
  data,
  size = 220,
  thickness = 34,
  centerLabel,
  dataLabels,
  label,
  className,
  ...rest
}: DonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const slices = (() => {
    const total = data.reduce((sum, d) => sum + Math.max(d.value, 0), 0);
    if (total <= 0) return { total: 0, items: [] as Slice[] };
    const cx = size / 2;
    const cy = size / 2;
    const rOuter = size / 2 - 2;
    const rInner = Math.max(rOuter - thickness, 1);
    const TWO_PI = Math.PI * 2;
    let angle = -Math.PI / 2; // départ en haut
    const polar = (r: number, a: number): [number, number] => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const items = data.map((d, i) => {
      const frac = Math.max(d.value, 0) / total;
      // epsilon pour éviter le cas exact 2π (slice à 100%) non rendu.
      const span = Math.min(frac * TWO_PI, TWO_PI - 0.0001);
      const a0 = angle;
      const a1 = angle + span;
      angle = a1;
      const large = span > Math.PI ? 1 : 0;
      const [x0o, y0o] = polar(rOuter, a0);
      const [x1o, y1o] = polar(rOuter, a1);
      const [x1i, y1i] = polar(rInner, a1);
      const [x0i, y0i] = polar(rInner, a0);
      const path = `M ${x0o} ${y0o} A ${rOuter} ${rOuter} 0 ${large} 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${rInner} ${rInner} 0 ${large} 0 ${x0i} ${y0i} Z`;
      // Label anchor: centre of the arc (mid-angle, mid-radius of the ring).
      const aMid = (a0 + a1) / 2;
      const rMid = (rOuter + rInner) / 2;
      const [labelX, labelY] = polar(rMid, aMid);
      return { d, path, tone: d.tone ?? TONES[i % TONES.length], pct: frac * 100, spanDeg: (span * 180) / Math.PI, labelX, labelY };
    });
    return { total, items };
  })();

  // --- Data labels ----------------------------------------------------------
  // One value label centred in each arc (default `center`). Slices thinner than
  // DATA_LABEL_MIN_DEG are skipped so labels stay legible. aria-hidden (values
  // are in the ChartDataList already).
  const dataLabelOpts = normalizeDataLabels(dataLabels);
  const dataLabelItems = dataLabelOpts.enabled
    ? slices.items
        .filter((slice) => slice.spanDeg >= DATA_LABEL_MIN_DEG)
        .map((slice) => ({
          key: slice.d.label,
          x: slice.labelX,
          y: slice.labelY,
          text: formatDataLabel(slice.d.value, dataLabelOpts, (v) => String(v)),
        }))
    : [];

  const dataValueItems = slices.items.map((slice) => `${slice.d.label}: ${slice.d.value} (${fmtPct(slice.pct)})`);

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

  const hovered = hoveredIndex !== null ? slices.items[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-donutChart", className)}>
      <div
        className="st-donutChart__visual"
        role="img"
        aria-label={label}
        onPointerMove={handleVisualPointerMove}
        onPointerLeave={handleLeave}
      >
        <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" focusable="false" aria-hidden="true">
          {slices.total > 0 ? (
            <>
              {slices.items.map((slice, i) => (
                <path
                  key={slice.d.label}
                  className={classNames(
                    "st-donutChart__slice",
                    `st-donutChart__slice--${slice.tone}`,
                    hoveredIndex !== null && hoveredIndex !== i && "st-donutChart__slice--dim",
                  )}
                  d={slice.path}
                  data-chart-index={i}
                />
              ))}
              {centerLabel !== null ? (
                <text
                  className="st-donutChart__center"
                  x={size / 2}
                  y={size / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {centerLabel ?? slices.total}
                </text>
              ) : null}
              {/* Data labels — one value per slice, centred in the arc. aria-hidden. */}
              {dataLabelItems.length > 0 ? (
                <g className="st-donutChart__dataLabels" aria-hidden="true">
                  {dataLabelItems.map((d) => (
                    <text
                      key={d.key}
                      className="st-donutChart__dataLabel"
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
            </>
          ) : null}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hovered ? (
        <div className="st-donutChart__tooltip" role="presentation">
          <span className="st-donutChart__tooltipLabel">{hovered.d.label}</span>
          <span className="st-donutChart__tooltipValue">
            {hovered.d.value} · {fmtPct(hovered.pct)}
          </span>
        </div>
      ) : null}
    </div>
  );
}

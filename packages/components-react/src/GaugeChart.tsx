import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type GaugeChartTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

/**
 * Seuil de coloration. La bande s'étend depuis `value` (ou le minimum)
 * jusqu'au seuil suivant (ou le maximum). `tone` choisit la couleur.
 */
export type GaugeChartThreshold = {
  value: number;
  tone: GaugeChartTone;
};

export type GaugeChartFormat = "number" | "percent";

export type GaugeChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  value: number;
  min?: number;
  max?: number;
  /** Bandes colorées sur la piste. Triées par `value` croissante. */
  thresholds?: GaugeChartThreshold[];
  /** Libellé décrivant la jauge (a11y + texte sous la valeur). */
  label?: string;
  /** Format de la valeur centrale. */
  format?: GaugeChartFormat;
  /** Suffixe d'unité (ignoré pour `percent`). */
  unit?: string;
  /** Diamètre du SVG. */
  size?: number;
  /** Épaisseur de l'arc. */
  thickness?: number;
  /** Angle de départ en degrés (0 = est, sens horaire). */
  startAngle?: number;
  /** Angle de fin en degrés. */
  endAngle?: number;
  className?: string;
};

const toRad = (deg: number) => (deg * Math.PI) / 180;

const polar = (
  radius: number,
  angle: number,
  centerX: number,
  centerY: number,
): [number, number] => [centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle)];

export function GaugeChart({
  value,
  min = 0,
  max = 100,
  thresholds,
  label,
  format = "number",
  unit,
  size = 220,
  thickness = 22,
  startAngle = 180,
  endAngle = 360,
  className,
  ...rest
}: GaugeChartProps) {
  const TAU = Math.PI * 2;
  // Bornes assainies : min/max non finis ou inversés → domaine neutre [0,0].
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) ? max : safeMin;
  const span = Math.max(safeMax - safeMin, 0);
  // Valeur assainie puis bornée à [min,max] (jamais NaN dans l'ARIA/géométrie).
  const safeValue = Number.isFinite(value) ? value : safeMin;
  const clamped = Math.min(Math.max(safeValue, safeMin), safeMax);
  const frac = span > 0 ? (clamped - safeMin) / span : 0;

  // Géométrie commune.
  const cx = size / 2;
  const r = size / 2 - thickness / 2 - 2;
  const a0 = toRad(startAngle);
  const a1 = toRad(endAngle);
  // Un tour complet (|Δ| ≥ 2π) est borné à 2π−ε : sinon l'arc SVG dégénère
  // (départ == arrivée → arc de longueur nulle au lieu d'un cercle plein).
  const rawTotal = a1 - a0;
  const totalAngle =
    Math.abs(rawTotal) >= TAU ? Math.sign(rawTotal || 1) * (TAU - 1e-3) : rawTotal;

  // Hauteur réelle de l'arc pour cadrer le viewBox (demi-cercle → moitié).
  const geometry = (() => {
    const cyRaw = size / 2;
    // Échantillonnage des extrema y/x pour un cadrage stable quel que soit l'angle.
    const samples = 64;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i <= samples; i++) {
      const a = a0 + (totalAngle * i) / samples;
      const yOuter = cyRaw + (r + thickness / 2) * Math.sin(a);
      minY = Math.min(minY, yOuter);
      maxY = Math.max(maxY, yOuter);
    }
    minY = Math.min(minY, cyRaw - (r + thickness / 2));
    const vbHeight = Math.min(maxY, size) - Math.max(minY, 0);
    return { cy: cyRaw, vbTop: Math.max(minY, 0), vbHeight: Math.max(vbHeight, thickness) };
  })();

  const cy = geometry.cy;

  function arcPath(fromFrac: number, toFrac: number): string {
    const from = a0 + totalAngle * fromFrac;
    const to = a0 + totalAngle * toFrac;
    const [x0, y0] = polar(r, from, cx, cy);
    const [x1, y1] = polar(r, to, cx, cy);
    const large = Math.abs(to - from) > Math.PI ? 1 : 0;
    const sweep = totalAngle >= 0 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}`;
  }

  // Bandes colorées issues des seuils.
  const bands = (() => {
    if (!thresholds || thresholds.length === 0 || span <= 0)
      return [] as Array<{ from: number; to: number; tone: GaugeChartTone }>;
    const sorted = [...thresholds]
      .filter((t) => Number.isFinite(t.value))
      .sort((a, b) => a.value - b.value);
    const segments: Array<{ from: number; to: number; tone: GaugeChartTone }> = [];
    let start = safeMin;
    for (const t of sorted) {
      const end = Math.min(Math.max(t.value, safeMin), safeMax);
      if (end <= start) continue;
      segments.push({ from: (start - safeMin) / span, to: (end - safeMin) / span, tone: t.tone });
      start = end;
    }
    if (start < safeMax) {
      const lastTone = sorted[sorted.length - 1]?.tone ?? "neutral";
      segments.push({ from: (start - safeMin) / span, to: 1, tone: lastTone });
    }
    return segments;
  })();

  // Ton de la bande active (celle qui contient la valeur) pour l'a11y.
  const activeBand = bands.find((b) => frac >= b.from && frac <= b.to) ?? bands[bands.length - 1];
  const BAND_LABELS: Record<GaugeChartTone, string> = {
    neutral: "neutre",
    info: "information",
    success: "succès",
    warning: "alerte",
    error: "erreur",
    category1: "catégorie 1",
    category2: "catégorie 2",
    category3: "catégorie 3",
    category4: "catégorie 4",
    category5: "catégorie 5",
    category6: "catégorie 6",
    category7: "catégorie 7",
    category8: "catégorie 8",
  };

  // Position de l'aiguille.
  const needle = (() => {
    const a = a0 + totalAngle * frac;
    const tip = polar(r + thickness / 2, a, cx, cy);
    const left = polar(thickness * 0.18, a + Math.PI / 2, cx, cy);
    const right = polar(thickness * 0.18, a - Math.PI / 2, cx, cy);
    return `M ${left[0]} ${left[1]} L ${tip[0]} ${tip[1]} L ${right[0]} ${right[1]} Z`;
  })();

  const formatted = (() => {
    if (format === "percent") {
      const pct = span > 0 ? Math.round(frac * 100) : 0;
      return `${pct}%`;
    }
    const num = Number.isInteger(clamped) ? String(clamped) : clamped.toFixed(1);
    return unit ? `${num} ${unit}` : num;
  })();

  const zoneText = activeBand ? `, zone ${BAND_LABELS[activeBand.tone]}` : "";
  const ariaValueText = `${label ? `${label}: ` : ""}${formatted}${zoneText}`;

  const dataValueItems = [
    `${label ? `${label}: ` : ""}${formatted} (min ${safeMin}, max ${safeMax})${zoneText}`,
  ];

  return (
    <div {...rest} className={classNames("st-gaugeChart", className)}>
      <div
        className="st-gaugeChart__visual"
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={ariaValueText}
        aria-label={label}
      >
        <svg
          viewBox={`0 ${geometry.vbTop} ${size} ${geometry.vbHeight}`}
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          {/* Piste de fond */}
          <path className="st-gaugeChart__track" d={arcPath(0, 1)} fill="none" strokeWidth={thickness} />

          {/* Bandes de seuils (sous le remplissage) */}
          {bands.map((band, i) => (
            <path
              key={i}
              className={`st-gaugeChart__band st-gaugeChart__band--${band.tone}`}
              d={arcPath(band.from, band.to)}
              fill="none"
              strokeWidth={thickness}
            />
          ))}

          {/* Arc de progression (uniquement sans seuils) */}
          {bands.length === 0 ? (
            <path className="st-gaugeChart__progress" d={arcPath(0, frac)} fill="none" strokeWidth={thickness} />
          ) : null}

          {/* Aiguille */}
          <path className="st-gaugeChart__needle" d={needle} />
          <circle className="st-gaugeChart__hub" cx={cx} cy={cy} r={Math.max(thickness * 0.22, 4)} />

          {/* Valeur centrale */}
          <text
            className="st-gaugeChart__value"
            x={cx}
            y={cy - thickness * 0.55}
            textAnchor="middle"
            dominantBaseline="auto"
          >
            {formatted}
          </text>
          {label ? (
            <text
              className="st-gaugeChart__label"
              x={cx}
              y={cy - thickness * 0.05}
              textAnchor="middle"
              dominantBaseline="hanging"
            >
              {label}
            </text>
          ) : null}
        </svg>
      </div>

      <ChartDataList label={label ?? "gauge"} items={dataValueItems} />
    </div>
  );
}

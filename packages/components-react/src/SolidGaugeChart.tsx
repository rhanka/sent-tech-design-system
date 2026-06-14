import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type SolidGaugeTone =
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
 * Seuil de coloration. La zone s'étend depuis le seuil précédent (ou le
 * minimum) jusqu'à `value`. `tone` choisit la couleur de l'arc rempli quand la
 * valeur tombe dans cette zone.
 */
export type SolidGaugeThreshold = {
  value: number;
  tone: SolidGaugeTone;
};

export type SolidGaugeFormat = "number" | "percent";

export type SolidGaugeChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  value: number;
  min?: number;
  max?: number;
  /** Bandes colorées triées par `value` croissante : la zone contenant la valeur teinte l'arc. */
  thresholds?: SolidGaugeThreshold[];
  /** Rayon intérieur de l'anneau, en fraction du rayon (0..1). */
  innerRadius?: number;
  /** Libellé décrivant la jauge (a11y + texte sous la valeur). */
  label?: string;
  /** Format de la valeur centrale. */
  format?: SolidGaugeFormat;
  /** Suffixe d'unité (ignoré pour `percent`). */
  unit?: string;
  /** Diamètre du SVG. */
  size?: number;
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

export function SolidGaugeChart({
  value,
  min = 0,
  max = 100,
  thresholds,
  innerRadius = 0.72,
  label,
  format = "number",
  unit,
  size = 220,
  startAngle = 180,
  endAngle = 360,
  className,
  ...rest
}: SolidGaugeChartProps) {
  const TAU = Math.PI * 2;
  // Bornes assainies : min/max non finis ou inversés → domaine neutre [0,0].
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) ? max : safeMin;
  const span = Math.max(safeMax - safeMin, 0);
  // Valeur assainie puis bornée à [min,max] (jamais NaN dans l'ARIA/géométrie).
  const safeValue = Number.isFinite(value) ? value : safeMin;
  const clamped = Math.min(Math.max(safeValue, safeMin), safeMax);
  const frac = span > 0 ? (clamped - safeMin) / span : 0;

  const cx = size / 2;
  const r = size / 2 - 2;
  const innerR = Math.min(Math.max(innerRadius, 0), 0.95) * r;
  const thickness = Math.max(r - innerR, 1);
  const trackR = (r + innerR) / 2;
  const a0 = toRad(startAngle);
  const a1 = toRad(endAngle);
  // Un tour complet (|Δ| ≥ 2π) est borné à 2π−ε : sinon l'arc SVG dégénère.
  const rawTotal = a1 - a0;
  const totalAngle =
    Math.abs(rawTotal) >= TAU ? Math.sign(rawTotal || 1) * (TAU - 1e-3) : rawTotal;

  // Hauteur réelle de l'arc pour cadrer le viewBox (demi-cercle → moitié).
  const geometry = (() => {
    const cyRaw = size / 2;
    const samples = 64;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i <= samples; i++) {
      const a = a0 + (totalAngle * i) / samples;
      const yOuter = cyRaw + r * Math.sin(a);
      minY = Math.min(minY, yOuter);
      maxY = Math.max(maxY, yOuter);
    }
    minY = Math.min(minY, cyRaw - r);
    const vbHeight = Math.min(maxY, size) - Math.max(minY, 0);
    return { cy: cyRaw, vbTop: Math.max(minY, 0), vbHeight: Math.max(vbHeight, thickness) };
  })();

  const cy = geometry.cy;

  function arcPath(fromFrac: number, toFrac: number): string {
    const from = a0 + totalAngle * fromFrac;
    const to = a0 + totalAngle * toFrac;
    const [x0, y0] = polar(trackR, from, cx, cy);
    const [x1, y1] = polar(trackR, to, cx, cy);
    const large = Math.abs(to - from) > Math.PI ? 1 : 0;
    const sweep = totalAngle >= 0 ? 1 : 0;
    return `M ${x0} ${y0} A ${trackR} ${trackR} 0 ${large} ${sweep} ${x1} ${y1}`;
  }

  // Tons triés par seuil croissant : la zone contenant la valeur teinte l'arc.
  const sortedThresholds =
    thresholds && thresholds.length > 0 && span > 0
      ? [...thresholds].filter((t) => Number.isFinite(t.value)).sort((a, b) => a.value - b.value)
      : [];

  let activeTone: SolidGaugeTone | null = null;
  if (sortedThresholds.length > 0) {
    activeTone = sortedThresholds[0].tone;
    for (const t of sortedThresholds) {
      if (clamped >= t.value) activeTone = t.tone;
    }
  }

  const formatted = (() => {
    if (format === "percent") {
      const pct = span > 0 ? Math.round(frac * 100) : 0;
      return `${pct}%`;
    }
    const num = Number.isInteger(clamped) ? String(clamped) : clamped.toFixed(1);
    return unit ? `${num} ${unit}` : num;
  })();

  const ariaValueText = `${label ? `${label}: ` : ""}${formatted}`;

  const dataValueItems = [`${label ? `${label}: ` : ""}${formatted} (min ${safeMin}, max ${safeMax})`];

  const progressClass = activeTone
    ? `st-solidGaugeChart__progress st-solidGaugeChart__progress--${activeTone}`
    : "st-solidGaugeChart__progress";

  return (
    <div {...rest} className={classNames("st-solidGaugeChart", className)}>
      <div
        className="st-solidGaugeChart__visual"
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
          <path className="st-solidGaugeChart__track" d={arcPath(0, 1)} fill="none" strokeWidth={thickness} />

          {/* Arc de progression rempli */}
          {frac > 0 ? (
            <path className={progressClass} d={arcPath(0, frac)} fill="none" strokeWidth={thickness} />
          ) : null}

          {/* Valeur centrale */}
          <text
            className="st-solidGaugeChart__value"
            x={cx}
            y={cy - thickness * 0.1}
            textAnchor="middle"
            dominantBaseline="auto"
          >
            {formatted}
          </text>
          {label ? (
            <text
              className="st-solidGaugeChart__label"
              x={cx}
              y={cy + thickness * 0.35}
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

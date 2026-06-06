import React from "react";

export const CHART_MARGIN = { top: 12, right: 16, bottom: 32, left: 44 } as const;

export function niceTicks(min: number, max: number, target = 5): number[] {
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

export function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d1 === d0) return r0;
  return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
}

export function formatTick(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

export function isNumeric(x: number | string): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

// Hex (résolus) des tons catégoriels `data-categoryN`, repris du thème.
// Sert à choisir une couleur de texte contrastée par-dessus un remplissage.
const CATEGORY_HEX: Record<string, string> = {
  category1: "#4E79A7",
  category2: "#F28E2B",
  category3: "#E15759",
  category4: "#76B7B2",
  category5: "#59A14F",
  category6: "#EDC948",
  category7: "#B07AA1",
  category8: "#FF9DA7",
};

function relativeLuminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 0;
  const int = parseInt(m[1], 16);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = channel((int >> 16) & 0xff);
  const g = channel((int >> 8) & 0xff);
  const b = channel(int & 0xff);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Renvoie une couleur de texte (token) contrastée pour un ton catégoriel donné :
 * texte sombre sur fond clair, texte clair sur fond sombre. Évite le « blanc sur
 * clair » illisible (WCAG) pour les tons clairs (jaune, pêche, etc.).
 */
export function contrastTextVar(tone: string): string {
  const hex = CATEGORY_HEX[tone];
  // Inconnu → blanc inverse comme avant (les tons sombres sont majoritaires).
  if (!hex) return "var(--st-semantic-text-inverse, #fff)";
  // Seuil ~0.4 : au-delà le fond est clair, on passe au texte primaire sombre.
  return relativeLuminance(hex) > 0.4
    ? "var(--st-semantic-text-primary, #0f172a)"
    : "var(--st-semantic-text-inverse, #fff)";
}

export function buildLinearPath(pts: { x: number; y: number }[]): string {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
}

export function buildSmoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return buildLinearPath(pts);
  const t = 0.18;
  let d = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) * t;
    const c1y = p1.y + (p2.y - p0.y) * t;
    const c2x = p2.x - (p3.x - p1.x) * t;
    const c2y = p2.y - (p3.y - p1.y) * t;
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
}

// --- Analytical overlay layer (shared, framework-agnostic) -----------------
//
// Optional reference lines, shaded bands, a goal line, a linear-regression
// trend and error bars. Purely additive: when every overlay prop is absent the
// helpers below contribute nothing (empty domain extension, empty a11y items).

/**
 * Semantic tone for an analytical overlay (reference line / band / goal).
 * Maps to the feedback token family — these are *markers*, not categorical
 * series, so they reuse the success/warning/error/info semantics. `neutral`
 * (the default) uses the strong border / secondary text tokens.
 */
export type ChartOverlayTone = "neutral" | "success" | "warning" | "error" | "info";

export type ChartReferenceLine = {
  value: number;
  label?: string;
  tone?: ChartOverlayTone;
  axis?: "x" | "y";
};

export type ChartBand = {
  from: number;
  to: number;
  label?: string;
  tone?: ChartOverlayTone;
};

export type ChartGoalLine = {
  value: number;
  label?: string;
};

/** A tone is valid only when it is one of the known overlay tones. */
export function overlayToneClass(prefix: string, tone: ChartOverlayTone | undefined): string {
  const t: ChartOverlayTone = tone ?? "neutral";
  return `${prefix}--${t}`;
}

/**
 * Least-squares linear regression over finite points. Returns the line in DATA
 * space (`y = slope·x + intercept`) plus the x-range it was fit on, or `null`
 * when fewer than two finite points exist or the x-values are degenerate.
 */
export function linearRegression(
  pts: ReadonlyArray<{ x: number; y: number }>,
): { slope: number; intercept: number; minX: number; maxX: number } | null {
  const finite = pts.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  if (finite.length < 2) return null;
  const n = finite.length;
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  let minX = Infinity;
  let maxX = -Infinity;
  for (const p of finite) {
    sx += p.x;
    sy += p.y;
    sxx += p.x * p.x;
    sxy += p.x * p.y;
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
  }
  const denom = n * sxx - sx * sx;
  if (denom === 0) return null;
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  if (!Number.isFinite(slope) || !Number.isFinite(intercept)) return null;
  return { slope, intercept, minX, maxX };
}

/**
 * Extends a value-axis `[min, max]` so finite overlay values stay inside the
 * plot. Reference lines on the value axis (default `y`), band bounds, the goal
 * value and finite error-bar extents are all folded in. Non-finite values are
 * ignored. Returns the original range untouched when no overlay needs it.
 */
export function extendValueDomain(
  min: number,
  max: number,
  overlays: {
    referenceLines?: ReadonlyArray<ChartReferenceLine>;
    bands?: ReadonlyArray<ChartBand>;
    goalLine?: ChartGoalLine | null;
    extraValues?: ReadonlyArray<number>;
  },
): [number, number] {
  let lo = min;
  let hi = max;
  const fold = (v: number | undefined) => {
    if (v === undefined || !Number.isFinite(v)) return;
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  };
  for (const r of overlays.referenceLines ?? []) {
    if ((r.axis ?? "y") === "y") fold(r.value);
  }
  for (const b of overlays.bands ?? []) {
    fold(b.from);
    fold(b.to);
  }
  if (overlays.goalLine) fold(overlays.goalLine.value);
  for (const v of overlays.extraValues ?? []) fold(v);
  return [lo, hi];
}

/**
 * Screen-reader descriptions of the active overlays, appended after the data
 * values in the ChartDataList. Empty when no overlay is present.
 */
export function overlayDataListItems(overlays: {
  referenceLines?: ReadonlyArray<ChartReferenceLine>;
  bands?: ReadonlyArray<ChartBand>;
  goalLine?: ChartGoalLine | null;
  trend?: { slope: number; intercept: number } | null;
}): string[] {
  const items: string[] = [];
  for (const r of overlays.referenceLines ?? []) {
    if (!Number.isFinite(r.value)) continue;
    items.push(r.label ? `Référence: ${r.label} = ${r.value}` : `Référence: ${r.value}`);
  }
  for (const b of overlays.bands ?? []) {
    if (!Number.isFinite(b.from) || !Number.isFinite(b.to)) continue;
    const lo = Math.min(b.from, b.to);
    const hi = Math.max(b.from, b.to);
    items.push(b.label ? `Bande: ${b.label} (${lo}–${hi})` : `Bande: ${lo}–${hi}`);
  }
  if (overlays.goalLine && Number.isFinite(overlays.goalLine.value)) {
    const g = overlays.goalLine;
    items.push(g.label ? `Objectif: ${g.label} = ${g.value}` : `Objectif: ${g.value}`);
  }
  if (overlays.trend) {
    items.push(`Tendance: pente ${overlays.trend.slope.toFixed(2)}`);
  }
  return items;
}

export type ChartDataListProps = {
  label: string;
  items: string[];
  className?: string;
};

export function ChartDataList({ label, items, className }: ChartDataListProps) {
  if (items.length === 0) return null;
  return (
    <ul className={["st-chartDataList", className].filter(Boolean).join(" ")} aria-label={`Data values for ${label}`}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

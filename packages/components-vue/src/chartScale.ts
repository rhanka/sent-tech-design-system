import { h } from "vue";

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

/**
 * Couleurs effectives de la palette catégorielle `--st-semantic-data-categoryN`
 * (thème sent-tech). Sert à choisir une couleur de texte lisible PAR FILL pour
 * les labels posés à l'intérieur d'un segment (Funnel, Treemap) : blanc sur fond
 * sombre, encre sur fond clair — garantie de contraste WCAG, contrairement à un
 * `#fff` codé en dur qui échoue sur les tons clairs (jaune/rose/sarcelle).
 */
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
  const channel = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = channel((int >> 16) & 0xff);
  const g = channel((int >> 8) & 0xff);
  const b = channel(int & 0xff);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** `true` si le ton catégoriel est clair (texte sombre requis pour le contraste). */
export function isLightTone(tone: string): boolean {
  const hex = CATEGORY_HEX[tone];
  if (!hex) return false;
  return relativeLuminance(hex) > 0.45;
}

/** Couleur de texte (token) lisible sur un fond catégoriel donné. */
export function labelColorForTone(tone: string): string {
  return isLightTone(tone)
    ? "var(--st-semantic-text-primary)"
    : "var(--st-semantic-text-inverse, #fff)";
}

export function chartDataList(label: string, items: string[]) {
  if (items.length === 0) return null;
  return h(
    "ul",
    { class: "st-chartDataList", "aria-label": `Data values for ${label}` },
    items.map((item, i) => h("li", { key: i }, item)),
  );
}

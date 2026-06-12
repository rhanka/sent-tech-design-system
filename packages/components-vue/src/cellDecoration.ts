import { h, type VNode } from "vue";

/**
 * Décoration sémantique d'une cellule (DataTable) ou d'une carte (KpiCard).
 *
 * API « conditional formatting » façon Power-BI : l'entrée est *pure data*
 * (zéro couleur). Le DS résout l'`intent` en token feedback (mêmes que
 * Badge/Status/Alert) appliqué en fond teinté accessible (WCAG via color-mix),
 * et rend une icône lucide optionnelle.
 *
 * Le MOTEUR DE RÈGLES (seuils, comparaisons…) vit dans dataviz-core, hors DS :
 * il produit ces décorations, le DS ne fait que les rendre.
 */
export type CellDecorationIntent = "positive" | "negative" | "warning" | "info" | "neutral";

export interface CellDecoration {
  /** Intention sémantique → token feedback + fond teinté accessible. */
  intent: CellDecorationIntent;
  /** Nom d'icône lucide (kebab-case, ex. « trending-up »). Ignoré si inconnu. */
  icon?: string;
}

/**
 * Texte lisible par lecteur d'écran décrivant l'intention. Le fond teinté n'est
 * jamais la SEULE indication : ce libellé (et le `title`) accompagne la cellule.
 */
export const cellDecorationLabel: Record<CellDecorationIntent, string> = {
  positive: "tendance positive",
  negative: "tendance négative",
  warning: "avertissement",
  info: "information",
  neutral: "neutre",
};

/** Classe utilitaire token-only résolue depuis l'intention. */
export function cellDecorationClass(intent: CellDecorationIntent): string {
  return `st-cell--intent-${intent}`;
}

/**
 * Données de tracé lucide (mêmes paths que @lucide/svelte / lucide-react) pour
 * un sous-ensemble d'icônes pertinentes en conditional formatting. Reproduites
 * en SVG inline afin de garder une parité stricte 3 frameworks sans coupler le
 * rendu à la résolution dynamique (différente entre lucide-react/-svelte/-vue).
 */
type IconNode = Array<[string, Record<string, string | number>]>;

export const cellDecorationIconNodes: Record<string, IconNode> = {
  "trending-up": [
    ["path", { d: "M16 7h6v6" }],
    ["path", { d: "m22 7-8.5 8.5-5-5L2 17" }],
  ],
  "trending-down": [
    ["path", { d: "M16 17h6v-6" }],
    ["path", { d: "m22 17-8.5-8.5-5 5L2 7" }],
  ],
  "arrow-up": [
    ["path", { d: "m5 12 7-7 7 7" }],
    ["path", { d: "M12 19V5" }],
  ],
  "arrow-down": [
    ["path", { d: "M12 5v14" }],
    ["path", { d: "m19 12-7 7-7-7" }],
  ],
  "triangle-alert": [
    ["path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }],
    ["path", { d: "M12 9v4" }],
    ["path", { d: "M12 17h.01" }],
  ],
  info: [
    ["circle", { cx: 12, cy: 12, r: 10 }],
    ["path", { d: "M12 16v-4" }],
    ["path", { d: "M12 8h.01" }],
  ],
  check: [["path", { d: "M20 6 9 17l-5-5" }]],
  x: [
    ["path", { d: "M18 6 6 18" }],
    ["path", { d: "m6 6 12 12" }],
  ],
  minus: [["path", { d: "M5 12h14" }]],
  "circle-check": [
    ["path", { d: "M21.801 10A10 10 0 1 1 17 3.335" }],
    ["path", { d: "m9 11 3 3L22 4" }],
  ],
  "circle-alert": [
    ["circle", { cx: 12, cy: 12, r: 10 }],
    ["line", { x1: 12, x2: 12, y1: 8, y2: 12 }],
    ["line", { x1: 12, x2: 12.01, y1: 16, y2: 16 }],
  ],
  "circle-x": [
    ["circle", { cx: 12, cy: 12, r: 10 }],
    ["path", { d: "m15 9-6 6" }],
    ["path", { d: "m9 9 6 6" }],
  ],
  flame: [["path", { d: "M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" }]],
};

/** True si l'icône est connue du registre (sinon le rendu l'ignore proprement). */
export function hasCellDecorationIcon(icon: string | undefined): boolean {
  return icon != null && Object.prototype.hasOwnProperty.call(cellDecorationIconNodes, icon);
}

/** Rend l'icône lucide en SVG inline, ou `null` si le nom est inconnu. */
export function renderCellDecorationIcon(icon: string | undefined): VNode | null {
  if (!hasCellDecorationIcon(icon)) return null;
  const nodes = cellDecorationIconNodes[icon as string];
  return h(
    "svg",
    {
      class: "st-cell__icon",
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
      focusable: "false",
    },
    nodes.map(([tag, attrs], i) => h(tag, { key: i, ...attrs })),
  );
}

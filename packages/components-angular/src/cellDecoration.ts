export type CellDecorationIntent = "positive" | "negative" | "warning" | "info" | "neutral";

export interface CellDecoration {
  intent: CellDecorationIntent;
  icon?: string;
}

export const cellDecorationLabel: Record<CellDecorationIntent, string> = {
  positive: "tendance positive",
  negative: "tendance négative",
  warning: "avertissement",
  info: "information",
  neutral: "neutre",
};

export function cellDecorationClass(intent: CellDecorationIntent): string {
  return `st-cell--intent-${intent}`;
}

type IconNode = Array<[string, Record<string, string | number>]>;

export const cellDecorationIconNodes: Record<string, IconNode> = {
  "trending-up": [["path", { d: "M16 7h6v6" }], ["path", { d: "m22 7-8.5 8.5-5-5L2 17" }]],
  "trending-down": [["path", { d: "M16 17h6v-6" }], ["path", { d: "m22 17-8.5-8.5-5 5L2 7" }]],
  "arrow-up": [["path", { d: "m5 12 7-7 7 7" }], ["path", { d: "M12 19V5" }]],
  "arrow-down": [["path", { d: "M12 5v14" }], ["path", { d: "m19 12-7 7-7-7" }]],
  "triangle-alert": [["path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }], ["path", { d: "M12 9v4" }], ["path", { d: "M12 17h.01" }]],
  info: [["circle", { cx: 12, cy: 12, r: 10 }], ["path", { d: "M12 16v-4" }], ["path", { d: "M12 8h.01" }]],
  check: [["path", { d: "M20 6 9 17l-5-5" }]],
  x: [["path", { d: "M18 6 6 18" }], ["path", { d: "m6 6 12 12" }]],
  minus: [["path", { d: "M5 12h14" }]],
};

export function hasCellDecorationIcon(icon: string | undefined): boolean {
  return icon != null && Object.prototype.hasOwnProperty.call(cellDecorationIconNodes, icon);
}

export function renderCellDecorationIcon(icon: string | undefined): unknown | null {
  return hasCellDecorationIcon(icon) ? cellDecorationIconNodes[icon as string] : null;
}

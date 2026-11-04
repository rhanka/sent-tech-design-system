// Shared conversion-table fixture (spec section 6.2). Self-contained: no
// external imports so the test program needs no node_modules resolution.
export type Align = "start" | "center" | "end";
export type Single = "only";
export interface Point {
  x: number;
  y: number;
  label?: string;
}
export interface Row {
  id: string;
  [key: string]: unknown;
}
export type Shape = { kind: "circle"; radius: number } | { kind: "rect"; w: number; h: number };
export interface GenericBox<T = string> {
  value: T;
  label?: string;
}

export interface TreeNode {
  id: string;
  child?: TreeNode;
}
export type Handler = (event: string) => void;
// Nested-intersection regression shapes (spec 6.2): GeoChartPoint mirrors
// GeoChart.svelte.d.ts (named coordinate base plus an inline object), and
// MessageAction mirrors catalog.d.ts (Omit base plus an inline object).
export type GeoChartCoordinate = {
  latitude: number;
  longitude: number;
};
export type GeoChartPoint = GeoChartCoordinate & {
  label?: string;
  value?: number;
};
export interface ActionItem {
  id?: string;
  value?: string;
  label: string;
  disabled?: boolean;
}
export type MessageAction = Omit<ActionItem, "label"> & {
  label?: string;
  variant?: string;
};
export interface Props {
  align?: Align;
  mode: Single;
  point?: Point;
  count: number | null;
  maybe?: string | undefined;
  pair: [string, number];
  rest: [string, ...number[]];
  map: Record<string, number>;
  shape?: Shape;
  box?: GenericBox;
  handler?: Handler;
  nested?: TreeNode;
  unknownField?: unknown;
  stamp?: Date;
}

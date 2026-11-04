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

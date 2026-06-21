import { Component, Input as NgInput, type OnChanges, type OnInit } from "@angular/core";

import { classNames } from "./classNames.js";

// ---------------------------------------------------------------------------
// Public types (mirror packages/components-svelte/src/lib/ForceGraph.svelte).
// ---------------------------------------------------------------------------
export type ForceGraphTone =
  | "category1" | "category2" | "category3" | "category4"
  | "category5" | "category6" | "category7" | "category8";

export type ForceGraphNodeShape =
  | "dot" | "circle"
  | "diamond"
  | "star"
  | "hexagon"
  | "box" | "square"
  | "roundedbox"
  | "triangle";

/** Stroke dash style for typed edges. */
export type ForceGraphEdgeDash = "solid" | "dashed" | "dotted" | "long-dash";

export type ForceGraphNode = {
  /** Stable identifier; referenced by edges. */
  id: string;
  /** Visible label (falls back to id). */
  label?: string;
  /**
   * Grouping key (e.g. node type or community). Nodes sharing a group get
   * the same tone when `tone` is not set explicitly.
   */
  group?: string | number;
  /** Explicit data-vis tone; overrides the group-derived tone. */
  tone?: ForceGraphTone;
  /** Relative node radius weight (defaults to 1). */
  weight?: number;
  /** Pin the node to a fixed position (ignored by the simulation). */
  fx?: number;
  fy?: number;
  /**
   * Visual shape for the node. Defaults to 'dot' (circle).
   * Supported: 'dot'|'circle', 'diamond', 'star', 'hexagon', 'box'|'square', 'triangle'.
   */
  shape?: ForceGraphNodeShape;
};

export type ForceGraphEdge = {
  /** Source node id. */
  source: string;
  /** Target node id. */
  target: string;
  /** Optional relation label, surfaced in the tooltip on hover/focus. */
  relation?: string;
  /**
   * When true the link renders as a dashed/faded "weak" link. Lets callers
   * map a confidence dimension onto link strength without extra props.
   * Equivalent to `dash: "dashed"` plus a faded stroke (kept for back-compat).
   */
  weak?: boolean;
  /**
   * Typed dash pattern for the stroke. Independent of `weak`.
   * "solid" = none, "dashed" = "6 4", "dotted" = "1 4", "long-dash" = "12 6".
   * When omitted, falls back to the `weak` styling.
   */
  dash?: ForceGraphEdgeDash;
  /**
   * Emphasise the edge (e.g. a reconciliation/match relation) with a thicker,
   * fully-opaque stroke. Defaults to false.
   */
  emphasis?: boolean;
  /** Explicit stroke width override in px. Takes precedence over `emphasis`. */
  width?: number;
};

export type ForceGraphLegendEntry = {
  /** Label shown in the legend. */
  label: string;
  /** Shape for this entry (node legend). Absent = line-style legend entry. */
  shape?: ForceGraphNodeShape;
  /** Tone for this entry. Defaults to category1. */
  tone?: ForceGraphTone;
  /** When true, renders as a dashed line (edge legend). */
  weak?: boolean;
  /**
   * Typed dash pattern for an edge legend swatch. Independent of `weak`.
   * When set, the swatch line uses the matching dash-array.
   */
  dash?: ForceGraphEdgeDash;
};

export type ForceGraphProps = {
  nodes: ForceGraphNode[];
  edges: ForceGraphEdge[];
  label?: string;
  width?: number;
  height?: number;
  nodeRadius?: number;
  showLabels?: boolean;
  iterations?: number;
  selectedIds?: string[];
  focusId?: string | null;
  legend?: ForceGraphLegendEntry[];
  edgeCurve?: number;
  /**
   * Repulsion multiplier controlling how spread out the layout is.
   * >1 = graphe plus aéré, <1 = plus compact. Defaults to 1, clamped to
   * [0.1, 10] internally. Does not affect the fit-to-content framing.
   */
  repulsion?: number;
  onSelect?: (id: string) => void;
  onOpenEntity?: (id: string) => void;
  onEdgeHover?: (edge: ForceGraphEdge) => void;
  /**
   * Called when the user hovers (or keyboard-focuses) a node, and again with
   * null when the hover/focus ends. Intended for syncing an external panel.
   */
  onNodeHover?: (node: ForceGraphNode | null) => void;
  /**
   * Reconciliation merge animation (CLIENT-ONLY — driven by a `watch`, which
   * never runs during SSR, so no merge is animated or resolved server-side).
   *
   * Pass a `{ id, from, into }` where both `from` and `into` exist in `nodes`:
   * the `from` node animates toward the position of `into` while fading out (the
   * node and its incident edges), then `onMergeComplete(pair)` fires exactly
   * ONCE for that `id`. Purely visual — the component never mutates the data;
   * the consumer removes `from` from `nodes` after the callback.
   *
   * Idempotent on `id`: re-passing the SAME `id` (even with a new identity for
   * the object) is a no-op — the animation/callback are not replayed. Passing a
   * NEW `id` (re)plays the merge, even for the same `from`/`into` pair. After
   * completion the `from` node stays MASKED (hidden) until the consumer removes
   * it or a new `mergePair` is supplied, so it does not flash back when the prop
   * returns to null. Pass null (the default) for no merge in flight.
   */
  mergePair?: { id: string; from: string; into: string } | null;
  /**
   * Fired once the merge animation for the current `mergePair` completes (or
   * immediately, on a microtask, under reduced motion). Fires at most ONCE per
   * `id`. Receives the same pair so the consumer can drop `from` from the data.
   */
  onMergeComplete?: (pair: { id: string; from: string; into: string }) => void;
  class?: string;
};

export function edgeDashArray(dash: ForceGraphEdgeDash | undefined, weak?: boolean): string | null {
  const effective: ForceGraphEdgeDash | undefined = dash ?? (weak ? "dashed" : undefined);
  switch (effective) {
    case "dashed":
      return "6 4";
    case "dotted":
      return "1 4";
    case "long-dash":
      return "12 6";
    case "solid":
    default:
      return null;
  }
}

const STAR_INNER_RATIO = 0.42;
const STAR_AREA_FACTOR = 1.5953498885642274;

function fmt(n: number): string {
  const value = Math.abs(n) < 1e-9 ? 0 : n;
  return Number(value.toFixed(4)).toString();
}

export function nodeShapePath(shape: ForceGraphNodeShape | undefined, r: number): string | null {
  const s = shape ?? "dot";
  if (s === "dot" || s === "circle") return null;
  if (s === "diamond") {
    const d = Math.sqrt(Math.PI / 2) * r;
    return `M 0 ${fmt(-d)} L ${fmt(d)} 0 L 0 ${fmt(d)} L ${fmt(-d)} 0 Z`;
  }
  if (s === "star") {
    const outer = STAR_AREA_FACTOR * r;
    const inner = outer * STAR_INNER_RATIO;
    const points: string[] = [];
    for (let i = 0; i < 10; i += 1) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const radius = i % 2 === 0 ? outer : inner;
      points.push(`${fmt(radius * Math.cos(angle))},${fmt(radius * Math.sin(angle))}`);
    }
    return `M ${points.join(" L ")} Z`;
  }
  if (s === "hexagon") {
    const d = Math.sqrt(Math.PI / (3 * Math.sqrt(3) / 2)) * r;
    const points = Array.from({ length: 6 }, (_value, i) => {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      return `${fmt(d * Math.cos(angle))},${fmt(d * Math.sin(angle))}`;
    });
    return `M ${points.join(" L ")} Z`;
  }
  if (s === "triangle") {
    const d = Math.sqrt(Math.PI / (3 * Math.sqrt(3) / 4)) * r;
    return `M 0 ${fmt(-d)} L ${fmt(d * Math.sin(Math.PI / 3))} ${fmt(d / 2)} L ${fmt(-d * Math.sin(Math.PI / 3))} ${fmt(d / 2)} Z`;
  }
  const half = (Math.sqrt(Math.PI) / 2) * r;
  if (s === "roundedbox") {
    const radius = Math.min(half * 0.35, 6);
    return `M ${fmt(-half + radius)} ${fmt(-half)} H ${fmt(half - radius)} Q ${fmt(half)} ${fmt(-half)} ${fmt(half)} ${fmt(-half + radius)} V ${fmt(half - radius)} Q ${fmt(half)} ${fmt(half)} ${fmt(half - radius)} ${fmt(half)} H ${fmt(-half + radius)} Q ${fmt(-half)} ${fmt(half)} ${fmt(-half)} ${fmt(half - radius)} V ${fmt(-half + radius)} Q ${fmt(-half)} ${fmt(-half)} ${fmt(-half + radius)} ${fmt(-half)} Z`;
  }
  return `M ${fmt(-half)} ${fmt(-half)} H ${fmt(half)} V ${fmt(half)} H ${fmt(-half)} Z`;
}

@Component({
  selector: "st-force-graph",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ForceGraph {
  static readonly stComponentName = "ForceGraph";
  readonly componentName = "ForceGraph";
  @NgInput() nodes!: ForceGraphNode[];
  @NgInput() edges!: ForceGraphEdge[];
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() nodeRadius?: number;
  @NgInput() showLabels?: boolean;
  @NgInput() iterations?: number;
  @NgInput() selectedIds?: string[];
  @NgInput() focusId?: string | null;
  @NgInput() legend?: ForceGraphLegendEntry[];
  @NgInput() edgeCurve?: number;
  @NgInput() repulsion?: number;
  @NgInput() onSelect?: (id: string) => void;
  @NgInput() onOpenEntity?: (id: string) => void;
  @NgInput() onEdgeHover?: (edge: ForceGraphEdge) => void;
  @NgInput() onNodeHover?: (node: ForceGraphNode | null) => void;
  @NgInput() mergePair?: { id: string; from: string; into: string } | null;
  @NgInput() onMergeComplete?: (pair: { id: string; from: string; into: string }) => void;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-forceGraph", this.classInput].filter(Boolean).join(" ");
  }
}

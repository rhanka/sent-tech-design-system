import type { ForceGraphNode, ForceGraphEdge, ForceGraphLegendEntry } from "@sentropic/graph/presentation";
export type ForceGraphProps = {
  nodes: ForceGraphNode[];
  edges: ForceGraphEdge[];
  label: string;
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
  /** Accessible label for the "reset view" button (i18n). */
  resetViewLabel?: string;
  legendLabel?: string;
  class?: string;
};


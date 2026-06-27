import { Component, Input as NgInput } from "@angular/core";
import type { OnChanges, OnInit, SimpleChanges } from "@angular/core";

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

// ---------------------------------------------------------------------------
// Lightweight force simulation (ported from Svelte reference, no external dep)
// ---------------------------------------------------------------------------
type SimNode = { id: string; x: number; y: number; vx: number; vy: number; fixed: boolean };

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stableSeed(ns: ForceGraphNode[]): number {
  const ids = ns.map((n) => n.id).sort();
  let h = 0x811c9dc5;
  const joined = ids.join("|");
  for (let i = 0; i < joined.length; i++) {
    h ^= joined.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= ns.length;
  return h >>> 0;
}

function runSimulation(
  ns: ForceGraphNode[], es: ForceGraphEdge[],
  w: number, h: number, ticks: number, repulsionFactor: number, nr: number
): Map<string, { x: number; y: number }> {
  const cx = w / 2, cy = h / 2;
  const rand = mulberry32(stableSeed(ns));
  const idIndex = new Map<string, number>();
  const nodeRadius = nr; // base radius for the soft clamp (mirrors Svelte ref)
  const sim: SimNode[] = ns.map((n, i) => {
    idIndex.set(n.id, i);
    const fixed = typeof n.fx === "number" && typeof n.fy === "number";
    const angle = (i / Math.max(ns.length, 1)) * Math.PI * 2;
    const r = Math.min(w, h) * 0.3 * (0.5 + rand() * 0.5);
    return { id: n.id, x: fixed ? (n.fx as number) : cx + Math.cos(angle) * r, y: fixed ? (n.fy as number) : cy + Math.sin(angle) * r, vx: 0, vy: 0, fixed };
  });
  const links = es.map((e) => ({ s: idIndex.get(e.source), t: idIndex.get(e.target) })).filter((l): l is { s: number; t: number } => l.s !== undefined && l.t !== undefined);
  const area = w * h;
  const k = Math.sqrt(area / Math.max(ns.length, 1));
  const clampedRepulsion = Math.min(Math.max(repulsionFactor, 0.1), 10);
  const repulsion = k * k * 0.9 * clampedRepulsion;
  const restLength = k * 0.8;
  const springK = 0.04;
  const gravity = 0.012;
  const damping = 0.85;
  let temperature = Math.min(w, h) * 0.08;
  const cooling = ticks > 0 ? Math.pow(0.02, 1 / ticks) : 0.95;
  for (let step = 0; step < ticks; step++) {
    for (let i = 0; i < sim.length; i++) {
      for (let j = i + 1; j < sim.length; j++) {
        let dx = sim[i].x - sim[j].x, dy = sim[i].y - sim[j].y;
        let dist2 = dx * dx + dy * dy;
        if (dist2 < 0.01) { dx = (rand() - 0.5) * 0.1; dy = (rand() - 0.5) * 0.1; dist2 = dx * dx + dy * dy + 0.01; }
        const dist = Math.sqrt(dist2);
        const force = repulsion / dist2;
        const fx = (dx / dist) * force, fy = (dy / dist) * force;
        sim[i].vx += fx; sim[i].vy += fy; sim[j].vx -= fx; sim[j].vy -= fy;
      }
    }
    for (const l of links) {
      const a = sim[l.s], b = sim[l.t];
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const force = (dist - restLength) * springK;
      const fx = (dx / dist) * force, fy = (dy / dist) * force;
      a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
    }
    for (const node of sim) {
      if (node.fixed) { node.vx = 0; node.vy = 0; continue; }
      node.vx += (cx - node.x) * gravity; node.vy += (cy - node.y) * gravity;
      node.vx *= damping; node.vy *= damping;
      const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
      if (speed > temperature) { node.vx = (node.vx / speed) * temperature; node.vy = (node.vy / speed) * temperature; }
      node.x += node.vx; node.y += node.vy;
      const padX = w * 0.5 + nodeRadius * 2, padY = h * 0.5 + nodeRadius * 2;
      node.x = Math.max(-padX, Math.min(w + padX, node.x));
      node.y = Math.max(-padY, Math.min(h + padY, node.y));
    }
    temperature *= cooling;
  }
  const out = new Map<string, { x: number; y: number }>();
  for (const node of sim) out.set(node.id, { x: node.x, y: node.y });
  return out;
}

const FG_TONES: ForceGraphTone[] = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
];

const FG_CONTENT_MARGIN = 0.08;
const FG_CURVE_FACTOR = 0.5;

type FGPositionedNode = {
  node: ForceGraphNode;
  i: number; x: number; y: number; r: number;
  tone: ForceGraphTone; title: string; shapePath: string | null;
};

type FGPositionedEdge = {
  edge: ForceGraphEdge; i: number;
  x1: number; y1: number; x2: number; y2: number;
  midX: number; midY: number; path: string | null;
  dashArray: string | null; strokeWidth: number | null;
  srcLabel: string; tgtLabel: string;
};

@Component({
  selector: "st-force-graph",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="img" [attr.aria-label]="label">
      <svg
        [attr.viewBox]="viewBox"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        focusable="false"
        aria-hidden="true"
        (pointermove)="handlePointerMove($event)"
        (pointerleave)="handlePointerLeave()"
      >
        <g class="st-forceGraph__edges">
          @for (e of fgEdges; track e.i) {
            @if (e.path) {
              <path
                [attr.class]="edgeClass(e)"
                [attr.d]="e.path"
                fill="none"
                [attr.stroke-dasharray]="e.dashArray"
                [attr.stroke-width]="e.strokeWidth"
                pointer-events="none"
              ></path>
            } @else {
              <line
                [attr.class]="edgeClass(e)"
                [attr.x1]="e.x1" [attr.y1]="e.y1"
                [attr.x2]="e.x2" [attr.y2]="e.y2"
                [attr.stroke-dasharray]="e.dashArray"
                [attr.stroke-width]="e.strokeWidth"
                pointer-events="none"
              ></line>
            }
          }
        </g>
        <g class="st-forceGraph__nodes">
          @for (p of fgNodes; track p.node.id) {
            <g
              [attr.class]="nodeClass(p)"
              [attr.transform]="'translate(' + p.x + ' ' + p.y + ')'"
              [attr.data-node-id]="p.node.id"
              (click)="handleNodeClick(p.node)"
            >
              @if (p.shapePath) {
                <path
                  class="st-forceGraph__shape st-forceGraph__dot"
                  [attr.d]="p.shapePath"
                ></path>
              } @else {
                <circle
                  class="st-forceGraph__dot"
                  [attr.r]="p.r"
                ></circle>
              }
              @if (showLabelsValue) {
                <text class="st-forceGraph__label" [attr.x]="p.r + 3" y="0" dominant-baseline="middle">{{ p.title }}</text>
              }
            </g>
          }
        </g>
      </svg>

      @if (legend && legend.length > 0) {
        <div class="st-forceGraph__legend" [attr.aria-label]="legendLabelValue">
          @for (entry of legend; track $index) {
            <div class="st-forceGraph__legendEntry">
              @if (entry.shape !== undefined) {
                <svg class="st-forceGraph__legendSwatch" viewBox="-13 -13 26 26" width="16" height="16" aria-hidden="true">
                  @if (lgShapePath(entry)) {
                    <path [attr.d]="lgShapePath(entry)" [attr.class]="'st-forceGraph__legendShape st-forceGraph__legendShape--' + (entry.tone ?? 'category1')"></path>
                  } @else {
                    <circle r="7" [attr.class]="'st-forceGraph__legendShape st-forceGraph__legendShape--' + (entry.tone ?? 'category1')"></circle>
                  }
                </svg>
              } @else {
                <svg class="st-forceGraph__legendSwatch" viewBox="0 0 16 8" width="16" height="8" aria-hidden="true">
                  <line
                    x1="0" y1="4" x2="16" y2="4"
                    [attr.class]="'st-forceGraph__legendEdge' + (entry.weak ? ' st-forceGraph__legendEdge--weak' : '')"
                    [attr.stroke-dasharray]="lgDashArray(entry)"
                  ></line>
                </svg>
              }
              <span class="st-forceGraph__legendLabel">{{ entry.label }}</span>
            </div>
          }
        </div>
      }

      @if (hoveredIdx !== null && fgNodes[hoveredIdx]) {
        <div class="st-forceGraph__tooltip" role="presentation"
          [style.left]="tooltipLeft + '%'"
          [style.top]="tooltipTop + '%'"
        >
          <span class="st-forceGraph__tooltipLabel">{{ fgNodes[hoveredIdx].title }}</span>
        </div>
      }
    </div>
  `,
})
export class ForceGraph implements OnChanges, OnInit {
  static readonly stComponentName = "ForceGraph";
  readonly componentName = "ForceGraph";

  @NgInput() nodes: ForceGraphNode[] = [];
  @NgInput() edges: ForceGraphEdge[] = [];
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
  @NgInput() legendLabel?: string;
  @NgInput() onSelect?: (id: string) => void;
  @NgInput() onOpenEntity?: (id: string) => void;
  @NgInput() onEdgeHover?: (edge: ForceGraphEdge) => void;
  @NgInput() onNodeHover?: (node: ForceGraphNode | null) => void;
  @NgInput() mergePair?: { id: string; from: string; into: string } | null;
  @NgInput() onMergeComplete?: (pair: { id: string; from: string; into: string }) => void;
  @NgInput("class") classInput?: string;

  hoveredIdx: number | null = null;
  fgNodes: FGPositionedNode[] = [];
  fgEdges: FGPositionedEdge[] = [];
  private _cb = { x: 0, y: 0, w: 480, h: 360 };
  // Selection/focus + adjacency precomputed in _layout for deterministic
  // dim/selected/focus classes (mirror the Svelte/React reference).
  private _selectedSet = new Set<string>();
  private _focusValue: string | null = null;
  private _adjacency = new Map<string, Set<string>>();
  private _activeAndNeighbours = new Set<string>();

  get showLabelsValue(): boolean { return this.showLabels ?? true; }
  get legendLabelValue(): string { return this.legendLabel ?? "Graph legend"; }

  ngOnInit(): void { this._layout(); }
  ngOnChanges(_c: SimpleChanges): void { this._layout(); }

  private _layout(): void {
    const w = this.width ?? 480, h = this.height ?? 360;
    const nr = this.nodeRadius ?? 7;
    const iter = Math.max(1, Math.round(this.iterations ?? 300));
    const layout = runSimulation(this.nodes, this.edges, w, h, iter, this.repulsion ?? 1, nr);

    const toneMap = new Map<string, ForceGraphTone>();
    const groupTones = new Map<string | number, ForceGraphTone>();
    let gi = 0, ai = 0;
    for (const n of this.nodes) {
      if (n.tone) { toneMap.set(n.id, n.tone); continue; }
      if (n.group !== undefined) {
        if (!groupTones.has(n.group)) groupTones.set(n.group, FG_TONES[gi++ % 8]);
        toneMap.set(n.id, groupTones.get(n.group)!);
      }
    }
    for (const n of this.nodes) {
      if (!toneMap.has(n.id)) toneMap.set(n.id, FG_TONES[ai++ % 8]);
    }

    this.fgNodes = this.nodes.map((n, i) => {
      const p = layout.get(n.id) ?? { x: w / 2, y: h / 2 };
      const r = nr * Math.sqrt(Math.max(n.weight ?? 1, 0.25));
      return { node: n, i, x: p.x, y: p.y, r, tone: toneMap.get(n.id) ?? "category1", title: n.label ?? n.id, shapePath: nodeShapePath(n.shape, r) };
    });

    if (this.fgNodes.length > 0) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const p of this.fgNodes) {
        const e = p.r * 1.7;
        x0 = Math.min(x0, p.x - e); y0 = Math.min(y0, p.y - e);
        x1 = Math.max(x1, p.x + e); y1 = Math.max(y1, p.y + e);
      }
      let bw = x1 - x0, bh = y1 - y0;
      if (!(bw > 0)) { bw = w; x0 = x1 - bw / 2; }
      if (!(bh > 0)) { bh = h; y0 = y1 - bh / 2; }
      const mx = bw * FG_CONTENT_MARGIN, my = bh * FG_CONTENT_MARGIN;
      this._cb = { x: x0 - mx, y: y0 - my, w: bw + 2 * mx, h: bh + 2 * my };
    } else {
      this._cb = { x: 0, y: 0, w, h };
    }

    // Selection/focus + adjacency (used by node/edge dim classes).
    this._selectedSet = new Set(this.selectedIds ?? []);
    this._focusValue = this.focusId ?? null;
    const adj = new Map<string, Set<string>>();
    const addAdj = (a: string, b: string) => {
      let set = adj.get(a);
      if (!set) { set = new Set(); adj.set(a, set); }
      set.add(b);
    };
    for (const e of this.edges) { addAdj(e.source, e.target); addAdj(e.target, e.source); }
    this._adjacency = adj;
    const active = new Set<string>(this._selectedSet);
    if (this._focusValue != null) active.add(this._focusValue);
    const withNeighbours = new Set<string>(active);
    for (const id of active) {
      const nb = adj.get(id);
      if (nb) for (const n of nb) withNeighbours.add(n);
    }
    this._activeAndNeighbours = withNeighbours;

    const curve = Math.max(0, this.edgeCurve ?? 0.15);
    const nById = new Map(this.nodes.map((n) => [n.id, n]));
    this.fgEdges = this.edges.map((e, i) => {
      const a = layout.get(e.source), b = layout.get(e.target);
      if (!a || !b) return null;
      let path: string | null = null;
      let cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
      if (curve > 0) {
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        const off = curve * dist * FG_CURVE_FACTOR;
        cx = (a.x + b.x) / 2 + (-dy / dist) * off;
        cy = (a.y + b.y) / 2 + (dx / dist) * off;
        path = `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
      }
      return { edge: e, i, x1: a.x, y1: a.y, x2: b.x, y2: b.y, midX: cx, midY: cy, path, dashArray: edgeDashArray(e.dash, e.weak), strokeWidth: typeof e.width === "number" ? e.width : e.emphasis ? 2.5 : null, srcLabel: nById.get(e.source)?.label ?? e.source, tgtLabel: nById.get(e.target)?.label ?? e.target };
    }).filter((e): e is FGPositionedEdge => e !== null);
  }

  get viewBox(): string { return `${this._cb.x} ${this._cb.y} ${this._cb.w} ${this._cb.h}`; }
  get hostClass(): string { return classNames("st-forceGraph", this.classInput); }

  get tooltipLeft(): number {
    const p = this.hoveredIdx !== null ? this.fgNodes[this.hoveredIdx] : null;
    return p ? ((p.x - this._cb.x) / this._cb.w) * 100 : 0;
  }
  get tooltipTop(): number {
    const p = this.hoveredIdx !== null ? this.fgNodes[this.hoveredIdx] : null;
    return p ? ((p.y - this._cb.y) / this._cb.h) * 100 : 0;
  }

  nodeClass(p: FGPositionedNode): string {
    const id = p.node.id;
    const hoveredId =
      this.hoveredIdx !== null ? this.fgNodes[this.hoveredIdx]?.node.id ?? null : null;
    const hasSelection = this._selectedSet.size > 0 || this._focusValue != null;
    const selectionDim = hasSelection && !this._activeAndNeighbours.has(id);
    const hoverDim =
      hoveredId != null && id !== hoveredId && !(this._adjacency.get(hoveredId)?.has(id) ?? false);
    return classNames(
      "st-forceGraph__node",
      // Tone class carries the node fill colour (.st-forceGraph__node--catN .st-forceGraph__dot).
      `st-forceGraph__node--${p.tone}`,
      (selectionDim || hoverDim) && "st-forceGraph__node--dim",
      this._selectedSet.has(id) && "st-forceGraph__node--selected",
      this._focusValue === id && "st-forceGraph__node--focus",
    );
  }
  edgeClass(e: FGPositionedEdge): string {
    const hasSelection = this._selectedSet.size > 0 || this._focusValue != null;
    const srcActive = this._selectedSet.has(e.edge.source) || this._focusValue === e.edge.source;
    const tgtActive = this._selectedSet.has(e.edge.target) || this._focusValue === e.edge.target;
    const dim = hasSelection && !(srcActive || tgtActive);
    return classNames(
      "st-forceGraph__edge",
      e.edge.weak && "st-forceGraph__edge--weak",
      e.edge.emphasis && "st-forceGraph__edge--emphasis",
      dim && "st-forceGraph__edge--dim",
    );
  }
  lgShapePath(entry: ForceGraphLegendEntry): string | null { return nodeShapePath(entry.shape, 7); }
  lgDashArray(entry: ForceGraphLegendEntry): string | null { return edgeDashArray(entry.dash, entry.weak); }
  handleNodeClick(node: ForceGraphNode): void { this.onSelect?.(node.id); }
  handlePointerMove(event: PointerEvent): void {
    const nodeId = (event.target as Element | null)?.closest("[data-node-id]")?.getAttribute("data-node-id");
    const idx = nodeId ? this.fgNodes.findIndex((p) => p.node.id === nodeId) : -1;
    this.hoveredIdx = idx >= 0 ? idx : null;
    this.onNodeHover?.(idx >= 0 ? this.fgNodes[idx].node : null);
  }
  handlePointerLeave(): void { this.hoveredIdx = null; this.onNodeHover?.(null); }
}

<script lang="ts" module>
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

  /**
   * Maps a dash style (or the legacy `weak` flag) to an SVG stroke-dasharray.
   * Returns null for a solid stroke.
   */
  export function edgeDashArray(
    dash: ForceGraphEdgeDash | undefined,
    weak?: boolean
  ): string | null {
    const effective: ForceGraphEdgeDash | undefined =
      dash ?? (weak ? "dashed" : undefined);
    switch (effective) {
      case "dashed": return "6 4";
      case "dotted": return "1 4";
      case "long-dash": return "12 6";
      case "solid":
      default: return null;
    }
  }

  // ---------------------------------------------------------------------------
  // SVG path helpers for the various node shapes.
  // All shapes are centered at (0,0). Each shape is scaled so its filled area
  // matches that of the reference circle (π·r²) — this keeps equal-weight nodes
  // visually balanced rather than letting squares/diamonds read as "bigger".
  //
  // Per-shape scale factors (closed-form, area = π·r²):
  //   square / roundedbox : half-side  = (√π)/2 · r        ≈ 0.8862·r
  //   diamond             : half-diag   = √(π/2) · r        ≈ 1.2533·r
  //   triangle (equilat.) : circumradius= √(π/(3√3/4)) · r  ≈ 1.5551·r
  //   hexagon (regular)   : circumradius= √(π/(3√3/2)) · r  ≈ 1.0996·r
  //   star (5-pt, k=0.42) : outer radius= √(π/A₁) · r       ≈ 1.5953·r
  //                          where A₁ is the unit-star area (≈1.2343).
  // ---------------------------------------------------------------------------
  const STAR_INNER_RATIO = 0.42;
  const STAR_AREA_FACTOR = 1.5953498885642274; // √(π / unit-star-area)

  // Format a coordinate: 4 dp, snapping floating-point near-zero (e.g. 9e-16)
  // to a clean 0 so paths never contain scientific notation.
  function fmt(n: number): string {
    const v = Math.abs(n) < 1e-9 ? 0 : n;
    return Number(v.toFixed(4)).toString();
  }

  export function nodeShapePath(shape: ForceGraphNodeShape | undefined, r: number): string | null {
    const s = shape ?? "dot";
    if (s === "dot" || s === "circle") return null; // use <circle>
    if (s === "diamond") {
      const d = Math.sqrt(Math.PI / 2) * r; // half-diagonal
      return `M 0 ${fmt(-d)} L ${fmt(d)} 0 L 0 ${fmt(d)} L ${fmt(-d)} 0 Z`;
    }
    if (s === "star") {
      const outer = STAR_AREA_FACTOR * r;
      const inner = outer * STAR_INNER_RATIO;
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const rad = i % 2 === 0 ? outer : inner;
        pts.push(`${fmt(rad * Math.cos(angle))},${fmt(rad * Math.sin(angle))}`);
      }
      return `M ${pts.join(" L ")} Z`;
    }
    if (s === "hexagon") {
      const R = Math.sqrt(Math.PI / ((3 * Math.sqrt(3)) / 2)) * r; // circumradius
      const pts: string[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 - Math.PI / 6;
        pts.push(`${fmt(R * Math.cos(angle))},${fmt(R * Math.sin(angle))}`);
      }
      return `M ${pts.join(" L ")} Z`;
    }
    if (s === "box" || s === "square") {
      const h = (Math.sqrt(Math.PI) / 2) * r; // half-side, area = (2h)² = π·r²
      return `M ${fmt(-h)} ${fmt(-h)} L ${fmt(h)} ${fmt(-h)} L ${fmt(h)} ${fmt(h)} L ${fmt(-h)} ${fmt(h)} Z`;
    }
    if (s === "roundedbox") {
      const h = (Math.sqrt(Math.PI) / 2) * r; // same footprint as square
      const rx = h * 0.6; // ≈ r·0.3 rounding radius (h ≈ 0.886·r)
      // Rounded rectangle via arcs, clockwise from top edge.
      return (
        `M ${fmt(-h + rx)} ${fmt(-h)} ` +
        `L ${fmt(h - rx)} ${fmt(-h)} A ${fmt(rx)} ${fmt(rx)} 0 0 1 ${fmt(h)} ${fmt(-h + rx)} ` +
        `L ${fmt(h)} ${fmt(h - rx)} A ${fmt(rx)} ${fmt(rx)} 0 0 1 ${fmt(h - rx)} ${fmt(h)} ` +
        `L ${fmt(-h + rx)} ${fmt(h)} A ${fmt(rx)} ${fmt(rx)} 0 0 1 ${fmt(-h)} ${fmt(h - rx)} ` +
        `L ${fmt(-h)} ${fmt(-h + rx)} A ${fmt(rx)} ${fmt(rx)} 0 0 1 ${fmt(-h + rx)} ${fmt(-h)} Z`
      );
    }
    if (s === "triangle") {
      // Equilateral, centred at centroid; circumradius h so apex is up.
      const h = Math.sqrt(Math.PI / ((3 * Math.sqrt(3)) / 4)) * r;
      const pts: string[] = [];
      for (let i = 0; i < 3; i++) {
        const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
        pts.push(`${fmt(h * Math.cos(angle))},${fmt(h * Math.sin(angle))}`);
      }
      return `M ${pts.join(" L ")} Z`;
    }
    return null;
  }
</script>

<script lang="ts">
  type ForceGraphProps = {
    nodes: ForceGraphNode[];
    edges: ForceGraphEdge[];
    /** Accessible name for the figure (required). */
    label: string;
    width?: number;
    height?: number;
    /** Base node radius in px (scaled by node.weight). */
    nodeRadius?: number;
    /** Show text labels next to nodes. */
    showLabels?: boolean;
    /**
     * Number of cooling ticks. The simulation runs a synchronous warmup then
     * animates the remainder unless reduced motion is requested.
     */
    iterations?: number;
    /**
     * IDs of currently selected nodes. Highlighted visually without
     * re-running the layout. Defaults to [].
     */
    selectedIds?: string[];
    /**
     * ID of the node to focus/centre visually (ring highlight). Does not
     * re-run the layout. Defaults to null.
     */
    focusId?: string | null;
    /**
     * Called when the user clicks (or presses Space/Enter) a node.
     * Fires with the node's stable id.
     */
    onSelect?: (id: string) => void;
    /**
     * Called when the user activates a node (double-click or Enter key while
     * keyboard-focused). Intended to open a detail panel.
     * Fires with the node's stable id.
     */
    onOpenEntity?: (id: string) => void;
    /**
     * Called when the user hovers an edge.
     * Fires with the edge object (source/target/relation/weak).
     */
    onEdgeHover?: (edge: ForceGraphEdge) => void;
    /**
     * Legend entries rendered as a corner overlay.
     * Each entry has a label + optional shape (node) or weak (edge).
     */
    legend?: ForceGraphLegendEntry[];
    /**
     * Edge curvature, 0..1. 0 = straight <line> (back-compat). Larger values
     * bow each edge into a quadratic <path>, offset perpendicular to the chord
     * by `edgeCurve * dist * factor`. Defaults to a light 0.15.
     */
    edgeCurve?: number;
    /**
     * Repulsion multiplier controlling how spread out the layout is.
     * >1 = graphe plus aéré, <1 = plus compact ; multiplie la force de
     * répulsion sans toucher au fit-to-content. Defaults to 1. Clamped to
     * [0.1, 10] internally to avoid layout explosions/collapses.
     */
    repulsion?: number;
    /**
     * Called when the user hovers (or keyboard-focuses) a node, and again with
     * null when the hover/focus ends. Intended for syncing an external panel.
     */
    onNodeHover?: (node: ForceGraphNode | null) => void;
    /**
     * Reconciliation merge animation (CLIENT-ONLY — driven by `$effect`, which
     * never runs during SSR, so no merge is animated or resolved server-side).
     *
     * Pass a `{ id, from, into }` where both `from` and `into` exist in `nodes`:
     * the `from` node animates toward the position of `into` while fading out
     * (the node and its incident edges), then `onMergeComplete(pair)` fires
     * exactly ONCE for that `id`. Purely visual — the component never mutates the
     * data; the consumer removes `from` from `nodes` after the callback.
     *
     * Idempotent on `id`: re-passing the SAME `id` (even with a new identity for
     * the object) is a no-op — the animation/callback are not replayed. Passing a
     * NEW `id` (re)plays the merge, even for the same `from`/`into` pair. After
     * completion the `from` node stays MASKED (hidden) until the consumer removes
     * it or a new `mergePair` is supplied, so it does not flash back when the
     * prop returns to null. Pass null (the default) for no merge in flight.
     */
    mergePair?: { id: string; from: string; into: string } | null;
    /**
     * Fired once the merge animation for the current `mergePair` completes (or
     * immediately, on a microtask, under reduced motion). Fires at most ONCE per
     * `id`. Receives the same pair so the consumer can drop `from` from the data.
     */
    onMergeComplete?: (pair: { id: string; from: string; into: string }) => void;
    /** Accessible label for the reset-view button (shown when zoomed/panned). */
    resetViewLabel?: string;
    /** Accessible label for the legend overlay. */
    legendLabel?: string;
    class?: string;
  };

  let {
    nodes,
    edges,
    label,
    width = 480,
    height = 360,
    nodeRadius = 7,
    showLabels = true,
    iterations = 300,
    selectedIds = [],
    focusId = null,
    onSelect,
    onOpenEntity,
    onEdgeHover,
    legend,
    edgeCurve = 0.15,
    repulsion = 1,
    onNodeHover,
    mergePair = null,
    onMergeComplete,
    resetViewLabel = "Reset view",
    legendLabel = "Graph legend",
    class: className
  }: ForceGraphProps = $props();

  const TONES: ForceGraphTone[] = [
    "category1", "category2", "category3", "category4",
    "category5", "category6", "category7", "category8"
  ];

  // ---------------------------------------------------------------------------
  // Tone assignment: explicit tone wins, else stable per-group, else per-index.
  // ---------------------------------------------------------------------------
  function buildToneMap(ns: ForceGraphNode[]): Map<string, ForceGraphTone> {
    const groups: (string | number)[] = [];
    const seen = new Set<string | number>();
    for (const n of ns) {
      if (n.group === undefined) continue;
      if (seen.has(n.group)) continue;
      seen.add(n.group);
      groups.push(n.group);
    }
    const groupTone = new Map<string | number, ForceGraphTone>();
    groups.forEach((g, i) => groupTone.set(g, TONES[i % TONES.length]));
    const map = new Map<string, ForceGraphTone>();
    ns.forEach((n, i) => {
      if (n.tone) map.set(n.id, n.tone);
      else if (n.group !== undefined && groupTone.has(n.group)) map.set(n.id, groupTone.get(n.group)!);
      else map.set(n.id, TONES[i % TONES.length]);
    });
    return map;
  }

  // ---------------------------------------------------------------------------
  // Lightweight force simulation (no external dependency).
  //   - repulsion (Coulomb-like, O(n^2), fine for ontology-scale graphs)
  //   - spring links (Hooke toward a rest length)
  //   - mild gravity toward the centre to keep disconnected nodes on-canvas
  // A deterministic seeded layout keeps SSR / tests stable.
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

  // Stable seed from the SET of node ids (sorted), not from ns.length/es.length.
  // A length-based seed reshuffled the whole layout whenever a node was added or
  // removed (notably after a reconciliation merge), making the graph "jump". A
  // hash over the sorted ids keeps the same topology → same layout, so removing
  // one node leaves the rest essentially in place. (FNV-1a 32-bit over the joined
  // sorted ids; deterministic and order-independent.)
  function stableSeed(ns: ForceGraphNode[]): number {
    const ids = ns.map((n) => n.id).sort();
    let h = 0x811c9dc5; // FNV offset basis
    const joined = ids.join("|");
    for (let i = 0; i < joined.length; i++) {
      h ^= joined.charCodeAt(i);
      h = Math.imul(h, 0x01000193); // FNV prime
    }
    // Fold in the count too so wholly different graphs of equal id-hash still
    // differ, but the dominant term is the (order-independent) id hash.
    h ^= ns.length;
    return h >>> 0;
  }

  function runSimulation(
    ns: ForceGraphNode[],
    es: ForceGraphEdge[],
    w: number,
    h: number,
    ticks: number,
    repulsionFactor: number
  ): Map<string, { x: number; y: number }> {
    const cx = w / 2;
    const cy = h / 2;
    // Seed from the stable id-set hash so adding/removing a node does not
    // reshuffle the whole layout (same topology → same layout).
    const rand = mulberry32(stableSeed(ns));
    const idIndex = new Map<string, number>();
    const sim: SimNode[] = ns.map((n, i) => {
      idIndex.set(n.id, i);
      const fixed = typeof n.fx === "number" && typeof n.fy === "number";
      // Seed on a loose ring so the first ticks fan the graph out predictably.
      const angle = (i / Math.max(ns.length, 1)) * Math.PI * 2;
      const r = Math.min(w, h) * 0.3 * (0.5 + rand() * 0.5);
      return {
        id: n.id,
        x: fixed ? (n.fx as number) : cx + Math.cos(angle) * r,
        y: fixed ? (n.fy as number) : cy + Math.sin(angle) * r,
        vx: 0,
        vy: 0,
        fixed
      };
    });

    const links = es
      .map((e) => ({ s: idIndex.get(e.source), t: idIndex.get(e.target) }))
      .filter((l): l is { s: number; t: number } => l.s !== undefined && l.t !== undefined);

    const area = w * h;
    const k = Math.sqrt(area / Math.max(ns.length, 1)); // ideal node distance
    // Clamp the caller-supplied factor so extreme values can't explode or
    // collapse the layout. >1 spreads nodes out, <1 packs them tighter; the
    // fit-to-content viewBox is recomputed afterwards so spacing just fills space.
    const clampedRepulsion = Math.min(Math.max(repulsionFactor, 0.1), 10);
    const repulsion = k * k * 0.9 * clampedRepulsion;
    const restLength = k * 0.8;
    const springK = 0.04;
    const gravity = 0.012;
    const damping = 0.85;
    let temperature = Math.min(w, h) * 0.08;
    const cooling = ticks > 0 ? Math.pow(0.02, 1 / ticks) : 0.95;

    for (let step = 0; step < ticks; step++) {
      // Repulsion between all node pairs.
      for (let i = 0; i < sim.length; i++) {
        for (let j = i + 1; j < sim.length; j++) {
          let dx = sim[i].x - sim[j].x;
          let dy = sim[i].y - sim[j].y;
          let dist2 = dx * dx + dy * dy;
          if (dist2 < 0.01) {
            dx = (rand() - 0.5) * 0.1;
            dy = (rand() - 0.5) * 0.1;
            dist2 = dx * dx + dy * dy + 0.01;
          }
          const dist = Math.sqrt(dist2);
          const force = repulsion / dist2;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          sim[i].vx += fx; sim[i].vy += fy;
          sim[j].vx -= fx; sim[j].vy -= fy;
        }
      }
      // Spring attraction along links.
      for (const l of links) {
        const a = sim[l.s];
        const b = sim[l.t];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const force = (dist - restLength) * springK;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      }
      // Gravity toward centre + integrate with capped, cooling step.
      for (const node of sim) {
        if (node.fixed) { node.vx = 0; node.vy = 0; continue; }
        node.vx += (cx - node.x) * gravity;
        node.vy += (cy - node.y) * gravity;
        node.vx *= damping;
        node.vy *= damping;
        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (speed > temperature) {
          node.vx = (node.vx / speed) * temperature;
          node.vy = (node.vy / speed) * temperature;
        }
        node.x += node.vx;
        node.y += node.vy;
        // Soft clamp: allow the layout to overflow the canvas so it keeps a
        // natural shape (fit-to-content reframes it afterwards). The wide bound
        // only guards against runaway coordinates, it no longer glues nodes to
        // the four edges.
        const padX = w * 0.5 + nodeRadius * 2;
        const padY = h * 0.5 + nodeRadius * 2;
        node.x = Math.max(-padX, Math.min(w + padX, node.x));
        node.y = Math.max(-padY, Math.min(h + padY, node.y));
      }
      temperature *= cooling;
    }

    const out = new Map<string, { x: number; y: number }>();
    for (const node of sim) out.set(node.id, { x: node.x, y: node.y });
    return out;
  }

  // SSR-safe reduced-motion check (window may be undefined during SSR/tests).
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const toneMap = $derived(buildToneMap(nodes));

  // The whole layout is recomputed when inputs change. Under reduced motion we
  // settle the layout fully and never animate. Otherwise the same settled
  // layout is used as the rendered target — a static, deterministic frame —
  // which keeps the component framework-light and test-friendly while still
  // honouring the motion preference (no rAF loop, no jitter).
  const layout = $derived.by(() => {
    const ticks = Math.max(1, Math.round(iterations));
    return runSimulation(nodes, edges, width, height, ticks, repulsion);
  });

  const positionedNodes = $derived.by(() =>
    nodes.map((n, i) => {
      const p = layout.get(n.id) ?? { x: width / 2, y: height / 2 };
      const r = nodeRadius * Math.sqrt(Math.max(n.weight ?? 1, 0.25));
      const shapePath = nodeShapePath(n.shape, r);
      return {
        node: n,
        i,
        x: p.x,
        y: p.y,
        r,
        tone: toneMap.get(n.id) ?? "category1",
        title: n.label ?? n.id,
        shapePath
      };
    })
  );

  // Curvature offset factor: how far (relative to chord length) the control
  // point bows out at edgeCurve=1. Kept modest so edgeCurve≈0.15 reads "light".
  const CURVE_FACTOR = 0.5;

  // ---------------------------------------------------------------------------
  // Fit-to-content (Feature 5): after warmup the layout may extend beyond the
  // nominal width/height. Compute the real content bounding-box (node centres
  // ± radius) and frame it with an 8% margin on each side. The base viewBox is
  // this frame (not the fixed 0,0,w,h), so the graph is centred and never
  // clipped, whatever the aspect ratio. Zoom/pan stay relative to this frame.
  // ---------------------------------------------------------------------------
  const CONTENT_MARGIN = 0.08;
  const contentBox = $derived.by(() => {
    if (positionedNodes.length === 0) {
      return { x: 0, y: 0, w: width, h: height };
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of positionedNodes) {
      // Use the worst-case extent for non-circular shapes (area-scaled) so the
      // glyph (and a little label room) is never clipped.
      const ext = p.r * 1.7;
      minX = Math.min(minX, p.x - ext);
      minY = Math.min(minY, p.y - ext);
      maxX = Math.max(maxX, p.x + ext);
      maxY = Math.max(maxY, p.y + ext);
    }
    let w = maxX - minX;
    let h = maxY - minY;
    // Guard against a degenerate (single node / collinear) box.
    if (!(w > 0)) { w = width; minX = maxX - w / 2; }
    if (!(h > 0)) { h = height; minY = maxY - h / 2; }
    const mx = w * CONTENT_MARGIN;
    const my = h * CONTENT_MARGIN;
    return { x: minX - mx, y: minY - my, w: w + 2 * mx, h: h + 2 * my };
  });

  const positionedEdges = $derived.by(() => {
    const nodeById = new Map(nodes.map((n) => [n.id, n]));
    const curve = Math.max(0, edgeCurve ?? 0);
    return edges
      .map((e, i) => {
        const a = layout.get(e.source);
        const b = layout.get(e.target);
        if (!a || !b) return null;
        const srcNode = nodeById.get(e.source);
        const tgtNode = nodeById.get(e.target);
        const x1 = a.x, y1 = a.y, x2 = b.x, y2 = b.y;
        // Quadratic control point: midpoint pushed perpendicular to the chord.
        let path: string | null = null;
        let cx = (x1 + x2) / 2;
        let cy = (y1 + y2) / 2;
        if (curve > 0) {
          const dx = x2 - x1;
          const dy = y2 - y1;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
          const off = curve * dist * CURVE_FACTOR;
          // Unit perpendicular to the chord.
          const px = -dy / dist;
          const py = dx / dist;
          cx = (x1 + x2) / 2 + px * off;
          cy = (y1 + y2) / 2 + py * off;
          path = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
        }
        const dashArray = edgeDashArray(e.dash, e.weak);
        const strokeWidth =
          typeof e.width === "number" ? e.width : e.emphasis ? 2.5 : null;
        return {
          edge: e,
          i,
          x1, y1, x2, y2,
          // Tooltip / label anchor follows the curve apex when curved.
          midX: cx,
          midY: cy,
          path,
          dashArray,
          strokeWidth,
          srcLabel: srcNode?.label ?? e.source,
          tgtLabel: tgtNode?.label ?? e.target
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);
  });

  // ---------------------------------------------------------------------------
  // Merge animation (reconciliation): when `mergePair` becomes a new valid pair,
  // the `from` node slides toward `into` while fading out (node + incident
  // edges), then `onMergeComplete` fires. Purely visual — never mutates props.
  // Driven by a single $state holding per-merge progress (0→1). Under reduced
  // motion / SSR we skip straight to completion on a microtask.
  // ---------------------------------------------------------------------------
  const MERGE_DURATION_MS = 450;
  // ease-in-out (cubic) for a smooth glide.
  const easeInOut = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  type MergeState = {
    id: string;
    from: string;
    into: string;
    /** Animation progress, 0..1. */
    progress: number;
    /** Pixel delta from the `from` start position to `into`, captured at start. */
    dx: number;
    dy: number;
  } | null;

  let mergeState = $state<MergeState>(null);
  let mergeRaf: number | null = null;
  // The id currently being (or already) handled, so the $effect only reacts to a
  // genuinely NEW id. Re-passing the same id (even a fresh object) is a no-op.
  let handledMergeId: string | null = null;
  // The id of the `from` node to keep MASKED after a completed merge, until the
  // consumer drops it from `nodes` (or a new pair arrives). Decouples the mask
  // from `mergePair` returning to null (otherwise the node would flash back).
  let maskedFromId = $state<string | null>(null);
  // Set true on the component's own teardown so no queued microtask/frame fires a
  // callback or touches reactive state after unmount.
  let disposed = false;

  function cancelMergeRaf() {
    if (mergeRaf != null && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(mergeRaf);
    }
    mergeRaf = null;
  }

  // Component-lifetime teardown guard (separate from the per-pair effect below):
  // marks the instance disposed and cancels any in-flight frame on unmount.
  $effect(() => {
    return () => {
      disposed = true;
      cancelMergeRaf();
    };
  });

  $effect(() => {
    const pair = mergePair;
    const id = pair ? pair.id : null;

    // Idempotent on id: same id (or still null) means nothing to (re)start. A new
    // id always (re)plays, even for the same from/into pair.
    if (id === handledMergeId) return;
    handledMergeId = id;

    // Tear down any in-flight animation for a previous pair.
    cancelMergeRaf();
    mergeState = null;

    if (!pair) return;

    // A genuinely new pair supersedes any lingering mask from a prior merge.
    maskedFromId = null;

    // Validate: both endpoints must currently exist.
    const fromPos = layout.get(pair.from);
    const intoPos = layout.get(pair.into);
    if (!fromPos || !intoPos) return; // invalid pair: no-op, no crash, no callback

    const captured = { id: pair.id, from: pair.from, into: pair.into };

    const complete = () => {
      // Keep `from` hidden until the consumer removes it (or a new pair arrives).
      maskedFromId = captured.from;
      onMergeComplete?.(captured);
    };

    // Reduced motion: no animation, resolve on a microtask. Guarded so a late
    // microtask after unmount or after a newer id took over is a no-op.
    if (prefersReducedMotion || typeof requestAnimationFrame !== "function") {
      queueMicrotask(() => {
        if (disposed || handledMergeId !== id) return;
        complete();
      });
      return;
    }

    const dx = intoPos.x - fromPos.x;
    const dy = intoPos.y - fromPos.y;
    mergeState = { id: captured.id, from: captured.from, into: captured.into, progress: 0, dx, dy };

    // Anchor the clock to the FIRST frame's own timestamp. rAF timestamps and
    // performance.now() can use different time origins (notably under jsdom), so
    // mixing them yields a negative/garbage elapsed time. Using the frame clock
    // for both start and elapsed keeps the easing monotonic everywhere.
    let start: number | null = null;
    const tick = (now: number) => {
      // Bail cleanly if the instance went away or a newer id superseded us — no
      // callback, no dangling state.
      if (disposed || handledMergeId !== id) {
        mergeRaf = null;
        return;
      }
      // Re-validate both endpoints every frame: if either disappears mid-flight
      // (e.g. the consumer removed a node), cancel the glide WITHOUT firing
      // onMergeComplete (no double-tir) and without a dangling frame.
      if (!layout.has(captured.from) || !layout.has(captured.into)) {
        cancelMergeRaf();
        mergeState = null;
        return;
      }
      if (start === null) start = now;
      const t = Math.min(1, Math.max(0, (now - start) / MERGE_DURATION_MS));
      if (mergeState) mergeState = { ...mergeState, progress: t };
      if (t < 1) {
        mergeRaf = requestAnimationFrame(tick);
      } else {
        mergeRaf = null;
        mergeState = null;
        complete();
      }
    };
    mergeRaf = requestAnimationFrame(tick);

    return () => cancelMergeRaf();
  });

  // ---------------------------------------------------------------------------
  // The `from` node is hidden while it is the active merge source AND while it
  // remains masked post-completion (until the consumer removes it). Both feed the
  // same opacity helpers below.
  // ---------------------------------------------------------------------------
  const mergeFromId = $derived(mergeState?.from ?? null);
  const mergeEased = $derived(mergeState ? easeInOut(mergeState.progress) : 0);

  /** True when this id is the (post-merge) masked node — render it fully hidden. */
  function isMasked(id: string): boolean {
    return maskedFromId === id;
  }

  /** Extra translation applied to the merging node so it glides toward `into`. */
  function mergeOffset(id: string): { x: number; y: number } {
    if (!mergeState || mergeState.from !== id) return { x: 0, y: 0 };
    return { x: mergeState.dx * mergeEased, y: mergeState.dy * mergeEased };
  }

  /**
   * Opacity for a node during/after a merge. The animating `from` fades 1->0; a
   * masked `from` (merge done, awaiting removal) stays at 0. Others unaffected.
   */
  function mergeNodeOpacity(id: string): number | null {
    if (isMasked(id)) return 0;
    if (mergeFromId !== id) return null;
    return 1 - mergeEased;
  }

  /** Opacity for an edge incident to the merging/masked `from` node (fades too). */
  function mergeEdgeOpacity(e: ForceGraphEdge): number | null {
    const fromId = mergeFromId ?? maskedFromId;
    if (fromId == null) return null;
    if (e.source !== fromId && e.target !== fromId) return null;
    return isMasked(fromId) ? 0 : 1 - mergeEased;
  }

  let hoveredNodeIndex: number | null = $state(null);
  let hoveredEdgeIndex: number | null = $state(null);

  // Fast lookup sets — recomputed only when selectedIds/focusId props change,
  // never when nodes/edges change.
  const selectedSet = $derived(new Set<string>(selectedIds));

  // Adjacency: id -> set of directly connected node ids. Used to keep the
  // direct neighbours of selected/focused nodes fully visible (demand 6).
  const adjacency = $derived.by(() => {
    const adj = new Map<string, Set<string>>();
    const add = (a: string, b: string) => {
      let set = adj.get(a);
      if (!set) { set = new Set(); adj.set(a, set); }
      set.add(b);
    };
    for (const e of edges) {
      add(e.source, e.target);
      add(e.target, e.source);
    }
    return adj;
  });

  // True when a selection/focus is active — only then do we dim non-related
  // nodes. The set of "active" ids = selected ∪ focus ∪ all their neighbours.
  const hasActiveSelection = $derived(selectedSet.size > 0 || focusId != null);
  const activeAndNeighbours = $derived.by(() => {
    const active = new Set<string>(selectedSet);
    if (focusId != null) active.add(focusId);
    // Expand to direct neighbours so they stay fully visible.
    const withNeighbours = new Set<string>(active);
    for (const id of active) {
      const nb = adjacency.get(id);
      if (nb) for (const n of nb) withNeighbours.add(n);
    }
    return withNeighbours;
  });

  // A node is dimmed by selection when there IS an active selection and the
  // node is neither selected/focused nor a direct neighbour of one.
  function isSelectionDimmed(id: string): boolean {
    if (!hasActiveSelection) return false;
    return !activeAndNeighbours.has(id);
  }

  // An edge stays fully visible when at least one endpoint is in the
  // selected/focused set (it is a connection of the selection).
  function isEdgeSelectionDimmed(e: ForceGraphEdge): boolean {
    if (!hasActiveSelection) return false;
    const srcActive = selectedSet.has(e.source) || focusId === e.source;
    const tgtActive = selectedSet.has(e.target) || focusId === e.target;
    return !(srcActive || tgtActive);
  }

  // ---------------------------------------------------------------------------
  // Hover-connexe (demand 7): hovering a node fades the rest of the graph the
  // same way selection does — the hovered node and its direct neighbours stay
  // full, every other node dims, and only edges incident to the hovered node
  // keep their opacity. Composes with selection (predicates OR'd together).
  // ---------------------------------------------------------------------------
  const hoveredNodeId = $derived(
    hoveredNodeIndex != null ? (positionedNodes[hoveredNodeIndex]?.node.id ?? null) : null
  );
  const hoverActiveSet = $derived.by(() => {
    const set = new Set<string>();
    if (hoveredNodeId == null) return set;
    set.add(hoveredNodeId);
    const nb = adjacency.get(hoveredNodeId);
    if (nb) for (const n of nb) set.add(n);
    return set;
  });

  // A node is dimmed by hover when a node is hovered and this one is neither
  // the hovered node nor one of its direct neighbours.
  function isHoverDimmedNode(id: string): boolean {
    if (hoveredNodeId == null) return false;
    return !hoverActiveSet.has(id);
  }

  // An edge is dimmed by hover when a node is hovered and the edge is not
  // incident to it (keep only the hovered node's own edges full).
  function isHoverDimmedEdge(e: ForceGraphEdge): boolean {
    if (hoveredNodeId == null) return false;
    return e.source !== hoveredNodeId && e.target !== hoveredNodeId;
  }

  // Keyboard handler for a node circle: Space/Enter → onSelect, Enter → onOpenEntity.
  function handleNodeKeydown(id: string, e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.(id);
    }
    if (e.key === "Enter") {
      onOpenEntity?.(id);
    }
  }

  // ---------------------------------------------------------------------------
  // Zoom + pan state (Feature 2), framed by the fit-to-content box (Feature 5).
  // The base frame is `contentBox` (not 0,0,w,h). Zoom is a scale multiplier and
  // pan is an offset in SVG coords, both relative to that base frame:
  //   vbW = baseW / zoomScale,  vbH = baseH / zoomScale
  //   vbX = baseX + panX,       vbY = baseY + panY
  // ---------------------------------------------------------------------------
  let zoomScale = $state(1);
  let panX = $state(0);
  let panY = $state(0);

  let isPanning = $state(false);
  let panStart = $state({ x: 0, y: 0, panX: 0, panY: 0 });
  let svgEl: SVGSVGElement | null = $state(null);

  // Base frame dimensions = fit-to-content box.
  const baseW = $derived(contentBox.w);
  const baseH = $derived(contentBox.h);
  const baseX = $derived(contentBox.x);
  const baseY = $derived(contentBox.y);

  // Derived viewBox dimensions reflect the content frame + zoom/pan.
  const vbW = $derived(baseW / zoomScale);
  const vbH = $derived(baseH / zoomScale);
  const vbX = $derived(baseX + panX);
  const vbY = $derived(baseY + panY);

  function resetView() {
    zoomScale = 1;
    panX = 0;
    panY = 0;
  }

  function handleWheel(ev: WheelEvent) {
    if (prefersReducedMotion) return;
    ev.preventDefault();
    // Zoom factor: ~10% per step.
    const factor = ev.deltaY > 0 ? 0.9 : 1.1;
    // Clamp zoom: 0.2x – 8x.
    const newScale = Math.min(Math.max(zoomScale * factor, 0.2), 8);
    // Anchor zoom around the cursor position in SVG coords.
    if (svgEl) {
      const rect = svgEl.getBoundingClientRect();
      const curW = baseW / zoomScale;
      const curH = baseH / zoomScale;
      const cursorSvgX = vbX + ((ev.clientX - rect.left) / rect.width) * curW;
      const cursorSvgY = vbY + ((ev.clientY - rect.top) / rect.height) * curH;
      const newVbW = baseW / newScale;
      const newVbH = baseH / newScale;
      const ratioX = (cursorSvgX - vbX) / curW;
      const ratioY = (cursorSvgY - vbY) / curH;
      // New top-left so the cursor anchor stays put, then back out the pan term.
      panX = cursorSvgX - ratioX * newVbW - baseX;
      panY = cursorSvgY - ratioY * newVbH - baseY;
    }
    zoomScale = newScale;
  }

  function handleBgMouseDown(ev: MouseEvent) {
    // Only start pan when clicking the background (not a node/edge element).
    if ((ev.target as Element).closest(".st-forceGraph__node")) return;
    if (prefersReducedMotion) return;
    isPanning = true;
    panStart = { x: ev.clientX, y: ev.clientY, panX, panY };
  }

  function handleMouseMove(ev: MouseEvent) {
    if (!isPanning || !svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const dx = ((ev.clientX - panStart.x) / rect.width) * vbW;
    const dy = ((ev.clientY - panStart.y) / rect.height) * vbH;
    panX = panStart.panX - dx;
    panY = panStart.panY - dy;
  }

  function handleMouseUp() {
    isPanning = false;
  }

  const viewBox = $derived(`${vbX} ${vbY} ${vbW} ${vbH}`);
  const isZoomed = $derived(zoomScale !== 1 || panX !== 0 || panY !== 0);

  const classes = () =>
    ["st-forceGraph", prefersReducedMotion ? "st-forceGraph--static" : null, className]
      .filter(Boolean)
      .join(" ");
</script>

<div
  class={classes()}
  role="img"
  aria-label={label}
>
  <svg
    bind:this={svgEl}
    viewBox={viewBox}
    preserveAspectRatio="xMidYMid meet"
    width="100%"
    height="100%"
    focusable="false"
    aria-hidden="true"
    class:st-forceGraph__svg--panning={isPanning}
    onwheel={handleWheel}
    onmousedown={handleBgMouseDown}
    onmousemove={handleMouseMove}
    onmouseup={handleMouseUp}
    onmouseleave={handleMouseUp}
  >
    <!-- edges first so nodes paint on top -->
    <g class="st-forceGraph__edges">
      {#each positionedEdges as e (e.i)}
        <!-- Invisible wider hit area for edge hover (follows the curve) -->
        {#if e.path}
          <path
            class="st-forceGraph__edgeHit"
            role="presentation"
            d={e.path}
            fill="none"
            onmouseenter={() => { hoveredEdgeIndex = e.i; onEdgeHover?.(e.edge); }}
            onmouseleave={() => { hoveredEdgeIndex = null; }}
          />
        {:else}
          <line
            class="st-forceGraph__edgeHit"
            role="presentation"
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            onmouseenter={() => { hoveredEdgeIndex = e.i; onEdgeHover?.(e.edge); }}
            onmouseleave={() => { hoveredEdgeIndex = null; }}
          />
        {/if}
        {@const mEdgeOpacity = mergeEdgeOpacity(e.edge)}
        {#if e.path}
          <path
            class="st-forceGraph__edge"
            class:st-forceGraph__edge--weak={e.edge.weak}
            class:st-forceGraph__edge--emphasis={e.edge.emphasis}
            class:st-forceGraph__edge--hovered={hoveredEdgeIndex === e.i}
            class:st-forceGraph__edge--dim={isEdgeSelectionDimmed(e.edge) || isHoverDimmedEdge(e.edge)}
            class:st-forceGraph__edge--merging={mEdgeOpacity !== null}
            d={e.path}
            fill="none"
            stroke-dasharray={e.dashArray}
            stroke-width={e.strokeWidth}
            opacity={mEdgeOpacity}
            pointer-events="none"
          />
        {:else}
          <line
            class="st-forceGraph__edge"
            class:st-forceGraph__edge--weak={e.edge.weak}
            class:st-forceGraph__edge--emphasis={e.edge.emphasis}
            class:st-forceGraph__edge--hovered={hoveredEdgeIndex === e.i}
            class:st-forceGraph__edge--dim={isEdgeSelectionDimmed(e.edge) || isHoverDimmedEdge(e.edge)}
            class:st-forceGraph__edge--merging={mEdgeOpacity !== null}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke-dasharray={e.dashArray}
            stroke-width={e.strokeWidth}
            opacity={mEdgeOpacity}
            pointer-events="none"
          />
        {/if}
      {/each}
    </g>

    <g class="st-forceGraph__nodes">
      {#each positionedNodes as p (p.node.id)}
        {@const mOff = mergeOffset(p.node.id)}
        {@const mOpacity = mergeNodeOpacity(p.node.id)}
        {@const mMasked = isMasked(p.node.id)}
        <g
          class="st-forceGraph__node st-forceGraph__node--{p.tone}"
          class:st-forceGraph__node--dim={isHoverDimmedNode(p.node.id) || isSelectionDimmed(p.node.id)}
          class:st-forceGraph__node--selected={selectedSet.has(p.node.id)}
          class:st-forceGraph__node--focus={focusId === p.node.id}
          class:st-forceGraph__node--merging={mergeFromId === p.node.id || mMasked}
          aria-hidden={mMasked ? "true" : undefined}
          opacity={mOpacity}
          transform="translate({p.x + mOff.x} {p.y + mOff.y})"
        >
          {#if p.shapePath}
            <path
              class="st-forceGraph__shape st-forceGraph__dot"
              d={p.shapePath}
              tabindex="0"
              role="button"
              aria-label="{p.title}{p.node.group !== undefined ? `: ${p.node.group}` : ''}"
              aria-pressed={selectedSet.has(p.node.id)}
              onmouseenter={() => { hoveredNodeIndex = p.i; onNodeHover?.(p.node); }}
              onmouseleave={() => { hoveredNodeIndex = null; onNodeHover?.(null); }}
              onfocus={() => { hoveredNodeIndex = p.i; onNodeHover?.(p.node); }}
              onblur={() => { hoveredNodeIndex = null; onNodeHover?.(null); }}
              onclick={() => onSelect?.(p.node.id)}
              ondblclick={() => onOpenEntity?.(p.node.id)}
              onkeydown={(e) => handleNodeKeydown(p.node.id, e)}
            />
          {:else}
            <circle
              class="st-forceGraph__dot"
              r={p.r}
              tabindex="0"
              role="button"
              aria-label="{p.title}{p.node.group !== undefined ? `: ${p.node.group}` : ''}"
              aria-pressed={selectedSet.has(p.node.id)}
              onmouseenter={() => { hoveredNodeIndex = p.i; onNodeHover?.(p.node); }}
              onmouseleave={() => { hoveredNodeIndex = null; onNodeHover?.(null); }}
              onfocus={() => { hoveredNodeIndex = p.i; onNodeHover?.(p.node); }}
              onblur={() => { hoveredNodeIndex = null; onNodeHover?.(null); }}
              onclick={() => onSelect?.(p.node.id)}
              ondblclick={() => onOpenEntity?.(p.node.id)}
              onkeydown={(e) => handleNodeKeydown(p.node.id, e)}
            />
          {/if}
          {#if showLabels}
            <text class="st-forceGraph__label" x={p.r + 3} y="0" dominant-baseline="middle">{p.title}</text>
          {/if}
        </g>
      {/each}
    </g>
  </svg>

  <!-- Node tooltip -->
  {#if hoveredNodeIndex !== null && positionedNodes[hoveredNodeIndex]}
    {@const p = positionedNodes[hoveredNodeIndex]}
    {@const relCount = positionedEdges.filter(
      (e) => e.edge.source === p.node.id || e.edge.target === p.node.id
    ).length}
    <div
      class="st-forceGraph__tooltip"
      role="presentation"
      style="left: {((p.x - vbX) / vbW) * 100}%; top: {((p.y - vbY) / vbH) * 100}%"
    >
      <span class="st-forceGraph__tooltipLabel">{p.title}</span>
      {#if p.node.group !== undefined}
        <span class="st-forceGraph__tooltipMeta">{p.node.group}</span>
      {/if}
      {#if relCount > 0}
        <span class="st-forceGraph__tooltipMeta">{relCount} relation{relCount === 1 ? "" : "s"}</span>
      {/if}
    </div>
  {/if}

  <!-- Edge tooltip -->
  {#if hoveredEdgeIndex !== null}
    {@const e = positionedEdges.find((pe) => pe.i === hoveredEdgeIndex)}
    {#if e}
      <div
        class="st-forceGraph__tooltip st-forceGraph__tooltip--edge"
        role="presentation"
        style="left: {((e.midX - vbX) / vbW) * 100}%; top: {((e.midY - vbY) / vbH) * 100}%"
      >
        <span class="st-forceGraph__tooltipLabel">{e.srcLabel}</span>
        {#if e.edge.relation}
          <span class="st-forceGraph__tooltipRelation">{e.edge.relation}</span>
        {/if}
        <span class="st-forceGraph__tooltipLabel">{e.tgtLabel}</span>
      </div>
    {/if}
  {/if}

  <!-- Reset view button (only shown when zoomed/panned) -->
  {#if isZoomed}
    <button
      class="st-forceGraph__resetBtn"
      type="button"
      aria-label={resetViewLabel}
      onclick={resetView}
    >
      ↺
    </button>
  {/if}

  <!-- Legend overlay -->
  {#if legend && legend.length > 0}
    <div class="st-forceGraph__legend" aria-label={legendLabel}>
      {#each legend as entry}
        {@const swatchPath = entry.shape !== undefined ? nodeShapePath(entry.shape, 7) : null}
        {@const swatchTone = entry.tone ?? "category1"}
        {@const swatchDash = entry.shape === undefined ? edgeDashArray(entry.dash, entry.weak) : null}
        <div class="st-forceGraph__legendEntry">
          {#if entry.shape !== undefined}
            <!-- Node shape legend entry (viewBox widened for area-scaled glyphs) -->
            <svg
              class="st-forceGraph__legendSwatch"
              viewBox="-13 -13 26 26"
              width="16"
              height="16"
              aria-hidden="true"
            >
              {#if swatchPath}
                <path
                  d={swatchPath}
                  class="st-forceGraph__legendShape st-forceGraph__legendShape--{swatchTone}"
                />
              {:else}
                <circle
                  r="7"
                  class="st-forceGraph__legendShape st-forceGraph__legendShape--{swatchTone}"
                />
              {/if}
            </svg>
          {:else}
            <!-- Edge style legend entry -->
            <svg
              class="st-forceGraph__legendSwatch"
              viewBox="0 0 16 8"
              width="16"
              height="8"
              aria-hidden="true"
            >
              <line
                x1="0"
                y1="4"
                x2="16"
                y2="4"
                class="st-forceGraph__legendEdge"
                class:st-forceGraph__legendEdge--weak={entry.weak}
                stroke-dasharray={swatchDash}
              />
            </svg>
          {/if}
          <span class="st-forceGraph__legendLabel">{entry.label}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .st-forceGraph {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-forceGraph svg { display: block; overflow: visible; }

  .st-forceGraph__svg--panning { cursor: grabbing; }

  .st-forceGraph__edge {
    stroke: var(--st-semantic-border-strong);
    stroke-width: 1;
    opacity: 0.55;
    transition: opacity 120ms ease, stroke-width 120ms ease;
  }

  .st-forceGraph__edge--weak {
    stroke: var(--st-semantic-border-subtle);
    opacity: 0.5;
  }

  /* Emphasised edge (e.g. reconciliation match): thicker, fully opaque, on top. */
  .st-forceGraph__edge--emphasis {
    stroke: var(--st-semantic-border-interactive, var(--st-semantic-border-strong));
    opacity: 0.95;
  }

  /* Hover: match the node hover (fully visible) so the edge is never paler
     than the two nodes it connects. */
  .st-forceGraph__edge--hovered {
    opacity: 1;
    stroke-width: 2;
  }

  /* Dimmed by an active selection (edge touches no selected/focused node). */
  .st-forceGraph__edge--dim {
    opacity: 0.12;
  }

  /* Invisible wide hit target for edge hover */
  .st-forceGraph__edgeHit {
    stroke: transparent;
    stroke-width: 10;
    fill: none;
    cursor: crosshair;
  }

  .st-forceGraph__node { transition: opacity 120ms ease; }
  .st-forceGraph__node--dim { opacity: 0.3; }

  /* During a merge the opacity/transform are driven per-frame via rAF, so the
     CSS transitions are disabled to avoid a lag that would smear the glide. The
     fading/masked `from` node is also taken out of hit-testing so the invisible
     node cannot be hovered, focused or clicked. */
  .st-forceGraph__node--merging,
  .st-forceGraph__edge--merging { transition: none; }
  .st-forceGraph__node--merging { pointer-events: none; }

  .st-forceGraph__dot {
    cursor: pointer;
    fill-opacity: 0.9;
    stroke: var(--st-semantic-surface-default, #fff);
    stroke-width: 1.5;
    transition: fill-opacity 120ms ease;
  }

  .st-forceGraph__dot:hover,
  .st-forceGraph__dot:focus-visible { fill-opacity: 1; }

  .st-forceGraph__dot:focus-visible {
    outline: 2px solid var(--st-semantic-border-interactive);
    outline-offset: 1px;
  }

  /* Selection highlight: slightly thicker stroke ring, full opacity. */
  .st-forceGraph__node--selected .st-forceGraph__dot {
    fill-opacity: 1;
    stroke: var(--st-semantic-border-interactive, #0f62fe);
    stroke-width: 2.5;
  }

  /* Focus (keyboard/programmatic focus): stronger ring + slight scale. */
  .st-forceGraph__node--focus .st-forceGraph__dot {
    fill-opacity: 1;
    stroke: var(--st-semantic-border-interactive, #0f62fe);
    stroke-width: 3.5;
    filter: drop-shadow(0 0 4px var(--st-semantic-border-interactive, #0f62fe));
  }

  .st-forceGraph__label {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
    pointer-events: none;
  }

  .st-forceGraph__node--category1 .st-forceGraph__dot { fill: var(--st-semantic-data-category1); }
  .st-forceGraph__node--category2 .st-forceGraph__dot { fill: var(--st-semantic-data-category2); }
  .st-forceGraph__node--category3 .st-forceGraph__dot { fill: var(--st-semantic-data-category3); }
  .st-forceGraph__node--category4 .st-forceGraph__dot { fill: var(--st-semantic-data-category4); }
  .st-forceGraph__node--category5 .st-forceGraph__dot { fill: var(--st-semantic-data-category5); }
  .st-forceGraph__node--category6 .st-forceGraph__dot { fill: var(--st-semantic-data-category6); }
  .st-forceGraph__node--category7 .st-forceGraph__dot { fill: var(--st-semantic-data-category7); }
  .st-forceGraph__node--category8 .st-forceGraph__dot { fill: var(--st-semantic-data-category8); }

  .st-forceGraph__tooltip {
    background: var(--st-semantic-surface-inverse);
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-semantic-text-inverse);
    display: inline-flex;
    flex-direction: column;
    font-size: 0.75rem;
    gap: 0.125rem;
    line-height: 1.2;
    padding: 0.375rem 0.5rem;
    pointer-events: none;
    position: absolute;
    transform: translate(-50%, calc(-100% - 10px));
    white-space: nowrap;
    z-index: 1;
  }

  .st-forceGraph__tooltipLabel { font-weight: 600; }
  .st-forceGraph__tooltipMeta { opacity: 0.85; }
  .st-forceGraph__tooltipRelation {
    opacity: 0.75;
    font-style: italic;
    font-size: 0.6875rem;
  }

  /* Reset view button */
  .st-forceGraph__resetBtn {
    background: var(--st-semantic-surface-overlay, rgba(0,0,0,0.55));
    border: none;
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-semantic-text-inverse, #fff);
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    padding: 0.25rem 0.5rem;
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem;
    opacity: 0.8;
    transition: opacity 120ms ease;
    z-index: 2;
  }

  .st-forceGraph__resetBtn:hover,
  .st-forceGraph__resetBtn:focus-visible {
    opacity: 1;
  }

  .st-forceGraph__resetBtn:focus-visible {
    outline: 2px solid var(--st-semantic-border-interactive);
    outline-offset: 2px;
  }

  /* Legend overlay */
  .st-forceGraph__legend {
    background: var(--st-semantic-surface-overlay, rgba(0,0,0,0.45));
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-semantic-text-inverse, #fff);
    display: flex;
    flex-direction: column;
    font-size: 0.6875rem;
    gap: 0.25rem;
    padding: 0.375rem 0.5rem;
    pointer-events: none;
    position: absolute;
    bottom: 0.5rem;
    left: 0.5rem;
    z-index: 2;
  }

  .st-forceGraph__legendEntry {
    align-items: center;
    display: flex;
    gap: 0.375rem;
  }

  .st-forceGraph__legendSwatch {
    flex-shrink: 0;
  }

  .st-forceGraph__legendLabel {
    white-space: nowrap;
  }

  .st-forceGraph__legendShape {
    fill-opacity: 0.9;
    stroke: var(--st-semantic-surface-default, #fff);
    stroke-width: 1;
  }

  .st-forceGraph__legendShape--category1 { fill: var(--st-semantic-data-category1); }
  .st-forceGraph__legendShape--category2 { fill: var(--st-semantic-data-category2); }
  .st-forceGraph__legendShape--category3 { fill: var(--st-semantic-data-category3); }
  .st-forceGraph__legendShape--category4 { fill: var(--st-semantic-data-category4); }
  .st-forceGraph__legendShape--category5 { fill: var(--st-semantic-data-category5); }
  .st-forceGraph__legendShape--category6 { fill: var(--st-semantic-data-category6); }
  .st-forceGraph__legendShape--category7 { fill: var(--st-semantic-data-category7); }
  .st-forceGraph__legendShape--category8 { fill: var(--st-semantic-data-category8); }

  .st-forceGraph__legendEdge {
    stroke: var(--st-semantic-border-strong, #888);
    stroke-width: 1.5;
    opacity: 0.8;
  }

  .st-forceGraph__legendEdge--weak {
    stroke: var(--st-semantic-border-subtle, #aaa);
    stroke-dasharray: 3 3;
    opacity: 0.65;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-forceGraph__node,
    .st-forceGraph__dot,
    .st-forceGraph__edge,
    .st-forceGraph__resetBtn { transition: none; }
  }
</style>

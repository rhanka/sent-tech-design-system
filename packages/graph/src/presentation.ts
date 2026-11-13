
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

export const TONES: ForceGraphTone[] = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
];

export function buildToneMap(ns: ForceGraphNode[]): Map<string, ForceGraphTone> {
  const groups: (string | number)[] = [];
  const seen = new Set<string | number>();
  for (const n of ns) {
    if (n.group === undefined) continue;
    if (seen.has(n.group)) continue;
    seen.add(n.group);
    groups.push(n.group);
  }
  const groupTone = new Map<string | number, ForceGraphTone>();
  groups.forEach((g, i) => groupTone.set(g, TONES[i % TONES.length]!));
  const map = new Map<string, ForceGraphTone>();
  ns.forEach((n, i) => {
    if (n.tone) map.set(n.id, n.tone);
    else if (n.group !== undefined && groupTone.has(n.group)) map.set(n.id, groupTone.get(n.group)!);
    else map.set(n.id, TONES[i % TONES.length]!);
  });
  return map;
}

export const CURVE_FACTOR = 0.5;

export const CONTENT_MARGIN = 0.08;

export const MERGE_DURATION_MS = 450;

export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export type ForcePositions = ReadonlyMap<string, { x: number; y: number }>;
export function positionForceNodes(nodes: ForceGraphNode[], layout: ForcePositions, width: number, height: number, nodeRadius: number) {
 const toneMap = buildToneMap(nodes);
 return (() =>
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
          shapePath,
        };
      }))();
}
export function positionForceEdges(nodes: ForceGraphNode[], edges: ForceGraphEdge[], layout: ForcePositions, edgeCurve: number) {
 return (() => {
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
            x1,
            y1,
            x2,
            y2,
            // Tooltip / label anchor follows the curve apex when curved.
            midX: cx,
            midY: cy,
            path,
            dashArray,
            strokeWidth,
            srcLabel: srcNode?.label ?? e.source,
            tgtLabel: tgtNode?.label ?? e.target,
          };
        })
        .filter((e): e is NonNullable<typeof e> => e !== null);
    })();
}
export function forceGraphContentBox(positionedNodes: ReturnType<typeof positionForceNodes>, width: number, height: number) {
 return (() => {
      const pns = positionedNodes;
      if (pns.length === 0) {
        return { x: 0, y: 0, w: width, h: height };
      }
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const p of pns) {
        // Worst-case extent for non-circular shapes so the glyph is never clipped.
        const ext = p.r * 1.7;
        minX = Math.min(minX, p.x - ext);
        minY = Math.min(minY, p.y - ext);
        maxX = Math.max(maxX, p.x + ext);
        maxY = Math.max(maxY, p.y + ext);
      }
      let w = maxX - minX;
      let h = maxY - minY;
      // Guard against a degenerate (single node / collinear) box.
      if (!(w > 0)) {
        w = width;
        minX = maxX - w / 2;
      }
      if (!(h > 0)) {
        h = height;
        minY = maxY - h / 2;
      }
      const mx = w * CONTENT_MARGIN;
      const my = h * CONTENT_MARGIN;
      return { x: minX - mx, y: minY - my, w: w + 2 * mx, h: h + 2 * my };
    })();
}

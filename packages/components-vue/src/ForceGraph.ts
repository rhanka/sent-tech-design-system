import {
  defineComponent,
  h,
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
  type PropType,
  type VNode,
} from "vue";
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
  | "triangle";

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
   */
  weak?: boolean;
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
  onSelect?: (id: string) => void;
  onOpenEntity?: (id: string) => void;
  onEdgeHover?: (edge: ForceGraphEdge) => void;
  class?: string;
};

// ---------------------------------------------------------------------------
// SVG path helpers for the various node shapes.
// All shapes are centered at (0,0) and sized to inscribe within radius r.
// ---------------------------------------------------------------------------
export function nodeShapePath(shape: ForceGraphNodeShape | undefined, r: number): string | null {
  const s = shape ?? "dot";
  if (s === "dot" || s === "circle") return null; // use <circle>
  if (s === "diamond") {
    return `M 0 ${-r} L ${r} 0 L 0 ${r} L ${-r} 0 Z`;
  }
  if (s === "star") {
    const outer = r;
    const inner = r * 0.42;
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const rad = i % 2 === 0 ? outer : inner;
      pts.push(`${rad * Math.cos(angle)},${rad * Math.sin(angle)}`);
    }
    return `M ${pts.join(" L ")} Z`;
  }
  if (s === "hexagon") {
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 6;
      pts.push(`${r * Math.cos(angle)},${r * Math.sin(angle)}`);
    }
    return `M ${pts.join(" L ")} Z`;
  }
  if (s === "box" || s === "square") {
    const hh = r * 0.85;
    return `M ${-hh} ${-hh} L ${hh} ${-hh} L ${hh} ${hh} L ${-hh} ${hh} Z`;
  }
  if (s === "triangle") {
    const hh = r * 1.1;
    return `M 0 ${-hh} L ${hh * 0.9} ${hh * 0.6} L ${-hh * 0.9} ${hh * 0.6} Z`;
  }
  return null;
}

const TONES: ForceGraphTone[] = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
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

function runSimulation(
  ns: ForceGraphNode[],
  es: ForceGraphEdge[],
  w: number,
  h: number,
  ticks: number,
  nodeRadius: number,
): Map<string, { x: number; y: number }> {
  const cx = w / 2;
  const cy = h / 2;
  const rand = mulberry32(ns.length * 2654435761 + es.length);
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
      fixed,
    };
  });

  const links = es
    .map((e) => ({ s: idIndex.get(e.source), t: idIndex.get(e.target) }))
    .filter((l): l is { s: number; t: number } => l.s !== undefined && l.t !== undefined);

  const area = w * h;
  const k = Math.sqrt(area / Math.max(ns.length, 1)); // ideal node distance
  const repulsion = k * k * 0.9;
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
      // Keep inside a padded viewport.
      node.x = Math.max(nodeRadius * 2, Math.min(w - nodeRadius * 2, node.x));
      node.y = Math.max(nodeRadius * 2, Math.min(h - nodeRadius * 2, node.y));
    }
    temperature *= cooling;
  }

  const out = new Map<string, { x: number; y: number }>();
  for (const node of sim) out.set(node.id, { x: node.x, y: node.y });
  return out;
}

export const ForceGraph = defineComponent({
  name: "ForceGraph",
  props: {
    nodes: { type: Array as PropType<ForceGraphNode[]>, required: true },
    edges: { type: Array as PropType<ForceGraphEdge[]>, required: true },
    label: { type: String, default: "Force graph" },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 360 },
    nodeRadius: { type: Number, default: 7 },
    showLabels: { type: Boolean, default: true },
    iterations: { type: Number, default: 300 },
    selectedIds: { type: Array as PropType<string[]>, default: () => [] },
    focusId: { type: String as PropType<string | null>, default: null },
    legend: { type: Array as PropType<ForceGraphLegendEntry[]>, default: undefined },
    onSelect: { type: Function as PropType<(id: string) => void>, default: undefined },
    onOpenEntity: { type: Function as PropType<(id: string) => void>, default: undefined },
    onEdgeHover: { type: Function as PropType<(edge: ForceGraphEdge) => void>, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: {
    select: (_id: string) => true,
    openEntity: (_id: string) => true,
    edgeHover: (_edge: ForceGraphEdge) => true,
  },
  setup(props, { emit, attrs }) {
    // SSR-safe reduced-motion check (window may be undefined during SSR/tests).
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- Live layout state, animated via requestAnimationFrame ----
    // The layout map is reactive so the render reflects each cooling frame.
    // Seeded synchronously so the very first render already has positions
    // (keeps SSR/tests stable — the static frame is the settled target under
    // reduced motion, otherwise a warmed-up frame the rAF tail eases from).
    const layout = ref<Map<string, { x: number; y: number }>>(new Map());
    let rafId: number | null = null;

    // Number of synchronous warmup ticks. Under reduced motion we settle the
    // layout fully (the full iteration count); otherwise we run the bulk of the
    // cooling synchronously and animate the remaining tail.
    function warmupTicks(ticks: number): number {
      return prefersReducedMotion ? ticks : Math.max(1, Math.floor(ticks * 0.6));
    }

    // Synchronous part: populate `layout` immediately. Called once at setup and
    // again whenever inputs change.
    function warmupLayout() {
      const ticks = Math.max(1, Math.round(props.iterations));
      layout.value = runSimulation(
        props.nodes,
        props.edges,
        props.width,
        props.height,
        warmupTicks(ticks),
        props.nodeRadius,
      );
    }

    // Run a synchronous warmup then animate the remaining cooling unless
    // reduced motion is requested, in which case we settle fully and paint
    // a single static frame (no rAF loop, no jitter).
    function startLayout() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      const ticks = Math.max(1, Math.round(props.iterations));

      // Settled / warmed-up synchronous frame.
      warmupLayout();

      if (prefersReducedMotion || typeof requestAnimationFrame !== "function") {
        return;
      }

      // Animated cooling: recompute at increasing tick counts toward `ticks`.
      const warmup = warmupTicks(ticks);
      let current = warmup;
      const stride = Math.max(1, Math.ceil((ticks - warmup) / 30));
      const tick = () => {
        current = Math.min(ticks, current + stride);
        layout.value = runSimulation(
          props.nodes,
          props.edges,
          props.width,
          props.height,
          current,
          props.nodeRadius,
        );
        if (current < ticks) {
          rafId = requestAnimationFrame(tick);
        } else {
          rafId = null;
        }
      };
      rafId = requestAnimationFrame(tick);
    }

    // Seed the layout synchronously so the initial render is positioned.
    warmupLayout();

    const toneMap = computed(() => buildToneMap(props.nodes));

    const positionedNodes = computed(() =>
      props.nodes.map((n, i) => {
        const p = layout.value.get(n.id) ?? { x: props.width / 2, y: props.height / 2 };
        const r = props.nodeRadius * Math.sqrt(Math.max(n.weight ?? 1, 0.25));
        const shapePath = nodeShapePath(n.shape, r);
        return {
          node: n,
          i,
          x: p.x,
          y: p.y,
          r,
          tone: toneMap.value.get(n.id) ?? "category1",
          title: n.label ?? n.id,
          shapePath,
        };
      }),
    );

    const positionedEdges = computed(() => {
      const nodeById = new Map(props.nodes.map((n) => [n.id, n]));
      return props.edges
        .map((e, i) => {
          const a = layout.value.get(e.source);
          const b = layout.value.get(e.target);
          if (!a || !b) return null;
          const srcNode = nodeById.get(e.source);
          const tgtNode = nodeById.get(e.target);
          return {
            edge: e,
            i,
            x1: a.x,
            y1: a.y,
            x2: b.x,
            y2: b.y,
            srcLabel: srcNode?.label ?? e.source,
            tgtLabel: tgtNode?.label ?? e.target,
          };
        })
        .filter((e): e is NonNullable<typeof e> => e !== null);
    });

    const hoveredNodeIndex = ref<number | null>(null);
    const hoveredEdgeIndex = ref<number | null>(null);

    const selectedSet = computed(() => new Set<string>(props.selectedIds ?? []));

    function fireSelect(id: string) {
      props.onSelect?.(id);
      emit("select", id);
    }
    function fireOpenEntity(id: string) {
      props.onOpenEntity?.(id);
      emit("openEntity", id);
    }
    function fireEdgeHover(edge: ForceGraphEdge) {
      props.onEdgeHover?.(edge);
      emit("edgeHover", edge);
    }

    // Keyboard handler for a node: Space/Enter → select, Enter → openEntity.
    function handleNodeKeydown(id: string, e: KeyboardEvent) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fireSelect(id);
      }
      if (e.key === "Enter") {
        fireOpenEntity(id);
      }
    }

    // -------------------------------------------------------------------------
    // Zoom + pan state.
    //   vbW = width / zoomScale,  vbH = height / zoomScale
    //   panX / panY = pan offset in SVG coordinate space
    // -------------------------------------------------------------------------
    const zoomScale = ref(1);
    const panX = ref(0);
    const panY = ref(0);

    const isPanning = ref(false);
    let panStart = { x: 0, y: 0, panX: 0, panY: 0 };
    const svgEl = ref<SVGSVGElement | null>(null);

    const vbW = computed(() => props.width / zoomScale.value);
    const vbH = computed(() => props.height / zoomScale.value);
    const vbX = computed(() => panX.value);
    const vbY = computed(() => panY.value);

    function resetView() {
      zoomScale.value = 1;
      panX.value = 0;
      panY.value = 0;
    }

    function handleWheel(ev: WheelEvent) {
      if (prefersReducedMotion) return;
      ev.preventDefault();
      // Zoom factor: ~10% per step.
      const factor = ev.deltaY > 0 ? 0.9 : 1.1;
      // Clamp zoom: 0.2x – 8x.
      const newScale = Math.min(Math.max(zoomScale.value * factor, 0.2), 8);
      // Anchor zoom around the cursor position in SVG coords.
      if (svgEl.value) {
        const rect = svgEl.value.getBoundingClientRect();
        const cursorSvgX = panX.value + ((ev.clientX - rect.left) / rect.width) * (props.width / zoomScale.value);
        const cursorSvgY = panY.value + ((ev.clientY - rect.top) / rect.height) * (props.height / zoomScale.value);
        const newVbW = props.width / newScale;
        const newVbH = props.height / newScale;
        const ratioX = (cursorSvgX - panX.value) / (props.width / zoomScale.value);
        const ratioY = (cursorSvgY - panY.value) / (props.height / zoomScale.value);
        panX.value = cursorSvgX - ratioX * newVbW;
        panY.value = cursorSvgY - ratioY * newVbH;
      }
      zoomScale.value = newScale;
    }

    function handleBgMouseDown(ev: MouseEvent) {
      // Only start pan when clicking the background (not a node/edge element).
      if ((ev.target as Element).closest(".st-forceGraph__node")) return;
      if (prefersReducedMotion) return;
      isPanning.value = true;
      panStart = { x: ev.clientX, y: ev.clientY, panX: panX.value, panY: panY.value };
    }

    function handleMouseMove(ev: MouseEvent) {
      if (!isPanning.value || !svgEl.value) return;
      const rect = svgEl.value.getBoundingClientRect();
      const dx = ((ev.clientX - panStart.x) / rect.width) * vbW.value;
      const dy = ((ev.clientY - panStart.y) / rect.height) * vbH.value;
      panX.value = panStart.panX - dx;
      panY.value = panStart.panY - dy;
    }

    function handleMouseUp() {
      isPanning.value = false;
    }

    const viewBox = computed(() => `${vbX.value} ${vbY.value} ${vbW.value} ${vbH.value}`);
    const isZoomed = computed(() => zoomScale.value !== 1 || panX.value !== 0 || panY.value !== 0);

    // -------------------------------------------------------------------------
    // Lifecycle: start the simulation on mount, re-run when inputs change,
    // tear down the rAF loop on unmount.
    // -------------------------------------------------------------------------
    onMounted(() => {
      startLayout();
    });

    watch(
      () => [props.nodes, props.edges, props.width, props.height, props.nodeRadius, props.iterations],
      () => {
        startLayout();
      },
      { deep: true },
    );

    onUnmounted(() => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });

    return () => {
      const label = props.label ?? "Force graph";
      const focusId = props.focusId ?? null;

      const children: VNode[] = [];

      // ---- SVG canvas ----
      const edgeVNodes: VNode[] = [];
      for (const e of positionedEdges.value) {
        // Invisible wider hit area for edge hover.
        edgeVNodes.push(
          h("line", {
            key: `hit-${e.i}`,
            class: "st-forceGraph__edgeHit",
            role: "presentation",
            x1: e.x1,
            y1: e.y1,
            x2: e.x2,
            y2: e.y2,
            onMouseenter: () => {
              hoveredEdgeIndex.value = e.i;
              fireEdgeHover(e.edge);
            },
            onMouseleave: () => {
              hoveredEdgeIndex.value = null;
            },
          }),
        );
        edgeVNodes.push(
          h("line", {
            key: `edge-${e.i}`,
            class: classNames(
              "st-forceGraph__edge",
              e.edge.weak && "st-forceGraph__edge--weak",
              hoveredEdgeIndex.value === e.i && "st-forceGraph__edge--hovered",
            ),
            x1: e.x1,
            y1: e.y1,
            x2: e.x2,
            y2: e.y2,
            "pointer-events": "none",
          }),
        );
      }

      const nodeVNodes: VNode[] = positionedNodes.value.map((p) => {
        const isSelected = selectedSet.value.has(p.node.id);
        const ariaLabel = `${p.title}${p.node.group !== undefined ? `: ${p.node.group}` : ""}`;
        // Interactive attributes live on the dot/shape (the focusable element),
        // mirroring the Svelte template. Click/dblclick are handled on the
        // wrapping group so a click anywhere within the node (dot or label)
        // selects it and fires exactly once.
        const dotHandlers = {
          tabindex: 0,
          role: "button",
          "aria-label": ariaLabel,
          "aria-pressed": isSelected ? "true" : "false",
          onMouseenter: () => { hoveredNodeIndex.value = p.i; },
          onMouseleave: () => { hoveredNodeIndex.value = null; },
          onFocus: () => { hoveredNodeIndex.value = p.i; },
          onBlur: () => { hoveredNodeIndex.value = null; },
          onKeydown: (ev: KeyboardEvent) => handleNodeKeydown(p.node.id, ev),
        };

        const shapeEl = p.shapePath
          ? h("path", { class: "st-forceGraph__dot st-forceGraph__shape", d: p.shapePath, ...dotHandlers })
          : h("circle", { class: "st-forceGraph__dot", r: p.r, ...dotHandlers });

        const inner: VNode[] = [shapeEl];
        if (props.showLabels) {
          inner.push(
            h(
              "text",
              { class: "st-forceGraph__label", x: p.r + 3, y: 0, "dominant-baseline": "middle" },
              p.title,
            ),
          );
        }

        return h(
          "g",
          {
            key: p.node.id,
            class: classNames(
              "st-forceGraph__node",
              `st-forceGraph__node--${p.tone}`,
              hoveredNodeIndex.value !== null && hoveredNodeIndex.value !== p.i && "st-forceGraph__node--dim",
              isSelected && "st-forceGraph__node--selected",
              focusId === p.node.id && "st-forceGraph__node--focus",
            ),
            transform: `translate(${p.x} ${p.y})`,
            onClick: () => fireSelect(p.node.id),
            onDblclick: () => fireOpenEntity(p.node.id),
          },
          inner,
        );
      });

      children.push(
        h(
          "svg",
          {
            ref: svgEl,
            viewBox: viewBox.value,
            preserveAspectRatio: "xMidYMid meet",
            width: "100%",
            height: "100%",
            focusable: "false",
            "aria-hidden": "true",
            class: classNames(isPanning.value && "st-forceGraph__svg--panning"),
            onWheel: handleWheel,
            onMousedown: handleBgMouseDown,
            onMousemove: handleMouseMove,
            onMouseup: handleMouseUp,
            onMouseleave: handleMouseUp,
          },
          [
            h("g", { class: "st-forceGraph__edges" }, edgeVNodes),
            h("g", { class: "st-forceGraph__nodes" }, nodeVNodes),
          ],
        ),
      );

      // ---- Node tooltip ----
      const hni = hoveredNodeIndex.value;
      if (hni !== null && positionedNodes.value[hni]) {
        const p = positionedNodes.value[hni];
        const relCount = positionedEdges.value.filter(
          (e) => e.edge.source === p.node.id || e.edge.target === p.node.id,
        ).length;
        const tipChildren: VNode[] = [
          h("span", { class: "st-forceGraph__tooltipLabel" }, p.title),
        ];
        if (p.node.group !== undefined) {
          tipChildren.push(h("span", { class: "st-forceGraph__tooltipMeta" }, String(p.node.group)));
        }
        if (relCount > 0) {
          tipChildren.push(
            h(
              "span",
              { class: "st-forceGraph__tooltipMeta" },
              `${relCount} relation${relCount === 1 ? "" : "s"}`,
            ),
          );
        }
        children.push(
          h(
            "div",
            {
              class: "st-forceGraph__tooltip",
              role: "presentation",
              style: `left: ${((p.x - vbX.value) / vbW.value) * 100}%; top: ${((p.y - vbY.value) / vbH.value) * 100}%`,
            },
            tipChildren,
          ),
        );
      }

      // ---- Edge tooltip ----
      const hei = hoveredEdgeIndex.value;
      if (hei !== null) {
        const e = positionedEdges.value.find((pe) => pe.i === hei);
        if (e) {
          const midX = (e.x1 + e.x2) / 2;
          const midY = (e.y1 + e.y2) / 2;
          const tipChildren: VNode[] = [
            h("span", { class: "st-forceGraph__tooltipLabel" }, e.srcLabel),
          ];
          if (e.edge.relation) {
            tipChildren.push(h("span", { class: "st-forceGraph__tooltipRelation" }, e.edge.relation));
          }
          tipChildren.push(h("span", { class: "st-forceGraph__tooltipLabel" }, e.tgtLabel));
          children.push(
            h(
              "div",
              {
                class: "st-forceGraph__tooltip st-forceGraph__tooltip--edge",
                role: "presentation",
                style: `left: ${((midX - vbX.value) / vbW.value) * 100}%; top: ${((midY - vbY.value) / vbH.value) * 100}%`,
              },
              tipChildren,
            ),
          );
        }
      }

      // ---- Reset view button (only when zoomed/panned) ----
      if (isZoomed.value) {
        children.push(
          h(
            "button",
            {
              class: "st-forceGraph__resetBtn",
              type: "button",
              "aria-label": "Reset view",
              onClick: resetView,
            },
            "↺",
          ),
        );
      }

      // ---- Legend overlay ----
      if (props.legend && props.legend.length > 0) {
        const entries: VNode[] = props.legend.map((entry, idx) => {
          const swatchPath = entry.shape !== undefined ? nodeShapePath(entry.shape, 7) : null;
          const swatchTone = entry.tone ?? "category1";
          let swatch: VNode;
          if (entry.shape !== undefined) {
            swatch = h(
              "svg",
              {
                class: "st-forceGraph__legendSwatch",
                viewBox: "-8 -8 16 16",
                width: "16",
                height: "16",
                "aria-hidden": "true",
              },
              [
                swatchPath
                  ? h("path", {
                      d: swatchPath,
                      class: `st-forceGraph__legendShape st-forceGraph__legendShape--${swatchTone}`,
                    })
                  : h("circle", {
                      r: "7",
                      class: `st-forceGraph__legendShape st-forceGraph__legendShape--${swatchTone}`,
                    }),
              ],
            );
          } else {
            swatch = h(
              "svg",
              {
                class: "st-forceGraph__legendSwatch",
                viewBox: "0 0 16 8",
                width: "16",
                height: "8",
                "aria-hidden": "true",
              },
              [
                h("line", {
                  x1: "0",
                  y1: "4",
                  x2: "16",
                  y2: "4",
                  class: classNames(
                    "st-forceGraph__legendEdge",
                    entry.weak && "st-forceGraph__legendEdge--weak",
                  ),
                }),
              ],
            );
          }
          return h("div", { key: idx, class: "st-forceGraph__legendEntry" }, [
            swatch,
            h("span", { class: "st-forceGraph__legendLabel" }, entry.label),
          ]);
        });
        children.push(
          h(
            "div",
            { class: "st-forceGraph__legend", "aria-label": "Graph legend" },
            entries,
          ),
        );
      }

      return h(
        "figure",
        {
          ...attrs,
          class: classNames("st-forceGraph", props.class),
          role: "img",
          "aria-label": label,
        },
        children,
      );
    };
  },
});

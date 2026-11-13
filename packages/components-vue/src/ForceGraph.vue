<script setup lang="ts">
defineOptions({ name: 'ForceGraph' });
import { positionForceNodes, positionForceEdges, forceGraphContentBox, MERGE_DURATION_MS, easeInOut } from '@sentropic/graph/presentation';
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { computeLayout } from '@sentropic/graph/processing';
import { nodeShapePath, edgeDashArray, type ForceGraphNode, type ForceGraphEdge, type ForceGraphTone } from '@sentropic/graph/presentation';
import type { ForceGraphProps } from './ForceGraph.types.js';
import { classNames } from './classNames.js';
const props = withDefaults(defineProps<ForceGraphProps>(), { width: 480, height: 360, nodeRadius: 7, showLabels: true, iterations: 300, selectedIds: () => [], focusId: null, edgeCurve: 0.15, repulsion: 1, mergePair: null, resetViewLabel: 'Reset view', legendLabel: 'Graph legend' });
const emit = defineEmits<{
    select: [
        id: string
    ];
    openEntity: [
        id: string
    ];
    edgeHover: [
        edge: ForceGraphEdge
    ];
    nodeHover: [
        node: ForceGraphNode | null
    ];
    mergeComplete: [
        pair: {
            id: string;
            from: string;
            into: string;
        }
    ];
}>();
// ---------------------------------------------------------------------------
// Tone assignment: explicit tone wins, else stable per-group, else per-index.
// ---------------------------------------------------------------------------
// Curvature offset factor: how far (relative to chord length) the control
// point bows out at edgeCurve=1. Kept modest so edgeCurve≈0.15 reads "light".
// Fit-to-content margin (per side, fraction of the content box).
// Merge (reconciliation) glide duration.
// ease-in-out (cubic) for a smooth glide.
// SSR-safe reduced-motion check (window may be undefined during SSR/tests).
const motionQuery = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)') : undefined;
const prefersReducedMotion = ref(motionQuery?.matches ?? false);
function updateReducedMotion() { prefersReducedMotion.value = motionQuery?.matches ?? false; }
const layout = computed(() => new Map(computeLayout(props.nodes, props.edges, { width: props.width, height: props.height, iterations: Math.max(1, Math.round(props.iterations)), repulsion: props.repulsion }).map(node => [node.id, { x: node.x, y: node.y }])));
const positionedNodes = computed(() => positionForceNodes(props.nodes, layout.value, props.width, props.height, props.nodeRadius));
const positionedEdges = computed(() => positionForceEdges(props.nodes, props.edges, layout.value, props.edgeCurve));
// -------------------------------------------------------------------------
// Fit-to-content (Feature 5): compute the real content bounding-box (node
// centres ± radius) and frame it with an 8% margin on each side. The base
// viewBox is this frame (not the fixed 0,0,w,h), so the graph is centred
// and never clipped. Zoom/pan stay relative to this frame.
// -------------------------------------------------------------------------
const contentBox = computed(() => forceGraphContentBox(positionedNodes.value, props.width, props.height));
const hoveredNodeIndex = ref<number | null>(null);
const hoveredEdgeIndex = ref<number | null>(null);
const selectedSet = computed(() => new Set<string>(props.selectedIds ?? []));
// -------------------------------------------------------------------------
// Merge animation (reconciliation): when `mergePair` becomes a new valid
// pair, the `from` node slides toward `into` while fading out (node +
// incident edges), then `onMergeComplete` fires. Purely visual — never
// mutates props. Under reduced motion / SSR we skip straight to completion
// on a microtask. The clock is anchored to the FIRST rAF frame's own
// timestamp (rAF timestamps and performance.now() can use different time
// origins under jsdom, which would yield a garbage elapsed time).
// -------------------------------------------------------------------------
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
const mergeState = ref<MergeState>(null);
let mergeRaf: number | null = null;
// The id currently being (or already) handled, so the watcher only reacts to
// a genuinely NEW id. Re-passing the same id (even a fresh object) is a no-op.
let handledMergeId: string | null = null;
// The id of the `from` node to keep MASKED after a completed merge, until the
// consumer drops it from `nodes` (or a new pair arrives). Decouples the mask
// from `mergePair` returning to null (otherwise the node would flash back).
const maskedFromId = ref<string | null>(null);
// Set true on unmount so no queued microtask/frame fires a callback or
// touches reactive state after teardown.
let disposed = false;
function cancelMergeRaf() {
    if (mergeRaf !== null && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(mergeRaf);
    }
    mergeRaf = null;
}
function fireMergeComplete(pair: {
    id: string;
    from: string;
    into: string;
}) {
    // `emit("mergeComplete")` invokes the `onMergeComplete` prop/listener
    // exactly once; calling `props.onMergeComplete` here too would double-fire.
    emit("mergeComplete", pair);
}
const mergeId = computed(() => (props.mergePair ? props.mergePair.id : null));
onMounted(() => {
    watch(mergeId, () => {
        const pair = props.mergePair;
        const id = pair ? pair.id : null;
        // Idempotent on id: same id (or still null) means nothing to (re)start.
        // A new id always (re)plays, even for the same from/into pair.
        if (id === handledMergeId)
            return;
        handledMergeId = id;
        // Tear down any in-flight animation for a previous pair.
        cancelMergeRaf();
        mergeState.value = null;
        if (!pair)
            return;
        // A genuinely new pair supersedes any lingering mask from a prior merge.
        maskedFromId.value = null;
        // Validate: both endpoints must currently exist.
        const fromPos = layout.value.get(pair.from);
        const intoPos = layout.value.get(pair.into);
        if (!fromPos || !intoPos)
            return; // invalid pair → no-op, no callback
        const captured = { id: pair.id, from: pair.from, into: pair.into };
        const complete = () => {
            // Keep `from` hidden until the consumer removes it (or a new pair).
            maskedFromId.value = captured.from;
            fireMergeComplete(captured);
        };
        // Reduced motion: no animation, resolve on a microtask. Guarded so
        // a late microtask after unmount or after a newer id took over is a no-op.
        if (prefersReducedMotion.value ||
            typeof requestAnimationFrame !== "function") {
            queueMicrotask(() => {
                if (disposed || handledMergeId !== id)
                    return;
                complete();
            });
            return;
        }
        const dx = intoPos.x - fromPos.x;
        const dy = intoPos.y - fromPos.y;
        mergeState.value = { id: captured.id, from: captured.from, into: captured.into, progress: 0, dx, dy };
        let start: number | null = null;
        const tick = (now: number) => {
            // Bail cleanly if the instance went away or a newer id superseded us.
            if (disposed || handledMergeId !== id) {
                mergeRaf = null;
                return;
            }
            // Re-validate both endpoints every frame: if either disappears
            // mid-flight (e.g. the consumer removed a node), cancel the glide
            // WITHOUT firing onMergeComplete (no double-tir) and without a
            // dangling frame.
            if (!layout.value.has(captured.from) || !layout.value.has(captured.into)) {
                cancelMergeRaf();
                mergeState.value = null;
                return;
            }
            if (start === null)
                start = now;
            const t = Math.min(1, Math.max(0, (now - start) / MERGE_DURATION_MS));
            if (mergeState.value)
                mergeState.value = { ...mergeState.value, progress: t };
            if (t < 1) {
                mergeRaf = requestAnimationFrame(tick);
            }
            else {
                mergeRaf = null;
                mergeState.value = null;
                complete();
            }
        };
        mergeRaf = requestAnimationFrame(tick);
    }, { immediate: true });
});
// Eased progress of the `from` node toward `into`. Null when no merge running.
const mergeFromId = computed(() => mergeState.value?.from ?? null);
const mergeEased = computed(() => (mergeState.value ? easeInOut(mergeState.value.progress) : 0));
/** True when this id is the (post-merge) masked node — render it fully hidden. */
function isMasked(id: string): boolean {
    return maskedFromId.value === id;
}
/** Extra translation applied to the merging node so it glides toward `into`. */
function mergeOffset(id: string): {
    x: number;
    y: number;
} {
    const m = mergeState.value;
    if (!m || m.from !== id)
        return { x: 0, y: 0 };
    return { x: m.dx * mergeEased.value, y: m.dy * mergeEased.value };
}
/**
 * Opacity for a node during/after a merge. The animating `from` fades 1->0;
 * a masked `from` (merge done, awaiting removal) stays at 0. Others unchanged.
 */
function mergeNodeOpacity(id: string): number | undefined {
    if (isMasked(id))
        return 0;
    if (mergeFromId.value !== id)
        return undefined;
    return 1 - mergeEased.value;
}
/** Opacity for an edge incident to the merging/masked `from` node (fades too). */
function mergeEdgeOpacity(e: ForceGraphEdge): number | undefined {
    const fromId = mergeFromId.value ?? maskedFromId.value;
    if (fromId == null)
        return undefined;
    if (e.source !== fromId && e.target !== fromId)
        return undefined;
    return isMasked(fromId) ? 0 : 1 - mergeEased.value;
}
// Adjacency: id -> set of directly connected node ids. Used to keep the
// direct neighbours of selected/focused nodes fully visible (demand 6).
const adjacency = computed(() => {
    const adj = new Map<string, Set<string>>();
    const add = (a: string, b: string) => {
        let set = adj.get(a);
        if (!set) {
            set = new Set();
            adj.set(a, set);
        }
        set.add(b);
    };
    for (const e of props.edges) {
        add(e.source, e.target);
        add(e.target, e.source);
    }
    return adj;
});
// True when a selection/focus is active — only then do we dim non-related
// nodes. The set of "active" ids = selected ∪ focus ∪ all their neighbours.
const hasActiveSelection = computed(() => selectedSet.value.size > 0 || (props.focusId ?? null) != null);
const activeAndNeighbours = computed(() => {
    const active = new Set<string>(selectedSet.value);
    if (props.focusId != null)
        active.add(props.focusId);
    // Expand to direct neighbours so they stay fully visible.
    const withNeighbours = new Set<string>(active);
    for (const id of active) {
        const nb = adjacency.value.get(id);
        if (nb)
            for (const n of nb)
                withNeighbours.add(n);
    }
    return withNeighbours;
});
// A node is dimmed by selection when there IS an active selection and the
// node is neither selected/focused nor a direct neighbour of one.
function isSelectionDimmed(id: string): boolean {
    if (!hasActiveSelection.value)
        return false;
    return !activeAndNeighbours.value.has(id);
}
// An edge stays fully visible when at least one endpoint is in the
// selected/focused set (it is a connection of the selection).
function isEdgeSelectionDimmed(e: ForceGraphEdge): boolean {
    if (!hasActiveSelection.value)
        return false;
    const srcActive = selectedSet.value.has(e.source) || props.focusId === e.source;
    const tgtActive = selectedSet.value.has(e.target) || props.focusId === e.target;
    return !(srcActive || tgtActive);
}
// -------------------------------------------------------------------------
// Hover-connexe (demand 7): hovering a node fades the rest of the graph the
// same way selection does — the hovered node and its direct neighbours stay
// full, every other node dims, and only edges incident to the hovered node
// keep their opacity. Composes with selection (predicates OR'd together).
// -------------------------------------------------------------------------
const hoveredNodeId = computed<string | null>(() => {
    const idx = hoveredNodeIndex.value;
    if (idx == null)
        return null;
    return positionedNodes.value[idx]?.node.id ?? null;
});
const hoverActiveSet = computed(() => {
    const set = new Set<string>();
    const id = hoveredNodeId.value;
    if (id == null)
        return set;
    set.add(id);
    const nb = adjacency.value.get(id);
    if (nb)
        for (const n of nb)
            set.add(n);
    return set;
});
// A node is dimmed by hover when a node is hovered and this one is neither
// the hovered node nor one of its direct neighbours.
function isHoverDimmedNode(id: string): boolean {
    if (hoveredNodeId.value == null)
        return false;
    return !hoverActiveSet.value.has(id);
}
// An edge is dimmed by hover when a node is hovered and the edge is not
// incident to it (keep only the hovered node's own edges full).
function isHoverDimmedEdge(e: ForceGraphEdge): boolean {
    const id = hoveredNodeId.value;
    if (id == null)
        return false;
    return e.source !== id && e.target !== id;
}
function fireSelect(id: string) {
    emit("select", id);
}
function fireOpenEntity(id: string) {
    emit("openEntity", id);
}
function fireEdgeHover(edge: ForceGraphEdge) {
    emit("edgeHover", edge);
}
function fireNodeHover(node: ForceGraphNode | null) {
    emit("nodeHover", node);
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
// Zoom + pan state (framed by the fit-to-content box, Feature 5). The base
// frame is `contentBox` (not 0,0,w,h). Zoom is a scale multiplier and pan
// is an offset in SVG coords, both relative to that base frame:
//   vbW = baseW / zoomScale,  vbH = baseH / zoomScale
//   vbX = baseX + panX,       vbY = baseY + panY
// -------------------------------------------------------------------------
const zoomScale = ref(1);
const panX = ref(0);
const panY = ref(0);
const isPanning = ref(false);
let panStart = { x: 0, y: 0, panX: 0, panY: 0 };
const svgEl = ref<SVGSVGElement | null>(null);
// Base frame dimensions = fit-to-content box.
const baseW = computed(() => contentBox.value.w);
const baseH = computed(() => contentBox.value.h);
const baseX = computed(() => contentBox.value.x);
const baseY = computed(() => contentBox.value.y);
const vbW = computed(() => baseW.value / zoomScale.value);
const vbH = computed(() => baseH.value / zoomScale.value);
const vbX = computed(() => baseX.value + panX.value);
const vbY = computed(() => baseY.value + panY.value);
function resetView() {
    zoomScale.value = 1;
    panX.value = 0;
    panY.value = 0;
}
function handleWheel(ev: WheelEvent) {
    if (prefersReducedMotion.value)
        return;
    ev.preventDefault();
    // Zoom factor: ~10% per step.
    const factor = ev.deltaY > 0 ? 0.9 : 1.1;
    // Clamp zoom: 0.2x – 8x.
    const newScale = Math.min(Math.max(zoomScale.value * factor, 0.2), 8);
    // Anchor zoom around the cursor position in SVG coords.
    if (svgEl.value) {
        const rect = svgEl.value.getBoundingClientRect();
        const curW = baseW.value / zoomScale.value;
        const curH = baseH.value / zoomScale.value;
        const cursorSvgX = vbX.value + ((ev.clientX - rect.left) / rect.width) * curW;
        const cursorSvgY = vbY.value + ((ev.clientY - rect.top) / rect.height) * curH;
        const newVbW = baseW.value / newScale;
        const newVbH = baseH.value / newScale;
        const ratioX = (cursorSvgX - vbX.value) / curW;
        const ratioY = (cursorSvgY - vbY.value) / curH;
        // New top-left so the cursor anchor stays put, then back out the pan term.
        panX.value = cursorSvgX - ratioX * newVbW - baseX.value;
        panY.value = cursorSvgY - ratioY * newVbH - baseY.value;
    }
    zoomScale.value = newScale;
}
function handleBgMouseDown(ev: MouseEvent) {
    // Only start pan when clicking the background (not a node/edge element).
    if ((ev.target as Element).closest(".st-forceGraph__node"))
        return;
    if (prefersReducedMotion.value)
        return;
    isPanning.value = true;
    panStart = { x: ev.clientX, y: ev.clientY, panX: panX.value, panY: panY.value };
}
function handleMouseMove(ev: MouseEvent) {
    if (!isPanning.value || !svgEl.value)
        return;
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
let mountedSvg: SVGSVGElement | null = null;
onMounted(() => {
    mountedSvg = svgEl.value;
    mountedSvg?.addEventListener('wheel', handleWheel, { passive: false });
    motionQuery?.addEventListener?.('change', updateReducedMotion);
});
onUnmounted(() => {
    disposed = true; cancelMergeRaf();
    mountedSvg?.removeEventListener('wheel', handleWheel); mountedSvg = null;
    motionQuery?.removeEventListener?.('change', updateReducedMotion);
});
const hoveredNode = computed(() => hoveredNodeIndex.value === null ? undefined : positionedNodes.value[hoveredNodeIndex.value]);
const hoveredEdge = computed(() => positionedEdges.value.find(edge => edge.i === hoveredEdgeIndex.value));
const relationCount = computed(() => positionedEdges.value.filter(edge => edge.edge.source === hoveredNode.value?.node.id || edge.edge.target === hoveredNode.value?.node.id).length);
const edgeClass = (e: (typeof positionedEdges.value)[number]) => classNames('st-forceGraph__edge', e.edge.weak && 'st-forceGraph__edge--weak', e.edge.emphasis && 'st-forceGraph__edge--emphasis', hoveredEdgeIndex.value === e.i && 'st-forceGraph__edge--hovered', (isEdgeSelectionDimmed(e.edge) || isHoverDimmedEdge(e.edge)) && 'st-forceGraph__edge--dim', mergeEdgeOpacity(e.edge) !== undefined && 'st-forceGraph__edge--merging');
</script>

<template>
  <div :class="classNames('st-forceGraph', prefersReducedMotion && 'st-forceGraph--static', props.class)" role="img" :aria-label="label">
    <svg ref="svgEl" :viewBox="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true"
      :class="{ 'st-forceGraph__svg--panning': isPanning }" @mousedown="handleBgMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp" @mouseleave="handleMouseUp">
      <g class="st-forceGraph__edges">
        <template v-for="e in positionedEdges" :key="e.i">
          <path v-if="e.path" class="st-forceGraph__edgeHit" role="presentation" :d="e.path" fill="none" @mouseenter="hoveredEdgeIndex = e.i; fireEdgeHover(e.edge)" @mouseleave="hoveredEdgeIndex = null" />
          <line v-else class="st-forceGraph__edgeHit" role="presentation" :x1="e.x1" :y1="e.y1" :x2="e.x2" :y2="e.y2" @mouseenter="hoveredEdgeIndex = e.i; fireEdgeHover(e.edge)" @mouseleave="hoveredEdgeIndex = null" />
          <path v-if="e.path" :class="edgeClass(e)" :d="e.path" fill="none" :stroke-dasharray="e.dashArray ?? undefined" :stroke-width="e.strokeWidth ?? undefined" :opacity="mergeEdgeOpacity(e.edge)" pointer-events="none" />
          <line v-else :class="edgeClass(e)" :x1="e.x1" :y1="e.y1" :x2="e.x2" :y2="e.y2" :stroke-dasharray="e.dashArray ?? undefined" :stroke-width="e.strokeWidth ?? undefined" :opacity="mergeEdgeOpacity(e.edge)" pointer-events="none" />
        </template>
      </g>
      <g class="st-forceGraph__nodes">
        <g v-for="p in positionedNodes" :key="p.node.id"
          :class="classNames('st-forceGraph__node', `st-forceGraph__node--${p.tone}`, (isHoverDimmedNode(p.node.id) || isSelectionDimmed(p.node.id)) && 'st-forceGraph__node--dim', selectedSet.has(p.node.id) && 'st-forceGraph__node--selected', focusId === p.node.id && 'st-forceGraph__node--focus', (mergeFromId === p.node.id || isMasked(p.node.id)) && 'st-forceGraph__node--merging')"
          :aria-hidden="isMasked(p.node.id) ? 'true' : undefined" :opacity="mergeNodeOpacity(p.node.id)" :transform="`translate(${p.x + mergeOffset(p.node.id).x} ${p.y + mergeOffset(p.node.id).y})`"
          >
          <path v-if="p.shapePath" class="st-forceGraph__shape st-forceGraph__dot" :d="p.shapePath" tabindex="0" role="button" :aria-label="`${p.title}${p.node.group !== undefined ? `: ${p.node.group}` : ''}`" :aria-pressed="selectedSet.has(p.node.id)"
            @click="fireSelect(p.node.id)" @dblclick="fireOpenEntity(p.node.id)"
            @mouseenter="hoveredNodeIndex = p.i; fireNodeHover(p.node)" @mouseleave="hoveredNodeIndex = null; fireNodeHover(null)" @focus="hoveredNodeIndex = p.i; fireNodeHover(p.node)" @blur="hoveredNodeIndex = null; fireNodeHover(null)" @keydown="handleNodeKeydown(p.node.id, $event)" />
          <circle v-else class="st-forceGraph__dot" :r="p.r" tabindex="0" role="button" :aria-label="`${p.title}${p.node.group !== undefined ? `: ${p.node.group}` : ''}`" :aria-pressed="selectedSet.has(p.node.id)"
            @click="fireSelect(p.node.id)" @dblclick="fireOpenEntity(p.node.id)"
            @mouseenter="hoveredNodeIndex = p.i; fireNodeHover(p.node)" @mouseleave="hoveredNodeIndex = null; fireNodeHover(null)" @focus="hoveredNodeIndex = p.i; fireNodeHover(p.node)" @blur="hoveredNodeIndex = null; fireNodeHover(null)" @keydown="handleNodeKeydown(p.node.id, $event)" />
          <text v-if="showLabels" class="st-forceGraph__label" :x="p.r + 3" y="0" dominant-baseline="middle">{{ p.title }}</text>
        </g>
      </g>
    </svg>
    <div v-if="hoveredNode" class="st-forceGraph__tooltip" role="presentation" :style="`left: ${((hoveredNode.x - vbX) / vbW) * 100}%; top: ${((hoveredNode.y - vbY) / vbH) * 100}%`">
      <span class="st-forceGraph__tooltipLabel">{{ hoveredNode.title }}</span>
      <span v-if="hoveredNode.node.group !== undefined" class="st-forceGraph__tooltipMeta">{{ hoveredNode.node.group }}</span>
      <span v-if="relationCount > 0" class="st-forceGraph__tooltipMeta">{{ relationCount }} relation{{ relationCount === 1 ? '' : 's' }}</span>
    </div>
    <div v-if="hoveredEdge" class="st-forceGraph__tooltip st-forceGraph__tooltip--edge" role="presentation" :style="`left: ${((hoveredEdge.midX - vbX) / vbW) * 100}%; top: ${((hoveredEdge.midY - vbY) / vbH) * 100}%`">
      <span class="st-forceGraph__tooltipLabel">{{ hoveredEdge.srcLabel }}</span>
      <span v-if="hoveredEdge.edge.relation" class="st-forceGraph__tooltipRelation">{{ hoveredEdge.edge.relation }}</span>
      <span class="st-forceGraph__tooltipLabel">{{ hoveredEdge.tgtLabel }}</span>
    </div>
    <button v-if="isZoomed" class="st-forceGraph__resetBtn" type="button" :aria-label="resetViewLabel" @click="resetView">↺</button>
    <div v-if="legend && legend.length > 0" class="st-forceGraph__legend" :aria-label="legendLabel">
      <div v-for="(entry, index) in legend" :key="index" class="st-forceGraph__legendEntry">
        <svg v-if="entry.shape !== undefined" class="st-forceGraph__legendSwatch" viewBox="-13 -13 26 26" width="16" height="16" aria-hidden="true">
          <path v-if="nodeShapePath(entry.shape, 7)" :d="nodeShapePath(entry.shape, 7)!" :class="`st-forceGraph__legendShape st-forceGraph__legendShape--${entry.tone ?? 'category1'}`" />
          <circle v-else r="7" :class="`st-forceGraph__legendShape st-forceGraph__legendShape--${entry.tone ?? 'category1'}`" />
        </svg>
        <svg v-else class="st-forceGraph__legendSwatch" viewBox="0 0 16 8" width="16" height="8" aria-hidden="true">
          <line x1="0" y1="4" x2="16" y2="4" :class="['st-forceGraph__legendEdge', { 'st-forceGraph__legendEdge--weak': entry.weak }]" :stroke-dasharray="edgeDashArray(entry.dash, entry.weak) ?? undefined" />
        </svg>
        <span class="st-forceGraph__legendLabel">{{ entry.label }}</span>
      </div>
    </div>
  </div>
</template>

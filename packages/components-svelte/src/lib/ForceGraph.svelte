<script lang="ts" module>
  export * from "@sentropic/graph/presentation";
</script>

<script lang="ts">
import { positionForceNodes, positionForceEdges, forceGraphContentBox, MERGE_DURATION_MS, easeInOut } from '@sentropic/graph/presentation';

  import { nodeShapePath, edgeDashArray, type ForceGraphTone, type ForceGraphNodeShape, type ForceGraphNode, type ForceGraphEdge, type ForceGraphEdgeDash, type ForceGraphLegendEntry } from "@sentropic/graph/presentation";
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

  // ---------------------------------------------------------------------------
  // Tone assignment: explicit tone wins, else stable per-group, else per-index.
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Node layout (GD-M2-DS-PRESENTATION): delegated to `@sentropic/graph/processing`.
  // `computeLayout` is the upstream extraction of this component's former local
  // simulation (same FNV-1a/mulberry32 deterministic seed, same fx/fy pin and
  // repulsion-clamp semantics), so this file holds no physics of its own. The pure
  // `./processing` and `./presentation` subpaths are imported — never the package root, which would
  // drag the WebGL renderer into every consumer bundle.
  // ---------------------------------------------------------------------------
  import { computeLayout } from "@sentropic/graph/processing";

  function runSimulation(
    ns: ForceGraphNode[],
    es: ForceGraphEdge[],
    w: number,
    h: number,
    ticks: number,
    repulsionFactor: number
  ): Map<string, { x: number; y: number }> {
    const results = computeLayout(ns, es, {
      width: w,
      height: h,
      iterations: ticks,
      repulsion: repulsionFactor
    });
    const out = new Map<string, { x: number; y: number }>();
    for (const r of results) out.set(r.id, { x: r.x, y: r.y });
    return out;
  }

  // SSR-safe reduced-motion check (window may be undefined during SSR/tests).
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The whole layout is recomputed when inputs change. Under reduced motion we
  // settle the layout fully and never animate. Otherwise the same settled
  // layout is used as the rendered target — a static, deterministic frame —
  // which keeps the component framework-light and test-friendly while still
  // honouring the motion preference (no rAF loop, no jitter).
  const layout = $derived.by(() => {
    const ticks = Math.max(1, Math.round(iterations));
    return runSimulation(nodes, edges, width, height, ticks, repulsion);
  });

  const positionedNodes = $derived(positionForceNodes(nodes, layout, width, height, nodeRadius));

  // Curvature offset factor: how far (relative to chord length) the control
  // point bows out at edgeCurve=1. Kept modest so edgeCurve≈0.15 reads "light".

  // ---------------------------------------------------------------------------
  // Fit-to-content (Feature 5): after warmup the layout may extend beyond the
  // nominal width/height. Compute the real content bounding-box (node centres
  // ± radius) and frame it with an 8% margin on each side. The base viewBox is
  // this frame (not the fixed 0,0,w,h), so the graph is centred and never
  // clipped, whatever the aspect ratio. Zoom/pan stay relative to this frame.
  // ---------------------------------------------------------------------------

  const contentBox = $derived(forceGraphContentBox(positionedNodes, width, height));

  const positionedEdges = $derived(positionForceEdges(nodes, edges, layout, edgeCurve));

  // ---------------------------------------------------------------------------
  // Merge animation (reconciliation): when `mergePair` becomes a new valid pair,
  // the `from` node slides toward `into` while fading out (node + incident
  // edges), then `onMergeComplete` fires. Purely visual — never mutates props.
  // Driven by a single $state holding per-merge progress (0→1). Under reduced
  // motion / SSR we skip straight to completion on a microtask.
  // ---------------------------------------------------------------------------

  // ease-in-out (cubic) for a smooth glide.

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

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
      const h = r * 0.85;
      return `M ${-h} ${-h} L ${h} ${-h} L ${h} ${h} L ${-h} ${h} Z`;
    }
    if (s === "triangle") {
      const h = r * 1.1;
      return `M 0 ${-h} L ${h * 0.9} ${h * 0.6} L ${-h * 0.9} ${h * 0.6} Z`;
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

  function runSimulation(
    ns: ForceGraphNode[],
    es: ForceGraphEdge[],
    w: number,
    h: number,
    ticks: number
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
        fixed
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
    return runSimulation(nodes, edges, width, height, ticks);
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

  const positionedEdges = $derived.by(() => {
    const nodeById = new Map(nodes.map((n) => [n.id, n]));
    return edges
      .map((e, i) => {
        const a = layout.get(e.source);
        const b = layout.get(e.target);
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
          tgtLabel: tgtNode?.label ?? e.target
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);
  });

  let hoveredNodeIndex: number | null = $state(null);
  let hoveredEdgeIndex: number | null = $state(null);

  // Fast lookup sets — recomputed only when selectedIds/focusId props change,
  // never when nodes/edges change.
  const selectedSet = $derived(new Set<string>(selectedIds));

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
  // Zoom + pan state (Feature 2)
  // Store zoom as a scale multiplier + pan offset so syncing with width/height
  // props is trivial (no stale-capture warnings).
  //   vbW = width / zoomScale,  vbH = height / zoomScale
  //   vbX / vbY = pan offset in SVG coordinate space
  // ---------------------------------------------------------------------------
  let zoomScale = $state(1);
  let panX = $state(0);
  let panY = $state(0);

  let isPanning = $state(false);
  let panStart = $state({ x: 0, y: 0, panX: 0, panY: 0 });
  let svgEl: SVGSVGElement | null = $state(null);

  // Derived viewBox dimensions always reflect current props + zoom.
  const vbW = $derived(width / zoomScale);
  const vbH = $derived(height / zoomScale);
  const vbX = $derived(panX);
  const vbY = $derived(panY);

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
      const cursorSvgX = panX + ((ev.clientX - rect.left) / rect.width) * (width / zoomScale);
      const cursorSvgY = panY + ((ev.clientY - rect.top) / rect.height) * (height / zoomScale);
      const newVbW = width / newScale;
      const newVbH = height / newScale;
      const ratioX = (cursorSvgX - panX) / (width / zoomScale);
      const ratioY = (cursorSvgY - panY) / (height / zoomScale);
      panX = cursorSvgX - ratioX * newVbW;
      panY = cursorSvgY - ratioY * newVbH;
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
        <!-- Invisible wider hit area for edge hover -->
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
        <line
          class="st-forceGraph__edge"
          class:st-forceGraph__edge--weak={e.edge.weak}
          class:st-forceGraph__edge--hovered={hoveredEdgeIndex === e.i}
          x1={e.x1}
          y1={e.y1}
          x2={e.x2}
          y2={e.y2}
          pointer-events="none"
        />
      {/each}
    </g>

    <g class="st-forceGraph__nodes">
      {#each positionedNodes as p (p.node.id)}
        <g
          class="st-forceGraph__node st-forceGraph__node--{p.tone}"
          class:st-forceGraph__node--dim={hoveredNodeIndex !== null && hoveredNodeIndex !== p.i}
          class:st-forceGraph__node--selected={selectedSet.has(p.node.id)}
          class:st-forceGraph__node--focus={focusId === p.node.id}
          transform="translate({p.x} {p.y})"
        >
          {#if p.shapePath}
            <path
              class="st-forceGraph__dot"
              d={p.shapePath}
              tabindex="0"
              role="button"
              aria-label="{p.title}{p.node.group !== undefined ? `: ${p.node.group}` : ''}"
              aria-pressed={selectedSet.has(p.node.id)}
              onmouseenter={() => (hoveredNodeIndex = p.i)}
              onmouseleave={() => (hoveredNodeIndex = null)}
              onfocus={() => (hoveredNodeIndex = p.i)}
              onblur={() => (hoveredNodeIndex = null)}
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
              onmouseenter={() => (hoveredNodeIndex = p.i)}
              onmouseleave={() => (hoveredNodeIndex = null)}
              onfocus={() => (hoveredNodeIndex = p.i)}
              onblur={() => (hoveredNodeIndex = null)}
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
      {@const midX = (e.x1 + e.x2) / 2}
      {@const midY = (e.y1 + e.y2) / 2}
      <div
        class="st-forceGraph__tooltip st-forceGraph__tooltip--edge"
        role="presentation"
        style="left: {((midX - vbX) / vbW) * 100}%; top: {((midY - vbY) / vbH) * 100}%"
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
      aria-label="Reset view"
      onclick={resetView}
    >
      ↺
    </button>
  {/if}

  <!-- Legend overlay -->
  {#if legend && legend.length > 0}
    <div class="st-forceGraph__legend" aria-label="Graph legend">
      {#each legend as entry}
        {@const swatchPath = entry.shape !== undefined ? nodeShapePath(entry.shape, 7) : null}
        {@const swatchTone = entry.tone ?? "category1"}
        <div class="st-forceGraph__legendEntry">
          {#if entry.shape !== undefined}
            <!-- Node shape legend entry -->
            <svg
              class="st-forceGraph__legendSwatch"
              viewBox="-8 -8 16 16"
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
    stroke-dasharray: 3 3;
    opacity: 0.5;
  }

  .st-forceGraph__edge--hovered {
    opacity: 0.9;
    stroke-width: 2;
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

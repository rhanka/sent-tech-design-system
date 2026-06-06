<script lang="ts" module>
  /**
   * SankeyChart - API canonique (référence Svelte, React/Vue doivent s'aligner)
   *
   * Props obligatoires :
   *   nodes  SankeyChartNode[]   - liste des nœuds {id, label, tone?}
   *   links  SankeyChartLink[]   - liste des liens {source, target, value, tone?}
   *                                 source/target = id d'un nœud existant ;
   *                                 les liens orphelins (nœud absent) sont rendus
   *                                 avec un fallback (pas de drop silencieux)
   *   label  string              - aria-label du graphique
   *
   * Props optionnelles :
   *   width   number  (défaut 560)   - largeur du viewBox en px
   *   height  number  (défaut 280)   - hauteur du viewBox en px
   *   class   string                 - classe CSS supplémentaire
   *
   * Layout :
   *   Hauteur d'un nœud = max(valeurs entrantes sommées, valeurs sortantes sommées)
   *   - conservation de flux : un nœud agrégateur occupe autant que la somme
   *     de ses flux, pas juste le max d'un lien individuel.
   */
  export type SankeyChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type SankeyChartNode = {
    id: string;
    label: string;
    tone?: SankeyChartTone;
  };

  export type SankeyChartLink = {
    source: string;
    target: string;
    value: number;
    tone?: SankeyChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type SankeyChartProps = {
    nodes: SankeyChartNode[];
    links: SankeyChartLink[];
    label: string;
    width?: number;
    height?: number;
    class?: string;
  };

  let {
    nodes,
    links,
    label,
    width = 560,
    height = 280,
    class: className
  }: SankeyChartProps = $props();

  const MARGIN = { top: 18, right: 26, bottom: 18, left: 26 };
  const NODE_WIDTH = 14;
  const TONES = [
    "category1",
    "category2",
    "category3",
    "category4",
    "category5",
    "category6",
    "category7",
    "category8"
  ] as const;

  function magnitude(value: number): number {
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  function nodeDepths(): Map<string, number> {
    const depths = new Map(nodes.map((node) => [node.id, 0]));
    for (let pass = 0; pass < nodes.length; pass += 1) {
      let changed = false;
      for (const link of links) {
        const sourceDepth = depths.get(link.source) ?? 0;
        const targetDepth = depths.get(link.target) ?? 0;
        if (sourceDepth + 1 > targetDepth) {
          depths.set(link.target, sourceDepth + 1);
          changed = true;
        }
      }
      if (!changed) break;
    }
    return depths;
  }

  let hoveredLinkIndex: number | null = $state(null);

  const nodeById = $derived(new Map(nodes.map((node) => [node.id, node])));

  // Conservation de flux : hauteur nœud = max(Σ flux sortants, Σ flux entrants)
  const nodeValues = $derived.by(() => {
    const valueOut = new Map<string, number>();
    const valueIn = new Map<string, number>();
    for (const node of nodes) {
      valueOut.set(node.id, 0);
      valueIn.set(node.id, 0);
    }
    for (const link of links) {
      const value = magnitude(link.value);
      valueOut.set(link.source, (valueOut.get(link.source) ?? 0) + value);
      valueIn.set(link.target, (valueIn.get(link.target) ?? 0) + value);
    }
    const values = new Map<string, number>();
    for (const node of nodes) {
      values.set(node.id, Math.max(valueOut.get(node.id) ?? 0, valueIn.get(node.id) ?? 0));
    }
    return values;
  });

  const layout = $derived.by(() => {
    const depths = nodeDepths();
    const maxDepth = Math.max(0, ...Array.from(depths.values()));
    const plotWidth = Math.max(width - MARGIN.left - MARGIN.right - NODE_WIDTH, 1);
    const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
    const maxNodeValue = Math.max(1, ...Array.from(nodeValues.values()));
    const byDepth = new Map<number, SankeyChartNode[]>();

    nodes.forEach((node) => {
      const depth = depths.get(node.id) ?? 0;
      const bucket = byDepth.get(depth) ?? [];
      bucket.push(node);
      byDepth.set(depth, bucket);
    });

    const positionedNodes = nodes.map((node, index) => {
      const depth = depths.get(node.id) ?? 0;
      const bucket = byDepth.get(depth) ?? [node];
      const row = Math.max(0, bucket.findIndex((entry) => entry.id === node.id));
      const slot = plotHeight / Math.max(bucket.length, 1);
      const nodeHeight = Math.max(24, Math.min(slot * 0.72, 18 + ((nodeValues.get(node.id) ?? 0) / maxNodeValue) * 54));
      const x = MARGIN.left + (maxDepth === 0 ? plotWidth / 2 : (plotWidth * depth) / maxDepth);
      const y = MARGIN.top + slot * row + (slot - nodeHeight) / 2;
      const tone = node.tone ?? TONES[index % TONES.length];
      return {
        node,
        tone,
        x,
        y,
        width: NODE_WIDTH,
        height: nodeHeight,
        centerY: y + nodeHeight / 2
      };
    });

    const positionedById = new Map(positionedNodes.map((node) => [node.node.id, node]));
    const maxLinkValue = Math.max(1, ...links.map((link) => magnitude(link.value)));

    const positionedLinks = links.map((link, index) => {
      const source = positionedById.get(link.source);
      const target = positionedById.get(link.target);
      const fallbackY = MARGIN.top + plotHeight / 2;
      const x1 = (source?.x ?? MARGIN.left) + NODE_WIDTH;
      const y1 = source?.centerY ?? fallbackY;
      const x2 = target?.x ?? width - MARGIN.right;
      const y2 = target?.centerY ?? fallbackY;
      const c = Math.max(32, Math.abs(x2 - x1) * 0.5);
      return {
        link,
        source,
        target,
        tone: link.tone ?? source?.tone ?? TONES[index % TONES.length],
        width: Math.max(2, (magnitude(link.value) / maxLinkValue) * 18),
        path: `M ${x1} ${y1} C ${x1 + c} ${y1}, ${x2 - c} ${y2}, ${x2} ${y2}`,
        midX: (x1 + x2) / 2,
        midY: (y1 + y2) / 2
      };
    });

    return { nodes: positionedNodes, links: positionedLinks };
  });

  const dataValueItems = $derived(
    links.map((link) => {
      const source = nodeById.get(link.source)?.label ?? link.source;
      const target = nodeById.get(link.target)?.label ?? link.target;
      return `${source} -> ${target}: ${link.value}`;
    })
  );

  function handleVisualPointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredLinkIndex = null;
      return;
    }
    const index = Number(target.getAttribute("data-link-index"));
    hoveredLinkIndex = Number.isInteger(index) ? index : null;
  }

  const classes = () => ["st-sankeyChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-sankeyChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handleVisualPointerMove}
    onpointerleave={() => (hoveredLinkIndex = null)}
  >
    <svg
      viewBox="0 0 {width} {height}"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
      <g class="st-sankeyChart__links">
        {#each layout.links as flow, i (`${flow.link.source}-${flow.link.target}-${i}`)}
          <path
            class="st-sankeyChart__link st-sankeyChart__link--{flow.tone}"
            class:st-sankeyChart__link--dim={hoveredLinkIndex !== null && hoveredLinkIndex !== i}
            d={flow.path}
            stroke-width={flow.width}
            data-link-index={i}
          />
        {/each}
      </g>

      <g class="st-sankeyChart__nodes">
        {#each layout.nodes as entry (entry.node.id)}
          <rect
            class="st-sankeyChart__node st-sankeyChart__node--{entry.tone}"
            x={entry.x}
            y={entry.y}
            width={entry.width}
            height={entry.height}
            rx="2"
          />
          <text
            class="st-sankeyChart__nodeLabel"
            x={entry.x + entry.width + 6}
            y={entry.centerY}
            dominant-baseline="middle"
          >
            {entry.node.label}
          </text>
        {/each}
      </g>
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredLinkIndex !== null && layout.links[hoveredLinkIndex]}
    {@const flow = layout.links[hoveredLinkIndex]}
    <div
      class="st-sankeyChart__tooltip"
      role="presentation"
      style="left: {(flow.midX / width) * 100}%; top: {(flow.midY / height) * 100}%"
    >
      <span class="st-sankeyChart__tooltipLabel">{flow.source?.node.label ?? flow.link.source} -> {flow.target?.node.label ?? flow.link.target}</span>
      <span class="st-sankeyChart__tooltipValue">{flow.link.value}</span>
    </div>
  {/if}
</div>

<style>
  .st-sankeyChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    max-width: 100%;
    position: relative;
    width: 100%;
  }

  .st-sankeyChart svg,
  .st-sankeyChart__visual {
    display: block;
    overflow: visible;
  }

  .st-sankeyChart__link {
    cursor: pointer;
    fill: none;
    opacity: 0.38;
    stroke-linecap: round;
    transition: opacity 120ms ease;
  }

  .st-sankeyChart__link:hover {
    opacity: 0.62;
  }

  .st-sankeyChart__link--dim {
    opacity: 0.16;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-sankeyChart__link {
      transition: none;
    }
  }

  .st-sankeyChart__node {
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 1;
  }

  .st-sankeyChart__link--category1,
  .st-sankeyChart__node--category1 { stroke: var(--st-semantic-data-category1); fill: var(--st-semantic-data-category1); }
  .st-sankeyChart__link--category2,
  .st-sankeyChart__node--category2 { stroke: var(--st-semantic-data-category2); fill: var(--st-semantic-data-category2); }
  .st-sankeyChart__link--category3,
  .st-sankeyChart__node--category3 { stroke: var(--st-semantic-data-category3); fill: var(--st-semantic-data-category3); }
  .st-sankeyChart__link--category4,
  .st-sankeyChart__node--category4 { stroke: var(--st-semantic-data-category4); fill: var(--st-semantic-data-category4); }
  .st-sankeyChart__link--category5,
  .st-sankeyChart__node--category5 { stroke: var(--st-semantic-data-category5); fill: var(--st-semantic-data-category5); }
  .st-sankeyChart__link--category6,
  .st-sankeyChart__node--category6 { stroke: var(--st-semantic-data-category6); fill: var(--st-semantic-data-category6); }
  .st-sankeyChart__link--category7,
  .st-sankeyChart__node--category7 { stroke: var(--st-semantic-data-category7); fill: var(--st-semantic-data-category7); }
  .st-sankeyChart__link--category8,
  .st-sankeyChart__node--category8 { stroke: var(--st-semantic-data-category8); fill: var(--st-semantic-data-category8); }

  .st-sankeyChart__nodeLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
  }

  .st-sankeyChart__tooltip {
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
    transform: translate(-50%, -115%);
    white-space: nowrap;
    z-index: 1;
  }

  .st-sankeyChart__tooltipLabel {
    font-weight: 600;
  }

  .st-sankeyChart__tooltipValue {
    opacity: 0.85;
  }
</style>

<script lang="ts" module>
  /**
   * ArcDiagramChart - API canonique (référence Svelte, React/Vue doivent s'aligner)
   *
   * Représente des liens pondérés entre nœuds alignés sur un axe horizontal (bas).
   * Chaque nœud est un point sur la ligne, dont la taille croît avec son degré
   * pondéré (somme des poids de ses liens) ; chaque lien est un arc en demi-cercle
   * tracé AU-DESSUS de la ligne reliant ses deux nœuds, dont l'épaisseur croît avec
   * le poids et dont la couleur reprend celle du nœud source.
   *
   * Props obligatoires :
   *   data   ArcDiagramChartLink[]  - liste de liens {from, to, weight}
   *                                   from/to = identifiants de nœuds (string) ;
   *                                   un nœud est créé pour chaque identifiant cité,
   *                                   dans l'ordre d'apparition (union from/to).
   *   label  string                 - aria-label du graphique
   *
   * Props optionnelles :
   *   labels?  Record<string,string>  - libellés d'affichage par identifiant de nœud
   *   width    number  (défaut 480)   - largeur du viewBox en px
   *   height   number  (défaut 240)   - hauteur du viewBox en px
   *   class    string                 - classe CSS supplémentaire
   *
   * Garde : seuls les liens dont `weight` est fini et > 0 sont pris en compte.
   * Les liens NaN / Infinity / négatifs / nuls sont ignorés silencieusement.
   */
  export type ArcDiagramChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type ArcDiagramChartLink = {
    from: string;
    to: string;
    weight: number;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";
  import GraphLegend from "./GraphLegend.svelte";

  type ArcDiagramChartProps = {
    data: ArcDiagramChartLink[];
    label: string;
    labels?: Record<string, string>;
    width?: number;
    height?: number;
    class?: string;
  };

  let {
    data,
    label,
    labels,
    width = 480,
    height = 240,
    class: className
  }: ArcDiagramChartProps = $props();

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

  const MARGIN_X = 24; // marge horizontale pour les premiers/derniers nœuds
  const BASELINE_PAD = 28; // distance du bas réservée aux marqueurs/libellés
  const MIN_NODE_R = 4;
  const MAX_NODE_R = 9;

  function magnitude(value: number): number {
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  function displayLabel(id: string): string {
    return labels?.[id] ?? id;
  }

  let hoveredLinkIndex: number | null = $state(null);

  const layout = $derived.by(() => {
    const baselineY = height - BASELINE_PAD;

    const links = data
      .map((link, index) => ({ link, index, weight: magnitude(link.weight) }))
      .filter((entry) => entry.weight > 0);

    const order: string[] = [];
    const degree = new Map<string, number>();
    for (const { link, weight } of links) {
      for (const id of [link.from, link.to]) {
        if (!degree.has(id)) {
          degree.set(id, 0);
          order.push(id);
        }
      }
      degree.set(link.from, (degree.get(link.from) ?? 0) + weight);
      degree.set(link.to, (degree.get(link.to) ?? 0) + weight);
    }

    if (order.length === 0) {
      return { baselineY, nodes: [], arcs: [], nodeX: new Map<string, number>() };
    }

    const usable = Math.max(width - MARGIN_X * 2, 1);
    const step = order.length > 1 ? usable / (order.length - 1) : 0;
    const startX = order.length > 1 ? MARGIN_X : width / 2;

    const maxDegree = Math.max(1, ...order.map((id) => degree.get(id) ?? 0));

    type NodeDatum = {
      id: string;
      tone: ArcDiagramChartTone;
      x: number;
      r: number;
      value: number;
    };
    const nodeX = new Map<string, number>();
    const nodeTone = new Map<string, ArcDiagramChartTone>();
    const nodes: NodeDatum[] = order.map((id, index) => {
      const x = startX + step * index;
      const tone = TONES[index % TONES.length];
      const value = degree.get(id) ?? 0;
      const r = MIN_NODE_R + (MAX_NODE_R - MIN_NODE_R) * (value / maxDegree);
      nodeX.set(id, x);
      nodeTone.set(id, tone);
      return { id, tone, x, r, value };
    });

    const maxWeight = Math.max(1, ...links.map((entry) => entry.weight));
    type ArcDatum = {
      index: number;
      from: string;
      to: string;
      weight: number;
      tone: ArcDiagramChartTone;
      strokeWidth: number;
      path: string;
      midX: number;
      midY: number;
    };
    const arcs: ArcDatum[] = links.map(({ link, weight, index }) => {
      const x1 = nodeX.get(link.from)!;
      const x2 = nodeX.get(link.to)!;
      const left = Math.min(x1, x2);
      const right = Math.max(x1, x2);
      const radius = (right - left) / 2;
      const sweep = x1 <= x2 ? 1 : 0;
      // Demi-cercle au-dessus de la ligne (arc supérieur).
      const path = `M ${x1} ${baselineY} A ${radius} ${radius} 0 0 ${sweep} ${x2} ${baselineY}`;
      const tone = nodeTone.get(link.from)!;
      return {
        index,
        from: link.from,
        to: link.to,
        weight,
        tone,
        strokeWidth: Math.max(1.5, (weight / maxWeight) * 6),
        path,
        midX: (left + right) / 2,
        midY: baselineY - radius
      };
    });

    return { baselineY, nodes, arcs, nodeX };
  });

  const legendEntries = $derived(
    layout.nodes.map((node) => ({
      label: displayLabel(node.id),
      shape: "circle" as const,
      tone: node.tone
    }))
  );

  const dataValueItems = $derived(
    data
      .filter((link) => magnitude(link.weight) > 0)
      .map((link) => `${displayLabel(link.from)} -> ${displayLabel(link.to)}: ${link.weight}`)
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

  const classes = () => ["st-arcDiagramChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-arcDiagramChart__visual"
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
      <line
        class="st-arcDiagramChart__axis"
        x1={MARGIN_X}
        y1={layout.baselineY}
        x2={width - MARGIN_X}
        y2={layout.baselineY}
      />

      <g class="st-arcDiagramChart__arcs">
        {#each layout.arcs as arc (arc.index)}
          <path
            class="st-arcDiagramChart__arc st-arcDiagramChart__arc--{arc.tone}"
            class:st-arcDiagramChart__arc--dim={hoveredLinkIndex !== null && hoveredLinkIndex !== arc.index}
            d={arc.path}
            stroke-width={arc.strokeWidth}
            data-link-index={arc.index}
          />
        {/each}
      </g>

      <g class="st-arcDiagramChart__nodes">
        {#each layout.nodes as node (node.id)}
          <circle
            class="st-arcDiagramChart__node st-arcDiagramChart__node--{node.tone}"
            cx={node.x}
            cy={layout.baselineY}
            r={node.r}
          />
        {/each}
      </g>
    </svg>

    {#if legendEntries.length > 0}
      <GraphLegend class="st-arcDiagramChart__legend" entries={legendEntries} />
    {/if}
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredLinkIndex !== null && layout.arcs.find((a) => a.index === hoveredLinkIndex)}
    {@const arc = layout.arcs.find((a) => a.index === hoveredLinkIndex)!}
    <div
      class="st-arcDiagramChart__tooltip"
      role="presentation"
      style="left: {(arc.midX / width) * 100}%; top: {(arc.midY / height) * 100}%"
    >
      <span class="st-arcDiagramChart__tooltipLabel">{displayLabel(arc.from)} -> {displayLabel(arc.to)}</span>
      <span class="st-arcDiagramChart__tooltipValue">{arc.weight}</span>
    </div>
  {/if}
</div>

<style>
  .st-arcDiagramChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    max-width: 100%;
    position: relative;
    width: 100%;
  }

  .st-arcDiagramChart svg,
  .st-arcDiagramChart__visual {
    display: block;
    overflow: visible;
  }

  .st-arcDiagramChart__visual {
    position: relative;
  }

  .st-arcDiagramChart__legend {
    position: absolute;
    right: 0;
    top: 0;
  }

  .st-arcDiagramChart__axis {
    stroke: var(--st-semantic-border-subtle, var(--st-semantic-text-secondary));
    stroke-width: 1;
  }

  .st-arcDiagramChart__arc {
    cursor: pointer;
    fill: none;
    stroke-opacity: 0.6;
    transition: opacity 120ms ease, stroke-opacity 120ms ease;
  }

  .st-arcDiagramChart__arc:hover {
    stroke-opacity: 0.85;
  }

  .st-arcDiagramChart__arc--dim {
    opacity: 0.18;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-arcDiagramChart__arc {
      transition: none;
    }
  }

  .st-arcDiagramChart__node {
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 1.5;
  }

  .st-arcDiagramChart__arc--category1,
  .st-arcDiagramChart__node--category1 { stroke: var(--st-semantic-data-category1); }
  .st-arcDiagramChart__node--category1 { fill: var(--st-semantic-data-category1); }
  .st-arcDiagramChart__arc--category2,
  .st-arcDiagramChart__node--category2 { stroke: var(--st-semantic-data-category2); }
  .st-arcDiagramChart__node--category2 { fill: var(--st-semantic-data-category2); }
  .st-arcDiagramChart__arc--category3,
  .st-arcDiagramChart__node--category3 { stroke: var(--st-semantic-data-category3); }
  .st-arcDiagramChart__node--category3 { fill: var(--st-semantic-data-category3); }
  .st-arcDiagramChart__arc--category4,
  .st-arcDiagramChart__node--category4 { stroke: var(--st-semantic-data-category4); }
  .st-arcDiagramChart__node--category4 { fill: var(--st-semantic-data-category4); }
  .st-arcDiagramChart__arc--category5,
  .st-arcDiagramChart__node--category5 { stroke: var(--st-semantic-data-category5); }
  .st-arcDiagramChart__node--category5 { fill: var(--st-semantic-data-category5); }
  .st-arcDiagramChart__arc--category6,
  .st-arcDiagramChart__node--category6 { stroke: var(--st-semantic-data-category6); }
  .st-arcDiagramChart__node--category6 { fill: var(--st-semantic-data-category6); }
  .st-arcDiagramChart__arc--category7,
  .st-arcDiagramChart__node--category7 { stroke: var(--st-semantic-data-category7); }
  .st-arcDiagramChart__node--category7 { fill: var(--st-semantic-data-category7); }
  .st-arcDiagramChart__arc--category8,
  .st-arcDiagramChart__node--category8 { stroke: var(--st-semantic-data-category8); }
  .st-arcDiagramChart__node--category8 { fill: var(--st-semantic-data-category8); }

  .st-arcDiagramChart__tooltip {
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

  .st-arcDiagramChart__tooltipLabel {
    font-weight: 600;
  }

  .st-arcDiagramChart__tooltipValue {
    opacity: 0.85;
  }
</style>

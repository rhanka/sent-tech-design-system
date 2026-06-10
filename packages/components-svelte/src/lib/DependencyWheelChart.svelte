<script lang="ts" module>
  /**
   * DependencyWheelChart - API canonique (référence Svelte, React/Vue doivent s'aligner)
   *
   * Roue de dépendances : des nœuds sont répartis sur un cercle, chaque nœud
   * occupant un arc proportionnel à la somme des poids de ses liens (entrants +
   * sortants). Chaque lien pondéré est un ruban (path SVG passant par le centre)
   * dont l'épaisseur croît avec le poids, coloré par le nœud SOURCE.
   *
   * Props obligatoires :
   *   data   DependencyWheelChartLink[]  - liens {from, to, weight}
   *                                        from/to = identifiants de nœuds (string) ;
   *                                        un nœud est créé pour chaque identifiant cité.
   *   label  string                      - aria-label du graphique
   *
   * Props optionnelles :
   *   labels?  Record<string,string>  - libellés d'affichage par identifiant de
   *                                     nœud (sinon l'identifiant est utilisé)
   *   width    number  (défaut 480)    - largeur du viewBox en px
   *   height   number  (défaut 240)    - hauteur du viewBox en px
   *   class    string                  - classe CSS supplémentaire
   *
   * Garde : seuls les liens dont `weight` est fini et > 0 sont pris en compte.
   * Les liens NaN / Infinity / négatifs sont ignorés silencieusement (pas de crash).
   */
  export type DependencyWheelChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type DependencyWheelChartLink = {
    from: string;
    to: string;
    weight: number;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";
  import GraphLegend from "./GraphLegend.svelte";
  import { contrastTextForTone } from "./chartContrast.js";

  type DependencyWheelChartProps = {
    data: DependencyWheelChartLink[];
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
  }: DependencyWheelChartProps = $props();

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

  const GAP = 0.04; // espace angulaire entre arcs (rad)
  const ARC_WIDTH = 12; // épaisseur de l'anneau d'arcs

  function magnitude(value: number): number {
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  function displayLabel(id: string): string {
    return labels?.[id] ?? id;
  }

  function polar(cx: number, cy: number, radius: number, angle: number) {
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  }

  function arcPath(cx: number, cy: number, inner: number, outer: number, start: number, end: number): string {
    const large = end - start > Math.PI ? 1 : 0;
    const o0 = polar(cx, cy, outer, start);
    const o1 = polar(cx, cy, outer, end);
    const i1 = polar(cx, cy, inner, end);
    const i0 = polar(cx, cy, inner, start);
    return `M ${o0.x} ${o0.y} A ${outer} ${outer} 0 ${large} 1 ${o1.x} ${o1.y} L ${i1.x} ${i1.y} A ${inner} ${inner} 0 ${large} 0 ${i0.x} ${i0.y} Z`;
  }

  let hoveredLinkIndex: number | null = $state(null);

  const layout = $derived.by(() => {
    const cx = width / 2;
    const cy = height / 2;
    const outer = Math.max(Math.min(width, height) / 2 - 6, 1);
    const inner = Math.max(outer - ARC_WIDTH, 1);
    const ribbonRadius = Math.max(inner - 2, 0);

    // Liens valides + ordre d'apparition des nœuds (stable).
    const links = data
      .map((link, index) => ({ link, index, weight: magnitude(link.weight) }))
      .filter((entry) => entry.weight > 0);

    const order: string[] = [];
    const total = new Map<string, number>();
    for (const { link, weight } of links) {
      for (const id of [link.from, link.to]) {
        if (!total.has(id)) {
          total.set(id, 0);
          order.push(id);
        }
      }
      total.set(link.from, (total.get(link.from) ?? 0) + weight);
      total.set(link.to, (total.get(link.to) ?? 0) + weight);
    }

    const grandTotal = order.reduce((sum, id) => sum + (total.get(id) ?? 0), 0);
    if (order.length === 0 || grandTotal <= 0) {
      return { cx, cy, inner, outer, arcs: [], ribbons: [], legend: [] };
    }

    // Répartition angulaire : part proportionnelle - gap par nœud.
    const totalGap = GAP * order.length;
    const usable = Math.max(Math.PI * 2 - totalGap, 0.0001);
    type ArcInfo = {
      id: string;
      tone: DependencyWheelChartTone;
      cursor: number; // avance pour positionner les rubans
    };
    const arcMap = new Map<string, ArcInfo>();
    const arcs: Array<{
      id: string;
      tone: DependencyWheelChartTone;
      value: number;
      span: number;
      path: string;
      labelX: number;
      labelY: number;
      textColor: string;
    }> = [];

    let angle = -Math.PI / 2;
    order.forEach((id, index) => {
      const span = (usable * (total.get(id) ?? 0)) / grandTotal;
      const start = angle + GAP / 2;
      const end = start + span;
      angle = end + GAP / 2;
      const tone = TONES[index % TONES.length];
      const mid = (start + end) / 2;
      arcMap.set(id, { id, tone, cursor: start });
      const labelRadius = (inner + outer) / 2;
      const labelPoint = polar(cx, cy, labelRadius, mid);
      arcs.push({
        id,
        tone,
        value: total.get(id) ?? 0,
        span,
        path: arcPath(cx, cy, inner, outer, start, end),
        labelX: labelPoint.x,
        labelY: labelPoint.y,
        textColor: contrastTextForTone(tone)
      });
    });

    const maxWeight = Math.max(1, ...links.map((entry) => entry.weight));
    const ribbons = links.map(({ link, weight, index }) => {
      const source = arcMap.get(link.from)!;
      const target = arcMap.get(link.to)!;
      const sourceSpan = (usable * weight) / grandTotal;
      const targetSpan = (usable * weight) / grandTotal;
      const s0 = source.cursor;
      const s1 = source.cursor + sourceSpan;
      source.cursor = s1;
      const t0 = target.cursor;
      const t1 = target.cursor + targetSpan;
      target.cursor = t1;

      const ps0 = polar(cx, cy, ribbonRadius, s0);
      const ps1 = polar(cx, cy, ribbonRadius, s1);
      const pt0 = polar(cx, cy, ribbonRadius, t0);
      const pt1 = polar(cx, cy, ribbonRadius, t1);

      // Ruban : deux courbes quadratiques passant par le centre.
      const path =
        `M ${ps0.x} ${ps0.y} ` +
        `Q ${cx} ${cy} ${pt1.x} ${pt1.y} ` +
        `A ${ribbonRadius} ${ribbonRadius} 0 0 1 ${pt0.x} ${pt0.y} ` +
        `Q ${cx} ${cy} ${ps1.x} ${ps1.y} ` +
        `A ${ribbonRadius} ${ribbonRadius} 0 0 0 ${ps0.x} ${ps0.y} Z`;

      return {
        index,
        from: link.from,
        to: link.to,
        weight,
        tone: source.tone,
        strokeWidth: Math.max(1, (weight / maxWeight) * 4),
        path,
        midX: cx,
        midY: cy
      };
    });

    const legend = arcs.map((arc) => ({
      label: displayLabel(arc.id),
      shape: "circle" as const,
      tone: arc.tone
    }));

    return { cx, cy, inner, outer, arcs, ribbons, legend };
  });

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

  const classes = () => ["st-dependencyWheelChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-dependencyWheelChart__visual"
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
      <g class="st-dependencyWheelChart__ribbons">
        {#each layout.ribbons as ribbon (ribbon.index)}
          <path
            class="st-dependencyWheelChart__ribbon st-dependencyWheelChart__ribbon--{ribbon.tone}"
            class:st-dependencyWheelChart__ribbon--dim={hoveredLinkIndex !== null && hoveredLinkIndex !== ribbon.index}
            d={ribbon.path}
            stroke-width={ribbon.strokeWidth}
            data-link-index={ribbon.index}
          />
        {/each}
      </g>

      <g class="st-dependencyWheelChart__arcs">
        {#each layout.arcs as arc (arc.id)}
          <path
            class="st-dependencyWheelChart__arc st-dependencyWheelChart__arc--{arc.tone}"
            d={arc.path}
          />
          {#if arc.span > 0.34}
            <text
              class="st-dependencyWheelChart__arcLabel"
              x={arc.labelX}
              y={arc.labelY}
              text-anchor="middle"
              dominant-baseline="middle"
              fill={arc.textColor}
            >
              {displayLabel(arc.id)}
            </text>
          {/if}
        {/each}
      </g>
    </svg>

    {#if layout.legend.length > 0}
      <GraphLegend class="st-dependencyWheelChart__legend" entries={layout.legend} />
    {/if}
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredLinkIndex !== null && layout.ribbons.find((r) => r.index === hoveredLinkIndex)}
    {@const ribbon = layout.ribbons.find((r) => r.index === hoveredLinkIndex)!}
    <div
      class="st-dependencyWheelChart__tooltip"
      role="presentation"
      style="left: {(ribbon.midX / width) * 100}%; top: {(ribbon.midY / height) * 100}%"
    >
      <span class="st-dependencyWheelChart__tooltipLabel">{displayLabel(ribbon.from)} -> {displayLabel(ribbon.to)}</span>
      <span class="st-dependencyWheelChart__tooltipValue">{ribbon.weight}</span>
    </div>
  {/if}
</div>

<style>
  .st-dependencyWheelChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    max-width: 100%;
    position: relative;
    width: 100%;
  }

  .st-dependencyWheelChart svg,
  .st-dependencyWheelChart__visual {
    display: block;
    overflow: visible;
  }

  .st-dependencyWheelChart__visual {
    position: relative;
  }

  .st-dependencyWheelChart__legend {
    position: absolute;
    right: 0;
    top: 0;
  }

  .st-dependencyWheelChart__ribbon {
    cursor: pointer;
    fill-opacity: 0.4;
    stroke-opacity: 0.55;
    transition: opacity 120ms ease;
  }

  .st-dependencyWheelChart__ribbon:hover {
    fill-opacity: 0.62;
  }

  .st-dependencyWheelChart__ribbon--dim {
    opacity: 0.18;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-dependencyWheelChart__ribbon {
      transition: none;
    }
  }

  .st-dependencyWheelChart__arc {
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 1;
  }

  .st-dependencyWheelChart__arc--category1,
  .st-dependencyWheelChart__ribbon--category1 { fill: var(--st-semantic-data-category1); stroke: var(--st-semantic-data-category1); }
  .st-dependencyWheelChart__arc--category2,
  .st-dependencyWheelChart__ribbon--category2 { fill: var(--st-semantic-data-category2); stroke: var(--st-semantic-data-category2); }
  .st-dependencyWheelChart__arc--category3,
  .st-dependencyWheelChart__ribbon--category3 { fill: var(--st-semantic-data-category3); stroke: var(--st-semantic-data-category3); }
  .st-dependencyWheelChart__arc--category4,
  .st-dependencyWheelChart__ribbon--category4 { fill: var(--st-semantic-data-category4); stroke: var(--st-semantic-data-category4); }
  .st-dependencyWheelChart__arc--category5,
  .st-dependencyWheelChart__ribbon--category5 { fill: var(--st-semantic-data-category5); stroke: var(--st-semantic-data-category5); }
  .st-dependencyWheelChart__arc--category6,
  .st-dependencyWheelChart__ribbon--category6 { fill: var(--st-semantic-data-category6); stroke: var(--st-semantic-data-category6); }
  .st-dependencyWheelChart__arc--category7,
  .st-dependencyWheelChart__ribbon--category7 { fill: var(--st-semantic-data-category7); stroke: var(--st-semantic-data-category7); }
  .st-dependencyWheelChart__arc--category8,
  .st-dependencyWheelChart__ribbon--category8 { fill: var(--st-semantic-data-category8); stroke: var(--st-semantic-data-category8); }

  .st-dependencyWheelChart__arcLabel {
    /* fill calculé par contrastTextForTone() en inline - pas de couleur fixe */
    font-size: 0.6rem;
    font-weight: 600;
    pointer-events: none;
  }

  .st-dependencyWheelChart__tooltip {
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

  .st-dependencyWheelChart__tooltipLabel {
    font-weight: 600;
  }

  .st-dependencyWheelChart__tooltipValue {
    opacity: 0.85;
  }
</style>

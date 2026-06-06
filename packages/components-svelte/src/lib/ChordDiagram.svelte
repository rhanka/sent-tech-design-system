<script lang="ts" module>
  /**
   * ChordDiagram - API canonique (référence Svelte, React/Vue doivent s'aligner)
   *
   * Représente des flux pondérés entre nœuds répartis sur un cercle. Chaque nœud
   * occupe un arc proportionnel à la somme de ses flux (entrants + sortants) ;
   * chaque flux est un ruban (path SVG quadratique) reliant les deux arcs.
   *
   * Props obligatoires :
   *   data   ChordDiagramFlow[]  - liste de flux {from, to, value}
   *                                from/to = identifiants de nœuds (string) ;
   *                                un nœud est créé pour chaque identifiant cité.
   *   label  string              - aria-label du graphique
   *
   * Props optionnelles :
   *   labels?  Record<string,string>  - libellés d'affichage par identifiant de
   *                                     nœud (sinon l'identifiant est utilisé)
   *   width    number  (défaut 360)   - largeur du viewBox en px
   *   height   number  (défaut 360)   - hauteur du viewBox en px
   *   class    string                 - classe CSS supplémentaire
   *
   * Garde : seuls les flux dont `value` est finie et > 0 sont pris en compte.
   * Les flux NaN / Infinity / négatifs sont ignorés silencieusement (pas de crash).
   */
  export type ChordDiagramTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type ChordDiagramFlow = {
    from: string;
    to: string;
    value: number;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";
  import { contrastTextForTone } from "./chartContrast.js";

  type ChordDiagramProps = {
    data: ChordDiagramFlow[];
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
    width = 360,
    height = 360,
    class: className
  }: ChordDiagramProps = $props();

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
  const ARC_WIDTH = 14; // épaisseur de l'anneau d'arcs

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

  let hoveredFlowIndex: number | null = $state(null);

  const layout = $derived.by(() => {
    const cx = width / 2;
    const cy = height / 2;
    const outer = Math.max(Math.min(width, height) / 2 - 6, 1);
    const inner = Math.max(outer - ARC_WIDTH, 1);
    const ribbonRadius = Math.max(inner - 2, 0);

    // Flux valides + ordre d'apparition des nœuds (stable).
    const flows = data
      .map((flow, index) => ({ flow, index, value: magnitude(flow.value) }))
      .filter((entry) => entry.value > 0);

    const order: string[] = [];
    const total = new Map<string, number>();
    for (const { flow, value } of flows) {
      for (const id of [flow.from, flow.to]) {
        if (!total.has(id)) {
          total.set(id, 0);
          order.push(id);
        }
      }
      total.set(flow.from, (total.get(flow.from) ?? 0) + value);
      total.set(flow.to, (total.get(flow.to) ?? 0) + value);
    }

    const grandTotal = order.reduce((sum, id) => sum + (total.get(id) ?? 0), 0);
    if (order.length === 0 || grandTotal <= 0) {
      return { cx, cy, inner, outer, arcs: [], ribbons: [] };
    }

    // Répartition angulaire : part proportionnelle - gap par nœud.
    const totalGap = GAP * order.length;
    const usable = Math.max(Math.PI * 2 - totalGap, 0.0001);
    type ArcInfo = {
      id: string;
      tone: ChordDiagramTone;
      start: number;
      end: number;
      mid: number;
      cursor: number; // avance pour positionner les rubans
    };
    const arcMap = new Map<string, ArcInfo>();
    const arcs: Array<{
      id: string;
      tone: ChordDiagramTone;
      value: number;
      span: number;
      path: string;
      labelX: number;
      labelY: number;
      labelAngle: number;
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
      arcMap.set(id, { id, tone, start, end, mid, cursor: start });
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
        labelAngle: mid,
        textColor: contrastTextForTone(tone)
      });
    });

    const maxValue = Math.max(1, ...flows.map((entry) => entry.value));
    const ribbons = flows.map(({ flow, value, index }) => {
      const source = arcMap.get(flow.from)!;
      const target = arcMap.get(flow.to)!;
      const sourceSpan = (usable * value) / grandTotal;
      const targetSpan = (usable * value) / grandTotal;
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
        from: flow.from,
        to: flow.to,
        value,
        tone: source.tone,
        strokeWidth: Math.max(1, (value / maxValue) * 4),
        path,
        midX: cx,
        midY: cy
      };
    });

    return { cx, cy, inner, outer, arcs, ribbons };
  });

  const dataValueItems = $derived(
    data
      .filter((flow) => magnitude(flow.value) > 0)
      .map((flow) => `${displayLabel(flow.from)} -> ${displayLabel(flow.to)}: ${flow.value}`)
  );

  function handleVisualPointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredFlowIndex = null;
      return;
    }
    const index = Number(target.getAttribute("data-flow-index"));
    hoveredFlowIndex = Number.isInteger(index) ? index : null;
  }

  const classes = () => ["st-chordDiagram", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-chordDiagram__visual"
    role="img"
    aria-label={label}
    onpointermove={handleVisualPointerMove}
    onpointerleave={() => (hoveredFlowIndex = null)}
  >
    <svg
      viewBox="0 0 {width} {height}"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
      <g class="st-chordDiagram__ribbons">
        {#each layout.ribbons as ribbon (ribbon.index)}
          <path
            class="st-chordDiagram__ribbon st-chordDiagram__ribbon--{ribbon.tone}"
            class:st-chordDiagram__ribbon--dim={hoveredFlowIndex !== null && hoveredFlowIndex !== ribbon.index}
            d={ribbon.path}
            stroke-width={ribbon.strokeWidth}
            data-flow-index={ribbon.index}
          />
        {/each}
      </g>

      <g class="st-chordDiagram__arcs">
        {#each layout.arcs as arc (arc.id)}
          <path
            class="st-chordDiagram__arc st-chordDiagram__arc--{arc.tone}"
            d={arc.path}
          />
          {#if arc.span > 0.34}
            <text
              class="st-chordDiagram__arcLabel"
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
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredFlowIndex !== null && layout.ribbons.find((r) => r.index === hoveredFlowIndex)}
    {@const ribbon = layout.ribbons.find((r) => r.index === hoveredFlowIndex)!}
    <div
      class="st-chordDiagram__tooltip"
      role="presentation"
      style="left: {(ribbon.midX / width) * 100}%; top: {(ribbon.midY / height) * 100}%"
    >
      <span class="st-chordDiagram__tooltipLabel">{displayLabel(ribbon.from)} -> {displayLabel(ribbon.to)}</span>
      <span class="st-chordDiagram__tooltipValue">{ribbon.value}</span>
    </div>
  {/if}
</div>

<style>
  .st-chordDiagram {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    max-width: 100%;
    position: relative;
    width: 100%;
  }

  .st-chordDiagram svg,
  .st-chordDiagram__visual {
    display: block;
    overflow: visible;
  }

  .st-chordDiagram__ribbon {
    cursor: pointer;
    fill-opacity: 0.4;
    stroke-opacity: 0.55;
    transition: opacity 120ms ease;
  }

  .st-chordDiagram__ribbon:hover {
    fill-opacity: 0.62;
  }

  .st-chordDiagram__ribbon--dim {
    opacity: 0.18;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-chordDiagram__ribbon {
      transition: none;
    }
  }

  .st-chordDiagram__arc {
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 1;
  }

  .st-chordDiagram__arc--category1,
  .st-chordDiagram__ribbon--category1 { fill: var(--st-semantic-data-category1); stroke: var(--st-semantic-data-category1); }
  .st-chordDiagram__arc--category2,
  .st-chordDiagram__ribbon--category2 { fill: var(--st-semantic-data-category2); stroke: var(--st-semantic-data-category2); }
  .st-chordDiagram__arc--category3,
  .st-chordDiagram__ribbon--category3 { fill: var(--st-semantic-data-category3); stroke: var(--st-semantic-data-category3); }
  .st-chordDiagram__arc--category4,
  .st-chordDiagram__ribbon--category4 { fill: var(--st-semantic-data-category4); stroke: var(--st-semantic-data-category4); }
  .st-chordDiagram__arc--category5,
  .st-chordDiagram__ribbon--category5 { fill: var(--st-semantic-data-category5); stroke: var(--st-semantic-data-category5); }
  .st-chordDiagram__arc--category6,
  .st-chordDiagram__ribbon--category6 { fill: var(--st-semantic-data-category6); stroke: var(--st-semantic-data-category6); }
  .st-chordDiagram__arc--category7,
  .st-chordDiagram__ribbon--category7 { fill: var(--st-semantic-data-category7); stroke: var(--st-semantic-data-category7); }
  .st-chordDiagram__arc--category8,
  .st-chordDiagram__ribbon--category8 { fill: var(--st-semantic-data-category8); stroke: var(--st-semantic-data-category8); }

  .st-chordDiagram__arcLabel {
    /* fill calculé par contrastTextForTone() en inline - pas de couleur fixe */
    font-size: 0.7rem;
    font-weight: 600;
    pointer-events: none;
  }

  .st-chordDiagram__tooltip {
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

  .st-chordDiagram__tooltipLabel {
    font-weight: 600;
  }

  .st-chordDiagram__tooltipValue {
    opacity: 0.85;
  }
</style>

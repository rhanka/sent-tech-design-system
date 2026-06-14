<script lang="ts" module>
  /**
   * WaffleChart - grille N×M de cellules dont la proportion colorée encode la
   * part de chaque catégorie (façon Kibana « waffle »). Chaque catégorie occupe
   * `round(value / sum(values) * totalCells)` cellules consécutives ; la couleur
   * suit `tone` si fourni, sinon une teinte stable par index (category1..8).
   * Les cellules restantes forment une piste neutre. Légende des catégories sous
   * le graphe via ChartDataList.
   * API canonique (référence Svelte, React/Vue doivent s'aligner).
   *
   * Props obligatoires :
   *   data   WaffleChartDatum[]  - tableau {label, value, tone?}
   *
   * Props optionnelles :
   *   totalCells  number  (défaut 100, p.ex. 10×10)
   *   columns     number  (défaut 10)
   *   label       string
   *   size        number  (défaut 240) - côté du SVG en px
   *   class       string
   */
  export type WaffleTone =
    | "neutral" | "info" | "success" | "warning" | "error"
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  export type WaffleChartDatum = {
    label: string;
    value: number;
    tone?: WaffleTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type WaffleChartProps = {
    data: WaffleChartDatum[];
    totalCells?: number;
    columns?: number;
    label?: string;
    size?: number;
    class?: string;
  };

  let {
    data = [],
    totalCells = 100,
    columns = 10,
    label,
    size = 240,
    class: className
  }: WaffleChartProps = $props();

  const GAP = 2;

  const safeTotalCells = $derived(Math.max(Math.round(totalCells), 1));
  const safeColumns = $derived(Math.max(Math.round(columns), 1));
  const rowsCount = $derived(Math.ceil(safeTotalCells / safeColumns));

  // Normalise : filtre les catégories sans libellé et de valeur non finie/≤0.
  const validData = $derived(
    data.filter((d) => typeof d.label === "string" && d.label.length > 0 && Number.isFinite(d.value) && d.value > 0)
  );

  const total = $derived(validData.reduce((sum, d) => sum + d.value, 0));

  // Index categoryN (1..8, cyclé) par défaut ; un `tone` explicite l'emporte.
  const toneOf = (datum: WaffleChartDatum, index: number): WaffleTone =>
    datum.tone ?? (`category${(index % 8) + 1}` as WaffleTone);

  // Répartit safeTotalCells cellules : chaque catégorie occupe
  // round(value / total * safeTotalCells) cellules consécutives.
  const allocation = $derived.by(() => {
    if (total <= 0) return [] as { datum: WaffleChartDatum; tone: WaffleTone; cells: number; index: number }[];
    let used = 0;
    const out = validData.map((datum, index) => {
      const cells = Math.round((datum.value / total) * safeTotalCells);
      return { datum, tone: toneOf(datum, index), cells, index };
    });
    for (const a of out) used += a.cells;
    // Ajuste le dernier segment pour ne pas déborder safeTotalCells.
    const overflow = used - safeTotalCells;
    if (overflow !== 0 && out.length > 0) {
      const last = out[out.length - 1];
      last.cells = Math.max(0, last.cells - overflow);
    }
    return out;
  });

  // Aplatit en une suite de tons par index de cellule (piste neutre au-delà).
  const cellTones = $derived.by(() => {
    const tones: (WaffleTone | null)[] = [];
    for (const a of allocation) {
      for (let i = 0; i < a.cells && tones.length < safeTotalCells; i++) {
        tones.push(a.tone);
      }
    }
    while (tones.length < safeTotalCells) tones.push(null);
    return tones;
  });

  const cells = $derived.by(() => {
    const cellSize = (size - GAP * (safeColumns - 1)) / safeColumns;
    return cellTones.map((tone, index) => {
      const col = index % safeColumns;
      // Empile du bas vers le haut (ligne 0 = bas, façon waffle remplie depuis le pied).
      const rowFromTop = rowsCount - 1 - Math.floor(index / safeColumns);
      return {
        index,
        tone,
        x: col * (cellSize + GAP),
        y: rowFromTop * (cellSize + GAP),
        size: Math.max(cellSize, 1)
      };
    });
  });

  const svgHeight = $derived(rowsCount > 0 ? rowsCount * ((size - GAP * (safeColumns - 1)) / safeColumns) + GAP * (rowsCount - 1) : size);

  const legendItems = $derived(
    allocation.map((a) => ({
      label: a.datum.label,
      tone: a.tone,
      percent: total > 0 ? Math.round((a.datum.value / total) * 100) : 0
    }))
  );
  const hasLegend = $derived(allocation.length > 0);

  const dataValueItems = $derived(
    allocation.map(
      (a) => `${a.datum.label}: ${a.datum.value} (${total > 0 ? Math.round((a.datum.value / total) * 100) : 0}%)`
    )
  );

  const classes = () => ["st-waffleChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div class="st-waffleChart__visual" role="img" aria-label={label}>
    <svg
      viewBox="0 0 {size} {svgHeight}"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
      {#each cells as cell (cell.index)}
        <rect
          class={cell.tone
            ? `st-waffleChart__cell st-waffleChart__cell--${cell.tone}`
            : "st-waffleChart__cell st-waffleChart__cell--track"}
          x={cell.x}
          y={cell.y}
          width={cell.size}
          height={cell.size}
          rx="2"
        />
      {/each}
    </svg>
  </div>

  {#if hasLegend}
    <ul class="st-waffleChart__legend" aria-label={`Catégories de ${label ?? "waffle"}`}>
      {#each legendItems as item (item.label)}
        <li class="st-waffleChart__legendItem">
          <span class="st-waffleChart__legendSwatch st-waffleChart__legendSwatch--{item.tone}" aria-hidden="true"></span>
          {item.label} · {item.percent}%
        </li>
      {/each}
    </ul>
  {/if}

  <ChartDataList label={label ?? "waffle"} items={dataValueItems} />
</div>

<style>
  .st-waffleChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    max-width: 100%;
    position: relative;
  }

  .st-waffleChart svg,
  .st-waffleChart__visual {
    display: block;
    overflow: visible;
  }

  .st-waffleChart__cell {
    transition: opacity 120ms ease;
  }

  .st-waffleChart__cell--track {
    fill: var(--st-semantic-surface-subtle);
  }

  .st-waffleChart__cell--neutral { fill: var(--st-semantic-border-strong, var(--st-semantic-surface-subtle)); }
  .st-waffleChart__cell--info { fill: var(--st-semantic-feedback-info, var(--st-semantic-action-primary)); }
  .st-waffleChart__cell--success { fill: var(--st-semantic-feedback-success); }
  .st-waffleChart__cell--warning { fill: var(--st-semantic-feedback-warning); }
  .st-waffleChart__cell--error { fill: var(--st-semantic-feedback-error); }

  .st-waffleChart__cell--category1 { fill: var(--st-semantic-data-category1); }
  .st-waffleChart__cell--category2 { fill: var(--st-semantic-data-category2); }
  .st-waffleChart__cell--category3 { fill: var(--st-semantic-data-category3); }
  .st-waffleChart__cell--category4 { fill: var(--st-semantic-data-category4); }
  .st-waffleChart__cell--category5 { fill: var(--st-semantic-data-category5); }
  .st-waffleChart__cell--category6 { fill: var(--st-semantic-data-category6); }
  .st-waffleChart__cell--category7 { fill: var(--st-semantic-data-category7); }
  .st-waffleChart__cell--category8 { fill: var(--st-semantic-data-category8); }

  .st-waffleChart__legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-3, 0.75rem);
    list-style: none;
    margin: var(--st-spacing-2, 0.5rem) 0 0 0;
    padding: 0;
  }

  .st-waffleChart__legendItem {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    font-size: 0.75rem;
    gap: var(--st-spacing-1, 0.25rem);
    line-height: 1;
  }

  .st-waffleChart__legendSwatch {
    border-radius: var(--st-radius-sm, 0.25rem);
    display: inline-block;
    height: 0.625rem;
    width: 0.625rem;
  }
  .st-waffleChart__legendSwatch--neutral { background: var(--st-semantic-border-strong, var(--st-semantic-surface-subtle)); }
  .st-waffleChart__legendSwatch--info { background: var(--st-semantic-feedback-info, var(--st-semantic-action-primary)); }
  .st-waffleChart__legendSwatch--success { background: var(--st-semantic-feedback-success); }
  .st-waffleChart__legendSwatch--warning { background: var(--st-semantic-feedback-warning); }
  .st-waffleChart__legendSwatch--error { background: var(--st-semantic-feedback-error); }
  .st-waffleChart__legendSwatch--category1 { background: var(--st-semantic-data-category1); }
  .st-waffleChart__legendSwatch--category2 { background: var(--st-semantic-data-category2); }
  .st-waffleChart__legendSwatch--category3 { background: var(--st-semantic-data-category3); }
  .st-waffleChart__legendSwatch--category4 { background: var(--st-semantic-data-category4); }
  .st-waffleChart__legendSwatch--category5 { background: var(--st-semantic-data-category5); }
  .st-waffleChart__legendSwatch--category6 { background: var(--st-semantic-data-category6); }
  .st-waffleChart__legendSwatch--category7 { background: var(--st-semantic-data-category7); }
  .st-waffleChart__legendSwatch--category8 { background: var(--st-semantic-data-category8); }

  @media (prefers-reduced-motion: reduce) {
    .st-waffleChart__cell {
      transition: none;
    }
  }
</style>

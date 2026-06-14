<script lang="ts" module>
  /**
   * StatusHistoryChart - grille TEMPS × ENTITÉ dont chaque cellule encode un
   * STATUT DISCRET (façon Grafana « status history »). Une ligne (series) =
   * une séquence de buckets temporels ; chaque bucket est une cellule colorée
   * par son statut. Distinct de HeatmapChart (dégradé continu Low→High) : la
   * coloration suit un statut discret, comme StateTimelineChart encode l'état,
   * mais en GRILLE de buckets au lieu de segments contigus.
   * API canonique (référence Svelte, React/Vue doivent s'aligner).
   *
   * Modèle : lignes = series, colonnes = buckets temporels (ordre d'apparition
   * des `at`). La couleur suit `tone` si fourni, sinon dérive une teinte stable
   * par `value` (cycle sur category1..8). Étiquette de series à gauche
   * (ellipsis). Légende des statuts sous le graphe via ChartDataList.
   *
   * Props obligatoires :
   *   data   StatusHistorySeries[]  - tableau {series, buckets[]}
   *
   * Props optionnelles :
   *   label   string
   *   width   number  (défaut 640)
   *   height  number  (défaut 320)
   *   size    number  (alias de width)
   *   class   string
   */
  export type StatusHistoryTone =
    | "neutral" | "info" | "success" | "warning" | "error"
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  export type StatusHistoryBucket = {
    at: number;
    value: string | number;
    tone?: StatusHistoryTone;
  };

  export type StatusHistorySeries = {
    series: string;
    buckets: StatusHistoryBucket[];
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type StatusHistoryChartProps = {
    data: StatusHistorySeries[];
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
  };

  let {
    data = [],
    label,
    width,
    height = 320,
    size,
    class: className
  }: StatusHistoryChartProps = $props();

  const resolvedWidth = $derived(width ?? size ?? 640);

  const MARGIN = { top: 16, right: 16, bottom: 32, left: 132 };

  // Tronque une étiquette à la largeur de la marge gauche (approx. par char).
  function ellipsize(text: string, maxChars: number): string {
    if (text.length <= maxChars) return text;
    if (maxChars <= 1) return "…";
    return `${text.slice(0, maxChars - 1)}…`;
  }

  function formatTick(v: number): string {
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(1);
  }

  let hoveredKey: string | null = $state(null);

  const plotWidth = $derived(Math.max(resolvedWidth - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  // Normalise : filtre les series sans libellé et les buckets non finis.
  const validData = $derived(
    data
      .filter((d) => typeof d.series === "string" && d.series.length > 0)
      .map((d) => ({
        series: d.series,
        buckets: (d.buckets ?? [])
          .filter((b) => Number.isFinite(b.at))
          .map((b) => ({ at: b.at, value: b.value, tone: b.tone }))
      }))
  );

  // Colonnes temporelles distinctes (par `at`, croissant).
  const columnOrder = $derived.by(() => {
    const seen: number[] = [];
    for (const d of validData) {
      for (const b of d.buckets) {
        if (!seen.includes(b.at)) seen.push(b.at);
      }
    }
    return seen.sort((a, b) => a - b);
  });

  // Statuts distincts (ordre d'apparition) → index categoryN (1..8, cyclé) si
  // aucun `tone` explicite. Un `tone` sur un bucket l'emporte sur la dérivation.
  const statusOrder = $derived.by(() => {
    const seen: string[] = [];
    for (const d of validData) {
      for (const b of d.buckets) {
        const key = String(b.value);
        if (!seen.includes(key)) seen.push(key);
      }
    }
    return seen;
  });
  const explicitToneByStatus = $derived.by(() => {
    const map = new Map<string, StatusHistoryTone>();
    for (const d of validData) {
      for (const b of d.buckets) {
        if (b.tone) map.set(String(b.value), b.tone);
      }
    }
    return map;
  });
  const toneOf = (bucket: { value: string | number; tone?: StatusHistoryTone }): StatusHistoryTone => {
    if (bucket.tone) return bucket.tone;
    const key = String(bucket.value);
    const explicit = explicitToneByStatus.get(key);
    if (explicit) return explicit;
    const idx = statusOrder.indexOf(key);
    return `category${((idx < 0 ? 0 : idx) % 8) + 1}` as StatusHistoryTone;
  };
  const legendItems = $derived(
    statusOrder.map((value) => ({ value, tone: toneOf({ value }) }))
  );
  const hasLegend = $derived(statusOrder.length > 0);

  const rows = $derived.by(() => {
    if (validData.length === 0 || columnOrder.length === 0) return [];
    const band = plotHeight / validData.length;
    const rowHeight = Math.min(band * 0.62, 28);
    const colWidth = plotWidth / columnOrder.length;
    return validData.map((d, i) => {
      const y = MARGIN.top + band * i + (band - rowHeight) / 2;
      const cells = d.buckets.map((b, j) => {
        const colIndex = Math.max(0, columnOrder.indexOf(b.at));
        const x = MARGIN.left + colIndex * colWidth;
        const w = Math.max(colWidth - 2, 1);
        return {
          key: `${i}-${j}`,
          datum: b,
          x,
          width: w,
          cx: x + w / 2,
          tone: toneOf(b)
        };
      });
      return {
        datum: d,
        index: i,
        y,
        height: rowHeight,
        rowCenterY: MARGIN.top + band * (i + 0.5),
        cells
      };
    });
  });

  const columns = $derived.by(() => {
    if (columnOrder.length === 0) return [];
    const colWidth = plotWidth / columnOrder.length;
    return columnOrder.map((at, index) => ({
      at,
      cx: MARGIN.left + (index + 0.5) * colWidth
    }));
  });

  const dataValueItems = $derived(
    validData.map(
      (d) => `${d.series}: ${d.buckets.map((b) => `${b.at} = ${b.value}`).join(", ")}`
    )
  );

  function handlePointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredKey = null;
      return;
    }
    const key = target.getAttribute("data-chart-key");
    hoveredKey = key ?? null;
  }

  const hoveredCell = $derived.by(() => {
    if (hoveredKey === null) return null;
    for (const row of rows) {
      for (const cell of row.cells) {
        if (cell.key === hoveredKey) return { row, cell };
      }
    }
    return null;
  });

  const classes = () => ["st-statusHistoryChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-statusHistoryChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handlePointerMove}
    onpointerleave={() => (hoveredKey = null)}
  >
    <svg
      viewBox="0 0 {resolvedWidth} {height}"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
      <!-- tick labels (axe X temporel) -->
      {#each columns as column (column.at)}
        <text class="st-statusHistoryChart__tickLabel" x={column.cx} y={height - MARGIN.bottom + 16} text-anchor="middle">
          {formatTick(column.at)}
        </text>
      {/each}

      <!-- axes -->
      <line class="st-statusHistoryChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
      <line class="st-statusHistoryChart__axis" x1={MARGIN.left} x2={resolvedWidth - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

      <!-- une ligne par series : étiquette à gauche + cellules de statut par bucket -->
      {#each rows as row (`${row.index}-${row.datum.series}`)}
        <text
          class="st-statusHistoryChart__seriesLabel"
          x={MARGIN.left - 8}
          y={row.rowCenterY}
          text-anchor="end"
          dominant-baseline="middle"
        >
          {ellipsize(row.datum.series, 18)}
        </text>
        {#each row.cells as cell (cell.key)}
          <rect
            class="st-statusHistoryChart__cell st-statusHistoryChart__cell--{cell.tone}"
            class:st-statusHistoryChart__cell--dim={hoveredKey !== null && hoveredKey !== cell.key}
            x={cell.x}
            y={row.y}
            width={cell.width}
            height={row.height}
            rx="2"
            data-chart-key={cell.key}
          />
        {/each}
      {/each}
    </svg>
  </div>

  {#if hasLegend}
    <ul class="st-statusHistoryChart__legend" aria-label={`Statuts de ${label ?? "status history"}`}>
      {#each legendItems as item (item.value)}
        <li class="st-statusHistoryChart__legendItem">
          <span class="st-statusHistoryChart__legendSwatch st-statusHistoryChart__legendSwatch--{item.tone}" aria-hidden="true"></span>
          {item.value}
        </li>
      {/each}
    </ul>
  {/if}

  <ChartDataList label={label ?? "status history"} items={dataValueItems} />

  {#if hoveredCell}
    {@const cell = hoveredCell.cell}
    {@const row = hoveredCell.row}
    <div
      class="st-statusHistoryChart__tooltip"
      role="presentation"
      style="left: {(cell.cx / resolvedWidth) * 100}%; top: {(row.rowCenterY / height) * 100}%"
    >
      <span class="st-statusHistoryChart__tooltipLabel">{row.datum.series} · {cell.datum.at}</span>
      <span class="st-statusHistoryChart__tooltipValue">{cell.datum.value}</span>
    </div>
  {/if}
</div>

<style>
  .st-statusHistoryChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-statusHistoryChart svg {
    display: block;
    overflow: visible;
  }

  .st-statusHistoryChart__visual {
    display: block;
  }

  .st-statusHistoryChart__axis {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-statusHistoryChart__tickLabel,
  .st-statusHistoryChart__seriesLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
  }

  .st-statusHistoryChart__cell {
    cursor: pointer;
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 1;
    transition: opacity 120ms ease;
  }

  .st-statusHistoryChart__cell--dim {
    opacity: 0.4;
  }

  .st-statusHistoryChart__cell--neutral { fill: var(--st-semantic-border-strong, var(--st-semantic-surface-subtle)); }
  .st-statusHistoryChart__cell--info { fill: var(--st-semantic-feedback-info, var(--st-semantic-action-primary)); }
  .st-statusHistoryChart__cell--success { fill: var(--st-semantic-feedback-success); }
  .st-statusHistoryChart__cell--warning { fill: var(--st-semantic-feedback-warning); }
  .st-statusHistoryChart__cell--error { fill: var(--st-semantic-feedback-error); }

  .st-statusHistoryChart__cell--category1 { fill: var(--st-semantic-data-category1); }
  .st-statusHistoryChart__cell--category2 { fill: var(--st-semantic-data-category2); }
  .st-statusHistoryChart__cell--category3 { fill: var(--st-semantic-data-category3); }
  .st-statusHistoryChart__cell--category4 { fill: var(--st-semantic-data-category4); }
  .st-statusHistoryChart__cell--category5 { fill: var(--st-semantic-data-category5); }
  .st-statusHistoryChart__cell--category6 { fill: var(--st-semantic-data-category6); }
  .st-statusHistoryChart__cell--category7 { fill: var(--st-semantic-data-category7); }
  .st-statusHistoryChart__cell--category8 { fill: var(--st-semantic-data-category8); }

  .st-statusHistoryChart__legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-3, 0.75rem);
    list-style: none;
    margin: var(--st-spacing-2, 0.5rem) 0 0 0;
    padding: 0;
  }

  .st-statusHistoryChart__legendItem {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    font-size: 0.75rem;
    gap: var(--st-spacing-1, 0.25rem);
    line-height: 1;
  }

  .st-statusHistoryChart__legendSwatch {
    border-radius: var(--st-radius-sm, 0.25rem);
    display: inline-block;
    height: 0.625rem;
    width: 0.625rem;
  }
  .st-statusHistoryChart__legendSwatch--neutral { background: var(--st-semantic-border-strong, var(--st-semantic-surface-subtle)); }
  .st-statusHistoryChart__legendSwatch--info { background: var(--st-semantic-feedback-info, var(--st-semantic-action-primary)); }
  .st-statusHistoryChart__legendSwatch--success { background: var(--st-semantic-feedback-success); }
  .st-statusHistoryChart__legendSwatch--warning { background: var(--st-semantic-feedback-warning); }
  .st-statusHistoryChart__legendSwatch--error { background: var(--st-semantic-feedback-error); }
  .st-statusHistoryChart__legendSwatch--category1 { background: var(--st-semantic-data-category1); }
  .st-statusHistoryChart__legendSwatch--category2 { background: var(--st-semantic-data-category2); }
  .st-statusHistoryChart__legendSwatch--category3 { background: var(--st-semantic-data-category3); }
  .st-statusHistoryChart__legendSwatch--category4 { background: var(--st-semantic-data-category4); }
  .st-statusHistoryChart__legendSwatch--category5 { background: var(--st-semantic-data-category5); }
  .st-statusHistoryChart__legendSwatch--category6 { background: var(--st-semantic-data-category6); }
  .st-statusHistoryChart__legendSwatch--category7 { background: var(--st-semantic-data-category7); }
  .st-statusHistoryChart__legendSwatch--category8 { background: var(--st-semantic-data-category8); }

  .st-statusHistoryChart__tooltip {
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
    transform: translate(-50%, calc(-100% - 8px));
    white-space: nowrap;
    z-index: 1;
  }

  .st-statusHistoryChart__tooltipLabel {
    font-weight: 600;
  }

  .st-statusHistoryChart__tooltipValue {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-statusHistoryChart__cell {
      transition: none;
    }
  }
</style>

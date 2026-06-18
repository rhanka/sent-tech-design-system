<script lang="ts" module>
  /**
   * AnomalySwimLaneChart - heatmap TEMPS × JOB dont chaque cellule encode un
   * SCORE CONTINU (façon Kibana ML « anomaly swim lane »). Une ligne = un `job` ;
   * une colonne = un bucket temporel (trié par `at`). La couleur suit l'INTENSITÉ
   * du score normalisé 0..max sur l'échelle catégorielle continue (category1..8),
   * reprise de HeatmapChart. Distinct de StatusHistoryChart (statut DISCRET) : ici
   * le score est CONTINU → gradient d'intensité.
   * API canonique (référence Svelte, React/Vue doivent s'aligner).
   *
   * Props obligatoires :
   *   data   AnomalySwimLaneSeries[]  - tableau {job, buckets[]}
   *
   * Props optionnelles :
   *   max     number  (défaut dérivé du score max des data)
   *   label   string
   *   width   number  (défaut 520)
   *   height  number  (défaut 300)
   *   size    number  (alias de width)
   *   class   string
   */
  export type AnomalySwimLaneTone =
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  export type AnomalySwimLaneChartScale = "categorical" | "sequential";

  export type AnomalySwimLaneBucket = {
    at: number;
    score: number;
  };

  export type AnomalySwimLaneSeries = {
    job: string;
    buckets: AnomalySwimLaneBucket[];
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type AnomalySwimLaneChartProps = {
    data: AnomalySwimLaneSeries[];
    max?: number;
    scale?: AnomalySwimLaneChartScale;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
  };

  let {
    data = [],
    max,
    scale = "sequential",
    label,
    width,
    height = 300,
    size,
    class: className
  }: AnomalySwimLaneChartProps = $props();

  const resolvedWidth = $derived(width ?? size ?? 520);

  const MARGIN = { top: 28, right: 18, bottom: 44, left: 132 };
  const TONES = [
    "category1","category2","category3","category4","category5","category6","category7","category8"
  ] as const;

  // Échelle continue : intensité du score normalisé 0..max → category1..8 (reprise
  // de HeatmapChart). max ≤ 0 ou score non fini → category1 (intensité plancher).
  function toneForScore(score: number, scoreMax: number): AnomalySwimLaneTone {
    if (!Number.isFinite(score) || scoreMax <= 0) return "category1";
    const ratio = Math.max(0, Math.min(1, score / scoreMax));
    const index = Math.max(0, Math.min(TONES.length - 1, Math.floor(ratio * TONES.length)));
    return TONES[index];
  }

  function normalizedScale(value: AnomalySwimLaneChartScale | undefined): AnomalySwimLaneChartScale {
    return value === "categorical" ? "categorical" : "sequential";
  }

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
  const resolvedScale = $derived(normalizedScale(scale));

  const plotWidth = $derived(Math.max(resolvedWidth - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  // Normalise : filtre les jobs sans libellé et les buckets non finis.
  const validData = $derived(
    data
      .filter((d) => typeof d.job === "string" && d.job.length > 0)
      .map((d) => ({
        job: d.job,
        buckets: (d.buckets ?? [])
          .filter((b) => Number.isFinite(b.at))
          .map((b) => ({ at: b.at, score: b.score }))
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

  // Score max effectif : prop `max` si finie et > 0, sinon dérivée des data.
  const scoreMax = $derived.by(() => {
    if (typeof max === "number" && Number.isFinite(max) && max > 0) return max;
    const scores = validData.flatMap((d) => d.buckets.map((b) => b.score)).filter(Number.isFinite);
    return scores.length > 0 ? Math.max(...scores) : 1;
  });

  const rows = $derived.by(() => {
    if (validData.length === 0 || columnOrder.length === 0) return [];
    const band = plotHeight / validData.length;
    const rowHeight = Math.min(band * 0.78, 34);
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
          tone: toneForScore(b.score, scoreMax)
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
      (d) => `${d.job}: ${d.buckets.map((b) => `${b.at} = ${b.score}`).join(", ")}`
    )
  );

  const legendItems = $derived(TONES.map((tone) => ({ tone })));
  const hasLegend = $derived(validData.length > 0 && columnOrder.length > 0);

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

  const classes = () => ["st-anomalySwimLaneChart", `st-anomalySwimLaneChart--${resolvedScale}`, className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-anomalySwimLaneChart__visual"
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
        <text class="st-anomalySwimLaneChart__tickLabel" x={column.cx} y={height - MARGIN.bottom + 16} text-anchor="middle">
          {formatTick(column.at)}
        </text>
      {/each}

      <!-- axes -->
      <line class="st-anomalySwimLaneChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
      <line class="st-anomalySwimLaneChart__axis" x1={MARGIN.left} x2={resolvedWidth - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

      <!-- une ligne par job : étiquette à gauche + cellules de score par bucket -->
      {#each rows as row (`${row.index}-${row.datum.job}`)}
        <text
          class="st-anomalySwimLaneChart__jobLabel"
          x={MARGIN.left - 8}
          y={row.rowCenterY}
          text-anchor="end"
          dominant-baseline="middle"
        >
          {ellipsize(row.datum.job, 18)}
        </text>
        {#each row.cells as cell (cell.key)}
          <rect
            class="st-anomalySwimLaneChart__cell st-anomalySwimLaneChart__cell--{cell.tone}"
            class:st-anomalySwimLaneChart__cell--dim={hoveredKey !== null && hoveredKey !== cell.key}
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
    <div class="st-anomalySwimLaneChart__legend" aria-hidden="true">
      <span class="st-anomalySwimLaneChart__legendText">Low</span>
      <span class="st-anomalySwimLaneChart__legendRamp">
        {#each legendItems as item (item.tone)}
          <span class="st-anomalySwimLaneChart__legendSwatch st-anomalySwimLaneChart__legendSwatch--{item.tone}"></span>
        {/each}
      </span>
      <span class="st-anomalySwimLaneChart__legendText">High</span>
    </div>
  {/if}

  <ChartDataList label={label ?? "anomaly swim lane"} items={dataValueItems} />

  {#if hoveredCell}
    {@const cell = hoveredCell.cell}
    {@const row = hoveredCell.row}
    <div
      class="st-anomalySwimLaneChart__tooltip"
      role="presentation"
      style="left: {(cell.cx / resolvedWidth) * 100}%; top: {(row.rowCenterY / height) * 100}%"
    >
      <span class="st-anomalySwimLaneChart__tooltipLabel">{row.datum.job} · {cell.datum.at}</span>
      <span class="st-anomalySwimLaneChart__tooltipValue">{cell.datum.score}</span>
    </div>
  {/if}
</div>

<style>
  .st-anomalySwimLaneChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-anomalySwimLaneChart svg {
    display: block;
    overflow: visible;
  }

  .st-anomalySwimLaneChart__visual {
    display: block;
  }

  .st-anomalySwimLaneChart__axis {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-anomalySwimLaneChart__tickLabel,
  .st-anomalySwimLaneChart__jobLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
  }

  .st-anomalySwimLaneChart__cell {
    cursor: pointer;
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 1;
    transition: opacity 120ms ease;
  }

  .st-anomalySwimLaneChart__cell--dim {
    opacity: 0.4;
  }

  .st-anomalySwimLaneChart__cell--category1,
  .st-anomalySwimLaneChart__legendSwatch--category1 { fill: var(--st-semantic-data-category1); background: var(--st-semantic-data-category1); }
  .st-anomalySwimLaneChart__cell--category2,
  .st-anomalySwimLaneChart__legendSwatch--category2 { fill: var(--st-semantic-data-category2); background: var(--st-semantic-data-category2); }
  .st-anomalySwimLaneChart__cell--category3,
  .st-anomalySwimLaneChart__legendSwatch--category3 { fill: var(--st-semantic-data-category3); background: var(--st-semantic-data-category3); }
  .st-anomalySwimLaneChart__cell--category4,
  .st-anomalySwimLaneChart__legendSwatch--category4 { fill: var(--st-semantic-data-category4); background: var(--st-semantic-data-category4); }
  .st-anomalySwimLaneChart__cell--category5,
  .st-anomalySwimLaneChart__legendSwatch--category5 { fill: var(--st-semantic-data-category5); background: var(--st-semantic-data-category5); }
  .st-anomalySwimLaneChart__cell--category6,
  .st-anomalySwimLaneChart__legendSwatch--category6 { fill: var(--st-semantic-data-category6); background: var(--st-semantic-data-category6); }
  .st-anomalySwimLaneChart__cell--category7,
  .st-anomalySwimLaneChart__legendSwatch--category7 { fill: var(--st-semantic-data-category7); background: var(--st-semantic-data-category7); }
  .st-anomalySwimLaneChart__cell--category8,
  .st-anomalySwimLaneChart__legendSwatch--category8 { fill: var(--st-semantic-data-category8); background: var(--st-semantic-data-category8); }

  .st-anomalySwimLaneChart__legend {
    align-items: center;
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    margin-top: var(--st-spacing-2, 0.5rem);
  }

  .st-anomalySwimLaneChart__legendRamp {
    display: inline-grid;
    grid-template-columns: repeat(8, minmax(0.75rem, 1fr));
    min-width: 8rem;
  }

  .st-anomalySwimLaneChart__legendSwatch {
    display: block;
    height: 0.5rem;
  }

  .st-anomalySwimLaneChart__legendText {
    color: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
  }

  .st-anomalySwimLaneChart__tooltip {
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

  .st-anomalySwimLaneChart__tooltipLabel {
    font-weight: 600;
  }

  .st-anomalySwimLaneChart__tooltipValue {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-anomalySwimLaneChart__cell {
      transition: none;
    }
  }
</style>

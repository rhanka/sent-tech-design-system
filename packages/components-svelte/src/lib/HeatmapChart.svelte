<script lang="ts" module>
  /**
   * HeatmapChart - API canonique (référence Svelte, React/Vue doivent s'aligner)
   *
   * Props obligatoires :
   *   data   HeatmapChartDatum[]  - tableau {x, y, value, tone?}
   *   label  string               - aria-label du graphique
   *
   * Props optionnelles :
   *   legend  boolean  (défaut false) - affiche le gradient Low→High
   *   width   number   (défaut 480)   - largeur du viewBox en px
   *   height  number   (défaut 300)   - hauteur du viewBox en px
   *   class   string                  - classe CSS supplémentaire
   *
   * NaN/vide : les valeurs non-finies sont exclues du calcul min/max (gardé par
   *   Number.isFinite). Tableau vide ou tout-NaN → rendu vide sans crash.
   */
  export type HeatmapChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type HeatmapChartDatum = {
    x: string;
    y: string;
    value: number;
    tone?: HeatmapChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type HeatmapChartProps = {
    data: HeatmapChartDatum[];
    label: string;
    legend?: boolean;
    width?: number;
    height?: number;
    class?: string;
  };

  let {
    data,
    label,
    legend = false,
    width = 480,
    height = 300,
    class: className
  }: HeatmapChartProps = $props();

  const MARGIN = { top: 28, right: 18, bottom: 44, left: 64 };
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

  function uniqueInOrder(values: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const value of values) {
      if (!seen.has(value)) {
        seen.add(value);
        out.push(value);
      }
    }
    return out;
  }

  function toneForValue(value: number, min: number, max: number): HeatmapChartTone {
    if (!Number.isFinite(value) || max <= min) return "category1";
    const index = Math.max(0, Math.min(TONES.length - 1, Math.floor(((value - min) / (max - min)) * TONES.length)));
    return TONES[index];
  }

  let hoveredIndex: number | null = $state(null);

  const xLabels = $derived(uniqueInOrder(data.map((d) => d.x)));
  const yLabels = $derived(uniqueInOrder(data.map((d) => d.y)));
  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  const cells = $derived.by(() => {
    const values = data.map((d) => d.value).filter(Number.isFinite);
    const min = values.length > 0 ? Math.min(...values) : 0;
    const max = values.length > 0 ? Math.max(...values) : 1;
    const cellWidth = xLabels.length > 0 ? plotWidth / xLabels.length : plotWidth;
    const cellHeight = yLabels.length > 0 ? plotHeight / yLabels.length : plotHeight;

    return data.map((datum, index) => {
      const xIndex = Math.max(0, xLabels.indexOf(datum.x));
      const yIndex = Math.max(0, yLabels.indexOf(datum.y));
      return {
        datum,
        index,
        tone: datum.tone ?? toneForValue(datum.value, min, max),
        x: MARGIN.left + xIndex * cellWidth,
        y: MARGIN.top + yIndex * cellHeight,
        width: Math.max(cellWidth - 2, 1),
        height: Math.max(cellHeight - 2, 1),
        cx: MARGIN.left + xIndex * cellWidth + cellWidth / 2,
        cy: MARGIN.top + yIndex * cellHeight + cellHeight / 2
      };
    });
  });

  const dataValueItems = $derived(data.map((d) => `${d.y}, ${d.x}: ${d.value}`));

  const legendItems = $derived(
    TONES.map((tone, index) => ({
      tone,
      label: index === 0 ? "Low" : index === TONES.length - 1 ? "High" : ""
    }))
  );

  function handleVisualPointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredIndex = null;
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    hoveredIndex = Number.isInteger(index) ? index : null;
  }

  const classes = () => ["st-heatmapChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-heatmapChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handleVisualPointerMove}
    onpointerleave={() => (hoveredIndex = null)}
  >
    <svg
      viewBox="0 0 {width} {height}"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
      {#each yLabels as yLabel, row (yLabel)}
        <text
          class="st-heatmapChart__axisLabel st-heatmapChart__axisLabel--y"
          x={MARGIN.left - 8}
          y={MARGIN.top + (row + 0.5) * (plotHeight / Math.max(yLabels.length, 1))}
          text-anchor="end"
          dominant-baseline="middle"
        >
          {yLabel}
        </text>
      {/each}

      {#each xLabels as xLabel, column (xLabel)}
        <text
          class="st-heatmapChart__axisLabel st-heatmapChart__axisLabel--x"
          x={MARGIN.left + (column + 0.5) * (plotWidth / Math.max(xLabels.length, 1))}
          y={height - MARGIN.bottom + 20}
          text-anchor="middle"
        >
          {xLabel}
        </text>
      {/each}

      <rect
        class="st-heatmapChart__plot"
        x={MARGIN.left}
        y={MARGIN.top}
        width={plotWidth}
        height={plotHeight}
      />

      {#each cells as cell, i (`${cell.datum.y}-${cell.datum.x}-${i}`)}
        <rect
          class="st-heatmapChart__cell st-heatmapChart__cell--{cell.tone}"
          class:st-heatmapChart__cell--dim={hoveredIndex !== null && hoveredIndex !== i}
          x={cell.x}
          y={cell.y}
          width={cell.width}
          height={cell.height}
          rx="2"
          data-chart-index={i}
        />
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && cells[hoveredIndex]}
    {@const cell = cells[hoveredIndex]}
    <div
      class="st-heatmapChart__tooltip"
      role="presentation"
      style="left: {(cell.cx / width) * 100}%; top: {(cell.cy / height) * 100}%"
    >
      <span class="st-heatmapChart__tooltipLabel">{cell.datum.y}, {cell.datum.x}</span>
      <span class="st-heatmapChart__tooltipValue">{cell.datum.value}</span>
    </div>
  {/if}

  {#if legend}
    <div class="st-heatmapChart__legend" aria-hidden="true">
      <span class="st-heatmapChart__legendText">Low</span>
      <span class="st-heatmapChart__legendRamp">
        {#each legendItems as item (item.tone)}
          <span class="st-heatmapChart__legendSwatch st-heatmapChart__legendSwatch--{item.tone}"></span>
        {/each}
      </span>
      <span class="st-heatmapChart__legendText">High</span>
    </div>
  {/if}
</div>

<style>
  .st-heatmapChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    max-width: 100%;
    position: relative;
    width: 100%;
  }

  .st-heatmapChart svg,
  .st-heatmapChart__visual {
    display: block;
    overflow: visible;
  }

  .st-heatmapChart__plot {
    fill: none;
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-heatmapChart__axisLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
  }

  .st-heatmapChart__cell {
    cursor: pointer;
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 1;
    transition: opacity 120ms ease;
  }

  .st-heatmapChart__cell--dim {
    opacity: 0.45;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-heatmapChart__cell {
      transition: none;
    }
  }

  .st-heatmapChart__cell--category1,
  .st-heatmapChart__legendSwatch--category1 { fill: var(--st-semantic-data-category1); background: var(--st-semantic-data-category1); }
  .st-heatmapChart__cell--category2,
  .st-heatmapChart__legendSwatch--category2 { fill: var(--st-semantic-data-category2); background: var(--st-semantic-data-category2); }
  .st-heatmapChart__cell--category3,
  .st-heatmapChart__legendSwatch--category3 { fill: var(--st-semantic-data-category3); background: var(--st-semantic-data-category3); }
  .st-heatmapChart__cell--category4,
  .st-heatmapChart__legendSwatch--category4 { fill: var(--st-semantic-data-category4); background: var(--st-semantic-data-category4); }
  .st-heatmapChart__cell--category5,
  .st-heatmapChart__legendSwatch--category5 { fill: var(--st-semantic-data-category5); background: var(--st-semantic-data-category5); }
  .st-heatmapChart__cell--category6,
  .st-heatmapChart__legendSwatch--category6 { fill: var(--st-semantic-data-category6); background: var(--st-semantic-data-category6); }
  .st-heatmapChart__cell--category7,
  .st-heatmapChart__legendSwatch--category7 { fill: var(--st-semantic-data-category7); background: var(--st-semantic-data-category7); }
  .st-heatmapChart__cell--category8,
  .st-heatmapChart__legendSwatch--category8 { fill: var(--st-semantic-data-category8); background: var(--st-semantic-data-category8); }

  .st-heatmapChart__legend {
    align-items: center;
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    margin-top: var(--st-spacing-2, 0.5rem);
  }

  .st-heatmapChart__legendRamp {
    display: inline-grid;
    grid-template-columns: repeat(8, minmax(0.75rem, 1fr));
    min-width: 8rem;
  }

  .st-heatmapChart__legendSwatch {
    display: block;
    height: 0.5rem;
  }

  .st-heatmapChart__legendText {
    color: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
  }

  .st-heatmapChart__tooltip {
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

  .st-heatmapChart__tooltipLabel {
    font-weight: 600;
  }

  .st-heatmapChart__tooltipValue {
    opacity: 0.85;
  }
</style>

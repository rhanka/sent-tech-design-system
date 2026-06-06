<script lang="ts" module>
  /**
   * HistogramChart - API canonique (référence Svelte, React/Vue doivent s'aligner)
   *
   * Props obligatoires :
   *   data   HistogramChartDatum[] | number[]
   *          - si tableau de nombres : bins numériques calculés automatiquement
   *          - si tableau de {label, value, tone?} : bins pré-calculés (passthrough)
   *   label  string  - aria-label du graphique
   *
   * Props optionnelles :
   *   bins    number  (défaut 10)  - nombre de bins pour le mode numérique.
   *                                  Défaut fixe = 10 (pas ceil(√n)) pour parité
   *                                  Svelte/React/Vue et prédictibilité.
   *   width   number  (défaut 480) - largeur du viewBox en px
   *   height  number  (défaut 240) - hauteur du viewBox en px
   *   class   string               - classe CSS supplémentaire
   *
   * NaN/vide : les valeurs non-finies sont exclues avant le binning (filter
   *   Number.isFinite). Tableau vide → rendu vide sans crash.
   */
  export type HistogramChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type HistogramChartDatum = {
    label: string;
    value: number;
    tone?: HistogramChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type HistogramChartProps = {
    data: HistogramChartDatum[] | number[];
    bins?: number;
    label: string;
    width?: number;
    height?: number;
    class?: string;
  };

  type HistogramBin = {
    label: string;
    value: number;
    tone: HistogramChartTone;
  };

  let {
    data,
    bins,
    label,
    width = 480,
    height = 240,
    class: className
  }: HistogramChartProps = $props();

  const MARGIN = { top: 14, right: 16, bottom: 36, left: 44 };
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

  function isNumberArray(values: HistogramChartDatum[] | number[]): values is number[] {
    return values.every((value) => typeof value === "number");
  }

  function formatNumber(value: number): string {
    if (!Number.isFinite(value)) return "0";
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(2).replace(/\.?0+$/, "");
  }

  function buildNumericBins(values: number[], count: number): HistogramBin[] {
    const finite = values.filter(Number.isFinite);
    if (finite.length === 0) return [];
    const binCount = Math.max(1, Math.floor(count));
    const min = Math.min(...finite);
    const max = Math.max(...finite);
    const step = max === min ? 1 : (max - min) / binCount;
    const out = Array.from({ length: binCount }, (_, index) => {
      const start = min + step * index;
      const end = index === binCount - 1 ? max : min + step * (index + 1);
      return {
        label: `${formatNumber(start)}-${formatNumber(end)}`,
        value: 0,
        tone: TONES[index % TONES.length]
      };
    });

    for (const value of finite) {
      const index = value === max ? binCount - 1 : Math.max(0, Math.min(binCount - 1, Math.floor((value - min) / step)));
      out[index].value += 1;
    }

    return out;
  }

  function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number) {
    if (d1 === d0) return r0;
    return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
  }

  let hoveredIndex: number | null = $state(null);

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  const normalizedBins = $derived.by<HistogramBin[]>(() => {
    if (isNumberArray(data)) {
      return buildNumericBins(data, bins ?? 10);
    }

    return data.map((datum, index) => ({
      label: datum.label,
      value: Number.isFinite(datum.value) ? datum.value : 0,
      tone: datum.tone ?? TONES[index % TONES.length]
    }));
  });

  const bars = $derived.by(() => {
    const maxValue = Math.max(0, ...normalizedBins.map((bin) => bin.value));
    const safeMax = maxValue > 0 ? maxValue : 1;
    const band = normalizedBins.length > 0 ? plotWidth / normalizedBins.length : plotWidth;
    const barWidth = Math.max(band * 0.68, 1);

    return normalizedBins.map((bin, index) => {
      const h = scaleLinear(bin.value, 0, safeMax, 0, plotHeight);
      return {
        bin,
        x: MARGIN.left + band * index + (band - barWidth) / 2,
        y: MARGIN.top + plotHeight - h,
        width: barWidth,
        height: Math.max(h, 0.5),
        labelX: MARGIN.left + band * (index + 0.5)
      };
    });
  });

  const dataValueItems = $derived(normalizedBins.map((bin) => `${bin.label}: ${bin.value}`));

  function handleVisualPointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredIndex = null;
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    hoveredIndex = Number.isInteger(index) ? index : null;
  }

  const classes = () => ["st-histogramChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-histogramChart__visual"
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
      <line class="st-histogramChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
      <line class="st-histogramChart__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

      {#each bars as bar, i (bar.bin.label)}
        <rect
          class="st-histogramChart__bar st-histogramChart__bar--{bar.bin.tone}"
          class:st-histogramChart__bar--dim={hoveredIndex !== null && hoveredIndex !== i}
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          data-chart-index={i}
        />
        <text class="st-histogramChart__label" x={bar.labelX} y={height - MARGIN.bottom + 16} text-anchor="middle">
          {bar.bin.label}
        </text>
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && bars[hoveredIndex]}
    {@const bar = bars[hoveredIndex]}
    <div
      class="st-histogramChart__tooltip"
      role="presentation"
      style="left: {(bar.labelX / width) * 100}%; top: {(bar.y / height) * 100}%"
    >
      <span class="st-histogramChart__tooltipLabel">{bar.bin.label}</span>
      <span class="st-histogramChart__tooltipValue">{bar.bin.value}</span>
    </div>
  {/if}
</div>

<style>
  .st-histogramChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    max-width: 100%;
    position: relative;
    width: 100%;
  }

  .st-histogramChart svg,
  .st-histogramChart__visual {
    display: block;
    overflow: visible;
  }

  .st-histogramChart__axis {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-histogramChart__label {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.7rem;
  }

  .st-histogramChart__bar {
    cursor: pointer;
    transition: opacity 120ms ease;
  }

  .st-histogramChart__bar--dim {
    opacity: 0.45;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-histogramChart__bar {
      transition: none;
    }
  }

  .st-histogramChart__bar--category1 { fill: var(--st-semantic-data-category1); }
  .st-histogramChart__bar--category2 { fill: var(--st-semantic-data-category2); }
  .st-histogramChart__bar--category3 { fill: var(--st-semantic-data-category3); }
  .st-histogramChart__bar--category4 { fill: var(--st-semantic-data-category4); }
  .st-histogramChart__bar--category5 { fill: var(--st-semantic-data-category5); }
  .st-histogramChart__bar--category6 { fill: var(--st-semantic-data-category6); }
  .st-histogramChart__bar--category7 { fill: var(--st-semantic-data-category7); }
  .st-histogramChart__bar--category8 { fill: var(--st-semantic-data-category8); }

  .st-histogramChart__tooltip {
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

  .st-histogramChart__tooltipLabel {
    font-weight: 600;
  }

  .st-histogramChart__tooltipValue {
    opacity: 0.85;
  }
</style>

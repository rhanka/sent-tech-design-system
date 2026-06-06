<script lang="ts" module>
  /**
   * BoxPlotChart - API canonique (référence Svelte, React/Vue doivent s'aligner)
   *
   * Props obligatoires :
   *   data   BoxPlotChartDatum[]  - tableau {label, min, q1, median, q3, max, outliers?, tone?}
   *   label  string               - aria-label du graphique
   *
   * Props optionnelles :
   *   width   number  (défaut 480) - largeur du viewBox en px
   *   height  number  (défaut 260) - hauteur du viewBox en px
   *   class   string               - classe CSS supplémentaire
   *
   * NaN/vide : les valeurs non-finies sont exclues du domaine (filter Number.isFinite).
   *   Tableau vide → rendu vide sans crash.
   *   Note : l'ordre min≤q1≤median≤q3≤max n'est pas imposé par clamp mais rendu
   *   tel quel (abs() sur la hauteur de boîte) ; les données incohérentes produisent
   *   un rendu plausible mais peuvent induire en erreur.
   */
  export type BoxPlotChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type BoxPlotChartDatum = {
    label: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    outliers?: number[];
    tone?: BoxPlotChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type BoxPlotChartProps = {
    data: BoxPlotChartDatum[];
    label: string;
    width?: number;
    height?: number;
    class?: string;
  };

  let {
    data,
    label,
    width = 480,
    height = 260,
    class: className
  }: BoxPlotChartProps = $props();

  const MARGIN = { top: 16, right: 20, bottom: 38, left: 48 };
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

  function formatNumber(value: number): string {
    if (!Number.isFinite(value)) return "0";
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(2).replace(/\.?0+$/, "");
  }

  function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number) {
    if (d1 === d0) return r0;
    return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
  }

  let hoveredIndex: number | null = $state(null);

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  const domain = $derived.by(() => {
    const values = data.flatMap((datum) => [
      datum.min,
      datum.q1,
      datum.median,
      datum.q3,
      datum.max,
      ...(datum.outliers ?? [])
    ]).filter(Number.isFinite);
    if (values.length === 0) return { min: 0, max: 1 };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min) * 0.08 || Math.max(Math.abs(max), 1) * 0.1;
    return { min: min - pad, max: max + pad };
  });

  const plots = $derived.by(() => {
    const band = data.length > 0 ? plotWidth / data.length : plotWidth;
    const boxWidth = Math.min(54, Math.max(18, band * 0.44));

    return data.map((datum, index) => {
      const cx = MARGIN.left + band * (index + 0.5);
      const y = (value: number) => MARGIN.top + scaleLinear(value, domain.min, domain.max, plotHeight, 0);
      const q1Y = y(datum.q1);
      const q3Y = y(datum.q3);
      const minY = y(datum.min);
      const maxY = y(datum.max);
      return {
        datum,
        tone: datum.tone ?? TONES[index % TONES.length],
        cx,
        boxX: cx - boxWidth / 2,
        boxY: Math.min(q1Y, q3Y),
        boxWidth,
        boxHeight: Math.max(Math.abs(q1Y - q3Y), 1),
        medianY: y(datum.median),
        minY,
        maxY,
        capWidth: boxWidth * 0.72,
        outliers: (datum.outliers ?? []).filter(Number.isFinite).map((value) => ({ value, y: y(value) }))
      };
    });
  });

  const dataValueItems = $derived(
    data.map((datum) => {
      const summary = `${datum.label}: min ${formatNumber(datum.min)}, q1 ${formatNumber(datum.q1)}, median ${formatNumber(datum.median)}, q3 ${formatNumber(datum.q3)}, max ${formatNumber(datum.max)}`;
      const outliers = datum.outliers?.length ? `, outliers ${datum.outliers.map(formatNumber).join(", ")}` : "";
      return `${summary}${outliers}`;
    })
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

  const classes = () => ["st-boxPlotChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-boxPlotChart__visual"
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
      <line class="st-boxPlotChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
      <line class="st-boxPlotChart__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

      {#each plots as plot, i (plot.datum.label)}
        <line class="st-boxPlotChart__whisker" x1={plot.cx} x2={plot.cx} y1={plot.minY} y2={plot.maxY} data-chart-index={i} />
        <line class="st-boxPlotChart__whiskerCap" x1={plot.cx - plot.capWidth / 2} x2={plot.cx + plot.capWidth / 2} y1={plot.minY} y2={plot.minY} data-chart-index={i} />
        <line class="st-boxPlotChart__whiskerCap" x1={plot.cx - plot.capWidth / 2} x2={plot.cx + plot.capWidth / 2} y1={plot.maxY} y2={plot.maxY} data-chart-index={i} />
        <rect
          class="st-boxPlotChart__box st-boxPlotChart__box--{plot.tone}"
          class:st-boxPlotChart__box--dim={hoveredIndex !== null && hoveredIndex !== i}
          x={plot.boxX}
          y={plot.boxY}
          width={plot.boxWidth}
          height={plot.boxHeight}
          data-chart-index={i}
        />
        <line class="st-boxPlotChart__median" x1={plot.boxX} x2={plot.boxX + plot.boxWidth} y1={plot.medianY} y2={plot.medianY} data-chart-index={i} />
        {#each plot.outliers as outlier (`${plot.datum.label}-${outlier.value}`)}
          <circle class="st-boxPlotChart__outlier" cx={plot.cx} cy={outlier.y} r="3" data-chart-index={i} />
        {/each}
        <text class="st-boxPlotChart__label" x={plot.cx} y={height - MARGIN.bottom + 16} text-anchor="middle">
          {plot.datum.label}
        </text>
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && plots[hoveredIndex]}
    {@const plot = plots[hoveredIndex]}
    <div
      class="st-boxPlotChart__tooltip"
      role="presentation"
      style="left: {(plot.cx / width) * 100}%; top: {(plot.medianY / height) * 100}%"
    >
      <span class="st-boxPlotChart__tooltipLabel">{plot.datum.label}</span>
      <span class="st-boxPlotChart__tooltipValue">Median {formatNumber(plot.datum.median)}</span>
    </div>
  {/if}
</div>

<style>
  .st-boxPlotChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    max-width: 100%;
    position: relative;
    width: 100%;
  }

  .st-boxPlotChart svg,
  .st-boxPlotChart__visual {
    display: block;
    overflow: visible;
  }

  .st-boxPlotChart__axis,
  .st-boxPlotChart__whisker,
  .st-boxPlotChart__whiskerCap {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-boxPlotChart__median {
    stroke: var(--st-semantic-text-primary);
    stroke-width: 2;
  }

  .st-boxPlotChart__box {
    cursor: pointer;
    fill-opacity: 0.72;
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 1;
    transition: opacity 120ms ease;
  }

  .st-boxPlotChart__box--dim {
    opacity: 0.45;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-boxPlotChart__box {
      transition: none;
    }
  }

  .st-boxPlotChart__box--category1 { fill: var(--st-semantic-data-category1); }
  .st-boxPlotChart__box--category2 { fill: var(--st-semantic-data-category2); }
  .st-boxPlotChart__box--category3 { fill: var(--st-semantic-data-category3); }
  .st-boxPlotChart__box--category4 { fill: var(--st-semantic-data-category4); }
  .st-boxPlotChart__box--category5 { fill: var(--st-semantic-data-category5); }
  .st-boxPlotChart__box--category6 { fill: var(--st-semantic-data-category6); }
  .st-boxPlotChart__box--category7 { fill: var(--st-semantic-data-category7); }
  .st-boxPlotChart__box--category8 { fill: var(--st-semantic-data-category8); }

  .st-boxPlotChart__outlier {
    fill: var(--st-semantic-surface-default, Canvas);
    stroke: var(--st-semantic-text-secondary);
    stroke-width: 1.5;
  }

  .st-boxPlotChart__label {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
  }

  .st-boxPlotChart__tooltip {
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

  .st-boxPlotChart__tooltipLabel {
    font-weight: 600;
  }

  .st-boxPlotChart__tooltipValue {
    opacity: 0.85;
  }
</style>

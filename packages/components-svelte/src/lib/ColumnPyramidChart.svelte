<script lang="ts" module>
  /**
   * ColumnPyramidChart — colonnes en forme de pyramide (triangle) par catégorie.
   * Comme un histogramme à barres, mais chaque colonne est un triangle : base
   * large posée sur l'axe X, sommet centré à la hauteur de la valeur.
   * API canonique (référence Svelte, React/Vue doivent s'aligner).
   *
   * Props obligatoires :
   *   data   ColumnPyramidChartDatum[]  - tableau {category, value, tone?}
   *   label  string                      - aria-label du graphique
   *
   * Props optionnelles :
   *   tone    ColumnPyramidChartTone  - teinte par défaut des colonnes sans tone
   *   width   number  (défaut 480)
   *   height  number  (défaut 280)
   *   class   string
   */
  export type ColumnPyramidChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type ColumnPyramidChartDatum = {
    category: string;
    value: number;
    tone?: ColumnPyramidChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type ColumnPyramidChartProps = {
    data: ColumnPyramidChartDatum[];
    width?: number;
    height?: number;
    label: string;
    /** Teinte par défaut des colonnes dont le datum n'a pas de `tone`. */
    tone?: ColumnPyramidChartTone;
    class?: string;
  };

  let {
    data = [],
    width = 480,
    height = 280,
    label,
    tone = "category1",
    class: className
  }: ColumnPyramidChartProps = $props();

  const MARGIN = { top: 24, right: 16, bottom: 32, left: 44 };

  function niceTicks(min: number, max: number, target = 5): number[] {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
      const base = Number.isFinite(max) ? max : 0;
      return [base];
    }
    const range = max - min;
    const rough = range / Math.max(target - 1, 1);
    const pow = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / pow;
    let step: number;
    if (norm < 1.5) step = 1 * pow;
    else if (norm < 3) step = 2 * pow;
    else if (norm < 7) step = 5 * pow;
    else step = 10 * pow;
    const start = Math.floor(min / step) * step;
    const end = Math.ceil(max / step) * step;
    const ticks: number[] = [];
    for (let v = start; v <= end + step / 2; v += step) {
      ticks.push(Number(v.toFixed(10)));
    }
    return ticks;
  }

  function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number) {
    if (d1 === d0) return r0;
    return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
  }

  function formatTick(v: number): string {
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(1);
  }

  let hoveredIndex: number | null = $state(null);

  // Données valides : value finie et strictement positive (un triangle posé sur
  // l'axe X n'a de sens que pour une valeur > 0).
  const validData = $derived(data.filter((d) => Number.isFinite(d.value) && d.value > 0));

  const scales = $derived.by(() => {
    const values = validData.map((d) => d.value);
    const minRaw = 0;
    const maxRaw = Math.max(0, ...values);
    const ticks = niceTicks(minRaw, maxRaw, 5);
    const domainMin = ticks[0];
    const domainMax = ticks[ticks.length - 1];
    const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
    const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
    return { ticks, domainMin, domainMax, plotWidth, plotHeight };
  });

  const columns = $derived.by(() => {
    const { domainMin, domainMax, plotWidth, plotHeight } = scales;
    if (validData.length === 0) return [];
    const band = plotWidth / validData.length;
    const baseWidth = band * 0.7;
    const zeroY = MARGIN.top + scaleLinear(0, domainMin, domainMax, plotHeight, 0);
    return validData.map((d, i) => {
      const apexY = MARGIN.top + scaleLinear(d.value, domainMin, domainMax, plotHeight, 0);
      const cx = MARGIN.left + band * (i + 0.5);
      const leftX = cx - baseWidth / 2;
      const rightX = cx + baseWidth / 2;
      // Triangle : base large en bas (sur l'axe X), sommet centré à la valeur.
      const points = `${leftX},${zeroY} ${rightX},${zeroY} ${cx},${apexY}`;
      return {
        datum: d,
        tone: (d.tone ?? tone) as ColumnPyramidChartTone,
        points,
        cx,
        cy: apexY,
        labelX: cx,
        labelY: height - MARGIN.bottom + 16
      };
    });
  });

  const dataValueItems = $derived(validData.map((d) => `${d.category}: ${d.value}`));

  const valueAxisTicks = $derived.by(() => {
    const { ticks, domainMin, domainMax, plotWidth, plotHeight } = scales;
    return ticks.map((tick) => ({
      value: tick,
      x1: MARGIN.left,
      x2: MARGIN.left + plotWidth,
      y: MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0)
    }));
  });

  function handleLeave() {
    hoveredIndex = null;
  }
  function handleVisualPointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredIndex = null;
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    hoveredIndex = Number.isInteger(index) ? index : null;
  }

  const classes = () => ["st-columnPyramidChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-columnPyramidChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handleVisualPointerMove}
    onpointerleave={handleLeave}
  >
    <svg
      viewBox="0 0 {width} {height}"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
      <!-- gridlines + value axis ticks -->
      {#each valueAxisTicks as tick (tick.value)}
        <line class="st-columnPyramidChart__grid" x1={tick.x1} x2={tick.x2} y1={tick.y} y2={tick.y} />
        <text
          class="st-columnPyramidChart__tickLabel"
          x={MARGIN.left - 6}
          y={tick.y}
          text-anchor="end"
          dominant-baseline="middle"
        >
          {formatTick(tick.value)}
        </text>
      {/each}

      <!-- axes -->
      <line
        class="st-columnPyramidChart__axis"
        x1={MARGIN.left}
        x2={MARGIN.left}
        y1={MARGIN.top}
        y2={height - MARGIN.bottom}
      />
      <line
        class="st-columnPyramidChart__axis"
        x1={MARGIN.left}
        x2={width - MARGIN.right}
        y1={height - MARGIN.bottom}
        y2={height - MARGIN.bottom}
      />

      <!-- category labels -->
      {#each columns as col (col.datum.category)}
        <text
          class="st-columnPyramidChart__categoryLabel"
          x={col.labelX}
          y={col.labelY}
          text-anchor="middle"
        >
          {col.datum.category}
        </text>
      {/each}

      <!-- pyramid columns (decorative, inside aria-hidden SVG) -->
      {#each columns as col, i (col.datum.category)}
        <polygon
          class="st-columnPyramidChart__column st-columnPyramidChart__column--{col.tone}"
          points={col.points}
          data-chart-index={i}
        />
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && columns[hoveredIndex]}
    {@const col = columns[hoveredIndex]}
    <div
      class="st-columnPyramidChart__tooltip"
      role="presentation"
      style="left: {(col.cx / width) * 100}%; top: {(col.cy / height) * 100}%"
    >
      <span class="st-columnPyramidChart__tooltipLabel">{col.datum.category}</span>
      <span class="st-columnPyramidChart__tooltipValue">{col.datum.value}</span>
    </div>
  {/if}
</div>

<style>
  .st-columnPyramidChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-columnPyramidChart svg {
    display: block;
    overflow: visible;
  }

  .st-columnPyramidChart__visual {
    display: block;
  }

  .st-columnPyramidChart__grid {
    stroke: var(--st-component-columnPyramidChart-gridStroke, var(--st-semantic-border-subtle));
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-columnPyramidChart__axis {
    stroke: var(--st-component-columnPyramidChart-axisStroke, var(--st-semantic-border-subtle));
    stroke-width: 1;
  }

  .st-columnPyramidChart__tickLabel,
  .st-columnPyramidChart__categoryLabel {
    fill: var(--st-component-columnPyramidChart-labelColor, var(--st-semantic-text-secondary));
    font-size: 0.6875rem;
  }

  .st-columnPyramidChart__column {
    cursor: pointer;
    transition: opacity var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-columnPyramidChart__column:hover {
    opacity: 0.82;
  }

  .st-columnPyramidChart__column--category1 { fill: var(--st-semantic-data-category1); }
  .st-columnPyramidChart__column--category2 { fill: var(--st-semantic-data-category2); }
  .st-columnPyramidChart__column--category3 { fill: var(--st-semantic-data-category3); }
  .st-columnPyramidChart__column--category4 { fill: var(--st-semantic-data-category4); }
  .st-columnPyramidChart__column--category5 { fill: var(--st-semantic-data-category5); }
  .st-columnPyramidChart__column--category6 { fill: var(--st-semantic-data-category6); }
  .st-columnPyramidChart__column--category7 { fill: var(--st-semantic-data-category7); }
  .st-columnPyramidChart__column--category8 { fill: var(--st-semantic-data-category8); }

  .st-columnPyramidChart__tooltip {
    background: var(--st-component-columnPyramidChart-tooltipBackground, var(--st-semantic-surface-inverse));
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-component-columnPyramidChart-tooltipText, var(--st-semantic-text-inverse));
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

  .st-columnPyramidChart__tooltipLabel {
    font-weight: 600;
  }

  .st-columnPyramidChart__tooltipValue {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-columnPyramidChart__column {
      transition: none;
    }
  }
</style>

<script lang="ts" module>
  /**
   * ErrorBarChart — pour chaque catégorie, un marqueur central au point `value`
   * (la moyenne ou la mesure) et une moustache horizontale allant de `low` à
   * `high` (les bornes d'incertitude), terminée à chaque extrémité par un court
   * capuchon perpendiculaire (les « error bars »). Idéal pour visualiser une
   * estimation et son intervalle de confiance par catégorie.
   * API canonique (référence Svelte ; React/Vue s'alignent).
   *
   * Props obligatoires :
   *   data   ErrorBarChartDatum[]  - tableau {category, value, low, high}
   *   label  string                - aria-label du graphique
   *
   * Props optionnelles :
   *   tone    "category1".."category8"  (défaut "category1") - moustache + marqueur
   *   width   number  (défaut 480)
   *   height  number  (défaut 240)
   *   class   string
   *
   * Les catégories sont distribuées sur l'axe vertical (une ligne par
   * catégorie) ; l'axe horizontal porte l'échelle de valeurs graduée.
   */
  export type ErrorBarChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type ErrorBarChartDatum = {
    category: string;
    value: number;
    low: number;
    high: number;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";
  import GraphLegend from "./GraphLegend.svelte";

  type ErrorBarChartProps = {
    data: ErrorBarChartDatum[];
    width?: number;
    height?: number;
    tone?: ErrorBarChartTone;
    label: string;
    class?: string;
  };

  let {
    data = [],
    width = 480,
    height = 240,
    tone = "category1",
    label,
    class: className
  }: ErrorBarChartProps = $props();

  const MARGIN = { top: 16, right: 20, bottom: 32, left: 96 };
  const MARKER_RADIUS = 4;
  const CAP_HALF = 5; // demi-hauteur du capuchon perpendiculaire

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

  // Normalise un point : value/low/high finis, ordonnés (lo <= value <= hi).
  function normalize(d: ErrorBarChartDatum): { lo: number; mid: number; hi: number } | null {
    if (!Number.isFinite(d.value) || !Number.isFinite(d.low) || !Number.isFinite(d.high)) return null;
    const lo = Math.min(d.low, d.high);
    const hi = Math.max(d.low, d.high);
    const mid = Math.min(hi, Math.max(lo, d.value));
    return { lo, mid, hi };
  }

  // Données valides : value + low + high finis.
  const validData = $derived(data.filter((d) => normalize(d) !== null));

  const dataValueItems = $derived(
    validData.map((d) => {
      const r = normalize(d)!;
      return `${d.category}: ${r.mid} (${r.lo} – ${r.hi})`;
    })
  );

  // Réduit la police des étiquettes de catégorie quand l'espace réservé (marge
  // gauche) est plus petit que le défaut de référence, pour éviter le rognage
  // (cf. fix lollipop : adapter la taille au conteneur).
  const categoryFontSize = $derived.by(() => {
    const ratio = Math.min(1, MARGIN.left / 96);
    return Math.max(0.5, 0.6875 * ratio);
  });

  let hoveredIndex: number | null = $state(null);

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  const xTicks = $derived.by(() => {
    if (validData.length === 0) return [0];
    const lows = validData.map((d) => normalize(d)!.lo);
    const highs = validData.map((d) => normalize(d)!.hi);
    const minRaw = Math.min(...lows);
    const maxRaw = Math.max(...highs);
    const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
    return niceTicks(minRaw - padded, maxRaw + padded, 5);
  });

  const xDomain = $derived.by(() => {
    if (xTicks.length === 0) return { min: 0, max: 1 };
    return { min: xTicks[0], max: xTicks[xTicks.length - 1] };
  });

  const rows = $derived.by(() => {
    if (validData.length === 0) return [];
    const band = plotHeight / validData.length;
    return validData.map((d, i) => {
      const r = normalize(d)!;
      const cy = MARGIN.top + band * (i + 0.5);
      const xLow = MARGIN.left + scaleLinear(r.lo, xDomain.min, xDomain.max, 0, plotWidth);
      const xMid = MARGIN.left + scaleLinear(r.mid, xDomain.min, xDomain.max, 0, plotWidth);
      const xHigh = MARGIN.left + scaleLinear(r.hi, xDomain.min, xDomain.max, 0, plotWidth);
      return {
        datum: d,
        range: r,
        cy,
        xLow,
        xMid,
        xHigh,
        index: i
      };
    });
  });

  const gridLines = $derived(
    xTicks.map((tick) => ({
      value: tick,
      x: MARGIN.left + scaleLinear(tick, xDomain.min, xDomain.max, 0, plotWidth)
    }))
  );

  const legendEntries = $derived([{ label, shape: "circle" as const, tone }]);

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

  const classes = () => ["st-errorBarChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-errorBarChart__visual"
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
      <!-- gridlines + X axis ticks -->
      {#each gridLines as g (g.value)}
        <line
          class="st-errorBarChart__grid"
          x1={g.x}
          x2={g.x}
          y1={MARGIN.top}
          y2={height - MARGIN.bottom}
        />
        <text
          class="st-errorBarChart__tickLabel"
          x={g.x}
          y={height - MARGIN.bottom + 16}
          text-anchor="middle"
        >
          {formatTick(g.value)}
        </text>
      {/each}

      <!-- axes -->
      <line
        class="st-errorBarChart__axis"
        x1={MARGIN.left}
        x2={MARGIN.left}
        y1={MARGIN.top}
        y2={height - MARGIN.bottom}
      />
      <line
        class="st-errorBarChart__axis"
        x1={MARGIN.left}
        x2={width - MARGIN.right}
        y1={height - MARGIN.bottom}
        y2={height - MARGIN.bottom}
      />

      <!-- category labels + error bars -->
      {#each rows as row (row.index)}
        <text
          class="st-errorBarChart__categoryLabel"
          x={MARGIN.left - 8}
          y={row.cy}
          text-anchor="end"
          dominant-baseline="middle"
          style="font-size: {categoryFontSize}rem"
        >
          {row.datum.category}
        </text>
        <line
          class="st-errorBarChart__whisker st-errorBarChart__whisker--{tone}"
          x1={row.xLow}
          x2={row.xHigh}
          y1={row.cy}
          y2={row.cy}
        />
        <line
          class="st-errorBarChart__cap st-errorBarChart__cap--low st-errorBarChart__cap--{tone}"
          x1={row.xLow}
          x2={row.xLow}
          y1={row.cy - CAP_HALF}
          y2={row.cy + CAP_HALF}
        />
        <line
          class="st-errorBarChart__cap st-errorBarChart__cap--high st-errorBarChart__cap--{tone}"
          x1={row.xHigh}
          x2={row.xHigh}
          y1={row.cy - CAP_HALF}
          y2={row.cy + CAP_HALF}
        />
        <circle
          class="st-errorBarChart__marker st-errorBarChart__marker--{tone}"
          cx={row.xMid}
          cy={row.cy}
          r={MARKER_RADIUS}
          data-chart-index={row.index}
        />
      {/each}
    </svg>
    <GraphLegend class="st-errorBarChart__legend" entries={legendEntries} />
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && rows[hoveredIndex]}
    {@const row = rows[hoveredIndex]}
    <div
      class="st-errorBarChart__tooltip"
      role="presentation"
      style="left: {(row.xMid / width) * 100}%; top: {(row.cy / height) * 100}%"
    >
      <span class="st-errorBarChart__tooltipLabel">{row.datum.category}</span>
      <span class="st-errorBarChart__tooltipValue">{row.range.mid} ({row.range.lo} – {row.range.hi})</span>
    </div>
  {/if}
</div>

<style>
  .st-errorBarChart {
    color: var(--st-semantic-data-category1);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-errorBarChart svg {
    display: block;
    overflow: visible;
  }

  .st-errorBarChart__visual {
    display: block;
    position: relative;
  }

  .st-errorBarChart__legend {
    position: absolute;
    right: 0.25rem;
    top: 0.25rem;
  }

  .st-errorBarChart__grid {
    stroke: var(--st-component-errorBarChart-gridStroke, var(--st-semantic-border-subtle));
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-errorBarChart__axis {
    stroke: var(--st-component-errorBarChart-axisStroke, var(--st-semantic-border-subtle));
    stroke-width: 1;
  }

  .st-errorBarChart__tickLabel,
  .st-errorBarChart__categoryLabel {
    fill: var(--st-component-errorBarChart-labelColor, var(--st-semantic-text-secondary));
    font-size: 0.6875rem;
  }

  .st-errorBarChart__whisker {
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
  }

  .st-errorBarChart__cap {
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
  }

  .st-errorBarChart__whisker--category1,
  .st-errorBarChart__cap--category1 { stroke: var(--st-semantic-data-category1); }
  .st-errorBarChart__whisker--category2,
  .st-errorBarChart__cap--category2 { stroke: var(--st-semantic-data-category2); }
  .st-errorBarChart__whisker--category3,
  .st-errorBarChart__cap--category3 { stroke: var(--st-semantic-data-category3); }
  .st-errorBarChart__whisker--category4,
  .st-errorBarChart__cap--category4 { stroke: var(--st-semantic-data-category4); }
  .st-errorBarChart__whisker--category5,
  .st-errorBarChart__cap--category5 { stroke: var(--st-semantic-data-category5); }
  .st-errorBarChart__whisker--category6,
  .st-errorBarChart__cap--category6 { stroke: var(--st-semantic-data-category6); }
  .st-errorBarChart__whisker--category7,
  .st-errorBarChart__cap--category7 { stroke: var(--st-semantic-data-category7); }
  .st-errorBarChart__whisker--category8,
  .st-errorBarChart__cap--category8 { stroke: var(--st-semantic-data-category8); }

  .st-errorBarChart__marker {
    fill: currentColor;
    stroke: var(--st-semantic-surface-default);
    stroke-width: 1.5;
    cursor: pointer;
    transition: r 120ms ease;
  }

  .st-errorBarChart__marker:hover {
    r: 6;
  }

  .st-errorBarChart__marker--category1 { fill: var(--st-semantic-data-category1); }
  .st-errorBarChart__marker--category2 { fill: var(--st-semantic-data-category2); }
  .st-errorBarChart__marker--category3 { fill: var(--st-semantic-data-category3); }
  .st-errorBarChart__marker--category4 { fill: var(--st-semantic-data-category4); }
  .st-errorBarChart__marker--category5 { fill: var(--st-semantic-data-category5); }
  .st-errorBarChart__marker--category6 { fill: var(--st-semantic-data-category6); }
  .st-errorBarChart__marker--category7 { fill: var(--st-semantic-data-category7); }
  .st-errorBarChart__marker--category8 { fill: var(--st-semantic-data-category8); }

  @media (prefers-reduced-motion: reduce) {
    .st-errorBarChart__marker {
      transition: none;
    }
  }

  .st-errorBarChart__tooltip {
    background: var(--st-component-errorBarChart-tooltipBackground, var(--st-semantic-surface-inverse));
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-component-errorBarChart-tooltipText, var(--st-semantic-text-inverse));
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

  .st-errorBarChart__tooltipLabel {
    font-weight: 600;
  }

  .st-errorBarChart__tooltipValue {
    opacity: 0.85;
  }
</style>

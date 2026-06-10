<script lang="ts" module>
  /**
   * ColumnRangeChart — barre allant d'une valeur BASSE à une valeur HAUTE par
   * catégorie (ex. températures min/max par mois, fourchettes de prix).
   * API canonique (référence Svelte ; React/Vue doivent s'aligner).
   *
   * Props obligatoires :
   *   data   ColumnRangeChartDatum[]  - tableau {category, low, high, tone?}
   *   label  string                   - aria-label du graphique
   *
   * Props optionnelles :
   *   orientation  "vertical"|"horizontal"  (défaut "vertical")
   *   width        number  (défaut 480)
   *   height       number  (défaut 240)
   *   domain       [number, number]  - domaine fixe de l'axe des valeurs
   *   class        string
   */
  export type ColumnRangeChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type ColumnRangeChartDatum = {
    category: string;
    low: number;
    high: number;
    tone?: ColumnRangeChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type ColumnRangeChartProps = {
    data: ColumnRangeChartDatum[];
    width?: number;
    height?: number;
    orientation?: "vertical" | "horizontal";
    label: string;
    /**
     * Domaine fixe de l'axe des valeurs `[min, max]`. Quand fourni (et fini),
     * l'échelle l'utilise au lieu du min/max dérivé des données — laissant
     * plusieurs ColumnRangeCharts d'une grille partager une échelle. Absent ou
     * invalide → repli sur la plage auto (inchangé).
     */
    domain?: [number, number];
    class?: string;
  };

  let {
    data = [],
    width = 480,
    height = 240,
    orientation = "vertical",
    label,
    domain,
    class: className
  }: ColumnRangeChartProps = $props();

  const MARGIN = { top: 12, right: 16, bottom: 32, left: 44 };

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

  function formatTick(v: number): string {
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(1);
  }

  // Normalise un point : low/high finis, ordonnés (lo <= hi).
  function normalize(d: ColumnRangeChartDatum): { lo: number; hi: number } | null {
    if (!Number.isFinite(d.low) || !Number.isFinite(d.high)) return null;
    return { lo: Math.min(d.low, d.high), hi: Math.max(d.low, d.high) };
  }

  let hoveredIndex: number | null = $state(null);

  // Données valides : low + high finis.
  const validData = $derived(data.filter((d) => normalize(d) !== null));

  // Un domaine n'est honoré que si fini et ordonné (min < max).
  const validDomain = $derived.by<[number, number] | null>(() => {
    if (!domain) return null;
    const [d0, d1] = domain;
    if (!Number.isFinite(d0) || !Number.isFinite(d1) || d0 >= d1) return null;
    return [d0, d1];
  });

  const scales = $derived.by(() => {
    const lows = validData.map((d) => Math.min(d.low, d.high));
    const highs = validData.map((d) => Math.max(d.low, d.high));
    const minRaw = validDomain ? validDomain[0] : Math.min(...lows, ...highs);
    const maxRaw = validDomain ? validDomain[1] : Math.max(...lows, ...highs);
    const ticks = niceTicks(minRaw, maxRaw, 5);
    const domainMin = ticks[0];
    const domainMax = ticks[ticks.length - 1];
    const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
    const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
    return { ticks, domainMin, domainMax, plotWidth, plotHeight };
  });

  // Fraction [0,1] d'une valeur le long de l'axe (0 = domainMin, 1 = domainMax).
  const valueFraction = $derived((v: number) => {
    const { domainMin, domainMax } = scales;
    if (domainMax === domainMin) return 0;
    const f = (v - domainMin) / (domainMax - domainMin);
    return Math.min(1, Math.max(0, f));
  });

  const bars = $derived.by(() => {
    const { plotWidth, plotHeight } = scales;
    if (validData.length === 0) return [];
    if (orientation === "vertical") {
      const band = plotWidth / validData.length;
      const barWidth = band * 0.62;
      // Pixel y pour une valeur (fraction 0 → bas, 1 → haut du plot).
      const yOf = (v: number) => plotHeight * (1 - valueFraction(v));
      return validData.map((d, i) => {
        const range = normalize(d)!;
        const yLow = yOf(range.lo);
        const yHigh = yOf(range.hi);
        const y = Math.min(yLow, yHigh);
        const h = Math.abs(yLow - yHigh);
        const x = MARGIN.left + band * i + (band - barWidth) / 2;
        return {
          x,
          y: MARGIN.top + y,
          width: barWidth,
          height: Math.max(h, 0.5),
          cx: MARGIN.left + band * (i + 0.5),
          cy: MARGIN.top + (yLow + yHigh) / 2,
          datum: d,
          range,
          tone: d.tone ?? "category1"
        };
      });
    }
    // horizontal
    const band = plotHeight / validData.length;
    const barHeight = band * 0.62;
    // Pixel x pour une valeur (fraction 0 → gauche, 1 → droite du plot).
    const xOf = (v: number) => plotWidth * valueFraction(v);
    return validData.map((d, i) => {
      const range = normalize(d)!;
      const xLow = xOf(range.lo);
      const xHigh = xOf(range.hi);
      const x = Math.min(xLow, xHigh);
      const w = Math.abs(xHigh - xLow);
      const y = MARGIN.top + band * i + (band - barHeight) / 2;
      return {
        x: MARGIN.left + x,
        y,
        width: Math.max(w, 0.5),
        height: barHeight,
        cx: MARGIN.left + (xLow + xHigh) / 2,
        cy: MARGIN.top + band * (i + 0.5),
        datum: d,
        range,
        tone: d.tone ?? "category1"
      };
    });
  });

  const dataValueItems = $derived(
    bars.map((bar) => `${bar.datum.category}: ${bar.range.lo} – ${bar.range.hi}`)
  );

  const valueAxisTicks = $derived.by(() => {
    const { ticks, plotWidth, plotHeight } = scales;
    if (orientation === "vertical") {
      return ticks.map((tick) => ({
        value: tick,
        x1: MARGIN.left,
        x2: MARGIN.left + plotWidth,
        y: MARGIN.top + plotHeight * (1 - valueFraction(tick)),
        x: undefined,
        y1: undefined,
        y2: undefined
      }));
    }
    return ticks.map((tick) => ({
      value: tick,
      x: MARGIN.left + plotWidth * valueFraction(tick),
      y1: MARGIN.top,
      y2: MARGIN.top + plotHeight,
      x1: undefined,
      x2: undefined,
      y: undefined
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

  const classes = () => ["st-columnRangeChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-columnRangeChart__visual"
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
      {#if orientation === "vertical"}
        {#each valueAxisTicks as tick (tick.value)}
          <line class="st-columnRangeChart__grid" x1={tick.x1} x2={tick.x2} y1={tick.y} y2={tick.y} />
          <text
            class="st-columnRangeChart__tickLabel"
            x={MARGIN.left - 6}
            y={tick.y}
            text-anchor="end"
            dominant-baseline="middle"
          >
            {formatTick(tick.value)}
          </text>
        {/each}
      {:else}
        {#each valueAxisTicks as tick (tick.value)}
          <line class="st-columnRangeChart__grid" x1={tick.x} x2={tick.x} y1={tick.y1} y2={tick.y2} />
          <text
            class="st-columnRangeChart__tickLabel"
            x={tick.x}
            y={height - MARGIN.bottom + 16}
            text-anchor="middle"
          >
            {formatTick(tick.value)}
          </text>
        {/each}
      {/if}

      <!-- axes -->
      <line
        class="st-columnRangeChart__axis"
        x1={MARGIN.left}
        x2={MARGIN.left}
        y1={MARGIN.top}
        y2={height - MARGIN.bottom}
      />
      <line
        class="st-columnRangeChart__axis"
        x1={MARGIN.left}
        x2={width - MARGIN.right}
        y1={height - MARGIN.bottom}
        y2={height - MARGIN.bottom}
      />

      <!-- category labels -->
      {#each bars as bar (bar.datum.category)}
        {#if orientation === "vertical"}
          <text
            class="st-columnRangeChart__categoryLabel"
            x={bar.x + bar.width / 2}
            y={height - MARGIN.bottom + 16}
            text-anchor="middle"
          >
            {bar.datum.category}
          </text>
        {:else}
          <text
            class="st-columnRangeChart__categoryLabel"
            x={MARGIN.left - 6}
            y={bar.y + bar.height / 2}
            text-anchor="end"
            dominant-baseline="middle"
          >
            {bar.datum.category}
          </text>
        {/if}
      {/each}

      <!-- range bars (decorative, inside aria-hidden SVG) -->
      {#each bars as bar, i (bar.datum.category)}
        <rect
          class="st-columnRangeChart__bar st-columnRangeChart__bar--{bar.tone}"
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          rx="2"
          data-chart-index={i}
        />
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && bars[hoveredIndex]}
    {@const bar = bars[hoveredIndex]}
    <div
      class="st-columnRangeChart__tooltip"
      role="presentation"
      style="left: {(bar.cx / width) * 100}%; top: {(bar.cy / height) * 100}%"
    >
      <span class="st-columnRangeChart__tooltipLabel">{bar.datum.category}</span>
      <span class="st-columnRangeChart__tooltipValue">{bar.range.lo} – {bar.range.hi}</span>
    </div>
  {/if}
</div>

<style>
  .st-columnRangeChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-columnRangeChart svg {
    display: block;
    overflow: visible;
  }

  .st-columnRangeChart__visual {
    display: block;
  }

  .st-columnRangeChart__grid {
    stroke: var(--st-component-columnRangeChart-gridStroke, var(--st-semantic-border-subtle));
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-columnRangeChart__axis {
    stroke: var(--st-component-columnRangeChart-axisStroke, var(--st-semantic-border-subtle));
    stroke-width: 1;
  }

  .st-columnRangeChart__tickLabel,
  .st-columnRangeChart__categoryLabel {
    fill: var(--st-component-columnRangeChart-labelColor, var(--st-semantic-text-secondary));
    font-size: 0.6875rem;
  }

  .st-columnRangeChart__bar {
    cursor: pointer;
    transition: opacity var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-columnRangeChart__bar:hover {
    opacity: 0.82;
  }

  .st-columnRangeChart__bar--category1 { fill: var(--st-semantic-data-category1); }
  .st-columnRangeChart__bar--category2 { fill: var(--st-semantic-data-category2); }
  .st-columnRangeChart__bar--category3 { fill: var(--st-semantic-data-category3); }
  .st-columnRangeChart__bar--category4 { fill: var(--st-semantic-data-category4); }
  .st-columnRangeChart__bar--category5 { fill: var(--st-semantic-data-category5); }
  .st-columnRangeChart__bar--category6 { fill: var(--st-semantic-data-category6); }
  .st-columnRangeChart__bar--category7 { fill: var(--st-semantic-data-category7); }
  .st-columnRangeChart__bar--category8 { fill: var(--st-semantic-data-category8); }

  .st-columnRangeChart__tooltip {
    background: var(--st-component-columnRangeChart-tooltipBackground, var(--st-semantic-surface-inverse));
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-component-columnRangeChart-tooltipText, var(--st-semantic-text-inverse));
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

  .st-columnRangeChart__tooltipLabel {
    font-weight: 600;
  }

  .st-columnRangeChart__tooltipValue {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-columnRangeChart__bar {
      transition: none;
    }
  }
</style>

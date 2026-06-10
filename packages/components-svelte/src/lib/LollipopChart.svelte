<script lang="ts" module>
  /**
   * LollipopChart — tige fine (ligne) + cercle au sommet, par catégorie.
   * API canonique (référence Svelte, React/Vue doivent s'aligner).
   *
   * Props obligatoires :
   *   data   LollipopChartDatum[]  - tableau {label, value, tone?}
   *   label  string                - aria-label du graphique
   *
   * Props optionnelles :
   *   orientation  "vertical"|"horizontal"  (défaut "vertical")
   *   width        number  (défaut 480)
   *   height       number  (défaut 240)
   *   domain       [number, number]  - domaine fixe de l'axe des valeurs
   *   class        string
   */
  export type LollipopChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type LollipopChartDatum = {
    label: string;
    value: number;
    tone?: LollipopChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";
  import { contrastTextForTone } from "./chartContrast.js";

  type LollipopChartProps = {
    data: LollipopChartDatum[];
    width?: number;
    height?: number;
    orientation?: "vertical" | "horizontal";
    label: string;
    /**
     * Domaine fixe de l'axe des valeurs `[min, max]`. Quand fourni (et fini),
     * l'échelle l'utilise au lieu du min/max dérivé des données — laissant
     * plusieurs LollipopCharts d'une grille partager une échelle. Absent ou
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
  }: LollipopChartProps = $props();

  const MARGIN = { top: 24, right: 16, bottom: 32, left: 44 };
  const DOT_RADIUS = 5;

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

  // Données valides : value finie.
  const validData = $derived(data.filter((d) => Number.isFinite(d.value)));

  // Un domaine n'est honoré que si fini et ordonné (min < max).
  const validDomain = $derived.by<[number, number] | null>(() => {
    if (!domain) return null;
    const [d0, d1] = domain;
    if (!Number.isFinite(d0) || !Number.isFinite(d1) || d0 >= d1) return null;
    return [d0, d1];
  });

  const scales = $derived.by(() => {
    const values = validData.map((d) => d.value);
    const minRaw = validDomain ? validDomain[0] : Math.min(0, ...values);
    const maxRaw = validDomain ? validDomain[1] : Math.max(0, ...values);
    const ticks = niceTicks(minRaw, maxRaw, 5);
    const domainMin = ticks[0];
    const domainMax = ticks[ticks.length - 1];
    const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
    const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
    return { ticks, domainMin, domainMax, plotWidth, plotHeight };
  });

  const lollipops = $derived.by(() => {
    const { domainMin, domainMax, plotWidth, plotHeight } = scales;
    if (validData.length === 0) return [];
    if (orientation === "vertical") {
      const band = plotWidth / validData.length;
      const zeroY = scaleLinear(0, domainMin, domainMax, plotHeight, 0);
      return validData.map((d, i) => {
        const valueY = scaleLinear(d.value, domainMin, domainMax, plotHeight, 0);
        const cx = MARGIN.left + band * (i + 0.5);
        return {
          datum: d,
          tone: d.tone ?? "category1",
          // tige : du zéro jusqu'au point
          stemX1: cx,
          stemY1: MARGIN.top + zeroY,
          stemX2: cx,
          stemY2: MARGIN.top + valueY,
          cx,
          cy: MARGIN.top + valueY,
          labelX: cx,
          labelY: height - MARGIN.bottom + 16
        };
      });
    }
    // horizontal
    const band = plotHeight / validData.length;
    const zeroX = scaleLinear(0, domainMin, domainMax, 0, plotWidth);
    return validData.map((d, i) => {
      const valueX = scaleLinear(d.value, domainMin, domainMax, 0, plotWidth);
      const cy = MARGIN.top + band * (i + 0.5);
      return {
        datum: d,
        tone: d.tone ?? "category1",
        stemX1: MARGIN.left + zeroX,
        stemY1: cy,
        stemX2: MARGIN.left + valueX,
        stemY2: cy,
        cx: MARGIN.left + valueX,
        cy,
        labelX: MARGIN.left - 6,
        labelY: cy
      };
    });
  });

  const dataValueItems = $derived(validData.map((d) => `${d.label}: ${d.value}`));

  const valueAxisTicks = $derived.by(() => {
    const { ticks, domainMin, domainMax, plotWidth, plotHeight } = scales;
    if (orientation === "vertical") {
      return ticks.map((tick) => ({
        value: tick,
        x1: MARGIN.left,
        x2: MARGIN.left + plotWidth,
        y: MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0),
        x: undefined,
        y1: undefined,
        y2: undefined
      }));
    }
    return ticks.map((tick) => ({
      value: tick,
      x: MARGIN.left + scaleLinear(tick, domainMin, domainMax, 0, plotWidth),
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

  const classes = () => ["st-lollipopChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-lollipopChart__visual"
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
          <line class="st-lollipopChart__grid" x1={tick.x1} x2={tick.x2} y1={tick.y} y2={tick.y} />
          <text
            class="st-lollipopChart__tickLabel"
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
          <line class="st-lollipopChart__grid" x1={tick.x} x2={tick.x} y1={tick.y1} y2={tick.y2} />
          <text
            class="st-lollipopChart__tickLabel"
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
        class="st-lollipopChart__axis"
        x1={MARGIN.left}
        x2={MARGIN.left}
        y1={MARGIN.top}
        y2={height - MARGIN.bottom}
      />
      <line
        class="st-lollipopChart__axis"
        x1={MARGIN.left}
        x2={width - MARGIN.right}
        y1={height - MARGIN.bottom}
        y2={height - MARGIN.bottom}
      />

      <!-- category labels -->
      {#each lollipops as pop (pop.datum.label)}
        {#if orientation === "vertical"}
          <text
            class="st-lollipopChart__categoryLabel"
            x={pop.labelX}
            y={pop.labelY}
            text-anchor="middle"
          >
            {pop.datum.label}
          </text>
        {:else}
          <text
            class="st-lollipopChart__categoryLabel"
            x={pop.labelX}
            y={pop.labelY}
            text-anchor="end"
            dominant-baseline="middle"
          >
            {pop.datum.label}
          </text>
        {/if}
      {/each}

      <!-- stems + dots (decorative, inside aria-hidden SVG) -->
      {#each lollipops as pop, i (pop.datum.label)}
        <line
          class="st-lollipopChart__stem"
          x1={pop.stemX1}
          y1={pop.stemY1}
          x2={pop.stemX2}
          y2={pop.stemY2}
        />
        <circle
          class="st-lollipopChart__dot st-lollipopChart__dot--{pop.tone}"
          cx={pop.cx}
          cy={pop.cy}
          r={DOT_RADIUS}
          data-chart-index={i}
        />
        <!-- value label near the dot, colour kept readable via contrastTextForTone -->
        <text
          class="st-lollipopChart__valueLabel"
          x={pop.cx}
          y={orientation === "vertical" ? pop.cy - DOT_RADIUS - 4 : pop.cy}
          dx={orientation === "vertical" ? 0 : DOT_RADIUS + 4}
          text-anchor={orientation === "vertical" ? "middle" : "start"}
          dominant-baseline={orientation === "vertical" ? "auto" : "middle"}
          style="fill: {contrastTextForTone(pop.tone)}"
        >
          {formatTick(pop.datum.value)}
        </text>
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && lollipops[hoveredIndex]}
    {@const pop = lollipops[hoveredIndex]}
    <div
      class="st-lollipopChart__tooltip"
      role="presentation"
      style="left: {(pop.cx / width) * 100}%; top: {(pop.cy / height) * 100}%"
    >
      <span class="st-lollipopChart__tooltipLabel">{pop.datum.label}</span>
      <span class="st-lollipopChart__tooltipValue">{pop.datum.value}</span>
    </div>
  {/if}
</div>

<style>
  .st-lollipopChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-lollipopChart svg {
    display: block;
    overflow: visible;
  }

  .st-lollipopChart__visual {
    display: block;
  }

  .st-lollipopChart__grid {
    stroke: var(--st-component-lollipopChart-gridStroke, var(--st-semantic-border-subtle));
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-lollipopChart__axis {
    stroke: var(--st-component-lollipopChart-axisStroke, var(--st-semantic-border-subtle));
    stroke-width: 1;
  }

  .st-lollipopChart__tickLabel,
  .st-lollipopChart__categoryLabel {
    fill: var(--st-component-lollipopChart-labelColor, var(--st-semantic-text-secondary));
    font-size: 0.6875rem;
  }

  .st-lollipopChart__valueLabel {
    font-size: 0.625rem;
    font-weight: 600;
  }

  .st-lollipopChart__stem {
    stroke: var(--st-semantic-border-interactive, var(--st-semantic-border-subtle));
    stroke-width: 1.5;
  }

  .st-lollipopChart__dot {
    cursor: pointer;
    transition: opacity var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-lollipopChart__dot:hover {
    opacity: 0.82;
  }

  .st-lollipopChart__dot--category1 { fill: var(--st-semantic-data-category1); }
  .st-lollipopChart__dot--category2 { fill: var(--st-semantic-data-category2); }
  .st-lollipopChart__dot--category3 { fill: var(--st-semantic-data-category3); }
  .st-lollipopChart__dot--category4 { fill: var(--st-semantic-data-category4); }
  .st-lollipopChart__dot--category5 { fill: var(--st-semantic-data-category5); }
  .st-lollipopChart__dot--category6 { fill: var(--st-semantic-data-category6); }
  .st-lollipopChart__dot--category7 { fill: var(--st-semantic-data-category7); }
  .st-lollipopChart__dot--category8 { fill: var(--st-semantic-data-category8); }

  .st-lollipopChart__tooltip {
    background: var(--st-component-lollipopChart-tooltipBackground, var(--st-semantic-surface-inverse));
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-component-lollipopChart-tooltipText, var(--st-semantic-text-inverse));
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

  .st-lollipopChart__tooltipLabel {
    font-weight: 600;
  }

  .st-lollipopChart__tooltipValue {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-lollipopChart__dot {
      transition: none;
    }
  }
</style>

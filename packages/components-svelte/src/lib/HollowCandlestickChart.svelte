<script lang="ts" module>
  /**
   * HollowCandlestickChart - chandeliers creux (convention Highcharts hollowcandlestick).
   * Variante du CandlestickChart : mèche low→high + corps open↔close, MAIS :
   *   - couleur (trait/bordure) = clôture vs clôture PRÉCÉDENTE (hausse/baisse) ;
   *   - remplissage = creux si close ≥ open (haussière), plein si close < open (baissière).
   * API canonique (référence Svelte, React/Vue doivent s'aligner)
   *
   * Props obligatoires :
   *   data   HollowCandlestickChartDatum[]  - tableau {label, open, high, low, close}
   *   label  string
   *
   * Props optionnelles :
   *   width   number  (défaut 480)
   *   height  number  (défaut 240)
   *   class   string
   */
  export type HollowCandlestickChartDatum = {
    label: string;
    open: number;
    high: number;
    low: number;
    close: number;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type HollowCandlestickChartProps = {
    data: HollowCandlestickChartDatum[];
    label: string;
    width?: number;
    height?: number;
    class?: string;
  };

  let {
    data = [],
    label,
    width = 480,
    height = 240,
    class: className
  }: HollowCandlestickChartProps = $props();

  const MARGIN = { top: 12, right: 16, bottom: 32, left: 52 };

  function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number) {
    if (d1 === d0) return r0;
    return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
  }

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

  let hoveredIndex: number | null = $state(null);

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  // Filtrer les bougies invalides AVANT le domaine
  const validData = $derived(
    data.filter((d) =>
      Number.isFinite(d.open) &&
      Number.isFinite(d.high) &&
      Number.isFinite(d.low) &&
      Number.isFinite(d.close)
    )
  );

  const domainBounds = $derived.by(() => {
    const allVals: number[] = [];
    for (const d of validData) {
      // Domaine inclut open/high/low/close (pas seulement high/low)
      allVals.push(d.open, d.high, d.low, d.close);
    }
    if (allVals.length === 0) return { rawMin: 0, rawMax: 1 };
    const rawMin = Math.min(...allVals);
    const rawMax = Math.max(...allVals);
    // Domaine plat → fallback range 1 pour éviter division par 0
    return { rawMin, rawMax: rawMax === rawMin ? rawMin + 1 : rawMax };
  });

  const ticks = $derived(niceTicks(domainBounds.rawMin, domainBounds.rawMax, 5));
  const domainMin = $derived(ticks[0]);
  const domainMax = $derived(ticks[ticks.length - 1]);

  const candles = $derived.by(() => {
    if (validData.length === 0) return [];
    const band = plotWidth / validData.length;
    const bodyW = band * 0.55;

    return validData.map((d, i) => {
      // clamp high/low pour garantir high≥max(O,C) et low≤min(O,C)
      const clampedHigh = Math.max(d.high, d.open, d.close);
      const clampedLow = Math.min(d.low, d.open, d.close);

      // Couleur : clôture vs clôture PRÉCÉDENTE (1re bougie : close ≥ open)
      const prevClose = i > 0 ? validData[i - 1].close : d.open;
      const up = d.close >= prevClose;
      // Remplissage : creux si haussière (close ≥ open), plein sinon
      const hollow = d.close >= d.open;

      const centerX = MARGIN.left + band * i + band / 2;

      const bodyTop = MARGIN.top + scaleLinear(Math.max(d.open, d.close), domainMin, domainMax, plotHeight, 0);
      const bodyBot = MARGIN.top + scaleLinear(Math.min(d.open, d.close), domainMin, domainMax, plotHeight, 0);
      const highY = MARGIN.top + scaleLinear(clampedHigh, domainMin, domainMax, plotHeight, 0);
      const lowY = MARGIN.top + scaleLinear(clampedLow, domainMin, domainMax, plotHeight, 0);

      return {
        datum: d,
        index: i,
        up,
        hollow,
        centerX,
        bodyX: centerX - bodyW / 2,
        bodyY: bodyTop,
        bodyW,
        bodyH: Math.max(bodyBot - bodyTop, 0.5),
        wickHighY: highY,
        wickLowY: lowY,
        tooltipY: bodyTop
      };
    });
  });

  const dataValueItems = $derived(
    validData.map((d) => `${d.label}: O ${d.open} H ${d.high} L ${d.low} C ${d.close}`)
  );

  function handlePointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) { hoveredIndex = null; return; }
    const idx = Number(target.getAttribute("data-chart-index"));
    hoveredIndex = Number.isInteger(idx) ? idx : null;
  }

  const classes = () => ["st-hollowCandlestickChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-hollowCandlestickChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handlePointerMove}
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
      <!-- gridlines + tick labels -->
      {#each ticks as tick (tick)}
        {@const ty = MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0)}
        <line class="st-hollowCandlestickChart__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={ty} y2={ty} />
        <text class="st-hollowCandlestickChart__tickLabel" x={MARGIN.left - 6} y={ty} text-anchor="end" dominant-baseline="middle">
          {formatTick(tick)}
        </text>
      {/each}

      <!-- axes -->
      <line class="st-hollowCandlestickChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
      <line class="st-hollowCandlestickChart__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

      <!-- clé composite pour éviter les doublons -->
      {#each candles as c, i (`${i}-${c.datum.label}`)}
        <!-- wick -->
        <line
          class="st-hollowCandlestickChart__wick st-hollowCandlestickChart__wick--{c.up ? 'up' : 'down'}"
          x1={c.centerX}
          x2={c.centerX}
          y1={c.wickHighY}
          y2={c.wickLowY}
          data-chart-index={i}
        />
        <!-- body -->
        <rect
          class="st-hollowCandlestickChart__candle st-hollowCandlestickChart__candle--{c.up ? 'up' : 'down'} st-hollowCandlestickChart__candle--{c.hollow ? 'hollow' : 'filled'}"
          class:st-hollowCandlestickChart__candle--dim={hoveredIndex !== null && hoveredIndex !== i}
          x={c.bodyX}
          y={c.bodyY}
          width={c.bodyW}
          height={c.bodyH}
          rx="1"
          data-chart-index={i}
        />
        <!-- category label -->
        <text
          class="st-hollowCandlestickChart__categoryLabel"
          x={c.centerX}
          y={height - MARGIN.bottom + 16}
          text-anchor="middle"
        >
          {c.datum.label}
        </text>
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && candles[hoveredIndex]}
    {@const c = candles[hoveredIndex]}
    <div
      class="st-hollowCandlestickChart__tooltip"
      role="presentation"
      style="left: {(c.centerX / width) * 100}%; top: {(c.tooltipY / height) * 100}%"
    >
      <span class="st-hollowCandlestickChart__tooltipLabel">{c.datum.label}</span>
      <span class="st-hollowCandlestickChart__tooltipValue">O {c.datum.open} H {c.datum.high} L {c.datum.low} C {c.datum.close}</span>
    </div>
  {/if}
</div>

<style>
  .st-hollowCandlestickChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-hollowCandlestickChart svg {
    display: block;
    overflow: visible;
  }

  .st-hollowCandlestickChart__visual {
    display: block;
  }

  .st-hollowCandlestickChart__axis {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-hollowCandlestickChart__grid {
    stroke: var(--st-semantic-border-subtle);
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-hollowCandlestickChart__wick {
    stroke-width: 1.5;
  }

  .st-hollowCandlestickChart__wick--up {
    stroke: var(--st-semantic-feedback-success);
  }

  .st-hollowCandlestickChart__wick--down {
    stroke: var(--st-semantic-feedback-error);
  }

  .st-hollowCandlestickChart__candle {
    cursor: pointer;
    stroke-width: 1.5;
    transition: opacity 120ms ease;
  }

  .st-hollowCandlestickChart__candle--dim {
    opacity: 0.4;
  }

  .st-hollowCandlestickChart__candle--up {
    stroke: var(--st-semantic-feedback-success);
  }

  .st-hollowCandlestickChart__candle--down {
    stroke: var(--st-semantic-feedback-error);
  }

  /* creux : remplissage transparent (juste la bordure colorée) */
  .st-hollowCandlestickChart__candle--hollow {
    fill: transparent;
  }

  /* plein : remplissage = couleur du trait */
  .st-hollowCandlestickChart__candle--filled.st-hollowCandlestickChart__candle--up {
    fill: var(--st-semantic-feedback-success);
  }

  .st-hollowCandlestickChart__candle--filled.st-hollowCandlestickChart__candle--down {
    fill: var(--st-semantic-feedback-error);
  }

  @media (prefers-reduced-motion: reduce) {
    .st-hollowCandlestickChart__candle {
      transition: none;
    }
  }

  .st-hollowCandlestickChart__tickLabel,
  .st-hollowCandlestickChart__categoryLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
  }

  .st-hollowCandlestickChart__tooltip {
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

  .st-hollowCandlestickChart__tooltipLabel {
    font-weight: 600;
  }

  .st-hollowCandlestickChart__tooltipValue {
    opacity: 0.85;
  }
</style>

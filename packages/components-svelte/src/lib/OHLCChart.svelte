<script lang="ts" module>
  /**
   * OHLCChart - barres open/high/low/close (bâtons financiers).
   * Variante du CandlestickChart : barre verticale du low au high,
   * tick gauche au niveau open, tick droite au niveau close.
   * API canonique (référence Svelte, React/Vue doivent s'aligner)
   *
   * Props obligatoires :
   *   data   OHLCChartDatum[]  - tableau {label, open, high, low, close}
   *   label  string
   *
   * Props optionnelles :
   *   width   number  (défaut 480)
   *   height  number  (défaut 240)
   *   class   string
   */
  export type OHLCChartDatum = {
    label: string;
    open: number;
    high: number;
    low: number;
    close: number;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type OHLCChartProps = {
    data: OHLCChartDatum[];
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
  }: OHLCChartProps = $props();

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

  // Filtrer les barres invalides AVANT le domaine
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

  const bars = $derived.by(() => {
    if (validData.length === 0) return [];
    const band = plotWidth / validData.length;
    // longueur du tick open/close (de chaque côté de la barre)
    const tickW = Math.min(band * 0.3, 12);

    return validData.map((d, i) => {
      // clamp high/low pour garantir high≥max(O,C) et low≤min(O,C)
      const clampedHigh = Math.max(d.high, d.open, d.close);
      const clampedLow = Math.min(d.low, d.open, d.close);

      const bullish = d.close >= d.open;
      const centerX = MARGIN.left + band * i + band / 2;

      const highY = MARGIN.top + scaleLinear(clampedHigh, domainMin, domainMax, plotHeight, 0);
      const lowY = MARGIN.top + scaleLinear(clampedLow, domainMin, domainMax, plotHeight, 0);
      const openY = MARGIN.top + scaleLinear(d.open, domainMin, domainMax, plotHeight, 0);
      const closeY = MARGIN.top + scaleLinear(d.close, domainMin, domainMax, plotHeight, 0);

      return {
        datum: d,
        index: i,
        bullish,
        centerX,
        barHighY: highY,
        barLowY: lowY,
        openY,
        closeY,
        openX: centerX - tickW,
        closeX: centerX + tickW,
        tooltipY: Math.min(highY, openY, closeY)
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

  const classes = () => ["st-ohlcChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-ohlcChart__visual"
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
        <line class="st-ohlcChart__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={ty} y2={ty} />
        <text class="st-ohlcChart__tickLabel" x={MARGIN.left - 6} y={ty} text-anchor="end" dominant-baseline="middle">
          {formatTick(tick)}
        </text>
      {/each}

      <!-- axes -->
      <line class="st-ohlcChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
      <line class="st-ohlcChart__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

      <!-- clé composite pour éviter les doublons -->
      {#each bars as b, i (`${i}-${b.datum.label}`)}
        <g
          class="st-ohlcChart__bar st-ohlcChart__bar--{b.bullish ? 'up' : 'down'}"
          class:st-ohlcChart__bar--dim={hoveredIndex !== null && hoveredIndex !== i}
        >
          <!-- barre verticale low → high -->
          <line
            class="st-ohlcChart__range"
            x1={b.centerX}
            x2={b.centerX}
            y1={b.barHighY}
            y2={b.barLowY}
            data-chart-index={i}
          />
          <!-- tick open (gauche) -->
          <line
            class="st-ohlcChart__open"
            x1={b.openX}
            x2={b.centerX}
            y1={b.openY}
            y2={b.openY}
            data-chart-index={i}
          />
          <!-- tick close (droite) -->
          <line
            class="st-ohlcChart__close"
            x1={b.centerX}
            x2={b.closeX}
            y1={b.closeY}
            y2={b.closeY}
            data-chart-index={i}
          />
        </g>
        <!-- category label -->
        <text
          class="st-ohlcChart__categoryLabel"
          x={b.centerX}
          y={height - MARGIN.bottom + 16}
          text-anchor="middle"
        >
          {b.datum.label}
        </text>
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && bars[hoveredIndex]}
    {@const b = bars[hoveredIndex]}
    <div
      class="st-ohlcChart__tooltip"
      role="presentation"
      style="left: {(b.centerX / width) * 100}%; top: {(b.tooltipY / height) * 100}%"
    >
      <span class="st-ohlcChart__tooltipLabel">{b.datum.label}</span>
      <span class="st-ohlcChart__tooltipValue">O {b.datum.open} H {b.datum.high} L {b.datum.low} C {b.datum.close}</span>
    </div>
  {/if}
</div>

<style>
  .st-ohlcChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-ohlcChart svg {
    display: block;
    overflow: visible;
  }

  .st-ohlcChart__visual {
    display: block;
  }

  .st-ohlcChart__axis {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-ohlcChart__grid {
    stroke: var(--st-semantic-border-subtle);
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-ohlcChart__bar {
    cursor: pointer;
    transition: opacity 120ms ease;
  }

  .st-ohlcChart__bar--dim {
    opacity: 0.4;
  }

  .st-ohlcChart__range,
  .st-ohlcChart__open,
  .st-ohlcChart__close {
    stroke-width: 1.75;
    stroke-linecap: round;
  }

  .st-ohlcChart__bar--up :is(.st-ohlcChart__range, .st-ohlcChart__open, .st-ohlcChart__close) {
    stroke: var(--st-semantic-feedback-success);
  }

  .st-ohlcChart__bar--down :is(.st-ohlcChart__range, .st-ohlcChart__open, .st-ohlcChart__close) {
    stroke: var(--st-semantic-feedback-error);
  }

  @media (prefers-reduced-motion: reduce) {
    .st-ohlcChart__bar {
      transition: none;
    }
  }

  .st-ohlcChart__tickLabel,
  .st-ohlcChart__categoryLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
  }

  .st-ohlcChart__tooltip {
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

  .st-ohlcChart__tooltipLabel {
    font-weight: 600;
  }

  .st-ohlcChart__tooltipValue {
    opacity: 0.85;
  }
</style>

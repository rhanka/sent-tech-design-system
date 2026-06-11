<script lang="ts" module>
  /**
   * HeikinAshiChart - chandeliers Heikin-Ashi (finance lissée).
   * Mêmes données OHLC que CandlestickChart, mais valeurs RECALCULÉES en Heikin-Ashi :
   *   haClose = (open + high + low + close) / 4
   *   haOpen  = 1re bougie : (open + close) / 2 ; sinon (haOpen_prev + haClose_prev) / 2
   *   haHigh  = max(high, haOpen, haClose)
   *   haLow   = min(low,  haOpen, haClose)
   * Couleur hausse (haClose ≥ haOpen) / baisse via les mêmes tokens que Candlestick.
   * API canonique (référence Svelte, React/Vue doivent s'aligner)
   *
   * Props obligatoires :
   *   data   HeikinAshiChartDatum[]  - tableau {label, open, high, low, close}
   *   label  string
   *
   * Props optionnelles :
   *   width   number  (défaut 480)
   *   height  number  (défaut 240)
   *   class   string
   */
  export type HeikinAshiChartDatum = {
    label: string;
    open: number;
    high: number;
    low: number;
    close: number;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type HeikinAshiChartProps = {
    data: HeikinAshiChartDatum[];
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
  }: HeikinAshiChartProps = $props();

  const MARGIN = { top: 12, right: 16, bottom: 32, left: 52 };

  type HACandle = {
    label: string;
    haOpen: number;
    haHigh: number;
    haLow: number;
    haClose: number;
  };

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

  function fmt(v: number): string {
    return Number.isInteger(v) ? String(v) : v.toFixed(2);
  }

  // Heikin-Ashi : récurrence sur haOpen
  function computeHeikinAshi(rows: HeikinAshiChartDatum[]): HACandle[] {
    const out: HACandle[] = [];
    for (let i = 0; i < rows.length; i++) {
      const d = rows[i];
      const haClose = (d.open + d.high + d.low + d.close) / 4;
      const haOpen =
        i === 0
          ? (d.open + d.close) / 2
          : (out[i - 1].haOpen + out[i - 1].haClose) / 2;
      const haHigh = Math.max(d.high, haOpen, haClose);
      const haLow = Math.min(d.low, haOpen, haClose);
      out.push({ label: d.label, haOpen, haHigh, haLow, haClose });
    }
    return out;
  }

  let hoveredIndex: number | null = $state(null);

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  // Filtrer les bougies invalides AVANT le calcul HA et le domaine
  const validData = $derived(
    data.filter((d) =>
      Number.isFinite(d.open) &&
      Number.isFinite(d.high) &&
      Number.isFinite(d.low) &&
      Number.isFinite(d.close)
    )
  );

  const haData = $derived(computeHeikinAshi(validData));

  const domainBounds = $derived.by(() => {
    const allVals: number[] = [];
    for (const d of haData) {
      // Domaine sur les valeurs HA (haOpen/haHigh/haLow/haClose)
      allVals.push(d.haOpen, d.haHigh, d.haLow, d.haClose);
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
    if (haData.length === 0) return [];
    const band = plotWidth / haData.length;
    const bodyW = band * 0.55;

    return haData.map((d, i) => {
      const bullish = d.haClose >= d.haOpen;
      const centerX = MARGIN.left + band * i + band / 2;

      const bodyTop = MARGIN.top + scaleLinear(Math.max(d.haOpen, d.haClose), domainMin, domainMax, plotHeight, 0);
      const bodyBot = MARGIN.top + scaleLinear(Math.min(d.haOpen, d.haClose), domainMin, domainMax, plotHeight, 0);
      const highY = MARGIN.top + scaleLinear(d.haHigh, domainMin, domainMax, plotHeight, 0);
      const lowY = MARGIN.top + scaleLinear(d.haLow, domainMin, domainMax, plotHeight, 0);

      return {
        datum: d,
        index: i,
        bullish,
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
    haData.map((d) => `${d.label}: O ${fmt(d.haOpen)} H ${fmt(d.haHigh)} L ${fmt(d.haLow)} C ${fmt(d.haClose)}`)
  );

  function handlePointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) { hoveredIndex = null; return; }
    const idx = Number(target.getAttribute("data-chart-index"));
    hoveredIndex = Number.isInteger(idx) ? idx : null;
  }

  const classes = () => ["st-heikinAshiChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-heikinAshiChart__visual"
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
        <line class="st-heikinAshiChart__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={ty} y2={ty} />
        <text class="st-heikinAshiChart__tickLabel" x={MARGIN.left - 6} y={ty} text-anchor="end" dominant-baseline="middle">
          {formatTick(tick)}
        </text>
      {/each}

      <!-- axes -->
      <line class="st-heikinAshiChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
      <line class="st-heikinAshiChart__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

      {#each candles as c, i (`${i}-${c.datum.label}`)}
        <!-- wick -->
        <line
          class="st-heikinAshiChart__wick st-heikinAshiChart__wick--{c.bullish ? 'up' : 'down'}"
          x1={c.centerX}
          x2={c.centerX}
          y1={c.wickHighY}
          y2={c.wickLowY}
          data-chart-index={i}
        />
        <!-- body -->
        <rect
          class="st-heikinAshiChart__body st-heikinAshiChart__body--{c.bullish ? 'up' : 'down'}"
          class:st-heikinAshiChart__body--dim={hoveredIndex !== null && hoveredIndex !== i}
          x={c.bodyX}
          y={c.bodyY}
          width={c.bodyW}
          height={c.bodyH}
          rx="1"
          data-chart-index={i}
        />
        <!-- category label -->
        <text
          class="st-heikinAshiChart__categoryLabel"
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
      class="st-heikinAshiChart__tooltip"
      role="presentation"
      style="left: {(c.centerX / width) * 100}%; top: {(c.tooltipY / height) * 100}%"
    >
      <span class="st-heikinAshiChart__tooltipLabel">{c.datum.label}</span>
      <span class="st-heikinAshiChart__tooltipValue">O {fmt(c.datum.haOpen)} H {fmt(c.datum.haHigh)} L {fmt(c.datum.haLow)} C {fmt(c.datum.haClose)}</span>
    </div>
  {/if}
</div>

<style>
  .st-heikinAshiChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-heikinAshiChart svg {
    display: block;
    overflow: visible;
  }

  .st-heikinAshiChart__visual {
    display: block;
  }

  .st-heikinAshiChart__axis {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-heikinAshiChart__grid {
    stroke: var(--st-semantic-border-subtle);
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-heikinAshiChart__wick {
    stroke-width: 1.5;
  }

  .st-heikinAshiChart__wick--up {
    stroke: var(--st-semantic-feedback-success);
  }

  .st-heikinAshiChart__wick--down {
    stroke: var(--st-semantic-feedback-error);
  }

  .st-heikinAshiChart__body {
    cursor: pointer;
    transition: opacity 120ms ease;
  }

  .st-heikinAshiChart__body--dim {
    opacity: 0.4;
  }

  .st-heikinAshiChart__body--up {
    fill: var(--st-semantic-feedback-success);
  }

  .st-heikinAshiChart__body--down {
    fill: var(--st-semantic-feedback-error);
  }

  @media (prefers-reduced-motion: reduce) {
    .st-heikinAshiChart__body {
      transition: none;
    }
  }

  .st-heikinAshiChart__tickLabel,
  .st-heikinAshiChart__categoryLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
  }

  .st-heikinAshiChart__tooltip {
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

  .st-heikinAshiChart__tooltipLabel {
    font-weight: 600;
  }

  .st-heikinAshiChart__tooltipValue {
    opacity: 0.85;
  }
</style>

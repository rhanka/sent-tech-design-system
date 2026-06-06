<script lang="ts" module>
  export type DivergentBarChartTone = "positive" | "negative" | "neutral";

  export type DivergentBarChartDatum = {
    label: string;
    value: number;
    tone?: DivergentBarChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type DivergentBarChartProps = {
    data: DivergentBarChartDatum[];
    width?: number;
    height?: number;
    domain?: [number, number];
    format?: (value: number) => string;
    showLegend?: boolean;
    label: string;
    class?: string;
  };

  let {
    data,
    width = 480,
    height = 260,
    domain,
    format = formatTick,
    showLegend = true,
    label,
    class: className
  }: DivergentBarChartProps = $props();

  const MARGIN = { top: 14, right: 16, bottom: 34, left: 88 };

  function niceTicks(min: number, max: number, target = 5): number[] {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
      const base = Number.isFinite(max) ? max : 0;
      return [base];
    }
    const range = max - min;
    const rough = range / Math.max(target - 1, 1);
    const pow = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / pow;
    const step = norm < 1.5 ? pow : norm < 3 ? 2 * pow : norm < 7 ? 5 * pow : 10 * pow;
    const start = Math.floor(min / step) * step;
    const end = Math.ceil(max / step) * step;
    const ticks: number[] = [];
    for (let v = start; v <= end + step / 2; v += step) ticks.push(Number(v.toFixed(10)));
    return ticks;
  }

  const scaleLinear = (v: number, d0: number, d1: number, r0: number, r1: number) =>
    d1 === d0 ? r0 : r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);

  function formatTick(v: number): string {
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(1);
  }

  function signFor(value: number): "positive" | "negative" | "zero" {
    if (value > 0) return "positive";
    if (value < 0) return "negative";
    return "zero";
  }

  function toneFor(datum: DivergentBarChartDatum): DivergentBarChartTone {
    if (datum.tone) return datum.tone;
    if (datum.value > 0) return "positive";
    if (datum.value < 0) return "negative";
    return "neutral";
  }

  let hoveredIndex: number | null = $state(null);

  const validData = $derived(data.filter((d) => Number.isFinite(d.value)));

  const validDomain = $derived.by<[number, number] | null>(() => {
    if (!domain) return null;
    const [d0, d1] = domain;
    if (!Number.isFinite(d0) || !Number.isFinite(d1) || d0 >= d1 || d0 > 0 || d1 < 0) return null;
    return [d0, d1];
  });

  const scales = $derived.by(() => {
    const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
    const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
    if (validDomain) {
      const ticks = niceTicks(validDomain[0], validDomain[1]).filter((tick) => tick >= validDomain[0] && tick <= validDomain[1]);
      return { plotWidth, plotHeight, domainMin: validDomain[0], domainMax: validDomain[1], ticks: ticks.length ? ticks : [0] };
    }
    const maxAbs = Math.max(1, ...validData.map((d) => Math.abs(d.value)));
    const ticks = niceTicks(-maxAbs, maxAbs);
    return { plotWidth, plotHeight, domainMin: ticks[0], domainMax: ticks[ticks.length - 1], ticks };
  });

  const bars = $derived.by(() => {
    if (validData.length === 0) return [];
    const { domainMin, domainMax, plotWidth, plotHeight } = scales;
    const band = plotHeight / validData.length;
    const barHeight = Math.max(band * 0.56, 1);
    const zeroX = MARGIN.left + scaleLinear(0, domainMin, domainMax, 0, plotWidth);
    return validData.map((datum, index) => {
      const valueX = MARGIN.left + scaleLinear(datum.value, domainMin, domainMax, 0, plotWidth);
      const x = Math.min(zeroX, valueX);
      const barWidth = Math.max(Math.abs(valueX - zeroX), 0.5);
      const y = MARGIN.top + band * index + (band - barHeight) / 2;
      return {
        datum,
        index,
        x,
        y,
        width: barWidth,
        height: barHeight,
        cx: datum.value === 0 ? zeroX : x + barWidth / 2,
        cy: y + barHeight / 2,
        sign: signFor(datum.value),
        tone: toneFor(datum)
      };
    });
  });

  const dataValueItems = $derived(validData.map((d) => `${d.label}: ${format(d.value)}`));

  const gridTicks = $derived.by(() => {
    const { ticks, domainMin, domainMax, plotWidth } = scales;
    return ticks.map((tick) => ({
      value: tick,
      x: MARGIN.left + scaleLinear(tick, domainMin, domainMax, 0, plotWidth)
    }));
  });

  function handleVisualPointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredIndex = null;
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    hoveredIndex = Number.isInteger(index) ? index : null;
  }

  const hoveredBar = $derived(hoveredIndex !== null ? bars[hoveredIndex] : undefined);
  const zeroAxisX = $derived(MARGIN.left + scaleLinear(0, scales.domainMin, scales.domainMax, 0, scales.plotWidth));
  const classes = () => ["st-divergentBarChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-divergentBarChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handleVisualPointerMove}
    onpointerleave={() => (hoveredIndex = null)}
  >
    <svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
      {#each gridTicks as tick (tick.value)}
        <line class="st-divergentBarChart__grid" x1={tick.x} x2={tick.x} y1={MARGIN.top} y2={height - MARGIN.bottom} />
        <text class="st-divergentBarChart__tickLabel" x={tick.x} y={height - MARGIN.bottom + 16} text-anchor="middle">
          {formatTick(tick.value)}
        </text>
      {/each}

      <line class="st-divergentBarChart__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />
      <line class="st-divergentBarChart__zeroAxis" x1={zeroAxisX} x2={zeroAxisX} y1={MARGIN.top} y2={height - MARGIN.bottom} />

      {#each bars as bar (bar.datum.label)}
        <text class="st-divergentBarChart__categoryLabel" x={MARGIN.left - 8} y={bar.cy} text-anchor="end" dominant-baseline="middle">
          {bar.datum.label}
        </text>
        <rect
          class="st-divergentBarChart__bar st-divergentBarChart__bar--{bar.sign} st-divergentBarChart__bar--{bar.tone}"
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          rx="2"
          data-chart-index={bar.index}
          data-chart-key={bar.datum.label}
        />
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredBar}
    <div class="st-divergentBarChart__tooltip" role="presentation" style="left: {(hoveredBar.cx / width) * 100}%; top: {(hoveredBar.cy / height) * 100}%">
      <span class="st-divergentBarChart__tooltipLabel">{hoveredBar.datum.label}</span>
      <span class="st-divergentBarChart__tooltipValue">{format(hoveredBar.datum.value)}</span>
    </div>
  {/if}

  {#if showLegend}
    <ul class="st-divergentBarChart__legend">
      <li class="st-divergentBarChart__legendItem"><span class="st-divergentBarChart__legendSwatch st-divergentBarChart__legendSwatch--positive" aria-hidden="true"></span>Positive</li>
      <li class="st-divergentBarChart__legendItem"><span class="st-divergentBarChart__legendSwatch st-divergentBarChart__legendSwatch--negative" aria-hidden="true"></span>Negative</li>
      <li class="st-divergentBarChart__legendItem"><span class="st-divergentBarChart__legendSwatch st-divergentBarChart__legendSwatch--neutral" aria-hidden="true"></span>Zero</li>
    </ul>
  {/if}
</div>

<style>
  .st-divergentBarChart {
    color: var(--st-component-divergentBarChart-labelColor, var(--st-semantic-text-secondary));
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-divergentBarChart svg,
  .st-divergentBarChart__visual {
    display: block;
    overflow: visible;
  }

  .st-divergentBarChart__grid {
    stroke: var(--st-component-divergentBarChart-gridStroke, var(--st-semantic-border-subtle));
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-divergentBarChart__axis {
    stroke: var(--st-component-divergentBarChart-axisStroke, var(--st-semantic-border-subtle));
    stroke-width: 1;
  }

  .st-divergentBarChart__zeroAxis {
    stroke: var(--st-component-divergentBarChart-zeroStroke, var(--st-semantic-border-strong));
    stroke-width: 1.5;
  }

  .st-divergentBarChart__tickLabel,
  .st-divergentBarChart__categoryLabel {
    fill: var(--st-component-divergentBarChart-labelColor, var(--st-semantic-text-secondary));
    font-size: 0.6875rem;
  }

  .st-divergentBarChart__bar {
    cursor: pointer;
    transition: opacity var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-divergentBarChart__bar--positive {
    fill: var(--st-component-divergentBarChart-positiveFill, var(--st-semantic-data-category5));
  }

  .st-divergentBarChart__bar--negative {
    fill: var(--st-component-divergentBarChart-negativeFill, var(--st-semantic-data-category3));
  }

  .st-divergentBarChart__bar--neutral,
  .st-divergentBarChart__bar--zero {
    fill: var(--st-component-divergentBarChart-neutralFill, var(--st-semantic-data-category6));
  }

  .st-divergentBarChart__tooltip {
    background: var(--st-component-divergentBarChart-tooltipBackground, var(--st-semantic-surface-inverse));
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-component-divergentBarChart-tooltipText, var(--st-semantic-text-inverse));
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

  .st-divergentBarChart__tooltipLabel {
    font-weight: 600;
  }

  .st-divergentBarChart__tooltipValue {
    opacity: 0.85;
  }

  .st-divergentBarChart__legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-3, 0.75rem);
    list-style: none;
    margin: var(--st-spacing-2, 0.5rem) 0 0;
    padding: 0;
  }

  .st-divergentBarChart__legendItem {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    font-size: 0.75rem;
    gap: var(--st-spacing-1, 0.25rem);
  }

  .st-divergentBarChart__legendSwatch {
    border-radius: 2px;
    height: 0.7rem;
    width: 0.7rem;
  }

  .st-divergentBarChart__legendSwatch--positive {
    background: var(--st-component-divergentBarChart-positiveFill, var(--st-semantic-data-category5));
  }

  .st-divergentBarChart__legendSwatch--negative {
    background: var(--st-component-divergentBarChart-negativeFill, var(--st-semantic-data-category3));
  }

  .st-divergentBarChart__legendSwatch--neutral {
    background: var(--st-component-divergentBarChart-neutralFill, var(--st-semantic-data-category6));
  }

  @media (prefers-reduced-motion: reduce) {
    .st-divergentBarChart__bar {
      transition: none;
    }
  }
</style>

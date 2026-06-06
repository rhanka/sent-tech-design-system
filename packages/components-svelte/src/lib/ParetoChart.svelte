<script lang="ts" module>
  /**
   * ParetoChart — barres triées décroissantes + courbe cumulée en % (2e axe).
   * API canonique (référence Svelte, React/Vue doivent s'aligner).
   *
   * Props obligatoires :
   *   data   ParetoChartDatum[]  - tableau {label, value, tone?}
   *   label  string              - aria-label du graphique
   *
   * Props optionnelles :
   *   width   number  (défaut 480)
   *   height  number  (défaut 240)
   *   class   string
   */
  export type ParetoChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type ParetoChartDatum = {
    label: string;
    value: number;
    tone?: ParetoChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type ParetoChartProps = {
    data: ParetoChartDatum[];
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };

  let {
    data = [],
    width = 480,
    height = 240,
    label,
    class: className
  }: ParetoChartProps = $props();

  // Right margin larger than BarChart's to host the % axis labels.
  const MARGIN = { top: 12, right: 44, bottom: 32, left: 44 };
  const DOT_RADIUS = 4;

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

  // Valid data: finite, non-negative value (Pareto cumulative % assumes
  // non-negative magnitudes). Sorted descending by value.
  const sortedData = $derived(
    data
      .filter((d) => Number.isFinite(d.value) && d.value >= 0)
      .slice()
      .sort((a, b) => b.value - a.value)
  );

  const total = $derived(sortedData.reduce((acc, d) => acc + d.value, 0));

  const scales = $derived.by(() => {
    const values = sortedData.map((d) => d.value);
    const ticks = niceTicks(0, Math.max(0, ...values), 5);
    const domainMin = ticks[0];
    const domainMax = ticks[ticks.length - 1];
    const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
    const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
    return { ticks, domainMin, domainMax, plotWidth, plotHeight };
  });

  type ParetoEntry = {
    datum: ParetoChartDatum;
    tone: ParetoChartTone;
    // bar geometry
    x: number;
    y: number;
    width: number;
    height: number;
    // cumulative point geometry
    cumPercent: number;
    cx: number;
    cy: number;
  };

  const entries = $derived.by<ParetoEntry[]>(() => {
    const { domainMin, domainMax, plotWidth, plotHeight } = scales;
    if (sortedData.length === 0) return [];
    const band = plotWidth / sortedData.length;
    const barWidth = band * 0.62;
    const zeroY = scaleLinear(0, domainMin, domainMax, plotHeight, 0);
    let running = 0;
    return sortedData.map((d, i) => {
      running += d.value;
      const cumPercent = total > 0 ? (running / total) * 100 : 0;
      const valueY = scaleLinear(d.value, domainMin, domainMax, plotHeight, 0);
      const y = Math.min(valueY, zeroY);
      const h = Math.abs(zeroY - valueY);
      const x = MARGIN.left + band * i + (band - barWidth) / 2;
      // The % axis maps [0,100] over the full plot height (100% at top).
      const cy = MARGIN.top + scaleLinear(cumPercent, 0, 100, plotHeight, 0);
      return {
        datum: d,
        tone: d.tone ?? "category1",
        x,
        y: MARGIN.top + y,
        width: barWidth,
        height: Math.max(h, 0.5),
        cumPercent,
        cx: MARGIN.left + band * (i + 0.5),
        cy
      };
    });
  });

  const cumulativePath = $derived(
    entries.map((e, i) => `${i === 0 ? "M" : "L"} ${e.cx} ${e.cy}`).join(" ")
  );

  const dataValueItems = $derived(
    entries.map(
      (e) => `${e.datum.label}: ${e.datum.value} (${formatTick(e.cumPercent)}% cumulé)`
    )
  );

  const valueAxisTicks = $derived.by(() => {
    const { ticks, domainMin, domainMax, plotWidth, plotHeight } = scales;
    return ticks.map((tick) => ({
      value: tick,
      x1: MARGIN.left,
      x2: MARGIN.left + plotWidth,
      y: MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0)
    }));
  });

  // Right (percentage) axis: fixed 0–100 in 25% steps.
  const percentAxisTicks = $derived.by(() => {
    const { plotHeight } = scales;
    return [0, 25, 50, 75, 100].map((pct) => ({
      value: pct,
      y: MARGIN.top + scaleLinear(pct, 0, 100, plotHeight, 0)
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

  const classes = () => ["st-paretoChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-paretoChart__visual"
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
      <!-- value-axis gridlines + left tick labels -->
      {#each valueAxisTicks as tick (tick.value)}
        <line class="st-paretoChart__grid" x1={tick.x1} x2={tick.x2} y1={tick.y} y2={tick.y} />
        <text
          class="st-paretoChart__tickLabel"
          x={MARGIN.left - 6}
          y={tick.y}
          text-anchor="end"
          dominant-baseline="middle"
        >
          {formatTick(tick.value)}
        </text>
      {/each}

      <!-- right percentage-axis labels -->
      {#each percentAxisTicks as tick (tick.value)}
        <text
          class="st-paretoChart__percentLabel"
          x={width - MARGIN.right + 6}
          y={tick.y}
          text-anchor="start"
          dominant-baseline="middle"
        >
          {tick.value}%
        </text>
      {/each}

      <!-- axes -->
      <line
        class="st-paretoChart__axis"
        x1={MARGIN.left}
        x2={MARGIN.left}
        y1={MARGIN.top}
        y2={height - MARGIN.bottom}
      />
      <line
        class="st-paretoChart__axis"
        x1={width - MARGIN.right}
        x2={width - MARGIN.right}
        y1={MARGIN.top}
        y2={height - MARGIN.bottom}
      />
      <line
        class="st-paretoChart__axis"
        x1={MARGIN.left}
        x2={width - MARGIN.right}
        y1={height - MARGIN.bottom}
        y2={height - MARGIN.bottom}
      />

      <!-- category labels -->
      {#each entries as e (e.datum.label)}
        <text
          class="st-paretoChart__categoryLabel"
          x={e.x + e.width / 2}
          y={height - MARGIN.bottom + 16}
          text-anchor="middle"
        >
          {e.datum.label}
        </text>
      {/each}

      <!-- bars (decorative, inside aria-hidden SVG) -->
      {#each entries as e, i (e.datum.label)}
        <rect
          class="st-paretoChart__bar st-paretoChart__bar--{e.tone}"
          x={e.x}
          y={e.y}
          width={e.width}
          height={e.height}
          rx="2"
          data-chart-index={i}
        />
      {/each}

      <!-- cumulative % line + dots -->
      {#if entries.length > 0}
        <path class="st-paretoChart__cumLine" d={cumulativePath} fill="none" />
        {#each entries as e, i (e.datum.label)}
          <circle
            class="st-paretoChart__cumDot"
            cx={e.cx}
            cy={e.cy}
            r={DOT_RADIUS}
            data-chart-index={i}
          />
        {/each}
      {/if}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && entries[hoveredIndex]}
    {@const e = entries[hoveredIndex]}
    <div
      class="st-paretoChart__tooltip"
      role="presentation"
      style="left: {(e.cx / width) * 100}%; top: {(e.cy / height) * 100}%"
    >
      <span class="st-paretoChart__tooltipLabel">{e.datum.label}</span>
      <span class="st-paretoChart__tooltipValue">{e.datum.value} · {formatTick(e.cumPercent)}%</span>
    </div>
  {/if}
</div>

<style>
  .st-paretoChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-paretoChart svg {
    display: block;
    overflow: visible;
  }

  .st-paretoChart__visual {
    display: block;
  }

  .st-paretoChart__grid {
    stroke: var(--st-component-paretoChart-gridStroke, var(--st-semantic-border-subtle));
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-paretoChart__axis {
    stroke: var(--st-component-paretoChart-axisStroke, var(--st-semantic-border-subtle));
    stroke-width: 1;
  }

  .st-paretoChart__tickLabel,
  .st-paretoChart__categoryLabel,
  .st-paretoChart__percentLabel {
    fill: var(--st-component-paretoChart-labelColor, var(--st-semantic-text-secondary));
    font-size: 0.6875rem;
  }

  .st-paretoChart__bar {
    cursor: pointer;
    transition: opacity var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-paretoChart__bar:hover {
    opacity: 0.82;
  }

  .st-paretoChart__bar--category1 { fill: var(--st-semantic-data-category1); }
  .st-paretoChart__bar--category2 { fill: var(--st-semantic-data-category2); }
  .st-paretoChart__bar--category3 { fill: var(--st-semantic-data-category3); }
  .st-paretoChart__bar--category4 { fill: var(--st-semantic-data-category4); }
  .st-paretoChart__bar--category5 { fill: var(--st-semantic-data-category5); }
  .st-paretoChart__bar--category6 { fill: var(--st-semantic-data-category6); }
  .st-paretoChart__bar--category7 { fill: var(--st-semantic-data-category7); }
  .st-paretoChart__bar--category8 { fill: var(--st-semantic-data-category8); }

  .st-paretoChart__cumLine {
    stroke: var(--st-semantic-action-primary, var(--st-semantic-border-interactive));
    stroke-width: 2;
  }

  .st-paretoChart__cumDot {
    cursor: pointer;
    fill: var(--st-semantic-action-primary, var(--st-semantic-border-interactive));
    transition: opacity var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-paretoChart__cumDot:hover {
    opacity: 0.82;
  }

  .st-paretoChart__tooltip {
    background: var(--st-component-paretoChart-tooltipBackground, var(--st-semantic-surface-inverse));
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-component-paretoChart-tooltipText, var(--st-semantic-text-inverse));
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

  .st-paretoChart__tooltipLabel {
    font-weight: 600;
  }

  .st-paretoChart__tooltipValue {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-paretoChart__bar,
    .st-paretoChart__cumDot {
      transition: none;
    }
  }
</style>

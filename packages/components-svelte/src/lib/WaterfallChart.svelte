<script lang="ts" module>
  export type WaterfallType = "increase" | "decrease" | "total";

  export type WaterfallChartDatum = {
    label: string;
    value: number;
    type?: WaterfallType;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type WaterfallChartProps = {
    data: WaterfallChartDatum[];
    width?: number;
    height?: number;
    connectors?: boolean;
    format?: (value: number) => string;
    label: string;
    class?: string;
  };

  let {
    data = [],
    width = 480,
    height = 240,
    connectors = true,
    format,
    label,
    class: className
  }: WaterfallChartProps = $props();

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

  function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number) {
    if (d1 === d0) return r0;
    return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
  }

  function formatTick(v: number): string {
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(1);
  }

  function formatValue(v: number): string {
    return format ? format(v) : formatTick(v);
  }

  // Resolve the floating start/end of each bar, accumulating running totals.
  // - increase: bar floats UP by +|value| from the running cumulative.
  // - decrease: bar floats DOWN by -|value| from the running cumulative.
  //   The explicit `type` drives the sign — a `decrease` with value 50 or -50
  //   both subtract 50, so the type is never reclassified from the geometry.
  // - total: bar anchored to zero, spanning 0 → its own value, and it (re)sets
  //   the running cumulative. A *starting* total establishes the baseline; a
  //   *closing* total should equal the accumulated cumulative — if it diverges,
  //   a dev warning is emitted (the bar still honours the explicit value so the
  //   author sees the mismatch rather than a silently rewritten figure).
  const computed = $derived.by(() => {
    let cumulative = 0;
    let seenStep = false;
    return data.map((d) => {
      const raw = Number.isFinite(d.value) ? d.value : 0;
      const type: WaterfallType = d.type ?? (raw >= 0 ? "increase" : "decrease");
      let start: number;
      let end: number;
      let displayValue: number;
      if (type === "total") {
        if (seenStep && raw !== cumulative) {
          // eslint-disable-next-line no-console
          console.warn(
            `[WaterfallChart] total "${d.label}" = ${raw} ` +
              `diverges from the running cumulative ${cumulative}.`
          );
        }
        start = 0;
        end = raw;
        cumulative = raw;
        displayValue = raw;
      } else {
        const signed = type === "decrease" ? -Math.abs(raw) : Math.abs(raw);
        start = cumulative;
        end = cumulative + signed;
        cumulative = end;
        displayValue = signed;
        seenStep = true;
      }
      return { datum: d, type, start, end, displayValue, cumulative };
    });
  });

  const scales = $derived.by(() => {
    const bounds = computed.flatMap((c) => [c.start, c.end]);
    const minRaw = Math.min(0, ...bounds);
    const maxRaw = Math.max(0, ...bounds);
    const ticks = niceTicks(minRaw, maxRaw, 5);
    const domainMin = ticks[0];
    const domainMax = ticks[ticks.length - 1];
    const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
    const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
    return { ticks, domainMin, domainMax, plotWidth, plotHeight };
  });

  const bars = $derived.by(() => {
    const { domainMin, domainMax, plotWidth, plotHeight } = scales;
    if (computed.length === 0) return [];
    const band = plotWidth / computed.length;
    const barWidth = band * 0.62;
    return computed.map((c, i) => {
      const startY = scaleLinear(c.start, domainMin, domainMax, plotHeight, 0);
      const endY = scaleLinear(c.end, domainMin, domainMax, plotHeight, 0);
      const y = Math.min(startY, endY);
      const h = Math.abs(endY - startY);
      const x = MARGIN.left + band * i + (band - barWidth) / 2;
      return {
        x,
        y: MARGIN.top + y,
        width: barWidth,
        height: Math.max(h, 0.5),
        topY: MARGIN.top + Math.min(startY, endY),
        bottomY: MARGIN.top + Math.max(startY, endY),
        cx: MARGIN.left + band * (i + 0.5),
        cy: MARGIN.top + Math.min(startY, endY),
        type: c.type,
        datum: c.datum,
        displayValue: c.displayValue,
        cumulative: c.cumulative,
        index: i
      };
    });
  });

  // Connector lines join the running level reached at the end of bar[i] to the
  // start of bar[i+1]: from the right edge of bar[i] to the left edge of bar[i+1].
  const connectorLines = $derived.by(() => {
    if (!connectors || bars.length < 2) return [];
    const { domainMin, domainMax, plotHeight } = scales;
    const lines: { x1: number; x2: number; y: number }[] = [];
    for (let i = 0; i < computed.length - 1; i++) {
      const level = computed[i].end;
      const y = MARGIN.top + scaleLinear(level, domainMin, domainMax, plotHeight, 0);
      lines.push({ x1: bars[i].x + bars[i].width, x2: bars[i + 1].x, y });
    }
    return lines;
  });

  const valueAxisTicks = $derived.by(() => {
    const { ticks, domainMin, domainMax, plotWidth, plotHeight } = scales;
    return ticks.map((tick) => ({
      value: tick,
      x1: MARGIN.left,
      x2: MARGIN.left + plotWidth,
      y: MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0)
    }));
  });

  const zeroY = $derived.by(() => {
    const { domainMin, domainMax, plotHeight } = scales;
    return MARGIN.top + scaleLinear(0, domainMin, domainMax, plotHeight, 0);
  });

  const dataValueItems = $derived(
    computed.map((c) => `${c.datum.label}: ${formatValue(c.displayValue)}`)
  );

  const legendItems: { type: WaterfallType; label: string }[] = [
    { type: "increase", label: "Hausse" },
    { type: "decrease", label: "Baisse" },
    { type: "total", label: "Total" }
  ];

  let hoveredIndex: number | null = $state(null);

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

  const classes = () => ["st-waterfallChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-waterfallChart__visual"
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
        <line
          class="st-waterfallChart__grid"
          x1={tick.x1}
          x2={tick.x2}
          y1={tick.y}
          y2={tick.y}
        />
        <text
          class="st-waterfallChart__tickLabel"
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
        class="st-waterfallChart__axis"
        x1={MARGIN.left}
        x2={MARGIN.left}
        y1={MARGIN.top}
        y2={height - MARGIN.bottom}
      />
      <line
        class="st-waterfallChart__axis"
        x1={MARGIN.left}
        x2={width - MARGIN.right}
        y1={height - MARGIN.bottom}
        y2={height - MARGIN.bottom}
      />
      <!-- zero baseline -->
      <line
        class="st-waterfallChart__zero"
        x1={MARGIN.left}
        x2={width - MARGIN.right}
        y1={zeroY}
        y2={zeroY}
      />

      <!-- connector lines -->
      {#each connectorLines as line, i (i)}
        <line
          class="st-waterfallChart__connector"
          x1={line.x1}
          x2={line.x2}
          y1={line.y}
          y2={line.y}
        />
      {/each}

      <!-- category labels -->
      {#each bars as bar (bar.datum.label)}
        <text
          class="st-waterfallChart__categoryLabel"
          x={bar.x + bar.width / 2}
          y={height - MARGIN.bottom + 16}
          text-anchor="middle"
        >
          {bar.datum.label}
        </text>
      {/each}

      <!-- bars -->
      {#each bars as bar, i (bar.datum.label)}
        <rect
          class="st-waterfallChart__bar st-waterfallChart__bar--{bar.type}"
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

  <ul class="st-waterfallChart__legend" aria-hidden="true">
    {#each legendItems as item (item.type)}
      <li class="st-waterfallChart__legendItem">
        <span class="st-waterfallChart__legendSwatch st-waterfallChart__legendSwatch--{item.type}"
        ></span>
        {item.label}
      </li>
    {/each}
  </ul>

  {#if hoveredIndex !== null && bars[hoveredIndex]}
    {@const bar = bars[hoveredIndex]}
    <div
      class="st-waterfallChart__tooltip"
      role="presentation"
      style="left: {(bar.cx / width) * 100}%; top: {(bar.cy / height) * 100}%"
    >
      <span class="st-waterfallChart__tooltipLabel">{bar.datum.label}</span>
      <span class="st-waterfallChart__tooltipValue">{formatValue(bar.displayValue)}</span>
    </div>
  {/if}
</div>

<style>
  .st-waterfallChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-waterfallChart svg {
    display: block;
    overflow: visible;
  }

  .st-waterfallChart__visual {
    display: block;
  }

  .st-waterfallChart__grid {
    stroke: var(--st-component-waterfallChart-gridStroke, var(--st-semantic-border-subtle));
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-waterfallChart__axis {
    stroke: var(--st-component-waterfallChart-axisStroke, var(--st-semantic-border-subtle));
    stroke-width: 1;
  }

  .st-waterfallChart__zero {
    stroke: var(--st-component-waterfallChart-zeroStroke, var(--st-semantic-border-strong));
    stroke-width: 1;
  }

  .st-waterfallChart__connector {
    stroke: var(--st-component-waterfallChart-connectorStroke, var(--st-semantic-border-strong));
    stroke-dasharray: 3 2;
    stroke-width: 1;
    opacity: 0.6;
  }

  .st-waterfallChart__tickLabel,
  .st-waterfallChart__categoryLabel {
    fill: var(--st-component-waterfallChart-labelColor, var(--st-semantic-text-secondary));
    font-size: 0.6875rem;
  }

  .st-waterfallChart__bar {
    cursor: pointer;
    transition: opacity 120ms ease;
  }

  .st-waterfallChart__bar:hover {
    opacity: 0.82;
  }

  .st-waterfallChart__bar--increase {
    fill: var(--st-component-waterfallChart-increaseFill, var(--st-semantic-feedback-success));
  }
  .st-waterfallChart__bar--decrease {
    fill: var(--st-component-waterfallChart-decreaseFill, var(--st-semantic-feedback-error));
  }
  .st-waterfallChart__bar--total {
    fill: var(--st-component-waterfallChart-totalFill, var(--st-semantic-data-category1));
  }

  @media (prefers-reduced-motion: reduce) {
    .st-waterfallChart__bar {
      transition: none;
    }
  }

  .st-waterfallChart__legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-3, 0.75rem);
    list-style: none;
    margin: var(--st-spacing-2, 0.5rem) 0 0;
    padding: 0;
  }

  .st-waterfallChart__legendItem {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    font-size: 0.75rem;
    gap: var(--st-spacing-1, 0.25rem);
  }

  .st-waterfallChart__legendSwatch {
    border-radius: var(--st-radius-sm, 0.25rem);
    display: inline-block;
    height: 0.75rem;
    width: 0.75rem;
  }

  .st-waterfallChart__legendSwatch--increase {
    background: var(--st-component-waterfallChart-increaseFill, var(--st-semantic-feedback-success));
  }
  .st-waterfallChart__legendSwatch--decrease {
    background: var(--st-component-waterfallChart-decreaseFill, var(--st-semantic-feedback-error));
  }
  .st-waterfallChart__legendSwatch--total {
    background: var(--st-component-waterfallChart-totalFill, var(--st-semantic-data-category1));
  }

  .st-waterfallChart__tooltip {
    background: var(--st-component-waterfallChart-tooltipBackground, var(--st-semantic-surface-inverse));
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-component-waterfallChart-tooltipText, var(--st-semantic-text-inverse));
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

  .st-waterfallChart__tooltipLabel {
    font-weight: 600;
  }

  .st-waterfallChart__tooltipValue {
    opacity: 0.85;
  }
</style>

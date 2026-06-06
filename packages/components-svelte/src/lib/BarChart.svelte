<script lang="ts" module>
  export type BarChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type BarChartDatum = {
    label: string;
    value: number;
    tone?: BarChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type BarChartProps = {
    data: BarChartDatum[];
    width?: number;
    height?: number;
    orientation?: "vertical" | "horizontal";
    label: string;
    /**
     * Keys of the currently selected bars (a bar's key is its `label`).
     * CONTROLLED — the parent owns the toggle; the component never stores
     * selection. When non-empty the selected bars stay full opacity (+ accent)
     * and the rest dim; when empty every bar is normal. Defaults to [].
     */
    selectedKeys?: string[];
    /**
     * Called with the bar's key (its `label`) when the user selects it. When
     * provided, an ACCESSIBLE row of filter chips (real <button>s) is rendered
     * OUTSIDE the aria-hidden SVG — that is the keyboard + screen-reader surface.
     * The SVG bars themselves stay decorative (aria-hidden) and only offer a
     * mouse click shortcut for sighted pointer users. When omitted the chart is
     * purely presentational (no interactivity, unchanged).
     */
    onSelect?: (key: string) => void;
    class?: string;
  };

  let {
    data,
    width = 480,
    height = 240,
    orientation = "vertical",
    label,
    selectedKeys = [],
    onSelect,
    class: className
  }: BarChartProps = $props();

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

  let hoveredIndex: number | null = $state(null);

  // Selection (controlled): fast lookup + "is any bar selected" flag. Only when
  // something is selected do we dim the non-selected bars.
  const selectedSet = $derived(new Set<string>(selectedKeys));
  const hasSelection = $derived(selectedSet.size > 0);
  const interactive = $derived(typeof onSelect === "function");

  const scales = $derived.by(() => {
    const values = data.map((d) => d.value);
    const minRaw = Math.min(0, ...values);
    const maxRaw = Math.max(0, ...values);
    const ticks = niceTicks(minRaw, maxRaw, 5);
    const domainMin = ticks[0];
    const domainMax = ticks[ticks.length - 1];
    const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
    const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
    return { ticks, domainMin, domainMax, plotWidth, plotHeight };
  });

  const bars = $derived.by(() => {
    const { domainMin, domainMax, plotWidth, plotHeight } = scales;
    if (data.length === 0) return [];
    if (orientation === "vertical") {
      const band = plotWidth / data.length;
      const barWidth = band * 0.62;
      const zeroY = scaleLinear(0, domainMin, domainMax, plotHeight, 0);
      return data.map((d, i) => {
        const valueY = scaleLinear(d.value, domainMin, domainMax, plotHeight, 0);
        const y = Math.min(valueY, zeroY);
        const h = Math.abs(zeroY - valueY);
        const x = MARGIN.left + band * i + (band - barWidth) / 2;
        return {
          x,
          y: MARGIN.top + y,
          width: barWidth,
          height: Math.max(h, 0.5),
          cx: MARGIN.left + band * (i + 0.5),
          cy: MARGIN.top + valueY,
          datum: d,
          tone: d.tone ?? "category1"
        };
      });
    }
    // horizontal
    const band = plotHeight / data.length;
    const barHeight = band * 0.62;
    const zeroX = scaleLinear(0, domainMin, domainMax, 0, plotWidth);
    return data.map((d, i) => {
      const valueX = scaleLinear(d.value, domainMin, domainMax, 0, plotWidth);
      const x = Math.min(valueX, zeroX);
      const w = Math.abs(valueX - zeroX);
      const y = MARGIN.top + band * i + (band - barHeight) / 2;
      return {
        x: MARGIN.left + x,
        y,
        width: Math.max(w, 0.5),
        height: barHeight,
        cx: MARGIN.left + valueX,
        cy: MARGIN.top + band * (i + 0.5),
        datum: d,
        tone: d.tone ?? "category1"
      };
    });
  });

  const dataValueItems = $derived(data.map((d) => `${d.label}: ${d.value}`));

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

  const classes = () => ["st-barChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-barChart__visual"
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
        <line
          class="st-barChart__grid"
          x1={tick.x1}
          x2={tick.x2}
          y1={tick.y}
          y2={tick.y}
        />
        <text
          class="st-barChart__tickLabel"
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
        <line
          class="st-barChart__grid"
          x1={tick.x}
          x2={tick.x}
          y1={tick.y1}
          y2={tick.y2}
        />
        <text
          class="st-barChart__tickLabel"
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
      class="st-barChart__axis"
      x1={MARGIN.left}
      x2={MARGIN.left}
      y1={MARGIN.top}
      y2={height - MARGIN.bottom}
    />
    <line
      class="st-barChart__axis"
      x1={MARGIN.left}
      x2={width - MARGIN.right}
      y1={height - MARGIN.bottom}
      y2={height - MARGIN.bottom}
    />

    <!-- category labels -->
    {#each bars as bar, i (bar.datum.label)}
      {#if orientation === "vertical"}
        <text
          class="st-barChart__categoryLabel"
          x={bar.x + bar.width / 2}
          y={height - MARGIN.bottom + 16}
          text-anchor="middle"
        >
          {bar.datum.label}
        </text>
      {:else}
        <text
          class="st-barChart__categoryLabel"
          x={MARGIN.left - 6}
          y={bar.y + bar.height / 2}
          text-anchor="end"
          dominant-baseline="middle"
        >
          {bar.datum.label}
        </text>
      {/if}
    {/each}

    <!-- bars -->
    <!-- The bars live inside an aria-hidden SVG, so they are NEVER an accessible
         surface. When `onSelect` is provided they only carry a mouse click
         shortcut (cursor:pointer) for sighted pointer users — keyboard + screen
         readers use the filter-chip buttons rendered below, outside this SVG. -->
    {#each bars as bar, i (bar.datum.label)}
      {@const isSelected = selectedSet.has(bar.datum.label)}
      <!-- The mouse click is a deliberate sighted-pointer-only shortcut on a
           decorative element inside an aria-hidden SVG; the real keyboard + AT
           path is the filter-chip <button>s below. No ARIA role/keyboard here
           on purpose (it would be a lie under aria-hidden). -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <rect
        class="st-barChart__bar st-barChart__bar--{bar.tone}"
        class:st-barChart__bar--selected={isSelected}
        class:st-barChart__bar--dim={hasSelection && !isSelected}
        class:st-barChart__bar--interactive={interactive}
        x={bar.x}
        y={bar.y}
        width={bar.width}
        height={bar.height}
        rx="2"
        data-chart-index={i}
        onclick={interactive ? () => onSelect?.(bar.datum.label) : undefined}
      />
    {/each}
    </svg>
  </div>

  {#if interactive}
    <!-- Accessible selection surface — real <button>s OUTSIDE the aria-hidden
         SVG. This is the keyboard + screen-reader path for filtering. -->
    <div class="st-barChart__filters" role="group" aria-label={`Filtrer par ${label}`}>
      {#each bars as bar (bar.datum.label)}
        {@const isSelected = selectedSet.has(bar.datum.label)}
        <button
          type="button"
          class="st-barChart__filterChip st-barChart__filterChip--{bar.tone}"
          class:st-barChart__filterChip--selected={isSelected}
          aria-pressed={isSelected}
          onclick={() => onSelect?.(bar.datum.label)}
        >
          <span class="st-barChart__filterSwatch" aria-hidden="true"></span>
          {bar.datum.label}: {bar.datum.value}
        </button>
      {/each}
    </div>
  {/if}

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && bars[hoveredIndex]}
    {@const bar = bars[hoveredIndex]}
    <div
      class="st-barChart__tooltip"
      role="presentation"
      style="left: {(bar.cx / width) * 100}%; top: {(bar.cy / height) * 100}%"
    >
      <span class="st-barChart__tooltipLabel">{bar.datum.label}</span>
      <span class="st-barChart__tooltipValue">{bar.datum.value}</span>
    </div>
  {/if}
</div>

<style>
  .st-barChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-barChart svg {
    display: block;
    overflow: visible;
  }

  .st-barChart__visual {
    display: block;
  }

  .st-barChart__grid {
    stroke: var(--st-component-barChart-gridStroke, var(--st-semantic-border-subtle));
    stroke-dasharray: 2 3;
    stroke-width: 1;
    opacity: 0.7;
  }

  .st-barChart__axis {
    stroke: var(--st-component-barChart-axisStroke, var(--st-semantic-border-subtle));
    stroke-width: 1;
  }

  .st-barChart__tickLabel,
  .st-barChart__categoryLabel {
    fill: var(--st-component-barChart-labelColor, var(--st-semantic-text-secondary));
    font-size: 0.6875rem;
  }

  .st-barChart__bar {
    cursor: pointer;
    transition: opacity var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-barChart__bar:hover {
    opacity: 0.82;
  }

  /* Non-selected bars are dimmed while a selection is active. Floor kept high
     (0.6) so the colour stays distinguishable — opacity is never the sole cue;
     selection also adds a stroke (shape), and the values stay in the chips +
     ChartDataList. */
  .st-barChart__bar--dim {
    opacity: 0.6;
  }
  /* Hover still lifts a dimmed bar so it stays explorable. */
  .st-barChart__bar--dim:hover {
    opacity: 0.8;
  }

  /* Selected bar: full opacity + a contrast-safe accent stroke (two signals,
     never a font/size reflow). Outranks the dim rule. */
  .st-barChart__bar--selected,
  .st-barChart__bar--selected:hover {
    opacity: 1;
    stroke: var(--st-semantic-border-interactive, var(--st-semantic-action-primary));
    stroke-width: 2;
    paint-order: stroke;
  }

  .st-barChart__bar--category1 { fill: var(--st-semantic-data-category1); }
  .st-barChart__bar--category2 { fill: var(--st-semantic-data-category2); }
  .st-barChart__bar--category3 { fill: var(--st-semantic-data-category3); }
  .st-barChart__bar--category4 { fill: var(--st-semantic-data-category4); }
  .st-barChart__bar--category5 { fill: var(--st-semantic-data-category5); }
  .st-barChart__bar--category6 { fill: var(--st-semantic-data-category6); }
  .st-barChart__bar--category7 { fill: var(--st-semantic-data-category7); }
  .st-barChart__bar--category8 { fill: var(--st-semantic-data-category8); }

  /* Accessible filter chips — keyboard + screen-reader selection surface,
     rendered outside the aria-hidden SVG. */
  .st-barChart__filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem);
    margin-top: var(--st-spacing-2, 0.5rem);
  }

  .st-barChart__filterChip {
    align-items: center;
    background: var(--st-semantic-surface-subtle, #f8fafc);
    border: 1px solid var(--st-semantic-border-interactive, #cbd5e1);
    border-radius: var(--st-radius-pill, 999px);
    color: var(--st-semantic-text-secondary, #475569);
    cursor: var(--st-cursor-interactive, pointer);
    display: inline-flex;
    font: inherit;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: var(--st-spacing-1, 0.25rem);
    line-height: 1;
    padding: 0.3125rem var(--st-spacing-2, 0.5rem);
    transition:
      background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-barChart__filterChip:hover {
    background: var(--st-semantic-surface-hover, #eef2f7);
  }

  .st-barChart__filterChip:focus-visible {
    outline: 2px solid var(--st-semantic-border-interactive, var(--st-semantic-action-primary));
    outline-offset: 2px;
  }

  /* Selected chip: solid accent fill + matching text — signalled by colour AND
     by aria-pressed, never by opacity alone. */
  .st-barChart__filterChip--selected {
    background: var(--st-semantic-action-primary, #2563eb);
    border-color: var(--st-semantic-action-primary, #2563eb);
    color: var(--st-semantic-text-inverse, #fff);
  }

  /* Colour swatch echoing the bar tone, for quick visual mapping chip↔bar. */
  .st-barChart__filterSwatch {
    border-radius: var(--st-radius-sm, 0.25rem);
    display: inline-block;
    height: 0.625rem;
    width: 0.625rem;
  }
  .st-barChart__filterChip--category1 .st-barChart__filterSwatch { background: var(--st-semantic-data-category1); }
  .st-barChart__filterChip--category2 .st-barChart__filterSwatch { background: var(--st-semantic-data-category2); }
  .st-barChart__filterChip--category3 .st-barChart__filterSwatch { background: var(--st-semantic-data-category3); }
  .st-barChart__filterChip--category4 .st-barChart__filterSwatch { background: var(--st-semantic-data-category4); }
  .st-barChart__filterChip--category5 .st-barChart__filterSwatch { background: var(--st-semantic-data-category5); }
  .st-barChart__filterChip--category6 .st-barChart__filterSwatch { background: var(--st-semantic-data-category6); }
  .st-barChart__filterChip--category7 .st-barChart__filterSwatch { background: var(--st-semantic-data-category7); }
  .st-barChart__filterChip--category8 .st-barChart__filterSwatch { background: var(--st-semantic-data-category8); }

  .st-barChart__tooltip {
    background: var(--st-component-barChart-tooltipBackground, var(--st-semantic-surface-inverse));
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-component-barChart-tooltipText, var(--st-semantic-text-inverse));
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

  .st-barChart__tooltipLabel {
    font-weight: 600;
  }

  .st-barChart__tooltipValue {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-barChart__bar,
    .st-barChart__filterChip { transition: none; }
  }
</style>

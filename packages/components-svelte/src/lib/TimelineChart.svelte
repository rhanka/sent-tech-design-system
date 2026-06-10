<script lang="ts" module>
  export type TimelineChartTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type TimelineChartEvent = {
    /** Point on the axis (year, day index, ordinal step…). */
    position: number;
    /** Required short label, shown above/below the marker (alternated). */
    label: string;
    /** Optional longer description, surfaced in the accessible list + tooltip. */
    description?: string;
    /** Optional explicit categorical tone; otherwise cycles category1..8. */
    tone?: TimelineChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type TimelineChartProps = {
    data: TimelineChartEvent[];
    label: string;
    width?: number;
    height?: number;
    class?: string;
  };

  let { data, label, width = 640, height = 240, class: className }: TimelineChartProps = $props();

  const MARGIN = { top: 12, right: 24, bottom: 32, left: 24 };
  const CATEGORY_COUNT = 8;
  // Max characters before the label is ellipsised (keeps connectors readable).
  const LABEL_MAX = 18;

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

  function toneClass(tone: TimelineChartTone | undefined, index: number): TimelineChartTone {
    if (tone) return tone;
    return `category${(index % CATEGORY_COUNT) + 1}` as TimelineChartTone;
  }

  function truncate(text: string): string {
    return text.length > LABEL_MAX ? `${text.slice(0, LABEL_MAX - 1)}…` : text;
  }

  let hoveredIndex: number | null = $state(null);

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const axisY = $derived(MARGIN.top + Math.max(height - MARGIN.top - MARGIN.bottom, 1) / 2);

  // Sorted, finite-position events. `label` is required so missing labels drop.
  const events = $derived(
    data
      .filter((e) => Number.isFinite(e.position) && typeof e.label === "string")
      .slice()
      .sort((a, b) => a.position - b.position)
  );

  const positionDomain = $derived.by(() => {
    if (events.length === 0) return { min: 0, max: 1 };
    const xs = events.map((e) => e.position);
    const min = Math.min(...xs);
    const max = Math.max(...xs);
    return min === max ? { min: min - 1, max: max + 1 } : { min, max };
  });

  const ticks = $derived(niceTicks(positionDomain.min, positionDomain.max, 5));

  // Domain extended to the tick range so markers + axis share a frame.
  const frame = $derived({
    min: Math.min(positionDomain.min, ticks[0]),
    max: Math.max(positionDomain.max, ticks[ticks.length - 1])
  });

  const markers = $derived(
    events.map((e, i) => {
      const x = MARGIN.left + scaleLinear(e.position, frame.min, frame.max, 0, plotWidth);
      const above = i % 2 === 0;
      return {
        index: i,
        x,
        above,
        tone: toneClass(e.tone, i),
        label: truncate(e.label),
        fullLabel: e.label,
        description: e.description,
        position: e.position
      };
    })
  );

  const tickEntries = $derived(
    ticks.map((tick) => ({
      value: tick,
      x: MARGIN.left + scaleLinear(tick, frame.min, frame.max, 0, plotWidth)
    }))
  );

  const dataValueItems = $derived(
    events.map((e) =>
      e.description ? `${e.position}: ${e.label} — ${e.description}` : `${e.position}: ${e.label}`
    )
  );

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

  const classes = () => ["st-timelineChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-timelineChart__visual"
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
      <!-- central timeline -->
      <line
        class="st-timelineChart__axis"
        x1={MARGIN.left}
        x2={width - MARGIN.right}
        y1={axisY}
        y2={axisY}
      />

      <!-- graduated ticks -->
      {#each tickEntries as tick (tick.value)}
        <line
          class="st-timelineChart__tick"
          x1={tick.x}
          x2={tick.x}
          y1={axisY}
          y2={axisY + 5}
        />
        <text
          class="st-timelineChart__tickLabel"
          x={tick.x}
          y={height - MARGIN.bottom + 18}
          text-anchor="middle"
        >
          {formatTick(tick.value)}
        </text>
      {/each}

      <!-- events: connector + marker + alternated label -->
      {#each markers as m (m.index)}
        {@const labelY = m.above ? axisY - 26 : axisY + 26}
        {@const connectorY = m.above ? axisY - 12 : axisY + 12}
        <line
          class={`st-timelineChart__connector st-timelineChart__connector--${m.tone}`}
          x1={m.x}
          x2={m.x}
          y1={axisY}
          y2={connectorY}
        />
        <text
          class="st-timelineChart__eventLabel"
          x={m.x}
          y={labelY}
          text-anchor="middle"
          dominant-baseline={m.above ? "auto" : "hanging"}
        >
          {m.label}
        </text>
        <circle
          class={`st-timelineChart__marker st-timelineChart__marker--${m.tone}`}
          cx={m.x}
          cy={axisY}
          r="6"
          data-chart-index={m.index}
        />
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && markers[hoveredIndex]}
    {@const m = markers[hoveredIndex]}
    <div
      class="st-timelineChart__tooltip"
      role="presentation"
      style="left: {(m.x / width) * 100}%; top: {(axisY / height) * 100}%"
    >
      <span class="st-timelineChart__tooltipLabel">{m.fullLabel}</span>
      <span class="st-timelineChart__tooltipValue">{m.position}</span>
      {#if m.description}
        <span class="st-timelineChart__tooltipDesc">{m.description}</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .st-timelineChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-timelineChart svg {
    display: block;
    overflow: visible;
  }

  .st-timelineChart__visual {
    display: block;
  }

  .st-timelineChart__axis {
    stroke: var(--st-semantic-border-strong);
    stroke-width: 2;
  }

  .st-timelineChart__tick {
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1;
  }

  .st-timelineChart__tickLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
  }

  .st-timelineChart__connector {
    stroke: currentColor;
    stroke-width: 1.5;
    opacity: 0.6;
  }

  .st-timelineChart__eventLabel {
    fill: var(--st-semantic-text-primary);
    font-size: 0.75rem;
    font-weight: 600;
  }

  .st-timelineChart__marker {
    fill: currentColor;
    stroke: var(--st-semantic-surface-default);
    stroke-width: 2;
    cursor: pointer;
    transition: r 120ms ease;
  }

  .st-timelineChart__marker:hover {
    r: 7.5;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-timelineChart__marker {
      transition: none;
    }
  }

  .st-timelineChart__connector--category1,
  .st-timelineChart__marker--category1 { color: var(--st-semantic-data-category1); }
  .st-timelineChart__connector--category2,
  .st-timelineChart__marker--category2 { color: var(--st-semantic-data-category2); }
  .st-timelineChart__connector--category3,
  .st-timelineChart__marker--category3 { color: var(--st-semantic-data-category3); }
  .st-timelineChart__connector--category4,
  .st-timelineChart__marker--category4 { color: var(--st-semantic-data-category4); }
  .st-timelineChart__connector--category5,
  .st-timelineChart__marker--category5 { color: var(--st-semantic-data-category5); }
  .st-timelineChart__connector--category6,
  .st-timelineChart__marker--category6 { color: var(--st-semantic-data-category6); }
  .st-timelineChart__connector--category7,
  .st-timelineChart__marker--category7 { color: var(--st-semantic-data-category7); }
  .st-timelineChart__connector--category8,
  .st-timelineChart__marker--category8 { color: var(--st-semantic-data-category8); }

  .st-timelineChart__tooltip {
    background: var(--st-semantic-surface-inverse);
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-semantic-text-inverse);
    display: inline-flex;
    flex-direction: column;
    font-size: 0.75rem;
    gap: 0.125rem;
    line-height: 1.2;
    max-width: 16rem;
    padding: 0.375rem 0.5rem;
    pointer-events: none;
    position: absolute;
    transform: translate(-50%, calc(-100% - 10px));
    white-space: normal;
    z-index: 1;
  }

  .st-timelineChart__tooltipLabel {
    font-weight: 600;
  }

  .st-timelineChart__tooltipValue {
    opacity: 0.85;
  }

  .st-timelineChart__tooltipDesc {
    opacity: 0.85;
  }
</style>

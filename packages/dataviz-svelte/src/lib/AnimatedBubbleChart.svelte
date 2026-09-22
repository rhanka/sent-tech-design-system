<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type AnimatedBubbleChartProps = {
    /** Dashboard store (provides rows + model). */
    store: DashboardStore;
    /** View id for the cross-filter graph. */
    viewId: string;
    /** Measure id mapped to x-axis. */
    x: string;
    /** Measure id mapped to y-axis. */
    y: string;
    /** Measure id whose value scales the bubble radius. */
    size: string;
    /** Dimension (or measure) whose distinct values define the time steps. */
    time: string;
    /** Optional dimension whose values drive categorical tones + labels. */
    series?: string;
    /** Accessible label for the chart. */
    label: string;
    width?: number;
    height?: number;
    class?: string;
  };
</script>

<script lang="ts">
  import { ScatterPlot as DsScatterPlot } from '@sentropic/design-system-svelte';
  import type { ScatterPlotDatum } from '@sentropic/design-system-svelte';
  import { distinctSorted, buildBubbleFrame } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    x,
    y,
    size,
    time,
    series,
    label,
    width,
    height,
    class: className,
  }: AnimatedBubbleChartProps = $props();

  // ── Dashboard reactivity ────────────────────────────────────────────────────
  const dash = $derived(useDashboard(store));

  // Derive sorted time steps from the full (cross-filtered) row set.
  const steps = $derived.by(() => {
    void $dash;
    const rows = store.applyCrossfilter(viewId);
    return distinctSorted(rows, time);
  });

  // ── Animation state ─────────────────────────────────────────────────────────
  let stepIndex = $state(0);
  let playing = $state(false);

  // Clamp index whenever `steps` changes (e.g. crossfilter removes a step).
  $effect(() => {
    if (stepIndex >= steps.length) stepIndex = Math.max(0, steps.length - 1);
  });

  // Timer: advance one step per second while playing.
  $effect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      stepIndex = (stepIndex + 1) % Math.max(1, steps.length);
    }, 1000);
    return () => clearInterval(id);
  });

  function togglePlay() {
    playing = !playing;
  }

  function handleSlider(e: Event) {
    stepIndex = Number((e.target as HTMLInputElement).value);
    playing = false;
  }

  // ── Current frame ───────────────────────────────────────────────────────────
  const currentStep = $derived(steps[stepIndex] ?? '');

  const frame = $derived.by(() => {
    void $dash;
    const rows = store
      .applyCrossfilter(viewId)
      .filter((row) => String(row[time]) === currentStep);
    return buildBubbleFrame(store.model, rows, { x, y, size, series });
  });
</script>

<div
  class={['dataviz-animated-bubble', className].filter(Boolean).join(' ') || undefined}
  style="display:flex; flex-direction:column; gap:var(--st-spacing-3, 12px);"
>
  <!-- Chart area -->
  <DsScatterPlot
    data={frame.data as ScatterPlotDatum[]}
    xLabel={frame.xLabel}
    yLabel={frame.yLabel}
    {width}
    {height}
    {label}
  />

  <!-- Time-step controls -->
  <div
    role="group"
    aria-label="Contrôle temporel"
    style="display:flex; align-items:center; gap:var(--st-spacing-2, 8px); padding:0 var(--st-spacing-2, 8px);"
  >
    <button
      type="button"
      aria-label={playing ? 'Pause' : 'Lecture'}
      onclick={togglePlay}
      style="
        min-width: 2rem;
        aspect-ratio: 1;
        border: 1px solid var(--st-color-border, #ccc);
        border-radius: var(--st-radius-sm, 4px);
        background: var(--st-color-surface, #fff);
        color: var(--st-color-text, inherit);
        cursor: pointer;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      {playing ? '⏸' : '▶'}
    </button>

    <input
      type="range"
      min={0}
      max={Math.max(0, steps.length - 1)}
      value={stepIndex}
      aria-label="Pas de temps"
      aria-valuetext={currentStep}
      oninput={handleSlider}
      style="flex:1; accent-color:var(--st-color-accent, currentColor);"
    />

    <span
      aria-live="polite"
      aria-atomic="true"
      style="
        min-width: 4ch;
        text-align: right;
        font-variant-numeric: tabular-nums;
        color: var(--st-color-text-muted, inherit);
        font-size: var(--st-font-size-sm, 0.875rem);
      "
    >
      {currentStep}
    </span>
  </div>
</div>

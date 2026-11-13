<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import {
  ScatterPlot as DsScatterPlot,
  type ScatterPlotDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { distinctSorted, buildBubbleFrame } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

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

defineOptions({ name: 'AnimatedBubbleChart' });
const props = withDefaults(defineProps<AnimatedBubbleChartProps>(), {
  series: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);

const stepIndex = ref(0);
const playing = ref(false);

let timerId: ReturnType<typeof setInterval> | undefined;

function startTimer() {
  if (timerId !== undefined) return;
  timerId = setInterval(() => {
    const len = steps.value.length;
    if (len > 0) stepIndex.value = (stepIndex.value + 1) % len;
  }, 1000);
}

function stopTimer() {
  if (timerId !== undefined) {
    clearInterval(timerId);
    timerId = undefined;
  }
}

function togglePlay() {
  playing.value = !playing.value;
  if (playing.value) {
    startTimer();
  } else {
    stopTimer();
  }
}

function handleSlider(e: Event) {
  stepIndex.value = Number((e.target as HTMLInputElement).value);
  playing.value = false;
  stopTimer();
}

onUnmounted(stopTimer);

// Derived steps from the full cross-filtered row set.
const steps = computed(() => {
  void state.value;
  const rows = props.store.applyCrossfilter(props.viewId);
  return distinctSorted(rows, props.time);
});

// Current bubble frame.
const frame = computed(() => {
  void state.value;
  const allRows = props.store.applyCrossfilter(props.viewId);
  const safeIdx = steps.value.length > 0
    ? Math.min(stepIndex.value, steps.value.length - 1)
    : 0;
  const currentStep = steps.value[safeIdx] ?? '';
  const frameRows = allRows.filter((row) => String(row[props.time]) === currentStep);
  return {
    ...buildBubbleFrame(props.store.model, frameRows, {
      x: props.x,
      y: props.y,
      size: props.size,
      series: props.series,
    }),
    currentStep,
    safeIdx,
  };
});
const maxIdx = computed(() => Math.max(0, steps.value.length - 1));
</script>

<template>
  <div :class="['dataviz-animated-bubble', props.class].filter(Boolean).join(' ') || undefined"
    :style="{ display: 'flex', flexDirection: 'column', gap: 'var(--st-spacing-3, 12px)' }">
    <DsScatterPlot :data="frame.data as ScatterPlotDatum[]" :x-label="frame.xLabel" :y-label="frame.yLabel"
      :width="props.width" :height="props.height" :label="props.label" />
    <div role="group" aria-label="Contrôle temporel"
      :style="{ display: 'flex', alignItems: 'center', gap: 'var(--st-spacing-2, 8px)', padding: '0 var(--st-spacing-2, 8px)' }">
      <button type="button" :aria-label="playing ? 'Pause' : 'Lecture'" :style="{
        minWidth: '2rem', aspectRatio: '1', border: '1px solid var(--st-color-border, #ccc)',
        borderRadius: 'var(--st-radius-sm, 4px)', background: 'var(--st-color-surface, #fff)',
        color: 'var(--st-color-text, inherit)', cursor: 'pointer', fontSize: '1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }" @click="togglePlay">{{ playing ? '⏸' : '▶' }}</button>
      <input type="range" :min="0" :max="maxIdx" :value="frame.safeIdx" aria-label="Pas de temps"
        :aria-valuetext="frame.currentStep" :style="{ flex: 1, accentColor: 'var(--st-color-accent, currentColor)' }"
        @input="handleSlider" />
      <span aria-live="polite" aria-atomic="true" :style="{
        minWidth: '4ch', textAlign: 'right', fontVariantNumeric: 'tabular-nums',
        color: 'var(--st-color-text-muted, inherit)', fontSize: 'var(--st-font-size-sm, 0.875rem)',
      }">{{ frame.currentStep }}</span>
    </div>
  </div>
</template>

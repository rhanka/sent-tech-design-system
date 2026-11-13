<script setup lang="ts">
import { computed } from 'vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { LineChart } from '@sentropic/design-system-vue';
import { useDashboard } from '../adapter.js';
import { buildForecastLineData } from './analyticsDsData.js';

export type ForecastLineChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  periods: number;
  step?: number;
  width?: number;
  height?: number;
  label: string;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  class?: string;
};

defineOptions({ name: 'ForecastLineChart' });
const props = withDefaults(defineProps<ForecastLineChartProps>(), {
  step: undefined, width: 360, height: 220, hoverKey: undefined, onHoverKeyChange: undefined, onSelectKey: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  return buildForecastLineData(props.store.model, props.store.applyCrossfilter(props.viewId), {
    x: props.x,
    y: props.y,
    periods: props.periods,
    step: props.step,
  });
});
</script>

<template>
  <LineChart :data="data" :width="props.width" :height="props.height" :label="props.label" :hover-key="props.hoverKey" :on-hover-key-change="props.onHoverKeyChange" :on-select-key="props.onSelectKey" :class="['st-forecastLineChart', props.class].filter(Boolean).join(' ')" />
</template>

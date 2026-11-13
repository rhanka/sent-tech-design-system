<script setup lang="ts">
import { computed } from 'vue';
import {
  BellCurveChart as DsBellCurveChart,
  type BellCurveChartTone,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildBellCurveData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type BellCurveChartProps = {
  store: DashboardStore;
  viewId: string;
  measure: string;
  tone?: string;
  smooth?: boolean;
  intervals?: number;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'BellCurveChart' });
const props = withDefaults(defineProps<BellCurveChartProps>(), {
  tone: undefined, smooth: undefined, intervals: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  return buildBellCurveData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    { measure: props.measure },
  );
});
</script>

<template>
  <DsBellCurveChart :data="data" :label="props.label" :width="props.width" :height="props.height"
    :tone="(props.tone as BellCurveChartTone | undefined)" :smooth="props.smooth" :intervals="props.intervals"
    :class="props.class" />
</template>

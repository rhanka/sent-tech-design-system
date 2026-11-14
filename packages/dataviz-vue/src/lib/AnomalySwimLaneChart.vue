<script setup lang="ts">
import { computed } from 'vue';
import {
  AnomalySwimLaneChart as DsAnomalySwimLaneChart,
  type AnomalySwimLaneSeries,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildAnomalySwimLaneData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type AnomalySwimLaneChartProps = {
  store: DashboardStore;
  viewId: string;
  job: string;
  at: string;
  score: string;
  max?: number;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

defineOptions({ name: 'AnomalySwimLaneChart' });
const props = withDefaults(defineProps<AnomalySwimLaneChartProps>(), {
  max: undefined, label: undefined, width: undefined, height: undefined, size: undefined, class: undefined,
});
const storeState = useDashboard(props.store);
const data = computed(() => {
  void storeState.value;
  return buildAnomalySwimLaneData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    {
      job: props.job,
      at: props.at,
      score: props.score,
    },
  ) as AnomalySwimLaneSeries[];
});
</script>

<template>
  <DsAnomalySwimLaneChart :data="data" :max="props.max" :label="props.label" :width="props.width"
    :height="props.height" :size="props.size" :class="props.class" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FunnelChart as DsFunnelChart, type FunnelChartDatum } from '@sentropic/design-system-vue';
import type { DashboardStore, PartWholeSort } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafePartWholeModel, toPartWholeData } from './partOfWholeData.js';

export type FunnelChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  sort?: PartWholeSort;
  orientation?: 'vertical' | 'horizontal';
  showPercentages?: boolean;
  percentMode?: 'ofFirst' | 'ofPrevious';
  legend?: boolean;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'FunnelChart' });
const props = withDefaults(defineProps<FunnelChartProps>(), {
  sort: 'value-desc', orientation: 'vertical', showPercentages: true, percentMode: 'ofFirst', legend: true, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<FunnelChartDatum[]>(() => {
  void state.value;
  const model = buildSafePartWholeModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
    category: props.category,
    measure: props.measure,
    sort: props.sort,
  });
  return toPartWholeData(model.items);
});
</script>

<template>
  <DsFunnelChart :data="data" :label="props.label" :orientation="props.orientation" :show-percentages="props.showPercentages" :percent-mode="props.percentMode" :legend="props.legend" :width="props.width" :height="props.height" :class="props.class" />
</template>

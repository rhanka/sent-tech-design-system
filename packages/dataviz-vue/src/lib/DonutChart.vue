<script setup lang="ts">
import { computed } from 'vue';
import { DonutChart as DsDonutChart, type DonutChartDatum, type DataLabelsProp as ChartDataLabels } from '@sentropic/design-system-vue';
import type { DashboardStore, PartWholeSort } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafePartWholeModel, toPartWholeData } from './partOfWholeData.js';

export type DonutChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  sort?: PartWholeSort;
  size?: number;
  thickness?: number;
  centerLabel?: string | null;
  label: string;
  dataLabels?: ChartDataLabels;
  class?: string;
};

defineOptions({ name: 'DonutChart' });
const props = withDefaults(defineProps<DonutChartProps>(), {
  sort: 'input', size: undefined, thickness: undefined, centerLabel: undefined, dataLabels: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<DonutChartDatum[]>(() => {
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
  <DsDonutChart :data="data" :label="props.label" :size="props.size" :thickness="props.thickness" :center-label="props.centerLabel" :data-labels="props.dataLabels" :class="props.class" />
</template>

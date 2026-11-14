<script setup lang="ts">
import { computed } from 'vue';
import {
  ItemChart as DsItemChart,
  type ItemChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildItemChartData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ItemChartProps = {
  store: DashboardStore;
  viewId: string;
  label_field: string;
  value: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'ItemChart' });
const props = withDefaults(defineProps<ItemChartProps>(), {
  width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<ItemChartDatum[]>(() => {
  void state.value;
  return buildItemChartData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    { label: props.label_field, value: props.value },
  ) as ItemChartDatum[];
});
</script>

<template>
  <DsItemChart :data="data" :label="props.label" :width="props.width" :height="props.height"
    :class="props.class" />
</template>

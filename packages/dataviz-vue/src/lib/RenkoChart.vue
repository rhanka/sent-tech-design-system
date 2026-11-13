<script setup lang="ts">
import { computed } from 'vue';
import {
  RenkoChart as DsRenkoChart,
  type RenkoChartDatum as DsRenkoChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildRenkoData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type RenkoChartProps = {
  store: DashboardStore;
  viewId: string;
  date: string;
  close: string;
  boxSize?: number;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

defineOptions({ name: 'RenkoChart' });
const props = withDefaults(defineProps<RenkoChartProps>(), {
  boxSize: undefined, width: undefined, height: undefined, size: undefined, label: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<DsRenkoChartDatum[]>(() => {
  void state.value;
  return buildRenkoData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    {
      date: props.date,
      close: props.close,
    },
  ) as DsRenkoChartDatum[];
});
</script>

<template>
  <DsRenkoChart :data="data" :box-size="props.boxSize" :label="props.label" :width="props.width"
    :height="props.height" :size="props.size" :class="props.class" />
</template>

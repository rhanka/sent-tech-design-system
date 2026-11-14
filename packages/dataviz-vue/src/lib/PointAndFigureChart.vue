<script setup lang="ts">
import { computed } from 'vue';
import {
  PointAndFigureChart as DsPointAndFigureChart,
  type PointAndFigureChartDatum as DsPointAndFigureChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildPointAndFigureData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type PointAndFigureChartProps = {
  store: DashboardStore;
  viewId: string;
  date: string;
  close: string;
  boxSize?: number;
  reversal?: number;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

defineOptions({ name: 'PointAndFigureChart' });
const props = withDefaults(defineProps<PointAndFigureChartProps>(), {
  boxSize: undefined, reversal: undefined, width: undefined, height: undefined, size: undefined, label: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<DsPointAndFigureChartDatum[]>(() => {
  void state.value;
  return buildPointAndFigureData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    {
      date: props.date,
      close: props.close,
    },
  ) as DsPointAndFigureChartDatum[];
});
</script>

<template>
  <DsPointAndFigureChart :data="data" :box-size="props.boxSize" :reversal="props.reversal"
    :label="props.label" :width="props.width" :height="props.height" :size="props.size"
    :class="props.class" />
</template>

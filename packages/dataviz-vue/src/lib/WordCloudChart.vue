<script setup lang="ts">
import { computed } from 'vue';
import { WordCloudChart as DsWordCloudChart, type WordCloudChartWord } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildWordCloudData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
export type WordCloudChartProps = {
  store: DashboardStore;
  viewId: string;
  word_field: string;
  weight: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};
defineOptions({ name: 'WordCloudChart' });
const props = withDefaults(defineProps<WordCloudChartProps>(), {
  width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<WordCloudChartWord[]>(() => {
  void state.value;
  return buildWordCloudData(props.store.model, props.store.applyCrossfilter(props.viewId), { word: props.word_field, weight: props.weight }) as WordCloudChartWord[];
});
</script>

<template>
  <DsWordCloudChart :data="data" :label="props.label" :width="props.width" :height="props.height" :class="props.class" />
</template>

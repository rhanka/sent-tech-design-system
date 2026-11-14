<script setup lang="ts">
import { computed } from 'vue';
import { PackedBubblesChart as DsPackedBubblesChart } from '@sentropic/design-system-vue';
import type { DashboardStore, PartWholeSort } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafePackedBubbleModel, toPackedBubbleData } from './partOfWholeData.js';

export type PackedBubbleChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  sort?: PartWholeSort;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'PackedBubbleChart' });
const props = withDefaults(defineProps<PackedBubbleChartProps>(), {
  sort: 'value-desc', width: 420, height: 320, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  return toPackedBubbleData(
    buildSafePackedBubbleModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
      category: props.category,
      measure: props.measure,
      sort: props.sort,
    }),
  );
});
</script>

<template>
  <DsPackedBubblesChart :data="data" :label="props.label" :width="props.width" :height="props.height"
    :class="props.class" />
</template>

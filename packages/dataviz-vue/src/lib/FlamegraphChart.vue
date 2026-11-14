<script setup lang="ts">
import { computed } from 'vue';
import {
  FlamegraphChart as DsFlamegraphChart,
  type FlamegraphNode as DsFlamegraphNode,
} from '@sentropic/design-system-vue';
import { buildFlamegraphData, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type FlamegraphChartProps = {
  store: DashboardStore;
  viewId: string;
  id: string;
  parentId: string;
  name: string;
  value: string;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

defineOptions({ name: 'FlamegraphChart' });
const props = withDefaults(defineProps<FlamegraphChartProps>(), {
  width: undefined, height: undefined, size: undefined, label: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<DsFlamegraphNode>(() => {
  void state.value;
  return buildFlamegraphData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    {
      id: props.id,
      parentId: props.parentId,
      name: props.name,
      value: props.value,
    },
  ) as DsFlamegraphNode;
});
</script>

<template>
  <DsFlamegraphChart :data="data" :label="props.label" :width="props.width" :height="props.height" :size="props.size" :class="props.class" />
</template>

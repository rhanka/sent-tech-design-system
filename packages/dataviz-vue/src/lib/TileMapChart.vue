<script setup lang="ts">
import { computed } from 'vue';
import { TileMapChart as DsTileMapChart, type TileMapChartTile } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildTileMapData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
export type TileMapChartProps = {
  store: DashboardStore;
  viewId: string;
  label_field: string;
  col: string;
  row: string;
  value: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};
defineOptions({ name: 'TileMapChart' });
const props = withDefaults(defineProps<TileMapChartProps>(), {
  width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<TileMapChartTile[]>(() => {
  void state.value;
  return buildTileMapData(props.store.model, props.store.applyCrossfilter(props.viewId), {
    label: props.label_field,
    col: props.col,
    row: props.row,
    value: props.value,
  }) as TileMapChartTile[];
});
</script>

<template>
  <DsTileMapChart :data="data" :label="props.label" :width="props.width" :height="props.height" :class="props.class" />
</template>

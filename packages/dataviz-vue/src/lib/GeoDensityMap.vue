<script setup lang="ts">
import { computed } from 'vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { GeoChart } from '@sentropic/design-system-vue';
import { useDashboard } from '../adapter.js';
import { densityLayer, mapClass } from './geoMapLayers.js';

export type GeoDensityMapProps = {
  store: DashboardStore;
  viewId: string;
  latitude: string;
  longitude: string;
  value?: string;
  cellSize?: number;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'GeoDensityMap' });
const props = withDefaults(defineProps<GeoDensityMapProps>(), {
  value: undefined, cellSize: undefined, width: 520, height: 320, class: undefined,
});
const state = useDashboard(props.store);
const layer = computed(() => {
  void state.value;
  void props.cellSize;
  return densityLayer(props.store, props.viewId, {
    latitude: props.latitude,
    longitude: props.longitude,
    value: props.value,
    labelText: props.label,
  });
});
const layers = computed(() => [layer.value]);
const cls = computed(() => mapClass('st-geoDensityMap', props.class));
</script>

<template>
  <GeoChart :layers="layers" :width="props.width" :height="props.height" :label="props.label" :class="cls" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { GeoChart } from '@sentropic/design-system-vue';
import { useDashboard } from '../adapter.js';
import { hexbinLayer, mapClass } from './geoMapLayers.js';

export type GeoHexbinMapProps = {
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

defineOptions({ name: 'GeoHexbinMap' });
const props = withDefaults(defineProps<GeoHexbinMapProps>(), {
  value: undefined, cellSize: undefined, width: 520, height: 320, class: undefined,
});
const state = useDashboard(props.store);
const layer = computed(() => {
  void state.value;
  return hexbinLayer(props.store, props.viewId, {
    latitude: props.latitude,
    longitude: props.longitude,
    value: props.value,
    cellSize: props.cellSize,
    labelText: props.label,
  });
});
const layers = computed(() => [layer.value]);
const cls = computed(() => mapClass('st-geoHexbinMap', props.class));
</script>

<template>
  <GeoChart :layers="layers" :width="props.width" :height="props.height" :label="props.label" :class="cls" />
</template>

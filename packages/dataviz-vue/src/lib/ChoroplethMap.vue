<script setup lang="ts">
import { computed } from 'vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { GeoChart } from '@sentropic/design-system-vue';
import { useDashboard } from '../adapter.js';
import { choroplethLayer, mapClass } from './geoMapLayers.js';

export type ChoroplethMapProps = {
  store: DashboardStore;
  viewId: string;
  region: string;
  measure: string;
  geometry?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'ChoroplethMap' });
const props = withDefaults(defineProps<ChoroplethMapProps>(), {
  geometry: undefined, width: 520, height: 260, class: undefined,
});
const state = useDashboard(props.store);
const layer = computed(() => {
  void state.value;
  return choroplethLayer(props.store, props.viewId, {
    region: props.region,
    measure: props.measure,
    geometry: props.geometry,
    labelText: props.label,
  });
});
</script>

<template>
  <GeoChart :layers="[layer]" :width="props.width" :height="props.height" :label="props.label"
    :class="mapClass('st-choroplethMap', props.class)" />
</template>

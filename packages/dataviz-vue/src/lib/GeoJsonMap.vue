<script setup lang="ts">
import { computed } from 'vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { GeoChart } from '@sentropic/design-system-vue';
import { useDashboard } from '../adapter.js';
import { geojsonLayer, mapClass } from './geoMapLayers.js';

export type GeoJsonMapProps = {
  store: DashboardStore;
  viewId: string;
  geometry: string;
  id?: string;
  labelField?: string;
  value?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'GeoJsonMap' });
const props = withDefaults(defineProps<GeoJsonMapProps>(), {
  id: undefined, labelField: undefined, value: undefined, width: 520, height: 320, class: undefined,
});
const state = useDashboard(props.store);
const layer = computed(() => {
  void state.value;
  return geojsonLayer(props.store, props.viewId, {
    geometry: props.geometry,
    id: props.id,
    label: props.labelField,
    value: props.value,
    labelText: props.label,
  });
});
const layers = computed(() => [layer.value]);
const cls = computed(() => mapClass('st-geoJsonMap', props.class));
</script>

<template>
  <GeoChart :layers="layers" :width="props.width" :height="props.height" :label="props.label" :class="cls" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { GeoChart } from '@sentropic/design-system-vue';
import { useDashboard } from '../adapter.js';
import { clusterLayer, mapClass } from './geoMapLayers.js';

export type GeoClusterMapProps = {
  store: DashboardStore;
  viewId: string;
  latitude: string;
  longitude: string;
  id?: string;
  value?: string;
  radius?: number;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'GeoClusterMap' });
const props = withDefaults(defineProps<GeoClusterMapProps>(), {
  id: undefined, value: undefined, radius: undefined, width: 520, height: 320, class: undefined,
});
const state = useDashboard(props.store);
const layer = computed(() => {
  void state.value;
  return clusterLayer(props.store, props.viewId, {
    latitude: props.latitude,
    longitude: props.longitude,
    id: props.id,
    value: props.value,
    radius: props.radius,
    labelText: props.label,
  });
});
const layers = computed(() => [layer.value]);
const cls = computed(() => mapClass('st-geoClusterMap', props.class));
</script>

<template>
  <GeoChart :layers="layers" :width="props.width" :height="props.height" :label="props.label" :class="cls" />
</template>

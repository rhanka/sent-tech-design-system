<script setup lang="ts">
import { computed } from 'vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { GeoChart } from '@sentropic/design-system-vue';
import { useDashboard } from '../adapter.js';
import { mapClass, pointsLayer } from './geoMapLayers.js';

export type GeoPointMapProps = {
  store: DashboardStore;
  viewId: string;
  latitude: string;
  longitude: string;
  id?: string;
  labelField?: string;
  value?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'GeoPointMap' });
const props = withDefaults(defineProps<GeoPointMapProps>(), {
  id: undefined, labelField: undefined, value: undefined, width: 520, height: 320, class: undefined,
});
const state = useDashboard(props.store);
const layer = computed(() => {
  void state.value;
  return pointsLayer(props.store, props.viewId, {
    latitude: props.latitude,
    longitude: props.longitude,
    id: props.id,
    label: props.labelField,
    value: props.value,
    labelText: props.label,
  });
});
const layers = computed(() => [layer.value]);
const cls = computed(() => mapClass('st-geoPointMap', props.class));
</script>

<template>
  <GeoChart :layers="layers" :width="props.width" :height="props.height" :label="props.label" :class="cls" />
</template>

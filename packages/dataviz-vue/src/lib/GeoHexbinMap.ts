import { defineComponent, h, type PropType } from 'vue';
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

export const GeoHexbinMap = defineComponent({
  name: 'GeoHexbinMap',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    value: { type: String, default: undefined },
    cellSize: { type: Number, default: undefined },
    width: { type: Number, default: 520 },
    height: { type: Number, default: 320 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const layer = hexbinLayer(props.store, props.viewId, {
        latitude: props.latitude,
        longitude: props.longitude,
        value: props.value,
        cellSize: props.cellSize,
        labelText: props.label,
      });

      return h(GeoChart, {
        layers: [layer],
        width: props.width,
        height: props.height,
        label: props.label,
        class: mapClass('st-geoHexbinMap', props.class),
      });
    };
  },
});

import { defineComponent, h, type PropType } from 'vue';
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

export const GeoJsonMap = defineComponent({
  name: 'GeoJsonMap',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    geometry: { type: String, required: true },
    id: { type: String, default: undefined },
    labelField: { type: String, default: undefined },
    value: { type: String, default: undefined },
    width: { type: Number, default: 520 },
    height: { type: Number, default: 320 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const layer = geojsonLayer(props.store, props.viewId, {
        geometry: props.geometry,
        id: props.id,
        label: props.labelField,
        value: props.value,
        labelText: props.label,
      });

      return h(GeoChart, {
        layers: [layer],
        width: props.width,
        height: props.height,
        label: props.label,
        class: mapClass('st-geoJsonMap', props.class),
      });
    };
  },
});

import { defineComponent, h, type PropType } from 'vue';
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

export const ChoroplethMap = defineComponent({
  name: 'ChoroplethMap',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    region: { type: String, required: true },
    measure: { type: String, required: true },
    geometry: { type: String, default: undefined },
    width: { type: Number, default: 520 },
    height: { type: Number, default: 260 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const layer = choroplethLayer(props.store, props.viewId, {
        region: props.region,
        measure: props.measure,
        geometry: props.geometry,
        labelText: props.label,
      });

      return h(GeoChart, {
        layers: [layer],
        width: props.width,
        height: props.height,
        label: props.label,
        class: mapClass('st-choroplethMap', props.class),
      });
    };
  },
});

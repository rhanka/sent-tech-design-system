import { defineComponent, h, type PropType } from 'vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { GeoChart } from '@sentropic/design-system-vue';
import { useDashboard } from '../adapter.js';
import { flowLayer, mapClass } from './geoMapLayers.js';

export type GeoFlowMapProps = {
  store: DashboardStore;
  viewId: string;
  sourceLatitude: string;
  sourceLongitude: string;
  targetLatitude: string;
  targetLongitude: string;
  value?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const GeoFlowMap = defineComponent({
  name: 'GeoFlowMap',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    sourceLatitude: { type: String, required: true },
    sourceLongitude: { type: String, required: true },
    targetLatitude: { type: String, required: true },
    targetLongitude: { type: String, required: true },
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
      const layer = flowLayer(props.store, props.viewId, {
        sourceLatitude: props.sourceLatitude,
        sourceLongitude: props.sourceLongitude,
        targetLatitude: props.targetLatitude,
        targetLongitude: props.targetLongitude,
        value: props.value,
        labelText: props.label,
      });

      return h(GeoChart, {
        layers: [layer],
        width: props.width,
        height: props.height,
        label: props.label,
        class: mapClass('st-geoFlowMap', props.class),
      });
    };
  },
});

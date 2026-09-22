import { defineComponent, h, type PropType } from 'vue';
import { HeatmapChart as DsHeatmapChart } from '@sentropic/design-system-vue';
import type { DashboardStore, HeatmapConfig } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildHeatmapData } from './distributionData.js';

export type HeatmapChartProps = {
  store: DashboardStore;
  viewId?: string;
  x: HeatmapConfig['x'];
  y: HeatmapConfig['y'];
  measure: HeatmapConfig['measure'];
  legend?: boolean;
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

export const HeatmapChart = defineComponent({
  name: 'HeatmapChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, default: undefined },
    x: { type: String, required: true },
    y: { type: String, required: true },
    measure: { type: String, required: true },
    legend: { type: Boolean, default: true },
    label: { type: String, required: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      return h(DsHeatmapChart, {
        data: buildHeatmapData(props.store.model, props.store.applyCrossfilter(props.viewId), {
          x: props.x,
          y: props.y,
          measure: props.measure,
        }),
        legend: props.legend,
        label: props.label,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});

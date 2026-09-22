import { defineComponent, h, type PropType } from 'vue';
import {
  ScatterPlot as DsScatterPlot,
  type ScatterPlotDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildScatterModel } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ScatterPlotProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  series?: string;
  labelField?: string;
  width?: number;
  height?: number;
  radius?: number;
  label: string;
  class?: string;
};

export const ScatterPlot = defineComponent({
  name: 'ScatterPlot',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    x: { type: String, required: true },
    y: { type: String, required: true },
    series: { type: String, default: undefined },
    labelField: { type: String, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    radius: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildScatterModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        x: props.x,
        y: props.y,
        series: props.series,
        labelField: props.labelField,
      });
      return h(DsScatterPlot, {
        data: model.data as ScatterPlotDatum[],
        xLabel: model.xLabel,
        yLabel: model.yLabel,
        width: props.width,
        height: props.height,
        radius: props.radius,
        label: props.label,
        class: props.class,
      });
    };
  },
});

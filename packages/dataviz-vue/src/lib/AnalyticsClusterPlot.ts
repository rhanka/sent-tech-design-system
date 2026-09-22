import { defineComponent, h, type PropType } from 'vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { ScatterPlot } from '@sentropic/design-system-vue';
import { useDashboard } from '../adapter.js';
import { buildClusterScatterData } from './analyticsDsData.js';

export type AnalyticsClusterPlotProps = {
  store: DashboardStore;
  viewId: string;
  fields: string[];
  k: number;
  maxIterations?: number;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const AnalyticsClusterPlot = defineComponent({
  name: 'AnalyticsClusterPlot',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    fields: { type: Array as PropType<string[]>, required: true },
    k: { type: Number, required: true },
    maxIterations: { type: Number, default: undefined },
    width: { type: Number, default: 360 },
    height: { type: Number, default: 240 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildClusterScatterData(props.store.model, props.store.applyCrossfilter(props.viewId), {
        fields: props.fields,
        k: props.k,
        maxIterations: props.maxIterations,
      });

      return h(ScatterPlot, {
        data: model.data,
        centroids: model.centroids,
        xLabel: model.xLabel,
        yLabel: model.yLabel,
        width: props.width,
        height: props.height,
        label: props.label,
        class: ['st-analyticsClusterPlot', props.class].filter(Boolean).join(' '),
      });
    };
  },
});

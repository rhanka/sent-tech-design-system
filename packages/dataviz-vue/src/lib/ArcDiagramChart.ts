import { defineComponent, h, type PropType } from 'vue';
import {
  ArcDiagramChart as DsArcDiagramChart,
  type ArcDiagramChartLink,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildArcDiagramData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ArcDiagramChartProps = {
  store: DashboardStore;
  viewId: string;
  source: string;
  target: string;
  weight: string;
  labels?: Record<string, string>;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const ArcDiagramChart = defineComponent({
  name: 'ArcDiagramChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    weight: { type: String, required: true },
    labels: { type: Object as PropType<Record<string, string>>, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildArcDiagramData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        { source: props.source, target: props.target, weight: props.weight },
      );
      return h(DsArcDiagramChart, {
        data: data as ArcDiagramChartLink[],
        labels: props.labels as any,
        label: props.label,
        width: props.width as any,
        height: props.height as any,
        class: props.class as any,
      });
    };
  },
});

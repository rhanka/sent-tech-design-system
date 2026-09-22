import { defineComponent, h, type PropType } from 'vue';
import {
  DependencyWheelChart as DsDependencyWheelChart,
  type DependencyWheelChartLink,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildDependencyWheelData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type DependencyWheelChartProps = {
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

export const DependencyWheelChart = defineComponent({
  name: 'DependencyWheelChart',
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
      const data = buildDependencyWheelData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        { source: props.source, target: props.target, weight: props.weight },
      );
      return h(DsDependencyWheelChart, {
        data: data as DependencyWheelChartLink[],
        labels: props.labels as any,
        label: props.label,
        width: props.width as any,
        height: props.height as any,
        class: props.class as any,
      });
    };
  },
});

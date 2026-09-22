import { defineComponent, h, type PropType } from 'vue';
import {
  AreaSplineRangeChart as DsAreaSplineRangeChart,
  type AreaSplineRangeChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildAreaRangeData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type AreaSplineRangeChartProps = {
  store: DashboardStore;
  viewId: string;
  x_field: string;
  low: string;
  high: string;
  tone?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const AreaSplineRangeChart = defineComponent({
  name: 'AreaSplineRangeChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    x_field: { type: String, required: true },
    low: { type: String, required: true },
    high: { type: String, required: true },
    tone: { type: String, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildAreaRangeData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        { x: props.x_field, low: props.low, high: props.high },
      );
      return h(DsAreaSplineRangeChart, {
        data: data as AreaSplineRangeChartDatum[],
        label: props.label,
        width: props.width as any,
        height: props.height as any,
        tone: props.tone as any,
        class: props.class as any,
      });
    };
  },
});

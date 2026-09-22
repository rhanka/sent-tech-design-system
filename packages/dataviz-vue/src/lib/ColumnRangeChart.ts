import { defineComponent, h, type PropType } from 'vue';
import {
  ColumnRangeChart as DsColumnRangeChart,
  type ColumnRangeChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildColumnRangeData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ColumnRangeChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  low: string;
  high: string;
  orientation?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const ColumnRangeChart = defineComponent({
  name: 'ColumnRangeChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    low: { type: String, required: true },
    high: { type: String, required: true },
    orientation: { type: String, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildColumnRangeData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        { category: props.category, low: props.low, high: props.high },
      );
      return h(DsColumnRangeChart, {
        data: data as ColumnRangeChartDatum[],
        label: props.label,
        orientation: props.orientation as any,
        width: props.width as any,
        height: props.height as any,
        class: props.class as any,
      });
    };
  },
});

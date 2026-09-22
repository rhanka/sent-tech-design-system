import { defineComponent, h, type PropType } from 'vue';
import {
  ColumnPyramidChart as DsColumnPyramidChart,
  type ColumnPyramidChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildColumnPyramidData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ColumnPyramidChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  value: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const ColumnPyramidChart = defineComponent({
  name: 'ColumnPyramidChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    value: { type: String, required: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildColumnPyramidData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        { category: props.category, value: props.value },
      );
      return h(DsColumnPyramidChart, {
        data: data as ColumnPyramidChartDatum[],
        label: props.label,
        width: props.width as any,
        height: props.height as any,
        class: props.class as any,
      });
    };
  },
});

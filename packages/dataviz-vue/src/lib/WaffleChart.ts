import { defineComponent, h, type PropType } from 'vue';
import {
  WaffleChart as DsWaffleChart,
  type WaffleChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildItemChartData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type WaffleChartProps = {
  store: DashboardStore;
  viewId: string;
  label_field: string;
  value: string;
  totalCells?: number;
  columns?: number;
  label?: string;
  size?: number;
  class?: string;
};

export const WaffleChart = defineComponent({
  name: 'WaffleChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    label_field: { type: String, required: true },
    value: { type: String, required: true },
    totalCells: { type: Number, default: undefined },
    columns: { type: Number, default: undefined },
    label: { type: String, default: undefined },
    size: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildItemChartData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        { label: props.label_field, value: props.value },
      );
      return h(DsWaffleChart, {
        data: data as WaffleChartDatum[],
        totalCells: props.totalCells as any,
        columns: props.columns as any,
        label: props.label as any,
        size: props.size as any,
        class: props.class as any,
      });
    };
  },
});

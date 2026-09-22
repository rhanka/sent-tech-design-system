import { defineComponent, h, type PropType } from 'vue';
import {
  VariablePieChart as DsVariablePieChart,
  type VariablePieChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildVariablePieData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type VariablePieChartProps = {
  store: DashboardStore;
  viewId: string;
  label_field: string;
  value: string;
  z: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const VariablePieChart = defineComponent({
  name: 'VariablePieChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    label_field: { type: String, required: true },
    value: { type: String, required: true },
    z: { type: String, required: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildVariablePieData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        { label: props.label_field, value: props.value, z: props.z },
      );
      return h(DsVariablePieChart, {
        data: data as VariablePieChartDatum[],
        label: props.label,
        width: props.width as any,
        height: props.height as any,
        class: props.class as any,
      });
    };
  },
});

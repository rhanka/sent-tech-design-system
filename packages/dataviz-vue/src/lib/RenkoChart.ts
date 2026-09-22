import { defineComponent, h, type PropType } from 'vue';
import {
  RenkoChart as DsRenkoChart,
  type RenkoChartDatum as DsRenkoChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildRenkoData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type RenkoChartProps = {
  store: DashboardStore;
  viewId: string;
  date: string;
  close: string;
  boxSize?: number;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

export const RenkoChart = defineComponent({
  name: 'RenkoChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    date: { type: String, required: true },
    close: { type: String, required: true },
    boxSize: { type: Number, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    size: { type: Number, default: undefined },
    label: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildRenkoData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          date: props.date,
          close: props.close,
        },
      );
      return h(DsRenkoChart, {
        data: data as DsRenkoChartDatum[],
        boxSize: props.boxSize as any,
        label: props.label,
        width: props.width as any,
        height: props.height as any,
        size: props.size as any,
        class: props.class as any,
      });
    };
  },
});

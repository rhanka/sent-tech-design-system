import { defineComponent, h, type PropType } from 'vue';
import {
  RibbonChart as DsRibbonChart,
  type RibbonChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildRibbonData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type RibbonChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  period: string;
  value: string;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

export const RibbonChart = defineComponent({
  name: 'RibbonChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    period: { type: String, required: true },
    value: { type: String, required: true },
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
      const data = buildRibbonData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          category: props.category,
          period: props.period,
          value: props.value,
        },
      );
      return h(DsRibbonChart, {
        data: data as RibbonChartDatum[],
        label: props.label,
        width: props.width as any,
        height: props.height as any,
        size: props.size as any,
        class: props.class as any,
      });
    };
  },
});

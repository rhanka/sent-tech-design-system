import { defineComponent, h, type PropType } from 'vue';
import {
  DumbbellChart as DsDumbbellChart,
  type DumbbellChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildColumnRangeData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type DumbbellChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  low: string;
  high: string;
  lowTone?: string;
  highTone?: string;
  lowLabel?: string;
  highLabel?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const DumbbellChart = defineComponent({
  name: 'DumbbellChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    low: { type: String, required: true },
    high: { type: String, required: true },
    lowTone: { type: String, default: undefined },
    highTone: { type: String, default: undefined },
    lowLabel: { type: String, default: undefined },
    highLabel: { type: String, default: undefined },
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
      return h(DsDumbbellChart, {
        data: data as DumbbellChartDatum[],
        label: props.label,
        lowTone: props.lowTone as any,
        highTone: props.highTone as any,
        lowLabel: props.lowLabel as any,
        highLabel: props.highLabel as any,
        width: props.width as any,
        height: props.height as any,
        class: props.class as any,
      });
    };
  },
});

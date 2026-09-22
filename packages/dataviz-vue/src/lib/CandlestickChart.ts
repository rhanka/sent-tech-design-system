import { defineComponent, h, type PropType } from 'vue';
import {
  CandlestickChart as DsCandlestickChart,
  type CandlestickChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildCandlestickData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type CandlestickChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes each bar's label (typically a date or session dimension). */
  label_field: string;
  /** Field id whose numeric value becomes the open price. */
  open: string;
  /** Field id whose numeric value becomes the high price. */
  high: string;
  /** Field id whose numeric value becomes the low price. */
  low: string;
  /** Field id whose numeric value becomes the close price. */
  close: string;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  class?: string;
};

export const CandlestickChart = defineComponent({
  name: 'CandlestickChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    label_field: { type: String, required: true },
    open: { type: String, required: true },
    high: { type: String, required: true },
    low: { type: String, required: true },
    close: { type: String, required: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildCandlestickData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          label: props.label_field,
          open: props.open,
          high: props.high,
          low: props.low,
          close: props.close,
        },
      );
      return h(DsCandlestickChart, {
        data: data as CandlestickChartDatum[],
        label: props.label,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});

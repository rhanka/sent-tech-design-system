import { defineComponent, h, type PropType } from 'vue';
import {
  OHLCChart as DsOHLCChart,
  type OHLCChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildOhlcData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type OHLCChartProps = {
  store: DashboardStore;
  viewId: string;
  label_field: string;
  open: string;
  high: string;
  low: string;
  close: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const OHLCChart = defineComponent({
  name: 'OHLCChart',
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
      const data = buildOhlcData(
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
      return h(DsOHLCChart, {
        data: data as OHLCChartDatum[],
        label: props.label,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});

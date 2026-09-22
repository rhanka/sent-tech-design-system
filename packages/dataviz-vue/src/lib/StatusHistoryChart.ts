import { defineComponent, h, type PropType } from 'vue';
import {
  StatusHistoryChart as DsStatusHistoryChart,
  type StatusHistorySeries,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildStatusHistoryData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type StatusHistoryChartProps = {
  store: DashboardStore;
  viewId: string;
  series: string;
  at: string;
  value: string;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

export const StatusHistoryChart = defineComponent({
  name: 'StatusHistoryChart',
  props: {
    store:  { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    series: { type: String, required: true },
    at:     { type: String, required: true },
    value:  { type: String, required: true },
    label:  { type: String, default: undefined },
    width:  { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    size:   { type: Number, default: undefined },
    class:  { type: String, default: undefined },
  },
  setup(props) {
    const storeState = useDashboard(props.store);
    return () => {
      void storeState.value;
      const data = buildStatusHistoryData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          series: props.series,
          at:     props.at,
          value:  props.value,
        },
      );
      return h(DsStatusHistoryChart, {
        data:   data as StatusHistorySeries[],
        label:  props.label,
        width:  props.width,
        height: props.height,
        size:   props.size,
        class:  props.class,
      });
    };
  },
});

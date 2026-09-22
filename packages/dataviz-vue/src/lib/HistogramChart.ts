import { defineComponent, h, type PropType } from 'vue';
import { HistogramChart as DsHistogramChart } from '@sentropic/design-system-vue';
import type { DashboardStore, HistogramConfig } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildHistogramData } from './distributionData.js';

export type HistogramChartProps = {
  store: DashboardStore;
  viewId?: string;
  value: HistogramConfig['value'];
  bins?: HistogramConfig['bins'];
  domain?: HistogramConfig['domain'];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

export const HistogramChart = defineComponent({
  name: 'HistogramChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, default: undefined },
    value: { type: String, required: true },
    bins: { type: Number, default: undefined },
    domain: { type: Array as unknown as PropType<HistogramConfig['domain']>, default: undefined },
    label: { type: String, required: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      return h(DsHistogramChart, {
        data: buildHistogramData(props.store.model, props.store.applyCrossfilter(props.viewId), {
          value: props.value,
          bins: props.bins,
          domain: props.domain,
        }),
        bins: props.bins,
        label: props.label,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});

import { defineComponent, h, type PropType } from 'vue';
import { buildErrorBarsModel, type ChartAnnotation, type DashboardStore } from '@sentropic/dataviz-core';
import { BarChart, type BarChartDatum, type DataLabelsProp as ChartDataLabels } from '@sentropic/design-system-vue';
import { useDashboard } from '../adapter.js';

export type ErrorBarsChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  value: string;
  interval?: 'stdev' | 'stderr';
  width?: number;
  height?: number;
  label: string;
  annotations?: ChartAnnotation[];
  dataLabels?: ChartDataLabels;
  class?: string;
};

export const ErrorBarsChart = defineComponent({
  name: 'ErrorBarsChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    value: { type: String, required: true },
    interval: { type: String as PropType<'stdev' | 'stderr'>, default: undefined },
    width: { type: Number, default: 420 },
    height: { type: Number, default: 240 },
    label: { type: String, required: true },
    annotations: { type: Array as PropType<ChartAnnotation[]>, default: undefined },
    dataLabels: { type: [Boolean, Object] as PropType<ChartDataLabels>, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildErrorBarsModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        category: props.category,
        value: props.value,
        interval: props.interval,
      });
      const data: BarChartDatum[] = model.items.map((item) => ({
        label: item.label,
        value: item.mean,
        errorLow: item.lower,
        errorHigh: item.upper,
      }));

      return h(BarChart, {
        data,
        width: props.width,
        height: props.height,
        label: props.label,
        annotations: props.annotations,
        dataLabels: props.dataLabels,
        class: ['st-errorBarsChart', props.class].filter(Boolean).join(' '),
      });
    };
  },
});

import { defineComponent, h, type PropType } from 'vue';
import { StackedBarChart as DsStackedBarChart, type DataLabelsProp as ChartDataLabels } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import {
  buildSafeCategoricalSeries,
  toStackedCategoricalData,
  type StackedMode,
} from './categoricalData.js';

export type StackedBarChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  series: string;
  measure: string;
  mode?: StackedMode;
  showLegend?: boolean;
  width?: number;
  height?: number;
  label: string;
  dataLabels?: ChartDataLabels;
  hiddenSeries?: string[];
  onToggleSeries?: (seriesId: string) => void;
  class?: string;
};

export const StackedBarChart = defineComponent({
  name: 'StackedBarChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    series: { type: String, required: true },
    measure: { type: String, required: true },
    mode: { type: String as PropType<StackedMode>, default: 'stacked' },
    showLegend: { type: Boolean, default: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    dataLabels: { type: [Boolean, Object] as PropType<ChartDataLabels>, default: undefined },
    hiddenSeries: { type: Array as PropType<string[]>, default: undefined },
    onToggleSeries: { type: Function as PropType<(seriesId: string) => void>, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const seriesModel = buildSafeCategoricalSeries(props.store.model, props.store.applyCrossfilter(props.viewId), {
        category: props.category,
        series: props.series,
        measures: [props.measure],
        mode: props.mode,
      });
      return h(DsStackedBarChart, {
        data: toStackedCategoricalData(seriesModel),
        label: props.label,
        showLegend: props.showLegend,
        width: props.width,
        height: props.height,
        dataLabels: props.dataLabels,
        hiddenSeries: props.hiddenSeries,
        onToggleSeries: props.onToggleSeries,
        class: props.class,
      });
    };
  },
});

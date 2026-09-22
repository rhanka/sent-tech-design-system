import { defineComponent, h, type PropType } from 'vue';
import {
  ComboChart as DsComboChart,
  type ComboChartBarSeries,
  type ComboChartLineSeries,
  type DataLabelsProp,
} from '@sentropic/design-system-vue';
import type {
  ChartAnnotation,
  CategoricalMeasureInput,
  CategoricalMode,
  DashboardStore,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeCategoricalSeries } from './categoricalData.js';

export type ComboChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measures: CategoricalMeasureInput[];
  series?: string;
  mode?: CategoricalMode;
  leftAxisLabel?: string;
  rightAxisLabel?: string;
  legend?: boolean;
  hiddenSeries?: string[];
  onToggleSeries?: (seriesId: string) => void;
  annotations?: ChartAnnotation[];
  dataLabels?: DataLabelsProp;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const ComboChart = defineComponent({
  name: 'ComboChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    measures: { type: Array as PropType<CategoricalMeasureInput[]>, required: true },
    series: { type: String, default: undefined },
    mode: { type: String as PropType<CategoricalMode>, default: 'grouped' },
    leftAxisLabel: { type: String, default: undefined },
    rightAxisLabel: { type: String, default: undefined },
    legend: { type: Boolean, default: true },
    hiddenSeries: { type: Array as PropType<string[]>, default: undefined },
    onToggleSeries: { type: Function as PropType<(seriesId: string) => void>, default: undefined },
    annotations: { type: Array as PropType<ChartAnnotation[]>, default: undefined },
    dataLabels: { type: [Boolean, Object] as PropType<DataLabelsProp>, default: undefined },
    hoverKey: { type: [String] as PropType<string | null>, default: undefined },
    onHoverKeyChange: { type: Function as PropType<(key: string | null) => void>, default: undefined },
    onSelectKey: { type: Function as PropType<(key: string | null) => void>, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const seriesModel = buildSafeCategoricalSeries(props.store.model, props.store.applyCrossfilter(props.viewId), {
        category: props.category,
        series: props.series,
        measures: props.measures,
        mode: props.mode,
      });
      const bars: ComboChartBarSeries[] = seriesModel.series
        .filter((item) => item.mark === 'bar')
        .map((item) => ({ label: item.label, data: item.values }));
      const lines: ComboChartLineSeries[] = seriesModel.series
        .filter((item) => item.mark === 'line')
        .map((item) => ({ label: item.label, data: item.values }));

      return h(DsComboChart, {
        categories: seriesModel.categories,
        bars,
        lines,
        leftAxisLabel: props.leftAxisLabel,
        rightAxisLabel: props.rightAxisLabel,
        legend: props.legend,
        hiddenSeries: props.hiddenSeries,
        onToggleSeries: props.onToggleSeries,
        annotations: props.annotations,
        dataLabels: props.dataLabels,
        hoverKey: props.hoverKey,
        onHoverKeyChange: props.onHoverKeyChange,
        onSelectKey: props.onSelectKey,
        width: props.width,
        height: props.height,
        label: props.label,
        class: props.class,
      });
    };
  },
});

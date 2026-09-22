import { defineComponent, h, type PropType } from 'vue';
import {
  AreaChart as DsAreaChart,
  type AreaChartTone,
  type DataLabelsProp as ChartDataLabels,
} from '@sentropic/design-system-vue';
import type { ChartAnnotation, DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import {
  buildSimpleCategoricalSeries,
  toSimpleCategoricalPoints,
} from './categoricalData.js';

export type AreaChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  tone?: AreaChartTone;
  smooth?: boolean;
  width?: number;
  height?: number;
  label: string;
  annotations?: ChartAnnotation[];
  dataLabels?: ChartDataLabels;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  class?: string;
};

export const AreaChart = defineComponent({
  name: 'AreaChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    measure: { type: String, required: true },
    tone: { type: String as PropType<AreaChartTone>, default: undefined },
    smooth: { type: Boolean, default: false },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    annotations: { type: Array as PropType<ChartAnnotation[]>, default: undefined },
    dataLabels: { type: [Boolean, Object] as PropType<ChartDataLabels>, default: undefined },
    hoverKey: { type: [String, null] as unknown as PropType<string | null>, default: undefined },
    onHoverKeyChange: { type: Function as PropType<(key: string | null) => void>, default: undefined },
    onSelectKey: { type: Function as PropType<(key: string | null) => void>, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const seriesModel = buildSimpleCategoricalSeries(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        props.category,
        props.measure,
      );

      return h(DsAreaChart, {
        data: toSimpleCategoricalPoints(seriesModel),
        label: props.label,
        tone: props.tone,
        smooth: props.smooth,
        width: props.width,
        height: props.height,
        annotations: props.annotations,
        dataLabels: props.dataLabels,
        hoverKey: props.hoverKey,
        onHoverKeyChange: props.onHoverKeyChange,
        onSelectKey: props.onSelectKey,
        class: props.class,
      });
    };
  },
});

import { defineComponent, h, type PropType } from 'vue';
import { buildTrendLineModel, type ChartAnnotation, type DashboardStore } from '@sentropic/dataviz-core';
import { LineChart, type LineChartDatum, type DataLabelsProp as ChartDataLabels } from '@sentropic/design-system-vue';
import { useDashboard } from '../adapter.js';

export type TrendLineChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
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

export const TrendLineChart = defineComponent({
  name: 'TrendLineChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    x: { type: String, required: true },
    y: { type: String, required: true },
    width: { type: Number, default: 360 },
    height: { type: Number, default: 220 },
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
      const model = buildTrendLineModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        x: props.x,
        y: props.y,
      });
      const data: LineChartDatum[] = model.points.map((point) => ({ x: point.x, y: point.y }));

      return h(LineChart, {
        data,
        width: props.width,
        height: props.height,
        label: props.label,
        annotations: props.annotations,
        dataLabels: props.dataLabels,
        trend: true,
        hoverKey: props.hoverKey,
        onHoverKeyChange: props.onHoverKeyChange,
        onSelectKey: props.onSelectKey,
        class: ['st-trendLineChart', props.class].filter(Boolean).join(' '),
      });
    };
  },
});

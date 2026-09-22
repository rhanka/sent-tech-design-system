import { defineComponent, h, type PropType } from 'vue';
import { buildPercentileBandModel, type DashboardStore } from '@sentropic/dataviz-core';
import { LineChart, type LineChartDatum } from '@sentropic/design-system-vue';
import { useDashboard } from '../adapter.js';

export type PercentileBandChartProps = {
  store: DashboardStore;
  viewId: string;
  value: string;
  lower: number;
  upper: number;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const PercentileBandChart = defineComponent({
  name: 'PercentileBandChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    value: { type: String, required: true },
    lower: { type: Number, required: true },
    upper: { type: Number, required: true },
    width: { type: Number, default: 360 },
    height: { type: Number, default: 96 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildPercentileBandModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        value: props.value,
        lower: props.lower,
        upper: props.upper,
      });
      const data: LineChartDatum[] = [
        { x: `${Math.round(props.lower * 100)}%`, y: model.lowerValue },
        { x: 'median', y: model.median },
        { x: `${Math.round(props.upper * 100)}%`, y: model.upperValue },
      ];

      return h(LineChart, {
        data,
        width: props.width,
        height: props.height,
        label: props.label,
        bands: [{ from: model.lowerValue, to: model.upperValue, label: 'Percentiles', tone: 'success' }],
        referenceLines: [{ value: model.median, label: 'Median', tone: 'success' }],
        class: ['st-percentileBandChart', props.class].filter(Boolean).join(' '),
      });
    };
  },
});

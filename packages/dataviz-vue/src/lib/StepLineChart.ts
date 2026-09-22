import { defineComponent, h, type PropType } from 'vue';
import {
  StepLineChart as DsStepLineChart,
  type StepLineChartTone,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import {
  buildSimpleCategoricalSeries,
  toSimpleCategoricalPoints,
} from './categoricalData.js';

export type StepLineChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  tone?: StepLineChartTone;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const StepLineChart = defineComponent({
  name: 'StepLineChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    measure: { type: String, required: true },
    tone: { type: String as PropType<StepLineChartTone>, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
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

      return h(DsStepLineChart, {
        data: toSimpleCategoricalPoints(seriesModel),
        label: props.label,
        tone: props.tone,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});

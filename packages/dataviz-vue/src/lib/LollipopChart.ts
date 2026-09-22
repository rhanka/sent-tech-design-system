import { defineComponent, h, type PropType } from 'vue';
import {
  LollipopChart as DsLollipopChart,
  type LollipopChartDatum,
  type LollipopChartTone,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import {
  buildSimpleCategoricalSeries,
  toSimpleCategoricalData,
} from './categoricalData.js';

export type LollipopChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  tone?: LollipopChartTone;
  orientation?: 'vertical' | 'horizontal';
  domain?: [number, number];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const LollipopChart = defineComponent({
  name: 'LollipopChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    measure: { type: String, required: true },
    tone: { type: String as PropType<LollipopChartTone>, default: undefined },
    orientation: { type: String as PropType<'vertical' | 'horizontal'>, default: 'vertical' },
    domain: { type: Array as unknown as PropType<[number, number]>, default: undefined },
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
      const data: LollipopChartDatum[] = toSimpleCategoricalData(seriesModel).map((item) =>
        props.tone ? { ...item, tone: props.tone } : item,
      );

      return h(DsLollipopChart, {
        data,
        label: props.label,
        orientation: props.orientation,
        domain: props.domain,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});

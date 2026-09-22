import { defineComponent, h, type PropType } from 'vue';
import { Sparkline as DsSparkline } from '@sentropic/design-system-vue';
import type { SparklineTone } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSimpleCategoricalSeries } from './categoricalData.js';

export type { SparklineTone };

export type SparklineProps = {
  store: DashboardStore;
  viewId: string;
  dimension: string;
  measure: string;
  tone?: SparklineTone;
  strokeWidth?: number;
  area?: boolean;
  width?: number;
  height?: number;
  label?: string;
  class?: string;
};

export const Sparkline = defineComponent({
  name: 'Sparkline',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    dimension: { type: String, required: true },
    measure: { type: String, required: true },
    tone: { type: String as PropType<SparklineTone>, default: undefined },
    strokeWidth: { type: Number, default: undefined },
    area: { type: Boolean, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const seriesModel = buildSimpleCategoricalSeries(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        props.dimension,
        props.measure,
      );
      const data: number[] = seriesModel.series[0]?.values ?? [];
      return h(DsSparkline, {
        data,
        tone: props.tone,
        strokeWidth: props.strokeWidth,
        area: props.area,
        width: props.width,
        height: props.height,
        label: props.label,
        class: props.class,
      });
    };
  },
});

import { defineComponent, h, type PropType } from 'vue';
import {
  StreamgraphChart as DsStreamgraphChart,
  type StreamgraphChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildStreamgraphData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type StreamgraphChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  series: string;
  measure: string;
  tone?: string;
  smooth?: boolean;
  showLegend?: boolean;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const StreamgraphChart = defineComponent({
  name: 'StreamgraphChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    series: { type: String, required: true },
    measure: { type: String, required: true },
    tone: { type: String, default: undefined },
    smooth: { type: Boolean, default: undefined },
    showLegend: { type: Boolean, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildStreamgraphData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          category: props.category,
          label: props.series,
          value: props.measure,
          tone: props.tone,
        },
      );
      return h(DsStreamgraphChart, {
        data: data as StreamgraphChartDatum[],
        label: props.label,
        smooth: props.smooth,
        showLegend: props.showLegend,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});

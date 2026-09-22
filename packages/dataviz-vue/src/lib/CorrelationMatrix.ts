import { defineComponent, h, type PropType } from 'vue';
import { HeatmapChart as DsHeatmapChart } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildCorrelationMatrix } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type CorrelationMatrixProps = {
  store: DashboardStore;
  viewId?: string;
  measures: string[];
  legend?: boolean;
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

export const CorrelationMatrix = defineComponent({
  name: 'CorrelationMatrix',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, default: undefined },
    measures: { type: Array as PropType<string[]>, required: true },
    legend: { type: Boolean, default: true },
    label: { type: String, required: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      return h(DsHeatmapChart, {
        data: buildCorrelationMatrix(
          props.store.model,
          props.store.applyCrossfilter(props.viewId),
          { measures: props.measures },
        ),
        legend: props.legend,
        label: props.label,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});

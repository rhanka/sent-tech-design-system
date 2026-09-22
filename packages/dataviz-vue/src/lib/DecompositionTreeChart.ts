import { defineComponent, h, type PropType } from 'vue';
import {
  DecompositionTreeChart as DsDecompositionTreeChart,
  type DecompositionTreeData,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildDecompositionTreeData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type DecompositionTreeChartProps = {
  store: DashboardStore;
  viewId: string;
  measure: string;
  levels: string[];
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

export const DecompositionTreeChart = defineComponent({
  name: 'DecompositionTreeChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    measure: { type: String, required: true },
    levels: { type: Array as PropType<string[]>, required: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    size: { type: Number, default: undefined },
    label: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildDecompositionTreeData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          measure: props.measure,
          levels: props.levels,
        },
      );
      return h(DsDecompositionTreeChart, {
        data: data as DecompositionTreeData,
        label: props.label,
        width: props.width as any,
        height: props.height as any,
        size: props.size as any,
        class: props.class as any,
      });
    };
  },
});

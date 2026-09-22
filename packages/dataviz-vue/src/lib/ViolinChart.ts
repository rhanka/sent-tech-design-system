import { defineComponent, h, type PropType } from 'vue';
import {
  ViolinChart as DsViolinChart,
  type ViolinChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildViolinModel } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ViolinChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id of the dimension used to split data into groups (one violin per group). */
  groupBy: string;
  /** Field id whose numeric values form the distribution for each group. */
  measure: string;
  /** Number of density bins (optional; DS default is 20). */
  bins?: number;
  /** Whether to overlay median / quartile markers (optional; DS default is true). */
  quartiles?: boolean;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  class?: string;
};

export const ViolinChart = defineComponent({
  name: 'ViolinChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    groupBy: { type: String, required: true },
    measure: { type: String, required: true },
    bins: { type: Number, default: undefined },
    quartiles: { type: Boolean, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildViolinModel(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          groupBy: props.groupBy,
          measure: props.measure,
          bins: props.bins,
          quartiles: props.quartiles,
        },
      );
      return h(DsViolinChart, {
        data: model.data as ViolinChartDatum[],
        bins: model.bins,
        quartiles: model.quartiles,
        label: props.label,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});

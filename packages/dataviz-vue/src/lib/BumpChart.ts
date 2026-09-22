import { defineComponent, h, type PropType } from 'vue';
import {
  BumpChart as DsBumpChart,
  type BumpChartSeries,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildBumpModel } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type BumpChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id of the dimension whose distinct values form the series (one line each). */
  series: string;
  /** Field id of the ordered dimension whose distinct values form the category axis (x). */
  category: string;
  /** Field id of the numeric measure used to rank series within each category. */
  measure: string;
  /**
   * Ranking direction.
   * - `'desc'` (default): rank 1 = highest measure value.
   * - `'asc'`: rank 1 = lowest measure value.
   */
  direction?: 'asc' | 'desc';
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  class?: string;
};

export const BumpChart = defineComponent({
  name: 'BumpChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    series: { type: String, required: true },
    category: { type: String, required: true },
    measure: { type: String, required: true },
    direction: { type: String as PropType<'asc' | 'desc'>, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const bumpModel = buildBumpModel(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          series: props.series,
          category: props.category,
          measure: props.measure,
          direction: props.direction,
        },
      );
      return h(DsBumpChart, {
        data: bumpModel.series as BumpChartSeries[],
        categories: bumpModel.categories,
        label: props.label,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});

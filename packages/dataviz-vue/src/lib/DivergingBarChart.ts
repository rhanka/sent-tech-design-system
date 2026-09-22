import { defineComponent, h, type PropType } from 'vue';
import {
  DivergentBarChart,
  type DivergentBarChartDatum,
} from '@sentropic/design-system-vue';
import {
  buildDivergingBarModel,
  findDimension,
  findMeasure,
  type DashboardStore,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type DivergingBarChartProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This chart's view id in the cross-filter graph. */
  viewId: string;
  /** Dimension id used as diverging bar categories. */
  category: string;
  /** Measure id aggregated per category. */
  measure: string;
  /** Accessible label of the chart. */
  label: string;
  /** Optional fixed value-axis domain. Defaults to the core model domain. */
  domain?: [number, number];
  format?: (value: number) => string;
  showLegend?: boolean;
  width?: number;
  height?: number;
  class?: string;
};

/**
 * Cross-filter-aware diverging bar chart built from the core diverging model
 * and rendered by the design-system chart component.
 */
export const DivergingBarChart = defineComponent({
  name: 'DivergingBarChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    measure: { type: String, required: true },
    label: { type: String, required: true },
    domain: { type: Array as unknown as PropType<[number, number]>, default: undefined },
    format: { type: Function as PropType<(value: number) => string>, default: undefined },
    showLegend: { type: Boolean, default: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const dim = findDimension(props.store.model, props.category);
      const m = findMeasure(props.store.model, props.measure);
      const model =
        dim && m
          ? buildDivergingBarModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
              category: props.category,
              measure: props.measure,
            })
          : undefined;
      const data: DivergentBarChartDatum[] =
        model?.items.map((item) => ({ label: item.label, value: item.value, tone: item.direction })) ?? [];

      return h(DivergentBarChart, {
        data,
        label: props.label,
        width: props.width,
        height: props.height,
        domain: props.domain ?? model?.domain,
        format: props.format,
        showLegend: props.showLegend,
        class: props.class,
      });
    };
  },
});

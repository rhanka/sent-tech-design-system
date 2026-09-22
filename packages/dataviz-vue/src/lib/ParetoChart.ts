import { defineComponent, h, type PropType } from 'vue';
import {
  ParetoChart as DsParetoChart,
  type ParetoChartDatum,
  type ParetoChartTone,
} from '@sentropic/design-system-vue';
import {
  buildParetoModel,
  findDimension,
  findMeasure,
  type DashboardStore,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ParetoChartProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This chart's view id in the cross-filter graph. */
  viewId: string;
  /** Dimension id used as Pareto categories. */
  category: string;
  /** Measure id aggregated per category. */
  measure: string;
  /** Accessible label of the chart. */
  label: string;
  /** Optional design-system tone applied to every Pareto bar. */
  tone?: ParetoChartTone;
  width?: number;
  height?: number;
  class?: string;
};

/**
 * Cross-filter-aware Pareto chart built from the core Pareto model and rendered
 * by the design-system chart component.
 */
export const ParetoChart = defineComponent({
  name: 'ParetoChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    measure: { type: String, required: true },
    label: { type: String, required: true },
    tone: { type: String as PropType<ParetoChartTone>, default: undefined },
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
      const data: ParetoChartDatum[] =
        dim && m
          ? buildParetoModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
              category: props.category,
              measure: props.measure,
            }).items.map((item) =>
              props.tone
                ? { label: item.label, value: item.value, tone: props.tone }
                : { label: item.label, value: item.value },
            )
          : [];

      return h(DsParetoChart, {
        data,
        label: props.label,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});

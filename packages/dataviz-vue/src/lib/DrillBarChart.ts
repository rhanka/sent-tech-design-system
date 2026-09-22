import { defineComponent, h, type PropType } from 'vue';
import {
  BarChart,
  type BarChartDatum,
  type BarChartTone,
} from '@sentropic/design-system-vue';
import { findMeasure, groupAggregate, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type DrillBarChartProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This view's id (drill state + cross-filter scope live under it). */
  viewId: string;
  /** Ordered dimension hierarchy; bars group by the current drill level. */
  hierarchy: string[];
  /** Measure id aggregated into each bar's value. */
  measure: string;
  /** Accessible label of the chart. */
  label: string;
  tone?: BarChartTone;
  orientation?: 'vertical' | 'horizontal';
  width?: number;
  height?: number;
  class?: string;
};

/**
 * A bar chart that drills through a dimension hierarchy: clicking a bar filters
 * the clicked value and pushes the next level as group-by. At the deepest level
 * a click toggles this view's selection (brushing) instead.
 */
export const DrillBarChart = defineComponent({
  name: 'DrillBarChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    hierarchy: { type: Array as PropType<string[]>, required: true },
    measure: { type: String, required: true },
    label: { type: String, required: true },
    tone: { type: String as PropType<BarChartTone>, default: undefined },
    orientation: { type: String as PropType<'vertical' | 'horizontal'>, default: 'vertical' },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      const level = Math.min(
        (state.value.drill[props.viewId] ?? []).length,
        Math.max(props.hierarchy.length - 1, 0),
      );
      const currentDim = props.hierarchy[level];
      const canDrill = level < props.hierarchy.length - 1;
      const m = findMeasure(props.store.model, props.measure);
      const data: BarChartDatum[] =
        m && currentDim
          ? groupAggregate(props.store.applyCrossfilter(props.viewId), currentDim, m).map(
              ({ key, value }) =>
                props.tone ? { label: key, value, tone: props.tone } : { label: key, value },
            )
          : [];
      const onSelect = (key: string) => {
        if (canDrill) {
          props.store.setFilter(currentDim, { kind: 'include', values: [key] });
          props.store.drillDown(props.viewId, props.hierarchy[level + 1]);
        } else {
          props.store.toggleSelection(props.viewId, key);
        }
      };
      return h(BarChart, {
        data,
        label: props.label,
        orientation: props.orientation,
        width: props.width,
        height: props.height,
        class: props.class,
        selectedKeys: canDrill ? [] : (state.value.selections[props.viewId] ?? []),
        onSelect,
      });
    };
  },
});

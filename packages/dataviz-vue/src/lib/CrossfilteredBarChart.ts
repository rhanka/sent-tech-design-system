import { defineComponent, h, type PropType } from 'vue';
import {
  BarChart,
  type BarChartDatum,
  type BarChartTone,
} from '@sentropic/design-system-vue';
import {
  findDimension,
  findMeasure,
  groupAggregate,
  type DashboardStore,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type CrossfilteredBarChartProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This chart's view id in the cross-filter graph. */
  viewId: string;
  /** Dimension id to group rows by (one bar per distinct value). */
  dimension: string;
  /** Measure id to aggregate into each bar's value. */
  measure: string;
  /** Accessible label of the chart (required by the design-system BarChart). */
  label: string;
  /** Bar colour tone from the design system. */
  tone?: BarChartTone;
  /**
   * When true (default) clicking a bar toggles this view's selection (brushing
   * input → `store.toggleSelection`); selected bars are highlighted. Set false
   * for an output-only facet.
   */
  selectable?: boolean;
  /** Fixed value-axis domain `[min, max]` for a shared scale across facets. */
  domain?: [number, number];
  orientation?: 'vertical' | 'horizontal';
  width?: number;
  height?: number;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  class?: string;
};

/**
 * A design-system `BarChart` whose data is the cross-filtered, aggregated view
 * of the shared store. Clicking a bar brushes this view's selection (unless
 * `selectable` is false), and the chart re-aggregates as the shared state moves.
 */
export const CrossfilteredBarChart = defineComponent({
  name: 'CrossfilteredBarChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    dimension: { type: String, required: true },
    measure: { type: String, required: true },
    label: { type: String, required: true },
    tone: { type: String as PropType<BarChartTone>, default: undefined },
    selectable: { type: Boolean, default: true },
    domain: { type: Array as unknown as PropType<[number, number]>, default: undefined },
    orientation: { type: String as PropType<'vertical' | 'horizontal'>, default: 'vertical' },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    hoverKey: { type: [String, null] as unknown as PropType<string | null>, default: undefined },
    onHoverKeyChange: { type: Function as PropType<(key: string | null) => void>, default: undefined },
    onSelectKey: { type: Function as PropType<(key: string | null) => void>, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      const dim = findDimension(props.store.model, props.dimension);
      const m = findMeasure(props.store.model, props.measure);
      const data: BarChartDatum[] =
        dim && m
          ? groupAggregate(props.store.applyCrossfilter(props.viewId), props.dimension, m).map(
              ({ key, value }) =>
                props.tone ? { label: key, value, tone: props.tone } : { label: key, value },
            )
          : [];
      return h(BarChart, {
        data,
        label: props.label,
        orientation: props.orientation,
        width: props.width,
        height: props.height,
        domain: props.domain,
        class: props.class,
        selectedKeys: props.selectable ? (state.value.selections[props.viewId] ?? []) : [],
        onSelect: props.selectable
          ? (key: string) => props.store.toggleSelection(props.viewId, key)
          : undefined,
        hoverKey: props.hoverKey,
        onHoverKeyChange: props.onHoverKeyChange,
        onSelectKey: props.onSelectKey,
      });
    };
  },
});

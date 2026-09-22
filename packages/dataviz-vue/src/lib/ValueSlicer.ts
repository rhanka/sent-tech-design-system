import { defineComponent, h, type PropType } from 'vue';
import { CheckboxGroup, type CheckboxGroupOption } from '@sentropic/design-system-vue';
import { findDimension, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ValueSlicerProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Dimension whose distinct values become the slicer's checkboxes. */
  dimension: string;
  /** Legend; defaults to the dimension label. */
  legend?: string;
  orientation?: 'vertical' | 'horizontal';
  class?: string;
};

const keyOf = (v: unknown) => (v == null ? 'null' : String(v));

/**
 * A checkbox slicer over a dimension's distinct values: checked values become an
 * `include` filter (an OR within the dimension). Design-system CheckboxGroup.
 */
export const ValueSlicer = defineComponent({
  name: 'ValueSlicer',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    dimension: { type: String, required: true },
    legend: { type: String, default: undefined },
    orientation: { type: String as PropType<'vertical' | 'horizontal'>, default: 'vertical' },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      const resolvedLegend =
        props.legend ?? findDimension(props.store.model, props.dimension)?.label ?? props.dimension;
      const seen = new Set<string>();
      const options: CheckboxGroupOption[] = [];
      for (const row of props.store.data) {
        const k = keyOf(row[props.dimension]);
        if (!seen.has(k)) {
          seen.add(k);
          options.push({ label: k, value: k });
        }
      }
      const f = state.value.filters[props.dimension];
      const value = f && f.kind === 'include' ? [...f.values] : [];
      const onChange = (values: string[]) => {
        if (values.length) props.store.setFilter(props.dimension, { kind: 'include', values });
        else props.store.clearFilter(props.dimension);
      };
      return h(CheckboxGroup, {
        legend: resolvedLegend,
        options,
        value,
        orientation: props.orientation,
        class: props.class,
        onChange,
      });
    };
  },
});

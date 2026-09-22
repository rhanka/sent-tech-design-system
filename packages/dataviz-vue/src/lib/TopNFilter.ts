import { defineComponent, h, ref, watch, type Component, type PropType } from 'vue';
import { NumberInput } from '@sentropic/design-system-vue';
import { findMeasure, groupAggregate, type DashboardStore, type Row } from '@sentropic/dataviz-core';

export type TopNFilterProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Dimension to restrict to its top-N values. */
  dimension: string;
  /** Measure used to rank the dimension's values (descending). */
  measure: string;
  /** Initial N. Defaults to 5. */
  defaultN?: number;
  /** Field label of the number input. */
  label?: string;
  class?: string;
};

/**
 * Restricts a dimension to its top-N values by a measure (ranked over the full
 * dataset), via a design-system NumberInput. Applies on mount and on change.
 */
export const TopNFilter = defineComponent({
  name: 'TopNFilter',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    dimension: { type: String, required: true },
    measure: { type: String, required: true },
    defaultN: { type: Number, default: 5 },
    label: { type: String, default: 'Top N' },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const n = ref(props.defaultN);
    const apply = () => {
      const m = findMeasure(props.store.model, props.measure);
      if (!m || !Number.isFinite(n.value) || n.value < 1) return;
      const ranked = groupAggregate([...(props.store.data as readonly Row[])], props.dimension, m)
        .slice()
        .sort((a, b) => b.value - a.value)
        .slice(0, n.value)
        .map((r) => r.key);
      props.store.setFilter(props.dimension, { kind: 'include', values: ranked });
    };
    // Re-apply when N or any data-defining prop changes (parity with React/Svelte).
    watch([n, () => props.store, () => props.dimension, () => props.measure], apply, {
      immediate: true,
    });
    // NumberInput is cast to the generic Vue `Component` type: its highly
    // generic DefineComponent signature otherwise trips `h()`'s overload
    // resolution on the `modelValue`/`update:modelValue` (v-model) props.
    return () =>
      h(NumberInput as Component, {
        label: props.label,
        modelValue: n.value,
        min: 1,
        step: 1,
        class: props.class,
        'onUpdate:modelValue': (v: number | string) => {
          const num = Number(v);
          if (Number.isFinite(num)) n.value = num;
        },
      });
  },
});

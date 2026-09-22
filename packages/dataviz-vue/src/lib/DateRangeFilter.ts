import { defineComponent, h, ref, watch, type Component, type PropType } from 'vue';
import {
  DatePicker,
  type DatePickerRange,
  type DatePickerValue,
} from '@sentropic/design-system-vue';
import { type DashboardStore, type FilterSpec } from '@sentropic/dataviz-core';

export type DateRangeFilterProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Date dimension to filter (its cells must be epoch-millisecond numbers). */
  dimension: string;
  label?: string;
  class?: string;
};

/**
 * Pure: a DatePicker `{ start, end }` range → a core `range` FilterSpec in epoch
 * milliseconds (bounds optional), or `null` when the range is empty.
 */
export function dateRangeToSpec(range: { start: Date | null; end: Date | null }): FilterSpec | null {
  const min = range.start ? range.start.getTime() : undefined;
  const max = range.end ? range.end.getTime() : undefined;
  if (min === undefined && max === undefined) return null;
  return { kind: 'range', min, max };
}

const asRange = (value: DatePickerValue): DatePickerRange =>
  value && typeof value === 'object' && 'start' in value ? value : { start: null, end: null };

/**
 * A date-range filter: a design-system DatePicker (range mode) bound to a core
 * `range` filter on a date dimension (epoch-millisecond cells).
 */
export const DateRangeFilter = defineComponent({
  name: 'DateRangeFilter',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    dimension: { type: String, required: true },
    label: { type: String, default: 'Période' },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const range = ref<DatePickerRange>({ start: null, end: null });
    const apply = () => {
      const spec = dateRangeToSpec(range.value);
      if (spec) props.store.setFilter(props.dimension, spec);
      else props.store.clearFilter(props.dimension);
    };
    watch(range, apply, { deep: true, immediate: true });
    return () =>
      // DatePicker cast to Component: its generic DefineComponent signature trips
      // h()'s overload resolution on the v-model props.
      h(DatePicker as Component, {
        mode: 'range',
        label: props.label,
        modelValue: range.value,
        class: props.class,
        'onUpdate:modelValue': (v: DatePickerValue) => {
          range.value = asRange(v);
        },
      });
  },
});

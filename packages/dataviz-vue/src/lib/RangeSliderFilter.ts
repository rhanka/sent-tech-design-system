import { defineComponent, h, ref, watch, type Component, type PropType } from 'vue';
import { RangeSlider } from '@sentropic/design-system-vue';
import { findDimension, type DashboardStore, type FilterSpec, type Row } from '@sentropic/dataviz-core';

export type NumericDomain = { min: number; max: number };

export type RangeSliderFilterProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Continuous numeric dimension to filter. */
  dimension: string;
  label?: string;
  /** Lower bound of the track; defaults to the data minimum. */
  min?: number;
  /** Upper bound of the track; defaults to the data maximum. */
  max?: number;
  step?: number;
};

/**
 * Pure: the numeric `[min, max]` domain of a dimension across rows (finite
 * values only). Returns `{ min: 0, max: 0 }` when no finite value is present.
 */
export function numericDomain(data: readonly Row[], dimension: string): NumericDomain {
  let min = Infinity;
  let max = -Infinity;
  for (const row of data) {
    const v = row[dimension];
    if (typeof v === 'number' && Number.isFinite(v)) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  return min === Infinity ? { min: 0, max: 0 } : { min, max };
}

/**
 * Pure: the two range-slider handles → a core `range` FilterSpec (bounds
 * normalized so `lo <= hi`), or `null` when they span the whole domain.
 */
export function rangeBoundsToSpec(lower: number, upper: number, domain: NumericDomain): FilterSpec | null {
  const lo = Math.min(lower, upper);
  const hi = Math.max(lower, upper);
  if (lo <= domain.min && hi >= domain.max) return null;
  return { kind: 'range', min: lo, max: hi };
}

/**
 * A two-handle numeric range filter built on the design-system RangeSlider,
 * bound to a core `range` filter on a continuous dimension.
 */
export const RangeSliderFilter = defineComponent({
  name: 'RangeSliderFilter',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    dimension: { type: String, required: true },
    label: { type: String, default: undefined },
    min: { type: Number, default: undefined },
    max: { type: Number, default: undefined },
    step: { type: Number, default: 1 },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const d = numericDomain(props.store.data, props.dimension);
    const domain: NumericDomain = { min: props.min ?? d.min, max: props.max ?? d.max };
    const resolvedLabel = props.label ?? findDimension(props.store.model, props.dimension)?.label ?? props.dimension;
    const value = ref<[number, number]>([domain.min, domain.max]);

    const apply = () => {
      const spec = rangeBoundsToSpec(value.value[0], value.value[1], domain);
      if (spec) props.store.setFilter(props.dimension, spec);
      else props.store.clearFilter(props.dimension);
    };
    watch(value, apply, { immediate: true, deep: true });

    return () =>
      // RangeSlider cast to Component: its generic DefineComponent signature
      // trips h()'s overload resolution on the v-model props.
      h(RangeSlider as Component, {
        label: resolvedLabel,
        modelValue: value.value,
        min: domain.min,
        max: domain.max,
        step: props.step,
        showValue: true,
        class: props.class,
        'onUpdate:modelValue': (v: [number, number]) => {
          value.value = v;
        },
      });
  },
});

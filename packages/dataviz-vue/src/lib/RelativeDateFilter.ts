import { defineComponent, h, ref, watch, type Component, type PropType } from 'vue';
import { Select } from '@sentropic/design-system-vue';
import { type DashboardStore, type FilterSpec } from '@sentropic/dataviz-core';

/**
 * A relative-date preset: a labelled choice resolving to a trailing window of
 * `days` ending "now", or `null` days for "all" (no filter).
 */
export type RelativeDatePreset = {
  value: string;
  label: string;
  /** Trailing window length in days, or `null` for "all" (clears the filter). */
  days: number | null;
};

export type RelativeDateFilterProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Date dimension to filter (its cells must be epoch-millisecond numbers). */
  dimension: string;
  label?: string;
  /** Selectable presets; defaults to {@link DEFAULT_RELATIVE_PRESETS}. */
  presets?: RelativeDatePreset[];
  /** Reference "now" for the trailing windows; defaults to the current time. */
  now?: Date;
  class?: string;
};

/** Default relative-date presets: all / 7 / 30 / 90 days / 12 months. */
export const DEFAULT_RELATIVE_PRESETS: RelativeDatePreset[] = [
  { value: 'all', label: 'Tout', days: null },
  { value: '7d', label: '7 derniers jours', days: 7 },
  { value: '30d', label: '30 derniers jours', days: 30 },
  { value: '90d', label: '90 derniers jours', days: 90 },
  { value: '365d', label: '12 derniers mois', days: 365 },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Pure: a trailing window of `days` ending at `now` → a core `range` FilterSpec
 * in epoch milliseconds, or `null` when `days` is `null` ("all", no filter).
 */
export function relativeRangeToSpec(days: number | null, now: Date): FilterSpec | null {
  if (days == null) return null;
  const max = now.getTime();
  return { kind: 'range', min: max - days * DAY_MS, max };
}

/**
 * A relative-date filter: a design-system Select of trailing-window presets
 * bound to a core `range` filter on a date dimension (epoch-millisecond cells).
 */
export const RelativeDateFilter = defineComponent({
  name: 'RelativeDateFilter',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    dimension: { type: String, required: true },
    label: { type: String, default: 'Période' },
    presets: { type: Array as PropType<RelativeDatePreset[]>, default: () => DEFAULT_RELATIVE_PRESETS },
    now: { type: Date as PropType<Date>, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const baseNow = props.now ?? new Date();
    const selected = ref(props.presets[0]?.value ?? 'all');
    const apply = () => {
      const preset = props.presets.find((p) => p.value === selected.value);
      const spec = preset ? relativeRangeToSpec(preset.days, baseNow) : null;
      if (spec) props.store.setFilter(props.dimension, spec);
      else props.store.clearFilter(props.dimension);
    };
    watch(selected, apply, { immediate: true });
    return () =>
      // Select cast to Component: its generic DefineComponent signature trips
      // h()'s overload resolution on the v-model props.
      h(Select as Component, {
        label: props.label,
        modelValue: selected.value,
        options: props.presets.map((p) => ({ value: p.value, label: p.label })),
        class: props.class,
        'onUpdate:modelValue': (v: string) => {
          selected.value = v;
        },
      });
  },
});

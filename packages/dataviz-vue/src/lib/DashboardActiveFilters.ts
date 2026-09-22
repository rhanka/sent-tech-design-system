import { defineComponent, h, type PropType } from 'vue';
import { FilterBar, FilterPill } from '@sentropic/design-system-vue';
import { describeFilterSpec, findDimension, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type DashboardActiveFiltersProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Aria-label of the filter group. */
  label?: string;
  /** Label of the "clear all" button (design-system default otherwise). */
  clearAllLabel?: string;
  class?: string;
};

/**
 * Active filters rendered as design-system `FilterPill`s wired to the store.
 * "Clear all" clears only the filters, leaving any selections intact.
 */
export const DashboardActiveFilters = defineComponent({
  name: 'DashboardActiveFilters',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    label: { type: String, default: 'Filtres actifs' },
    clearAllLabel: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      const entries = Object.entries(state.value.filters);
      return h(
        FilterBar,
        {
          label: props.label,
          clearAllLabel: props.clearAllLabel,
          class: props.class,
          onClearAll:
            entries.length > 0
              ? () => {
                  for (const id of Object.keys(props.store.getState().filters))
                    props.store.clearFilter(id);
                }
              : undefined,
        },
        {
          default: () =>
            entries.map(([dimensionId, spec]) => {
              const dimension = findDimension(props.store.model, dimensionId);
              return h(FilterPill, {
                key: dimensionId,
                field: dimension?.label ?? dimensionId,
                value: describeFilterSpec(spec, dimension),
                onRemove: () => props.store.clearFilter(dimensionId),
              });
            }),
        },
      );
    };
  },
});

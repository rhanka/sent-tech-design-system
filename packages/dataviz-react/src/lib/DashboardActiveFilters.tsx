import { FilterBar, FilterPill } from '@sentropic/design-system-react';
import { describeFilterSpec, findDimension, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type DashboardActiveFiltersProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Aria-label of the filter group. */
  label?: string;
  /** Label of the "clear all" button (design-system default otherwise). */
  clearAllLabel?: string;
  className?: string;
};

/**
 * Active filters rendered as design-system `FilterPill`s wired to the store.
 * "Clear all" clears only the filters, leaving any selections intact.
 */
export function DashboardActiveFilters({
  store,
  label = 'Filtres actifs',
  clearAllLabel,
  className,
}: DashboardActiveFiltersProps) {
  const state = useDashboard(store);
  const entries = Object.entries(state.filters);
  return (
    <FilterBar
      label={label}
      clearAllLabel={clearAllLabel}
      className={className}
      onClearAll={
        entries.length > 0
          ? () => {
              for (const id of Object.keys(store.getState().filters)) store.clearFilter(id);
            }
          : undefined
      }
    >
      {entries.map(([dimensionId, spec]) => {
        const dimension = findDimension(store.model, dimensionId);
        return (
          <FilterPill
            key={dimensionId}
            field={dimension?.label ?? dimensionId}
            value={describeFilterSpec(spec, dimension)}
            onRemove={() => store.clearFilter(dimensionId)}
          />
        );
      })}
    </FilterBar>
  );
}

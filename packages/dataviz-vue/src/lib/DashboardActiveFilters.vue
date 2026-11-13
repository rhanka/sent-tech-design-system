<script setup lang="ts">
import { computed } from 'vue';
import { FilterBar, FilterPill } from '@sentropic/design-system-vue';
import { describeFilterSpec, findDimension, type DashboardStore, type FilterSpec } from '@sentropic/dataviz-core';
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

defineOptions({ name: 'DashboardActiveFilters' });
const props = withDefaults(defineProps<DashboardActiveFiltersProps>(), {
  label: 'Filtres actifs', clearAllLabel: undefined, class: undefined,
});
const state = useDashboard(props.store);
const entries = computed(() => Object.entries(state.value.filters));
const onClearAll = computed(() => (entries.value.length > 0
  ? () => {
      for (const id of Object.keys(props.store.getState().filters)) props.store.clearFilter(id);
    }
  : undefined));
function describe(dimensionId: string, spec: FilterSpec) {
  return describeFilterSpec(spec, findDimension(props.store.model, dimensionId));
}
function fieldOf(dimensionId: string) {
  return findDimension(props.store.model, dimensionId)?.label ?? dimensionId;
}
</script>

<template>
  <FilterBar :label="props.label" :clear-all-label="props.clearAllLabel" :class="props.class" :on-clear-all="onClearAll">
    <FilterPill v-for="[dimensionId, spec] in entries" :key="dimensionId" :field="fieldOf(dimensionId)"
      :value="describe(dimensionId, spec)" :on-remove="() => props.store.clearFilter(dimensionId)" />
  </FilterBar>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Inline, SelectionChip } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
export type SelectionLegendProps = {
  store: DashboardStore;
  labels?: Record<string, string>;
  label?: string;
  class?: string;
};
defineOptions({ name: 'SelectionLegend' });
const props = withDefaults(defineProps<SelectionLegendProps>(), {
  labels: () => ({}), label: 'Sélections actives', class: undefined,
});
const state = useDashboard(props.store);
const entries = computed(() => Object.entries(state.value.selections).filter(([, keys]) => keys.length > 0));
</script>
<template>
  <Inline v-if="entries.length" role="group" :aria-label="props.label" :gap="2" wrap :class="props.class">
    <SelectionChip v-for="[viewId, keys] in entries" :key="viewId" :label="props.labels[viewId] ?? viewId" :count="keys.length" @clear="props.store.clearSelection(viewId)" />
  </Inline>
</template>

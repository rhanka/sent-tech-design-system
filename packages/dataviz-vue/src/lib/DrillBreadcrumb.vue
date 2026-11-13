<script setup lang="ts">
import { computed } from 'vue';
import { Breadcrumb, Button, Inline } from '@sentropic/design-system-vue';
import { findDimension, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type DrillBreadcrumbProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This view's id (must match the DrillBarChart it accompanies). */
  viewId: string;
  /** The same ordered dimension hierarchy used by the DrillBarChart. */
  hierarchy: string[];
  /** Aria-label of the breadcrumb trail. */
  label?: string;
  /** Label of the "go up one level" button. */
  backLabel?: string;
  class?: string;
};

defineOptions({ name: 'DrillBreadcrumb' });
const props = withDefaults(defineProps<DrillBreadcrumbProps>(), {
  label: 'Chemin de drill', backLabel: 'Remonter', class: undefined,
});
const state = useDashboard(props.store);
function dimLabel(id: string): string {
  return findDimension(props.store.model, id)?.label ?? id;
}
const path = computed(() => state.value.drill[props.viewId] ?? []);
const items = computed(() =>
  props.hierarchy
    .slice(0, path.value.length + 1)
    .map((dim, i) => ({ label: dimLabel(dim), current: i === path.value.length })),
);
function back() {
  const p = props.store.getState().drill[props.viewId] ?? [];
  if (p.length === 0) return;
  props.store.drillUp(props.viewId);
  props.store.clearFilter(props.hierarchy[p.length - 1]);
}
</script>

<template>
  <Inline :gap="2" :class="props.class">
    <Breadcrumb :items="items" :label="props.label" />
    <Button v-if="path.length > 0" variant="ghost" @click="back">{{ props.backLabel }}</Button>
  </Inline>
</template>

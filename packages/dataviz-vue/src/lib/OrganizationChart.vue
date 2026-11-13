<script setup lang="ts">
import { computed } from 'vue';
import {
  OrganizationChart as DsOrganizationChart,
  type OrganizationChartNode,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildHierarchyData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type OrganizationChartProps = {
  store: DashboardStore;
  viewId: string;
  id_field: string;
  parent_field: string;
  label_field: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'OrganizationChart' });
const props = withDefaults(defineProps<OrganizationChartProps>(), {
  width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<OrganizationChartNode[]>(() => {
  void state.value;
  return buildHierarchyData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    { id: props.id_field, parentId: props.parent_field, label: props.label_field },
  ) as OrganizationChartNode[];
});
</script>

<template>
  <DsOrganizationChart :data="data" :label="props.label" :width="props.width" :height="props.height"
    :class="props.class" />
</template>

<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type OrganizationChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value becomes each node's unique identifier. */
    id_field: string;
    /** Field id whose value references the parent node's id. */
    parent_field: string;
    /** Field id whose value becomes the node's display label. */
    label_field: string;
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { OrganizationChart as DsOrganizationChart } from '@sentropic/design-system-svelte';
  import type { OrganizationChartNode } from '@sentropic/design-system-svelte';
  import { buildHierarchyData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    id_field,
    parent_field,
    label_field,
    width,
    height,
    label,
    class: className,
  }: OrganizationChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildHierarchyData(store.model, store.applyCrossfilter(viewId), {
      id: id_field,
      parentId: parent_field,
      label: label_field,
    });
  });
</script>

<DsOrganizationChart
  data={data as OrganizationChartNode[]}
  {label}
  {width}
  {height}
  class={className}
/>

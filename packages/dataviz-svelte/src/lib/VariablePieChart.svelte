<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type VariablePieChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value becomes each slice's label. */
    label_field: string;
    /** Field id whose numeric value becomes the slice value. */
    value: string;
    /** Field id whose numeric value becomes the slice size (z-axis). */
    z: string;
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { VariablePieChart as DsVariablePieChart } from '@sentropic/design-system-svelte';
  import type { VariablePieChartDatum } from '@sentropic/design-system-svelte';
  import { buildVariablePieData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    label_field,
    value,
    z,
    width,
    height,
    label,
    class: className,
  }: VariablePieChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildVariablePieData(store.model, store.applyCrossfilter(viewId), {
      label: label_field,
      value,
      z,
    });
  });
</script>

<DsVariablePieChart
  data={data as VariablePieChartDatum[]}
  {label}
  {width}
  {height}
  class={className}
/>

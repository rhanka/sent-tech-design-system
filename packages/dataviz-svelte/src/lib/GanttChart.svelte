<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type GanttChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value becomes the task name. */
    task: string;
    /** Field id whose numeric value becomes the start position. */
    start: string;
    /** Field id whose numeric value becomes the end position. */
    end: string;
    /** Optional field id whose string value becomes the category. */
    category?: string;
    width?: number;
    height?: number;
    /** Optional numeric marker position (e.g. "today" indicator). */
    marker?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { GanttChart as DsGanttChart } from '@sentropic/design-system-svelte';
  import type { GanttChartTask } from '@sentropic/design-system-svelte';
  import { buildGanttData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    task,
    start,
    end,
    category,
    width,
    height,
    marker,
    label,
    class: className,
  }: GanttChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildGanttData(store.model, store.applyCrossfilter(viewId), {
      task,
      start,
      end,
      category,
    });
  });
</script>

<DsGanttChart
  data={data as GanttChartTask[]}
  {label}
  {width}
  {height}
  {marker}
  class={className}
/>

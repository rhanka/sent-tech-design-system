<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type TimelineChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose string value becomes the event label. */
    label_field: string;
    /** Field id whose numeric value becomes the event position. */
    position: string;
    /** Optional field id whose string value becomes the event description. */
    description?: string;
    /** Optional field id whose string value becomes the event tone (e.g. "category1"). */
    tone?: string;
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { TimelineChart as DsTimelineChart } from '@sentropic/design-system-svelte';
  import type { TimelineChartEvent } from '@sentropic/design-system-svelte';
  import { buildTimelineData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    label_field,
    position,
    description,
    tone,
    width,
    height,
    label,
    class: className,
  }: TimelineChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildTimelineData(store.model, store.applyCrossfilter(viewId), {
      label: label_field,
      position,
      description,
      tone,
    });
  });
</script>

<DsTimelineChart
  data={data as TimelineChartEvent[]}
  {label}
  {width}
  {height}
  class={className}
/>

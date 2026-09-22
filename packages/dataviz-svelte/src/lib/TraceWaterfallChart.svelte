<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type TraceWaterfallChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value becomes the span id (string-coerced). */
    spanId: string;
    /** Field id whose value becomes the parent span id (null/empty → root). */
    parentSpanId: string;
    /** Field id whose value becomes the service name (string-coerced). */
    service: string;
    /** Field id whose numeric value becomes the span start time. */
    start: string;
    /** Field id whose numeric value becomes the span duration. */
    duration: string;
    width?: number;
    height?: number;
    size?: number;
    /** Accessible label for the chart (aria-label). */
    label?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { TraceWaterfallChart as DsTraceWaterfallChart } from '@sentropic/design-system-svelte';
  import type { TraceSpan } from '@sentropic/design-system-svelte';
  import { buildTraceWaterfallData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    spanId,
    parentSpanId,
    service,
    start,
    duration,
    width,
    height,
    size,
    label,
    class: className,
  }: TraceWaterfallChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildTraceWaterfallData(store.model, store.applyCrossfilter(viewId), {
      spanId,
      parentSpanId,
      service,
      start,
      duration,
    });
  });
</script>

<DsTraceWaterfallChart
  data={data as { spans: TraceSpan[] }}
  {label}
  {width}
  {height}
  {size}
  class={className}
/>

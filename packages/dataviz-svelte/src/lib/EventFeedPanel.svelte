<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type EventFeedPanelProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose numeric value becomes the event timestamp (epoch ms). */
    at: string;
    /** Field id whose value becomes the event type/category (string-coerced). */
    type: string;
    /** Field id whose value becomes the severity (string-coerced, default 'info'). */
    severity: string;
    /** Field id whose value becomes the displayed message (string-coerced). */
    message: string;
    /** Max height in px (triggers vertical scroll). */
    maxHeight?: number;
    /** Fixed height in px (alias of maxHeight). */
    height?: number;
    /** Accessible label for the feed (aria-label). */
    label?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { EventFeedPanel as DsEventFeedPanel } from '@sentropic/design-system-svelte';
  import type { EventFeedPanelEvent as DsEventFeedPanelEvent } from '@sentropic/design-system-svelte';
  import { buildEventFeedData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    at,
    type,
    severity,
    message,
    maxHeight,
    height,
    label,
    class: className,
  }: EventFeedPanelProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildEventFeedData(store.model, store.applyCrossfilter(viewId), {
      at,
      type,
      severity,
      message,
    });
  });
</script>

<DsEventFeedPanel
  data={data as DsEventFeedPanelEvent[]}
  {label}
  {maxHeight}
  {height}
  class={className}
/>

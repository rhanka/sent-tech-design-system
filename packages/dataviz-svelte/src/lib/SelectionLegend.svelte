<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type SelectionLegendProps = {
    /** The dashboard store to bind to. */
    store: DashboardStore;
    /** Map of viewId -> human label for the legend chips (falls back to the id). */
    labels?: Record<string, string>;
    /** Aria-label of the legend group. */
    label?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { Inline, SelectionChip } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    labels = {},
    label = 'Sélections actives',
    class: className,
  }: SelectionLegendProps = $props();

  const dash = $derived(useDashboard(store));
  const entries = $derived(
    Object.entries($dash.selections).filter(([, keys]) => keys.length > 0),
  );
</script>

{#if entries.length > 0}
  <Inline role="group" aria-label={label} gap={2} wrap class={className}>
    {#each entries as [viewId, keys] (viewId)}
      <SelectionChip
        label={labels[viewId] ?? viewId}
        count={keys.length}
        onClear={() => store.clearSelection(viewId)}
      />
    {/each}
  </Inline>
{/if}

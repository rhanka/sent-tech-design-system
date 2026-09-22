<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

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
</script>

<script lang="ts">
  import { Breadcrumb, Button, Inline } from '@sentropic/design-system-svelte';
  import { findDimension } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    hierarchy,
    label = 'Chemin de drill',
    backLabel = 'Remonter',
    class: className,
  }: DrillBreadcrumbProps = $props();

  const dash = $derived(useDashboard(store));
  const path = $derived($dash.drill[viewId] ?? []);
  const dimLabel = (id: string) => findDimension(store.model, id)?.label ?? id;
  const items = $derived(
    hierarchy
      .slice(0, path.length + 1)
      .map((dim, i) => ({ label: dimLabel(dim), current: i === path.length })),
  );

  // Going up pops the drill path and clears the value-filter that was applied
  // when drilling away from the level we are returning to (see DrillBarChart).
  function back() {
    const p = store.getState().drill[viewId] ?? [];
    if (p.length === 0) return;
    store.drillUp(viewId);
    store.clearFilter(hierarchy[p.length - 1]);
  }
</script>

<Inline gap={2} class={className}>
  <Breadcrumb {items} {label} />
  {#if path.length > 0}
    <Button variant="ghost" onclick={back}>{backLabel}</Button>
  {/if}
</Inline>

<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type QueryBarSize = 'sm' | 'md' | 'lg';

  export type QueryBarProps = {
    store: DashboardStore;
    /** Dimension owned by this query bar. Matching rows include this dimension's values. */
    dimension: string;
    /** Fields searched for the query. Defaults to the owned dimension. */
    fields?: readonly string[];
    label?: string;
    placeholder?: string;
    clearLabel?: string;
    size?: QueryBarSize;
    minLength?: number;
    caseSensitive?: boolean;
    class?: string;
  };
</script>

<script lang="ts">
  import { buildQueryFilterSpec } from '@sentropic/dataviz-core';
  import { Search as DsSearch } from '@sentropic/design-system-svelte';

  let {
    store,
    dimension,
    fields,
    label = 'Search',
    placeholder = 'Search',
    clearLabel,
    size,
    minLength,
    caseSensitive,
    class: className,
  }: QueryBarProps = $props();

  let query = $state('');
  let hasObservedInitialQuery = false;

  $effect(() => {
    const nextQuery = query;
    if (!hasObservedInitialQuery) {
      hasObservedInitialQuery = true;
      return;
    }
    const spec = buildQueryFilterSpec(store.model, store.data, {
      dimension,
      fields,
      query: nextQuery,
      minLength,
      caseSensitive,
    });
    if (spec) store.setFilter(dimension, spec);
    else store.clearFilter(dimension);
  });

  const classes = $derived(['st-queryBar', className].filter(Boolean).join(' '));
</script>

<DsSearch
  {label}
  bind:value={query}
  {placeholder}
  {clearLabel}
  {size}
  class={classes}
/>

<script lang="ts" module>
  import type { SideNavItem } from "./SideNav.svelte";

  export interface ListReportPageNavItem extends SideNavItem {}

  export interface ListReportPageColumn {
    key: string;
    label: string;
    sortable?: boolean;
    align?: "start" | "center" | "end";
    width?: string;
  }

  export interface ListReportPageRow {
    id: string;
    [key: string]: unknown;
  }

  export interface ListReportPageFilter {
    field: string;
    value: string;
    operator?: string;
  }

  export interface ListReportPageAction {
    value: string;
    label: string;
    danger?: boolean;
  }

  export type ListReportPageProps = {
    appTitle: string;
    navItems?: ListReportPageNavItem[];
    pageTitle: string;
    primaryAction?: string;
    secondaryAction?: string;
    searchLabel?: string;
    searchPlaceholder?: string;
    filterBarLabel?: string;
    filters?: ListReportPageFilter[];
    columns: ListReportPageColumn[];
    rows: ListReportPageRow[];
    pageSize?: number;
    rowActions?: ListReportPageAction[];
    rowActionsLabel?: string;
    onprimaryaction?: () => void;
    onsearch?: (q: string) => void;
  };
</script>

<script lang="ts">
  import SideNav from "./SideNav.svelte";
  import DataTable from "./DataTable.svelte";
  import Search from "./Search.svelte";
  import FilterBar from "./FilterBar.svelte";
  import FilterPill from "./FilterPill.svelte";
  import Button from "./Button.svelte";

  let {
    appTitle,
    navItems = [],
    pageTitle,
    primaryAction,
    secondaryAction,
    searchLabel,
    searchPlaceholder = "Rechercher…",
    filterBarLabel = "Filtres actifs",
    filters = [],
    columns,
    rows,
    pageSize = 10,
    rowActions = [],
    rowActionsLabel,
    onprimaryaction,
    onsearch,
  }: ListReportPageProps = $props();

  let searchValue = $state("");

  function handleSearch(q: string) {
    searchValue = q;
    onsearch?.(q);
  }
</script>

<div class="st-lrp">
  <header class="st-lrp__header">
    <span class="st-lrp__appTitle">{appTitle}</span>
  </header>
  <div class="st-lrp__body">
    {#if navItems.length > 0}
      <aside class="st-lrp__aside">
        <SideNav items={navItems} />
      </aside>
    {/if}
    <main class="st-lrp__main">
      <div class="st-lrp__titlebar">
        <h1 class="st-lrp__pageTitle">{pageTitle}</h1>
        <div class="st-lrp__titleActions">
          {#if secondaryAction}
            <Button variant="secondary">{secondaryAction}</Button>
          {/if}
          {#if primaryAction}
            <Button variant="primary" onclick={onprimaryaction}>{primaryAction}</Button>
          {/if}
        </div>
      </div>
      <div class="st-lrp__toolbar">
        <Search
          label={searchLabel}
          placeholder={searchPlaceholder}
          value={searchValue}
          fluid
          oninput={(e) => handleSearch((e.target as HTMLInputElement).value)}
        />
        {#if filters.length > 0}
          <FilterBar label={filterBarLabel}>
            {#each filters as f}
              <FilterPill field={f.field} value={f.value} operator={f.operator} />
            {/each}
          </FilterBar>
        {/if}
      </div>
      <DataTable {columns} {rows} />
    </main>
  </div>
</div>

<style>
  .st-lrp {
    display: grid;
    grid-template-rows: auto 1fr;
    min-block-size: 100vh;
    background: var(--st-semantic-surface-default);
    color: var(--st-semantic-text-primary);
  }
  .st-lrp__header {
    border-block-end: 1px solid var(--st-semantic-border-subtle);
    padding: var(--st-spacing-3, 0.75rem) var(--st-spacing-6, 1.5rem);
    display: flex;
    align-items: center;
  }
  .st-lrp__appTitle {
    font-weight: 700;
    font-size: 1rem;
  }
  .st-lrp__body {
    display: grid;
    grid-template-columns: 220px 1fr;
  }
  .st-lrp__aside {
    border-inline-end: 1px solid var(--st-semantic-border-subtle);
    background: var(--st-semantic-surface-raised);
    overflow-y: auto;
  }
  .st-lrp__main {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-4, 1rem);
    padding: var(--st-spacing-6, 1.5rem);
    overflow: auto;
  }
  .st-lrp__titlebar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--st-spacing-3, 0.75rem);
  }
  .st-lrp__pageTitle {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: var(--st-semantic-text-primary);
  }
  .st-lrp__titleActions {
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
  }
  .st-lrp__toolbar {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-2, 0.5rem);
  }
</style>

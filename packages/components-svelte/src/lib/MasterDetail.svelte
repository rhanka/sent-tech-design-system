<script lang="ts" module>
  import type { SideNavItem } from "./SideNav.svelte";

  export interface MasterDetailNavItem extends SideNavItem {}

  export type MasterDetailStatusTone = "neutral" | "info" | "success" | "warning" | "error";

  export interface MasterDetailItem {
    id: string;
    primary: string;
    secondary?: string;
    statusLabel?: string;
    statusTone?: MasterDetailStatusTone;
    active?: boolean;
  }

  export interface MasterDetailField {
    key: string;
    value: string;
  }

  export type MasterDetailProps = {
    appTitle?: string;
    navItems?: MasterDetailNavItem[];
    listTitle: string;
    searchPlaceholder?: string;
    listItems: MasterDetailItem[];
    detailTitle: string;
    detailStatus?: { label: string; tone: MasterDetailStatusTone };
    detailActions?: string[];
    detailFields: MasterDetailField[];
    onlistitemclick?: (id: string) => void;
  };
</script>

<script lang="ts">
  import SideNav from "./SideNav.svelte";
  import Badge from "./Badge.svelte";
  import Button from "./Button.svelte";
  import Search from "./Search.svelte";

  let {
    appTitle,
    navItems = [],
    listTitle,
    searchPlaceholder = "Rechercher…",
    listItems,
    detailTitle,
    detailStatus,
    detailActions = [],
    detailFields,
    onlistitemclick,
  }: MasterDetailProps = $props();

  let searchValue = $state("");
</script>

<div class="st-md">
  {#if appTitle}
    <header class="st-md__header">
      <span class="st-md__appTitle">{appTitle}</span>
    </header>
  {/if}
  <div class="st-md__body">
    {#if navItems.length > 0}
      <aside class="st-md__aside">
        <SideNav items={navItems} />
      </aside>
    {/if}
    <div class="st-md__split">
      <aside class="st-md__list" aria-label={listTitle}>
        <div class="st-md__listHeader">
          <h2 class="st-md__listTitle">{listTitle}</h2>
          <Search
            placeholder={searchPlaceholder}
            value={searchValue}
            fluid
            oninput={(e) => (searchValue = (e.target as HTMLInputElement).value)}
          />
        </div>
        <ul class="st-md__listItems">
          {#each listItems as item (item.id)}
            <li>
              <button
                class="st-md__listItem"
                class:st-md__listItem--active={item.active}
                onclick={() => onlistitemclick?.(item.id)}
                type="button"
              >
                <span class="st-md__itemPrimary">{item.primary}</span>
                {#if item.secondary}
                  <span class="st-md__itemSecondary">{item.secondary}</span>
                {/if}
                {#if item.statusLabel}
                  <Badge tone={item.statusTone ?? "neutral"}>{item.statusLabel}</Badge>
                {/if}
              </button>
            </li>
          {/each}
        </ul>
      </aside>
      <main class="st-md__detail">
        <div class="st-md__detailHeader">
          <div class="st-md__detailTitleRow">
            <h1 class="st-md__detailTitle">{detailTitle}</h1>
            {#if detailStatus}
              <Badge tone={detailStatus.tone}>{detailStatus.label}</Badge>
            {/if}
          </div>
          {#if detailActions.length > 0}
            <div class="st-md__detailActions">
              {#each detailActions as action, i}
                <Button variant={i === 0 ? "primary" : "secondary"}>{action}</Button>
              {/each}
            </div>
          {/if}
        </div>
        <dl class="st-md__fields">
          {#each detailFields as field}
            <div class="st-md__fieldRow">
              <dt class="st-md__fieldKey">{field.key}</dt>
              <dd class="st-md__fieldValue">{field.value}</dd>
            </div>
          {/each}
        </dl>
      </main>
    </div>
  </div>
</div>

<style>
  .st-md {
    display: grid;
    grid-template-rows: auto 1fr;
    min-block-size: 100vh;
    background: var(--st-semantic-surface-default);
    color: var(--st-semantic-text-primary);
  }
  .st-md__header {
    border-block-end: 1px solid var(--st-semantic-border-subtle);
    padding: var(--st-spacing-3, 0.75rem) var(--st-spacing-6, 1.5rem);
    display: flex;
    align-items: center;
  }
  .st-md__appTitle {
    font-weight: 700;
    font-size: 1rem;
  }
  .st-md__body {
    display: grid;
    grid-template-columns: 220px 1fr;
    overflow: hidden;
  }
  .st-md__aside {
    border-inline-end: 1px solid var(--st-semantic-border-subtle);
    background: var(--st-semantic-surface-raised);
    overflow-y: auto;
  }
  .st-md__split {
    display: grid;
    grid-template-columns: 320px 1fr;
    overflow: hidden;
  }
  .st-md__list {
    border-inline-end: 1px solid var(--st-semantic-border-subtle);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .st-md__listHeader {
    padding: var(--st-spacing-4, 1rem);
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-2, 0.5rem);
    border-block-end: 1px solid var(--st-semantic-border-subtle);
  }
  .st-md__listTitle {
    font-size: 1rem;
    font-weight: 650;
    margin: 0;
  }
  .st-md__listItems {
    list-style: none;
    margin: 0;
    padding: var(--st-spacing-2, 0.5rem);
    overflow-y: auto;
    flex: 1;
  }
  .st-md__listItem {
    width: 100%;
    text-align: start;
    background: transparent;
    border: none;
    border-radius: var(--st-radius-md, 0.375rem);
    padding: var(--st-spacing-3, 0.75rem);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-1, 0.25rem);
    color: var(--st-semantic-text-primary);
  }
  .st-md__listItem:hover {
    background: var(--st-semantic-surface-subtle, #f1f5f9);
  }
  .st-md__listItem--active {
    background: var(--st-semantic-surface-selected, #eff6ff);
  }
  .st-md__itemPrimary {
    font-size: 0.875rem;
    font-weight: 600;
  }
  .st-md__itemSecondary {
    font-size: 0.75rem;
    color: var(--st-semantic-text-secondary);
  }
  .st-md__detail {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-6, 1.5rem);
    padding: var(--st-spacing-6, 1.5rem);
    overflow-y: auto;
  }
  .st-md__detailHeader {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--st-spacing-4, 1rem);
    flex-wrap: wrap;
  }
  .st-md__detailTitleRow {
    display: flex;
    align-items: center;
    gap: var(--st-spacing-3, 0.75rem);
    flex-wrap: wrap;
  }
  .st-md__detailTitle {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
  }
  .st-md__detailActions {
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    flex-shrink: 0;
  }
  .st-md__fields {
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
    gap: var(--st-spacing-3, 0.75rem) var(--st-spacing-6, 1.5rem);
  }
  .st-md__fieldRow {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .st-md__fieldKey {
    font-size: 0.75rem;
    color: var(--st-semantic-text-secondary);
    font-weight: 500;
  }
  .st-md__fieldValue {
    margin: 0;
    font-size: 0.875rem;
    color: var(--st-semantic-text-primary);
  }
</style>

<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface NavRailItem {
    id: string;
    label: string;
    href?: string;
    active?: boolean;
    disabled?: boolean;
    badge?: string | number;
    icon?: Snippet;
  }

  export interface NavRailProps {
    items?: NavRailItem[];
    label?: string;
    activeItemId?: string;
    onItemSelect?: (id: string) => void;
    footer?: Snippet;
    children?: Snippet;
    class?: string;
  }
</script>

<script lang="ts">
  let {
    items = [],
    label = "Primary navigation",
    activeItemId,
    onItemSelect,
    footer,
    children,
    class: className
  }: NavRailProps = $props();

  const classes = $derived(["st-navRail", className].filter(Boolean).join(" "));

  function isActive(item: NavRailItem) {
    return item.active === true || item.id === activeItemId;
  }

  function selectItem(item: NavRailItem) {
    if (!item.disabled) onItemSelect?.(item.id);
  }
</script>

<nav class={classes} aria-label={label}>
  <div class="st-navRail__items">
    {#each items as item (item.id)}
      {#if item.href && !item.disabled}
        <a class="st-navRail__item" class:st-navRail__item--active={isActive(item)} href={item.href} aria-current={isActive(item) ? "page" : undefined} title={item.label} onclick={() => selectItem(item)}>
          {#if item.icon}<span class="st-navRail__icon">{@render item.icon()}</span>{/if}
          <span class="st-navRail__label">{item.label}</span>
          {#if item.badge != null}<span class="st-navRail__badge">{item.badge}</span>{/if}
        </a>
      {:else}
        <button class="st-navRail__item" class:st-navRail__item--active={isActive(item)} type="button" disabled={item.disabled} aria-current={isActive(item) ? "page" : undefined} title={item.label} onclick={() => selectItem(item)}>
          {#if item.icon}<span class="st-navRail__icon">{@render item.icon()}</span>{/if}
          <span class="st-navRail__label">{item.label}</span>
          {#if item.badge != null}<span class="st-navRail__badge">{item.badge}</span>{/if}
        </button>
      {/if}
    {/each}
    {@render children?.()}
  </div>
  {#if footer}
    <footer class="st-navRail__footer">{@render footer()}</footer>
  {/if}
</nav>

<style>
  .st-navRail {
    align-items: stretch;
    background: var(--st-component-navRail-surface, var(--st-semantic-surface-raised));
    color: var(--st-semantic-text-primary);
    display: grid;
    grid-template-rows: 1fr auto;
    block-size: 100%;
    inline-size: var(--st-component-navRail-width, 4.5rem);
    padding: var(--st-spacing-2, 0.5rem);
  }

  .st-navRail__items,
  .st-navRail__footer {
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-navRail__items {
    min-block-size: 0;
    overflow-y: auto;
  }

  .st-navRail__item {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--st-radius-md, 0.375rem);
    color: var(--st-semantic-text-secondary);
    cursor: pointer;
    display: inline-flex;
    flex-direction: column;
    font: inherit;
    gap: var(--st-spacing-1, 0.25rem);
    inline-size: 100%;
    min-block-size: 3.25rem;
    padding: var(--st-spacing-2, 0.5rem);
    position: relative;
    text-align: center;
    text-decoration: none;
  }

  .st-navRail__item:hover,
  .st-navRail__item--active {
    background: var(--st-component-navRail-activeBackground, var(--st-semantic-surface-subtle));
    color: var(--st-semantic-text-primary);
  }

  .st-navRail__item--active {
    border-color: var(--st-component-navRail-activeBorder, var(--st-semantic-border-strong));
  }

  .st-navRail__item:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .st-navRail__label {
    font-size: 0.6875rem;
    font-weight: 650;
    line-height: 1.1;
  }

  .st-navRail__badge {
    background: var(--st-component-navRail-badgeBackground, var(--st-semantic-surface-inverse));
    border-radius: 999px;
    color: var(--st-semantic-text-inverse);
    font-size: 0.625rem;
    line-height: 1;
    padding: 0.125rem 0.3rem;
    position: absolute;
    right: 0.25rem;
    top: 0.25rem;
  }
</style>

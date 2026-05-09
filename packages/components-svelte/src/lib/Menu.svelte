<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  export type MenuItem = {
    label: string;
    value: string;
    disabled?: boolean;
  };

  type MenuProps = Omit<HTMLAttributes<HTMLDivElement>, "class" | "onselect"> & {
    label: string;
    items: MenuItem[];
    class?: string;
    onselect?: (value: string) => void;
  };

  let { label, items, class: className, onselect, ...rest }: MenuProps = $props();
  const classes = () => ["st-menu", className].filter(Boolean).join(" ");
  const selectItem = (item: MenuItem) => {
    if (!item.disabled) onselect?.(item.value);
  };
</script>

<div {...rest} class={classes()} role="menu" aria-label={label}>
  {#each items as item (item.value)}
    <button
      class="st-menu__item"
      type="button"
      role="menuitem"
      aria-disabled={item.disabled ? "true" : undefined}
      disabled={item.disabled}
      onclick={() => selectItem(item)}
    >
      {item.label}
    </button>
  {/each}
</div>

<style>
  .st-menu {
    background: var(--st-component-menu-background, var(--st-semantic-surface-raised));
    border: 1px solid var(--st-component-menu-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-menu-radius, 0.375rem);
    box-shadow: var(--st-component-menu-shadow, 0 8px 24px rgb(15 23 42 / 0.14));
    color: var(--st-component-menu-text, var(--st-semantic-text-primary));
    display: grid;
    min-width: 12rem;
    padding: var(--st-spacing-1, 0.25rem);
  }

  .st-menu__item {
    background: transparent;
    border: 0;
    border-radius: var(--st-radius-small, 0.375rem);
    color: inherit;
    cursor: pointer;
    font: inherit;
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
    text-align: left;
  }

  .st-menu__item:hover:not(:disabled),
  .st-menu__item:focus-visible {
    background: var(--st-component-menu-itemHoverBackground, var(--st-semantic-surface-subtle));
    outline: none;
  }

  .st-menu__item:disabled {
    color: var(--st-component-menu-disabledText, var(--st-semantic-text-muted));
    cursor: not-allowed;
  }
</style>

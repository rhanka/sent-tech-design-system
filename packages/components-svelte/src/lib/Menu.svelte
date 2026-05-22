<script lang="ts" module>
  import type { Component } from "svelte";

  export type MenuIconProps = {
    size?: number | string;
    strokeWidth?: number | string;
    color?: string;
    class?: string;
  } & Record<`data-${string}`, unknown>;

  export type MenuIcon = Component<MenuIconProps>;

  export interface MenuActionItem {
    kind?: "item";
    label: string;
    value: string;
    disabled?: boolean;
    danger?: boolean;
    icon?: MenuIcon;
  }

  export interface MenuDividerItem {
    kind: "divider";
  }

  export interface MenuGroupItem {
    kind: "group";
    label: string;
  }

  export type MenuItem = MenuActionItem | MenuDividerItem | MenuGroupItem;

  let groupIdCounter = 0;
  function nextGroupId(): string {
    groupIdCounter += 1;
    return `st-menu-group-${groupIdCounter}`;
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type MenuProps = Omit<HTMLAttributes<HTMLDivElement>, "class" | "onselect"> & {
    label: string;
    items: MenuItem[];
    open?: boolean;
    dismissOnSelect?: boolean;
    class?: string;
    dense?: boolean;
    onselect?: (value: string) => void;
  };

  let {
    label,
    items,
    open = $bindable(true),
    dismissOnSelect = false,
    class: className,
    dense = false,
    onselect,
    ...rest
  }: MenuProps = $props();

  let host: HTMLDivElement | undefined = $state();

  const classes = () =>
    ["st-menu", dense ? "st-menu--dense" : null, className].filter(Boolean).join(" ");

  function selectItem(item: MenuActionItem) {
    if (item.disabled) return;
    onselect?.(item.value);
    if (dismissOnSelect) open = false;
  }

  function isAction(item: MenuItem): item is MenuActionItem {
    return item.kind === undefined || item.kind === "item";
  }

  function onWindowKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && open && dismissOnSelect) {
      event.preventDefault();
      open = false;
    }
  }

  function onWindowPointerDown(event: MouseEvent) {
    if (!open || !dismissOnSelect) return;
    const target = event.target as Node | null;
    if (host && target && !host.contains(target)) open = false;
  }
</script>

<svelte:window onkeydown={onWindowKeydown} onpointerdown={onWindowPointerDown} />

{#if open}
  <div {...rest} bind:this={host} class={classes()} role="menu" aria-label={label}>
    {#each items as item, index (index)}
      {#if isAction(item)}
        {@const Icon = item.icon}
        <button
          class="st-menu__item"
          class:st-menu__item--danger={item.danger}
          type="button"
          role="menuitem"
          aria-disabled={item.disabled ? "true" : undefined}
          disabled={item.disabled}
          onclick={() => selectItem(item)}
        >
          {#if Icon}
            <span class="st-menu__itemIcon" aria-hidden="true">
              <Icon size={16} strokeWidth={2} />
            </span>
          {/if}
          <span class="st-menu__itemLabel">{item.label}</span>
        </button>
      {:else if item.kind === "divider"}
        <div class="st-menu__divider" role="separator" aria-hidden="true"></div>
      {:else}
        {@const groupId = nextGroupId()}
        <div
          class="st-menu__group"
          id={groupId}
          role="presentation"
        >
          {item.label}
        </div>
      {/if}
    {/each}
  </div>
{/if}

<style>
  .st-menu {
    background: var(--st-component-menu-background, var(--st-semantic-surface-raised));
    border: 1px solid var(--st-component-menu-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-menu-radius, 0.375rem);
    box-shadow: var(--st-component-menu-shadow, 0 8px 24px rgb(15 23 42 / 0.14));
    color: var(--st-component-menu-text, var(--st-semantic-text-primary));
    display: grid;
    min-width: var(--st-component-menu-minWidth, 12rem);
    max-width: var(--st-component-menu-maxWidth, 18rem);
    padding: var(--st-spacing-1, 0.25rem);
  }

  .st-menu__item {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: var(--st-radius-small, 0.375rem);
    color: inherit;
    cursor: pointer;
    display: flex;
    font: inherit;
    gap: var(--st-spacing-2, 0.5rem);
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
    text-align: left;
    width: 100%;
  }

  .st-menu--dense .st-menu__item {
    padding: 0.3rem 0.6rem;
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

  .st-menu__item--danger {
    color: var(--st-component-menu-dangerText, var(--st-semantic-feedback-error, #b91c1c));
  }

  .st-menu__item--danger:hover:not(:disabled),
  .st-menu__item--danger:focus-visible {
    background: var(--st-component-menu-dangerHoverBackground, rgba(185, 28, 28, 0.08));
  }

  .st-menu__itemIcon {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    justify-content: center;
  }

  .st-menu__itemLabel {
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .st-menu__divider {
    background: var(--st-component-menu-border, var(--st-semantic-border-subtle));
    height: 1px;
    margin: 0.25rem 0;
  }

  .st-menu__group {
    color: var(--st-component-menu-groupText, var(--st-semantic-text-muted));
    font-size: 0.72rem;
    font-weight: 650;
    letter-spacing: 0.04em;
    padding: 0.45rem 0.75rem 0.25rem;
    text-transform: uppercase;
  }
</style>

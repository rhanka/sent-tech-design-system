<script lang="ts" module>
  import type { Component } from "svelte";

  export type OverflowMenuIconProps = {
    size?: number | string;
    strokeWidth?: number | string;
    color?: string;
    class?: string;
  } & Record<`data-${string}`, unknown>;

  export type OverflowMenuIcon = Component<OverflowMenuIconProps>;

  export interface OverflowMenuActionItem {
    kind?: "item";
    value: string;
    label: string;
    disabled?: boolean;
    danger?: boolean;
    icon?: OverflowMenuIcon;
    onclick?: () => void;
  }

  export interface OverflowMenuDividerItem {
    kind: "divider";
  }

  export interface OverflowMenuGroupItem {
    kind: "group";
    label: string;
  }

  export type OverflowMenuItem =
    | OverflowMenuActionItem
    | OverflowMenuDividerItem
    | OverflowMenuGroupItem;
</script>

<script lang="ts">
  import { Ellipsis } from "@lucide/svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { tick } from "svelte";

  type OverflowMenuProps = Omit<HTMLAttributes<HTMLDivElement>, "class" | "onselect"> & {
    items: OverflowMenuItem[];
    label?: string;
    open?: boolean;
    placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
    class?: string;
    triggerLabel?: string;
    dense?: boolean;
    onselect?: (value: string) => void;
  };

  let {
    items,
    label = "Menu",
    open = $bindable(false),
    placement = "bottom-end",
    class: className,
    triggerLabel = "More actions",
    dense = false,
    onselect,
    ...rest
  }: OverflowMenuProps = $props();

  let host: HTMLDivElement | undefined = $state();
  let list: HTMLUListElement | undefined = $state();

  function getFocusableItems(): HTMLButtonElement[] {
    return Array.from(
      list?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? []
    );
  }

  function moveIndex(index: number, size: number, step: number) {
    if (size <= 0) return 0;
    return ((index + step) % size + size) % size;
  }

  function focusAt(index: number) {
    const focusable = getFocusableItems();
    if (!focusable.length) return;
    const target = moveIndex(index, focusable.length, 0);
    focusable.forEach((button, idx) => {
      button.tabIndex = idx === target ? 0 : -1;
    });
    focusable[target]?.focus();
  }

  function openAndFocus() {
    open = true;
    tick().then(() => {
      focusAt(0);
    });
  }

  const classes = () =>
    [
      "st-overflowMenu",
      `st-overflowMenu--${placement}`,
      dense ? "st-overflowMenu--dense" : null,
      className
    ]
    .filter(Boolean)
    .join(" ");

  function toggle() {
    if (open) {
      close();
    } else {
      openAndFocus();
    }
  }

  function close() {
    open = false;
  }

  function selectItem(item: OverflowMenuActionItem) {
    if (item.disabled) return;
    item.onclick?.();
    onselect?.(item.value);
    close();
  }

  function isAction(item: OverflowMenuItem): item is OverflowMenuActionItem {
    return item.kind === undefined || item.kind === "item";
  }

  function onWindowKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      close();
    }
  }

  function onWindowPointerDown(event: MouseEvent) {
    if (!open) return;
    const target = event.target as Node | null;
    if (host && target && !host.contains(target)) close();
  }

  function onTriggerKeyDown(event: KeyboardEvent) {
    if (!["ArrowDown", "Enter", " "].includes(event.key)) return;
    event.preventDefault();
    if (open) {
      focusAt(0);
    } else {
      openAndFocus();
    }
  }

  function onItemKeyDown(event: KeyboardEvent, item: OverflowMenuActionItem) {
    const focusable = getFocusableItems();
    const current = focusable.indexOf(event.currentTarget as HTMLButtonElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusAt(current + 1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusAt(current - 1);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      focusAt(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      focusAt(focusable.length - 1);
      return;
    }
    if (item.disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectItem(item);
    }
  }
</script>

<svelte:window onkeydown={onWindowKeydown} onpointerdown={onWindowPointerDown} />

<div {...rest} bind:this={host} class={classes()}>
  <button
    type="button"
    class="st-overflowMenu__trigger"
    aria-haspopup="menu"
    aria-expanded={open ? "true" : "false"}
    aria-label={triggerLabel}
    onclick={toggle}
    onkeydown={onTriggerKeyDown}
  >
    <Ellipsis size={18} strokeWidth={2.25} aria-hidden="true" />
  </button>
  {#if open}
    <ul bind:this={list} class="st-overflowMenu__list" role="menu" aria-label={label}>
      {#each items as item, index (index)}
        {#if isAction(item)}
          {@const Icon = item.icon}
          <li role="none" class="st-overflowMenu__listItem">
            <button
              type="button"
              class="st-overflowMenu__item"
              class:st-overflowMenu__item--danger={item.danger}
              role="menuitem"
              aria-disabled={item.disabled ? "true" : undefined}
              disabled={item.disabled}
              tabindex={-1}
              onclick={() => selectItem(item)}
              onkeydown={(event) => onItemKeyDown(event, item)}
            >
              {#if Icon}
                <span class="st-overflowMenu__itemIcon" aria-hidden="true">
                  <Icon size={16} strokeWidth={2} />
                </span>
              {/if}
              <span class="st-overflowMenu__itemLabel">{item.label}</span>
            </button>
          </li>
        {:else if item.kind === "divider"}
          <li role="separator" aria-hidden="true" class="st-overflowMenu__divider"></li>
        {:else}
          <li role="presentation" class="st-overflowMenu__group">{item.label}</li>
        {/if}
      {/each}
    </ul>
  {/if}
</div>

<style>
  .st-overflowMenu {
    display: inline-block;
    position: relative;
  }

  .st-overflowMenu__trigger {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--st-component-overflowMenu-triggerRadius, var(--st-radius-small, 0.375rem));
    color: var(--st-component-overflowMenu-triggerText, var(--st-semantic-text-primary));
    cursor: pointer;
    display: inline-flex;
    height: 2rem;
    justify-content: center;
    padding: 0;
    width: 2rem;
  }

  .st-overflowMenu__trigger:hover {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  /* Focus = stratégie d'anatomie partagée (outline DSFR / inset Carbon / ring base). */
  .st-overflowMenu__trigger:focus-visible {
    border-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline: var(--st-component-control-anatomy-focus-outline, none);
    outline-offset: var(--st-component-control-anatomy-focus-offset, 0);
    box-shadow: var(--st-component-control-anatomy-focus-boxShadow,
      0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive)));
  }

  .st-overflowMenu__trigger[aria-expanded="true"] {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-overflowMenu__list {
    background: var(--st-component-menu-background, var(--st-semantic-surface-raised));
    border: 1px solid var(--st-component-menu-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-menu-radius, 0.375rem);
    box-shadow: var(--st-component-menu-shadow, 0 8px 24px rgb(15 23 42 / 0.14));
    display: grid;
    list-style: none;
    margin: 0;
    min-width: var(--st-component-menu-minWidth, 12rem);
    max-width: var(--st-component-menu-maxWidth, 18rem);
    padding: var(--st-spacing-1, 0.25rem);
    position: absolute;
    z-index: var(--st-component-popover-zIndex, 80);
  }

  .st-overflowMenu--bottom-end .st-overflowMenu__list {
    right: 0;
    top: calc(100% + var(--st-spacing-1, 0.25rem));
  }

  .st-overflowMenu--bottom-start .st-overflowMenu__list {
    left: 0;
    top: calc(100% + var(--st-spacing-1, 0.25rem));
  }

  .st-overflowMenu--top-end .st-overflowMenu__list {
    bottom: calc(100% + var(--st-spacing-1, 0.25rem));
    right: 0;
  }

  .st-overflowMenu--top-start .st-overflowMenu__list {
    bottom: calc(100% + var(--st-spacing-1, 0.25rem));
    left: 0;
  }

  .st-overflowMenu__listItem {
    margin: 0;
    padding: 0;
  }

  .st-overflowMenu__item {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: var(--st-radius-small, 0.375rem);
    color: var(--st-component-menu-text, var(--st-semantic-text-primary));
    cursor: pointer;
    display: flex;
    font: inherit;
    gap: var(--st-spacing-2, 0.5rem);
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
    text-align: left;
    width: 100%;
  }

  .st-overflowMenu--dense .st-overflowMenu__item {
    padding: 0.3rem 0.6rem;
  }

  .st-overflowMenu__item:hover:not(:disabled),
  .st-overflowMenu__item:focus-visible {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
    outline: none;
  }

  .st-overflowMenu__item:disabled {
    color: var(--st-component-menu-disabledText, var(--st-semantic-text-muted));
    cursor: not-allowed;
  }

  .st-overflowMenu__item--danger {
    color: var(--st-component-overflowMenu-dangerText, var(--st-semantic-feedback-error));
  }

  .st-overflowMenu__item--danger:hover:not(:disabled),
  .st-overflowMenu__item--danger:focus-visible {
    background: var(
      --st-component-overflowMenu-dangerHoverBackground,
      var(--st-semantic-feedback-error)
    );
    color: var(--st-component-overflowMenu-dangerHoverText, var(--st-semantic-action-primaryText));
  }

  .st-overflowMenu__itemIcon {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    justify-content: center;
  }

  .st-overflowMenu__itemLabel {
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .st-overflowMenu__divider {
    background: var(--st-component-menu-border, var(--st-semantic-border-subtle));
    height: 1px;
    list-style: none;
    margin: 0.25rem 0;
  }

  .st-overflowMenu__group {
    color: var(--st-component-menu-groupText, var(--st-semantic-text-muted));
    font-size: 0.72rem;
    font-weight: 650;
    letter-spacing: 0.04em;
    padding: 0.45rem 0.75rem 0.25rem;
    text-transform: uppercase;
    list-style: none;
  }
</style>

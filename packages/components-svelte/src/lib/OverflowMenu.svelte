<script lang="ts" module>
  export interface OverflowMenuItem {
    value: string;
    label: string;
    disabled?: boolean;
    danger?: boolean;
    onclick?: () => void;
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type OverflowMenuProps = Omit<HTMLAttributes<HTMLDivElement>, "class" | "onselect"> & {
    items: OverflowMenuItem[];
    label?: string;
    open?: boolean;
    placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
    class?: string;
    triggerLabel?: string;
    onselect?: (value: string) => void;
  };

  let {
    items,
    label = "Menu",
    open = $bindable(false),
    placement = "bottom-end",
    class: className,
    triggerLabel = "More actions",
    onselect,
    ...rest
  }: OverflowMenuProps = $props();

  let host: HTMLDivElement | undefined = $state();

  const classes = () =>
    ["st-overflowMenu", `st-overflowMenu--${placement}`, className].filter(Boolean).join(" ");

  function toggle() {
    open = !open;
  }

  function close() {
    open = false;
  }

  function selectItem(item: OverflowMenuItem) {
    if (item.disabled) return;
    item.onclick?.();
    onselect?.(item.value);
    close();
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
  >
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <circle cx="3" cy="8" r="1.4" fill="currentColor" />
      <circle cx="8" cy="8" r="1.4" fill="currentColor" />
      <circle cx="13" cy="8" r="1.4" fill="currentColor" />
    </svg>
  </button>
  {#if open}
    <ul class="st-overflowMenu__list" role="menu" aria-label={label}>
      {#each items as item (item.value)}
        <li role="none" class="st-overflowMenu__listItem">
          <button
            type="button"
            class="st-overflowMenu__item"
            class:st-overflowMenu__item--danger={item.danger}
            role="menuitem"
            aria-disabled={item.disabled ? "true" : undefined}
            disabled={item.disabled}
            onclick={() => selectItem(item)}
          >
            {item.label}
          </button>
        </li>
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
    background: var(
      --st-component-overflowMenu-triggerHoverBackground,
      var(--st-semantic-surface-subtle)
    );
  }

  .st-overflowMenu__trigger:focus-visible {
    border-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    box-shadow: 0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline: none;
  }

  .st-overflowMenu__trigger[aria-expanded="true"] {
    background: var(
      --st-component-overflowMenu-triggerHoverBackground,
      var(--st-semantic-surface-subtle)
    );
  }

  .st-overflowMenu__list {
    background: var(--st-component-menu-background, var(--st-semantic-surface-raised));
    border: 1px solid var(--st-component-menu-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-menu-radius, 0.375rem);
    box-shadow: var(--st-component-menu-shadow, 0 8px 24px rgb(15 23 42 / 0.14));
    display: grid;
    list-style: none;
    margin: 0;
    min-width: 12rem;
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
    background: transparent;
    border: 0;
    border-radius: var(--st-radius-small, 0.375rem);
    color: var(--st-component-menu-text, var(--st-semantic-text-primary));
    cursor: pointer;
    display: block;
    font: inherit;
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
    text-align: left;
    width: 100%;
  }

  .st-overflowMenu__item:hover:not(:disabled),
  .st-overflowMenu__item:focus-visible {
    background: var(--st-component-menu-itemHoverBackground, var(--st-semantic-surface-subtle));
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
</style>

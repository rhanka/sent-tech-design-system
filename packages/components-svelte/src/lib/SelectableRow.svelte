<script lang="ts" module>
  import type { Snippet } from "svelte";

  export type SelectableRowProps = {
    /** Selected state (bindable). */
    selected?: boolean;
    /** Notified on every toggle with the new selected state. */
    onselect?: (selected: boolean) => void;
    /** Non-interactive when true. */
    disabled?: boolean;
    /** Optional stable value, surfaced as `data-value` for the consumer. */
    value?: string;
    /** Leading slot (icon / avatar). */
    leading?: Snippet;
    /** Trailing slot (meta / icon). */
    trailing?: Snippet;
    /** Main content. */
    children?: Snippet;
    class?: string;
  };
</script>

<script lang="ts">
  let {
    selected = $bindable(false),
    onselect,
    disabled = false,
    value,
    leading,
    trailing,
    children,
    class: className
  }: SelectableRowProps = $props();

  const classes = () =>
    [
      "st-selectableRow",
      selected ? "st-selectableRow--selected" : null,
      disabled ? "st-selectableRow--disabled" : null,
      className
    ]
      .filter(Boolean)
      .join(" ");

  function toggle() {
    if (disabled) return;
    selected = !selected;
    onselect?.(selected);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  }
</script>

<div
  class={classes()}
  role="option"
  aria-selected={selected}
  aria-disabled={disabled ? "true" : undefined}
  data-value={value}
  tabindex={disabled ? -1 : 0}
  onclick={toggle}
  onkeydown={handleKeydown}
>
  {#if leading}
    <span class="st-selectableRow__leading">{@render leading()}</span>
  {/if}
  <span class="st-selectableRow__content">{@render children?.()}</span>
  {#if trailing}
    <span class="st-selectableRow__trailing">{@render trailing()}</span>
  {/if}
</div>

<style>
  /* Compact, full-width selectable list/rail row. The selected state is truly
     themed (a tinted surface + accented text + a fine 2px flush accent bar) —
     deliberately NOT the off-theme "boudin box" (3px inset box-shadow + heavy
     rounded border) it replaces. */
  .st-selectableRow {
    align-items: center;
    background: transparent;
    border-radius: var(--st-radius-sm, 0.25rem);
    box-sizing: border-box;
    color: var(--st-semantic-text-secondary, #475569);
    cursor: pointer;
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    /* Reserve room for the 2px accent bar so text never shifts on selection. */
    padding: 0.5rem 0.75rem 0.5rem calc(0.75rem - 2px);
    border-left: 2px solid transparent;
    position: relative;
    text-align: left;
    transition:
      background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    user-select: none;
    width: 100%;
  }

  .st-selectableRow:hover:not(.st-selectableRow--disabled):not(.st-selectableRow--selected) {
    background: var(
      --st-component-control-hoverBackground,
      var(--st-semantic-surface-subtle, #f8fafc)
    );
    color: var(--st-semantic-text-primary, #0f172a);
  }

  .st-selectableRow:focus-visible {
    outline: 2px solid var(--st-semantic-border-interactive, var(--st-semantic-action-primary));
    outline-offset: -2px;
  }

  /* Selected: tinted surface + accented text + a crisp, flush 2px accent bar.
     No inset box-shadow, no thick rounded border. */
  .st-selectableRow--selected {
    background: var(
      --st-component-selectableRow-selectedBackground,
      color-mix(in oklch, var(--st-semantic-action-primary, #2563eb) 12%, transparent)
    );
    border-left-color: var(
      --st-component-selectableRow-selectedAccent,
      var(--st-semantic-action-primary, #2563eb)
    );
    color: var(
      --st-component-selectableRow-selectedText,
      var(--st-semantic-action-primary, #1d4ed8)
    );
    font-weight: 600;
  }

  .st-selectableRow--disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .st-selectableRow__leading,
  .st-selectableRow__trailing {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
  }

  .st-selectableRow__content {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-selectableRow { transition: none; }
  }
</style>

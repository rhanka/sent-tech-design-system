<script lang="ts" module>
  import type { HTMLButtonAttributes } from "svelte/elements";

  export type CommentPinVariant = "inline" | "margin" | "element" | "cluster";

  export type CommentPinProps = Omit<
    HTMLButtonAttributes,
    "class" | "type" | "aria-label" | "tabindex"
  > & {
    /** 1-based document order index. */
    index: number;
    /** Number of comments in the thread (or clustered threads). */
    count?: number;
    /** Whether the thread has unread comments for the current user. */
    unread?: boolean;
    /** Resolved visual state (`resolved` <=> wire `state: 'closed'`). */
    resolved?: boolean;
    /** Whether this thread is currently selected/active. */
    active?: boolean;
    /** Full accessible label (e.g. "Thread 2, 3 comments, 1 unread, on '…'"). */
    label: string;
    /** Placement variant (`margin` defaults `tabindex` to -1 per SPEC-r6 §3). */
    variant?: CommentPinVariant;
    /** Explicit tabindex override. */
    tabindex?: number;
    class?: string;
    onActivate?: () => void;
  };
</script>

<script lang="ts">
  import { Check } from "@lucide/svelte";

  let {
    index,
    count = 1,
    unread = false,
    resolved = false,
    active = false,
    label,
    variant = "inline",
    tabindex,
    class: className,
    onActivate,
    onclick,
    ...rest
  }: CommentPinProps = $props();

  const effectiveTabIndex = $derived(tabindex ?? (variant === "margin" ? -1 : 0));

  const classes = $derived(
    [
      "st-review-pin",
      `st-review-pin--${variant}`,
      resolved ? "st-review-pin--resolved" : undefined,
      active ? "st-review-pin--active" : undefined,
      unread ? "st-review-pin--unread" : undefined,
      className,
    ]
      .filter(Boolean)
      .join(" "),
  );

  function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    onclick?.(event);
    onActivate?.();
  }
</script>

<button
  {...rest}
  type="button"
  class={classes}
  tabindex={effectiveTabIndex}
  aria-label={label}
  aria-pressed={active ? "true" : "false"}
  data-pin-index={index}
  data-pin-variant={variant}
  data-resolved={resolved ? "true" : "false"}
  data-unread={unread ? "true" : "false"}
  data-active={active ? "true" : "false"}
  onclick={handleClick}
>
  <span class="st-review-pin__glyph" aria-hidden="true">
    {#if resolved}
      <Check size={13} strokeWidth={2.5} aria-hidden="true" />
    {:else}
      {index}
    {/if}
  </span>

  {#if count > 1}
    <span class="st-review-pin__count" aria-hidden="true">{count}</span>
  {/if}

  {#if unread}
    <span class="st-review-pin__unread-dot" aria-hidden="true"></span>
  {/if}
</button>

<style>
  .st-review-pin {
    align-items: center;
    background: var(
      --st-component-review-pin-background,
      var(--st-semantic-surface-raised, #ffffff)
    );
    border: 1.5px solid
      var(--st-component-review-pin-border, var(--st-semantic-border-interactive, #2563eb));
    border-radius: 999px;
    box-shadow: var(--st-component-review-pin-shadow, 0 2px 6px rgb(15 23 42 / 0.14));
    color: var(--st-component-review-pin-text, var(--st-semantic-text-primary));
    cursor: pointer;
    display: inline-flex;
    font-family: inherit;
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    gap: 0.1875rem;
    justify-content: center;
    line-height: 1;
    min-height: 1.5rem;
    min-width: 1.5rem;
    padding: 0 0.375rem;
    position: relative;
    transition:
      background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      transform var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      opacity var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-review-pin:hover {
    background: var(
      --st-component-review-pin-hoverBackground,
      var(--st-semantic-surface-subtle, #f1f5f9)
    );
  }

  .st-review-pin--active {
    background: var(
      --st-component-review-pin-activeBackground,
      var(--st-semantic-action-primary, #2563eb)
    );
    border-color: var(
      --st-component-review-pin-activeBorder,
      var(--st-semantic-action-primary, #2563eb)
    );
    color: var(
      --st-component-review-pin-activeText,
      var(--st-semantic-action-primaryText, #ffffff)
    );
  }

  .st-review-pin--active:hover {
    background: var(
      --st-component-review-pin-activeBackground,
      var(--st-semantic-action-primary, #2563eb)
    );
  }

  .st-review-pin--resolved {
    border-color: var(
      --st-component-review-pin-resolvedBorder,
      var(--st-semantic-feedback-success, #15803d)
    );
    color: var(
      --st-component-review-pin-resolvedText,
      var(--st-semantic-feedback-success, #15803d)
    );
    opacity: 0.55;
  }

  .st-review-pin--resolved.st-review-pin--active {
    background: var(
      --st-component-review-pin-resolvedActiveBackground,
      var(--st-semantic-feedback-success, #15803d)
    );
    color: var(--st-semantic-text-inverse, #ffffff);
    opacity: 0.85;
  }

  .st-review-pin--cluster {
    padding-inline: 0.5rem;
  }

  .st-review-pin:focus-visible {
    outline: 2px solid
      var(--st-component-review-focusRing, var(--st-semantic-border-interactive, #2563eb));
    outline-offset: 2px;
  }

  .st-review-pin__glyph {
    align-items: center;
    display: inline-flex;
    justify-content: center;
  }

  .st-review-pin__count {
    font-size: 0.6875rem;
    font-weight: 600;
    opacity: 0.85;
  }

  .st-review-pin__unread-dot {
    background: var(
      --st-component-review-unreadDot,
      var(--st-semantic-feedback-info, #2563eb)
    );
    border: 1.5px solid var(--st-semantic-surface-raised, #ffffff);
    border-radius: 999px;
    height: 0.5rem;
    position: absolute;
    right: -0.125rem;
    top: -0.125rem;
    width: 0.5rem;
  }
</style>

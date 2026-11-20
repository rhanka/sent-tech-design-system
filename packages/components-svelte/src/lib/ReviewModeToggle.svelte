<script lang="ts" module>
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { ReviewMode } from "./CommentLayer.svelte";

  export type ReviewModeToggleProps = Omit<
    HTMLButtonAttributes,
    "class" | "type" | "disabled" | "aria-pressed"
  > & {
    /** Current host-controlled mode (`"view"` or `"review"`). */
    mode?: ReviewMode;
    /** Number of open comment threads shown beside the label (e.g. "Review · 3"). */
    openCount?: number;
    /** Number of unread threads for the current user. */
    unreadCount?: number;
    /** Visible toggle label (default "Review"). */
    label?: string;
    disabled?: boolean;
    class?: string;
    onModeChange?: (mode: ReviewMode) => void;
  };
</script>

<script lang="ts">
  import { MessageSquare } from "@lucide/svelte";
  import Badge from "./Badge.svelte";
  import Button from "./Button.svelte";

  let {
    mode = "view",
    openCount = 0,
    unreadCount = 0,
    label = "Review",
    disabled = false,
    class: className,
    onModeChange,
    onclick,
    ...rest
  }: ReviewModeToggleProps = $props();

  const isReview = $derived(mode === "review");

  const ariaLabel = $derived.by(() => {
    const parts = [label];
    if (openCount > 0) parts.push(`${openCount} open`);
    if (unreadCount > 0) parts.push(`${unreadCount} unread`);
    return parts.join(", ");
  });

  const classes = $derived(
    [
      "st-review-toggle",
      isReview ? "st-review-toggle--active" : undefined,
      className,
    ]
      .filter(Boolean)
      .join(" "),
  );

  function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    onclick?.(event);
    if (disabled) return;
    onModeChange?.(isReview ? "view" : "review");
  }
</script>

<Button
  {...rest}
  type="button"
  variant={isReview ? "primary" : "secondary"}
  size="sm"
  class={classes}
  {disabled}
  aria-pressed={isReview ? "true" : "false"}
  aria-label={ariaLabel}
  data-review-mode={mode}
  onclick={handleClick}
>
  <MessageSquare size={15} strokeWidth={2} aria-hidden="true" />
  <span class="st-review-toggle__label">
    {label}{#if openCount > 0}<span class="st-review-toggle__count"> · {openCount}</span>{/if}
  </span>
  {#if unreadCount > 0}
    <Badge
      size="sm"
      shape="circle"
      tone="info"
      class="st-review-toggle__unread"
      aria-hidden="true"
    >
      {unreadCount}
    </Badge>
  {/if}
</Button>

<style>
  :global(.st-review-toggle) {
    gap: var(--st-component-review-toggle-gap, var(--st-spacing-2, 0.5rem));
  }

  .st-review-toggle__label {
    align-items: center;
    display: inline-flex;
    font-variant-numeric: tabular-nums;
  }

  .st-review-toggle__count {
    font-weight: 600;
    opacity: 0.9;
  }
</style>

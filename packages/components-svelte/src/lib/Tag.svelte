<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { X } from "@lucide/svelte";

  type TagProps = Omit<HTMLAttributes<HTMLSpanElement>, "class"> & {
    tone?: "neutral" | "success" | "warning" | "error" | "info";
    size?: "sm" | "md";
    dismissible?: boolean;
    dismissLabel?: string;
    disabled?: boolean;
    onDismiss?: (event: MouseEvent) => void;
    class?: string;
    children?: Snippet;
  };

  let {
    tone = "neutral",
    size = "md",
    dismissible = false,
    dismissLabel = "Dismiss",
    disabled = false,
    onDismiss,
    class: className,
    children,
    ...rest
  }: TagProps = $props();

  const classes = () =>
    ["st-tag", `st-tag--${tone}`, `st-tag--${size}`, disabled ? "st-tag--disabled" : null, className]
      .filter(Boolean)
      .join(" ");

  function handleDismiss(event: MouseEvent) {
    if (disabled) return;
    onDismiss?.(event);
  }
</script>

<span {...rest} class={classes()} aria-disabled={disabled ? "true" : undefined}>
  <span class="st-tag__label">{@render children?.()}</span>
  {#if dismissible}
    <button
      type="button"
      class="st-tag__dismiss"
      aria-label={dismissLabel}
      {disabled}
      onclick={handleDismiss}
    >
      <X size={14} strokeWidth={2} aria-hidden="true" />
    </button>
  {/if}
</span>

<style>
  /* P-C: per-theme tag anatomy. Every var falls back to the prior base literal,
     so a theme that emits no `--st-component-tag-*` renders byte-identically. */
  .st-tag {
    align-items: center;
    border-radius: var(--st-component-tag-radius, var(--st-radius-pill, 999px));
    display: inline-flex;
    font-weight: var(--st-component-tag-fontWeight, 600);
    gap: 0.25rem;
    letter-spacing: var(--st-component-tag-letterSpacing, normal);
    line-height: var(--st-component-tag-lineHeight, 1);
    min-height: var(--st-component-tag-minHeight, 0);
    padding: var(--st-component-tag-paddingBlock, 0.25rem)
      var(--st-component-tag-paddingInline, 0.5rem);
    text-transform: var(--st-component-tag-textTransform, none);
  }

  .st-tag--sm {
    font-size: var(--st-component-tag-fontSize, 0.6875rem);
    padding: var(--st-component-tag-paddingBlock, 0.1875rem)
      var(--st-component-tag-paddingInline, 0.5rem);
  }

  .st-tag--md {
    font-size: var(--st-component-tag-fontSize, 0.75rem);
    padding: var(--st-component-tag-paddingBlock, 0.25rem)
      var(--st-component-tag-paddingInline, 0.625rem);
  }

  .st-tag--neutral {
    background: var(--st-component-tag-neutralBackground, var(--st-semantic-surface-subtle));
    color: var(--st-component-tag-neutralText, var(--st-semantic-text-secondary));
  }

  .st-tag--success {
    background: color-mix(in srgb, var(--st-semantic-feedback-success) 14%, white);
    color: var(--st-semantic-feedback-success);
  }

  .st-tag--warning {
    background: color-mix(in srgb, var(--st-semantic-feedback-warning) 14%, white);
    color: var(--st-semantic-feedback-warning);
  }

  .st-tag--error {
    background: color-mix(in srgb, var(--st-semantic-feedback-error) 14%, white);
    color: var(--st-semantic-feedback-error);
  }

  .st-tag--info {
    background: color-mix(in srgb, var(--st-semantic-feedback-info) 14%, white);
    color: var(--st-semantic-feedback-info);
  }

  .st-tag--disabled {
    opacity: 0.55;
  }

  .st-tag__label {
    display: inline-flex;
    align-items: center;
  }

  .st-tag__dismiss {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: 50%;
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 1em;
    height: 1.25em;
    justify-content: center;
    line-height: 1;
    margin-inline-start: 0.125rem;
    padding: 0;
    transition: background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: 1.25em;
  }

  .st-tag__dismiss:hover:not(:disabled) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-tag__dismiss:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 1px;
  }

  .st-tag__dismiss:disabled {
    cursor: not-allowed;
  }
</style>

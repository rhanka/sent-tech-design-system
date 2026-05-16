<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";

  type CopyButtonProps = Omit<HTMLButtonAttributes, "class" | "type"> & {
    value: string;
    label?: string;
    copiedLabel?: string;
    feedbackTimeoutMs?: number;
    size?: "sm" | "md" | "lg";
    onCopied?: (value: string) => void;
    onError?: (err: unknown) => void;
    class?: string;
  };

  let {
    value,
    label = "Copy",
    copiedLabel = "Copied",
    feedbackTimeoutMs = 1500,
    size = "md",
    onCopied,
    onError,
    disabled,
    class: className,
    ...rest
  }: CopyButtonProps = $props();

  let copied = $state(false);
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const classes = () =>
    ["st-copyButton", `st-copyButton--${size}`, copied ? "st-copyButton--copied" : null, className]
      .filter(Boolean)
      .join(" ");

  async function copy() {
    if (disabled) return;
    try {
      await navigator.clipboard.writeText(value);
      copied = true;
      onCopied?.(value);
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        copied = false;
      }, feedbackTimeoutMs);
    } catch (err) {
      onError?.(err);
    }
  }
</script>

<button
  {...rest}
  type="button"
  class={classes()}
  {disabled}
  aria-live="polite"
  onclick={copy}
>
  <span class="st-copyButton__icon" aria-hidden="true">
    {#if copied}
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" width="14" height="14">
        <path d="m3 8 3.5 3.5L13 5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    {:else}
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14">
        <rect x="4" y="4" width="9" height="10" rx="1.5" />
        <path d="M3 11V3a1 1 0 0 1 1-1h7" />
      </svg>
    {/if}
  </span>
  <span class="st-copyButton__label">{copied ? copiedLabel : label}</span>
</button>

<style>
  .st-copyButton {
    align-items: center;
    background: var(--st-component-control-background, var(--st-semantic-surface-default));
    border: 1px solid var(--st-component-control-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-control-radius, 0.375rem);
    color: var(--st-component-control-text, var(--st-semantic-text-primary));
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    gap: 0.375rem;
    padding: 0 0.625rem;
    transition:
      background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-copyButton--sm {
    font-size: 0.75rem;
    min-height: var(--st-component-control-smHeight, 2rem);
  }

  .st-copyButton--md {
    font-size: 0.875rem;
    min-height: var(--st-component-control-mdHeight, 2.5rem);
  }

  .st-copyButton--lg {
    font-size: 0.9375rem;
    min-height: var(--st-component-control-lgHeight, 3rem);
  }

  .st-copyButton:hover:not(:disabled) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
    border-color: var(--st-component-control-hoverBorder, var(--st-semantic-border-strong));
  }

  .st-copyButton:focus-visible {
    border-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    box-shadow: 0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline: none;
  }

  .st-copyButton:disabled {
    color: var(--st-component-control-disabledText, var(--st-semantic-text-muted));
    cursor: not-allowed;
  }

  .st-copyButton--copied {
    color: var(--st-semantic-feedback-success);
  }

  .st-copyButton__icon {
    align-items: center;
    display: inline-flex;
    justify-content: center;
  }
</style>

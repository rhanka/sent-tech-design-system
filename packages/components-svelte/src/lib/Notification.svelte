<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type NotificationProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    tone?: "info" | "success" | "warning" | "error";
    title: string;
    message?: string;
    dismissible?: boolean;
    dismissLabel?: string;
    onDismiss?: () => void;
    class?: string;
    actions?: Snippet;
    children?: Snippet;
  };

  let {
    tone = "info",
    title,
    message,
    dismissible = false,
    dismissLabel = "Dismiss",
    onDismiss,
    class: className,
    actions,
    children,
    ...rest
  }: NotificationProps = $props();

  const classes = () =>
    ["st-notification", `st-notification--${tone}`, className].filter(Boolean).join(" ");

  const canDismiss = () => dismissible && typeof onDismiss === "function";
  const role = () => (tone === "error" ? "alert" : "status");

  const onDismissClick = () => onDismiss?.();
</script>

<section {...rest} class={classes()} role={role()}>
  <div class="st-notification__content">
    <h2 class="st-notification__title">{title}</h2>
    {#if message}
      <p class="st-notification__message">{message}</p>
    {/if}
    {@render children?.()}
  </div>
  <div class="st-notification__meta">
    {#if actions}
      <div class="st-notification__actions">
        {@render actions()}
      </div>
    {/if}
    {#if canDismiss()}
      <button
        type="button"
        class="st-notification__close"
        aria-label={dismissLabel}
        title={dismissLabel}
        onclick={onDismissClick}
      >
        ×
      </button>
    {/if}
  </div>
</section>

<style>
  .st-notification {
    background: var(--st-component-notification-background, var(--st-semantic-surface-raised));
    border: 1px solid var(--st-component-notification-border, var(--st-semantic-border-subtle));
    border-left-width: var(--st-component-notification-accentWidth, 0.25rem);
    border-left-style: solid;
    border-left-color: var(--st-component-notification-accent, var(--st-semantic-feedback-info));
    border-radius: 0;
    color: var(--st-component-notification-text, var(--st-semantic-text-primary));
    display: flex;
    gap: var(--st-spacing-4, 1rem);
    justify-content: space-between;
    padding: var(--st-spacing-4, 1rem);
    width: min(100%, 32rem);
  }

  .st-notification--info {
    --st-component-notification-accent: var(--st-component-notification-infoAccent, var(--st-semantic-feedback-info));
  }

  .st-notification--success {
    --st-component-notification-accent: var(--st-component-notification-successAccent, var(--st-semantic-feedback-success));
  }

  .st-notification--warning {
    --st-component-notification-accent: var(--st-component-notification-warningAccent, var(--st-semantic-feedback-warning));
  }

  .st-notification--error {
    --st-component-notification-accent: var(--st-component-notification-errorAccent, var(--st-semantic-feedback-error));
  }

  .st-notification__content {
    display: grid;
    gap: 0.25rem;
    flex: 1;
    min-width: 0;
  }

  .st-notification__title {
    font-size: 0.9375rem;
    margin: 0;
  }

  .st-notification__message {
    color: var(--st-semantic-text-secondary);
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0;
  }

  .st-notification__meta {
    align-items: start;
    display: flex;
    flex-shrink: 0;
    gap: 0.5rem;
  }

  .st-notification__actions {
    align-items: start;
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-notification__close {
    align-items: center;
    background: transparent;
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-border-radius-full, 999px);
    color: var(--st-semantic-text-secondary);
    cursor: var(--st-cursor-interactive, pointer);
    display: inline-flex;
    font-size: 0.875rem;
    height: 1.75rem;
    justify-content: center;
    min-width: 1.75rem;
    padding: 0;
    width: 1.75rem;
  }

  .st-notification__close:hover {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }
</style>

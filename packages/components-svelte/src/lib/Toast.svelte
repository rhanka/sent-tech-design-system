<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type ToastProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    tone?: "info" | "success" | "warning" | "error";
    title: string;
    message?: string;
    class?: string;
    actions?: Snippet;
  };

  let { tone = "info", title, message, class: className, actions, ...rest }: ToastProps = $props();
  const classes = () => ["st-toast", `st-toast--${tone}`, className].filter(Boolean).join(" ");
  const role = () => (tone === "error" ? "alert" : "status");
</script>

<section {...rest} class={classes()} role={role()}>
  <div class="st-toast__content">
    <h2 class="st-toast__title">{title}</h2>
    {#if message}<p class="st-toast__message">{message}</p>{/if}
  </div>
  {#if actions}
    <div class="st-toast__actions">
      {@render actions()}
    </div>
  {/if}
</section>

<style>
  .st-toast {
    background: var(--st-component-toast-background, var(--st-semantic-surface-raised));
    border: 1px solid var(--st-component-toast-border, var(--st-semantic-border-subtle));
    border-left-width: 0.25rem;
    border-radius: var(--st-component-toast-radius, 0.5rem);
    box-shadow: var(--st-component-toast-shadow, 0 18px 45px rgb(15 23 42 / 0.18));
    color: var(--st-component-toast-text, var(--st-semantic-text-primary));
    display: flex;
    gap: var(--st-spacing-4, 1rem);
    justify-content: space-between;
    padding: var(--st-spacing-4, 1rem);
    width: min(100%, 28rem);
    z-index: var(--st-component-toast-zIndex, 100);
  }

  .st-toast--info {
    border-left-color: var(--st-component-toast-infoBorder, var(--st-semantic-feedback-info));
  }

  .st-toast--success {
    border-left-color: var(--st-component-toast-successBorder, var(--st-semantic-feedback-success));
  }

  .st-toast--warning {
    border-left-color: var(--st-component-toast-warningBorder, var(--st-semantic-feedback-warning));
  }

  .st-toast--error {
    border-left-color: var(--st-component-toast-errorBorder, var(--st-semantic-feedback-error));
  }

  .st-toast__content {
    display: grid;
    gap: 0.25rem;
  }

  .st-toast__title {
    font-size: 0.9375rem;
    margin: 0;
  }

  .st-toast__message {
    color: var(--st-semantic-text-secondary);
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0;
  }

  .st-toast__actions {
    align-items: start;
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
  }
</style>

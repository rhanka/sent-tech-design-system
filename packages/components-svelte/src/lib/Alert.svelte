<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type AlertProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    tone?: "info" | "success" | "warning" | "error";
    title: string;
    message?: string;
    class?: string;
    actions?: Snippet;
    children?: Snippet;
  };

  let {
    tone = "info",
    title,
    message,
    class: className,
    actions,
    children,
    ...rest
  }: AlertProps = $props();

  const classes = () => ["st-alert", `st-alert--${tone}`, className].filter(Boolean).join(" ");
  const role = () => (tone === "error" || tone === "warning" ? "alert" : "status");
</script>

<section {...rest} class={classes()} role={role()}>
  <div class="st-alert__content">
    <h2 class="st-alert__title">{title}</h2>
    {#if message}<p class="st-alert__message">{message}</p>{/if}
    {@render children?.()}
  </div>
  {#if actions}
    <div class="st-alert__actions">
      {@render actions()}
    </div>
  {/if}
</section>

<style>
  .st-alert {
    background: var(--st-component-alert-background, var(--st-semantic-surface-raised));
    border: 1px solid var(--st-component-alert-border, var(--st-semantic-border-subtle));
    border-left-width: 0.25rem;
    border-radius: var(--st-component-alert-radius, 0.5rem);
    color: var(--st-component-alert-text, var(--st-semantic-text-primary));
    display: flex;
    gap: var(--st-spacing-4, 1rem);
    justify-content: space-between;
    padding: var(--st-spacing-4, 1rem);
  }

  .st-alert--info {
    border-left-color: var(--st-component-alert-infoBorder, var(--st-semantic-feedback-info));
  }

  .st-alert--success {
    border-left-color: var(--st-component-alert-successBorder, var(--st-semantic-feedback-success));
  }

  .st-alert--warning {
    border-left-color: var(--st-component-alert-warningBorder, var(--st-semantic-feedback-warning));
  }

  .st-alert--error {
    border-left-color: var(--st-component-alert-errorBorder, var(--st-semantic-feedback-error));
  }

  .st-alert__content {
    display: grid;
    gap: var(--st-spacing-1, 0.25rem);
  }

  .st-alert__title {
    font-size: 0.9375rem;
    margin: 0;
  }

  .st-alert__message {
    color: var(--st-semantic-text-secondary);
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0;
  }

  .st-alert__actions {
    align-items: start;
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
  }
</style>

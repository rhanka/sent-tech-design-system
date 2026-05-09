<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type EmptyStateProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    title: string;
    message?: string;
    class?: string;
    action?: Snippet;
    children?: Snippet;
  };

  let { title, message, class: className, action, children, ...rest }: EmptyStateProps = $props();
  const classes = () => ["st-empty-state", className].filter(Boolean).join(" ");
</script>

<section {...rest} class={classes()}>
  <div class="st-empty-state__content">
    <h2 class="st-empty-state__title">{title}</h2>
    {#if message}<p class="st-empty-state__message">{message}</p>{/if}
    {@render children?.()}
  </div>
  {#if action}
    <div class="st-empty-state__action">
      {@render action()}
    </div>
  {/if}
</section>

<style>
  .st-empty-state {
    align-items: center;
    background: var(--st-component-emptyState-background, var(--st-semantic-surface-subtle));
    border: 1px solid var(--st-component-emptyState-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-emptyState-radius, 0.5rem);
    color: var(--st-component-emptyState-titleText, var(--st-semantic-text-primary));
    display: grid;
    gap: var(--st-spacing-4, 1rem);
    justify-items: center;
    padding: var(--st-spacing-8, 2rem);
    text-align: center;
  }

  .st-empty-state__content {
    display: grid;
    gap: var(--st-spacing-2, 0.5rem);
    max-width: 34rem;
  }

  .st-empty-state__title {
    font-size: 1.125rem;
    margin: 0;
  }

  .st-empty-state__message {
    color: var(--st-component-emptyState-messageText, var(--st-semantic-text-secondary));
    line-height: 1.5;
    margin: 0;
  }

  .st-empty-state__action {
    display: flex;
    justify-content: center;
  }
</style>

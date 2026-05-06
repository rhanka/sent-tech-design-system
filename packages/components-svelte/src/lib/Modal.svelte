<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type ModalProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    open?: boolean;
    title: string;
    description?: string;
    closeLabel?: string;
    class?: string;
    children?: Snippet;
    footer?: Snippet;
    onclose?: () => void;
  };

  let {
    open = false,
    title,
    description,
    closeLabel = "Close",
    class: className,
    children,
    footer,
    onclose,
    ...rest
  }: ModalProps = $props();

  const classes = () => ["st-modal", className].filter(Boolean).join(" ");
</script>

{#if open}
  <div class="st-modal__backdrop">
    <section {...rest} class={classes()} role="dialog" aria-modal="true" aria-label={title}>
      <header class="st-modal__header">
        <div>
          <h2 class="st-modal__title">{title}</h2>
          {#if description}<p class="st-modal__description">{description}</p>{/if}
        </div>
        <button class="st-modal__close" type="button" aria-label={closeLabel} onclick={onclose}>
          <span aria-hidden="true">x</span>
        </button>
      </header>
      <div class="st-modal__body">
        {@render children?.()}
      </div>
      {#if footer}
        <footer class="st-modal__footer">
          {@render footer()}
        </footer>
      {/if}
    </section>
  </div>
{/if}

<style>
  .st-modal__backdrop {
    align-items: center;
    background: var(--st-component-overlay-backdrop, var(--st-semantic-surface-overlay));
    display: grid;
    inset: 0;
    justify-items: center;
    padding: var(--st-spacing-4, 1rem);
    position: fixed;
    z-index: var(--st-component-overlay-zIndex, 90);
  }

  .st-modal {
    background: var(--st-component-overlay-surface, var(--st-semantic-surface-raised));
    border: 1px solid var(--st-component-overlay-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-overlay-radius, 0.5rem);
    box-shadow: var(--st-component-overlay-shadow, 0 18px 45px rgb(15 23 42 / 0.18));
    color: var(--st-semantic-text-primary);
    display: grid;
    gap: var(--st-spacing-4, 1rem);
    max-height: min(42rem, calc(100vh - 2rem));
    max-width: 36rem;
    overflow: auto;
    padding: var(--st-spacing-4, 1rem);
    width: min(100%, 36rem);
  }

  .st-modal__header {
    align-items: start;
    display: flex;
    gap: var(--st-spacing-4, 1rem);
    justify-content: space-between;
  }

  .st-modal__title {
    font-size: 1.25rem;
    line-height: 1.2;
    margin: 0;
  }

  .st-modal__description {
    color: var(--st-semantic-text-secondary);
    line-height: 1.5;
    margin: 0.5rem 0 0;
  }

  .st-modal__close {
    align-items: center;
    background: transparent;
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-small, 0.375rem);
    color: var(--st-semantic-text-primary);
    cursor: pointer;
    display: inline-flex;
    height: 2rem;
    justify-content: center;
    width: 2rem;
  }

  .st-modal__body {
    line-height: 1.5;
  }

  .st-modal__footer {
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: flex-end;
  }
</style>

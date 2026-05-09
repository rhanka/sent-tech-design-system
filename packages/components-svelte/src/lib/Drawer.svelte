<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type DrawerProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    open?: boolean;
    title: string;
    description?: string;
    side?: "left" | "right";
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
    side = "right",
    closeLabel = "Close",
    class: className,
    children,
    footer,
    onclose,
    ...rest
  }: DrawerProps = $props();

  const classes = () => ["st-drawer", `st-drawer--${side}`, className].filter(Boolean).join(" ");
</script>

{#if open}
  <div class="st-drawer__backdrop">
    <aside {...rest} class={classes()} role="dialog" aria-modal="true" aria-label={title}>
      <header class="st-drawer__header">
        <div>
          <h2 class="st-drawer__title">{title}</h2>
          {#if description}<p class="st-drawer__description">{description}</p>{/if}
        </div>
        <button class="st-drawer__close" type="button" aria-label={closeLabel} onclick={onclose}>
          <span aria-hidden="true">x</span>
        </button>
      </header>
      <div class="st-drawer__body">
        {@render children?.()}
      </div>
      {#if footer}
        <footer class="st-drawer__footer">
          {@render footer()}
        </footer>
      {/if}
    </aside>
  </div>
{/if}

<style>
  .st-drawer__backdrop {
    background: var(--st-component-drawer-backdrop, var(--st-semantic-surface-overlay));
    inset: 0;
    position: fixed;
    z-index: var(--st-component-drawer-zIndex, 90);
  }

  .st-drawer {
    background: var(--st-component-drawer-surface, var(--st-semantic-surface-raised));
    border-color: var(--st-component-drawer-border, var(--st-semantic-border-subtle));
    box-shadow: var(--st-component-drawer-shadow, 0 18px 45px rgb(15 23 42 / 0.18));
    color: var(--st-semantic-text-primary);
    display: grid;
    grid-template-rows: auto 1fr auto;
    height: 100%;
    max-width: min(100vw, var(--st-component-drawer-width, 24rem));
    padding: var(--st-spacing-4, 1rem);
    position: absolute;
    top: 0;
    width: var(--st-component-drawer-width, 24rem);
  }

  .st-drawer--right {
    border-left-style: solid;
    border-left-width: 1px;
    right: 0;
  }

  .st-drawer--left {
    border-right-style: solid;
    border-right-width: 1px;
    left: 0;
  }

  .st-drawer__header {
    align-items: start;
    display: flex;
    gap: var(--st-spacing-4, 1rem);
    justify-content: space-between;
  }

  .st-drawer__title {
    font-size: 1.125rem;
    line-height: 1.3;
    margin: 0;
  }

  .st-drawer__description {
    color: var(--st-semantic-text-secondary);
    line-height: 1.5;
    margin: 0.5rem 0 0;
  }

  .st-drawer__close {
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

  .st-drawer__body {
    line-height: 1.5;
    overflow: auto;
    padding-block: var(--st-spacing-4, 1rem);
  }

  .st-drawer__footer {
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: flex-end;
  }
</style>

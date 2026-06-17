<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface ContextPanelProps {
    title?: string;
    subtitle?: string;
    label?: string;
    actions?: Snippet;
    footer?: Snippet;
    children?: Snippet;
    class?: string;
  }
</script>

<script lang="ts">
  let { title, subtitle, label, actions, footer, children, class: className }: ContextPanelProps = $props();
  const classes = $derived(["st-contextPanel", className].filter(Boolean).join(" "));
</script>

<aside class={classes} aria-label={label ?? title ?? "Context panel"}>
  {#if title || subtitle || actions}
    <header class="st-contextPanel__header">
      <div class="st-contextPanel__heading">
        {#if title}<h2 class="st-contextPanel__title">{title}</h2>{/if}
        {#if subtitle}<p class="st-contextPanel__subtitle">{subtitle}</p>{/if}
      </div>
      {#if actions}<div class="st-contextPanel__actions">{@render actions()}</div>{/if}
    </header>
  {/if}
  <div class="st-contextPanel__body">{@render children?.()}</div>
  {#if footer}<footer class="st-contextPanel__footer">{@render footer()}</footer>{/if}
</aside>

<style>
  .st-contextPanel {
    background: var(--st-component-contextPanel-surface, var(--st-semantic-surface-raised));
    color: var(--st-semantic-text-primary);
    display: grid;
    grid-template-rows: auto 1fr auto;
    block-size: 100%;
    min-block-size: 0;
  }

  .st-contextPanel__header,
  .st-contextPanel__footer {
    border-color: var(--st-component-contextPanel-border, var(--st-semantic-border-subtle));
    padding: var(--st-spacing-4, 1rem);
  }

  .st-contextPanel__header {
    align-items: start;
    border-block-end-style: solid;
    border-block-end-width: 1px;
    display: flex;
    gap: var(--st-spacing-3, 0.75rem);
    justify-content: space-between;
  }

  .st-contextPanel__footer {
    border-block-start-style: solid;
    border-block-start-width: 1px;
  }

  .st-contextPanel__title,
  .st-contextPanel__subtitle {
    margin: 0;
  }

  .st-contextPanel__title {
    font-size: 1rem;
    line-height: 1.3;
  }

  .st-contextPanel__subtitle {
    color: var(--st-semantic-text-secondary);
    font-size: 0.8125rem;
    line-height: 1.4;
    margin-block-start: var(--st-spacing-1, 0.25rem);
  }

  .st-contextPanel__body {
    min-block-size: 0;
    overflow: auto;
    padding: var(--st-spacing-4, 1rem);
  }
</style>

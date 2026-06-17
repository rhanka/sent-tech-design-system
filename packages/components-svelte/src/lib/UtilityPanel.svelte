<script lang="ts" module>
  import type { Snippet } from "svelte";

  export type UtilityPanelMode = "reserve" | "overlay" | "floating";
  export type UtilityPanelSide = "left" | "right" | "bottom";

  export interface UtilityPanelProps {
    mode?: UtilityPanelMode;
    side?: UtilityPanelSide;
    title?: string;
    label?: string;
    collapsed?: boolean;
    header?: Snippet;
    footer?: Snippet;
    children?: Snippet;
    class?: string;
  }
</script>

<script lang="ts">
  let {
    mode = "reserve",
    side = "right",
    title,
    label,
    collapsed = false,
    header,
    footer,
    children,
    class: className
  }: UtilityPanelProps = $props();

  const classes = $derived(["st-utilityPanel", `st-utilityPanel--${mode}`, `st-utilityPanel--${side}`, collapsed && "st-utilityPanel--collapsed", className].filter(Boolean).join(" "));
</script>

<aside class={classes} aria-label={label ?? title ?? "Utility panel"} data-mode={mode} data-side={side}>
  {#if header || title}
    <header class="st-utilityPanel__header">
      {#if header}{@render header()}{:else}<h2 class="st-utilityPanel__title">{title}</h2>{/if}
    </header>
  {/if}
  {#if !collapsed}
    <div class="st-utilityPanel__body">{@render children?.()}</div>
    {#if footer}<footer class="st-utilityPanel__footer">{@render footer()}</footer>{/if}
  {/if}
</aside>

<style>
  .st-utilityPanel {
    background: var(--st-component-utilityPanel-surface, var(--st-semantic-surface-raised));
    color: var(--st-semantic-text-primary);
    display: grid;
    grid-template-rows: auto 1fr auto;
    block-size: 100%;
    min-block-size: 0;
  }

  .st-utilityPanel--floating,
  .st-utilityPanel--overlay {
    box-shadow: var(--st-component-utilityPanel-shadow, 0 18px 45px rgb(15 23 42 / 0.18));
  }

  .st-utilityPanel__header,
  .st-utilityPanel__footer {
    border-color: var(--st-component-utilityPanel-border, var(--st-semantic-border-subtle));
    padding: var(--st-spacing-4, 1rem);
  }

  .st-utilityPanel__header {
    border-block-end-style: solid;
    border-block-end-width: 1px;
  }

  .st-utilityPanel__footer {
    border-block-start-style: solid;
    border-block-start-width: 1px;
  }

  .st-utilityPanel__title {
    font-size: 1rem;
    line-height: 1.3;
    margin: 0;
  }

  .st-utilityPanel__body {
    min-block-size: 0;
    overflow: auto;
  }
</style>

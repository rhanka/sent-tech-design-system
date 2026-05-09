<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type PopoverProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    open?: boolean;
    label: string;
    placement?: "top" | "right" | "bottom" | "left";
    class?: string;
    trigger?: Snippet;
    children?: Snippet;
  };

  let {
    open = false,
    label,
    placement = "bottom",
    class: className,
    trigger,
    children,
    ...rest
  }: PopoverProps = $props();

  const classes = () =>
    ["st-popover", `st-popover--${placement}`, className].filter(Boolean).join(" ");
</script>

<span class="st-popover-host">
  {@render trigger?.()}
  {#if open}
    <section {...rest} class={classes()} role="dialog" aria-label={label}>
      {@render children?.()}
    </section>
  {/if}
</span>

<style>
  .st-popover-host {
    display: inline-block;
    position: relative;
  }

  .st-popover {
    background: var(--st-component-popover-background, var(--st-semantic-surface-raised));
    border: 1px solid var(--st-component-popover-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-popover-radius, 0.5rem);
    box-shadow: var(--st-component-popover-shadow, 0 18px 45px rgb(15 23 42 / 0.18));
    color: var(--st-component-popover-text, var(--st-semantic-text-primary));
    min-width: 16rem;
    padding: var(--st-spacing-4, 1rem);
    position: absolute;
    z-index: var(--st-component-popover-zIndex, 80);
  }

  .st-popover--bottom {
    left: 0;
    top: calc(100% + var(--st-spacing-2, 0.5rem));
  }

  .st-popover--top {
    bottom: calc(100% + var(--st-spacing-2, 0.5rem));
    left: 0;
  }

  .st-popover--right {
    left: calc(100% + var(--st-spacing-2, 0.5rem));
    top: 0;
  }

  .st-popover--left {
    right: calc(100% + var(--st-spacing-2, 0.5rem));
    top: 0;
  }
</style>

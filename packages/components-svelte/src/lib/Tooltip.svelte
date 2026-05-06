<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type TooltipProps = Omit<HTMLAttributes<HTMLSpanElement>, "class"> & {
    content: string;
    placement?: "top" | "bottom";
    class?: string;
    children?: Snippet;
  };

  let { content, placement = "top", class: className, children, ...rest }: TooltipProps = $props();
  const classes = () => ["st-tooltip", `st-tooltip--${placement}`, className].filter(Boolean).join(" ");
</script>

<span {...rest} class={classes()}>
  <span class="st-tooltip__trigger">
    {@render children?.()}
  </span>
  <span class="st-tooltip__content" role="tooltip">{content}</span>
</span>

<style>
  .st-tooltip {
    display: inline-flex;
    position: relative;
  }

  .st-tooltip__trigger {
    display: inline-flex;
  }

  .st-tooltip__content {
    background: var(--st-component-tooltip-background, var(--st-semantic-surface-inverse));
    border-radius: var(--st-component-tooltip-radius, 0.375rem);
    box-shadow: var(--st-component-tooltip-shadow, 0 8px 24px rgb(15 23 42 / 0.12));
    color: var(--st-component-tooltip-text, var(--st-semantic-text-inverse));
    font-size: 0.8125rem;
    line-height: 1.4;
    max-width: 16rem;
    opacity: 0;
    padding: 0.375rem 0.5rem;
    pointer-events: none;
    position: absolute;
    transition: opacity var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: max-content;
    z-index: var(--st-component-tooltip-zIndex, 80);
  }

  .st-tooltip--top .st-tooltip__content {
    bottom: calc(100% + 0.5rem);
    left: 50%;
    transform: translateX(-50%);
  }

  .st-tooltip--bottom .st-tooltip__content {
    left: 50%;
    top: calc(100% + 0.5rem);
    transform: translateX(-50%);
  }

  .st-tooltip:hover .st-tooltip__content,
  .st-tooltip:focus-within .st-tooltip__content {
    opacity: 1;
  }
</style>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type CardProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    interactive?: boolean;
    class?: string;
    children?: Snippet;
  };

  let { interactive = false, class: className, children, ...rest }: CardProps = $props();

  const classes = () =>
    ["st-card", interactive && "st-card--interactive", className].filter(Boolean).join(" ");
</script>

<section {...rest} class={classes()}>
  {@render children?.()}
</section>

<style>
  .st-card {
    background: var(--st-component-card-background, var(--st-semantic-surface-raised));
    border: 1px solid var(--st-component-card-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-card-radius, 0.5rem);
    box-shadow: var(--st-component-card-shadow, 0 1px 2px rgb(15 23 42 / 0.08));
    color: var(--st-semantic-text-primary);
    padding: var(--st-spacing-4, 1rem);
  }

  .st-card--interactive {
    cursor: pointer;
    transition:
      box-shadow var(--st-motion-normal, 180ms) var(--st-motion-easing, ease),
      transform var(--st-motion-normal, 180ms) var(--st-motion-easing, ease);
  }

  .st-card--interactive:hover {
    box-shadow: var(--st-shadow-medium, 0 8px 24px rgb(15 23 42 / 0.12));
    transform: translateY(-1px);
  }
</style>

<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

  export type ContainerProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    size?: ContainerSize;
    /** Apply horizontal padding using the spacing scale. */
    padding?: boolean;
    as?: string;
    class?: string;
    children?: Snippet;
  };
</script>

<script lang="ts">
  let {
    size = "lg",
    padding = true,
    as = "div",
    class: className,
    children,
    ...rest
  }: ContainerProps = $props();

  const classes = $derived(
    [
      "st-container",
      `st-container--${size}`,
      padding && "st-container--padded",
      className
    ]
      .filter(Boolean)
      .join(" ")
  );
</script>

<svelte:element this={as} {...rest} class={classes}>
  {@render children?.()}
</svelte:element>

<style>
  .st-container {
    box-sizing: border-box;
    inline-size: 100%;
    margin-inline: auto;
  }

  .st-container--sm {
    max-inline-size: var(--st-container-sm, 40rem);
  }

  .st-container--md {
    max-inline-size: var(--st-container-md, 48rem);
  }

  .st-container--lg {
    max-inline-size: var(--st-container-lg, 64rem);
  }

  .st-container--xl {
    max-inline-size: var(--st-container-xl, 80rem);
  }

  .st-container--full {
    max-inline-size: none;
  }

  .st-container--padded {
    padding-inline: var(--st-spacing-4, 1rem);
  }
</style>

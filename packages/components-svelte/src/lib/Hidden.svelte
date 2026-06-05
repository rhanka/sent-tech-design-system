<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export type HiddenBreakpoint = "sm" | "md" | "lg" | "xl";

  export type HiddenProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    /** Hide when viewport is narrower than this breakpoint. */
    below?: HiddenBreakpoint;
    /** Hide when viewport is at or wider than this breakpoint. */
    above?: HiddenBreakpoint;
    as?: string;
    class?: string;
    children?: Snippet;
  };
</script>

<script lang="ts">
  let {
    below,
    above,
    as = "div",
    class: className,
    children,
    ...rest
  }: HiddenProps = $props();

  const classes = $derived(
    [
      "st-hidden",
      below && `st-hidden--below-${below}`,
      above && `st-hidden--above-${above}`,
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
  .st-hidden {
    display: contents;
  }

  /* Breakpoints: sm 640 / md 768 / lg 1024 / xl 1280. */

  /* below: hidden when viewport < breakpoint */
  @media (max-width: 639.98px) {
    .st-hidden--below-sm {
      display: none !important;
    }
  }
  @media (max-width: 767.98px) {
    .st-hidden--below-md {
      display: none !important;
    }
  }
  @media (max-width: 1023.98px) {
    .st-hidden--below-lg {
      display: none !important;
    }
  }
  @media (max-width: 1279.98px) {
    .st-hidden--below-xl {
      display: none !important;
    }
  }

  /* above: hidden when viewport >= breakpoint */
  @media (min-width: 640px) {
    .st-hidden--above-sm {
      display: none !important;
    }
  }
  @media (min-width: 768px) {
    .st-hidden--above-md {
      display: none !important;
    }
  }
  @media (min-width: 1024px) {
    .st-hidden--above-lg {
      display: none !important;
    }
  }
  @media (min-width: 1280px) {
    .st-hidden--above-xl {
      display: none !important;
    }
  }
</style>

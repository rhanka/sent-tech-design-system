<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { FlexAlign, FlexJustify } from "./Flex.svelte";

  export type RowProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    /** Spacing scale step (0..12) used for the column gutter. */
    gutter?: number;
    align?: FlexAlign;
    justify?: FlexJustify;
    wrap?: boolean;
    as?: string;
    class?: string;
    children?: Snippet;
  };
</script>

<script lang="ts">
  import { spacingToken, alignValue, justifyValue } from "./Flex.svelte";

  let {
    gutter = 4,
    align,
    justify,
    wrap = true,
    as = "div",
    class: className,
    children,
    ...rest
  }: RowProps = $props();

  const classes = $derived(["st-row", className].filter(Boolean).join(" "));
  const gap = $derived(spacingToken(gutter) ?? "0");
</script>

<svelte:element
  this={as}
  {...rest}
  class={classes}
  style:flex-wrap={wrap ? "wrap" : "nowrap"}
  style:align-items={alignValue(align)}
  style:justify-content={justifyValue(justify)}
  style:gap={gap}
  style:--st-row-gutter={gap}
>
  {@render children?.()}
</svelte:element>

<style>
  .st-row {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    inline-size: 100%;
    min-width: 0;
  }
</style>

<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { spacingToken } from "./Flex.svelte";

  export type GridProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    /** Number of equal columns: `repeat(columns, minmax(0, 1fr))`. */
    columns?: number;
    /**
     * Responsive auto mode: `repeat(auto-fill, minmax(minItemWidth, 1fr))`.
     * Takes priority over `columns` when provided.
     */
    minItemWidth?: string;
    /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
    gap?: number;
    as?: string;
    class?: string;
    children?: Snippet;
  };

  /** Resolve the `grid-template-columns` value. `minItemWidth` (responsive
      auto-fill) wins over a fixed column count. */
  export function gridTemplateColumns(
    columns: number | undefined,
    minItemWidth: string | undefined
  ): string | undefined {
    if (minItemWidth != null && minItemWidth !== "") {
      return `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`;
    }
    if (columns != null) {
      const clamped = Math.max(1, Math.round(columns));
      return `repeat(${clamped}, minmax(0, 1fr))`;
    }
    return undefined;
  }
</script>

<script lang="ts">
  let {
    columns,
    minItemWidth,
    gap,
    as = "div",
    class: className,
    children,
    ...rest
  }: GridProps = $props();

  const classes = $derived(["st-grid", className].filter(Boolean).join(" "));
  const templateColumns = $derived(gridTemplateColumns(columns, minItemWidth));
</script>

<svelte:element
  this={as}
  {...rest}
  class={classes}
  style:display="grid"
  style:grid-template-columns={templateColumns}
  style:gap={spacingToken(gap)}
>
  {@render children?.()}
</svelte:element>

<style>
  .st-grid {
    box-sizing: border-box;
    min-width: 0;
  }
</style>

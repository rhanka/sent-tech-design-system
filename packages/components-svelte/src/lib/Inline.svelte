<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { FlexAlign, FlexJustify } from "./Flex.svelte";

  export type InlineProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
    gap?: number;
    align?: FlexAlign;
    justify?: FlexJustify;
    wrap?: boolean;
    as?: string;
    class?: string;
    children?: Snippet;
  };
</script>

<script lang="ts">
  import Flex from "./Flex.svelte";

  let {
    gap,
    align,
    justify,
    wrap = true,
    as = "div",
    class: className,
    children,
    ...rest
  }: InlineProps = $props();

  const classes = $derived(["st-inline", className].filter(Boolean).join(" "));
</script>

<Flex {...rest} {as} {gap} {align} {justify} {wrap} direction="row" class={classes}>
  {@render children?.()}
</Flex>

<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { FlexAlign, FlexJustify } from "./Flex.svelte";

  export type StackProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
    gap?: number;
    align?: FlexAlign;
    justify?: FlexJustify;
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
    as = "div",
    class: className,
    children,
    ...rest
  }: StackProps = $props();

  const classes = $derived(["st-stack", className].filter(Boolean).join(" "));
</script>

<Flex {...rest} {as} {gap} {align} {justify} direction="column" class={classes}>
  {@render children?.()}
</Flex>

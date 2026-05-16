<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type AspectRatioProps = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    ratio?: string;
    class?: string;
    children?: Snippet;
  };

  let {
    ratio = "16/9",
    class: className,
    children,
    ...rest
  }: AspectRatioProps = $props();

  const classes = () => ["st-aspectRatio", className].filter(Boolean).join(" ");
</script>

<div {...rest} class={classes()} style:aspect-ratio={ratio}>
  {@render children?.()}
</div>

<style>
  .st-aspectRatio {
    display: block;
    overflow: hidden;
    position: relative;
    width: 100%;
  }

  .st-aspectRatio > :global(*) {
    block-size: 100%;
    inline-size: 100%;
  }

  .st-aspectRatio > :global(img),
  .st-aspectRatio > :global(video),
  .st-aspectRatio > :global(iframe) {
    display: block;
    object-fit: cover;
  }
</style>

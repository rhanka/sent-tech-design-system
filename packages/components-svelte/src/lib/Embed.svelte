<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import AspectRatio from "./AspectRatio.svelte";

  type EmbedProps = Omit<HTMLAttributes<HTMLDivElement>, "class" | "title"> & {
    /** URL of the embedded document (required). */
    src: string;
    /**
     * Accessible name of the frame (required for a11y — every iframe must carry
     * a meaningful `title`).
     */
    title: string;
    /**
     * `sandbox` token list. Defaults to `""` for the strictest sandbox. Pass
     * your own token list to relax it deliberately.
     */
    sandbox?: string;
    /** Aspect ratio of the frame container (CSS `aspect-ratio`). Default `16/9`. */
    aspectRatio?: string;
    /** `allow` permissions policy (e.g. `"fullscreen; picture-in-picture"`). */
    allow?: string;
    /** Iframe loading strategy. Default `lazy`; use `eager` for above-the-fold embeds. */
    loading?: "eager" | "lazy";
    class?: string;
  };

  let {
    src,
    title,
    sandbox = "",
    aspectRatio = "16/9",
    allow,
    loading = "lazy",
    class: className,
    ...rest
  }: EmbedProps = $props();

  const classes = () => ["st-embed", className].filter(Boolean).join(" ");
</script>

<div {...rest} class={classes()}>
  <AspectRatio ratio={aspectRatio}>
    <iframe
      class="st-embed__frame"
      {src}
      {title}
      {sandbox}
      {allow}
      {loading}
    ></iframe>
  </AspectRatio>
</div>

<style>
  .st-embed {
    display: block;
    width: 100%;
  }

  .st-embed :global(.st-aspectRatio) {
    background: var(--st-semantic-surface-subtle);
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-md, 0.375rem);
    overflow: hidden;
  }

  .st-embed__frame {
    block-size: 100%;
    border: 0;
    display: block;
    inline-size: 100%;
  }
</style>

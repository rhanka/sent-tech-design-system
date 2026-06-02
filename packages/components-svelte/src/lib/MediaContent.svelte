<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type MediaKind = "image" | "video";

  type MediaContentProps = Omit<HTMLAttributes<HTMLElement>, "children" | "class"> & {
    title?: string;
    caption?: string;
    byline?: string;
    media?: string;
    mediaAlt?: string;
    mediaKind?: MediaKind;
    mediaControls?: boolean;
    aspectRatio?: string;
    mediaCaptions?: string;
    mediaCaptionsLabel?: string;
    mediaCaptionsLang?: string;
    class?: string;
    children?: Snippet;
  };

  let {
    title,
    caption,
    byline,
    media,
    mediaAlt = "",
    mediaKind = "image",
    mediaControls = true,
    aspectRatio = "16/9",
    mediaCaptions,
    mediaCaptionsLabel = "Français",
    mediaCaptionsLang = "fr",
    class: className,
    children,
    ...rest
  }: MediaContentProps = $props();

  const defaultCaptions = "data:text/vtt,WEBVTT";

  const hasMedia = () => Boolean(media?.trim());
  const classes = () => ["st-mediaContent", className].filter(Boolean).join(" ");
</script>

<figure class={classes()} {...rest}>
  <div class="st-mediaContent__media" style={`--st-mediaContent-ratio:${aspectRatio}`}>
    {#if hasMedia()}
      {#if mediaKind === "video"}
        <video controls={mediaControls} src={media} aria-label={title || "Contenu média"} preload="metadata">
          <track
            kind="captions"
            src={mediaCaptions ?? defaultCaptions}
            srclang={mediaCaptionsLang}
            label={mediaCaptionsLabel}
            default
          />
        </video>
      {:else}
        <img src={media} alt={mediaAlt} loading="lazy" decoding="async" />
      {/if}
    {:else}
      {@render children?.()}
    {/if}
  </div>

  {#if title || caption || byline}
    <figcaption class="st-mediaContent__caption">
      {#if title}
        <p class="st-mediaContent__title">{title}</p>
      {/if}
      {#if caption}
        <p>{caption}</p>
      {/if}
      {#if byline}
        <p class="st-mediaContent__byline">{byline}</p>
      {/if}
    </figcaption>
  {/if}
</figure>

<style>
  .st-mediaContent {
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: 0.5rem;
    margin: 0;
    overflow: hidden;
  }

  .st-mediaContent__media {
    aspect-ratio: var(--st-mediaContent-ratio);
    background: var(--st-semantic-surface-subtle);
    overflow: hidden;
  }

  .st-mediaContent__media > :global(img),
  .st-mediaContent__media > :global(video) {
    block-size: 100%;
    inline-size: 100%;
    object-fit: cover;
    display: block;
  }

  .st-mediaContent__caption {
    background: var(--st-semantic-surface-primary);
    color: var(--st-semantic-text-primary);
    font-size: 0.875rem;
    padding: 0.6rem 0.75rem;
  }

  .st-mediaContent__title {
    color: var(--st-semantic-text-primary);
    font-weight: 600;
    margin: 0;
  }

  .st-mediaContent__caption p {
    margin: 0.25rem 0 0;
  }

  .st-mediaContent__byline {
    color: var(--st-semantic-text-secondary);
  }
</style>

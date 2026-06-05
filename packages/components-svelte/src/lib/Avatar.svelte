<script lang="ts" module>
  export type AvatarSize = "sm" | "md" | "lg" | "xl";
  export type AvatarShape = "circle" | "square";
  export type AvatarTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { deriveInitials } from "./Header.svelte";

  type AvatarProps = Omit<HTMLAttributes<HTMLSpanElement>, "class"> & {
    /** Nom complet, utilisé pour dériver les initiales et l'étiquette a11y. */
    name: string;
    /** URL de la photo. Si absente, on rend un cercle d'initiales. */
    src?: string;
    /** Texte alternatif de l'image. Par défaut = `name`. */
    alt?: string;
    size?: AvatarSize;
    shape?: AvatarShape;
    /** Catégorie de couleur pour le fond des initiales. */
    tone?: AvatarTone;
    class?: string;
  };

  let {
    name,
    src,
    alt,
    size = "md",
    shape = "circle",
    tone = "category1",
    class: className,
    ...rest
  }: AvatarProps = $props();

  const initials = $derived(deriveInitials(name));

  const classes = $derived(
    [
      "st-avatar",
      `st-avatar--${size}`,
      `st-avatar--${shape}`,
      src ? "st-avatar--image" : `st-avatar--${tone}`,
      className
    ]
      .filter(Boolean)
      .join(" ")
  );
</script>

<span {...rest} class={classes} role="img" aria-label={alt ?? name}>
  {#if src}
    <img class="st-avatar__image" {src} alt={alt ?? name} />
  {:else}
    <span class="st-avatar__initials" aria-hidden="true">{initials}</span>
  {/if}
</span>

<style>
  .st-avatar {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    justify-content: center;
    overflow: hidden;
    user-select: none;
    vertical-align: middle;
  }

  .st-avatar--circle {
    border-radius: 50%;
  }

  .st-avatar--square {
    border-radius: var(--st-radius-sm, 0.375rem);
  }

  .st-avatar--sm {
    font-size: 0.6875rem;
    height: 1.5rem;
    width: 1.5rem;
  }

  .st-avatar--md {
    font-size: 0.8125rem;
    height: 2rem;
    width: 2rem;
  }

  .st-avatar--lg {
    font-size: 1rem;
    height: 2.5rem;
    width: 2.5rem;
  }

  .st-avatar--xl {
    font-size: 1.25rem;
    height: 3.5rem;
    width: 3.5rem;
  }

  .st-avatar__image {
    display: block;
    height: 100%;
    object-fit: cover;
    object-position: center;
    width: 100%;
  }

  .st-avatar__initials {
    font-weight: 700;
    letter-spacing: 0.01em;
    line-height: 1;
  }

  /* Tone = catégorie : fond teinté, texte coloré (sur le même hue). */
  .st-avatar--category1 {
    background: color-mix(in srgb, var(--st-semantic-data-category1) 16%, white);
    color: var(--st-semantic-data-category1);
  }
  .st-avatar--category2 {
    background: color-mix(in srgb, var(--st-semantic-data-category2) 16%, white);
    color: var(--st-semantic-data-category2);
  }
  .st-avatar--category3 {
    background: color-mix(in srgb, var(--st-semantic-data-category3) 16%, white);
    color: var(--st-semantic-data-category3);
  }
  .st-avatar--category4 {
    background: color-mix(in srgb, var(--st-semantic-data-category4) 16%, white);
    color: var(--st-semantic-data-category4);
  }
  .st-avatar--category5 {
    background: color-mix(in srgb, var(--st-semantic-data-category5) 16%, white);
    color: var(--st-semantic-data-category5);
  }
  .st-avatar--category6 {
    background: color-mix(in srgb, var(--st-semantic-data-category6) 16%, white);
    color: var(--st-semantic-data-category6);
  }
  .st-avatar--category7 {
    background: color-mix(in srgb, var(--st-semantic-data-category7) 16%, white);
    color: var(--st-semantic-data-category7);
  }
  .st-avatar--category8 {
    background: color-mix(in srgb, var(--st-semantic-data-category8) 16%, white);
    color: var(--st-semantic-data-category8);
  }

  .st-avatar--image {
    background: var(--st-semantic-surface-subtle, #eef2f7);
  }
</style>

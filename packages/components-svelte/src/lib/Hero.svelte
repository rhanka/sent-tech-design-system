<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { ContainerSize } from "./Container.svelte";

  /** `full` : bandeau d'accueil plein écran (min 100vh, dégagement du header fixe).
   *  `compact` : bandeau d'en-tête de page (article de blog, 404). */
  export type HeroSize = "full" | "compact";
  export type HeroAlign = "center" | "start";

  export type HeroProps = Omit<HTMLAttributes<HTMLElement>, "class" | "title"> & {
    size?: HeroSize;
    /** Image de fond plein bord (URL). Décorative : rendue en `<img alt="">`. */
    image?: string;
    /** Voile dégradé tokenisé au-dessus de l'image. Défaut `true`. */
    overlay?: boolean;
    /** Titre (h1 par défaut). */
    title?: string;
    /** Niveau du titre. Défaut 1. */
    headingLevel?: 1 | 2;
    /** Sous-titre sous le titre. */
    subtitle?: string;
    /** Alignement du texte. Défaut `center` (full) / `start` (compact). */
    align?: HeroAlign;
    /** Largeur du bloc titre/sous-titre/actions. Défaut `lg`. */
    width?: ContainerSize;
    /** Largeur du contenu `children` (grille de cartes…). Défaut `xl`. */
    contentWidth?: ContainerSize;
    /** Indicateur de défilement (souris) en bas du bandeau. Défaut `false`. */
    scrollCue?: boolean;
    /** Cible du défilement (ex. `#services`). Présente ⇒ l'indicateur est un lien. */
    scrollCueHref?: string;
    /** Nom accessible de l'indicateur quand c'est un lien. */
    scrollCueLabel?: string;
    /** Contenu AU-DESSUS du titre (lien retour, surtitre). */
    leading?: Snippet;
    /** Rangée d'actions sous le sous-titre (boutons). */
    actions?: Snippet;
    /** Contenu sous le bloc titre (grille de cartes, méta d'article…). */
    children?: Snippet;
    as?: string;
    class?: string;
  };
</script>

<script lang="ts">
  // Hero — bandeau marketing plein bord : image de fond + voile dégradé (token),
  // contenu centré (titre / sous-titre / actions / children), indicateur de
  // défilement optionnel. Compose Container pour la largeur de ligne. Style
  // token-only : chaque --st-component-hero-* retombe sur un sémantique de base.
  import Container from "./Container.svelte";

  let {
    size = "full",
    image,
    overlay = true,
    title,
    headingLevel = 1,
    subtitle,
    align,
    width = "lg",
    contentWidth = "xl",
    scrollCue = false,
    scrollCueHref,
    scrollCueLabel = "Faire défiler",
    leading,
    actions,
    children,
    as = "section",
    class: className,
    ...rest
  }: HeroProps = $props();

  const resolvedAlign = $derived(align ?? (size === "compact" ? "start" : "center"));
  const classes = $derived(
    ["st-hero", `st-hero--${size}`, `st-hero--align-${resolvedAlign}`, className].filter(Boolean).join(" ")
  );
  const headingTag = $derived(headingLevel === 2 ? "h2" : "h1");
  const hasIntro = $derived(Boolean(leading || title || subtitle || actions));
</script>

<svelte:element this={as} {...rest} class={classes}>
  <div class="st-hero__backdrop" aria-hidden="true">
    {#if image}
      <img
        class="st-hero__image"
        src={image}
        alt=""
        decoding="async"
        fetchpriority={size === "full" ? "high" : undefined}
      />
    {/if}
    {#if overlay}<div class="st-hero__overlay"></div>{/if}
  </div>

  <div class="st-hero__inner">
    {#if hasIntro}
      <Container size={width}>
        <div class="st-hero__intro">
          {#if leading}<div class="st-hero__leading">{@render leading()}</div>{/if}
          {#if title}
            <svelte:element this={headingTag} class="st-hero__title">{title}</svelte:element>
          {/if}
          {#if subtitle}<p class="st-hero__subtitle">{subtitle}</p>{/if}
          {#if actions}<div class="st-hero__actions">{@render actions()}</div>{/if}
        </div>
      </Container>
    {/if}
    {#if children}
      <Container size={contentWidth}>
        <div class="st-hero__content">{@render children()}</div>
      </Container>
    {/if}
  </div>

  {#if scrollCue}
    {#if scrollCueHref}
      <a class="st-hero__scrollCue" href={scrollCueHref} aria-label={scrollCueLabel}>
        <span class="st-hero__scrollCueWheel" aria-hidden="true"></span>
      </a>
    {:else}
      <span class="st-hero__scrollCue" aria-hidden="true">
        <span class="st-hero__scrollCueWheel"></span>
      </span>
    {/if}
  {/if}
</svelte:element>

<style>
  .st-hero {
    background: var(--st-component-hero-background, var(--st-semantic-surface-inverse, #0f172a));
    box-sizing: border-box;
    color: var(--st-component-hero-text, var(--st-semantic-text-inverse, #ffffff));
    isolation: isolate;
    overflow: hidden;
    position: relative;
    width: 100%;
  }

  .st-hero--full {
    align-items: center;
    display: flex;
    justify-content: center;
    min-block-size: var(--st-component-hero-fullMinHeight, 100vh);
    padding-block: var(--st-component-hero-fullPaddingTop, 5rem)
      var(--st-component-hero-fullPaddingBottom, 4rem);
  }

  .st-hero--compact {
    padding-block: var(--st-component-hero-compactPaddingTop, 7rem)
      var(--st-component-hero-compactPaddingBottom, 4rem);
  }

  .st-hero__backdrop {
    inset: 0;
    position: absolute;
    z-index: 0;
  }

  .st-hero__image {
    block-size: 100%;
    display: block;
    inline-size: 100%;
    object-fit: cover;
    object-position: center;
  }

  .st-hero__overlay {
    background: var(
      --st-component-hero-overlay,
      var(
        --st-semantic-gradient-hero,
        linear-gradient(135deg, var(--st-semantic-action-primary, #1d4ed8), var(--st-semantic-surface-inverse, #0f172a))
      )
    );
    inset: 0;
    opacity: var(--st-component-hero-overlayOpacity, 0.9);
    position: absolute;
  }

  .st-hero__inner {
    display: flex;
    flex-direction: column;
    gap: var(--st-component-hero-gap, 3rem);
    position: relative;
    width: 100%;
    z-index: 1;
  }

  .st-hero__intro {
    /* A DS Link in the intro (back link, eyebrow) reads on the overlay: it
       takes the hero text colour instead of the theme link colour. */
    --st-component-link-text: currentColor;
    --st-component-link-hoverText: currentColor;
    --st-component-link-anatomy-states-hover-text: currentColor;
    display: flex;
    flex-direction: column;
  }

  .st-hero--align-center .st-hero__intro {
    align-items: center;
    text-align: center;
  }

  .st-hero--align-start .st-hero__intro {
    align-items: flex-start;
    text-align: start;
  }

  .st-hero__leading {
    margin-block-end: var(--st-spacing-8, 2rem);
  }

  .st-hero__title {
    color: inherit;
    font-family: var(--st-font-display, var(--st-font-sans, inherit));
    font-size: var(--st-component-hero-titleSize, clamp(2.25rem, 1.2rem + 3.6vw, 3.75rem));
    font-weight: var(--st-component-hero-titleWeight, 700);
    letter-spacing: -0.01em;
    line-height: 1.1;
    margin: 0 0 var(--st-spacing-6, 1.5rem);
  }

  .st-hero--compact .st-hero__title {
    font-size: var(--st-component-hero-compactTitleSize, clamp(2.25rem, 1.6rem + 2vw, 3rem));
  }

  .st-hero__subtitle {
    color: inherit;
    font-size: var(--st-component-hero-subtitleSize, clamp(1.125rem, 1rem + 0.4vw, 1.25rem));
    line-height: 1.6;
    margin: 0;
    max-inline-size: var(--st-component-hero-measure, 48rem);
    opacity: var(--st-component-hero-subtitleOpacity, 0.9);
  }

  .st-hero__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-4, 1rem);
    margin-block-start: var(--st-spacing-8, 2rem);
  }

  .st-hero--align-center .st-hero__actions {
    justify-content: center;
  }

  /* Indicateur « souris » : contour arrondi 1.5×2.5rem + molette. */
  .st-hero__scrollCue {
    align-items: flex-start;
    border: 2px solid color-mix(in srgb, currentColor 40%, transparent);
    border-radius: 999px;
    box-sizing: border-box;
    color: inherit;
    display: flex;
    block-size: 2.5rem;
    inline-size: 1.5rem;
    inset-block-end: var(--st-spacing-8, 2rem);
    inset-inline-start: 50%;
    justify-content: center;
    padding-block-start: var(--st-spacing-2, 0.5rem);
    position: absolute;
    transform: translateX(-50%);
    z-index: 1;
  }

  a.st-hero__scrollCue:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 4px;
  }

  .st-hero__scrollCueWheel {
    background: color-mix(in srgb, currentColor 40%, transparent);
    block-size: 0.75rem;
    border-radius: 999px;
    inline-size: 0.25rem;
  }
</style>

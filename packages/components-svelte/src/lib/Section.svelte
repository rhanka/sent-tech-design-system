<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { ContainerSize } from "./Container.svelte";

  /** Fond de bande : neutre, léger, inversé (texte clair), dégradé léger. */
  export type SectionTone = "default" | "subtle" | "inverse" | "gradient";
  /** Rythme vertical : `lg` ≈ py-24 (6rem), `md` ≈ py-20 (5rem), `sm` ≈ py-12 (3rem). */
  export type SectionSpacing = "sm" | "md" | "lg";
  export type SectionAlign = "center" | "start";

  export type SectionProps = Omit<HTMLAttributes<HTMLElement>, "class" | "title"> & {
    tone?: SectionTone;
    spacing?: SectionSpacing;
    /** Largeur du contenu (Container). Défaut `xl`. */
    width?: ContainerSize;
    /** Titre de section (h2 par défaut). */
    title?: string;
    /** Niveau du titre. Défaut 2. */
    headingLevel?: 2 | 3;
    /** Chapeau sous le titre, longueur de ligne bornée (≈ 48rem). */
    lead?: string;
    /** Alignement de l'en-tête. Défaut `center`. */
    align?: SectionAlign;
    children?: Snippet;
    as?: string;
    class?: string;
  };
</script>

<script lang="ts">
  // Section — BANDE pleine largeur d'une page marketing : fond tokenisé
  // (default/subtle/inverse/gradient), rythme vertical tokenisé, en-tête
  // optionnel (titre + chapeau à longueur de ligne lisible), contenu dans un
  // Container. Le fond est plein bord, le contenu est borné : c'est pourquoi la
  // bande est un composant distinct de Container (qui ne fait que borner).
  import Container from "./Container.svelte";

  let {
    tone = "default",
    spacing = "lg",
    width = "xl",
    title,
    headingLevel = 2,
    lead,
    align = "center",
    children,
    as = "section",
    class: className,
    ...rest
  }: SectionProps = $props();

  const classes = $derived(
    ["st-section", `st-section--${tone}`, `st-section--spacing-${spacing}`, className].filter(Boolean).join(" ")
  );
  const headingTag = $derived(headingLevel === 3 ? "h3" : "h2");
</script>

<svelte:element this={as} {...rest} class={classes}>
  <Container size={width}>
    {#if title || lead}
      <header class="st-section__header st-section__header--{align}">
        {#if title}
          <svelte:element this={headingTag} class="st-section__title">{title}</svelte:element>
        {/if}
        {#if lead}<p class="st-section__lead">{lead}</p>{/if}
      </header>
    {/if}
    {@render children?.()}
  </Container>
</svelte:element>

<style>
  .st-section {
    background: var(--st-component-section-background, var(--st-semantic-surface-default, #ffffff));
    box-sizing: border-box;
    color: var(--st-semantic-text-primary, #0f172a);
    padding-block: var(--st-component-section-paddingBlock, 6rem);
    /* Ancre sous un header fixe (#services…) sans masquer le titre. */
    scroll-margin-top: var(--st-component-section-scrollMargin, 5rem);
    width: 100%;
  }

  .st-section--spacing-md {
    padding-block: var(--st-component-section-paddingBlockMd, 5rem);
  }

  .st-section--spacing-sm {
    padding-block: var(--st-component-section-paddingBlockSm, 3rem);
  }

  .st-section--subtle {
    background: var(--st-component-section-subtleBackground, var(--st-semantic-surface-subtle, #f8fafc));
  }

  .st-section--gradient {
    background: var(
      --st-component-section-gradientBackground,
      var(
        --st-semantic-gradient-subtle,
        linear-gradient(
          135deg,
          color-mix(in srgb, var(--st-semantic-action-primary, #1d4ed8) 5%, transparent),
          color-mix(in srgb, var(--st-semantic-border-interactive, #1d4ed8) 5%, transparent)
        )
      )
    );
  }

  .st-section--inverse {
    background: var(--st-component-section-inverseBackground, var(--st-semantic-surface-inverse, #0f172a));
    color: var(--st-component-section-inverseText, var(--st-semantic-text-inverse, #ffffff));
  }

  .st-section__header {
    display: flex;
    flex-direction: column;
    margin-block-end: var(--st-component-section-headerGap, 4rem);
  }

  .st-section__header--center {
    align-items: center;
    text-align: center;
  }

  .st-section__header--start {
    align-items: flex-start;
    text-align: start;
  }

  .st-section__title {
    color: inherit;
    font-family: var(--st-font-display, var(--st-font-sans, inherit));
    font-size: var(--st-component-section-titleSize, clamp(2.25rem, 1.8rem + 1.5vw, 3rem));
    font-weight: var(--st-component-section-titleWeight, 700);
    letter-spacing: -0.01em;
    line-height: 1.15;
    margin: 0 0 var(--st-spacing-4, 1rem);
  }

  .st-section__lead {
    color: var(--st-component-section-leadText, var(--st-semantic-text-muted, #64748b));
    font-size: var(--st-component-section-leadSize, 1.25rem);
    line-height: 1.6;
    margin: 0;
    max-inline-size: var(--st-component-section-measure, 48rem);
  }

  .st-section--inverse .st-section__lead {
    color: inherit;
    opacity: 0.9;
  }
</style>

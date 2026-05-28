<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  type SkipLinkProps = Omit<HTMLAnchorAttributes, "class" | "href"> & {
    /** Cible de l'ancre (id du contenu principal). */
    href?: string;
    class?: string;
    children?: Snippet;
  };

  let {
    href = "#main-content",
    class: className,
    children,
    ...rest
  }: SkipLinkProps = $props();

  const classes = () => ["st-skipLink", className].filter(Boolean).join(" ");
</script>

<a {...rest} class={classes()} {href}>
  {#if children}{@render children()}{:else}Aller au contenu principal{/if}
</a>

<style>
  /* Lien d'évitement : hors écran jusqu'au focus clavier (a11y, DSFR/WCAG). */
  .st-skipLink {
    background: var(--st-semantic-action-primary);
    border-radius: var(--st-radius-md, 0.375rem);
    color: var(--st-semantic-action-primaryText, #fff);
    font-size: 0.875rem;
    font-weight: 600;
    left: var(--st-spacing-2, 0.5rem);
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-4, 1rem);
    position: fixed;
    text-decoration: none;
    top: var(--st-spacing-2, 0.5rem);
    transform: translateY(-150%);
    transition: transform var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    z-index: var(--st-zindex-modal, 100);
  }

  .st-skipLink:focus,
  .st-skipLink:focus-visible {
    outline: 2px solid var(--st-semantic-border-interactive);
    outline-offset: 2px;
    transform: translateY(0);
  }
</style>

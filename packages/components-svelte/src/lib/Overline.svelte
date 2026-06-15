<script lang="ts" module>
  /** Balise rendue. `span`/`div` = inline/bloc neutre ; `h2`/`h3` quand l'overline
   * sert d'en-tête de région (sémantique de titre). */
  export type OverlineAs = "span" | "div" | "h2" | "h3";
</script>

<script lang="ts">
  // Overline — étiquette de section discrète en small-caps (les « DOCUMENTATION »,
  // « COMMUNITIES », « SIGNAUX », « DOCUMENTS SOURCES » des maquettes). Rôle :
  // libellé de groupe de niveau 0, muted, au-dessus d'un bloc. Style PROPRE
  // token-only : chaque token --st-component-overline-* retombe sur un littéral, de
  // sorte qu'un thème qui n'émet rien rend à l'identique. AUCUN hex en dur.
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type OverlineProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    /** Balise : `span` (défaut) inline, `div` bloc, `h2`/`h3` pour un en-tête de région. */
    as?: OverlineAs;
    class?: string;
    children?: Snippet;
  };

  let { as = "span", class: className, children, ...rest }: OverlineProps = $props();

  const classes = $derived(["st-overline", className].filter(Boolean).join(" "));
</script>

<svelte:element this={as} {...rest} class={classes}>
  {@render children?.()}
</svelte:element>

<style>
  /* P-C : anatomie overline par thème. Chaque var retombe sur le littéral de base,
     donc un thème sans `--st-component-overline-*` rend byte-identique. */
  .st-overline {
    color: var(--st-component-overline-color, var(--st-semantic-text-secondary, inherit));
    display: var(--st-component-overline-display, inline-block);
    font-family: inherit;
    font-size: var(--st-component-overline-fontSize, 0.6875rem);
    font-weight: var(--st-component-overline-fontWeight, 600);
    letter-spacing: var(--st-component-overline-letterSpacing, 0.04em);
    line-height: var(--st-component-overline-lineHeight, 1.3);
    margin: 0;
    text-transform: var(--st-component-overline-textTransform, uppercase);
  }
</style>

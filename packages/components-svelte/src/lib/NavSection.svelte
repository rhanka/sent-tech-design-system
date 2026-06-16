<script lang="ts" module>
  /** Niveau de titre porté par l'Overline d'en-tête de section. `h2`/`h3` quand la
   * section est une vraie région titrée d'un rail/drawer ; choisis selon la
   * profondeur du sommaire. */
  export type NavSectionHeadingLevel = "h2" | "h3";
</script>

<script lang="ts">
  // NavSection — EN-TÊTE DE GROUPE d'un rail / drawer (« COMMUNITIES »,
  // « SIGNAUX », « Pastilles », « Zonage / Potentiel », « DOCUMENTATION »).
  // Donne la hiérarchie typographique qui manque à une liste plate + un foyer
  // normé pour l'action locale (au lieu d'un bouton primaire planté dans la
  // liste). ZÉRO-ENTROPIE : on RÉUTILISE les primitives déjà livrées —
  //   • Overline  → le libellé small-caps muet (rendu en h2/h3 pour la
  //     sémantique de titre quand la section n'est PAS repliable) ;
  //   • Badge shape="circle" → le compteur de section en queue d'en-tête ;
  //   • Collapsible → le disclosure (trigger aria-expanded + région
  //     aria-labelledby) quand `collapsible`.
  // On ne réimplémente NI disclosure NI libellé. Style token-only scopé, aucun hex.
  import type { Snippet } from "svelte";
  import Badge from "./Badge.svelte";
  import Collapsible from "./Collapsible.svelte";
  import Overline from "./Overline.svelte";

  type NavSectionProps = {
    /** Libellé de la section, rendu via Overline (small-caps muet). */
    label: string;
    /** Compteur optionnel → Badge circle en queue de l'en-tête. */
    count?: number;
    /** Si true, l'en-tête devient le trigger d'un Collapsible (aria-expanded)
     * qui montre/cache le contenu. Sinon : groupe titré statique. */
    collapsible?: boolean;
    /** État d'ouverture quand `collapsible` (bindable). */
    open?: boolean;
    /** Niveau de titre de l'Overline quand la section n'est pas repliable. */
    as?: NavSectionHeadingLevel;
    /** Emplacement normé d'une action de section (ex. Button « + Ajouter »),
     * aligné à droite de l'en-tête. NON rendu quand `collapsible` (le trigger
     * occupe l'en-tête en entier — place l'action dans le contenu). */
    action?: Snippet;
    /** Contenu de la section (NavItem / NavList) — rendu dans la région. */
    children: Snippet;
    class?: string;
  };

  let {
    label,
    count,
    collapsible = false,
    open = $bindable(true),
    as = "h3",
    action,
    children,
    class: className
  }: NavSectionProps = $props();

  const uid = `st-navSection-${Math.random().toString(36).slice(2, 9)}`;

  const rootClasses = $derived(
    [
      "st-navSection",
      collapsible ? "st-navSection--collapsible" : "st-navSection--static",
      className
    ]
      .filter(Boolean)
      .join(" ")
  );

  const hasCount = $derived(typeof count === "number");
</script>

{#if collapsible}
  <!-- Repliable : l'en-tête EST le trigger du Collapsible. Le compteur passe par
       son slot `trailing` (entre le titre et le chevron) ; on annonce le tout aux
       lecteurs d'écran via aria-label. L'action de section n'a pas sa place dans
       un trigger (un bouton dans un bouton) : la documenter dans le contenu. -->
  <Collapsible
    bind:open
    title={label}
    aria-label={hasCount ? `${label}, ${count}` : label}
    class={rootClasses}
  >
    {#snippet trailing()}
      {#if hasCount}
        <Badge shape="circle" size="sm" aria-label={`${count} éléments`}>{count}</Badge>
      {/if}
    {/snippet}
    {@render children()}
  </Collapsible>
{:else}
  <!-- Statique : groupe titré par l'Overline (h2/h3). Le contenu est relié au
       titre via aria-labelledby — la liste devient une vraie région titrée. -->
  <section {...{ class: rootClasses }} role="group" aria-labelledby={`${uid}-label`}>
    <div class="st-navSection__header">
      <Overline {as} id={`${uid}-label`} class="st-navSection__label">
        {label}
        {#if hasCount}
          <Badge
            shape="circle"
            size="sm"
            class="st-navSection__count"
            aria-label={`${count} éléments`}>{count}</Badge>
        {/if}
      </Overline>
      {#if action}
        <span class="st-navSection__action">{@render action()}</span>
      {/if}
    </div>
    <div class="st-navSection__body">
      {@render children()}
    </div>
  </section>
{/if}

<style>
  /* Token-only scopé. L'en-tête statique aligne le libellé (small-caps via
     Overline), le compteur en queue, et pousse l'action de section à droite. */
  .st-navSection {
    inline-size: 100%;
  }

  .st-navSection__header {
    align-items: baseline;
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: space-between;
    padding-block: var(--st-component-navSection-headerPaddingBlock, 0.375rem);
  }

  /* Le libellé et son compteur forment un bloc ; le Badge circle s'aligne au
     centre vertical du texte small-caps. */
  .st-navSection :global(.st-navSection__label) {
    align-items: center;
    display: inline-flex;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-navSection :global(.st-navSection__count) {
    flex: 0 0 auto;
  }

  /* Foyer de l'action de section : ancré à droite, ne grandit pas. */
  .st-navSection__action {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
  }

  .st-navSection__body {
    display: block;
  }
</style>

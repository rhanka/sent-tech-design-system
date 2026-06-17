<script lang="ts" module>
  /** Variante de chrome du panneau de navigation.
   * - `rail`   : panneau latéral persistant (`<aside>` complementary) ;
   * - `drawer` : overlay — DÉLÈGUE au composant Drawer (rôle dialog + Escape + backdrop). */
  export type NavShellVariant = "rail" | "drawer";

  /** Côté d'ancrage quand `variant="drawer"` (transmis tel quel à Drawer). */
  export type NavShellSide = "left" | "right" | "bottom";
</script>

<script lang="ts">
  // NavShell — CHROME d'un rail / drawer de navigation (vague 3 du NavSystem).
  // Régions EXCLUSIVES pour que les produits ne mélangent plus nav + filtre +
  // action + détail dans une bouillie :
  //   • header   → titre (optionnel), flèche-retour maître→détail, sous-titre ;
  //   • search   → slot pleine largeur (le consommateur y met un Search fluid) ;
  //   • body     → corps SCROLLABLE (NavSection / NavList / NavTree) ;
  //   • footer   → zone d'actions (le consommateur y met un NavActionStack).
  // ZÉRO-ENTROPIE : en mode `drawer`, on ne réimplémente PAS l'overlay — on
  // RÉUTILISE le composant Drawer (open/side/title + dialog/Escape/backdrop) et
  // on lui passe le même header/search/body/footer via ses slots children/footer.
  // En mode `rail`, panneau persistant <aside> role=complementary.
  // Style token-only scopé, AUCUN hex.
  import type { Snippet } from "svelte";
  import Drawer from "./Drawer.svelte";

  type NavShellProps = {
    /** Chrome : panneau persistant (`rail`) ou overlay délégué à Drawer (`drawer`). */
    variant?: NavShellVariant;
    /** Titre du panneau, rendu dans le `<header>` (rail) ou via Drawer (drawer). */
    title?: string;
    /** Sous-titre muet sous le titre. */
    subtitle?: string;
    /** Affiche une flèche-retour dans l'en-tête (pattern maître→détail). */
    back?: boolean;
    /** Appelé au clic sur la flèche-retour. */
    onBack?: () => void;
    /** Libellé accessible de la flèche-retour. */
    backLabel?: string;
    /** Libellé accessible du panneau (aria-label de l'aside / du dialog). */
    label?: string;
    /** Slot de recherche rendu PLEINE LARGEUR (ex. Search fluid). */
    search?: Snippet;
    /** Zone d'actions en pied (ex. NavActionStack). */
    footer?: Snippet;
    /** Corps scrollable (NavSection / NavList / NavTree). */
    children: Snippet;
    /** Ouverture du tiroir quand `variant="drawer"` (bindable). */
    open?: boolean;
    /** Côté d'ancrage du tiroir quand `variant="drawer"`. */
    side?: NavShellSide;
    class?: string;
  };

  let {
    variant = "rail",
    title,
    subtitle,
    back = false,
    onBack,
    backLabel = "Retour",
    label,
    search,
    footer,
    children,
    open = $bindable(false),
    side = "left",
    class: className
  }: NavShellProps = $props();

  const rootClasses = $derived(
    ["st-navShell", `st-navShell--${variant}`, className].filter(Boolean).join(" ")
  );
</script>

<!-- Contenu commun aux deux variantes : header (back/titre/sous-titre) + search
     pleine largeur. Le corps et le footer diffèrent selon le contenant. -->
{#snippet head()}
  {#if back || title || subtitle}
    <header class="st-navShell__header">
      {#if back}
        <button
          type="button"
          class="st-navShell__back"
          aria-label={backLabel}
          onclick={() => onBack?.()}
        >
          <span aria-hidden="true">&#8592;</span>
        </button>
      {/if}
      {#if title || subtitle}
        <div class="st-navShell__heading">
          {#if title}<p class="st-navShell__title">{title}</p>{/if}
          {#if subtitle}<p class="st-navShell__subtitle">{subtitle}</p>{/if}
        </div>
      {/if}
    </header>
  {/if}
  {#if search}
    <div class="st-navShell__search">{@render search()}</div>
  {/if}
{/snippet}

{#if variant === "drawer"}
  <!-- Overlay : on délègue le chrome (dialog/Escape/backdrop) à Drawer. Drawer
       exige un `title` ; à défaut on retombe sur `label` puis une valeur sûre.
       Le header/search/body passent dans `children`, le footer dans son slot. -->
  <Drawer
    bind:open
    {side}
    title={title ?? label ?? "Navigation"}
    class={rootClasses}
    {footer}
  >
    {@render head()}
    <div class="st-navShell__body">
      {@render children()}
    </div>
  </Drawer>
{:else}
  <!-- Panneau persistant : région complementary titrée. -->
  <aside class={rootClasses} aria-label={label ?? title}>
    {@render head()}
    <div class="st-navShell__body">
      {@render children()}
    </div>
    {#if footer}
      <footer class="st-navShell__footer">
        {@render footer()}
      </footer>
    {/if}
  </aside>
{/if}

<style>
  /* Token-only scopé. Rail = grille à 3 rangs (header+search auto / body 1fr /
     footer auto) qui plafonne en hauteur pour que SEUL le corps scrolle. */
  .st-navShell--rail {
    background: var(--st-component-navShell-surface, var(--st-semantic-surface-raised));
    border-color: var(--st-component-navShell-border, var(--st-semantic-border-subtle));
    border-right-style: solid;
    border-right-width: 1px;
    color: var(--st-semantic-text-primary);
    display: grid;
    grid-template-rows: auto 1fr auto;
    height: 100%;
    inline-size: var(--st-component-navShell-width, 18rem);
    max-inline-size: 100%;
    padding: var(--st-spacing-4, 1rem);
  }

  .st-navShell__header {
    align-items: center;
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    padding-block-end: var(--st-spacing-3, 0.75rem);
  }

  .st-navShell__back {
    align-items: center;
    background: transparent;
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-small, 0.375rem);
    color: var(--st-semantic-text-primary);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2rem;
    justify-content: center;
    width: 2rem;
  }

  .st-navShell__heading {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-1, 0.25rem);
    min-inline-size: 0;
  }

  .st-navShell__title {
    font-size: var(--st-component-navShell-titleSize, 1rem);
    font-weight: 600;
    line-height: 1.3;
    margin: 0;
  }

  .st-navShell__subtitle {
    color: var(--st-semantic-text-secondary);
    font-size: var(--st-component-navShell-subtitleSize, 0.8125rem);
    line-height: 1.4;
    margin: 0;
  }

  /* Search pleine largeur du panneau. */
  .st-navShell__search {
    display: block;
    inline-size: 100%;
    padding-block-end: var(--st-spacing-3, 0.75rem);
  }

  /* Le corps est la SEULE région scrollable (1fr en rail, overflow en drawer). */
  .st-navShell__body {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-2, 0.5rem);
    min-block-size: 0;
    overflow-y: auto;
  }

  .st-navShell__footer {
    border-color: var(--st-component-navShell-border, var(--st-semantic-border-subtle));
    border-top-style: solid;
    border-top-width: 1px;
    display: block;
    margin-block-start: var(--st-spacing-3, 0.75rem);
    padding-block-start: var(--st-spacing-3, 0.75rem);
  }
</style>

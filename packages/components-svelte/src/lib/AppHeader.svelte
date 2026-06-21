<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface AppHeaderProps {
    /**
     * Force le mode compact (burger). Calque la source : le burger est à GAUCHE
     * et la nav desktop est masquée quand `compact` est vrai.
     */
    compact?: boolean;
    /** État ouvert du panneau burger (contrôlé). */
    menuOpen?: boolean;
    /** Callback de bascule du burger (clic sur le bouton compact). */
    onMenuToggle?: () => void;
    /** aria-label du bouton burger. */
    menuLabel?: string;
    /**
     * Id du tiroir, partagé entre `aria-controls` (burger) et `id` (drawer).
     * Auto-généré et stable si non fourni.
     */
    drawerId?: string;
    /**
     * Marque structurée (décision actée : logo SENT + sous-titre). Rend le bloc
     * canonique « logo carré + nom + sous-titre produit » sans dupliquer de CSS
     * côté consommateur. Si le snippet `logo` est fourni, il a priorité (contrôle
     * total) ; sinon ces props produisent le bloc marque par défaut.
     */
    brandName?: string;
    /** Sous-titre produit affiché sous le nom (ex. « Design System », « dataviz »). */
    productName?: string;
    /** Source de l'image du logo carré (ex. `/SENT-logo-squared.svg`). */
    logoSrc?: string;
    /** Texte alternatif du logo (décoratif par défaut). */
    logoAlt?: string;
    /** Cible du lien de la marque. Défaut : `/`. */
    brandHref?: string;
    /** aria-label du lien de marque (sinon dérivé de `brandName` + `productName`). */
    brandLabel?: string;
    /** Logo (décision actée : logo SENT + sous-titre). Prioritaire sur `brandName`/`logoSrc`. */
    logo?: Snippet;
    /** Liens de navigation (rendus dans le <nav> desktop). */
    nav?: Snippet;
    /** Contenu à droite (typiquement LanguageToggle + IdentityMenu). */
    actions?: Snippet;
    /** Contenu du tiroir compact (nav + langue + identité en accordéon). */
    drawer?: Snippet;
    /**
     * Alignement de la nav desktop.
     * - `"start"` (défaut) : la nav occupe l'espace restant et pousse les actions à droite.
     * - `"center"` : la nav est centrée absolument entre le logo et les actions.
     */
    navAlign?: "start" | "center";
    class?: string;
  }

  // Compteur module pour générer un id de tiroir stable, déterministe et
  // SSR-safe (pas de crypto). Aligné sur le pattern des 3 fw.
  let appHeaderIdCounter = 0;
  function nextAppHeaderId(): number {
    return ++appHeaderIdCounter;
  }
</script>

<script lang="ts">
  import { untrack } from "svelte";
  import { Menu, X } from "@lucide/svelte";

  let {
    compact = false,
    menuOpen = false,
    onMenuToggle,
    menuLabel = "Menu",
    drawerId,
    brandName,
    productName,
    logoSrc,
    logoAlt = "",
    brandHref = "/",
    brandLabel,
    logo,
    nav,
    actions,
    drawer,
    navAlign = "start",
    class: className,
  }: AppHeaderProps = $props();

  // Marque par défaut : rendue ssi aucun snippet `logo` et qu'il y a au moins un
  // nom / logo / produit. Calque le bloc marque canonique du site DS.
  const hasDefaultBrand = $derived(
    !logo && Boolean(brandName || productName || logoSrc),
  );
  const resolvedBrandLabel = $derived(
    brandLabel ?? [brandName, productName].filter(Boolean).join(" "),
  );

  // Id stable du tiroir : prop fournie sinon compteur module (SSR-safe, sans
  // crypto). Capturé une seule fois (untrack) : un id stable ne doit pas réagir.
  const resolvedDrawerId = untrack(
    () => drawerId ?? `st-appHeader-drawer-${nextAppHeaderId()}`,
  );

  const classes = () => ["st-appHeader", className].filter(Boolean).join(" ");
  const barClasses = () =>
    ["st-appHeader__bar", navAlign === "center" ? "st-appHeader__bar--navCenter" : null]
      .filter(Boolean)
      .join(" ");
  const navClasses = () =>
    ["st-appHeader__nav", navAlign === "center" ? "st-appHeader__nav--center" : null]
      .filter(Boolean)
      .join(" ");
</script>

<header class={classes()}>
  <div class={barClasses()}>
    <!-- Logo SENT à GAUCHE (+ sous-titre). -->
    {#if logo}
      <div class="st-appHeader__logo">{@render logo()}</div>
    {:else if hasDefaultBrand}
      <a class="st-appHeader__brand" href={brandHref} aria-label={resolvedBrandLabel || undefined}>
        {#if logoSrc}
          <img class="st-appHeader__brandMark" src={logoSrc} alt={logoAlt} aria-hidden={logoAlt ? undefined : "true"} />
        {/if}
        {#if brandName || productName}
          <span class="st-appHeader__brandCopy">
            {#if brandName}<span class="st-appHeader__brandName">{brandName}</span>{/if}
            {#if productName}<span class="st-appHeader__brandProduct">{productName}</span>{/if}
          </span>
        {/if}
      </a>
    {/if}

    <!-- Nav desktop (masquée en mode compact). -->
    {#if !compact}
      <nav class={navClasses()} aria-label="Primary">
        {#if nav}{@render nav()}{/if}
      </nav>

      <!-- Contrôles de droite (masqués en mode compact). -->
      <div class="st-appHeader__actions">
        {#if actions}{@render actions()}{/if}
      </div>
    {:else}
      <!-- Burger à l'extrême DROITE en mode compact. -->
      <div class="st-appHeader__burger">
        <button
          type="button"
          class="st-appHeader__burgerButton"
          onclick={onMenuToggle}
          aria-label={menuLabel}
          aria-expanded={menuOpen}
          aria-controls={resolvedDrawerId}
          aria-haspopup="menu"
        >
          {#if menuOpen}
            <X class="st-appHeader__burgerIcon" size={20} aria-hidden="true" />
          {:else}
            <Menu class="st-appHeader__burgerIcon" size={20} aria-hidden="true" />
          {/if}
        </button>
      </div>
    {/if}
  </div>
</header>

{#if compact && menuOpen && drawer}
  <button
    type="button"
    class="st-appHeader__scrim"
    aria-label={menuLabel}
    onclick={onMenuToggle}
  ></button>
  <aside id={resolvedDrawerId} class="st-appHeader__drawer">
    {@render drawer()}
  </aside>
{/if}

<style>
  .st-appHeader {
    background: var(--st-semantic-surface-default);
    border-bottom: 1px solid var(--st-semantic-border-subtle);
    color: var(--st-semantic-text-primary);
    font-family: var(--st-font-sans);
    width: 100%;
  }

  .st-appHeader__bar {
    align-items: center;
    display: flex;
    gap: var(--st-spacing-4, 1rem);
    height: var(--st-component-appHeader-height, 3.5rem);
    justify-content: space-between;
    margin: 0 auto;
    max-width: 80rem;
    padding: 0 var(--st-spacing-4, 1rem);
    width: 100%;
  }

  /* Quand navAlign="center" : position relative sur la bar pour ancrer la nav. */
  .st-appHeader__bar--navCenter {
    position: relative;
  }

  .st-appHeader__nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    flex-wrap: wrap;
    font-size: 0.875rem;
    font-weight: 500;
    gap: var(--st-spacing-4, 1rem);
    min-width: 0;
  }

  /* Nav centrée absolument : ne participe plus au flux flex. */
  .st-appHeader__nav--center {
    flex: 0 0 auto;
    left: 50%;
    position: absolute;
    transform: translateX(-50%);
  }

  .st-appHeader__burger {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    justify-content: flex-end;
  }

  .st-appHeader__burgerButton {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: var(--st-radius-sm, 0.375rem);
    color: var(--st-semantic-text-primary);
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    padding: var(--st-spacing-2, 0.5rem);
  }

  .st-appHeader__burgerButton:hover {
    background: var(--st-semantic-surface-subtle);
  }

  .st-appHeader__burgerButton:focus-visible {
    box-shadow: 0 0 0 2px var(--st-semantic-border-interactive);
    outline: none;
  }

  .st-appHeader__burgerIcon {
    display: block;
  }

  .st-appHeader__logo {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
  }

  /* --- Marque canonique (logo carré + nom + sous-titre produit) --- */
  .st-appHeader__brand {
    align-items: center;
    color: var(--st-semantic-text-primary);
    display: inline-flex;
    flex: 0 0 auto;
    gap: var(--st-spacing-3, 0.75rem);
    min-width: 0;
    text-decoration: none;
  }

  .st-appHeader__brand:hover,
  .st-appHeader__brand:focus-visible {
    text-decoration: none;
  }

  .st-appHeader__brand:focus-visible {
    border-radius: var(--st-radius-sm, 0.375rem);
    box-shadow: 0 0 0 2px var(--st-semantic-border-interactive);
    outline: none;
  }

  .st-appHeader__brandMark {
    aspect-ratio: 1;
    display: inline-block;
    flex: 0 0 auto;
    height: 2rem;
    object-fit: contain;
    width: 2rem;
  }

  .st-appHeader__brandCopy {
    display: grid;
    gap: 0.08rem;
    line-height: 1;
    min-width: 0;
  }

  .st-appHeader__brandName {
    color: var(--st-semantic-text-primary);
    font-size: 1rem;
    font-weight: 760;
  }

  .st-appHeader__brandProduct {
    color: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
    font-weight: 650;
  }

  /* --- Lien de nav canonique (pill soulignée, état actif) ---
     Classe utilitaire publiée : un consommateur l'applique sur ses <a> de nav
     (ou via le composant Link DS) pour matcher le chrome du site DS sans
     dupliquer de CSS d'application. */
  :global(.st-appHeader__navLink) {
    align-items: center;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    font-size: 0.875rem;
    gap: 0.35rem;
    line-height: 1;
    padding: 0.38rem 0.75rem;
    text-decoration: none;
    white-space: nowrap;
    transition: color var(--st-motion-fast, 120ms) ease,
      border-color var(--st-motion-fast, 120ms) ease;
  }

  :global(.st-appHeader__navLink:hover),
  :global(.st-appHeader__navLink:focus-visible) {
    color: var(--st-semantic-text-primary);
    text-decoration: none;
  }

  :global(.st-appHeader__navLink[aria-current="page"]) {
    border-bottom-color: var(--st-semantic-border-interactive);
    color: var(--st-semantic-text-primary);
    font-weight: 650;
  }

  /* --- Contrôle utilitaire canonique (pill : thème / langue / icône) --- */
  :global(.st-appHeader__control) {
    align-items: center;
    background: var(--st-semantic-surface-default);
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-sm, 0.375rem);
    color: var(--st-semantic-text-secondary);
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 0.75rem;
    font-weight: 650;
    gap: 0.35rem;
    height: 2.25rem;
    line-height: 1;
    padding: 0 0.65rem;
    text-decoration: none;
    white-space: nowrap;
    transition: background-color var(--st-motion-fast, 120ms) ease,
      border-color var(--st-motion-fast, 120ms) ease,
      color var(--st-motion-fast, 120ms) ease;
  }

  :global(.st-appHeader__control:hover),
  :global(.st-appHeader__control:focus-visible),
  :global(.st-appHeader__control[aria-expanded="true"]) {
    background: var(--st-semantic-surface-subtle);
    border-color: var(--st-semantic-border-interactive);
    color: var(--st-semantic-text-primary);
    outline: none;
  }

  .st-appHeader__actions {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: var(--st-spacing-3, 0.75rem);
  }

  .st-appHeader__scrim {
    background: transparent;
    border: 0;
    cursor: default;
    inset: 0;
    padding: 0;
    position: fixed;
    z-index: var(--st-zindex-overlay, 80);
  }

  .st-appHeader__drawer {
    background: var(--st-semantic-surface-default);
    border: 1px solid var(--st-semantic-border-subtle);
    box-shadow: var(--st-shadow-medium, 0 8px 24px rgb(15 23 42 / 0.12));
    left: 0;
    max-height: 100vh;
    overflow-y: auto;
    position: fixed;
    top: 0;
    width: min(22rem, 85vw);
    z-index: calc(var(--st-zindex-overlay, 80) + 10);
  }
</style>

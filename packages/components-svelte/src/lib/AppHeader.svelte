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
    /** Logo (décision actée : logo SENT + sous-titre). */
    logo?: Snippet;
    /** Liens de navigation (rendus dans le <nav> desktop). */
    nav?: Snippet;
    /** Contenu à droite (typiquement LanguageToggle + IdentityMenu). */
    actions?: Snippet;
    /** Contenu du tiroir compact (nav + langue + identité en accordéon). */
    drawer?: Snippet;
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
    logo,
    nav,
    actions,
    drawer,
    class: className,
  }: AppHeaderProps = $props();

  // Id stable du tiroir : prop fournie sinon compteur module (SSR-safe, sans
  // crypto). Capturé une seule fois (untrack) : un id stable ne doit pas réagir.
  const resolvedDrawerId = untrack(
    () => drawerId ?? `st-appHeader-drawer-${nextAppHeaderId()}`,
  );

  const classes = () => ["st-appHeader", className].filter(Boolean).join(" ");
</script>

<header class={classes()}>
  <div class="st-appHeader__bar">
    <!-- Logo SENT à GAUCHE (+ sous-titre). -->
    {#if logo}
      <div class="st-appHeader__logo">{@render logo()}</div>
    {/if}

    <!-- Nav desktop (masquée en mode compact). -->
    {#if !compact}
      <nav class="st-appHeader__nav" aria-label="Primary">
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
    height: 3.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 80rem;
    padding: 0 var(--st-spacing-4, 1rem);
    width: 100%;
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

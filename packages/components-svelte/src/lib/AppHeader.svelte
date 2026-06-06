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
</script>

<script lang="ts">
  import { Menu, X } from "@lucide/svelte";

  let {
    compact = false,
    menuOpen = false,
    onMenuToggle,
    menuLabel = "Menu",
    logo,
    nav,
    actions,
    drawer,
    class: className,
  }: AppHeaderProps = $props();

  const classes = () => ["st-appHeader", className].filter(Boolean).join(" ");
</script>

<header class={classes()}>
  <div class="st-appHeader__bar">
    <!-- Burger à GAUCHE (calque exact de la source ~L176-191). -->
    {#if compact}
      <div class="st-appHeader__burger">
        <button
          type="button"
          class="st-appHeader__burgerButton"
          onclick={onMenuToggle}
          aria-label={menuLabel}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          {#if menuOpen}
            <X class="st-appHeader__burgerIcon" size={20} aria-hidden="true" />
          {:else}
            <Menu class="st-appHeader__burgerIcon" size={20} aria-hidden="true" />
          {/if}
        </button>
      </div>
    {:else}
      <!-- Nav desktop (masquée en mode compact). -->
      <nav class="st-appHeader__nav" aria-label="Primary">
        {#if nav}{@render nav()}{/if}
      </nav>
    {/if}

    {#if logo}
      <div class="st-appHeader__logo">{@render logo()}</div>
    {/if}

    <!-- Contrôles de droite (masqués en mode compact). -->
    {#if !compact}
      <div class="st-appHeader__actions">
        {#if actions}{@render actions()}{/if}
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
  <aside class="st-appHeader__drawer">
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
    justify-content: flex-start;
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

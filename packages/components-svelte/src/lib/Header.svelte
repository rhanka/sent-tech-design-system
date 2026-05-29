<script lang="ts" module>
  /**
   * Identité de l'utilisateur connecté à afficher dans la zone compte du Header.
   *
   * Le composant garantit qu'une identité connectée ne se réduit JAMAIS à une
   * icône carrée nue : le nom est toujours rendu, et l'email l'accompagne quand
   * il est fourni. L'avatar utilise la photo si `avatarUrl` est présente, sinon
   * il retombe sur les `initials` (calculées depuis le nom si non fournies).
   */
  export type HeaderAccount = {
    /** Nom affiché de la personne connectée. Obligatoire : pas de carré sans nom. */
    name: string;
    /** Email optionnel, affiché sous le nom et dans le menu compte. */
    email?: string;
    /** URL de la photo de profil. Si absente, on rend les initiales. */
    avatarUrl?: string | null;
    /** Initiales explicites. Si absentes, dérivées du `name`. */
    initials?: string;
  };

  /** Dérive des initiales lisibles (max 2 lettres) à partir d'un nom complet. */
  export function deriveInitials(name: string): string {
    const parts = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type HeaderProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    title?: string;
    label?: string;
    sticky?: boolean;
    class?: string;
    logo?: Snippet;
    navigation?: Snippet;
    actions?: Snippet;
    children?: Snippet;
    /**
     * Identité connectée (additif). Quand fourni, le Header rend une zone compte
     * complète (avatar OU initiales + nom + email + déclencheur de menu). Sans
     * cet objet, l'état « anonyme » s'affiche via le snippet `actions` du parent
     * (typiquement un CTA « Se connecter »).
     */
    account?: HeaderAccount;
    /** Texte du déclencheur de connexion rendu quand `account` est absent. */
    signInLabel?: string;
    /** Snippet du menu compte (contenu du panneau ouvert sous l'avatar). */
    accountMenu?: Snippet;
    /** Indique si le menu compte est ouvert (état contrôlé par le parent). */
    accountMenuOpen?: boolean;
    /** Callback déclenché au clic sur le bouton compte. */
    onAccountTriggerClick?: () => void;
    /** Callback déclenché au clic sur le CTA de connexion (état anonyme). */
    onSignIn?: () => void;
  };

  let {
    title,
    label = "Application header",
    sticky = true,
    class: className,
    logo,
    navigation,
    actions,
    children,
    account,
    signInLabel = "Se connecter",
    accountMenu,
    accountMenuOpen = false,
    onAccountTriggerClick,
    onSignIn,
    ...rest
  }: HeaderProps = $props();

  const classes = () =>
    ["st-header", sticky ? "st-header--sticky" : null, className].filter(Boolean).join(" ");

  const resolvedInitials = $derived(
    account ? (account.initials?.trim() || deriveInitials(account.name)) : ""
  );
  const hasPhoto = $derived(Boolean(account?.avatarUrl));
</script>

<header {...rest} class={classes()} aria-label={label}>
  <div class="st-header__leading">
    {#if logo}
      <span class="st-header__logo">{@render logo()}</span>
    {/if}
    {#if title}
      <span class="st-header__title">{title}</span>
    {/if}
  </div>
  {#if navigation}
    <nav class="st-header__navigation" aria-label="Primary">
      {@render navigation()}
    </nav>
  {/if}
  {#if actions || account || onSignIn}
    <div class="st-header__actions">
      {#if actions}
        {@render actions()}
      {/if}
      {#if account}
        <!-- État connecté : identité arbitrée. Le nom est TOUJOURS visible. -->
        <div class="st-header__account">
          <button
            type="button"
            class="st-header__account-trigger"
            aria-haspopup="menu"
            aria-expanded={accountMenuOpen}
            aria-label={`Compte de ${account.name}`}
            onclick={onAccountTriggerClick}
          >
            {#if hasPhoto}
              <span class="st-header__avatar st-header__avatar--photo" aria-hidden="true">
                <img
                  class="st-header__avatar-image"
                  src={account.avatarUrl}
                  alt=""
                />
              </span>
            {:else}
              <span class="st-header__avatar st-header__avatar--initials" aria-hidden="true">
                {resolvedInitials}
              </span>
            {/if}
            <span class="st-header__account-meta">
              <span class="st-header__account-name">{account.name}</span>
              {#if account.email}
                <span class="st-header__account-email">{account.email}</span>
              {/if}
            </span>
            <svg
              class="st-header__account-caret"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {#if accountMenu && accountMenuOpen}
            <div class="st-header__account-menu" role="menu" aria-label={`Menu de ${account.name}`}>
              {@render accountMenu()}
            </div>
          {/if}
        </div>
      {:else if onSignIn}
        <!-- État anonyme : CTA de connexion explicite. -->
        <button type="button" class="st-header__signin" onclick={onSignIn}>
          {signInLabel}
        </button>
      {/if}
    </div>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</header>

<style>
  .st-header {
    align-items: center;
    background: var(--st-component-header-background, var(--st-semantic-surface-default));
    border-bottom: 1px solid var(--st-component-header-border, var(--st-semantic-border-subtle));
    box-shadow: var(--st-component-header-shadow, 0 1px 3px rgb(15 23 42 / 0.06));
    color: var(--st-component-header-text, var(--st-semantic-text-primary));
    display: flex;
    gap: var(--st-spacing-4, 1rem);
    height: var(--st-component-header-height, 3.5rem);
    padding: 0 var(--st-spacing-4, 1rem);
    width: 100%;
    z-index: var(--st-component-header-zIndex, 70);
  }

  .st-header--sticky {
    position: sticky;
    top: 0;
  }

  .st-header__leading {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: var(--st-spacing-3, 0.75rem);
  }

  .st-header__logo {
    align-items: center;
    color: var(--st-component-header-logoText, var(--st-semantic-text-primary));
    display: inline-flex;
  }

  .st-header__title {
    color: var(--st-component-header-titleText, var(--st-semantic-text-primary));
    font-size: 0.9375rem;
    font-weight: 650;
    letter-spacing: -0.005em;
    line-height: 1.2;
  }

  .st-header__navigation {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    justify-content: center;
    min-width: 0;
  }

  .st-header__actions {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: var(--st-spacing-2, 0.5rem);
    margin-left: auto;
  }

  /*
   * When no navigation snippet is provided, the actions area still flushes
   * to the right because flex:1 leading + auto margin keep the layout balanced.
   */

  /* --- Zone compte (G8) : identité connectée, jamais un carré nu --- */
  .st-header__account {
    position: relative;
  }

  .st-header__account-trigger {
    align-items: center;
    background: transparent;
    border: 1px solid var(--st-component-header-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-radius-sm, 0.375rem);
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    gap: var(--st-spacing-2, 0.5rem);
    max-width: 18rem;
    min-height: 2.25rem;
    padding: 0.25rem 0.5rem;
  }

  .st-header__account-trigger:hover,
  .st-header__account-trigger:focus-visible {
    border-color: var(--st-semantic-border-interactive, var(--st-semantic-action-primary));
    outline: none;
  }

  .st-header__avatar {
    aspect-ratio: 1;
    border-radius: var(--st-radius-sm, 0.375rem);
    flex: 0 0 auto;
    height: 2rem;
    overflow: hidden;
    width: 2rem;
  }

  .st-header__avatar--initials {
    align-items: center;
    background: var(--st-semantic-surface-subtle, #eef2f7);
    color: var(--st-semantic-text-primary, #0f172a);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 700;
    justify-content: center;
    letter-spacing: 0.01em;
  }

  .st-header__avatar-image {
    background: var(--st-semantic-surface-subtle, #eef2f7);
    display: block;
    height: 100%;
    object-fit: cover;
    object-position: center;
    width: 100%;
  }

  .st-header__account-meta {
    display: grid;
    gap: 0.05rem;
    min-width: 0;
    text-align: left;
  }

  .st-header__account-name {
    color: var(--st-semantic-text-primary, #0f172a);
    font-size: 0.82rem;
    font-weight: 650;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .st-header__account-email {
    color: var(--st-semantic-text-secondary, #64748b);
    font-size: 0.72rem;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .st-header__account-caret {
    color: var(--st-semantic-text-secondary, #64748b);
    flex: 0 0 auto;
  }

  .st-header__account-menu {
    background: var(--st-component-popover-background, var(--st-semantic-surface-raised, #ffffff));
    border: 1px solid var(--st-component-popover-border, var(--st-semantic-border-subtle, #e2e8f0));
    border-radius: var(--st-component-popover-radius, 0.5rem);
    box-shadow: var(--st-component-popover-shadow, 0 18px 45px rgb(15 23 42 / 0.18));
    color: var(--st-semantic-text-primary, #0f172a);
    display: grid;
    gap: 0.35rem;
    min-width: 14rem;
    padding: var(--st-spacing-3, 0.75rem);
    position: absolute;
    right: 0;
    top: calc(100% + var(--st-spacing-2, 0.5rem));
    z-index: var(--st-component-popover-zIndex, 80);
  }

  .st-header__signin {
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--st-radius-sm, 0.375rem);
    color: var(--st-semantic-text-link, var(--st-semantic-action-primary));
    cursor: pointer;
    font: inherit;
    font-weight: 600;
    min-height: 2.25rem;
    padding: 0 0.875rem;
  }

  .st-header__signin:hover,
  .st-header__signin:focus-visible {
    background: var(--st-semantic-surface-subtle, #f1f5f9);
    outline: none;
  }
</style>

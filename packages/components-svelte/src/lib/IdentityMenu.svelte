<script lang="ts" module>
  export interface IdentityUser {
    displayName: string;
    email?: string;
    id?: string;
  }

  export interface IdentityMenuProps {
    /** Identité connectée (contrôlé). `null` quand anonyme. */
    user?: IdentityUser | null;
    /** État d'authentification (contrôlé : aucun état auth interne). */
    isAuthenticated?: boolean;
    /** État ouvert du dropdown (optionnellement contrôlé). */
    open?: boolean;
    /** Notifié au clic « Se connecter ». */
    onLogin?: () => void;
    /** Notifié au clic « Se déconnecter ». */
    onLogout?: () => void;
    /** Lien « Appareils ». */
    devicesHref?: string;
    /** Lien « Paramètres ». */
    settingsHref?: string;
    /** Libellé du bouton de connexion. */
    loginLabel?: string;
    /** Libellé « Appareils ». */
    devicesLabel?: string;
    /** Libellé « Paramètres ». */
    settingsLabel?: string;
    /** Libellé « Se déconnecter ». */
    logoutLabel?: string;
    /**
     * Variante d'affichage :
     * - `dropdown` (défaut) : déclencheur + menu flottant (header desktop).
     * - `accordion` : déclencheur + liste inline (tiroir mobile).
     */
    variant?: "dropdown" | "accordion";
    class?: string;
  }

  /** Première lettre du displayName, en majuscule (calque de la source). */
  export function identityInitial(user: IdentityUser | null | undefined): string {
    const source = user?.displayName || user?.email || "U";
    return source.charAt(0).toUpperCase();
  }
</script>

<script lang="ts">
  import { ChevronDown } from "@lucide/svelte";

  let {
    user = null,
    isAuthenticated = false,
    open = $bindable(false),
    onLogin,
    onLogout,
    devicesHref = "#",
    settingsHref = "#",
    loginLabel = "Se connecter",
    devicesLabel = "Appareils",
    settingsLabel = "Paramètres",
    logoutLabel = "Se déconnecter",
    variant = "dropdown",
    class: className,
  }: IdentityMenuProps = $props();

  let root: HTMLDivElement | undefined = $state();
  let triggerEl: HTMLButtonElement | undefined = $state();

  const classes = () => ["st-identityMenu", className].filter(Boolean).join(" ");
  const initial = $derived(identityInitial(user));
  const displayName = $derived(user?.displayName || user?.email || "User");

  function getMenuItems(): HTMLElement[] {
    return Array.from(
      root?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
    );
  }

  function focusItem(index: number) {
    const items = getMenuItems();
    if (!items.length) return;
    const len = items.length;
    const target = ((index % len) + len) % len;
    items[target]?.focus();
  }

  function toggle() {
    open = !open;
  }

  function closeAndFocusTrigger() {
    open = false;
    triggerEl?.focus();
  }

  function onTriggerKeydown(event: KeyboardEvent) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) open = true;
      queueMicrotask(() => focusItem(0));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) open = true;
      queueMicrotask(() => focusItem(-1));
    }
  }

  function onMenuKeydown(event: KeyboardEvent) {
    const items = getMenuItems();
    const current = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem(current + 1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusItem(current - 1);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      focusItem(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      focusItem(items.length - 1);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeAndFocusTrigger();
    }
  }

  function handleLogout() {
    open = false;
    onLogout?.();
  }
</script>

<svelte:window
  onpointerdown={(e) => {
    if (open && root && e.target instanceof Node && !root.contains(e.target)) open = false;
  }}
/>

{#if isAuthenticated && user}
  <div
    class={classes()}
    class:st-identityMenu--accordion={variant === "accordion"}
    bind:this={root}
  >
    <button
      type="button"
      class="st-identityMenu__trigger"
      bind:this={triggerEl}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-label={`Compte de ${displayName}`}
      onclick={toggle}
      onkeydown={onTriggerKeydown}
    >
      <span class="st-identityMenu__avatar" aria-hidden="true">{initial}</span>
      <span class="st-identityMenu__meta">
        <span class="st-identityMenu__name">{displayName}</span>
        {#if variant === "accordion" && user.email}
          <span class="st-identityMenu__email">{user.email}</span>
        {/if}
      </span>
      <ChevronDown
        class={`st-identityMenu__chevron${open ? " st-identityMenu__chevron--open" : ""}`}
        size={16}
        aria-hidden="true"
      />
    </button>

    {#if open}
      <div
        class="st-identityMenu__menu"
        role="menu"
        tabindex="-1"
        aria-label={`Menu de ${displayName}`}
        onkeydown={onMenuKeydown}
      >
        <a
          href={devicesHref}
          class="st-identityMenu__item"
          role="menuitem"
          tabindex="-1"
          onclick={() => (open = false)}
        >
          {devicesLabel}
        </a>
        <a
          href={settingsHref}
          class="st-identityMenu__item"
          role="menuitem"
          tabindex="-1"
          onclick={() => (open = false)}
        >
          {settingsLabel}
        </a>
        <div class="st-identityMenu__divider" role="separator" aria-hidden="true"></div>
        <button
          type="button"
          class="st-identityMenu__item st-identityMenu__item--danger"
          role="menuitem"
          tabindex="-1"
          onclick={handleLogout}
        >
          {logoutLabel}
        </button>
      </div>
    {/if}
  </div>
{:else}
  <button
    type="button"
    class="st-identityMenu__login"
    class:st-identityMenu__login--accordion={variant === "accordion"}
    onclick={() => onLogin?.()}
  >
    {loginLabel}
  </button>
{/if}

<style>
  .st-identityMenu {
    font-family: var(--st-font-sans);
    position: relative;
  }

  .st-identityMenu--accordion {
    width: 100%;
  }

  .st-identityMenu__trigger {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: var(--st-radius-sm, 0.375rem);
    color: var(--st-semantic-text-primary);
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-family: var(--st-font-sans);
    font-size: 0.875rem;
    font-weight: 500;
    gap: var(--st-spacing-2, 0.5rem);
    padding: var(--st-spacing-1, 0.25rem) var(--st-spacing-3, 0.75rem);
  }

  .st-identityMenu--accordion .st-identityMenu__trigger {
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
    width: 100%;
  }

  .st-identityMenu__trigger:hover {
    background: var(--st-semantic-surface-subtle);
  }

  .st-identityMenu__trigger:focus-visible {
    box-shadow: 0 0 0 2px var(--st-semantic-border-interactive);
    outline: none;
  }

  .st-identityMenu__avatar {
    align-items: center;
    background: var(--st-semantic-action-primary);
    border-radius: var(--st-radius-pill, 9999px);
    color: var(--st-semantic-action-primaryText);
    display: inline-flex;
    flex: 0 0 auto;
    font-weight: 500;
    height: 2rem;
    justify-content: center;
    width: 2rem;
  }

  .st-identityMenu__meta {
    display: grid;
    gap: 0.05rem;
    min-width: 0;
    text-align: left;
  }

  .st-identityMenu--accordion .st-identityMenu__meta {
    flex: 1 1 auto;
  }

  .st-identityMenu__name {
    color: var(--st-semantic-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .st-identityMenu__email {
    color: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .st-identityMenu :global(.st-identityMenu__chevron) {
    color: var(--st-semantic-text-secondary);
    flex: 0 0 auto;
    transition: transform var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-identityMenu :global(.st-identityMenu__chevron--open) {
    transform: rotate(180deg);
  }

  .st-identityMenu__menu {
    background: var(--st-semantic-surface-raised);
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-md, 0.375rem);
    box-shadow: var(--st-shadow-medium, 0 8px 24px rgb(15 23 42 / 0.12));
    display: grid;
    margin-top: var(--st-spacing-2, 0.5rem);
    min-width: 12rem;
    padding: var(--st-spacing-1, 0.25rem);
    position: absolute;
    right: 0;
    top: 100%;
    z-index: var(--st-zindex-overlay, 80);
  }

  /* En accordéon, le menu est inline (pas flottant). */
  .st-identityMenu--accordion .st-identityMenu__menu {
    box-shadow: none;
    margin-top: var(--st-spacing-1, 0.25rem);
    position: static;
    width: 100%;
  }

  .st-identityMenu__item {
    background: transparent;
    border: 0;
    border-radius: var(--st-radius-sm, 0.375rem);
    color: var(--st-semantic-text-primary);
    cursor: pointer;
    display: block;
    font: inherit;
    font-family: var(--st-font-sans);
    font-size: 0.875rem;
    font-weight: 500;
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
    text-align: left;
    text-decoration: none;
    width: 100%;
  }

  .st-identityMenu__item:hover {
    background: var(--st-semantic-surface-subtle);
  }

  .st-identityMenu__item:focus-visible {
    box-shadow: 0 0 0 2px var(--st-semantic-border-interactive);
    outline: none;
  }

  .st-identityMenu__item--danger {
    color: var(--st-semantic-action-danger);
  }

  .st-identityMenu__divider {
    background: var(--st-semantic-border-subtle);
    height: 1px;
    margin: var(--st-spacing-1, 0.25rem) 0;
  }

  .st-identityMenu__login {
    background: var(--st-semantic-action-primary);
    border: 0;
    border-radius: var(--st-radius-md, 0.375rem);
    color: var(--st-semantic-action-primaryText);
    cursor: pointer;
    font: inherit;
    font-family: var(--st-font-sans);
    font-size: 0.875rem;
    padding: var(--st-spacing-1, 0.25rem) var(--st-spacing-3, 0.75rem);
  }

  .st-identityMenu__login--accordion {
    display: block;
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
    text-align: center;
    width: 100%;
  }

  .st-identityMenu__login:hover {
    background: var(--st-semantic-action-primaryHover);
  }

  .st-identityMenu__login:focus-visible {
    box-shadow: 0 0 0 2px var(--st-semantic-border-interactive);
    outline: none;
  }
</style>

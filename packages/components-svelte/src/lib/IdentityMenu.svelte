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
    /**
     * État ouvert du dropdown (optionnellement contrôlé). Si fourni, le
     * composant suit la valeur du parent ; sinon il gère un état interne.
     * Reste $bindable pour l'idiome Svelte.
     */
    open?: boolean;
    /**
     * Notifié à chaque demande de changement d'état ouvert (pattern
     * contrôlé/non-contrôlé, aligné React/Vue). Le composant met aussi à jour
     * `open` (bindable) quand il est non contrôlé.
     */
    onOpenChange?: (open: boolean) => void;
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
    /**
     * Mode compact : n'affiche que l'avatar (2 initiales) sans nom ni chevron.
     * Idéal pour les headers où l'espace est limité.
     */
    compact?: boolean;
    class?: string;
  }

  /** Première lettre du displayName, en majuscule (calque de la source). */
  export function identityInitial(user: IdentityUser | null | undefined): string {
    const source = user?.displayName || user?.email || "U";
    return source.charAt(0).toUpperCase();
  }

  /** Deux initiales (1re lettre de chaque mot, jusqu'à 2 mots) pour le mode compact. */
  export function identityInitials(user: IdentityUser | null | undefined): string {
    const source = user?.displayName || user?.email || "U";
    return source.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  }
</script>

<script lang="ts">
  import { ChevronDown } from "@lucide/svelte";

  let {
    user = null,
    isAuthenticated = false,
    open = $bindable(),
    onOpenChange,
    onLogin,
    onLogout,
    devicesHref = "#",
    settingsHref = "#",
    loginLabel = "Se connecter",
    devicesLabel = "Appareils",
    settingsLabel = "Paramètres",
    logoutLabel = "Se déconnecter",
    variant = "dropdown",
    compact = false,
    class: className,
  }: IdentityMenuProps = $props();

  let root: HTMLDivElement | undefined = $state();
  let triggerEl: HTMLButtonElement | undefined = $state();

  // Pattern contrôlé/non-contrôlé, IDENTIQUE aux 3 fw : si `open` est fourni en
  // prop, le parent contrôle ; sinon un état interne prend le relais.
  let internalOpen = $state(false);
  const isOpen = $derived(open ?? internalOpen);
  // Quel item focuser à la prochaine ouverture : "first" (défaut) ou "last"
  // (ArrowUp depuis le trigger). Lu par l'$effect d'ouverture.
  let pendingFocus: "first" | "last" = "first";

  function setOpen(next: boolean) {
    if (open === undefined) internalOpen = next;
    else open = next; // bindable : reflète aussi côté parent en mode contrôlé
    onOpenChange?.(next);
  }

  const classes = () =>
    ["st-identityMenu", compact ? "st-identityMenu--compact" : null, className]
      .filter(Boolean)
      .join(" ");
  const initial = $derived(compact ? identityInitials(user) : identityInitial(user));
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
    setOpen(!isOpen);
  }

  function closeAndFocusTrigger() {
    setOpen(false);
    triggerEl?.focus();
  }

  function onTriggerKeydown(event: KeyboardEvent) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pendingFocus = "first";
      if (!isOpen) setOpen(true);
      else queueMicrotask(() => focusItem(0));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      pendingFocus = "last";
      if (!isOpen) setOpen(true);
      else queueMicrotask(() => focusItem(-1));
      return;
    }
    if (event.key === "Escape" && isOpen) {
      // Esc ferme aussi depuis le trigger (global au composant ouvert).
      event.preventDefault();
      closeAndFocusTrigger();
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
    if (event.key === "Tab") {
      // Piège de focus : Tab/Shift+Tab bouclent DANS le menu.
      if (!items.length) return;
      event.preventDefault();
      focusItem(current + (event.shiftKey ? -1 : 1));
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeAndFocusTrigger();
    }
  }

  // Enter/Space activent l'item courant. Sur un <a>, on suit le href en
  // déclenchant un clic natif (preventDefault sur Space pour éviter le scroll).
  function onItemKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      (event.currentTarget as HTMLElement).click();
    }
  }

  function selectAndClose() {
    setOpen(false);
    triggerEl?.focus();
  }

  function handleLogout() {
    setOpen(false);
    triggerEl?.focus();
    onLogout?.();
  }

  // À l'ouverture : focus le 1er item (ou le dernier sur ArrowUp). Client-only
  // (guard typeof document). Restaure `pendingFocus` à "first" ensuite.
  $effect(() => {
    if (isOpen && typeof document !== "undefined") {
      const which = pendingFocus;
      queueMicrotask(() => focusItem(which === "last" ? -1 : 0));
      pendingFocus = "first";
    }
  });
</script>

<svelte:window
  onpointerdown={(e) => {
    if (isOpen && root && e.target instanceof Node && !root.contains(e.target)) {
      // Clic extérieur : ferme ET restaure le focus sur le trigger.
      setOpen(false);
      triggerEl?.focus();
    }
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
      aria-expanded={isOpen}
      aria-label={`Compte de ${displayName}`}
      onclick={toggle}
      onkeydown={onTriggerKeydown}
    >
      <span class="st-identityMenu__avatar" aria-hidden="true">{initial}</span>
      {#if !compact}
        <span class="st-identityMenu__meta">
          <span class="st-identityMenu__name">{displayName}</span>
          {#if variant === "accordion" && user.email}
            <span class="st-identityMenu__email">{user.email}</span>
          {/if}
        </span>
        <ChevronDown
          class={`st-identityMenu__chevron${isOpen ? " st-identityMenu__chevron--open" : ""}`}
          size={16}
          aria-hidden="true"
        />
      {/if}
    </button>

    {#if isOpen}
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
          onclick={selectAndClose}
          onkeydown={onItemKeydown}
        >
          {devicesLabel}
        </a>
        <a
          href={settingsHref}
          class="st-identityMenu__item"
          role="menuitem"
          tabindex="-1"
          onclick={selectAndClose}
          onkeydown={onItemKeydown}
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
{:else if compact}
  <button
    type="button"
    class="st-identityMenu__loginCompact"
    aria-label={loginLabel}
    onclick={() => onLogin?.()}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  </button>
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

  /* Mode compact : le trigger est un carré strict (même gabarit qu'un bouton
     icône .st-appHeader__control sans texte) avec l'avatar gris centré. */
  .st-identityMenu--compact .st-identityMenu__trigger {
    background: var(--st-semantic-surface-default);
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-sm, 0.375rem);
    color: var(--st-semantic-text-secondary);
    height: 2.25rem;
    justify-content: center;
    padding: 0;
    width: 2.25rem;
    transition: background-color var(--st-motion-fast, 120ms) ease,
      border-color var(--st-motion-fast, 120ms) ease,
      color var(--st-motion-fast, 120ms) ease;
  }

  .st-identityMenu--compact .st-identityMenu__trigger:hover,
  .st-identityMenu--compact .st-identityMenu__trigger:focus-visible,
  .st-identityMenu--compact .st-identityMenu__trigger[aria-expanded="true"] {
    background: var(--st-semantic-surface-subtle);
    border-color: var(--st-semantic-border-interactive);
    box-shadow: none;
    color: var(--st-semantic-text-primary);
    outline: none;
  }

  /* Avatar compact = carré gris (surface-subtle + radius-sm), pas cercle primary. */
  .st-identityMenu--compact .st-identityMenu__avatar {
    background: var(--st-semantic-surface-subtle);
    border-radius: var(--st-radius-sm, 0.375rem);
    color: var(--st-semantic-text-primary);
    font-size: 0.6875rem;
    font-weight: 700;
    height: 1.5rem;
    width: 1.5rem;
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

  /* Mode déconnecté compact : carré icône bonhomme (même gabarit 2.25rem que
     le trigger compact connecté). */
  .st-identityMenu__loginCompact {
    align-items: center;
    background: var(--st-semantic-surface-default);
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-sm, 0.375rem);
    color: var(--st-semantic-text-secondary);
    cursor: pointer;
    display: inline-flex;
    height: 2.25rem;
    justify-content: center;
    padding: 0;
    width: 2.25rem;
    transition: background-color var(--st-motion-fast, 120ms) ease,
      border-color var(--st-motion-fast, 120ms) ease,
      color var(--st-motion-fast, 120ms) ease;
  }

  .st-identityMenu__loginCompact:hover,
  .st-identityMenu__loginCompact:focus-visible {
    background: var(--st-semantic-surface-subtle);
    border-color: var(--st-semantic-border-interactive);
    color: var(--st-semantic-text-primary);
    outline: none;
  }
</style>

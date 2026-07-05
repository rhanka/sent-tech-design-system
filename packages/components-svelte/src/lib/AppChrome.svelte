<script lang="ts" module>
  import type { Snippet } from "svelte";

  /** Un lien de navigation principal du chrome. */
  export interface AppChromeNavItem {
    label: string;
    href: string;
    /** Marqué actif (souligné, aria-current=page). */
    active?: boolean;
    /** Roles autorisés à voir l'item. Vide/undefined = visible par tous. */
    roles?: string[];
    /** Alias pratique pour un seul rôle autorisé. */
    role?: string;
    /** Coupe la navigation tout en gardant l'item visible/annoncé. */
    disabled?: boolean;
    ariaLabel?: string;
    target?: string;
    rel?: string;
    onClick?: (event: MouseEvent) => void;
  }

  /** Une option du sélecteur de thème. */
  export interface AppChromeThemeOption {
    id: string;
    label: string;
  }

  export type AppChromeColorMode = "light" | "dark" | "auto";
  export type AppChromeLocale = "fr" | "en";

  export interface AppChromeProps {
    // ── Marque ──────────────────────────────────────────────────────────────
    /** Nom de marque (défaut « Sentropic »). */
    brandName?: string;
    /** Sous-titre produit sous le nom (ex. « Design System », « dataviz »). */
    productName?: string;
    /** Source du logo carré (ex. `/SENT-logo-squared.svg`). */
    logoSrc?: string;
    /** Texte alternatif du logo (décoratif par défaut). */
    logoAlt?: string;
    /** Cible du lien de marque. Défaut `/`. */
    brandHref?: string;
    /** aria-label du lien de marque (sinon dérivé de brandName + productName). */
    brandLabel?: string;

    // ── Navigation ──────────────────────────────────────────────────────────
    /** Liens de nav principaux (pills soulignées + état actif). */
    nav?: AppChromeNavItem[];
    /** aria-label de la nav principale. */
    navLabel?: string;
    /** Roles de l'utilisateur courant pour filtrer les nav items gatés par rôle. */
    userRoles?: string[];

    // ── Contrôle thème (contrôlé) ─────────────────────────────────────────────
    /** Options de thème. Vide => le sélecteur est masqué. */
    themes?: AppChromeThemeOption[];
    /** Id du thème actif. */
    theme?: string;
    /** Callback de changement de thème. */
    onThemeChange?: (id: string) => void;
    /** aria-label du sélecteur de thème. */
    themeLabel?: string;

    // ── Contrôle mode couleur (contrôlé) ───────────────────────────────────────
    /** Mode couleur actif. Undefined => le toggle est masqué. */
    colorMode?: AppChromeColorMode;
    /** Callback de changement (cycle light -> dark -> auto). */
    onColorModeChange?: (mode: AppChromeColorMode) => void;
    /** Libellés accessibles des 3 modes (light/dark/auto). */
    colorModeLabels?: { light: string; dark: string; auto: string };

    // ── Contrôle langue (contrôlé) ─────────────────────────────────────────────
    /** Langue active. Undefined => le sélecteur est masqué. */
    locale?: AppChromeLocale;
    /** Callback de changement de langue. */
    onLocaleChange?: (locale: AppChromeLocale) => void;
    /** aria-label du sélecteur de langue. */
    localeLabel?: string;

    // ── Lien GitHub ────────────────────────────────────────────────────────────
    /** URL du dépôt. Undefined => le lien est masqué. */
    githubHref?: string;
    /** aria-label du lien GitHub. */
    githubLabel?: string;

    // ── Identité ───────────────────────────────────────────────────────────────
    /** Zone identité à droite (IdentityMenu, bouton connexion, …). */
    identity?: Snippet;

    // ── Contrôles additionnels ─────────────────────────────────────────────────
    /** Contrôles additionnels dans la zone utilitaire. */
    extraSelectors?: Snippet;

    // ── Mobile ─────────────────────────────────────────────────────────────────
    /** État ouvert du tiroir mobile (contrôlé). */
    mobileMenuOpen?: boolean;
    /** Callback de bascule du tiroir mobile. */
    onMobileMenuToggle?: () => void;
    /** aria-label du bouton burger. */
    menuLabel?: string;

    class?: string;
  }

  let appChromeIdCounter = 0;
  function nextAppChromeId(): number {
    return ++appChromeIdCounter;
  }
</script>

<script lang="ts">
  import { untrack } from "svelte";
  import {
    ChevronDown,
    Github,
    Globe,
    Menu,
    Moon,
    Palette,
    Sun,
  } from "@lucide/svelte";
  import AppHeader from "./AppHeader.svelte";

  let {
    brandName = "Sentropic",
    productName,
    logoSrc,
    logoAlt = "",
    brandHref = "/",
    brandLabel,
    nav = [],
    navLabel = "Primary",
    userRoles = [],
    themes = [],
    theme,
    onThemeChange,
    themeLabel = "Change theme",
    colorMode,
    onColorModeChange,
    colorModeLabels = { light: "Light mode", dark: "Dark mode", auto: "Auto mode" },
    locale,
    onLocaleChange,
    localeLabel = "Change language",
    githubHref,
    githubLabel = "GitHub",
    identity,
    extraSelectors,
    mobileMenuOpen = false,
    onMobileMenuToggle,
    menuLabel = "Menu",
    class: className,
  }: AppChromeProps = $props();

  let isThemeOpen = $state(false);
  let isLocaleOpen = $state(false);

  const drawerId = untrack(() => `st-appChrome-drawer-${nextAppChromeId()}`);

  const activeTheme = $derived(themes.find((t) => t.id === theme) ?? themes[0]);
  const showThemeSelector = $derived(themes.length > 0);
  const showColorMode = $derived(colorMode !== undefined);
  const showLocaleSelector = $derived(locale !== undefined);
  const showGithub = $derived(Boolean(githubHref));

  function pickTheme(id: string) {
    onThemeChange?.(id);
    isThemeOpen = false;
  }

  function pickLocale(value: AppChromeLocale) {
    onLocaleChange?.(value);
    isLocaleOpen = false;
  }

  function cycleColorMode() {
    const next: AppChromeColorMode =
      colorMode === "light" ? "dark" : colorMode === "dark" ? "auto" : "light";
    onColorModeChange?.(next);
  }

  function colorModeAriaLabel(): string {
    if (colorMode === "light") return colorModeLabels.dark;
    if (colorMode === "dark") return colorModeLabels.auto;
    return colorModeLabels.light;
  }

  const classes = () => ["st-appChrome", className].filter(Boolean).join(" ");
  const visibleNav = $derived(
    nav.filter((item) => {
      const allowed = item.roles ?? (item.role ? [item.role] : []);
      return allowed.length === 0 || allowed.some((role) => userRoles.includes(role));
    }),
  );

  function navRel(item: AppChromeNavItem): string | undefined {
    if (item.disabled) return undefined;
    return item.rel ?? (item.target === "_blank" ? "noreferrer" : undefined);
  }

  function handleNavClick(event: MouseEvent, item: AppChromeNavItem, closeDrawer = false) {
    if (item.disabled) event.preventDefault();
    item.onClick?.(event);
    if (!item.disabled && closeDrawer) onMobileMenuToggle?.();
  }

  function closeMenus(target: EventTarget | null) {
    const el = target as Element | null;
    if (isThemeOpen && el && !el.closest(".st-appChrome__themeWrap")) isThemeOpen = false;
    if (isLocaleOpen && el && !el.closest(".st-appChrome__localeWrap")) isLocaleOpen = false;
  }
</script>

<svelte:window
  onclick={(e) => closeMenus(e.target)}
  onkeydown={(e) => {
    if (e.key === "Escape") {
      isThemeOpen = false;
      isLocaleOpen = false;
    }
  }}
/>

<!-- ── Marque ─────────────────────────────────────────────────────────────── -->
{#snippet brand()}
  <a class="st-appChrome__brand" href={brandHref} aria-label={brandLabel ?? ([brandName, productName].filter(Boolean).join(" ") || undefined)}>
    {#if logoSrc}
      <img class="st-appChrome__brandMark" src={logoSrc} alt={logoAlt} aria-hidden={logoAlt ? undefined : "true"} />
    {/if}
    {#if brandName || productName}
      <span class="st-appChrome__brandCopy">
        {#if brandName}<span class="st-appChrome__brandName">{brandName}</span>{/if}
        {#if productName}<span class="st-appChrome__brandProduct">{productName}</span>{/if}
      </span>
    {/if}
  </a>
{/snippet}

<!-- ── Nav principale ─────────────────────────────────────────────────────── -->
{#snippet navContent()}
  {#each visibleNav as item (item.href)}
    <a
      class="st-appChrome__navLink st-appHeader__navLink"
      class:st-appChrome__navLink--disabled={item.disabled}
      href={item.disabled ? undefined : item.href}
      aria-current={item.active ? "page" : undefined}
      aria-disabled={item.disabled ? "true" : undefined}
      aria-label={item.ariaLabel}
      target={item.disabled ? undefined : item.target}
      rel={navRel(item)}
      onclick={(event) => handleNavClick(event, item)}
    >
      {item.label}
    </a>
  {/each}
{/snippet}

<!-- ── Sélecteur de thème ─────────────────────────────────────────────────── -->
{#snippet themeSelector()}
  <div class="st-appChrome__themeWrap st-appChrome__menuWrap">
    <button
      type="button"
      class="st-appChrome__control st-appHeader__control"
      onclick={() => (isThemeOpen = !isThemeOpen)}
      aria-expanded={isThemeOpen}
      aria-haspopup="true"
      aria-label={themeLabel}
    >
      <Palette size={14} aria-hidden="true" />
      <span>{activeTheme?.label}</span>
      <ChevronDown size={12} class="st-appChrome__chevron {isThemeOpen ? 'is-rotated' : ''}" aria-hidden="true" />
    </button>
    {#if isThemeOpen}
      <div class="st-appChrome__menu" role="menu">
        {#each themes as option (option.id)}
          <button
            type="button"
            class="st-appChrome__menuItem"
            class:is-active={theme === option.id}
            role="menuitem"
            onclick={() => pickTheme(option.id)}
          >
            <span class="st-appChrome__check" aria-hidden="true">{#if theme === option.id}✓{/if}</span>
            <span>{option.label}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

<!-- ── Toggle mode couleur ────────────────────────────────────────────────── -->
{#snippet colorModeToggle()}
  <button
    type="button"
    class="st-appChrome__control st-appChrome__iconControl st-appHeader__control"
    onclick={cycleColorMode}
    aria-label={colorModeAriaLabel()}
  >
    {#if colorMode === "dark"}
      <Moon size={16} strokeWidth={2} aria-hidden="true" />
    {:else if colorMode === "light"}
      <Sun size={16} strokeWidth={2} aria-hidden="true" />
    {:else}
      <Sun size={16} strokeWidth={1.5} aria-hidden="true" style="opacity:0.65" />
    {/if}
  </button>
{/snippet}

<!-- ── Sélecteur de langue ────────────────────────────────────────────────── -->
{#snippet localeSelector()}
  <div class="st-appChrome__localeWrap st-appChrome__menuWrap">
    <button
      type="button"
      class="st-appChrome__control st-appHeader__control"
      onclick={() => (isLocaleOpen = !isLocaleOpen)}
      aria-expanded={isLocaleOpen}
      aria-haspopup="true"
      aria-label={localeLabel}
    >
      <Globe size={14} aria-hidden="true" />
      <span>{locale?.toUpperCase()}</span>
      <ChevronDown size={12} class="st-appChrome__chevron {isLocaleOpen ? 'is-rotated' : ''}" aria-hidden="true" />
    </button>
    {#if isLocaleOpen}
      <div class="st-appChrome__menu" role="menu">
        {#each (["fr", "en"] as AppChromeLocale[]) as value (value)}
          <button
            type="button"
            class="st-appChrome__menuItem"
            class:is-active={locale === value}
            role="menuitem"
            onclick={() => pickLocale(value)}
          >
            <span class="st-appChrome__check" aria-hidden="true">{#if locale === value}✓{/if}</span>
            <span>{value === "fr" ? "Français" : "English"}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

<!-- ── Lien GitHub ────────────────────────────────────────────────────────── -->
{#snippet githubLink()}
  <a
    class="st-appChrome__control st-appChrome__iconControl st-appHeader__control"
    href={githubHref}
    rel="noreferrer"
    target="_blank"
    aria-label={githubLabel}
  >
    <Github size={16} strokeWidth={2.1} aria-hidden="true" />
  </a>
{/snippet}

<!-- ── Zone de contrôles utilitaires (droite) ─────────────────────────────── -->
{#snippet utilityNav()}
  <div class="st-appChrome__utilityNav">
    {#if showThemeSelector}{@render themeSelector()}{/if}
    {#if showColorMode}{@render colorModeToggle()}{/if}
    {#if showLocaleSelector}{@render localeSelector()}{/if}
    {#if showGithub}{@render githubLink()}{/if}
    {#if identity}<div class="st-appChrome__identity">{@render identity()}</div>{/if}
    {#if extraSelectors}<div class="st-appChrome__extraSelectors">{@render extraSelectors()}</div>{/if}
  </div>
{/snippet}

<!-- ── Actions desktop (nav + contrôles dans une barre, burger mobile) ─────── -->
{#snippet actions()}
  {@render utilityNav()}
  <button
    type="button"
    class="st-appChrome__burgerTrigger"
    onclick={onMobileMenuToggle}
    aria-expanded={mobileMenuOpen}
    aria-controls={drawerId}
    aria-label={menuLabel}
  >
    <Menu size={20} aria-hidden="true" />
  </button>
{/snippet}

<div class={classes()}>
  <AppHeader
    class="st-appChrome__header"
    brandHref={brandHref}
    brandLabel={brandLabel}
    logo={brand}
    nav={navContent}
    actions={actions}
  />

  {#if mobileMenuOpen}
    <nav id={drawerId} class="st-appChrome__drawer" aria-label={navLabel}>
      <div class="st-appChrome__drawerSection">
        {#each visibleNav as item (item.href)}
          <a
            class="st-appChrome__drawerLink"
            class:st-appChrome__navLink--disabled={item.disabled}
            href={item.disabled ? undefined : item.href}
            aria-current={item.active ? "page" : undefined}
            aria-disabled={item.disabled ? "true" : undefined}
            aria-label={item.ariaLabel}
            target={item.disabled ? undefined : item.target}
            rel={navRel(item)}
            onclick={(event) => handleNavClick(event, item, true)}
          >
            {item.label}
          </a>
        {/each}
      </div>

      {#if showThemeSelector}
        <div class="st-appChrome__drawerSection">
          <span class="st-appChrome__drawerLabel">{themeLabel}</span>
          <div class="st-appChrome__drawerSwitcher">
            {#each themes as option (option.id)}
              <button
                type="button"
                class="st-appChrome__drawerBtn"
                class:is-active={theme === option.id}
                onclick={() => { onThemeChange?.(option.id); onMobileMenuToggle?.(); }}
              >
                {option.label}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#if showColorMode}
        <div class="st-appChrome__drawerSection">
          <span class="st-appChrome__drawerLabel">{colorModeLabels.light} / {colorModeLabels.dark}</span>
          <div class="st-appChrome__drawerSwitcher">
            {#each (["light", "dark", "auto"] as AppChromeColorMode[]) as mode (mode)}
              <button
                type="button"
                class="st-appChrome__drawerBtn"
                class:is-active={colorMode === mode}
                onclick={() => onColorModeChange?.(mode)}
              >
                {mode === "light" ? colorModeLabels.light : mode === "dark" ? colorModeLabels.dark : colorModeLabels.auto}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#if showLocaleSelector}
        <div class="st-appChrome__drawerSection">
          <span class="st-appChrome__drawerLabel">{localeLabel}</span>
          <div class="st-appChrome__drawerSwitcher">
            {#each (["fr", "en"] as AppChromeLocale[]) as value (value)}
              <button
                type="button"
                class="st-appChrome__drawerBtn"
                class:is-active={locale === value}
                onclick={() => { onLocaleChange?.(value); onMobileMenuToggle?.(); }}
              >
                {value === "fr" ? "Français" : "English"}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#if showGithub || identity}
        <div class="st-appChrome__drawerSection">
          {#if showGithub}
            <a class="st-appChrome__drawerLink" href={githubHref} rel="noreferrer" target="_blank">{githubLabel}</a>
          {/if}
          {#if identity}<div class="st-appChrome__identity">{@render identity()}</div>{/if}
        </div>
      {/if}
    </nav>
  {/if}
</div>

<style>
  /* Le markup, les classes et les tokens sont byte-identiques entre svelte/
     react/vue : la source de vérité du CSS est le bloc publié (styles.css).
     Ce <style> scoped ne fait que rendre la démo Svelte autonome. */
  .st-appChrome {
    position: sticky;
    top: 0;
    width: 100%;
    z-index: 30;
  }

  :global(.st-appChrome__header .st-appHeader__bar) {
    background: color-mix(in srgb, var(--st-semantic-surface-default) 96%, transparent);
    backdrop-filter: blur(8px);
    height: 5rem;
    max-width: none;
    padding: 0 var(--st-spacing-6, 1.5rem);
  }

  .st-appChrome__brand {
    align-items: center;
    color: var(--st-semantic-text-primary);
    display: inline-flex;
    flex: 0 0 auto;
    gap: var(--st-spacing-3, 0.75rem);
    min-width: 0;
    text-decoration: none;
  }

  .st-appChrome__brandMark {
    aspect-ratio: 1;
    display: inline-block;
    flex: 0 0 auto;
    height: 2rem;
    object-fit: contain;
    width: 2rem;
  }

  .st-appChrome__brandCopy {
    display: grid;
    gap: 0.08rem;
    line-height: 1;
    min-width: 0;
  }

  .st-appChrome__brandName {
    color: var(--st-semantic-text-primary);
    font-size: 1rem;
    font-weight: 760;
  }

  .st-appChrome__brandProduct {
    color: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
    font-weight: 650;
  }

  .st-appChrome__utilityNav {
    align-items: center;
    display: flex;
    gap: var(--st-spacing-1, 0.25rem);
  }

  .st-appChrome__menuWrap {
    display: inline-block;
    position: relative;
  }

  .st-appChrome__control {
    font-size: 0.75rem;
  }

  .st-appChrome__iconControl {
    justify-content: center;
    padding: 0;
    width: 2.25rem;
  }

  .st-appChrome__chevron {
    transition: transform var(--st-motion-fast, 120ms) ease;
  }

  :global(.st-appChrome__chevron.is-rotated) {
    transform: rotate(180deg);
  }

  .st-appChrome__menu {
    background: var(--st-semantic-surface-raised, var(--st-semantic-surface-default));
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-sm, 0.375rem);
    box-shadow: var(--st-shadow-medium, 0 8px 24px rgb(15 23 42 / 0.08));
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 8.5rem;
    padding: 0.25rem;
    position: absolute;
    right: 0;
    top: calc(100% + 4px);
    z-index: var(--st-zindex-overlay, 80);
  }

  .st-appChrome__menuItem {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: var(--st-radius-xs, 0.25rem);
    color: var(--st-semantic-text-secondary);
    cursor: pointer;
    display: flex;
    font: inherit;
    font-size: 0.82rem;
    font-weight: 550;
    gap: 0.45rem;
    padding: 0.35rem 0.65rem;
    text-align: left;
    width: 100%;
    transition: background-color var(--st-motion-fast, 120ms) ease,
      color var(--st-motion-fast, 120ms) ease;
  }

  .st-appChrome__menuItem:hover {
    background: var(--st-semantic-surface-subtle);
    color: var(--st-semantic-text-primary);
  }

  .st-appChrome__menuItem.is-active {
    color: var(--st-semantic-text-link);
    font-weight: 650;
  }

  .st-appChrome__check {
    align-items: center;
    display: inline-flex;
    font-size: 0.75rem;
    justify-content: center;
    width: 0.75rem;
  }

  .st-appChrome__burgerTrigger {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: var(--st-radius-xs, 0.25rem);
    color: var(--st-semantic-text-secondary);
    cursor: pointer;
    display: none;
    height: 2.25rem;
    justify-content: center;
    width: 2.25rem;
  }

  .st-appChrome__burgerTrigger:hover {
    background: var(--st-semantic-surface-subtle);
    color: var(--st-semantic-text-primary);
  }

  .st-appChrome__extraSelectors {
    align-items: center;
    display: flex;
    gap: var(--st-spacing-1, 0.25rem);
  }

  .st-appChrome__drawer {
    background: var(--st-semantic-surface-default);
    border-bottom: 1px solid var(--st-semantic-border-subtle);
    box-shadow: var(--st-shadow-medium, 0 10px 20px rgb(15 23 42 / 0.05));
    display: none;
    flex-direction: column;
    gap: var(--st-spacing-5, 1.25rem);
    padding: var(--st-spacing-5, 1.25rem);
  }

  .st-appChrome__drawerSection {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-appChrome__drawerLabel {
    color: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .st-appChrome__drawerLink {
    align-items: center;
    border-bottom: 1px solid var(--st-semantic-border-subtle);
    color: var(--st-semantic-text-primary);
    display: inline-flex;
    font-size: 1rem;
    font-weight: 650;
    gap: 0.45rem;
    padding: 0.45rem 0;
    text-decoration: none;
  }

  .st-appChrome__drawerLink[aria-current="page"],
  .st-appChrome__drawerLink:hover {
    color: var(--st-semantic-text-link);
  }

  .st-appChrome__drawerSwitcher {
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-appChrome__drawerBtn {
    background: var(--st-semantic-surface-subtle);
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-xs, 0.25rem);
    color: var(--st-semantic-text-secondary);
    cursor: pointer;
    flex: 1;
    font: inherit;
    font-size: 0.75rem;
    font-weight: 650;
    padding: 0.45rem;
  }

  .st-appChrome__drawerBtn.is-active {
    background: var(--st-semantic-border-interactive);
    border-color: var(--st-semantic-border-interactive);
    color: var(--st-semantic-text-on-emphasis, var(--st-semantic-surface-default));
  }

  @media (max-width: 767px) {
    .st-appChrome__utilityNav {
      display: none;
    }

    .st-appChrome__burgerTrigger {
      display: inline-flex;
    }

    .st-appChrome__drawer {
      display: flex;
    }
  }

  @media (min-width: 768px) {
    .st-appChrome__burgerTrigger {
      display: none;
    }
  }
</style>

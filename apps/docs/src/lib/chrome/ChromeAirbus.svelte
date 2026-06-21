<!--
  Chrome documentaire Airbus Design System
  Header : fond NAVY (#00205b), logo Airbus blanc + séparateur + titre app | tabs actif accent-haut | recherche | icônes.
  Sidebar : items simples, item actif surbrillance bleu Airbus + barre accent.
  Typo : Arial/Helvetica Neue (fallback typo propriétaire Airbus).
  Logo : /chrome/airbus/logo-white.svg (wordmark Airbus blanc, copie privée locale).
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { page } from "$app/state";
  import { Bell, ChevronDown, CircleQuestionMark, Github, Menu, Search as SearchIcon, X } from "@lucide/svelte";
  import {
    DOCS_UTILITY_NAV,
    DOCS_VERSION,
    buildFoundationNav,
    buildComponentNavGroups,
    buildViewsNav,
    buildTopNav,
    resolveBreadcrumb,
    type ComponentNavItem,
    type ViewNavItem
  } from "$lib/docs-navigation";
  import { locale } from "$lib/locale.svelte";

  type Props = {
    children: Snippet;
    activeThemeId: string;
    isThemeOpen: boolean;
    onThemeToggle: () => void;
    onSearchOpen: () => void;
    themeSwitcher: Snippet;
    frameworkSwitcher: Snippet;
    localeSwitcher: Snippet;
    compareButton: Snippet;
    colorModeToggle: Snippet;
    mobileMenuOpen: boolean;
    onMobileMenuToggle: () => void;
  };

  let {
    children,
    onSearchOpen,
    themeSwitcher,
    frameworkSwitcher,
    localeSwitcher,
    compareButton,
    colorModeToggle,
    mobileMenuOpen,
    onMobileMenuToggle,
  }: Props = $props();

  const topNavItems = $derived(buildTopNav(locale.value));
  const foundationNavItems = $derived(buildFoundationNav(locale.value));
  const componentGroups = $derived(buildComponentNavGroups(locale.value));
  const viewsGroups = $derived(buildViewsNav(locale.value));
  const breadcrumbs = $derived(resolveBreadcrumb(page.url.pathname, locale.value));

  function isActive(href: string): boolean {
    const pathname = page.url.pathname;
    const hash = page.url.hash;
    if (href === "/") return pathname === "/";
    if (href === "/#components") return pathname.startsWith("/components") || (pathname === "/" && hash === "#components");
    if (href.startsWith("/#")) return pathname === "/" && hash === href.slice(1);
    const route = href.split("#")[0];
    return pathname === route || (route !== "/" && pathname.startsWith(route));
  }

  function isComponentActive(item: ComponentNavItem): boolean {
    return page.url.pathname === `/components/${item.slug}`;
  }

  function isSidebarDocActive(href: string): boolean {
    if (href === "/") return page.url.pathname === "/" && !page.url.hash;
    if (href.startsWith("/#")) return page.url.pathname === "/" && page.url.hash === href.slice(1);
    return isActive(href);
  }

  function isGroupOpen(items: ComponentNavItem[]): boolean {
    return items.some((item) => isComponentActive(item));
  }

  function isViewActive(item: ViewNavItem): boolean {
    return page.url.pathname === `/views/${item.slug}`;
  }

  function isViewGroupOpen(items: ViewNavItem[]): boolean {
    return items.some((item) => isViewActive(item));
  }

  function handleSearchKeydown(event: KeyboardEvent) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSearchOpen();
  }
</script>

<div class="abus-shell">
  <!-- ── HEADER Airbus (fond NAVY, conforme à la référence utilisateur) ── -->
  <header class="abus-header" aria-label="Airbus Design System">
    <div class="abus-header__inner">

      <!-- Gauche : logo blanc + séparateur + App Name -->
      <div class="abus-header__brand-group">
        <a class="abus-header__brand" href="/" aria-label="Airbus Design System accueil">
          <!-- Logo Airbus wordmark blanc (SVG privé, non versionné Git) -->
          <img
            src="/chrome/airbus/logo-white.svg"
            alt="Airbus"
            class="abus-header__logo"
            height="28"
            aria-hidden="true"
          />
        </a>
        <!-- Séparateur vertical fin -->
        <span class="abus-header__sep" aria-hidden="true"></span>
        <!-- Titre application -->
        <span class="abus-header__app-name">Design System</span>
      </div>

      <!-- Centre : onglets de navigation (Tab Label), actif = fond bleu clair + accent haut) -->
      <nav class="abus-header__tabs" aria-label="Navigation principale">
        {#each topNavItems.slice(0, 6) as item (item.href)}
          <a
            class="abus-header__tab"
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
          >{item.label}</a>
        {/each}
      </nav>

      <!-- Droite : recherche + icônes + switchers docs -->
      <div class="abus-header__actions">
        <!-- SearchInput Airbus compact : ouvre la palette docs. -->
        <div class="abus-header__search" role="search">
          <label class="abus-header__search-label" for="abus-header-search-input">
            {locale.value === "fr" ? "Rechercher" : "Search"}
          </label>
          <div class="abus-header__search-group">
            <input
              id="abus-header-search-input"
              class="abus-header__search-input"
              type="search"
              readonly
              placeholder={locale.value === "fr" ? "Rechercher…" : "Search…"}
              aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
              aria-haspopup="dialog"
              onclick={onSearchOpen}
              onkeydown={handleSearchKeydown}
            />
            <button
              type="button"
              class="abus-header__search-btn"
              aria-label={locale.value === "fr" ? "Lancer la recherche" : "Open search"}
              aria-haspopup="dialog"
              onclick={onSearchOpen}
            >
              <SearchIcon size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </div>
        <!-- Icône Notifications -->
        <a
          class="abus-header__icon-btn"
          href="/components/notification"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={16} strokeWidth={1.8} aria-hidden="true" />
        </a>
        <!-- Icône Aide -->
        <a
          class="abus-header__icon-btn"
          href="/components/overlays"
          aria-label="Aide"
          title="Aide"
        >
          <CircleQuestionMark size={16} strokeWidth={1.8} aria-hidden="true" />
        </a>
        <!-- Switchers framework / thème / langue (outils docs) -->
        {@render compareButton()}
        {@render frameworkSwitcher()}
        {@render themeSwitcher()}
        {@render colorModeToggle()}
        {@render localeSwitcher()}
        <!-- Burger mobile -->
        <button
          type="button"
          class="abus-header__burger"
          onclick={onMobileMenuToggle}
          aria-expanded={mobileMenuOpen}
          aria-label="Menu principal"
        >
          {#if mobileMenuOpen}
            <X size={20} strokeWidth={1.8} aria-hidden="true" />
          {:else}
            <Menu size={20} strokeWidth={1.8} aria-hidden="true" />
          {/if}
        </button>
      </div>
    </div>
  </header>

  <!-- ── BODY Airbus ── -->
  <div class="abus-body">
    <!-- Sidebar -->
    <aside class="abus-sidebar" aria-label="Navigation de la documentation">
      <nav class="abus-side-nav" aria-label="Sommaire">
        <ul class="abus-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="abus-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="abus-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="abus-side-group" open={isGroupOpen(group.items)}>
                <summary class="abus-side-group__summary">
                  <ChevronDown class="abus-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="abus-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="abus-side-link abus-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="abus-side-divider" role="separator"></li>

          <li>
            <a
              class="abus-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="abus-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="abus-side-group__summary">
                  <ChevronDown class="abus-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="abus-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="abus-side-link abus-side-link--sub"
                        href={item.href}
                        aria-current={isViewActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}
                </ul>
              </details>
            </li>
          {/each}
        </ul>
      </nav>

      <!-- Pied de barre latérale : version + GitHub (déplacés du header). -->
      <div class="abus-sidebar-footer">
        <span class="abus-version">{DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="abus-sidebar-github"
            href={item.href}
            rel={item.external ? "noreferrer" : undefined}
            target={item.external ? "_blank" : undefined}
            aria-label={item.label}
          >
            <Github size={15} strokeWidth={2} aria-hidden="true" />
            <span>{item.label}</span>
          </a>
        {/each}
      </div>
    </aside>

    <!-- Contenu principal -->
    <div class="abus-content">
      <!-- Fil d'Ariane -->
      <nav class="abus-breadcrumb" aria-label="Fil d'Ariane">
        <ol class="abus-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="abus-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="abus-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>
</div>

<style>
  /* ── Variables Airbus ── */
  .abus-shell {
    --abus-navy: #00205B;
    --abus-navy-hover: #003080;
    --abus-tab-active-bg: #1a3a7a; /* bleu légèrement plus clair que navy pour onglet actif */
    --abus-tab-accent: #4d9cf4; /* accent bleu clair sur le dessus de l'onglet actif */
    --abus-blue: #1565C0;
    --abus-blue-light: #E3F2FD;
    --abus-blue-accent: #1E88E5;
    --abus-gray-100: #F7F9FB;
    --abus-gray-200: #ECEFF4;
    --abus-gray-500: #78909C;
    --abus-border: #D1D9E0;
    --abus-text: #1A2332;
    --abus-white: #ffffff;
    --abus-sidebar-width: 16.5rem;
    --abus-header-height: 4rem;
    font-family: 'Arial', 'Helvetica Neue', sans-serif;
    background: var(--abus-gray-100);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Airbus (fond NAVY) ── */
  .abus-header {
    background: var(--abus-navy);
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .abus-header__inner {
    align-items: stretch;
    display: flex;
    gap: 0;
    height: var(--abus-header-height);
    margin: 0 auto;
    max-width: 90rem;
    padding: 0 1.25rem;
  }

  /* Groupe gauche : logo + séparateur + app name */
  .abus-header__brand-group {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0;
    padding-right: 1.5rem;
  }

  .abus-header__brand {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .abus-header__brand:hover {
    opacity: 0.85;
    text-decoration: none;
  }

  .abus-header__logo {
    display: block;
    height: 1.75rem; /* ~28px */
    width: auto;
  }

  /* Séparateur vertical fin entre logo et app name */
  .abus-header__sep {
    background: rgba(255, 255, 255, 0.3);
    display: block;
    height: 1.5rem;
    margin: 0 0.875rem;
    width: 1px;
  }

  .abus-header__app-name {
    color: rgba(255, 255, 255, 0.75);
    font-size: 0.875rem;
    font-weight: 400;
    letter-spacing: 0.01em;
    white-space: nowrap;
  }

  /* ── Tabs de navigation (centre) ── */
  .abus-header__tabs {
    align-items: stretch;
    display: flex;
    flex: 1 1 auto;
    gap: 0;
    overflow: hidden;
  }

  .abus-header__tab {
    align-items: center;
    border-top: 3px solid transparent; /* accent en HAUT pour l'état actif */
    color: rgba(255, 255, 255, 0.8);
    display: inline-flex;
    font-size: 0.875rem;
    font-weight: 500;
    height: 100%;
    padding: 0 1rem;
    text-decoration: none;
    transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .abus-header__tab:hover,
  .abus-header__tab:focus-visible {
    background: var(--abus-navy-hover);
    color: var(--abus-white);
    text-decoration: none;
    outline: none;
  }

  /* Onglet actif : fond bleu légèrement plus clair + accent TOP bleu vif */
  .abus-header__tab[aria-current="page"] {
    background: var(--abus-tab-active-bg);
    border-top-color: var(--abus-tab-accent);
    color: var(--abus-white);
    font-weight: 600;
  }

  /* ── Actions droite ── */
  .abus-header__actions {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.25rem;
    padding-left: 0.75rem;
  }

  /* Icônes loupe / cloche / aide */
  .abus-header__icon-btn {
    align-items: center;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    display: inline-flex;
    height: 2.25rem;
    justify-content: center;
    padding: 0;
    text-decoration: none;
    transition: background 120ms ease, color 120ms ease;
    width: 2.25rem;
  }

  .abus-header__icon-btn:hover,
  .abus-header__icon-btn:focus-visible {
    background: rgba(255, 255, 255, 0.12);
    color: var(--abus-white);
    outline: none;
  }

  /* Overrides switchers framework/thème/langue dans header NAVY Airbus.
     Les TROIS wrappers (framework + thème + langue) reçoivent le même centrage
     vertical : sans `.docs-framework-wrapper`, le sélecteur de framework était
     décentré dans le header 4rem (parité incohérente avec thème/langue). Tous
     restent `position: relative` (base app.css) → le menu déroulant absolu
     s'ancre correctement et reste cliquable. */
  .abus-header__actions :global(.docs-framework-wrapper),
  .abus-header__actions :global(.docs-theme-wrapper),
  .abus-header__actions :global(.docs-locale-wrapper) {
    height: 100%;
    display: flex;
    align-items: center;
  }

  .abus-header__actions :global(.docs-header-control) {
    background: transparent;
    border-color: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.8);
    font-family: inherit;
    font-size: 0.8125rem;
  }

  .abus-header__actions :global(.docs-header-control:hover),
  .abus-header__actions :global(.docs-header-control[aria-expanded="true"]) {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.5);
    color: var(--abus-white);
    box-shadow: none;
  }

  /* SearchInput Airbus compact, visible sur le bandeau navy. */
  .abus-header__search {
    width: clamp(9rem, 14vw, 13rem);
  }

  .abus-header__search-label {
    clip: rect(0 0 0 0);
    border: 0;
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  .abus-header__search-group {
    display: flex;
    width: 100%;
  }

  .abus-header__search-input {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px 0 0 4px;
    border-right: 0;
    color: var(--abus-white);
    cursor: pointer;
    flex: 1 1 auto;
    font: inherit;
    font-size: 0.8125rem;
    height: 2.25rem;
    min-width: 0;
    padding: 0 0.75rem;
  }

  .abus-header__search-input::placeholder {
    color: rgba(255, 255, 255, 0.72);
  }

  .abus-header__search-input:hover,
  .abus-header__search-input:focus-visible {
    background: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.6);
    color: var(--abus-white);
    outline: none;
  }

  .abus-header__search-btn {
    align-items: center;
    background: rgba(255, 255, 255, 0.18);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 0 4px 4px 0;
    color: var(--abus-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 2.25rem;
    height: 2.25rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease;
  }

  .abus-header__search-btn:hover,
  .abus-header__search-btn:focus-visible {
    background: rgba(255, 255, 255, 0.28);
    border-color: rgba(255, 255, 255, 0.6);
    outline: none;
  }

  .abus-header__actions :global(.docs-dropdown-panel .st-menu) {
    background: #0a2d6e;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    color: rgba(255, 255, 255, 0.8);
  }

  .abus-header__actions :global(.docs-dropdown-panel .st-menu__item:hover:not(:disabled)),
  .abus-header__actions :global(.docs-dropdown-panel .st-menu__item:focus-visible) {
    background: rgba(255, 255, 255, 0.1);
    color: var(--abus-white);
  }

  .abus-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--abus-white);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body ── */
  .abus-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--abus-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 90rem;
    width: 100%;
  }

  /* ── Sidebar Airbus ── */
  .abus-sidebar {
    background: var(--abus-white);
    border-right: 1px solid var(--abus-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - var(--abus-header-height));
    position: sticky;
    top: var(--abus-header-height);
  }

  .abus-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  /* Pied de barre latérale Airbus : version + GitHub épinglés en bas. */
  .abus-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--abus-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .abus-version {
    color: var(--abus-gray-500);
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .abus-sidebar-github {
    align-items: center;
    color: var(--abus-blue);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .abus-sidebar-github:hover,
  .abus-sidebar-github:focus-visible {
    color: var(--abus-navy);
    text-decoration: none;
  }

  .abus-side-list,
  .abus-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .abus-side-link {
    border-left: 3px solid transparent;
    color: var(--abus-text);
    display: block;
    font-size: 0.875rem;
    min-height: 2.5rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    line-height: 1.4;
  }

  .abus-side-link:hover,
  .abus-side-link:focus-visible {
    background: var(--abus-gray-200);
    color: var(--abus-navy);
    text-decoration: none;
  }

  .abus-side-link[aria-current="page"] {
    background: var(--abus-blue-light);
    border-left-color: var(--abus-navy);
    color: var(--abus-navy);
    font-weight: 700;
  }

  .abus-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2rem;
    padding-left: calc(2rem - 3px);
  }

  .abus-side-divider {
    border-top: 1px solid var(--abus-border);
    margin: 0.5rem 0;
  }

  .abus-side-group {
    display: block;
  }

  .abus-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--abus-gray-500);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 700;
    gap: 0.35rem;
    letter-spacing: 0.06em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 1rem 0 calc(1rem - 3px);
    text-transform: uppercase;
    transition: background 120ms ease;
  }

  .abus-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .abus-side-group__summary:hover,
  .abus-side-group__summary:focus-visible {
    background: var(--abus-gray-200);
    outline: none;
  }

  .abus-side-group :global(.abus-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .abus-side-group:not([open]) :global(.abus-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu ── */
  .abus-content {
    min-width: 0;
    padding: 1.75rem 2.5rem 4rem;
  }

  .abus-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .abus-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .abus-breadcrumb__item {
    align-items: center;
    color: var(--abus-gray-500);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .abus-breadcrumb__item + .abus-breadcrumb__item::before {
    color: var(--abus-gray-500);
    content: "/";
    margin: 0 0.4rem;
  }

  .abus-breadcrumb__link {
    color: var(--abus-blue);
    text-decoration: underline;
  }

  .abus-breadcrumb__item span[aria-current="page"] {
    color: var(--abus-text);
    font-weight: 600;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .abus-body {
      grid-template-columns: 1fr;
    }

    .abus-sidebar {
      display: none;
    }

    .abus-header__tabs {
      display: none;
    }

    .abus-header__icon-btn {
      display: none;
    }

    .abus-header__search {
      width: 2.25rem;
    }

    .abus-header__search-input {
      display: none;
    }

    .abus-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .abus-header__tab,
    .abus-header__icon-btn,
    .abus-header__search-btn,
    .abus-side-link,
    .abus-side-group :global(.abus-side-group__icon) {
      transition: none;
    }
  }
</style>

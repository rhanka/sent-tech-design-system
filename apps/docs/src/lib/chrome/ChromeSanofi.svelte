<!--
  Chrome documentaire Sanofi (sanofi.com — santé, rebrand 2022 « Play to win »).
  Forme fidèle au nouveau Sanofi : violet de marque vif, blanc, moderne, sobre.
  - Header : bandeau BLANC, logo OFFICIEL Sanofi 2022 (wordmark « sanofi » violet)
    à gauche, nav au centre, recherche VIOLETTE à droite
  - Onglet actif = SOULIGNÉ violet ; item sidebar actif = liseré violet + fond
    violet très clair (#faf5ff)
  - Couleurs MESURÉES (--elements-core-brand-*) : violet #7a00e6 (primaire, survol
    #5718b0, focus #3c217b), encre #171717, secondaire #5d5d5d, surface #f5f5f5,
    bordure #e4e4e4, bordure forte #c9c9c9
  - Logo OFFICIEL Sanofi 2022 (vecteur violet, Wikimedia Commons) via
    /chrome/sanofi/logo.svg
  - Typo : « Sanofi Sans » propriétaire → repli 'Work Sans', 'Raleway', 'Roboto',
    system-ui (aucune police réseau chargée)
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { page } from "$app/state";
  import { ChevronDown, Github, Menu, Search as SearchIcon, X } from "@lucide/svelte";
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
</script>

<div class="san-shell">
  <!-- ── HEADER Sanofi ── -->
  <div class="san-header-wrap">
    <header class="san-header" aria-label="Sanofi">
      <div class="san-header__inner">
        <!-- Gauche : logo officiel Sanofi -->
        <div class="san-header__brand">
          <a href="/" class="san-header__brand-link" aria-label="Accueil : Sanofi Design System">
            <img
              src="/chrome/sanofi/logo.svg"
              alt="Sanofi"
              class="san-logo"
              width="98"
              height="26"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="san-nav" aria-label="Navigation principale">
          <ul class="san-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="san-nav__item">
                <a
                  class="san-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </nav>

        <!-- Droite : outils + recherche -->
        <div class="san-header__tools">
          <button
            type="button"
            class="san-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="san-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render colorModeToggle()}
            {@render localeSwitcher()}
          </div>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="san-header__burger"
          onclick={onMobileMenuToggle}
          aria-expanded={mobileMenuOpen}
          aria-label="Menu"
        >
          {#if mobileMenuOpen}
            <X size={20} strokeWidth={1.8} aria-hidden="true" />
          {:else}
            <Menu size={20} strokeWidth={1.8} aria-hidden="true" />
          {/if}
        </button>
      </div>
    </header>
  </div>

  <!-- ── BODY Sanofi ── -->
  <div class="san-body">
    <!-- Sidebar -->
    <aside class="san-sidebar" aria-label="Navigation de la documentation">
      <nav class="san-side-nav" aria-label="Sommaire">
        <ul class="san-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="san-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="san-side-divider" role="separator"></li>

          <li class="san-side-heading">
            <a
              class="san-side-link san-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="san-side-group" open={isGroupOpen(group.items)}>
                <summary class="san-side-group__summary">
                  <ChevronDown class="san-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="san-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="san-side-link san-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="san-side-divider" role="separator"></li>

          <li class="san-side-heading">
            <a
              class="san-side-link san-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="san-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="san-side-group__summary">
                  <ChevronDown class="san-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="san-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="san-side-link san-side-link--sub"
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
      </nav>

      <!-- Pied de barre latérale : version + GitHub. -->
      <div class="san-sidebar-footer">
        <span class="san-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="san-sidebar-github"
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

    <!-- Contenu principal + fil d'Ariane -->
    <div class="san-content">
      <nav class="san-breadcrumb" aria-label="Breadcrumb">
        <ol class="san-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="san-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="san-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Sanofi ── -->
  <footer class="san-footer" aria-label="Pied de page Sanofi">
    <div class="san-footer__inner">
      <nav class="san-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="san-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/sanofi/logo.svg"
        alt="Sanofi"
        class="san-footer__logo"
        width="86"
        height="23"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Sanofi ── */
  .san-shell {
    --san-primary: #7a00e6; /* violet de marque (--elements-core-brand-base) */
    --san-primary-hover: #5718b0; /* violet survol (--brand-dark) */
    --san-primary-light: #faf5ff; /* violet très clair (item actif sidebar) */
    --san-ink: #171717; /* texte par défaut (neutral-900) */
    --san-secondary: #5d5d5d; /* texte secondaire (neutral-600) */
    --san-subtle: #f5f5f5; /* surface (neutral-50) */
    --san-border: #e4e4e4; /* bordure subtile (neutral-100) */
    --san-border-strong: #c9c9c9; /* bordure champ (neutral-200) */
    --san-focus: #3c217b; /* focus violet (--brand-darker, MESURÉ) */
    --san-white: #fff;
    --san-sidebar-width: 17rem;
    --san-radius: 8px;
    font-family: 'Sanofi Sans', 'Work Sans', 'Raleway', 'Roboto', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--san-white);
    color: var(--san-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Sanofi ── */
  .san-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .san-header {
    background: var(--san-white);
    border-bottom: 1px solid var(--san-border);
  }

  .san-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .san-header__brand {
    flex: 0 0 auto;
  }

  .san-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 150ms ease;
  }

  .san-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Sanofi (ratio préservé). */
  .san-logo {
    display: block;
    width: auto;
    height: 26px;
  }

  /* ── Nav horizontale (centre) ── */
  .san-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .san-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .san-nav__item {
    flex: 0 0 auto;
  }

  .san-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--san-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: none;
    letter-spacing: normal;
    transition: border-color 150ms ease, color 150ms ease;
    white-space: nowrap;
  }

  .san-nav__link:hover,
  .san-nav__link:focus-visible {
    color: var(--san-primary);
    outline: none;
  }

  .san-nav__link[aria-current="page"] {
    border-bottom-color: var(--san-primary);
    color: var(--san-primary);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .san-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .san-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Sanofi. */
  .san-header__tools-links :global(.docs-header-control) {
    background: var(--san-white);
    border-color: var(--san-border-strong);
    border-radius: var(--san-radius);
    color: var(--san-ink);
    font-family: inherit;
  }

  .san-header__tools-links :global(.docs-header-control:hover),
  .san-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--san-subtle);
    border-color: var(--san-primary);
    color: var(--san-primary);
    box-shadow: none;
  }

  /* Recherche Sanofi : bouton loupe compact. */
  .san-search__btn {
    align-items: center;
    background: var(--san-primary);
    border: 1px solid var(--san-primary);
    border-radius: var(--san-radius);
    color: var(--san-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 150ms ease, border-color 150ms ease;
  }

  .san-search__btn:hover,
  .san-search__btn:focus-visible {
    background: var(--san-primary-hover);
    border-color: var(--san-primary-hover);
    outline: 2px solid var(--san-focus);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .san-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--san-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Sanofi ── */
  .san-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--san-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Sanofi ── */
  .san-sidebar {
    background: var(--san-white);
    border-right: 1px solid var(--san-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .san-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .san-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--san-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .san-version-badge {
    background: var(--san-subtle);
    border: 1px solid var(--san-border);
    border-radius: var(--san-radius);
    color: var(--san-primary);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .san-sidebar-github {
    align-items: center;
    color: var(--san-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 150ms ease;
  }

  .san-sidebar-github:hover,
  .san-sidebar-github:focus-visible {
    color: var(--san-primary);
  }

  .san-side-list,
  .san-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .san-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--san-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
  }

  .san-side-link:hover,
  .san-side-link:focus-visible {
    background: var(--san-subtle);
    color: var(--san-primary);
    text-decoration: none;
  }

  .san-side-link[aria-current="page"] {
    background: var(--san-primary-light);
    border-left-color: var(--san-primary);
    color: var(--san-primary-hover);
    font-weight: 700;
    text-decoration: none;
  }

  .san-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .san-side-divider {
    border-top: 1px solid var(--san-border);
    margin: 0.5rem 0;
  }

  .san-side-group {
    display: block;
  }

  .san-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--san-secondary);
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
    transition: background 150ms ease;
  }

  .san-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .san-side-group__summary:hover,
  .san-side-group__summary:focus-visible {
    background: var(--san-subtle);
    outline: none;
  }

  .san-side-group :global(.san-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 150ms ease;
  }

  .san-side-group:not([open]) :global(.san-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .san-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .san-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .san-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .san-breadcrumb__item {
    align-items: center;
    color: var(--san-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .san-breadcrumb__item + .san-breadcrumb__item::before {
    color: var(--san-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .san-breadcrumb__link {
    color: var(--san-primary);
    text-decoration: none;
  }

  .san-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .san-breadcrumb__item span[aria-current="page"] {
    color: var(--san-ink);
    font-weight: 600;
  }

  /* ── Footer Sanofi ── */
  .san-footer {
    background: var(--san-subtle);
    border-top: 1px solid var(--san-border);
    margin-top: auto;
  }

  .san-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .san-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .san-footer__link {
    color: var(--san-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .san-footer__link:hover {
    color: var(--san-primary);
    text-decoration: underline;
  }

  .san-footer__logo {
    display: block;
    width: auto;
    height: 23px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .san-body {
      grid-template-columns: 1fr;
    }

    .san-sidebar {
      display: none;
    }

    .san-nav {
      display: none;
    }

    .san-header__tools {
      display: none;
    }

    .san-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .san-nav__link,
    .san-search__btn,
    .san-side-link,
    .san-side-group :global(.san-side-group__icon) {
      transition: none;
    }
  }
</style>

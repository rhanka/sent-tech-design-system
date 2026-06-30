<!--
  Chrome documentaire Dassault Systèmes (www.3ds.com — logiciels 3D / PLM / 3DEXPERIENCE).
  Forme fidèle au site corporate 3DS : clair, bleu corporate profond, sobre.
  - Header : bandeau BLANC, logo OFFICIEL Dassault Systèmes (bleu corporate) à gauche,
    nav au centre, recherche BLEUE à droite
  - Onglet actif = SOULIGNÉ bleu corporate #005386 + texte bleu ; item sidebar actif =
    liseré bleu + fond bleu très clair ; anneau focus = bleu vif #0870d3 (mesuré)
  - Couleurs MESURÉES (theme-dassault-systemes index.ts) : bleu corporate #005386
    (action/titres, survol #00406a), bleu vif #0870d3 (focus/info), cyan #009eff (accent
    compass), encre #2d2d2d, gris #5f7384, surface #f4f6f8, bordure #e3e7ec
  - Logo OFFICIEL Dassault Systèmes (vecteur Wikimedia) via <img src="/chrome/dassault-systemes/logo.svg">
  - Typo : « 3ds » propriétaire référencée par NOM → repli système (aucune police réseau)
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

<div class="ds-shell">
  <!-- ── HEADER Dassault Systèmes ── -->
  <div class="ds-header-wrap">
    <header class="ds-header" aria-label="Dassault Systèmes">
      <div class="ds-header__inner">
        <!-- Gauche : logo officiel Dassault Systèmes -->
        <div class="ds-header__brand">
          <a href="/" class="ds-header__brand-link" aria-label="Accueil : Dassault Systèmes Design System">
            <img
              src="/chrome/dassault-systemes/logo.svg"
              alt="Dassault Systèmes"
              class="ds-logo"
              width="112"
              height="34"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="ds-nav" aria-label="Navigation principale">
          <ul class="ds-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="ds-nav__item">
                <a
                  class="ds-nav__link"
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
        <div class="ds-header__tools">
          <button
            type="button"
            class="ds-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="ds-header__tools-links">
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
          class="ds-header__burger"
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

  <!-- ── BODY Dassault Systèmes ── -->
  <div class="ds-body">
    <!-- Sidebar -->
    <aside class="ds-sidebar" aria-label="Navigation de la documentation">
      <nav class="ds-side-nav" aria-label="Sommaire">
        <ul class="ds-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="ds-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="ds-side-divider" role="separator"></li>

          <li class="ds-side-heading">
            <a
              class="ds-side-link ds-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="ds-side-group" open={isGroupOpen(group.items)}>
                <summary class="ds-side-group__summary">
                  <ChevronDown class="ds-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="ds-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="ds-side-link ds-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="ds-side-divider" role="separator"></li>

          <li class="ds-side-heading">
            <a
              class="ds-side-link ds-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="ds-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="ds-side-group__summary">
                  <ChevronDown class="ds-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="ds-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="ds-side-link ds-side-link--sub"
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
      <div class="ds-sidebar-footer">
        <span class="ds-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="ds-sidebar-github"
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
    <div class="ds-content">
      <nav class="ds-breadcrumb" aria-label="Breadcrumb">
        <ol class="ds-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="ds-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="ds-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Dassault Systèmes ── -->
  <footer class="ds-footer" aria-label="Pied de page Dassault Systèmes">
    <div class="ds-footer__inner">
      <nav class="ds-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="ds-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/dassault-systemes/logo.svg"
        alt="Dassault Systèmes"
        class="ds-footer__logo"
        width="99"
        height="30"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Dassault Systèmes ── */
  .ds-shell {
    --ds-primary: #005386; /* bleu corporate 3DS — action / titres / liens */
    --ds-primary-hover: #00406a; /* bleu corporate survol */
    --ds-primary-light: #e9f7ff; /* bleu très clair (item actif sidebar) */
    --ds-bright: #0870d3; /* bleu vif mesuré — anneau focus / info */
    --ds-ink: #2d2d2d; /* corps de texte (mesuré) */
    --ds-secondary: #5f7384; /* texte secondaire (grey 500) */
    --ds-subtle: #f4f6f8; /* surface alt (mesurée) */
    --ds-border: #e3e7ec; /* bordure subtile (mesurée — champ) */
    --ds-border-strong: #cbd1d8; /* bordure forte (dérivée) */
    --ds-white: #fff;
    --ds-sidebar-width: 17rem;
    --ds-radius: 4px;
    font-family: '3ds', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--ds-white);
    color: var(--ds-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Dassault Systèmes ── */
  .ds-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .ds-header {
    background: var(--ds-white);
    border-bottom: 1px solid var(--ds-border);
  }

  .ds-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .ds-header__brand {
    flex: 0 0 auto;
  }

  .ds-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 150ms ease;
  }

  .ds-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Dassault Systèmes (ratio préservé). */
  .ds-logo {
    display: block;
    width: auto;
    height: 34px;
  }

  /* ── Nav horizontale (centre) ── */
  .ds-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .ds-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ds-nav__item {
    flex: 0 0 auto;
  }

  .ds-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--ds-ink);
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

  .ds-nav__link:hover,
  .ds-nav__link:focus-visible {
    color: var(--ds-primary);
    outline: none;
  }

  .ds-nav__link[aria-current="page"] {
    border-bottom-color: var(--ds-primary);
    color: var(--ds-primary);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .ds-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .ds-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Dassault Systèmes. */
  .ds-header__tools-links :global(.docs-header-control) {
    background: var(--ds-white);
    border-color: var(--ds-border-strong);
    border-radius: var(--ds-radius);
    color: var(--ds-ink);
    font-family: inherit;
  }

  .ds-header__tools-links :global(.docs-header-control:hover),
  .ds-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--ds-subtle);
    border-color: var(--ds-primary);
    color: var(--ds-primary);
    box-shadow: none;
  }

  /* Recherche Dassault Systèmes : bouton loupe compact. */
  .ds-search__btn {
    align-items: center;
    background: var(--ds-primary);
    border: 1px solid var(--ds-primary);
    border-radius: var(--ds-radius);
    color: var(--ds-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 150ms ease, border-color 150ms ease;
  }

  .ds-search__btn:hover,
  .ds-search__btn:focus-visible {
    background: var(--ds-primary-hover);
    border-color: var(--ds-primary-hover);
    outline: 2px solid var(--ds-bright);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .ds-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--ds-primary);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Dassault Systèmes ── */
  .ds-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--ds-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Dassault Systèmes ── */
  .ds-sidebar {
    background: var(--ds-white);
    border-right: 1px solid var(--ds-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .ds-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .ds-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--ds-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .ds-version-badge {
    background: var(--ds-subtle);
    border: 1px solid var(--ds-border);
    border-radius: var(--ds-radius);
    color: var(--ds-primary);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .ds-sidebar-github {
    align-items: center;
    color: var(--ds-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 150ms ease;
  }

  .ds-sidebar-github:hover,
  .ds-sidebar-github:focus-visible {
    color: var(--ds-primary);
  }

  .ds-side-list,
  .ds-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ds-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--ds-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
  }

  .ds-side-link:hover,
  .ds-side-link:focus-visible {
    background: var(--ds-subtle);
    color: var(--ds-primary);
    text-decoration: none;
  }

  .ds-side-link[aria-current="page"] {
    background: var(--ds-primary-light);
    border-left-color: var(--ds-primary);
    color: var(--ds-primary);
    font-weight: 700;
    text-decoration: none;
  }

  .ds-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .ds-side-divider {
    border-top: 1px solid var(--ds-border);
    margin: 0.5rem 0;
  }

  .ds-side-group {
    display: block;
  }

  .ds-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--ds-secondary);
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

  .ds-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .ds-side-group__summary:hover,
  .ds-side-group__summary:focus-visible {
    background: var(--ds-subtle);
    outline: none;
  }

  .ds-side-group :global(.ds-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 150ms ease;
  }

  .ds-side-group:not([open]) :global(.ds-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .ds-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .ds-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .ds-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ds-breadcrumb__item {
    align-items: center;
    color: var(--ds-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .ds-breadcrumb__item + .ds-breadcrumb__item::before {
    color: var(--ds-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .ds-breadcrumb__link {
    color: var(--ds-primary);
    text-decoration: none;
  }

  .ds-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .ds-breadcrumb__item span[aria-current="page"] {
    color: var(--ds-ink);
    font-weight: 600;
  }

  /* ── Footer Dassault Systèmes ── */
  .ds-footer {
    background: var(--ds-subtle);
    border-top: 1px solid var(--ds-border);
    margin-top: auto;
  }

  .ds-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .ds-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .ds-footer__link {
    color: var(--ds-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .ds-footer__link:hover {
    color: var(--ds-primary);
    text-decoration: underline;
  }

  .ds-footer__logo {
    display: block;
    width: auto;
    height: 30px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .ds-body {
      grid-template-columns: 1fr;
    }

    .ds-sidebar {
      display: none;
    }

    .ds-nav {
      display: none;
    }

    .ds-header__tools {
      display: none;
    }

    .ds-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .ds-nav__link,
    .ds-search__btn,
    .ds-side-link,
    .ds-side-group :global(.ds-side-group__icon) {
      transition: none;
    }
  }
</style>

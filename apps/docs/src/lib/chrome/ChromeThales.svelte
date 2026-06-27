<!--
  Chrome documentaire Thales (thalesgroup.com — aérospatial, défense & numérique).
  Forme fidèle au site Thales : clair, bleu d'action vif + navy.
  - Header : bandeau BLANC, logo OFFICIEL Thales (wordmark indigo + swoosh aqua) à
    gauche, nav au centre, recherche BLEUE à droite
  - Onglet actif = SOULIGNÉ bleu d'action #0816a1 + texte bleu ; item sidebar actif =
    liseré bleu + fond bleu très clair ; anneau focus = navy #00005c (mesuré)
  - Couleurs MESURÉES (theme-thales index.ts, live thalesgroup.com) : bleu d'action
    #0816a1 (liens/CTA, survol navy #00005c), aqua #87edff (accent sur fond sombre),
    encre #252526, gris #6f7273, surface #f4f9fb, bordure champ #c3c7c9
  - Logo OFFICIEL Thales (vecteur Wikimedia) via <img src="/chrome/thales/logo.svg">
  - Typo : « Inter » (de marque) référencée par NOM → repli système (aucune police réseau)
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

<div class="th-shell">
  <!-- ── HEADER Thales ── -->
  <div class="th-header-wrap">
    <header class="th-header" aria-label="Thales">
      <div class="th-header__inner">
        <!-- Gauche : logo officiel Thales -->
        <div class="th-header__brand">
          <a href="/" class="th-header__brand-link" aria-label="Accueil : Thales Design System">
            <img
              src="/chrome/thales/logo.svg"
              alt="Thales"
              class="th-logo"
              width="185"
              height="22"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="th-nav" aria-label="Navigation principale">
          <ul class="th-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="th-nav__item">
                <a
                  class="th-nav__link"
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
        <div class="th-header__tools">
          <button
            type="button"
            class="th-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="th-header__tools-links">
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
          class="th-header__burger"
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

  <!-- ── BODY Thales ── -->
  <div class="th-body">
    <!-- Sidebar -->
    <aside class="th-sidebar" aria-label="Navigation de la documentation">
      <nav class="th-side-nav" aria-label="Sommaire">
        <ul class="th-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="th-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="th-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="th-side-group" open={isGroupOpen(group.items)}>
                <summary class="th-side-group__summary">
                  <ChevronDown class="th-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="th-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="th-side-link th-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="th-side-divider" role="separator"></li>

          <li>
            <a
              class="th-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="th-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="th-side-group__summary">
                  <ChevronDown class="th-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="th-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="th-side-link th-side-link--sub"
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

      <!-- Pied de barre latérale : version + GitHub. -->
      <div class="th-sidebar-footer">
        <span class="th-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="th-sidebar-github"
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
    <div class="th-content">
      <nav class="th-breadcrumb" aria-label="Breadcrumb">
        <ol class="th-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="th-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="th-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Thales ── -->
  <footer class="th-footer" aria-label="Pied de page Thales">
    <div class="th-footer__inner">
      <nav class="th-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="th-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/thales/logo.svg"
        alt="Thales"
        class="th-footer__logo"
        width="169"
        height="20"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Thales ── */
  .th-shell {
    --th-primary: #0816a1; /* bleu d'action Thales (liens / CTA) */
    --th-primary-hover: #00005c; /* navy (survol / actif mesuré) */
    --th-primary-light: #e7e9f6; /* bleu très clair (item actif sidebar) */
    --th-navy: #00005c; /* navy mesuré — anneau focus / dark surfaces */
    --th-ink: #252526; /* corps de texte (mesuré) */
    --th-secondary: #6f7273; /* texte secondaire (mesuré) */
    --th-subtle: #f4f9fb; /* surface alt bleutée (mesurée) */
    --th-border: #d9d9e7; /* bordure subtile lavande (mesurée) */
    --th-border-strong: #c3c7c9; /* bordure champ (mesurée) */
    --th-white: #fff;
    --th-sidebar-width: 17rem;
    --th-radius: 6px;
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--th-white);
    color: var(--th-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Thales ── */
  .th-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .th-header {
    background: var(--th-white);
    border-bottom: 1px solid var(--th-border);
  }

  .th-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .th-header__brand {
    flex: 0 0 auto;
  }

  .th-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 150ms ease;
  }

  .th-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Thales (ratio préservé). */
  .th-logo {
    display: block;
    width: auto;
    height: 22px;
  }

  /* ── Nav horizontale (centre) ── */
  .th-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .th-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .th-nav__item {
    flex: 0 0 auto;
  }

  .th-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--th-ink);
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

  .th-nav__link:hover,
  .th-nav__link:focus-visible {
    color: var(--th-primary);
    outline: none;
  }

  .th-nav__link[aria-current="page"] {
    border-bottom-color: var(--th-primary);
    color: var(--th-primary);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .th-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .th-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Thales. */
  .th-header__tools-links :global(.docs-header-control) {
    background: var(--th-white);
    border-color: var(--th-border-strong);
    border-radius: var(--th-radius);
    color: var(--th-ink);
    font-family: inherit;
  }

  .th-header__tools-links :global(.docs-header-control:hover),
  .th-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--th-subtle);
    border-color: var(--th-primary);
    color: var(--th-primary);
    box-shadow: none;
  }

  /* Recherche Thales : bouton loupe compact. */
  .th-search__btn {
    align-items: center;
    background: var(--th-primary);
    border: 1px solid var(--th-primary);
    border-radius: var(--th-radius);
    color: var(--th-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 150ms ease, border-color 150ms ease;
  }

  .th-search__btn:hover,
  .th-search__btn:focus-visible {
    background: var(--th-navy);
    border-color: var(--th-navy);
    outline: 2px solid var(--th-navy);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .th-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--th-primary);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Thales ── */
  .th-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--th-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Thales ── */
  .th-sidebar {
    background: var(--th-white);
    border-right: 1px solid var(--th-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .th-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .th-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--th-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .th-version-badge {
    background: var(--th-subtle);
    border: 1px solid var(--th-border);
    border-radius: var(--th-radius);
    color: var(--th-primary);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .th-sidebar-github {
    align-items: center;
    color: var(--th-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 150ms ease;
  }

  .th-sidebar-github:hover,
  .th-sidebar-github:focus-visible {
    color: var(--th-primary);
  }

  .th-side-list,
  .th-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .th-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--th-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
  }

  .th-side-link:hover,
  .th-side-link:focus-visible {
    background: var(--th-subtle);
    color: var(--th-primary);
    text-decoration: none;
  }

  .th-side-link[aria-current="page"] {
    background: var(--th-primary-light);
    border-left-color: var(--th-primary);
    color: var(--th-primary);
    font-weight: 700;
    text-decoration: none;
  }

  .th-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .th-side-divider {
    border-top: 1px solid var(--th-border);
    margin: 0.5rem 0;
  }

  .th-side-group {
    display: block;
  }

  .th-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--th-secondary);
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

  .th-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .th-side-group__summary:hover,
  .th-side-group__summary:focus-visible {
    background: var(--th-subtle);
    outline: none;
  }

  .th-side-group :global(.th-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 150ms ease;
  }

  .th-side-group:not([open]) :global(.th-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .th-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .th-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .th-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .th-breadcrumb__item {
    align-items: center;
    color: var(--th-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .th-breadcrumb__item + .th-breadcrumb__item::before {
    color: var(--th-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .th-breadcrumb__link {
    color: var(--th-primary);
    text-decoration: none;
  }

  .th-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .th-breadcrumb__item span[aria-current="page"] {
    color: var(--th-ink);
    font-weight: 600;
  }

  /* ── Footer Thales ── */
  .th-footer {
    background: var(--th-subtle);
    border-top: 1px solid var(--th-border);
    margin-top: auto;
  }

  .th-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .th-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .th-footer__link {
    color: var(--th-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .th-footer__link:hover {
    color: var(--th-primary);
    text-decoration: underline;
  }

  .th-footer__logo {
    display: block;
    width: auto;
    height: 20px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .th-body {
      grid-template-columns: 1fr;
    }

    .th-sidebar {
      display: none;
    }

    .th-nav {
      display: none;
    }

    .th-header__tools {
      display: none;
    }

    .th-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .th-nav__link,
    .th-search__btn,
    .th-side-link,
    .th-side-group :global(.th-side-group__icon) {
      transition: none;
    }
  }
</style>

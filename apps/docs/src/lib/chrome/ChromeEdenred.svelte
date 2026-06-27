<!--
  Chrome documentaire Edenred (edenred.com — services prepayes / fintech).
  Forme fidele a l'identite Edenred : clair, rouge vif « point », arrondi digital.
  - Header : bandeau BLANC, logo OFFICIEL Edenred (symbole rouge « sourire ») a
    gauche, nav au centre, recherche rouge a droite
  - Coins ARRONDIS (8px) — echo du point rouge ; onglet actif = SOULIGNE rouge
    Edenred + texte rouge ; item sidebar actif = lisere rouge + fond rouge tres clair
  - Couleurs MESUREES (theme-edenred) : Edenred Red #f72717 (primaire, survol
    #d81f12), encre #1a1614, gris #3c3835, surface #f7f6f5, bordure #e3e0de
  - Logo OFFICIEL Edenred (vecteur, symbole de marque) via <img src="/chrome/edenred/logo.svg">
    NB : asset SYMBOLE seul (le wordmark SVG officiel n'etant pas disponible de
    facon fiable, on s'en tient au symbole — signale au conducteur).
  - Typo : « Edenred » / « Ubuntu » (de marque) referencees par NOM → repli systeme
    sans chargement reseau
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

<div class="ed-shell">
  <!-- ── HEADER Edenred ── -->
  <div class="ed-header-wrap">
    <header class="ed-header" aria-label="Edenred">
      <div class="ed-header__inner">
        <!-- Gauche : logo officiel Edenred -->
        <div class="ed-header__brand">
          <a href="/" class="ed-header__brand-link" aria-label="Accueil : Edenred Design System">
            <img
              src="/chrome/edenred/logo.svg"
              alt="Edenred"
              class="ed-logo"
              width="56"
              height="34"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="ed-nav" aria-label="Navigation principale">
          <ul class="ed-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="ed-nav__item">
                <a
                  class="ed-nav__link"
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
        <div class="ed-header__tools">
          <button
            type="button"
            class="ed-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="ed-header__tools-links">
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
          class="ed-header__burger"
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

  <!-- ── BODY Edenred ── -->
  <div class="ed-body">
    <!-- Sidebar -->
    <aside class="ed-sidebar" aria-label="Navigation de la documentation">
      <nav class="ed-side-nav" aria-label="Sommaire">
        <ul class="ed-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="ed-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="ed-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="ed-side-group" open={isGroupOpen(group.items)}>
                <summary class="ed-side-group__summary">
                  <ChevronDown class="ed-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="ed-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="ed-side-link ed-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="ed-side-divider" role="separator"></li>

          <li>
            <a
              class="ed-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="ed-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="ed-side-group__summary">
                  <ChevronDown class="ed-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="ed-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="ed-side-link ed-side-link--sub"
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
      <div class="ed-sidebar-footer">
        <span class="ed-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="ed-sidebar-github"
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
    <div class="ed-content">
      <nav class="ed-breadcrumb" aria-label="Breadcrumb">
        <ol class="ed-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="ed-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="ed-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Edenred ── -->
  <footer class="ed-footer" aria-label="Pied de page Edenred">
    <div class="ed-footer__inner">
      <nav class="ed-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="ed-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/edenred/logo.svg"
        alt="Edenred"
        class="ed-footer__logo"
        width="49"
        height="30"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Edenred ── */
  .ed-shell {
    --ed-primary: #f72717; /* Edenred Red (primaire / action) */
    --ed-primary-hover: #d81f12; /* rouge plus profond (survol) */
    --ed-primary-light: #fde7e4; /* rouge tres clair (item actif sidebar) */
    --ed-ink: #1a1614; /* corps / titres (near-black) */
    --ed-secondary: #3c3835; /* gris secondaire */
    --ed-subtle: #f7f6f5; /* surface */
    --ed-border: #e3e0de; /* bordure subtile */
    --ed-border-strong: #c6c1be; /* bordure champ */
    --ed-focus: #f72717; /* anneau focus rouge */
    --ed-white: #fff;
    --ed-sidebar-width: 17rem;
    --ed-radius: 0.5rem;
    font-family: 'Edenred', 'Ubuntu', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    background: var(--ed-white);
    color: var(--ed-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Edenred ── */
  .ed-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .ed-header {
    background: var(--ed-white);
    border-bottom: 1px solid var(--ed-border);
  }

  .ed-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .ed-header__brand {
    flex: 0 0 auto;
  }

  .ed-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 180ms ease;
  }

  .ed-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Edenred (ratio préservé). */
  .ed-logo {
    display: block;
    width: auto;
    height: 34px;
  }

  /* ── Nav horizontale (centre) ── */
  .ed-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .ed-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ed-nav__item {
    flex: 0 0 auto;
  }

  .ed-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--ed-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: none;
    letter-spacing: normal;
    transition: border-color 180ms ease, color 180ms ease;
    white-space: nowrap;
  }

  .ed-nav__link:hover,
  .ed-nav__link:focus-visible {
    color: var(--ed-primary);
    outline: none;
  }

  .ed-nav__link[aria-current="page"] {
    border-bottom-color: var(--ed-primary);
    color: var(--ed-primary);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .ed-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .ed-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Edenred. */
  .ed-header__tools-links :global(.docs-header-control) {
    background: var(--ed-white);
    border-color: var(--ed-border-strong);
    border-radius: var(--ed-radius);
    color: var(--ed-ink);
    font-family: inherit;
  }

  .ed-header__tools-links :global(.docs-header-control:hover),
  .ed-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--ed-subtle);
    border-color: var(--ed-primary);
    color: var(--ed-primary);
    box-shadow: none;
  }

  /* Recherche Edenred : bouton loupe compact. */
  .ed-search__btn {
    align-items: center;
    background: var(--ed-primary);
    border: 1px solid var(--ed-primary);
    border-radius: var(--ed-radius);
    color: var(--ed-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 180ms ease, border-color 180ms ease;
  }

  .ed-search__btn:hover,
  .ed-search__btn:focus-visible {
    background: var(--ed-primary-hover);
    border-color: var(--ed-primary-hover);
    outline: 2px solid var(--ed-focus);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .ed-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--ed-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Edenred ── */
  .ed-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--ed-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Edenred ── */
  .ed-sidebar {
    background: var(--ed-white);
    border-right: 1px solid var(--ed-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .ed-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .ed-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--ed-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .ed-version-badge {
    background: var(--ed-subtle);
    border: 1px solid var(--ed-border);
    border-radius: var(--ed-radius);
    color: var(--ed-primary);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .ed-sidebar-github {
    align-items: center;
    color: var(--ed-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 180ms ease;
  }

  .ed-sidebar-github:hover,
  .ed-sidebar-github:focus-visible {
    color: var(--ed-primary);
  }

  .ed-side-list,
  .ed-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ed-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--ed-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
  }

  .ed-side-link:hover,
  .ed-side-link:focus-visible {
    background: var(--ed-subtle);
    color: var(--ed-primary);
    text-decoration: none;
  }

  .ed-side-link[aria-current="page"] {
    background: var(--ed-primary-light);
    border-left-color: var(--ed-primary);
    color: var(--ed-primary);
    font-weight: 700;
    text-decoration: none;
  }

  .ed-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .ed-side-divider {
    border-top: 1px solid var(--ed-border);
    margin: 0.5rem 0;
  }

  .ed-side-group {
    display: block;
  }

  .ed-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--ed-secondary);
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
    transition: background 180ms ease;
  }

  .ed-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .ed-side-group__summary:hover,
  .ed-side-group__summary:focus-visible {
    background: var(--ed-subtle);
    outline: none;
  }

  .ed-side-group :global(.ed-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 180ms ease;
  }

  .ed-side-group:not([open]) :global(.ed-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .ed-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .ed-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .ed-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ed-breadcrumb__item {
    align-items: center;
    color: var(--ed-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .ed-breadcrumb__item + .ed-breadcrumb__item::before {
    color: var(--ed-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .ed-breadcrumb__link {
    color: var(--ed-primary);
    text-decoration: none;
  }

  .ed-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .ed-breadcrumb__item span[aria-current="page"] {
    color: var(--ed-ink);
    font-weight: 600;
  }

  /* ── Footer Edenred ── */
  .ed-footer {
    background: var(--ed-subtle);
    border-top: 1px solid var(--ed-border);
    margin-top: auto;
  }

  .ed-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .ed-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .ed-footer__link {
    color: var(--ed-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .ed-footer__link:hover {
    color: var(--ed-primary);
    text-decoration: underline;
  }

  .ed-footer__logo {
    display: block;
    width: auto;
    height: 30px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .ed-body {
      grid-template-columns: 1fr;
    }

    .ed-sidebar {
      display: none;
    }

    .ed-nav {
      display: none;
    }

    .ed-header__tools {
      display: none;
    }

    .ed-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .ed-nav__link,
    .ed-search__btn,
    .ed-side-link,
    .ed-side-group :global(.ed-side-group__icon) {
      transition: none;
    }
  }
</style>

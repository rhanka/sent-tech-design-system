<!--
  Chrome documentaire Hermès (hermes.com — maison de luxe).
  Forme fidèle au site Hermès : crème signature, encre noire, coins CARRÉS, luxe épuré.
  - Header : bandeau CRÈME #f6f1eb (fond signature du site, MESURÉ), WORDMARK
    « HERMÈS / PARIS » noir à gauche, nav CAPITALES espacées au centre, recherche
    NOIRE à droite
  - Coins CARRÉS (radius 0 — minimalisme luxe) ; onglet actif = SOULIGNÉ ORANGE
    Hermès (#f37021, l'orange réservé à l'emphase)
  - Item sidebar actif = liseré noir + fond crème ; focus = outline noir
  - Couleurs MESURÉES (live CSS) : crème #f6f1eb (body bg), encre #000, charcoal
    #2e2d2d, hairline taupe #e3dccf / #b0a18a, gris #696969 ; orange #f37021 (charte)
  - Logo : WORDMARK texte propre — aucun SVG officiel fiable de la maison Hermès sur
    Wikimedia Commons (seuls des « Hermes » transporteurs / un JPG). Sérif épurée,
    tracking large, lockup « PARIS », via /chrome/hermes/logo.svg (signalé au conducteur).
  - Typo : Manrope (webfont du site) → repli system / serif pour le wordmark
    (aucune police réseau chargée)
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

<div class="her-shell">
  <!-- ── HEADER Hermès ── -->
  <div class="her-header-wrap">
    <header class="her-header" aria-label="Hermès">
      <div class="her-header__inner">
        <!-- Gauche : logo officiel Hermès -->
        <div class="her-header__brand">
          <a href="/" class="her-header__brand-link" aria-label="Accueil : Hermès Design System">
            <img
              src="/chrome/hermes/logo.svg"
              alt="Hermès"
              class="her-logo"
              width="91"
              height="34"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="her-nav" aria-label="Navigation principale">
          <ul class="her-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="her-nav__item">
                <a
                  class="her-nav__link"
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
        <div class="her-header__tools">
          <button
            type="button"
            class="her-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="her-header__tools-links">
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
          class="her-header__burger"
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

  <!-- ── BODY Hermès ── -->
  <div class="her-body">
    <!-- Sidebar -->
    <aside class="her-sidebar" aria-label="Navigation de la documentation">
      <nav class="her-side-nav" aria-label="Sommaire">
        <ul class="her-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="her-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="her-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="her-side-group" open={isGroupOpen(group.items)}>
                <summary class="her-side-group__summary">
                  <ChevronDown class="her-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="her-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="her-side-link her-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="her-side-divider" role="separator"></li>

          <li>
            <a
              class="her-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="her-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="her-side-group__summary">
                  <ChevronDown class="her-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="her-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="her-side-link her-side-link--sub"
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
      <div class="her-sidebar-footer">
        <span class="her-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="her-sidebar-github"
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
    <div class="her-content">
      <nav class="her-breadcrumb" aria-label="Breadcrumb">
        <ol class="her-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="her-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="her-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Hermès ── -->
  <footer class="her-footer" aria-label="Pied de page Hermès">
    <div class="her-footer__inner">
      <nav class="her-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="her-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/hermes/logo.svg"
        alt="Hermès"
        class="her-footer__logo"
        width="80"
        height="30"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Hermès ── */
  .her-shell {
    --her-primary: #000000; /* encre noire — primaire UI réel Hermès (MESURÉ) */
    --her-primary-hover: #2e2d2d; /* charcoal survol (MESURÉ) */
    --her-primary-light: #f6f1eb; /* crème signature (item actif sidebar) */
    --her-ink: #000000; /* encre noire (body color, MESURÉ) */
    --her-orange: #f37021; /* orange Hermès — accent emphase (Pantone 158 C) */
    --her-orange-dark: #d85f15; /* orange foncé */
    --her-secondary: #696969; /* gris atténué */
    --her-cream: #f6f1eb; /* crème signature (body bg, MESURÉ) */
    --her-subtle: #f6f1eb; /* surface crème subtile */
    --her-border: #e3dccf; /* hairline taupe clair */
    --her-border-strong: #b0a18a; /* taupe bordure forte */
    --her-focus: #000000; /* outline focus noir 2px (MESURÉ) */
    --her-white: #fff;
    --her-sidebar-width: 17rem;
    --her-radius: 0;
    font-family: 'Manrope', 'Roboto', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--her-white);
    color: var(--her-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Hermès ── */
  .her-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .her-header {
    background: var(--her-cream);
    border-bottom: 1px solid var(--her-border);
  }

  .her-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .her-header__brand {
    flex: 0 0 auto;
  }

  .her-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 200ms ease;
  }

  .her-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Hermès (ratio préservé). */
  .her-logo {
    display: block;
    width: auto;
    height: 34px;
  }

  /* ── Nav horizontale (centre) ── */
  .her-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .her-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .her-nav__item {
    flex: 0 0 auto;
  }

  .her-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--her-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    transition: border-color 200ms ease, color 200ms ease;
    white-space: nowrap;
  }

  .her-nav__link:hover,
  .her-nav__link:focus-visible {
    color: var(--her-ink);
    outline: none;
  }

  .her-nav__link[aria-current="page"] {
    border-bottom-color: var(--her-orange);
    color: var(--her-ink);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .her-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .her-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Hermès. */
  .her-header__tools-links :global(.docs-header-control) {
    background: var(--her-white);
    border-color: var(--her-border-strong);
    border-radius: var(--her-radius);
    color: var(--her-ink);
    font-family: inherit;
  }

  .her-header__tools-links :global(.docs-header-control:hover),
  .her-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--her-cream);
    border-color: var(--her-orange);
    color: var(--her-ink);
    box-shadow: none;
  }

  /* Recherche Hermès : bouton loupe compact. */
  .her-search__btn {
    align-items: center;
    background: var(--her-primary);
    border: 1px solid var(--her-primary);
    border-radius: var(--her-radius);
    color: var(--her-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 200ms ease, border-color 200ms ease;
  }

  .her-search__btn:hover,
  .her-search__btn:focus-visible {
    background: var(--her-primary-hover);
    border-color: var(--her-primary-hover);
    outline: 2px solid var(--her-focus);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .her-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--her-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Hermès ── */
  .her-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--her-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Hermès ── */
  .her-sidebar {
    background: var(--her-white);
    border-right: 1px solid var(--her-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .her-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .her-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--her-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .her-version-badge {
    background: var(--her-subtle);
    border: 1px solid var(--her-border);
    border-radius: var(--her-radius);
    color: var(--her-orange-dark);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .her-sidebar-github {
    align-items: center;
    color: var(--her-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 200ms ease;
  }

  .her-sidebar-github:hover,
  .her-sidebar-github:focus-visible {
    color: var(--her-primary);
  }

  .her-side-list,
  .her-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .her-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--her-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 200ms ease, border-color 200ms ease, color 200ms ease;
  }

  .her-side-link:hover,
  .her-side-link:focus-visible {
    background: var(--her-subtle);
    color: var(--her-primary);
    text-decoration: none;
  }

  .her-side-link[aria-current="page"] {
    background: var(--her-primary-light);
    border-left-color: var(--her-primary);
    color: var(--her-ink);
    font-weight: 700;
    text-decoration: none;
  }

  .her-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .her-side-divider {
    border-top: 1px solid var(--her-border);
    margin: 0.5rem 0;
  }

  .her-side-group {
    display: block;
  }

  .her-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--her-secondary);
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
    transition: background 200ms ease;
  }

  .her-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .her-side-group__summary:hover,
  .her-side-group__summary:focus-visible {
    background: var(--her-subtle);
    outline: none;
  }

  .her-side-group :global(.her-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 200ms ease;
  }

  .her-side-group:not([open]) :global(.her-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .her-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .her-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .her-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .her-breadcrumb__item {
    align-items: center;
    color: var(--her-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .her-breadcrumb__item + .her-breadcrumb__item::before {
    color: var(--her-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .her-breadcrumb__link {
    color: var(--her-primary);
    text-decoration: none;
  }

  .her-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .her-breadcrumb__item span[aria-current="page"] {
    color: var(--her-ink);
    font-weight: 600;
  }

  /* ── Footer Hermès ── */
  .her-footer {
    background: var(--her-subtle);
    border-top: 1px solid var(--her-border);
    margin-top: auto;
  }

  .her-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .her-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .her-footer__link {
    color: var(--her-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .her-footer__link:hover {
    color: var(--her-primary);
    text-decoration: underline;
  }

  .her-footer__logo {
    display: block;
    width: auto;
    height: 30px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .her-body {
      grid-template-columns: 1fr;
    }

    .her-sidebar {
      display: none;
    }

    .her-nav {
      display: none;
    }

    .her-header__tools {
      display: none;
    }

    .her-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .her-nav__link,
    .her-search__btn,
    .her-side-link,
    .her-side-group :global(.her-side-group__icon) {
      transition: none;
    }
  }
</style>

<!--
  Chrome documentaire VINCI (vinci.com — BTP, concessions & énergies).
  Forme fidèle au corporate VINCI : clair, sobre, rouge signature + bleu institutionnel.
  - Header : bandeau BLANC, logo OFFICIEL VINCI (chevron rouge + « VINCI » bleu) à
    gauche, nav au centre, recherche ROUGE à droite
  - Onglet actif = SOULIGNÉ ROUGE #e20025 (couleur logotype) + texte bleu corporate
  - Item sidebar actif = liseré rouge + fond rose très clair
  - Couleurs MESURÉES (theme-vinci --color-*) : rouge logotype #e20025 (action),
    bleu corporate #004489 (liens/titres), bleu vif #0041b7 (focus), encre #333333,
    gris #6d6d6d, surface #f0f0f0, bordures #dcdcdc / #c8c8c8
  - Logo OFFICIEL VINCI (vecteur Wikimedia) via <img src="/chrome/vinci/logo.svg">
  - Typo : « Vinci Sans » propriétaire → repli Arial, Helvetica (aucune police réseau)
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

<div class="vinci-shell">
  <!-- ── HEADER VINCI ── -->
  <div class="vinci-header-wrap">
    <header class="vinci-header" aria-label="VINCI">
      <div class="vinci-header__inner">
        <!-- Gauche : logo officiel VINCI -->
        <div class="vinci-header__brand">
          <a href="/" class="vinci-header__brand-link" aria-label="Accueil : VINCI Design System">
            <img
              src="/chrome/vinci/logo.svg"
              alt="VINCI"
              class="vinci-logo"
              width="126"
              height="34"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="vinci-nav" aria-label="Navigation principale">
          <ul class="vinci-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="vinci-nav__item">
                <a
                  class="vinci-nav__link"
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
        <div class="vinci-header__tools">
          <button
            type="button"
            class="vinci-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="vinci-header__tools-links">
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
          class="vinci-header__burger"
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

  <!-- ── BODY VINCI ── -->
  <div class="vinci-body">
    <!-- Sidebar -->
    <aside class="vinci-sidebar" aria-label="Navigation de la documentation">
      <nav class="vinci-side-nav" aria-label="Sommaire">
        <ul class="vinci-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="vinci-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="vinci-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="vinci-side-group" open={isGroupOpen(group.items)}>
                <summary class="vinci-side-group__summary">
                  <ChevronDown class="vinci-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="vinci-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="vinci-side-link vinci-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="vinci-side-divider" role="separator"></li>

          <li>
            <a
              class="vinci-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="vinci-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="vinci-side-group__summary">
                  <ChevronDown class="vinci-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="vinci-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="vinci-side-link vinci-side-link--sub"
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
      <div class="vinci-sidebar-footer">
        <span class="vinci-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="vinci-sidebar-github"
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
    <div class="vinci-content">
      <nav class="vinci-breadcrumb" aria-label="Breadcrumb">
        <ol class="vinci-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="vinci-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="vinci-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER VINCI ── -->
  <footer class="vinci-footer" aria-label="Pied de page VINCI">
    <div class="vinci-footer__inner">
      <nav class="vinci-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="vinci-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/vinci/logo.svg"
        alt="VINCI"
        class="vinci-footer__logo"
        width="111"
        height="30"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables VINCI ── */
  .vinci-shell {
    --vinci-primary: #e20025; /* VINCI red (--color-red) — logotype / action.primary */
    --vinci-primary-hover: #b3001e; /* rouge survol (derived) */
    --vinci-primary-light: #ffe6e6; /* --color-extra-light-pink (item actif sidebar) */
    --vinci-blue: #004489; /* --color-vinci-blue (corporate navy — liens / titres) */
    --vinci-blue-bright: #0041b7; /* --color-blue (bleu interactif vif — focus) */
    --vinci-ink: #333333; /* --color-black (corps de texte) */
    --vinci-secondary: #6d6d6d; /* --color-grey (texte secondaire) */
    --vinci-subtle: #f0f0f0; /* --color-extra-light-grey (surface alt) */
    --vinci-border: #dcdcdc; /* --color-light-grey (bordure subtile) */
    --vinci-border-strong: #c8c8c8; /* --color-grey04 (bordure champ) */
    --vinci-white: #fff;
    --vinci-sidebar-width: 17rem;
    --vinci-radius: 2px;
    font-family: 'Vinci Sans', Arial, Helvetica, sans-serif;
    background: var(--vinci-white);
    color: var(--vinci-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header VINCI ── */
  .vinci-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .vinci-header {
    background: var(--vinci-white);
    border-bottom: 1px solid var(--vinci-border);
  }

  .vinci-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .vinci-header__brand {
    flex: 0 0 auto;
  }

  .vinci-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 150ms ease;
  }

  .vinci-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel VINCI (ratio préservé). */
  .vinci-logo {
    display: block;
    width: auto;
    height: 34px;
  }

  /* ── Nav horizontale (centre) ── */
  .vinci-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .vinci-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .vinci-nav__item {
    flex: 0 0 auto;
  }

  .vinci-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--vinci-ink);
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

  .vinci-nav__link:hover,
  .vinci-nav__link:focus-visible {
    color: var(--vinci-blue);
    outline: none;
  }

  .vinci-nav__link[aria-current="page"] {
    border-bottom-color: var(--vinci-primary);
    color: var(--vinci-blue);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .vinci-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .vinci-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header VINCI. */
  .vinci-header__tools-links :global(.docs-header-control) {
    background: var(--vinci-white);
    border-color: var(--vinci-border-strong);
    border-radius: var(--vinci-radius);
    color: var(--vinci-ink);
    font-family: inherit;
  }

  .vinci-header__tools-links :global(.docs-header-control:hover),
  .vinci-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--vinci-subtle);
    border-color: var(--vinci-primary);
    color: var(--vinci-blue);
    box-shadow: none;
  }

  /* Recherche VINCI : bouton loupe compact. */
  .vinci-search__btn {
    align-items: center;
    background: var(--vinci-primary);
    border: 1px solid var(--vinci-primary);
    border-radius: var(--vinci-radius);
    color: var(--vinci-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 150ms ease, border-color 150ms ease;
  }

  .vinci-search__btn:hover,
  .vinci-search__btn:focus-visible {
    background: var(--vinci-primary-hover);
    border-color: var(--vinci-primary-hover);
    outline: 2px solid var(--vinci-blue-bright);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .vinci-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--vinci-blue);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body VINCI ── */
  .vinci-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--vinci-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar VINCI ── */
  .vinci-sidebar {
    background: var(--vinci-white);
    border-right: 1px solid var(--vinci-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .vinci-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .vinci-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--vinci-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .vinci-version-badge {
    background: var(--vinci-subtle);
    border: 1px solid var(--vinci-border);
    border-radius: var(--vinci-radius);
    color: var(--vinci-primary);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .vinci-sidebar-github {
    align-items: center;
    color: var(--vinci-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 150ms ease;
  }

  .vinci-sidebar-github:hover,
  .vinci-sidebar-github:focus-visible {
    color: var(--vinci-primary);
  }

  .vinci-side-list,
  .vinci-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .vinci-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--vinci-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
  }

  .vinci-side-link:hover,
  .vinci-side-link:focus-visible {
    background: var(--vinci-subtle);
    color: var(--vinci-primary);
    text-decoration: none;
  }

  .vinci-side-link[aria-current="page"] {
    background: var(--vinci-primary-light);
    border-left-color: var(--vinci-primary);
    color: var(--vinci-primary);
    font-weight: 700;
    text-decoration: none;
  }

  .vinci-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .vinci-side-divider {
    border-top: 1px solid var(--vinci-border);
    margin: 0.5rem 0;
  }

  .vinci-side-group {
    display: block;
  }

  .vinci-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--vinci-secondary);
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

  .vinci-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .vinci-side-group__summary:hover,
  .vinci-side-group__summary:focus-visible {
    background: var(--vinci-subtle);
    outline: none;
  }

  .vinci-side-group :global(.vinci-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 150ms ease;
  }

  .vinci-side-group:not([open]) :global(.vinci-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .vinci-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .vinci-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .vinci-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .vinci-breadcrumb__item {
    align-items: center;
    color: var(--vinci-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .vinci-breadcrumb__item + .vinci-breadcrumb__item::before {
    color: var(--vinci-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .vinci-breadcrumb__link {
    color: var(--vinci-primary);
    text-decoration: none;
  }

  .vinci-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .vinci-breadcrumb__item span[aria-current="page"] {
    color: var(--vinci-ink);
    font-weight: 600;
  }

  /* ── Footer VINCI ── */
  .vinci-footer {
    background: var(--vinci-subtle);
    border-top: 1px solid var(--vinci-border);
    margin-top: auto;
  }

  .vinci-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .vinci-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .vinci-footer__link {
    color: var(--vinci-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .vinci-footer__link:hover {
    color: var(--vinci-primary);
    text-decoration: underline;
  }

  .vinci-footer__logo {
    display: block;
    width: auto;
    height: 30px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .vinci-body {
      grid-template-columns: 1fr;
    }

    .vinci-sidebar {
      display: none;
    }

    .vinci-nav {
      display: none;
    }

    .vinci-header__tools {
      display: none;
    }

    .vinci-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .vinci-nav__link,
    .vinci-search__btn,
    .vinci-side-link,
    .vinci-side-group :global(.vinci-side-group__icon) {
      transition: none;
    }
  }
</style>

<!--
  Chrome documentaire Veolia (veolia.com — eau, déchets & énergie).
  Forme fidèle au site corporate : clair, ROUGE de marque + accent turquoise (eau).
  - Header : bandeau BLANC, logo OFFICIEL Veolia (wordmark rouge) à gauche, nav au
    centre, recherche ROUGE (anneau focus turquoise) à droite
  - Onglet actif = SOULIGNÉ rouge #ee0000 ; item sidebar actif = liseré rouge + fond
    rouge très clair
  - Couleurs MESURÉES (theme-veolia — charte + design_v2.css) : rouge web #ee0000
    (charte #ff0000, survol #cc0000), turquoise #05c3dd (segment eau, focus), encre
    #333333, gris de marque #55555a (Cool Gray 11), surface #f2f2f2, bordures
    #e5e5e5 / #cccccc
  - Logo OFFICIEL Veolia (vecteur Wikimedia) via <img src="/chrome/veolia/logo.svg">
  - Typo : « TheSans » propriétaire → repli « Noto Sans », Arial (aucune police réseau)
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

<div class="veo-shell">
  <!-- ── HEADER Veolia ── -->
  <div class="veo-header-wrap">
    <header class="veo-header" aria-label="Veolia">
      <div class="veo-header__inner">
        <!-- Gauche : logo officiel Veolia -->
        <div class="veo-header__brand">
          <a href="/" class="veo-header__brand-link" aria-label="Accueil : Veolia Design System">
            <img
              src="/chrome/veolia/logo.svg"
              alt="Veolia"
              class="veo-logo"
              width="112"
              height="28"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="veo-nav" aria-label="Navigation principale">
          <ul class="veo-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="veo-nav__item">
                <a
                  class="veo-nav__link"
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
        <div class="veo-header__tools">
          <button
            type="button"
            class="veo-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="veo-header__tools-links">
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
          class="veo-header__burger"
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

  <!-- ── BODY Veolia ── -->
  <div class="veo-body">
    <!-- Sidebar -->
    <aside class="veo-sidebar" aria-label="Navigation de la documentation">
      <nav class="veo-side-nav" aria-label="Sommaire">
        <ul class="veo-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="veo-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="veo-side-divider" role="separator"></li>

          <li class="veo-side-heading">
            <a
              class="veo-side-link veo-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="veo-side-group" open={isGroupOpen(group.items)}>
                <summary class="veo-side-group__summary">
                  <ChevronDown class="veo-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="veo-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="veo-side-link veo-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="veo-side-divider" role="separator"></li>

          <li class="veo-side-heading">
            <a
              class="veo-side-link veo-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="veo-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="veo-side-group__summary">
                  <ChevronDown class="veo-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="veo-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="veo-side-link veo-side-link--sub"
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
      <div class="veo-sidebar-footer">
        <span class="veo-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="veo-sidebar-github"
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
    <div class="veo-content">
      <nav class="veo-breadcrumb" aria-label="Breadcrumb">
        <ol class="veo-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="veo-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="veo-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Veolia ── -->
  <footer class="veo-footer" aria-label="Pied de page Veolia">
    <div class="veo-footer__inner">
      <nav class="veo-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="veo-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/veolia/logo.svg"
        alt="Veolia"
        class="veo-footer__logo"
        width="96"
        height="24"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Veolia ── */
  .veo-shell {
    --veo-primary: #ee0000; /* rouge web Veolia (design_v2.css) — action / lien */
    --veo-primary-hover: #cc0000; /* rouge survol (derived) */
    --veo-primary-light: #ffe5e5; /* tint rouge clair (item actif sidebar) */
    --veo-red: #ff0000; /* rouge charte (PANTONE 485 C — logotype) */
    --veo-turquoise: #05c3dd; /* turquoise charte (segment eau — anneau focus) */
    --veo-ink: #333333; /* corps de texte (live, dominant) */
    --veo-secondary: #55555a; /* PANTONE Cool Gray 11 (gris de marque) */
    --veo-subtle: #f2f2f2; /* surface alt (live) */
    --veo-border: #e5e5e5; /* bordure subtile (live) */
    --veo-border-strong: #cccccc; /* bordure champ (live) */
    --veo-white: #fff;
    --veo-sidebar-width: 17rem;
    --veo-radius: 4px;
    font-family: 'TheSans', 'Noto Sans', Arial, Helvetica, system-ui, sans-serif;
    background: var(--veo-white);
    color: var(--veo-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Veolia ── */
  .veo-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .veo-header {
    background: var(--veo-white);
    border-bottom: 1px solid var(--veo-border);
  }

  .veo-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .veo-header__brand {
    flex: 0 0 auto;
  }

  .veo-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 150ms ease;
  }

  .veo-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Veolia (ratio préservé). */
  .veo-logo {
    display: block;
    width: auto;
    height: 28px;
  }

  /* ── Nav horizontale (centre) ── */
  .veo-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .veo-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .veo-nav__item {
    flex: 0 0 auto;
  }

  .veo-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--veo-ink);
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

  .veo-nav__link:hover,
  .veo-nav__link:focus-visible {
    color: var(--veo-primary);
    outline: none;
  }

  .veo-nav__link[aria-current="page"] {
    border-bottom-color: var(--veo-primary);
    color: var(--veo-primary);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .veo-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .veo-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Veolia. */
  .veo-header__tools-links :global(.docs-header-control) {
    background: var(--veo-white);
    border-color: var(--veo-border-strong);
    border-radius: var(--veo-radius);
    color: var(--veo-ink);
    font-family: inherit;
  }

  .veo-header__tools-links :global(.docs-header-control:hover),
  .veo-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--veo-subtle);
    border-color: var(--veo-primary);
    color: var(--veo-primary);
    box-shadow: none;
  }

  /* Recherche Veolia : bouton loupe compact. */
  .veo-search__btn {
    align-items: center;
    background: var(--veo-primary);
    border: 1px solid var(--veo-primary);
    border-radius: var(--veo-radius);
    color: var(--veo-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 150ms ease, border-color 150ms ease;
  }

  .veo-search__btn:hover,
  .veo-search__btn:focus-visible {
    background: var(--veo-primary-hover);
    border-color: var(--veo-primary-hover);
    outline: 2px solid var(--veo-turquoise);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .veo-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--veo-primary);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Veolia ── */
  .veo-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--veo-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Veolia ── */
  .veo-sidebar {
    background: var(--veo-white);
    border-right: 1px solid var(--veo-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .veo-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .veo-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--veo-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .veo-version-badge {
    background: var(--veo-subtle);
    border: 1px solid var(--veo-border);
    border-radius: var(--veo-radius);
    color: var(--veo-primary);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .veo-sidebar-github {
    align-items: center;
    color: var(--veo-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 150ms ease;
  }

  .veo-sidebar-github:hover,
  .veo-sidebar-github:focus-visible {
    color: var(--veo-primary);
  }

  .veo-side-list,
  .veo-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .veo-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--veo-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
  }

  .veo-side-link:hover,
  .veo-side-link:focus-visible {
    background: var(--veo-subtle);
    color: var(--veo-primary);
    text-decoration: none;
  }

  .veo-side-link[aria-current="page"] {
    background: var(--veo-primary-light);
    border-left-color: var(--veo-primary);
    color: var(--veo-primary);
    font-weight: 700;
    text-decoration: none;
  }

  .veo-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .veo-side-divider {
    border-top: 1px solid var(--veo-border);
    margin: 0.5rem 0;
  }

  .veo-side-group {
    display: block;
  }

  .veo-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--veo-secondary);
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

  .veo-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .veo-side-group__summary:hover,
  .veo-side-group__summary:focus-visible {
    background: var(--veo-subtle);
    outline: none;
  }

  .veo-side-group :global(.veo-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 150ms ease;
  }

  .veo-side-group:not([open]) :global(.veo-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .veo-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .veo-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .veo-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .veo-breadcrumb__item {
    align-items: center;
    color: var(--veo-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .veo-breadcrumb__item + .veo-breadcrumb__item::before {
    color: var(--veo-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .veo-breadcrumb__link {
    color: var(--veo-primary);
    text-decoration: none;
  }

  .veo-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .veo-breadcrumb__item span[aria-current="page"] {
    color: var(--veo-ink);
    font-weight: 600;
  }

  /* ── Footer Veolia ── */
  .veo-footer {
    background: var(--veo-subtle);
    border-top: 1px solid var(--veo-border);
    margin-top: auto;
  }

  .veo-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .veo-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .veo-footer__link {
    color: var(--veo-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .veo-footer__link:hover {
    color: var(--veo-primary);
    text-decoration: underline;
  }

  .veo-footer__logo {
    display: block;
    width: auto;
    height: 24px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .veo-body {
      grid-template-columns: 1fr;
    }

    .veo-sidebar {
      display: none;
    }

    .veo-nav {
      display: none;
    }

    .veo-header__tools {
      display: none;
    }

    .veo-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .veo-nav__link,
    .veo-search__btn,
    .veo-side-link,
    .veo-side-group :global(.veo-side-group__icon) {
      transition: none;
    }
  }
</style>

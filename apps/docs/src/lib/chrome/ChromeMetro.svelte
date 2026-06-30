<!--
  Chrome documentaire Metro (metro.ca, épicerie québécoise).
  Forme fidèle à l'en-tête réel de metro.ca :
  - Header : bandeau BLANC propre, logo officiel Metro (wordmark rouge + pastille
    « fièrement d'ici ! ») à gauche, loupe de recherche compacte, CTA ROUGE à droite
  - Nav horizontale sous le header, onglet actif SOULIGNÉ rouge Metro
  - Barre latérale gauche : item actif accent rouge à gauche + fond rouge tinté,
    sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande claire avec liens + logo Metro
  - Couleurs MESURÉES : rouge Metro #D81E05 (primaire / danger), hover #b01804,
    encre #333333, surfaces blanches, subtle #f5f5f5, bord #e3e3e3,
    secondaire #5a5a5a ; teintes rayons (jaune #FAB32C, orange #F18E00,
    vert #199B6F) pour de menus détails
  - Logo officiel Metro (vecteur metro.ca, wordmark rouge #d81e05) référencé via
    <img src="/chrome/metro/logo.svg">
  - Typo : 'Roboto' (Arial fallback), chargée via Google Fonts dans <svelte:head>
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

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap"
  />
</svelte:head>

<div class="metro-shell">
  <!-- ── HEADER METRO ── -->
  <div class="metro-header-wrap">
    <header class="metro-header" aria-label="Metro">
      <div class="metro-header__inner">
        <!-- Gauche : logo officiel Metro (wordmark rouge) -->
        <div class="metro-header__brand">
          <a href="/" class="metro-header__brand-link" aria-label="Accueil : Metro Design System">
            <img
              src="/chrome/metro/logo.svg"
              alt="Metro"
              class="metro-logo"
              width="115"
              height="48"
            />
          </a>
        </div>

        <!-- Droite : outils (switchers + comparateur) + loupe + CTA rouge -->
        <div class="metro-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="metro-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render colorModeToggle()}
            {@render localeSwitcher()}
          </div>

          <!-- Loupe de recherche Metro : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="metro-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="metro-header__burger"
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

    <!-- Nav horizontale Metro (onglets soulignés rouge) -->
    <nav class="metro-nav" aria-label="Navigation principale">
      <div class="metro-nav__inner">
        <ul class="metro-nav__list">
          {#each topNavItems as item (item.href)}
            <li class="metro-nav__item">
              <a
                class="metro-nav__link"
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </nav>
  </div>

  <!-- ── BODY METRO ── -->
  <div class="metro-body">
    <!-- Sidebar -->
    <aside class="metro-sidebar" aria-label="Navigation de la documentation">
      <nav class="metro-side-nav" aria-label="Sommaire">
        <ul class="metro-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="metro-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="metro-side-divider" role="separator"></li>

          <li class="metro-side-heading">
            <a
              class="metro-side-link metro-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="metro-side-group" open={isGroupOpen(group.items)}>
                <summary class="metro-side-group__summary">
                  <ChevronDown class="metro-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="metro-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="metro-side-link metro-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="metro-side-divider" role="separator"></li>

          <li class="metro-side-heading">
            <a
              class="metro-side-link metro-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="metro-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="metro-side-group__summary">
                  <ChevronDown class="metro-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="metro-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="metro-side-link metro-side-link--sub"
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
      <div class="metro-sidebar-footer">
        <span class="metro-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="metro-sidebar-github"
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
    <div class="metro-content">
      <nav class="metro-breadcrumb" aria-label="Breadcrumb">
        <ol class="metro-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="metro-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="metro-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER METRO ── -->
  <footer class="metro-footer" aria-label="Pied de page Metro">
    <div class="metro-footer__inner">
      <nav class="metro-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="metro-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/metro/logo.svg"
        alt="Metro"
        class="metro-footer__logo"
        width="115"
        height="48"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Metro ── */
  .metro-shell {
    --metro-red: #d81e05; /* rouge Metro primaire / danger */
    --metro-red-hover: #b01804; /* rouge hover */
    --metro-red-tint: #fdecea; /* rouge très clair (surface active) */
    --metro-yellow: #fab32c; /* accent rayon */
    --metro-orange: #f18e00; /* accent rayon */
    --metro-green: #199b6f; /* accent rayon */
    --metro-ink: #333333; /* encre / texte primaire */
    --metro-grey: #5a5a5a; /* gris texte secondaire */
    --metro-subtle: #f5f5f5; /* surface subtile */
    --metro-border: #e3e3e3; /* bord */
    --metro-white: #fff;
    --metro-sidebar-width: 17rem;
    --metro-radius: 4px;
    font-family: 'Roboto', Arial, system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--metro-white);
    color: var(--metro-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Metro ── */
  .metro-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .metro-header {
    background: var(--metro-white);
    border-bottom: 1px solid var(--metro-border);
  }

  .metro-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 80rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .metro-header__brand {
    flex: 0 0 auto;
  }

  .metro-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .metro-header__brand-link:hover {
    opacity: 0.9;
  }

  /* Logo officiel Metro (ratio préservé, hauteur ~36px comme l'en-tête réel). */
  .metro-logo {
    display: block;
    width: auto;
    height: 36px;
  }

  /* ── Outils droite (switchers + loupe + CTA) ── */
  .metro-header__tools {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  .metro-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Metro (champs clairs, bord gris 1px). */
  .metro-header__tools-links :global(.docs-header-control) {
    background: var(--metro-white);
    border-color: var(--metro-border);
    border-radius: var(--metro-radius);
    color: var(--metro-ink);
    font-family: inherit;
  }

  .metro-header__tools-links :global(.docs-header-control:hover),
  .metro-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--metro-subtle);
    border-color: var(--metro-red);
    color: var(--metro-red);
    box-shadow: none;
  }

  /* Loupe de recherche compacte (pas de champ) : carré 4px, hover rouge tinté. */
  .metro-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--metro-radius);
    color: var(--metro-ink);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .metro-search-btn:hover,
  .metro-search-btn:focus-visible {
    background: var(--metro-red-tint);
    border-color: var(--metro-red);
    color: var(--metro-red);
    outline: none;
  }

  /* CTA rouge Metro. */
  .metro-cta {
    align-items: center;
    background: var(--metro-red);
    border: 1px solid var(--metro-red);
    border-radius: var(--metro-radius);
    color: var(--metro-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .metro-cta:hover,
  .metro-cta:focus-visible {
    background: var(--metro-red-hover);
    border-color: var(--metro-red-hover);
    color: var(--metro-white);
    outline: none;
  }

  /* Burger mobile */
  .metro-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--metro-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Nav horizontale Metro (onglets soulignés rouge) ── */
  .metro-nav {
    background: var(--metro-white);
    border-bottom: 1px solid var(--metro-border);
  }

  .metro-nav__inner {
    margin: 0 auto;
    max-width: 80rem;
    overflow-x: auto;
    padding: 0 1.5rem;
  }

  .metro-nav__list {
    align-items: center;
    display: flex;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .metro-nav__item {
    flex: 0 0 auto;
  }

  .metro-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--metro-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 1rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .metro-nav__link:hover,
  .metro-nav__link:focus-visible {
    background: var(--metro-subtle);
    color: var(--metro-red);
    outline: none;
  }

  .metro-nav__link[aria-current="page"] {
    border-bottom-color: var(--metro-red);
    color: var(--metro-red);
    font-weight: 700;
  }

  /* ── Body Metro ── */
  .metro-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--metro-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 80rem;
    width: 100%;
  }

  /* ── Sidebar Metro ── */
  .metro-sidebar {
    background: var(--metro-white);
    border-right: 1px solid var(--metro-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 7.5rem);
    position: sticky;
    top: 7.5rem;
  }

  .metro-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .metro-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--metro-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .metro-version-badge {
    background: var(--metro-subtle);
    border: 1px solid var(--metro-border);
    border-radius: var(--metro-radius);
    color: var(--metro-red);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .metro-sidebar-github {
    align-items: center;
    color: var(--metro-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .metro-sidebar-github:hover,
  .metro-sidebar-github:focus-visible {
    color: var(--metro-red);
  }

  .metro-side-list,
  .metro-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .metro-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--metro-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .metro-side-link:hover,
  .metro-side-link:focus-visible {
    background: var(--metro-subtle);
    color: var(--metro-red);
    text-decoration: none;
  }

  .metro-side-link[aria-current="page"] {
    background: var(--metro-red-tint);
    border-left-color: var(--metro-red);
    color: var(--metro-red-hover);
    font-weight: 700;
    text-decoration: none;
  }

  .metro-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .metro-side-divider {
    border-top: 1px solid var(--metro-border);
    margin: 0.5rem 0;
  }

  .metro-side-group {
    display: block;
  }

  .metro-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--metro-grey);
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

  .metro-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .metro-side-group__summary:hover,
  .metro-side-group__summary:focus-visible {
    background: var(--metro-subtle);
    outline: none;
  }

  .metro-side-group :global(.metro-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .metro-side-group:not([open]) :global(.metro-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .metro-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .metro-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .metro-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .metro-breadcrumb__item {
    align-items: center;
    color: var(--metro-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .metro-breadcrumb__item + .metro-breadcrumb__item::before {
    color: var(--metro-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .metro-breadcrumb__link {
    color: var(--metro-red);
    text-decoration: none;
  }

  .metro-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .metro-breadcrumb__item span[aria-current="page"] {
    color: var(--metro-ink);
    font-weight: 600;
  }

  /* ── Footer Metro ── */
  .metro-footer {
    background: var(--metro-subtle);
    border-top: 1px solid var(--metro-border);
    margin-top: auto;
  }

  .metro-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 80rem;
    padding: 1.5rem;
  }

  .metro-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .metro-footer__link {
    color: var(--metro-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .metro-footer__link:hover {
    color: var(--metro-red);
    text-decoration: underline;
  }

  .metro-footer__logo {
    display: block;
    width: auto;
    height: 34px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .metro-body {
      grid-template-columns: 1fr;
    }

    .metro-sidebar {
      display: none;
    }

    .metro-header__tools {
      display: none;
    }

    .metro-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .metro-nav__link,
    .metro-cta,
    .metro-search-btn,
    .metro-side-link,
    .metro-side-group :global(.metro-side-group__icon) {
      transition: none;
    }
  }
</style>

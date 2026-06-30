<!--
  Chrome documentaire Renault (renault.com — automobile).
  Forme fidèle à l'identité Renault 2021 : MONOCHROME, losange + jaune signature.
  - Header : bandeau BLANC, LOSANGE officiel Renault (emblème) à gauche, nav CAPITALES
    au centre, recherche JAUNE (icône NOIRE) à droite
  - Onglet actif = SOULIGNÉ JAUNE #efdf00 + texte anthracite ; item sidebar actif =
    liseré anthracite + fond jaune très clair
  - ACCESSIBILITÉ : le jaune Renault échoue en texte sur blanc → il ne sert que de
    REMPLISSAGE (bouton recherche, texte noir) et d'INDICATEUR actif ; tous les rôles
    texte/lien/liseré sont routés sur l'anthracite #191c1f (lisible), comme le thème
  - Couleurs MESURÉES (theme-renault — brand.renault.com) : Renault Yellow #efdf00
    (survol #d4c400), anthracite #191c1f (Pantone 426 C), gris #888b8d / #5a5d5f,
    surface #f5f5f3, bordures #d9d9d6 / #bbbcbc
  - Emblème OFFICIEL Renault 2021 (losange, vecteur Wikimedia) via <img src="/chrome/renault/logo.svg">
  - Typo : « NouvelR » propriétaire → repli système (aucune police réseau chargée)
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

<div class="rno-shell">
  <!-- ── HEADER Renault ── -->
  <div class="rno-header-wrap">
    <header class="rno-header" aria-label="Renault">
      <div class="rno-header__inner">
        <!-- Gauche : logo officiel Renault -->
        <div class="rno-header__brand">
          <a href="/" class="rno-header__brand-link" aria-label="Accueil : Renault Design System">
            <img
              src="/chrome/renault/logo.svg"
              alt="Renault"
              class="rno-logo"
              width="30"
              height="40"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="rno-nav" aria-label="Navigation principale">
          <ul class="rno-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="rno-nav__item">
                <a
                  class="rno-nav__link"
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
        <div class="rno-header__tools">
          <button
            type="button"
            class="rno-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="rno-header__tools-links">
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
          class="rno-header__burger"
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

  <!-- ── BODY Renault ── -->
  <div class="rno-body">
    <!-- Sidebar -->
    <aside class="rno-sidebar" aria-label="Navigation de la documentation">
      <nav class="rno-side-nav" aria-label="Sommaire">
        <ul class="rno-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="rno-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="rno-side-divider" role="separator"></li>

          <li class="rno-side-heading">
            <a
              class="rno-side-link rno-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="rno-side-group" open={isGroupOpen(group.items)}>
                <summary class="rno-side-group__summary">
                  <ChevronDown class="rno-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="rno-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="rno-side-link rno-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="rno-side-divider" role="separator"></li>

          <li class="rno-side-heading">
            <a
              class="rno-side-link rno-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="rno-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="rno-side-group__summary">
                  <ChevronDown class="rno-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="rno-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="rno-side-link rno-side-link--sub"
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
      <div class="rno-sidebar-footer">
        <span class="rno-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="rno-sidebar-github"
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
    <div class="rno-content">
      <nav class="rno-breadcrumb" aria-label="Breadcrumb">
        <ol class="rno-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="rno-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="rno-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Renault ── -->
  <footer class="rno-footer" aria-label="Pied de page Renault">
    <div class="rno-footer__inner">
      <nav class="rno-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="rno-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/renault/logo.svg"
        alt="Renault"
        class="rno-footer__logo"
        width="26"
        height="34"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Renault ── */
  .rno-shell {
    --rno-primary: #191c1f; /* anthracite (Pantone 426 C) — texte/lien/liseré (AA-safe) */
    --rno-primary-hover: #000000; /* noir survol */
    --rno-primary-light: #fdf6b8; /* tint jaune clair (fond item actif sidebar) */
    --rno-yellow: #efdf00; /* Renault Yellow — remplissage & indicateur actif (texte noir) */
    --rno-yellow-dark: #d4c400; /* jaune survol (derived) */
    --rno-ink: #191c1f; /* anthracite — corps de texte / lignes */
    --rno-black: #000000; /* Renault Black (texte sur jaune) */
    --rno-secondary: #5a5d5f; /* gris secondaire (derived, AA) */
    --rno-subtle: #f5f5f3; /* surface alt (derived) */
    --rno-border: #d9d9d6; /* Renault Light Grey (bordure subtile) */
    --rno-border-strong: #bbbcbc; /* Renault Medium Grey (bordure champ) */
    --rno-white: #fff;
    --rno-sidebar-width: 17rem;
    --rno-radius: 2px;
    font-family: 'NouvelR', 'Renault Group', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--rno-white);
    color: var(--rno-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Renault ── */
  .rno-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .rno-header {
    background: var(--rno-white);
    border-bottom: 1px solid var(--rno-border);
  }

  .rno-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .rno-header__brand {
    flex: 0 0 auto;
  }

  .rno-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 160ms ease;
  }

  .rno-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Renault (ratio préservé). */
  .rno-logo {
    display: block;
    width: auto;
    height: 40px;
  }

  /* ── Nav horizontale (centre) ── */
  .rno-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .rno-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .rno-nav__item {
    flex: 0 0 auto;
  }

  .rno-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--rno-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    transition: border-color 160ms ease, color 160ms ease;
    white-space: nowrap;
  }

  .rno-nav__link:hover,
  .rno-nav__link:focus-visible {
    color: var(--rno-ink);
    outline: none;
  }

  .rno-nav__link[aria-current="page"] {
    border-bottom-color: var(--rno-yellow);
    color: var(--rno-ink);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .rno-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .rno-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Renault. */
  .rno-header__tools-links :global(.docs-header-control) {
    background: var(--rno-white);
    border-color: var(--rno-border-strong);
    border-radius: var(--rno-radius);
    color: var(--rno-ink);
    font-family: inherit;
  }

  .rno-header__tools-links :global(.docs-header-control:hover),
  .rno-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--rno-subtle);
    border-color: var(--rno-yellow);
    color: var(--rno-ink);
    box-shadow: none;
  }

  /* Recherche Renault : bouton loupe compact. */
  .rno-search__btn {
    align-items: center;
    background: var(--rno-yellow);
    border: 1px solid var(--rno-yellow);
    border-radius: var(--rno-radius);
    color: var(--rno-black);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 160ms ease, border-color 160ms ease;
  }

  .rno-search__btn:hover,
  .rno-search__btn:focus-visible {
    background: var(--rno-yellow-dark);
    border-color: var(--rno-yellow-dark);
    outline: 2px solid var(--rno-ink);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .rno-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--rno-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Renault ── */
  .rno-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--rno-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Renault ── */
  .rno-sidebar {
    background: var(--rno-white);
    border-right: 1px solid var(--rno-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .rno-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .rno-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--rno-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .rno-version-badge {
    background: var(--rno-subtle);
    border: 1px solid var(--rno-border);
    border-radius: var(--rno-radius);
    color: var(--rno-ink);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .rno-sidebar-github {
    align-items: center;
    color: var(--rno-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 160ms ease;
  }

  .rno-sidebar-github:hover,
  .rno-sidebar-github:focus-visible {
    color: var(--rno-primary);
  }

  .rno-side-list,
  .rno-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .rno-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--rno-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
  }

  .rno-side-link:hover,
  .rno-side-link:focus-visible {
    background: var(--rno-subtle);
    color: var(--rno-primary);
    text-decoration: none;
  }

  .rno-side-link[aria-current="page"] {
    background: var(--rno-primary-light);
    border-left-color: var(--rno-primary);
    color: var(--rno-ink);
    font-weight: 700;
    text-decoration: none;
  }

  .rno-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .rno-side-divider {
    border-top: 1px solid var(--rno-border);
    margin: 0.5rem 0;
  }

  .rno-side-group {
    display: block;
  }

  .rno-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--rno-secondary);
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
    transition: background 160ms ease;
  }

  .rno-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .rno-side-group__summary:hover,
  .rno-side-group__summary:focus-visible {
    background: var(--rno-subtle);
    outline: none;
  }

  .rno-side-group :global(.rno-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 160ms ease;
  }

  .rno-side-group:not([open]) :global(.rno-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .rno-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .rno-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .rno-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .rno-breadcrumb__item {
    align-items: center;
    color: var(--rno-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .rno-breadcrumb__item + .rno-breadcrumb__item::before {
    color: var(--rno-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .rno-breadcrumb__link {
    color: var(--rno-primary);
    text-decoration: none;
  }

  .rno-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .rno-breadcrumb__item span[aria-current="page"] {
    color: var(--rno-ink);
    font-weight: 600;
  }

  /* ── Footer Renault ── */
  .rno-footer {
    background: var(--rno-subtle);
    border-top: 1px solid var(--rno-border);
    margin-top: auto;
  }

  .rno-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .rno-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .rno-footer__link {
    color: var(--rno-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .rno-footer__link:hover {
    color: var(--rno-primary);
    text-decoration: underline;
  }

  .rno-footer__logo {
    display: block;
    width: auto;
    height: 34px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .rno-body {
      grid-template-columns: 1fr;
    }

    .rno-sidebar {
      display: none;
    }

    .rno-nav {
      display: none;
    }

    .rno-header__tools {
      display: none;
    }

    .rno-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .rno-nav__link,
    .rno-search__btn,
    .rno-side-link,
    .rno-side-group :global(.rno-side-group__icon) {
      transition: none;
    }
  }
</style>

<!--
  Chrome documentaire Orange (orange.com — design system « Boosted »).
  Forme fidèle à Boosted (Orange-Boosted-Bootstrap) : franc, carré, contrasté.
  - Header : bandeau BLANC, logo OFFICIEL Orange (carré orange + « orange ») à
    gauche, nav NOIRE au centre, recherche carrée orange vif (icône noire) à droite
  - Coins CARRÉS ($enable-rounded:false) ; bordures NOIRES haute densité (signature)
  - Onglet actif = SOULIGNÉ orange + texte noir ; item sidebar actif = liseré orange
  - Couleurs MESURÉES (scss/_variables.scss + ODS) : orange vif #ff7900, orange AA
    #f16e00, noir #000, encre #141414, gris #666666, surface #f6f6f6, stroke #cccccc
  - Logo OFFICIEL Orange (vecteur carré) via <img src="/chrome/orange/logo.svg">
  - Typo : « HelvNeueOrange » propriétaire → repli 'Helvetica Neue', Arial
    (aucune police réseau chargée, fidèle au repli système Boosted)
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

<div class="org-shell">
  <!-- ── HEADER Orange ── -->
  <div class="org-header-wrap">
    <header class="org-header" aria-label="Orange">
      <div class="org-header__inner">
        <!-- Gauche : logo officiel Orange -->
        <div class="org-header__brand">
          <a href="/" class="org-header__brand-link" aria-label="Accueil : Orange Design System">
            <img
              src="/chrome/orange/logo.svg"
              alt="Orange"
              class="org-logo"
              width="40"
              height="40"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="org-nav" aria-label="Navigation principale">
          <ul class="org-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="org-nav__item">
                <a
                  class="org-nav__link"
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
        <div class="org-header__tools">
          <button
            type="button"
            class="org-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="org-header__tools-links">
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
          class="org-header__burger"
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

  <!-- ── BODY Orange ── -->
  <div class="org-body">
    <!-- Sidebar -->
    <aside class="org-sidebar" aria-label="Navigation de la documentation">
      <nav class="org-side-nav" aria-label="Sommaire">
        <ul class="org-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="org-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="org-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="org-side-group" open={isGroupOpen(group.items)}>
                <summary class="org-side-group__summary">
                  <ChevronDown class="org-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="org-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="org-side-link org-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="org-side-divider" role="separator"></li>

          <li>
            <a
              class="org-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="org-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="org-side-group__summary">
                  <ChevronDown class="org-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="org-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="org-side-link org-side-link--sub"
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
      <div class="org-sidebar-footer">
        <span class="org-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="org-sidebar-github"
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
    <div class="org-content">
      <nav class="org-breadcrumb" aria-label="Breadcrumb">
        <ol class="org-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="org-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="org-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Orange ── -->
  <footer class="org-footer" aria-label="Pied de page Orange">
    <div class="org-footer__inner">
      <nav class="org-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="org-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/orange/logo.svg"
        alt="Orange"
        class="org-footer__logo"
        width="34"
        height="34"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Orange ── */
  .org-shell {
    --org-primary: #f16e00; /* orange AA ($primary / ods-orange-200) */
    --org-primary-hover: #cc5d00; /* orange foncé */
    --org-primary-light: #fff2e6; /* tint orange (item actif sidebar) */
    --org-orange: #ff7900; /* orange vif ($supporting-orange) — action */
    --org-orange-aa: #f16e00; /* orange AA texte/lien */
    --org-orange-dark: #cc5d00;
    --org-ink: #141414; /* near-black (ods-gray-900) */
    --org-black: #000; /* body text / bordures / inverse */
    --org-secondary: #666666; /* texte secondaire (gray-700) */
    --org-subtle: #f6f6f6; /* surface (gray-200) */
    --org-border: #cccccc; /* stroke subtil (gray-500) */
    --org-border-strong: #000;
    --org-white: #fff;
    --org-sidebar-width: 17rem;
    --org-radius: 0;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    background: var(--org-white);
    color: var(--org-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Orange ── */
  .org-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .org-header {
    background: var(--org-white);
    border-bottom: 2px solid var(--org-black);
  }

  .org-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .org-header__brand {
    flex: 0 0 auto;
  }

  .org-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .org-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Orange (ratio préservé). */
  .org-logo {
    display: block;
    width: auto;
    height: 40px;
  }

  /* ── Nav horizontale (centre) ── */
  .org-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .org-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .org-nav__item {
    flex: 0 0 auto;
  }

  .org-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--org-black);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 700;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: none;
    letter-spacing: normal;
    transition: border-color 120ms ease, color 120ms ease;
    white-space: nowrap;
  }

  .org-nav__link:hover,
  .org-nav__link:focus-visible {
    color: var(--org-black);
    outline: none;
  }

  .org-nav__link[aria-current="page"] {
    border-bottom-color: var(--org-orange);
    color: var(--org-black);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .org-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .org-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Orange. */
  .org-header__tools-links :global(.docs-header-control) {
    background: var(--org-white);
    border-color: var(--org-black);
    border-radius: var(--org-radius);
    color: var(--org-black);
    font-family: inherit;
  }

  .org-header__tools-links :global(.docs-header-control:hover),
  .org-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--org-subtle);
    border-color: var(--org-orange);
    color: var(--org-black);
    box-shadow: none;
  }

  /* Recherche Orange : bouton loupe compact. */
  .org-search__btn {
    align-items: center;
    background: var(--org-orange);
    border: 1px solid var(--org-black);
    border-radius: var(--org-radius);
    color: var(--org-black);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease;
  }

  .org-search__btn:hover,
  .org-search__btn:focus-visible {
    background: var(--org-orange-dark);
    border-color: var(--org-orange-dark);
    outline: 2px solid var(--org-black);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .org-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--org-black);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Orange ── */
  .org-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--org-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Orange ── */
  .org-sidebar {
    background: var(--org-white);
    border-right: 1px solid var(--org-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .org-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .org-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--org-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .org-version-badge {
    background: var(--org-subtle);
    border: 1px solid var(--org-border);
    border-radius: var(--org-radius);
    color: var(--org-orange-aa);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .org-sidebar-github {
    align-items: center;
    color: var(--org-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .org-sidebar-github:hover,
  .org-sidebar-github:focus-visible {
    color: var(--org-primary);
  }

  .org-side-list,
  .org-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .org-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--org-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .org-side-link:hover,
  .org-side-link:focus-visible {
    background: var(--org-subtle);
    color: var(--org-primary);
    text-decoration: none;
  }

  .org-side-link[aria-current="page"] {
    background: var(--org-primary-light);
    border-left-color: var(--org-primary);
    color: var(--org-black);
    font-weight: 700;
    text-decoration: none;
  }

  .org-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .org-side-divider {
    border-top: 1px solid var(--org-border);
    margin: 0.5rem 0;
  }

  .org-side-group {
    display: block;
  }

  .org-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--org-secondary);
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

  .org-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .org-side-group__summary:hover,
  .org-side-group__summary:focus-visible {
    background: var(--org-subtle);
    outline: none;
  }

  .org-side-group :global(.org-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .org-side-group:not([open]) :global(.org-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .org-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .org-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .org-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .org-breadcrumb__item {
    align-items: center;
    color: var(--org-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .org-breadcrumb__item + .org-breadcrumb__item::before {
    color: var(--org-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .org-breadcrumb__link {
    color: var(--org-primary);
    text-decoration: none;
  }

  .org-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .org-breadcrumb__item span[aria-current="page"] {
    color: var(--org-ink);
    font-weight: 600;
  }

  /* ── Footer Orange ── */
  .org-footer {
    background: var(--org-subtle);
    border-top: 1px solid var(--org-border);
    margin-top: auto;
  }

  .org-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .org-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .org-footer__link {
    color: var(--org-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .org-footer__link:hover {
    color: var(--org-primary);
    text-decoration: underline;
  }

  .org-footer__logo {
    display: block;
    width: auto;
    height: 34px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .org-body {
      grid-template-columns: 1fr;
    }

    .org-sidebar {
      display: none;
    }

    .org-nav {
      display: none;
    }

    .org-header__tools {
      display: none;
    }

    .org-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .org-nav__link,
    .org-search__btn,
    .org-side-link,
    .org-side-group :global(.org-side-group__icon) {
      transition: none;
    }
  }
</style>

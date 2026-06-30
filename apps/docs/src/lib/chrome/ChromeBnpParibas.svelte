<!--
  Chrome documentaire BNP Paribas (group.bnpparibas — site retail).
  Forme fidèle à l'en-tête bancaire BNP : clair, vert institutionnel, sobre.
  - Header : bandeau BLANC, logo OFFICIEL BNP (étoiles « courbe d'envol » +
    « BNP PARIBAS ») à gauche, nav au centre, recherche verte à droite
  - Onglet actif = SOULIGNÉ vert BNP ; item sidebar actif = liseré vert + fond menthe
  - Couleurs MESURÉES (--color-* live) : vert BNP #00915a (primaire, survol #006d44),
    lien #007a4c, menthe #e5f4ee, encre #181d1d, gris #6d6d6d, surface #f5f5f5,
    bordure #e7e7e7, focus ciel #00bbff
  - Logo OFFICIEL BNP Paribas (vecteur) via <img src="/chrome/bnp-paribas/logo.svg">
  - Typo : « BNP Paribas » propriétaire → repli Arial, 'Helvetica Neue', sans-serif
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

<div class="bnp-shell">
  <!-- ── HEADER BNP Paribas ── -->
  <div class="bnp-header-wrap">
    <header class="bnp-header" aria-label="BNP Paribas">
      <div class="bnp-header__inner">
        <!-- Gauche : logo officiel BNP Paribas -->
        <div class="bnp-header__brand">
          <a href="/" class="bnp-header__brand-link" aria-label="Accueil : BNP Paribas Design System">
            <img
              src="/chrome/bnp-paribas/logo.svg"
              alt="BNP Paribas"
              class="bnp-logo"
              width="165"
              height="34"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="bnp-nav" aria-label="Navigation principale">
          <ul class="bnp-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="bnp-nav__item">
                <a
                  class="bnp-nav__link"
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
        <div class="bnp-header__tools">
          <button
            type="button"
            class="bnp-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="bnp-header__tools-links">
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
          class="bnp-header__burger"
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

  <!-- ── BODY BNP Paribas ── -->
  <div class="bnp-body">
    <!-- Sidebar -->
    <aside class="bnp-sidebar" aria-label="Navigation de la documentation">
      <nav class="bnp-side-nav" aria-label="Sommaire">
        <ul class="bnp-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="bnp-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="bnp-side-divider" role="separator"></li>

          <li class="bnp-side-heading">
            <a
              class="bnp-side-link bnp-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="bnp-side-group" open={isGroupOpen(group.items)}>
                <summary class="bnp-side-group__summary">
                  <ChevronDown class="bnp-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="bnp-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="bnp-side-link bnp-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="bnp-side-divider" role="separator"></li>

          <li class="bnp-side-heading">
            <a
              class="bnp-side-link bnp-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="bnp-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="bnp-side-group__summary">
                  <ChevronDown class="bnp-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="bnp-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="bnp-side-link bnp-side-link--sub"
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
      <div class="bnp-sidebar-footer">
        <span class="bnp-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="bnp-sidebar-github"
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
    <div class="bnp-content">
      <nav class="bnp-breadcrumb" aria-label="Breadcrumb">
        <ol class="bnp-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="bnp-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="bnp-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER BNP Paribas ── -->
  <footer class="bnp-footer" aria-label="Pied de page BNP Paribas">
    <div class="bnp-footer__inner">
      <nav class="bnp-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="bnp-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/bnp-paribas/logo.svg"
        alt="BNP Paribas"
        class="bnp-footer__logo"
        width="146"
        height="30"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables BNP Paribas ── */
  .bnp-shell {
    --bnp-primary: #00915a; /* vert BNP (--color-brand-primary) */
    --bnp-primary-hover: #006d44; /* vert survol (--color-brand-primary-hover) */
    --bnp-primary-light: #e5f4ee; /* menthe (item actif sidebar) */
    --bnp-link: #007a4c; /* vert lien (--color-green-800) */
    --bnp-ink: #181d1d; /* near-black (--color-black) */
    --bnp-secondary: #6d6d6d; /* gris secondaire (--color-neutral-900) */
    --bnp-subtle: #f5f5f5; /* surface (--color-neutral-200) */
    --bnp-border: #e7e7e7; /* bordure subtile (--color-neutral-300) */
    --bnp-border-strong: #cccccc; /* bordure champ (--color-neutral-400) */
    --bnp-focus: #00bbff; /* anneau focus ciel */
    --bnp-white: #fff;
    --bnp-sidebar-width: 17rem;
    --bnp-radius: 8px;
    font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
    background: var(--bnp-white);
    color: var(--bnp-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header BNP Paribas ── */
  .bnp-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .bnp-header {
    background: var(--bnp-white);
    border-bottom: 1px solid var(--bnp-border);
  }

  .bnp-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .bnp-header__brand {
    flex: 0 0 auto;
  }

  .bnp-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 150ms ease;
  }

  .bnp-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel BNP Paribas (ratio préservé). */
  .bnp-logo {
    display: block;
    width: auto;
    height: 34px;
  }

  /* ── Nav horizontale (centre) ── */
  .bnp-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .bnp-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .bnp-nav__item {
    flex: 0 0 auto;
  }

  .bnp-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--bnp-ink);
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

  .bnp-nav__link:hover,
  .bnp-nav__link:focus-visible {
    color: var(--bnp-primary);
    outline: none;
  }

  .bnp-nav__link[aria-current="page"] {
    border-bottom-color: var(--bnp-primary);
    color: var(--bnp-primary);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .bnp-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .bnp-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header BNP Paribas. */
  .bnp-header__tools-links :global(.docs-header-control) {
    background: var(--bnp-white);
    border-color: var(--bnp-border-strong);
    border-radius: var(--bnp-radius);
    color: var(--bnp-ink);
    font-family: inherit;
  }

  .bnp-header__tools-links :global(.docs-header-control:hover),
  .bnp-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--bnp-subtle);
    border-color: var(--bnp-primary);
    color: var(--bnp-primary);
    box-shadow: none;
  }

  /* Recherche BNP Paribas : bouton loupe compact. */
  .bnp-search__btn {
    align-items: center;
    background: var(--bnp-primary);
    border: 1px solid var(--bnp-primary);
    border-radius: var(--bnp-radius);
    color: var(--bnp-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 150ms ease, border-color 150ms ease;
  }

  .bnp-search__btn:hover,
  .bnp-search__btn:focus-visible {
    background: var(--bnp-primary-hover);
    border-color: var(--bnp-primary-hover);
    outline: 2px solid var(--bnp-focus);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .bnp-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--bnp-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body BNP Paribas ── */
  .bnp-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--bnp-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar BNP Paribas ── */
  .bnp-sidebar {
    background: var(--bnp-white);
    border-right: 1px solid var(--bnp-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .bnp-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .bnp-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--bnp-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .bnp-version-badge {
    background: var(--bnp-subtle);
    border: 1px solid var(--bnp-border);
    border-radius: var(--bnp-radius);
    color: var(--bnp-primary);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .bnp-sidebar-github {
    align-items: center;
    color: var(--bnp-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 150ms ease;
  }

  .bnp-sidebar-github:hover,
  .bnp-sidebar-github:focus-visible {
    color: var(--bnp-primary);
  }

  .bnp-side-list,
  .bnp-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .bnp-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--bnp-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
  }

  .bnp-side-link:hover,
  .bnp-side-link:focus-visible {
    background: var(--bnp-subtle);
    color: var(--bnp-primary);
    text-decoration: none;
  }

  .bnp-side-link[aria-current="page"] {
    background: var(--bnp-primary-light);
    border-left-color: var(--bnp-primary);
    color: var(--bnp-primary-hover);
    font-weight: 700;
    text-decoration: none;
  }

  .bnp-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .bnp-side-divider {
    border-top: 1px solid var(--bnp-border);
    margin: 0.5rem 0;
  }

  .bnp-side-group {
    display: block;
  }

  .bnp-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--bnp-secondary);
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

  .bnp-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .bnp-side-group__summary:hover,
  .bnp-side-group__summary:focus-visible {
    background: var(--bnp-subtle);
    outline: none;
  }

  .bnp-side-group :global(.bnp-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 150ms ease;
  }

  .bnp-side-group:not([open]) :global(.bnp-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .bnp-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .bnp-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .bnp-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .bnp-breadcrumb__item {
    align-items: center;
    color: var(--bnp-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .bnp-breadcrumb__item + .bnp-breadcrumb__item::before {
    color: var(--bnp-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .bnp-breadcrumb__link {
    color: var(--bnp-primary);
    text-decoration: none;
  }

  .bnp-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .bnp-breadcrumb__item span[aria-current="page"] {
    color: var(--bnp-ink);
    font-weight: 600;
  }

  /* ── Footer BNP Paribas ── */
  .bnp-footer {
    background: var(--bnp-subtle);
    border-top: 1px solid var(--bnp-border);
    margin-top: auto;
  }

  .bnp-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .bnp-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .bnp-footer__link {
    color: var(--bnp-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .bnp-footer__link:hover {
    color: var(--bnp-primary);
    text-decoration: underline;
  }

  .bnp-footer__logo {
    display: block;
    width: auto;
    height: 30px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .bnp-body {
      grid-template-columns: 1fr;
    }

    .bnp-sidebar {
      display: none;
    }

    .bnp-nav {
      display: none;
    }

    .bnp-header__tools {
      display: none;
    }

    .bnp-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .bnp-nav__link,
    .bnp-search__btn,
    .bnp-side-link,
    .bnp-side-group :global(.bnp-side-group__icon) {
      transition: none;
    }
  }
</style>

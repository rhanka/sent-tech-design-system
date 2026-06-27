<!--
  Chrome documentaire Kering (kering.com — groupe de luxe).
  Forme fidèle au site Kering : MONOCHROME noir-sur-blanc, beige chaud au survol,
  coins CARRÉS, CAPITALES.
  - Header : bandeau BLANC, logo OFFICIEL Kering (wordmark « KERING » + chouette,
    noir) à gauche, nav CAPITALES espacées au centre, recherche NOIRE à droite
  - Coins CARRÉS (radius 0 — minimalisme luxe) ; onglet actif = SOULIGNÉ noir
  - Item sidebar actif = liseré noir + fond beige chaud (#f1e4db, a:hover MESURÉ) ;
    surfaces de survol = beige chaud signature (#f8f2ed)
  - Couleurs MESURÉES (custom properties) : noir #000 (--black-pure / --text-color,
    survol near-black #323232), beige #f8f2ed / #f1e4db, gris #575757 / #7c7c7c,
    bordure #e6e6e6 / #cacaca
  - Logo OFFICIEL Kering (vecteur, Wikimedia Commons) via /chrome/kering/logo.svg
  - Typo : « Akzidenz-Grotesk Std Ext » propriétaire → repli 'Helvetica Neue',
    Helvetica, Arial (aucune police réseau chargée)
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

<div class="ker-shell">
  <!-- ── HEADER Kering ── -->
  <div class="ker-header-wrap">
    <header class="ker-header" aria-label="Kering">
      <div class="ker-header__inner">
        <!-- Gauche : logo officiel Kering -->
        <div class="ker-header__brand">
          <a href="/" class="ker-header__brand-link" aria-label="Accueil : Kering Design System">
            <img
              src="/chrome/kering/logo.svg"
              alt="Kering"
              class="ker-logo"
              width="77"
              height="26"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="ker-nav" aria-label="Navigation principale">
          <ul class="ker-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="ker-nav__item">
                <a
                  class="ker-nav__link"
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
        <div class="ker-header__tools">
          <button
            type="button"
            class="ker-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="ker-header__tools-links">
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
          class="ker-header__burger"
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

  <!-- ── BODY Kering ── -->
  <div class="ker-body">
    <!-- Sidebar -->
    <aside class="ker-sidebar" aria-label="Navigation de la documentation">
      <nav class="ker-side-nav" aria-label="Sommaire">
        <ul class="ker-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="ker-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="ker-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="ker-side-group" open={isGroupOpen(group.items)}>
                <summary class="ker-side-group__summary">
                  <ChevronDown class="ker-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="ker-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="ker-side-link ker-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="ker-side-divider" role="separator"></li>

          <li>
            <a
              class="ker-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="ker-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="ker-side-group__summary">
                  <ChevronDown class="ker-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="ker-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="ker-side-link ker-side-link--sub"
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
      <div class="ker-sidebar-footer">
        <span class="ker-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="ker-sidebar-github"
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
    <div class="ker-content">
      <nav class="ker-breadcrumb" aria-label="Breadcrumb">
        <ol class="ker-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="ker-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="ker-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Kering ── -->
  <footer class="ker-footer" aria-label="Pied de page Kering">
    <div class="ker-footer__inner">
      <nav class="ker-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="ker-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/kering/logo.svg"
        alt="Kering"
        class="ker-footer__logo"
        width="68"
        height="23"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Kering ── */
  .ker-shell {
    --ker-primary: #000000; /* noir pur (--black-pure / --text-color) */
    --ker-primary-hover: #323232; /* near-black survol (--gray-1100) */
    --ker-primary-light: #f1e4db; /* beige chaud a:hover (item actif sidebar, MESURÉ) */
    --ker-ink: #000000; /* encre noire primaire (MESURÉE) */
    --ker-secondary: #575757; /* gris fort secondaire (--gray-850) */
    --ker-subtle: #f8f2ed; /* beige chaud signature (--beige-100) */
    --ker-border: #e6e6e6; /* bordure subtile (--gray-400) */
    --ker-border-strong: #cacaca; /* bordure champ (--gray-450) */
    --ker-focus: #000000; /* outline focus noir (MESURÉ) */
    --ker-white: #fff;
    --ker-sidebar-width: 17rem;
    --ker-radius: 0;
    font-family: 'Akzidenz-Grotesk Std Ext Regular', 'Akzidenz-Grotesk Std', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    background: var(--ker-white);
    color: var(--ker-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Kering ── */
  .ker-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .ker-header {
    background: var(--ker-white);
    border-bottom: 1px solid var(--ker-border);
  }

  .ker-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .ker-header__brand {
    flex: 0 0 auto;
  }

  .ker-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 150ms ease;
  }

  .ker-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Kering (ratio préservé). */
  .ker-logo {
    display: block;
    width: auto;
    height: 26px;
  }

  /* ── Nav horizontale (centre) ── */
  .ker-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .ker-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ker-nav__item {
    flex: 0 0 auto;
  }

  .ker-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--ker-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    transition: border-color 150ms ease, color 150ms ease;
    white-space: nowrap;
  }

  .ker-nav__link:hover,
  .ker-nav__link:focus-visible {
    color: var(--ker-ink);
    outline: none;
  }

  .ker-nav__link[aria-current="page"] {
    border-bottom-color: var(--ker-ink);
    color: var(--ker-ink);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .ker-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .ker-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Kering. */
  .ker-header__tools-links :global(.docs-header-control) {
    background: var(--ker-white);
    border-color: var(--ker-border-strong);
    border-radius: var(--ker-radius);
    color: var(--ker-ink);
    font-family: inherit;
  }

  .ker-header__tools-links :global(.docs-header-control:hover),
  .ker-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--ker-subtle);
    border-color: var(--ker-ink);
    color: var(--ker-ink);
    box-shadow: none;
  }

  /* Recherche Kering : bouton loupe compact. */
  .ker-search__btn {
    align-items: center;
    background: var(--ker-primary);
    border: 1px solid var(--ker-primary);
    border-radius: var(--ker-radius);
    color: var(--ker-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 150ms ease, border-color 150ms ease;
  }

  .ker-search__btn:hover,
  .ker-search__btn:focus-visible {
    background: var(--ker-primary-hover);
    border-color: var(--ker-primary-hover);
    outline: 2px solid var(--ker-focus);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .ker-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--ker-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Kering ── */
  .ker-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--ker-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Kering ── */
  .ker-sidebar {
    background: var(--ker-white);
    border-right: 1px solid var(--ker-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .ker-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .ker-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--ker-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .ker-version-badge {
    background: var(--ker-subtle);
    border: 1px solid var(--ker-border);
    border-radius: var(--ker-radius);
    color: var(--ker-ink);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .ker-sidebar-github {
    align-items: center;
    color: var(--ker-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 150ms ease;
  }

  .ker-sidebar-github:hover,
  .ker-sidebar-github:focus-visible {
    color: var(--ker-primary);
  }

  .ker-side-list,
  .ker-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ker-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--ker-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
  }

  .ker-side-link:hover,
  .ker-side-link:focus-visible {
    background: var(--ker-subtle);
    color: var(--ker-primary);
    text-decoration: none;
  }

  .ker-side-link[aria-current="page"] {
    background: var(--ker-primary-light);
    border-left-color: var(--ker-primary);
    color: var(--ker-ink);
    font-weight: 700;
    text-decoration: none;
  }

  .ker-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .ker-side-divider {
    border-top: 1px solid var(--ker-border);
    margin: 0.5rem 0;
  }

  .ker-side-group {
    display: block;
  }

  .ker-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--ker-secondary);
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

  .ker-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .ker-side-group__summary:hover,
  .ker-side-group__summary:focus-visible {
    background: var(--ker-subtle);
    outline: none;
  }

  .ker-side-group :global(.ker-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 150ms ease;
  }

  .ker-side-group:not([open]) :global(.ker-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .ker-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .ker-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .ker-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ker-breadcrumb__item {
    align-items: center;
    color: var(--ker-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .ker-breadcrumb__item + .ker-breadcrumb__item::before {
    color: var(--ker-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .ker-breadcrumb__link {
    color: var(--ker-primary);
    text-decoration: none;
  }

  .ker-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .ker-breadcrumb__item span[aria-current="page"] {
    color: var(--ker-ink);
    font-weight: 600;
  }

  /* ── Footer Kering ── */
  .ker-footer {
    background: var(--ker-subtle);
    border-top: 1px solid var(--ker-border);
    margin-top: auto;
  }

  .ker-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .ker-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .ker-footer__link {
    color: var(--ker-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .ker-footer__link:hover {
    color: var(--ker-primary);
    text-decoration: underline;
  }

  .ker-footer__logo {
    display: block;
    width: auto;
    height: 23px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .ker-body {
      grid-template-columns: 1fr;
    }

    .ker-sidebar {
      display: none;
    }

    .ker-nav {
      display: none;
    }

    .ker-header__tools {
      display: none;
    }

    .ker-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .ker-nav__link,
    .ker-search__btn,
    .ker-side-link,
    .ker-side-group :global(.ker-side-group__icon) {
      transition: none;
    }
  }
</style>

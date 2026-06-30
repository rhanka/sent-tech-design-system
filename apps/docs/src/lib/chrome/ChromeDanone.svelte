<!--
  Chrome documentaire Danone (danone.com — agroalimentaire santé).
  Forme fidèle au corporate Danone : bleu clair amical, blanc, coins arrondis.
  - Header : bandeau BLANC, WORDMARK « Danone » (bleu de marque + étoile jaune) à
    gauche, nav au centre, recherche BLEUE à droite
  - Coins ARRONDIS (radius 12px — registre health-food accessible)
  - Onglet actif = SOULIGNÉ bleu Danone ; item sidebar actif = liseré bleu + fond
    bleu très clair (#ccdff1)
  - Couleurs MESURÉES (live CSS) : bleu #005eb8 (primaire ~285×, survol navy
    #002677), cyan accent #00aced (focus), étoile #ffd200, texte fort #333333,
    secondaire #666666, surface #f8f8f8, bordure #e0e0e0
  - Logo : WORDMARK texte propre — aucun SVG officiel Danone publié sur Wikimedia
    Commons (PNG/JPG uniquement). Bleu de marque + étoile signature, via
    /chrome/danone/logo.svg (signalé au conducteur).
  - Typo : « DanoneOne » propriétaire → repli system-ui (aucune police réseau)
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

<div class="dan-shell">
  <!-- ── HEADER Danone ── -->
  <div class="dan-header-wrap">
    <header class="dan-header" aria-label="Danone">
      <div class="dan-header__inner">
        <!-- Gauche : logo officiel Danone -->
        <div class="dan-header__brand">
          <a href="/" class="dan-header__brand-link" aria-label="Accueil : Danone Design System">
            <img
              src="/chrome/danone/logo.svg"
              alt="Danone"
              class="dan-logo"
              width="120"
              height="30"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="dan-nav" aria-label="Navigation principale">
          <ul class="dan-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="dan-nav__item">
                <a
                  class="dan-nav__link"
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
        <div class="dan-header__tools">
          <button
            type="button"
            class="dan-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="dan-header__tools-links">
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
          class="dan-header__burger"
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

  <!-- ── BODY Danone ── -->
  <div class="dan-body">
    <!-- Sidebar -->
    <aside class="dan-sidebar" aria-label="Navigation de la documentation">
      <nav class="dan-side-nav" aria-label="Sommaire">
        <ul class="dan-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="dan-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="dan-side-divider" role="separator"></li>

          <li class="dan-side-heading">
            <a
              class="dan-side-link dan-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="dan-side-group" open={isGroupOpen(group.items)}>
                <summary class="dan-side-group__summary">
                  <ChevronDown class="dan-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="dan-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="dan-side-link dan-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="dan-side-divider" role="separator"></li>

          <li class="dan-side-heading">
            <a
              class="dan-side-link dan-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="dan-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="dan-side-group__summary">
                  <ChevronDown class="dan-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="dan-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="dan-side-link dan-side-link--sub"
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
      <div class="dan-sidebar-footer">
        <span class="dan-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="dan-sidebar-github"
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
    <div class="dan-content">
      <nav class="dan-breadcrumb" aria-label="Breadcrumb">
        <ol class="dan-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="dan-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="dan-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Danone ── -->
  <footer class="dan-footer" aria-label="Pied de page Danone">
    <div class="dan-footer__inner">
      <nav class="dan-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="dan-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/danone/logo.svg"
        alt="Danone"
        class="dan-footer__logo"
        width="104"
        height="26"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Danone ── */
  .dan-shell {
    --dan-primary: #005eb8; /* bleu Danone (--btn-bg-primary, MESURÉ) */
    --dan-primary-hover: #002677; /* navy survol (--btn-bg-secondary-hover) */
    --dan-primary-light: #ccdff1; /* bleu très clair (item actif sidebar) */
    --dan-ink: #333333; /* texte fort (grey-800) */
    --dan-secondary: #666666; /* texte secondaire (--colors-text-medium-gray) */
    --dan-subtle: #f8f8f8; /* surface (neutral-50) */
    --dan-border: #e0e0e0; /* bordure subtile (--colors-text-quaternary) */
    --dan-border-strong: #9e9e9e; /* bordure forte (--colors-icon-grey) */
    --dan-focus: #00aced; /* anneau focus cyan (--theme-accentColor, MESURÉ) */
    --dan-white: #fff;
    --dan-sidebar-width: 17rem;
    --dan-radius: 12px;
    font-family: 'DanoneOne', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    background: var(--dan-white);
    color: var(--dan-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Danone ── */
  .dan-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .dan-header {
    background: var(--dan-white);
    border-bottom: 1px solid var(--dan-border);
  }

  .dan-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .dan-header__brand {
    flex: 0 0 auto;
  }

  .dan-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 180ms ease;
  }

  .dan-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Danone (ratio préservé). */
  .dan-logo {
    display: block;
    width: auto;
    height: 30px;
  }

  /* ── Nav horizontale (centre) ── */
  .dan-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .dan-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .dan-nav__item {
    flex: 0 0 auto;
  }

  .dan-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--dan-ink);
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

  .dan-nav__link:hover,
  .dan-nav__link:focus-visible {
    color: var(--dan-primary);
    outline: none;
  }

  .dan-nav__link[aria-current="page"] {
    border-bottom-color: var(--dan-primary);
    color: var(--dan-primary);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .dan-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .dan-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Danone. */
  .dan-header__tools-links :global(.docs-header-control) {
    background: var(--dan-white);
    border-color: var(--dan-border-strong);
    border-radius: var(--dan-radius);
    color: var(--dan-ink);
    font-family: inherit;
  }

  .dan-header__tools-links :global(.docs-header-control:hover),
  .dan-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--dan-subtle);
    border-color: var(--dan-primary);
    color: var(--dan-primary);
    box-shadow: none;
  }

  /* Recherche Danone : bouton loupe compact. */
  .dan-search__btn {
    align-items: center;
    background: var(--dan-primary);
    border: 1px solid var(--dan-primary);
    border-radius: var(--dan-radius);
    color: var(--dan-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 180ms ease, border-color 180ms ease;
  }

  .dan-search__btn:hover,
  .dan-search__btn:focus-visible {
    background: var(--dan-primary-hover);
    border-color: var(--dan-primary-hover);
    outline: 2px solid var(--dan-focus);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .dan-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--dan-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Danone ── */
  .dan-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--dan-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Danone ── */
  .dan-sidebar {
    background: var(--dan-white);
    border-right: 1px solid var(--dan-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .dan-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .dan-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--dan-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .dan-version-badge {
    background: var(--dan-subtle);
    border: 1px solid var(--dan-border);
    border-radius: var(--dan-radius);
    color: var(--dan-primary);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .dan-sidebar-github {
    align-items: center;
    color: var(--dan-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 180ms ease;
  }

  .dan-sidebar-github:hover,
  .dan-sidebar-github:focus-visible {
    color: var(--dan-primary);
  }

  .dan-side-list,
  .dan-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .dan-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--dan-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
  }

  .dan-side-link:hover,
  .dan-side-link:focus-visible {
    background: var(--dan-subtle);
    color: var(--dan-primary);
    text-decoration: none;
  }

  .dan-side-link[aria-current="page"] {
    background: var(--dan-primary-light);
    border-left-color: var(--dan-primary);
    color: var(--dan-primary-hover);
    font-weight: 700;
    text-decoration: none;
  }

  .dan-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .dan-side-divider {
    border-top: 1px solid var(--dan-border);
    margin: 0.5rem 0;
  }

  .dan-side-group {
    display: block;
  }

  .dan-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--dan-secondary);
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

  .dan-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .dan-side-group__summary:hover,
  .dan-side-group__summary:focus-visible {
    background: var(--dan-subtle);
    outline: none;
  }

  .dan-side-group :global(.dan-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 180ms ease;
  }

  .dan-side-group:not([open]) :global(.dan-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .dan-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .dan-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .dan-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .dan-breadcrumb__item {
    align-items: center;
    color: var(--dan-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .dan-breadcrumb__item + .dan-breadcrumb__item::before {
    color: var(--dan-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .dan-breadcrumb__link {
    color: var(--dan-primary);
    text-decoration: none;
  }

  .dan-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .dan-breadcrumb__item span[aria-current="page"] {
    color: var(--dan-ink);
    font-weight: 600;
  }

  /* ── Footer Danone ── */
  .dan-footer {
    background: var(--dan-subtle);
    border-top: 1px solid var(--dan-border);
    margin-top: auto;
  }

  .dan-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .dan-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .dan-footer__link {
    color: var(--dan-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .dan-footer__link:hover {
    color: var(--dan-primary);
    text-decoration: underline;
  }

  .dan-footer__logo {
    display: block;
    width: auto;
    height: 26px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .dan-body {
      grid-template-columns: 1fr;
    }

    .dan-sidebar {
      display: none;
    }

    .dan-nav {
      display: none;
    }

    .dan-header__tools {
      display: none;
    }

    .dan-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .dan-nav__link,
    .dan-search__btn,
    .dan-side-link,
    .dan-side-group :global(.dan-side-group__icon) {
      transition: none;
    }
  }
</style>

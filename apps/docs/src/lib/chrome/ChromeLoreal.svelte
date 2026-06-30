<!--
  Chrome documentaire L'Oréal (loreal.com — siège du groupe beauté).
  Forme fidèle au corporate L'Oréal : noir-sur-blanc minimal, luxe, CTA arrondis.
  - Header : bandeau BLANC, logo OFFICIEL L'Oréal (wordmark « L'ORÉAL » noir) à
    gauche, nav CAPITALES espacées au centre, recherche RONDE noire à droite
  - Boutons RONDS (radius pill 999px — signature CTA L'Oréal) ; onglet actif =
    SOULIGNÉ OR (#c09853, or de la charte maîtresse)
  - Item sidebar actif = liseré noir + fond or très clair (#f4ead6)
  - Couleurs MESURÉES (loreal.com) : encre #3d3d3d, noir maître #000, or charte
    #c09853 (foncé #9a743a), secondaire #6c6c6c, surface #f5f5f5, bordure #d8d8d8,
    bordure forte / muted #8e8e8e ; focus = outline noir
  - Logo OFFICIEL L'Oréal (vecteur, Wikimedia Commons) via /chrome/loreal/logo.svg
  - Typo : « HelveticaNowDisplay » propriétaire → repli Arial, Helvetica
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

<div class="lor-shell">
  <!-- ── HEADER L'Oréal ── -->
  <div class="lor-header-wrap">
    <header class="lor-header" aria-label="L'Oréal">
      <div class="lor-header__inner">
        <!-- Gauche : logo officiel L'Oréal -->
        <div class="lor-header__brand">
          <a href="/" class="lor-header__brand-link" aria-label="Accueil : L'Oréal Design System">
            <img
              src="/chrome/loreal/logo.svg"
              alt="L'Oréal"
              class="lor-logo"
              width="133"
              height="24"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="lor-nav" aria-label="Navigation principale">
          <ul class="lor-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="lor-nav__item">
                <a
                  class="lor-nav__link"
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
        <div class="lor-header__tools">
          <button
            type="button"
            class="lor-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="lor-header__tools-links">
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
          class="lor-header__burger"
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

  <!-- ── BODY L'Oréal ── -->
  <div class="lor-body">
    <!-- Sidebar -->
    <aside class="lor-sidebar" aria-label="Navigation de la documentation">
      <nav class="lor-side-nav" aria-label="Sommaire">
        <ul class="lor-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="lor-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="lor-side-divider" role="separator"></li>

          <li class="lor-side-heading">
            <a
              class="lor-side-link lor-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="lor-side-group" open={isGroupOpen(group.items)}>
                <summary class="lor-side-group__summary">
                  <ChevronDown class="lor-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="lor-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="lor-side-link lor-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="lor-side-divider" role="separator"></li>

          <li class="lor-side-heading">
            <a
              class="lor-side-link lor-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="lor-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="lor-side-group__summary">
                  <ChevronDown class="lor-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="lor-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="lor-side-link lor-side-link--sub"
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
      <div class="lor-sidebar-footer">
        <span class="lor-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="lor-sidebar-github"
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
    <div class="lor-content">
      <nav class="lor-breadcrumb" aria-label="Breadcrumb">
        <ol class="lor-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="lor-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="lor-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER L'Oréal ── -->
  <footer class="lor-footer" aria-label="Pied de page L'Oréal">
    <div class="lor-footer__inner">
      <nav class="lor-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="lor-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/loreal/logo.svg"
        alt="L'Oréal"
        class="lor-footer__logo"
        width="111"
        height="20"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables L'Oréal ── */
  .lor-shell {
    --lor-primary: #000000; /* noir maître L'Oréal (action / wordmark) */
    --lor-primary-hover: #3d3d3d; /* encre survol (MESURÉ body color) */
    --lor-primary-light: #f4ead6; /* or très clair (item actif sidebar) */
    --lor-ink: #3d3d3d; /* encre dominante (MESURÉE body/a color) */
    --lor-gold: #c09853; /* or charte maîtresse (accent) */
    --lor-gold-dark: #9a743a; /* or foncé (hover/active) */
    --lor-secondary: #6c6c6c; /* texte secondaire (MESURÉ) */
    --lor-subtle: #f5f5f5; /* surface claire subtile (MESURÉE) */
    --lor-border: #d8d8d8; /* bordure grise (MESURÉE) */
    --lor-border-strong: #8e8e8e; /* bordure forte / muted (MESURÉE) */
    --lor-focus: #000000; /* outline focus noir (MESURÉ) */
    --lor-white: #fff;
    --lor-sidebar-width: 17rem;
    --lor-radius: 999px;
    font-family: 'HelveticaNowDisplay', Arial, Helvetica, sans-serif;
    background: var(--lor-white);
    color: var(--lor-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header L'Oréal ── */
  .lor-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .lor-header {
    background: var(--lor-white);
    border-bottom: 1px solid var(--lor-border);
  }

  .lor-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .lor-header__brand {
    flex: 0 0 auto;
  }

  .lor-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 300ms ease;
  }

  .lor-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel L'Oréal (ratio préservé). */
  .lor-logo {
    display: block;
    width: auto;
    height: 24px;
  }

  /* ── Nav horizontale (centre) ── */
  .lor-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .lor-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .lor-nav__item {
    flex: 0 0 auto;
  }

  .lor-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--lor-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    transition: border-color 300ms ease, color 300ms ease;
    white-space: nowrap;
  }

  .lor-nav__link:hover,
  .lor-nav__link:focus-visible {
    color: var(--lor-ink);
    outline: none;
  }

  .lor-nav__link[aria-current="page"] {
    border-bottom-color: var(--lor-gold);
    color: var(--lor-ink);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .lor-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .lor-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header L'Oréal. */
  .lor-header__tools-links :global(.docs-header-control) {
    background: var(--lor-white);
    border-color: var(--lor-border-strong);
    border-radius: var(--lor-radius);
    color: var(--lor-ink);
    font-family: inherit;
  }

  .lor-header__tools-links :global(.docs-header-control:hover),
  .lor-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--lor-subtle);
    border-color: var(--lor-gold);
    color: var(--lor-ink);
    box-shadow: none;
  }

  /* Recherche L'Oréal : bouton loupe compact. */
  .lor-search__btn {
    align-items: center;
    background: var(--lor-primary);
    border: 1px solid var(--lor-primary);
    border-radius: var(--lor-radius);
    color: var(--lor-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 300ms ease, border-color 300ms ease;
  }

  .lor-search__btn:hover,
  .lor-search__btn:focus-visible {
    background: var(--lor-primary-hover);
    border-color: var(--lor-primary-hover);
    outline: 2px solid var(--lor-focus);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .lor-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--lor-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body L'Oréal ── */
  .lor-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--lor-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar L'Oréal ── */
  .lor-sidebar {
    background: var(--lor-white);
    border-right: 1px solid var(--lor-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .lor-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .lor-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--lor-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .lor-version-badge {
    background: var(--lor-subtle);
    border: 1px solid var(--lor-border);
    border-radius: var(--lor-radius);
    color: var(--lor-gold-dark);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .lor-sidebar-github {
    align-items: center;
    color: var(--lor-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 300ms ease;
  }

  .lor-sidebar-github:hover,
  .lor-sidebar-github:focus-visible {
    color: var(--lor-primary);
  }

  .lor-side-list,
  .lor-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .lor-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--lor-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 300ms ease, border-color 300ms ease, color 300ms ease;
  }

  .lor-side-link:hover,
  .lor-side-link:focus-visible {
    background: var(--lor-subtle);
    color: var(--lor-primary);
    text-decoration: none;
  }

  .lor-side-link[aria-current="page"] {
    background: var(--lor-primary-light);
    border-left-color: var(--lor-primary);
    color: var(--lor-ink);
    font-weight: 700;
    text-decoration: none;
  }

  .lor-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .lor-side-divider {
    border-top: 1px solid var(--lor-border);
    margin: 0.5rem 0;
  }

  .lor-side-group {
    display: block;
  }

  .lor-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--lor-secondary);
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
    transition: background 300ms ease;
  }

  .lor-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .lor-side-group__summary:hover,
  .lor-side-group__summary:focus-visible {
    background: var(--lor-subtle);
    outline: none;
  }

  .lor-side-group :global(.lor-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 300ms ease;
  }

  .lor-side-group:not([open]) :global(.lor-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .lor-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .lor-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .lor-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .lor-breadcrumb__item {
    align-items: center;
    color: var(--lor-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .lor-breadcrumb__item + .lor-breadcrumb__item::before {
    color: var(--lor-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .lor-breadcrumb__link {
    color: var(--lor-primary);
    text-decoration: none;
  }

  .lor-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .lor-breadcrumb__item span[aria-current="page"] {
    color: var(--lor-ink);
    font-weight: 600;
  }

  /* ── Footer L'Oréal ── */
  .lor-footer {
    background: var(--lor-subtle);
    border-top: 1px solid var(--lor-border);
    margin-top: auto;
  }

  .lor-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .lor-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .lor-footer__link {
    color: var(--lor-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .lor-footer__link:hover {
    color: var(--lor-primary);
    text-decoration: underline;
  }

  .lor-footer__logo {
    display: block;
    width: auto;
    height: 20px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .lor-body {
      grid-template-columns: 1fr;
    }

    .lor-sidebar {
      display: none;
    }

    .lor-nav {
      display: none;
    }

    .lor-header__tools {
      display: none;
    }

    .lor-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .lor-nav__link,
    .lor-search__btn,
    .lor-side-link,
    .lor-side-group :global(.lor-side-group__icon) {
      transition: none;
    }
  }
</style>

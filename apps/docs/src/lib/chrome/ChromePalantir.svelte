<!--
  Chrome documentaire Palantir (palantir.com / Foundry — Blueprint design system).
  Forme fidèle à l'en-tête produit de Palantir : sombre, navy, dense, technique.
  - Header : bandeau NAVY #1c2127 (app background Blueprint dark), logo OFFICIEL
    Palantir (mark + wordmark) à gauche, nav dense au centre, recherche à droite
  - Coins LÉGÈREMENT arrondis (radius 4px) — signature Blueprint ; onglet actif =
    libellé bleu clair + liseré BLEU bas (#4c90f0 / intent #2d72d2)
  - Barre latérale : item actif liseré bleu intent + fond bleu subtil
  - Couleurs MESURÉES sur les tokens Blueprint (Apache-2.0) :
    app bg #1c2127, panel #252a31, raised #2f343c, divider #383e47, button #404854,
    muted #5f6b7c, texte clair #f6f7f9, texte secondaire #abb3bf, intent bleu #2d72d2,
    bleu clair (dark) #4c90f0, lien dark #8abbff
  - Logo OFFICIEL Palantir (vecteur) via <img src="/chrome/palantir/logo.svg">
  - Typo : Blueprint n'embarque aucune police propriétaire → stack système
    (Blueprint utilise -apple-system/Segoe UI/Roboto). Aucune police réseau chargée.
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

<div class="palantir-shell">
  <!-- ── HEADER PALANTIR ── -->
  <div class="palantir-header-wrap">
    <header class="palantir-header" aria-label="Palantir">
      <div class="palantir-header__inner">
        <!-- Gauche : logo officiel Palantir -->
        <div class="palantir-header__brand">
          <a href="/" class="palantir-header__brand-link" aria-label="Accueil : Palantir Design System">
            <img
              src="/chrome/palantir/logo.svg"
              alt="Palantir"
              class="palantir-logo"
              width="150"
              height="24"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="palantir-nav" aria-label="Navigation principale">
          <ul class="palantir-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="palantir-nav__item">
                <a
                  class="palantir-nav__link"
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
        <div class="palantir-header__tools">
          <button
            type="button"
            class="palantir-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="palantir-header__tools-links">
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
          class="palantir-header__burger"
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

  <!-- ── BODY PALANTIR ── -->
  <div class="palantir-body">
    <!-- Sidebar -->
    <aside class="palantir-sidebar" aria-label="Navigation de la documentation">
      <nav class="palantir-side-nav" aria-label="Sommaire">
        <ul class="palantir-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="palantir-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="palantir-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="palantir-side-group" open={isGroupOpen(group.items)}>
                <summary class="palantir-side-group__summary">
                  <ChevronDown class="palantir-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="palantir-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="palantir-side-link palantir-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="palantir-side-divider" role="separator"></li>

          <li>
            <a
              class="palantir-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="palantir-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="palantir-side-group__summary">
                  <ChevronDown class="palantir-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="palantir-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="palantir-side-link palantir-side-link--sub"
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
      <div class="palantir-sidebar-footer">
        <span class="palantir-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="palantir-sidebar-github"
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
    <div class="palantir-content">
      <nav class="palantir-breadcrumb" aria-label="Breadcrumb">
        <ol class="palantir-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="palantir-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="palantir-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER PALANTIR ── -->
  <footer class="palantir-footer" aria-label="Pied de page Palantir">
    <div class="palantir-footer__inner">
      <nav class="palantir-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="palantir-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/palantir/logo.svg"
        alt="Palantir"
        class="palantir-footer__logo"
        width="130"
        height="21"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Palantir (Blueprint dark) ── */
  .palantir-shell {
    --pal-primary: #2d72d2; /* $blue3 — $pt-intent-primary */
    --pal-primary-hover: #215db0; /* $blue2 — hover (Blueprint darkens intents) */
    --pal-primary-light: rgb(45 114 210 / 0.16); /* voile bleu (item actif sidebar) */
    --pal-accent: #4c90f0; /* $blue4 — bleu clair (onglet actif sur dark) */
    --pal-link: #8abbff; /* $blue5 — $pt-dark-link-color */
    --pal-ink: #f6f7f9; /* $light-gray5 — $pt-dark-text-color */
    --pal-ink-2: #ffffff;
    --pal-secondary: #abb3bf; /* $gray4 — $pt-dark-text-color-muted */
    --pal-muted: #8f99a8; /* $gray3 — texte tertiaire */
    --pal-bg: #1c2127; /* $dark-gray1 — $pt-dark-app-background-color */
    --pal-panel: #252a31; /* $dark-gray2 — panel / surface subtile */
    --pal-raised: #2f343c; /* $dark-gray3 — surface surélevée */
    --pal-fill: #383e47; /* $dark-gray4 — bouton défaut / divider */
    --pal-fill-hover: #404854; /* $dark-gray5 — bouton hover */
    --pal-border: #383e47; /* $dark-gray4 — divider / bordure subtile */
    --pal-border-strong: #5f6b7c; /* $gray1 — bordure forte */
    --pal-focus: #2d72d2; /* anneau focus intent */
    --pal-sidebar-width: 17rem;
    --pal-radius: 0.25rem; /* 4px — $pt-border-radius */
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', system-ui, sans-serif;
    background: var(--pal-bg);
    color: var(--pal-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Palantir ── */
  .palantir-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .palantir-header {
    background: var(--pal-bg);
    border-bottom: 1px solid var(--pal-border);
  }

  .palantir-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 84rem;
    min-height: 3.5rem;
    padding: 0.5rem 1.5rem;
  }

  .palantir-header__brand {
    flex: 0 0 auto;
  }

  .palantir-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 100ms cubic-bezier(0.4, 1, 0.75, 0.9);
  }

  .palantir-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Palantir (ratio préservé). */
  .palantir-logo {
    display: block;
    width: auto;
    height: 24px;
  }

  /* ── Nav horizontale (centre) ── */
  .palantir-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .palantir-nav__list {
    align-items: center;
    display: flex;
    gap: 0.125rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .palantir-nav__item {
    flex: 0 0 auto;
  }

  .palantir-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--pal-secondary);
    display: inline-flex;
    font-size: 0.875rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.5rem;
    padding: 0 0.75rem;
    text-decoration: none;
    transition: border-color 100ms cubic-bezier(0.4, 1, 0.75, 0.9), color 100ms cubic-bezier(0.4, 1, 0.75, 0.9);
    white-space: nowrap;
  }

  .palantir-nav__link:hover,
  .palantir-nav__link:focus-visible {
    color: var(--pal-ink);
    outline: none;
  }

  .palantir-nav__link[aria-current="page"] {
    border-bottom-color: var(--pal-accent);
    color: var(--pal-ink);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .palantir-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .palantir-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Palantir (sombre). */
  .palantir-header__tools-links :global(.docs-header-control) {
    background: var(--pal-panel);
    border-color: var(--pal-border);
    border-radius: var(--pal-radius);
    color: var(--pal-ink);
    font-family: inherit;
  }

  .palantir-header__tools-links :global(.docs-header-control:hover),
  .palantir-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--pal-raised);
    border-color: var(--pal-primary);
    color: var(--pal-ink);
    box-shadow: none;
  }

  /* Recherche Palantir : bouton loupe compact (rempli dark-gray). */
  .palantir-search__btn {
    align-items: center;
    background: var(--pal-fill);
    border: 1px solid var(--pal-fill);
    border-radius: var(--pal-radius);
    color: var(--pal-ink);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.25rem;
    height: 2.25rem;
    justify-content: center;
    padding: 0;
    transition: background 100ms cubic-bezier(0.4, 1, 0.75, 0.9), border-color 100ms cubic-bezier(0.4, 1, 0.75, 0.9);
  }

  .palantir-search__btn:hover,
  .palantir-search__btn:focus-visible {
    background: var(--pal-fill-hover);
    border-color: var(--pal-fill-hover);
    outline: 2px solid var(--pal-focus);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .palantir-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--pal-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Palantir ── */
  .palantir-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--pal-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 84rem;
    width: 100%;
  }

  /* ── Sidebar Palantir ── */
  .palantir-sidebar {
    background: var(--pal-panel);
    border-right: 1px solid var(--pal-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 3.5rem);
    position: sticky;
    top: 3.5rem;
  }

  .palantir-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1rem 0;
  }

  .palantir-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--pal-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .palantir-version-badge {
    background: var(--pal-raised);
    border: 1px solid var(--pal-border);
    border-radius: var(--pal-radius);
    color: var(--pal-link);
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .palantir-sidebar-github {
    align-items: center;
    color: var(--pal-secondary);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 100ms cubic-bezier(0.4, 1, 0.75, 0.9);
  }

  .palantir-sidebar-github:hover,
  .palantir-sidebar-github:focus-visible {
    color: var(--pal-ink);
  }

  .palantir-side-list,
  .palantir-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .palantir-side-link {
    align-items: center;
    border-left: 2px solid transparent;
    box-sizing: border-box;
    color: var(--pal-secondary);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.5rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 2px);
    text-decoration: none;
    transition: background 100ms cubic-bezier(0.4, 1, 0.75, 0.9), border-color 100ms cubic-bezier(0.4, 1, 0.75, 0.9), color 100ms cubic-bezier(0.4, 1, 0.75, 0.9);
  }

  .palantir-side-link:hover,
  .palantir-side-link:focus-visible {
    background: var(--pal-raised);
    color: var(--pal-ink);
    text-decoration: none;
  }

  .palantir-side-link[aria-current="page"] {
    background: var(--pal-primary-light);
    border-left-color: var(--pal-primary);
    color: var(--pal-ink);
    font-weight: 600;
    text-decoration: none;
  }

  .palantir-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 2px);
  }

  .palantir-side-divider {
    border-top: 1px solid var(--pal-border);
    margin: 0.5rem 0;
  }

  .palantir-side-group {
    display: block;
  }

  .palantir-side-group__summary {
    align-items: center;
    border-left: 2px solid transparent;
    color: var(--pal-muted);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 600;
    gap: 0.35rem;
    letter-spacing: 0.06em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 1rem 0 calc(1rem - 2px);
    text-transform: uppercase;
    transition: background 100ms cubic-bezier(0.4, 1, 0.75, 0.9);
  }

  .palantir-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .palantir-side-group__summary:hover,
  .palantir-side-group__summary:focus-visible {
    background: var(--pal-raised);
    color: var(--pal-secondary);
    outline: none;
  }

  .palantir-side-group :global(.palantir-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 100ms cubic-bezier(0.4, 1, 0.75, 0.9);
  }

  .palantir-side-group:not([open]) :global(.palantir-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .palantir-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .palantir-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .palantir-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .palantir-breadcrumb__item {
    align-items: center;
    color: var(--pal-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .palantir-breadcrumb__item + .palantir-breadcrumb__item::before {
    color: var(--pal-muted);
    content: "›";
    margin: 0 0.4rem;
  }

  .palantir-breadcrumb__link {
    color: var(--pal-link);
    text-decoration: none;
  }

  .palantir-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .palantir-breadcrumb__item span[aria-current="page"] {
    color: var(--pal-ink);
    font-weight: 600;
  }

  /* ── Footer Palantir ── */
  .palantir-footer {
    background: var(--pal-panel);
    border-top: 1px solid var(--pal-border);
    margin-top: auto;
  }

  .palantir-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 84rem;
    padding: 1.5rem;
  }

  .palantir-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .palantir-footer__link {
    color: var(--pal-secondary);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .palantir-footer__link:hover {
    color: var(--pal-ink);
    text-decoration: underline;
  }

  .palantir-footer__logo {
    display: block;
    width: auto;
    height: 21px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .palantir-body {
      grid-template-columns: 1fr;
    }

    .palantir-sidebar {
      display: none;
    }

    .palantir-nav {
      display: none;
    }

    .palantir-header__tools {
      display: none;
    }

    .palantir-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .palantir-nav__link,
    .palantir-search__btn,
    .palantir-side-link,
    .palantir-side-group :global(.palantir-side-group__icon) {
      transition: none;
    }
  }
</style>

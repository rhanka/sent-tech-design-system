<!--
  Chrome documentaire GitHub (github.com — Primer design system).
  Forme fidèle à l'en-tête applicatif de github.com : barre supérieure SOMBRE,
  marque blanche à gauche, recherche encadrée, nav claire.
  - Header : bandeau SOMBRE #1f2328, Octocat OFFICIEL blanc à gauche, champ de
    recherche encadré (bord #3d444d, raccourci « / »), nav liens blancs au centre
  - Coins arrondis 6px (--borderRadius-medium Primer) ; onglet actif = SOULIGNÉ
    CORAIL #fd8c73 (signature UnderlineNav GitHub)
  - Barre latérale : item actif liseré bleu accent + fond gris subtil #f6f8fa
  - Couleurs MESURÉES sur Primer (light) : fg #1f2328, muted #59636e,
    accent #0969da, succès vert #1f883d, corail #fd8c73, surface subtile #f6f8fa,
    bord #d1d9e0, en-tête sombre #1f2328 / bord sombre #3d444d
  - Logo OFFICIEL GitHub (Octocat / Invertocat, vecteur blanc) via
    <img src="/chrome/github/logo.svg">
  - Typo : Mona Sans (police de marque GitHub) indisponible en réseau → repli
    système (-apple-system, Segoe UI) ; aucune police réseau chargée
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

<div class="gh-shell">
  <!-- ── HEADER GITHUB ── -->
  <div class="gh-header-wrap">
    <header class="gh-header" aria-label="GitHub">
      <div class="gh-header__inner">
        <!-- Gauche : Octocat officiel -->
        <div class="gh-header__brand">
          <a href="/" class="gh-header__brand-link" aria-label="Accueil : GitHub Design System">
            <img
              src="/chrome/github/logo.svg"
              alt="GitHub"
              class="gh-logo"
              width="32"
              height="32"
            />
          </a>
        </div>

        <!-- Recherche encadrée façon github.com -->
        <button
          type="button"
          class="gh-search"
          aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
          aria-haspopup="dialog"
          onclick={onSearchOpen}
        >
          <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
          <span class="gh-search__placeholder">
            {locale.value === "fr" ? "Rechercher ou aller à…" : "Search or jump to…"}
          </span>
          <kbd class="gh-search__kbd">/</kbd>
        </button>

        <!-- Centre : nav horizontale -->
        <nav class="gh-nav" aria-label="Navigation principale">
          <ul class="gh-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="gh-nav__item">
                <a
                  class="gh-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </nav>

        <!-- Droite : outils docs -->
        <div class="gh-header__tools">
          <div class="gh-header__tools-links">
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
          class="gh-header__burger"
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

  <!-- ── BODY GITHUB ── -->
  <div class="gh-body">
    <!-- Sidebar -->
    <aside class="gh-sidebar" aria-label="Navigation de la documentation">
      <nav class="gh-side-nav" aria-label="Sommaire">
        <ul class="gh-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="gh-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="gh-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="gh-side-group" open={isGroupOpen(group.items)}>
                <summary class="gh-side-group__summary">
                  <ChevronDown class="gh-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="gh-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="gh-side-link gh-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="gh-side-divider" role="separator"></li>

          <li>
            <a
              class="gh-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="gh-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="gh-side-group__summary">
                  <ChevronDown class="gh-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="gh-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="gh-side-link gh-side-link--sub"
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
      <div class="gh-sidebar-footer">
        <span class="gh-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="gh-sidebar-github"
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
    <div class="gh-content">
      <nav class="gh-breadcrumb" aria-label="Breadcrumb">
        <ol class="gh-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="gh-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="gh-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER GITHUB ── -->
  <footer class="gh-footer" aria-label="Pied de page GitHub">
    <div class="gh-footer__inner">
      <img
        src="/chrome/github/logo.svg"
        alt="GitHub"
        class="gh-footer__logo"
        width="24"
        height="24"
      />
      <nav class="gh-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="gh-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
    </div>
  </footer>
</div>

<style>
  /* ── Variables GitHub (Primer light) ── */
  .gh-shell {
    --gh-primary: #0969da; /* --fgColor-accent (bleu lien/focus/sélection) */
    --gh-primary-hover: #0550ae; /* bleu accent foncé (hover) */
    --gh-primary-light: #ddf4ff; /* --bgColor-accent-muted (teinte accent) */
    --gh-ink: #1f2328; /* --fgColor-default (texte primaire) */
    --gh-ink-2: #25292e; /* --bgColor-emphasis (encre/inverse) */
    --gh-secondary: #59636e; /* --fgColor-muted (texte secondaire) */
    --gh-success: #1f883d; /* --bgColor-success-emphasis (vert bouton primaire) */
    --gh-coral: #fd8c73; /* --underlineNav-borderColor-active (corail onglet actif) */
    --gh-subtle: #f6f8fa; /* --bgColor-muted (surface subtile) */
    --gh-neutral: #eaeef2; /* --bgColor-neutral-muted (puce/hover) */
    --gh-border: #d1d9e0; /* --borderColor-default */
    --gh-border-strong: #818b98; /* --borderColor-emphasis */
    --gh-header-bg: #1f2328; /* barre supérieure sombre github.com */
    --gh-header-border: #3d444d; /* bord sombre dans l'en-tête */
    --gh-header-fg: #f6f8fa; /* texte clair sur l'en-tête sombre */
    --gh-header-muted: #9198a1; /* texte secondaire sur sombre (placeholder) */
    --gh-header-hover: #262c36; /* survol sur l'en-tête sombre */
    --gh-white: #fff;
    --gh-sidebar-width: 17rem;
    --gh-radius: 6px; /* --borderRadius-medium Primer */
    font-family: 'Mona Sans VF', 'Mona Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
    background: var(--gh-white);
    color: var(--gh-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header GitHub ── */
  .gh-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .gh-header {
    background: var(--gh-header-bg);
    border-bottom: 1px solid var(--gh-header-border);
  }

  .gh-header__inner {
    align-items: center;
    display: flex;
    gap: 1rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4rem;
    padding: 0.75rem 1.5rem;
  }

  .gh-header__brand {
    flex: 0 0 auto;
  }

  .gh-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .gh-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Octocat officiel (blanc). */
  .gh-logo {
    display: block;
    width: 32px;
    height: 32px;
  }

  /* ── Recherche encadrée (façon github.com) ── */
  .gh-search {
    align-items: center;
    background: transparent;
    border: 1px solid var(--gh-header-border);
    border-radius: var(--gh-radius);
    color: var(--gh-header-muted);
    cursor: pointer;
    display: inline-flex;
    flex: 0 1 22rem;
    gap: 0.5rem;
    height: 2rem;
    min-width: 0;
    padding: 0 0.5rem 0 0.75rem;
    text-align: left;
    transition: border-color 120ms ease, background 120ms ease;
  }

  .gh-search:hover,
  .gh-search:focus-visible {
    background: var(--gh-header-hover);
    border-color: var(--gh-border-strong);
    outline: none;
  }

  .gh-search :global(svg) {
    color: var(--gh-header-muted);
    flex: 0 0 auto;
  }

  .gh-search__placeholder {
    flex: 1 1 auto;
    font-size: 0.875rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .gh-search__kbd {
    border: 1px solid var(--gh-header-border);
    border-radius: var(--gh-radius);
    color: var(--gh-header-muted);
    flex: 0 0 auto;
    font-family: inherit;
    font-size: 0.75rem;
    line-height: 1;
    padding: 0.15rem 0.4rem;
  }

  /* ── Nav horizontale (centre) ── */
  .gh-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .gh-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .gh-nav__item {
    flex: 0 0 auto;
  }

  .gh-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--gh-header-fg);
    display: inline-flex;
    font-size: 0.875rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2rem;
    padding: 0 0.5rem;
    text-decoration: none;
    transition: color 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .gh-nav__link:hover,
  .gh-nav__link:focus-visible {
    color: var(--gh-white);
    outline: none;
  }

  .gh-nav__link[aria-current="page"] {
    border-bottom-color: var(--gh-coral);
    color: var(--gh-white);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .gh-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .gh-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans l'en-tête sombre GitHub. */
  .gh-header__tools-links :global(.docs-header-control) {
    background: transparent;
    border-color: var(--gh-header-border);
    border-radius: var(--gh-radius);
    color: var(--gh-header-fg);
    font-family: inherit;
  }

  .gh-header__tools-links :global(.docs-header-control:hover),
  .gh-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--gh-header-hover);
    border-color: var(--gh-border-strong);
    color: var(--gh-white);
    box-shadow: none;
  }

  /* Burger mobile */
  .gh-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--gh-header-fg);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body GitHub ── */
  .gh-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--gh-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar GitHub ── */
  .gh-sidebar {
    background: var(--gh-white);
    border-right: 1px solid var(--gh-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4rem);
    position: sticky;
    top: 4rem;
  }

  .gh-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1rem 0.5rem;
  }

  .gh-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--gh-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .gh-version-badge {
    background: var(--gh-subtle);
    border: 1px solid var(--gh-border);
    border-radius: var(--gh-radius);
    color: var(--gh-secondary);
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .gh-sidebar-github {
    align-items: center;
    color: var(--gh-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .gh-sidebar-github:hover,
  .gh-sidebar-github:focus-visible {
    color: var(--gh-primary);
  }

  .gh-side-list,
  .gh-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .gh-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    border-radius: var(--gh-radius);
    box-sizing: border-box;
    color: var(--gh-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.25rem;
    padding: 0.4rem 0.75rem 0.4rem calc(0.75rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .gh-side-link:hover,
  .gh-side-link:focus-visible {
    background: var(--gh-subtle);
    color: var(--gh-ink);
    text-decoration: none;
  }

  .gh-side-link[aria-current="page"] {
    background: var(--gh-subtle);
    border-left-color: var(--gh-primary);
    color: var(--gh-ink);
    font-weight: 600;
    text-decoration: none;
  }

  .gh-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2rem;
    padding-left: calc(1.75rem - 3px);
  }

  .gh-side-divider {
    border-top: 1px solid var(--gh-border);
    margin: 0.5rem 0.25rem;
  }

  .gh-side-group {
    display: block;
  }

  .gh-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    border-radius: var(--gh-radius);
    color: var(--gh-secondary);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 600;
    gap: 0.35rem;
    letter-spacing: 0.04em;
    list-style: none;
    min-height: 2rem;
    padding: 0 0.75rem 0 calc(0.75rem - 3px);
    text-transform: uppercase;
    transition: background 120ms ease;
  }

  .gh-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .gh-side-group__summary:hover,
  .gh-side-group__summary:focus-visible {
    background: var(--gh-subtle);
    outline: none;
  }

  .gh-side-group :global(.gh-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .gh-side-group:not([open]) :global(.gh-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .gh-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .gh-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .gh-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .gh-breadcrumb__item {
    align-items: center;
    color: var(--gh-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .gh-breadcrumb__item + .gh-breadcrumb__item::before {
    color: var(--gh-secondary);
    content: "/";
    margin: 0 0.5rem;
  }

  .gh-breadcrumb__link {
    color: var(--gh-primary);
    text-decoration: none;
  }

  .gh-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .gh-breadcrumb__item span[aria-current="page"] {
    color: var(--gh-ink);
    font-weight: 600;
  }

  /* ── Footer GitHub ── */
  .gh-footer {
    background: var(--gh-white);
    border-top: 1px solid var(--gh-border);
    margin-top: auto;
  }

  .gh-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: flex-start;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  /* Octocat blanc reteinté gris muted pour le pied clair. */
  .gh-footer__logo {
    display: block;
    width: 24px;
    height: 24px;
    flex: 0 0 auto;
    filter: brightness(0) saturate(100%) opacity(0.55);
  }

  .gh-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .gh-footer__link {
    color: var(--gh-secondary);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .gh-footer__link:hover {
    color: var(--gh-primary);
    text-decoration: underline;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .gh-body {
      grid-template-columns: 1fr;
    }

    .gh-sidebar {
      display: none;
    }

    .gh-nav {
      display: none;
    }

    .gh-search {
      display: none;
    }

    .gh-header__tools {
      display: none;
    }

    .gh-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .gh-nav__link,
    .gh-search,
    .gh-side-link,
    .gh-side-group :global(.gh-side-group__icon) {
      transition: none;
    }
  }
</style>

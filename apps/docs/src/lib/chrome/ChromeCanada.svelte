<!--
  Chrome documentaire Gouvernement du Canada — GC Design System (design-system.canada.ca)
  Forme fidèle à canada.ca / GCDS :
  - Header : fond BLANC, signature FIP officielle (drapeau + « Government of Canada /
    Gouvernement du Canada ») à gauche ; outils + barre de recherche à droite
  - Nav horizontale sous le header, onglet actif SOULIGNÉ bleu fédéral
  - Barre latérale gauche : item actif accent bleu + fond bleu clair, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande avec le mot-symbole « Canada » officiel à droite
  - Typo Lato (titres) + Noto Sans (corps), chargées via Google Fonts
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { page } from "$app/state";
  import { ChevronDown, Github, Menu, Search, X } from "@lucide/svelte";
  import {
    DOCS_FOUNDATION_NAV,
    DOCS_TOP_NAV,
    DOCS_UTILITY_NAV,
    DOCS_VERSION,
    buildComponentNavGroups,
    resolveBreadcrumb,
    type ComponentNavItem
  } from "$lib/docs-navigation";

  type Props = {
    children: Snippet;
    activeThemeId: string;
    isThemeOpen: boolean;
    onThemeToggle: () => void;
    themeSwitcher: Snippet;
    frameworkSwitcher: Snippet;
    localeSwitcher: Snippet;
    compareButton: Snippet;
    mobileMenuOpen: boolean;
    onMobileMenuToggle: () => void;
  };

  let {
    children,
    themeSwitcher,
    frameworkSwitcher,
    localeSwitcher,
    compareButton,
    mobileMenuOpen,
    onMobileMenuToggle,
  }: Props = $props();

  const componentGroups = buildComponentNavGroups();
  const breadcrumbs = $derived(resolveBreadcrumb(page.url.pathname));

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
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Noto+Sans:wght@400;600;700&display=swap"
  />
</svelte:head>

<div class="gc-shell">
  <!-- ── HEADER GC ── -->
  <div class="gc-header-wrap">
    <header class="gc-header" aria-label="Gouvernement du Canada">
      <div class="gc-header__inner">
        <!-- Gauche : signature FIP officielle -->
        <div class="gc-header__brand">
          <a href="/" class="gc-header__brand-link" aria-label="Accueil — GC Design System">
            <img
              src="/chrome/canada/sig-en.svg"
              alt="Government of Canada / Gouvernement du Canada"
              class="gc-sig"
              width="280"
              height="26"
            />
          </a>
        </div>

        <!-- Droite : outils + recherche -->
        <div class="gc-header__tools">
          <div class="gc-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>
          <div class="gc-search" role="search">
            <label class="gc-search__label" for="gc-search-input">Search Canada.ca</label>
            <div class="gc-search__group">
              <input
                type="search"
                id="gc-search-input"
                class="gc-search__input"
                placeholder="Search the design system…"
                aria-label="Search the design system"
              />
              <button type="button" class="gc-search__btn" aria-label="Search">
                <Search size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="gc-header__burger"
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

    <!-- Nav horizontale GC (onglets soulignés bleu fédéral) -->
    <nav class="gc-nav" aria-label="Navigation principale">
      <div class="gc-nav__inner">
        <ul class="gc-nav__list">
          {#each DOCS_TOP_NAV as item (item.href)}
            <li class="gc-nav__item">
              <a
                class="gc-nav__link"
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

  <!-- ── BODY GC ── -->
  <div class="gc-body">
    <!-- Sidebar -->
    <aside class="gc-sidebar" aria-label="Navigation de la documentation">
      <nav class="gc-side-nav" aria-label="Sommaire">
        <ul class="gc-side-list">
          {#each DOCS_FOUNDATION_NAV as item (item.href)}
            <li>
              <a
                class="gc-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="gc-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="gc-side-group" open={isGroupOpen(group.items)}>
                <summary class="gc-side-group__summary">
                  <ChevronDown class="gc-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="gc-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="gc-side-link gc-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
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
      <div class="gc-sidebar-footer">
        <span class="gc-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="gc-sidebar-github"
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
    <div class="gc-content">
      <nav class="gc-breadcrumb" aria-label="Breadcrumb">
        <ol class="gc-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="gc-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="gc-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER GC : mot-symbole Canada officiel ── -->
  <footer class="gc-footer" aria-label="Pied de page du Gouvernement du Canada">
    <div class="gc-footer__inner">
      <nav class="gc-footer__nav" aria-label="Liens du pied de page">
        {#each DOCS_TOP_NAV as item (item.href)}
          <a class="gc-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/canada/wordmark-spl.svg"
        alt="Symbol of the Government of Canada"
        class="gc-wordmark"
        width="150"
        height="34"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables GC ── */
  .gc-shell {
    --gc-blue: #1f497a; /* --gcds-color-blue-700 / link-default */
    --gc-blue-dark: #26374a; /* --gcds-color-blue-muted / bg-primary */
    --gc-blue-hover: #1354ec; /* --gcds-link-hover */
    --gc-blue-light: #e1e8f0; /* light tint */
    --gc-red: #b3192e; /* --gcds-danger */
    --gc-grey-50: #f2f2f2; /* --gcds-bg-light */
    --gc-grey-text2: #595959; /* --gcds-text-secondary */
    --gc-border: #e0e0e0;
    --gc-border-strong: #8c8c8c; /* --gcds-border-default */
    --gc-white: #fff;
    --gc-black: #333; /* --gcds-text-primary */
    --gc-sidebar-width: 17rem;
    font-family: 'Noto Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--gc-white);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header GC ── */
  .gc-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .gc-header {
    background: var(--gc-white);
    border-bottom: 1px solid var(--gc-border);
  }

  .gc-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 78rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .gc-header__brand {
    flex: 0 0 auto;
  }

  .gc-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
  }

  /* Signature FIP officielle (ratio préservé, hauteur ~26px comme canada.ca). */
  .gc-sig {
    display: block;
    width: auto;
    height: 26px;
  }

  .gc-header__tools {
    align-items: flex-end;
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: center;
  }

  .gc-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header GC */
  .gc-header__tools-links :global(.docs-header-control) {
    background: var(--gc-white);
    border-color: var(--gc-border-strong);
    color: var(--gc-black);
    font-family: inherit;
  }

  .gc-header__tools-links :global(.docs-header-control:hover),
  .gc-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--gc-grey-50);
    border-color: var(--gc-blue);
    color: var(--gc-blue);
    box-shadow: none;
  }

  /* Barre de recherche GC */
  .gc-search {
    width: 100%;
    max-width: 26rem;
  }

  .gc-search__label {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  .gc-search__group {
    display: flex;
    height: 2.5rem;
  }

  .gc-search__input {
    background: var(--gc-white);
    border: 1px solid var(--gc-border-strong);
    border-right: none;
    border-radius: 4px 0 0 4px;
    color: var(--gc-black);
    flex: 1;
    font-family: inherit;
    font-size: 0.875rem;
    outline: none;
    padding: 0 0.75rem;
  }

  .gc-search__input::placeholder {
    color: var(--gc-grey-text2);
  }

  .gc-search__input:focus {
    border-color: var(--gc-blue);
    outline: 2px solid var(--gc-blue-hover);
    outline-offset: 1px;
  }

  .gc-search__btn {
    align-items: center;
    background: var(--gc-blue);
    border: none;
    border-radius: 0 4px 4px 0;
    color: var(--gc-white);
    cursor: pointer;
    display: inline-flex;
    height: 100%;
    justify-content: center;
    padding: 0 1rem;
    transition: background 120ms ease;
  }

  .gc-search__btn:hover,
  .gc-search__btn:focus-visible {
    background: var(--gc-blue-dark);
    outline: none;
  }

  /* Burger mobile */
  .gc-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--gc-black);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Nav horizontale GC ── */
  .gc-nav {
    background: var(--gc-white);
    border-bottom: 1px solid var(--gc-border);
  }

  .gc-nav__inner {
    margin: 0 auto;
    max-width: 78rem;
    overflow-x: auto;
    padding: 0 1.5rem;
  }

  .gc-nav__list {
    align-items: center;
    display: flex;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .gc-nav__item {
    flex: 0 0 auto;
  }

  .gc-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--gc-blue);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 1rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .gc-nav__link:hover,
  .gc-nav__link:focus-visible {
    background: var(--gc-grey-50);
    text-decoration: underline;
  }

  .gc-nav__link[aria-current="page"] {
    border-bottom-color: var(--gc-blue);
    color: var(--gc-blue-dark);
    font-weight: 700;
  }

  /* ── Body GC ── */
  .gc-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--gc-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 78rem;
    width: 100%;
  }

  /* ── Sidebar GC ── */
  .gc-sidebar {
    background: var(--gc-white);
    border-right: 1px solid var(--gc-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 9rem);
    position: sticky;
    top: 9rem;
  }

  .gc-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .gc-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--gc-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .gc-version-badge {
    background: var(--gc-grey-50);
    border: 1px solid var(--gc-border);
    border-radius: 4px;
    color: var(--gc-blue);
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .gc-sidebar-github {
    align-items: center;
    color: var(--gc-blue);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: underline;
  }

  .gc-sidebar-github:hover {
    color: var(--gc-blue-hover);
  }

  .gc-side-list,
  .gc-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .gc-side-link {
    border-left: 4px solid transparent;
    color: var(--gc-black);
    display: block;
    font-size: 0.875rem;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 4px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    line-height: 1.4;
  }

  .gc-side-link:hover,
  .gc-side-link:focus-visible {
    background: var(--gc-grey-50);
    text-decoration: underline;
  }

  .gc-side-link[aria-current="page"] {
    background: var(--gc-blue-light);
    border-left-color: var(--gc-blue);
    color: var(--gc-blue-dark);
    font-weight: 700;
    text-decoration: none;
  }

  .gc-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 4px);
  }

  .gc-side-divider {
    border-top: 1px solid var(--gc-border);
    margin: 0.5rem 0;
  }

  .gc-side-group {
    display: block;
  }

  .gc-side-group__summary {
    align-items: center;
    border-left: 4px solid transparent;
    color: var(--gc-grey-text2);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 700;
    gap: 0.35rem;
    letter-spacing: 0.06em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 1rem 0 calc(1rem - 4px);
    text-transform: uppercase;
    transition: background 120ms ease;
  }

  .gc-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .gc-side-group__summary:hover,
  .gc-side-group__summary:focus-visible {
    background: var(--gc-grey-50);
    outline: none;
  }

  .gc-side-group :global(.gc-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .gc-side-group:not([open]) :global(.gc-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .gc-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .gc-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .gc-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .gc-breadcrumb__item {
    align-items: center;
    color: var(--gc-grey-text2);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .gc-breadcrumb__item + .gc-breadcrumb__item::before {
    color: var(--gc-grey-text2);
    content: "›";
    margin: 0 0.4rem;
  }

  .gc-breadcrumb__link {
    color: var(--gc-blue);
    text-decoration: underline;
  }

  .gc-breadcrumb__item span[aria-current="page"] {
    color: var(--gc-black);
    font-weight: 600;
  }

  /* ── Footer GC (mot-symbole Canada) ── */
  .gc-footer {
    background: var(--gc-grey-50);
    border-top: 1px solid var(--gc-border);
    margin-top: auto;
  }

  .gc-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 78rem;
    padding: 1.5rem;
  }

  .gc-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .gc-footer__link {
    color: var(--gc-blue);
    font-size: 0.875rem;
    text-decoration: underline;
  }

  .gc-footer__link:hover {
    color: var(--gc-blue-hover);
  }

  .gc-wordmark {
    display: block;
    width: auto;
    height: 34px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .gc-body {
      grid-template-columns: 1fr;
    }

    .gc-sidebar {
      display: none;
    }

    .gc-header__tools {
      display: none;
    }

    .gc-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .gc-nav__link,
    .gc-side-link,
    .gc-search__btn,
    .gc-side-group :global(.gc-side-group__icon) {
      transition: none;
    }
  }
</style>

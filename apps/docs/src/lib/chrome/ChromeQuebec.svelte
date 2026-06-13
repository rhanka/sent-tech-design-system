<!--
  Chrome documentaire Gouvernement du Québec — Système de design gouvernemental (SDG)
  Forme fidèle à Québec.ca / design.quebec.ca :
  - Header : fond BLANC, signature « Québec » (fleurdelisé + logotype) en haut à gauche
  - Bandeau d'identification : bande bleue PIV #095797 en haut de page
  - Nav horizontale sous le header, onglet actif souligné bleu PIV
  - Barre latérale gauche : item actif accent bleu PIV #095797
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande bleue foncée #223654 avec signature blanche
  - Typo Open Sans (chargée via Google Fonts)
  - Sélecteur langue FR/EN (SDG bilingue)
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
    buildTopNav,
    resolveBreadcrumb,
    type ComponentNavItem
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
    mobileMenuOpen,
    onMobileMenuToggle,
  }: Props = $props();

  const topNavItems = $derived(buildTopNav(locale.value));
  const foundationNavItems = $derived(buildFoundationNav(locale.value));
  const componentGroups = $derived(buildComponentNavGroups(locale.value));
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

  function handleSearchKeydown(event: KeyboardEvent) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSearchOpen();
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap"
  />
</svelte:head>

<div class="qc-shell">
  <!-- ── BANDEAU D'IDENTIFICATION PIV ── -->
  <div class="qc-piv-band" aria-hidden="true"></div>

  <!-- ── HEADER QC ── -->
  <div class="qc-header-wrap">
    <header class="qc-header" aria-label="Gouvernement du Québec">
      <div class="qc-header__inner">
        <!-- Gauche : signature officielle Québec (fleurdelisé + logotype) -->
        <div class="qc-header__brand">
          <a href="/" class="qc-header__brand-link" aria-label="Accueil — Système de design gouvernemental du Québec">
            <img
              src="/chrome/quebec/signature.svg"
              alt="Gouvernement du Québec"
              class="qc-sig"
              width="140"
              height="28"
            />
          </a>
        </div>

        <!-- Droite : outils + recherche -->
        <div class="qc-header__tools">
          <div class="qc-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>
          <!-- Barre de recherche SDG : champ natif + bouton, branché sur la palette docs. -->
          <div class="qc-search" role="search">
            <label class="qc-search__label" for="qc-search-input">
              {locale.value === "fr" ? "Rechercher" : "Search"}
            </label>
            <div class="qc-search__group">
              <input
                id="qc-search-input"
                class="qc-search__input"
                type="search"
                readonly
                placeholder={locale.value === "fr" ? "Rechercher…" : "Search…"}
                aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
                aria-haspopup="dialog"
                onclick={onSearchOpen}
                onkeydown={handleSearchKeydown}
              />
              <kbd class="qc-search__kbd" aria-hidden="true">/</kbd>
              <button
                type="button"
                class="qc-search__btn"
                aria-label={locale.value === "fr" ? "Lancer la recherche" : "Open search"}
                aria-haspopup="dialog"
                onclick={onSearchOpen}
              >
                <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="qc-header__burger"
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

    <!-- Nav horizontale QC (onglets soulignés bleu PIV) -->
    <nav class="qc-nav" aria-label="Navigation principale">
      <div class="qc-nav__inner">
        <ul class="qc-nav__list">
          {#each topNavItems as item (item.href)}
            <li class="qc-nav__item">
              <a
                class="qc-nav__link"
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

  <!-- ── BODY QC ── -->
  <div class="qc-body">
    <!-- Sidebar -->
    <aside class="qc-sidebar" aria-label="Navigation de la documentation">
      <nav class="qc-side-nav" aria-label="Sommaire">
        <ul class="qc-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="qc-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="qc-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="qc-side-group" open={isGroupOpen(group.items)}>
                <summary class="qc-side-group__summary">
                  <ChevronDown class="qc-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="qc-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="qc-side-link qc-side-link--sub"
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
      <div class="qc-sidebar-footer">
        <span class="qc-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="qc-sidebar-github"
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
    <div class="qc-content">
      <nav class="qc-breadcrumb" aria-label="Fil d'Ariane">
        <ol class="qc-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="qc-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="qc-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER QC : bande bleue foncée + signature blanche ── -->
  <footer class="qc-footer" aria-label="Pied de page du Gouvernement du Québec">
    <div class="qc-footer__inner">
      <nav class="qc-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="qc-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/quebec/signature-white.svg"
        alt="Gouvernement du Québec"
        class="qc-footer-sig"
        width="140"
        height="28"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables QC (palette SDG publique) ── */
  .qc-shell {
    --qc-blue-piv: #095797;       /* --qc-color-blue-piv : signature / action primaire / lien */
    --qc-blue-medium: #19406C;    /* --qc-color-blue-medium : hover primaire */
    --qc-blue-dark: #223654;      /* --qc-color-blue-dark : surface inverse / bandeau footer */
    --qc-blue-regular: #1472bf;   /* --qc-color-blue-regular : interactif / focus */
    --qc-blue-pale: #dae6f0;      /* --qc-color-blue-pale : teinte claire (hover sidebar) */
    --qc-grey-50: #f1f1f2;        /* --qc-color-grey-pale : surface alt */
    --qc-grey-200: #c5cad2;       /* --qc-color-grey-light : bordure subtile */
    --qc-grey-400: #8893a2;       /* --qc-color-grey-regular : bordure forte */
    --qc-grey-600: #6b778a;       /* --qc-color-grey-medium : texte secondaire */
    --qc-text-primary: #1c2025;   /* texte primaire */
    --qc-white: #fff;
    --qc-piv-band-height: 4px;
    --qc-sidebar-width: 17rem;
    font-family: 'Open Sans', system-ui, sans-serif;
    background: var(--qc-white);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Bandeau d'identification PIV ── */
  .qc-piv-band {
    background: var(--qc-blue-piv);
    height: var(--qc-piv-band-height);
    flex: 0 0 auto;
  }

  /* ── Header QC ── */
  .qc-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .qc-header {
    background: var(--qc-white);
    border-bottom: 1px solid var(--qc-grey-200);
  }

  .qc-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 78rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .qc-header__brand {
    flex: 0 0 auto;
  }

  .qc-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
  }

  /* Signature officielle Québec (ratio préservé, hauteur ~28px comme Québec.ca). */
  .qc-sig {
    display: block;
    width: auto;
    height: 28px;
  }

  .qc-header__tools {
    align-items: flex-end;
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: center;
  }

  .qc-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header QC */
  .qc-header__tools-links :global(.docs-header-control) {
    background: var(--qc-white);
    border-color: var(--qc-grey-400);
    color: var(--qc-text-primary);
    font-family: inherit;
  }

  .qc-header__tools-links :global(.docs-header-control:hover),
  .qc-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--qc-grey-50);
    border-color: var(--qc-blue-piv);
    color: var(--qc-blue-piv);
    box-shadow: none;
  }

  /* Barre de recherche QC */
  .qc-search {
    width: 100%;
    max-width: 26rem;
  }

  .qc-search__label {
    clip: rect(0 0 0 0);
    border: 0;
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  .qc-search__group {
    display: flex;
    position: relative;
    width: 100%;
  }

  .qc-search__input {
    background: var(--qc-white);
    border: 1px solid var(--qc-grey-400);
    border-right: 0;
    border-radius: 4px;
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
    color: var(--qc-text-primary);
    cursor: pointer;
    flex: 1 1 auto;
    font-family: inherit;
    font-size: 0.875rem;
    height: 2.5rem;
    min-width: 0;
    padding: 0 2.125rem 0 0.75rem;
  }

  .qc-search__input:hover,
  .qc-search__input:focus-visible {
    background: var(--qc-white);
    border-color: var(--qc-blue-piv);
    color: var(--qc-text-primary);
    outline: 2px solid var(--qc-blue-regular);
    outline-offset: 1px;
  }

  .qc-search__input::placeholder {
    color: var(--qc-grey-600);
  }

  .qc-search__kbd {
    align-items: center;
    border: 1px solid var(--qc-grey-400);
    border-color: var(--qc-grey-400);
    color: var(--qc-grey-600);
    display: inline-flex;
    font-size: 0.75rem;
    height: 1.25rem;
    justify-content: center;
    position: absolute;
    right: 3rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1.25rem;
  }

  .qc-search__btn {
    align-items: center;
    background: var(--qc-blue-piv);
    border: 1px solid var(--qc-blue-piv);
    border-radius: 0 4px 4px 0;
    color: var(--qc-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease;
  }

  .qc-search__btn:hover,
  .qc-search__btn:focus-visible {
    background: var(--qc-blue-medium);
    border-color: var(--qc-blue-medium);
    outline: 2px solid var(--qc-blue-regular);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .qc-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--qc-text-primary);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Nav horizontale QC ── */
  .qc-nav {
    background: var(--qc-white);
    border-bottom: 1px solid var(--qc-grey-200);
  }

  .qc-nav__inner {
    margin: 0 auto;
    max-width: 78rem;
    overflow-x: auto;
    padding: 0 1.5rem;
  }

  .qc-nav__list {
    align-items: center;
    display: flex;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .qc-nav__item {
    flex: 0 0 auto;
  }

  .qc-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--qc-blue-piv);
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

  .qc-nav__link:hover,
  .qc-nav__link:focus-visible {
    background: var(--qc-grey-50);
    text-decoration: underline;
  }

  .qc-nav__link[aria-current="page"] {
    border-bottom-color: var(--qc-blue-piv);
    color: var(--qc-blue-dark);
    font-weight: 700;
  }

  /* ── Body QC ── */
  .qc-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--qc-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 78rem;
    width: 100%;
  }

  /* ── Sidebar QC ── */
  .qc-sidebar {
    background: var(--qc-white);
    border-right: 1px solid var(--qc-grey-200);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 9rem);
    position: sticky;
    top: 9rem;
  }

  .qc-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .qc-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--qc-grey-200);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .qc-version-badge {
    background: var(--qc-grey-50);
    border: 1px solid var(--qc-grey-200);
    border-radius: 4px;
    color: var(--qc-blue-piv);
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .qc-sidebar-github {
    align-items: center;
    color: var(--qc-blue-piv);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: underline;
  }

  .qc-sidebar-github:hover {
    color: var(--qc-blue-medium);
  }

  .qc-side-list,
  .qc-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .qc-side-link {
    align-items: center;
    border-left: 4px solid transparent;
    box-sizing: border-box;
    color: var(--qc-text-primary);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 4px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
  }

  .qc-side-link:hover,
  .qc-side-link:focus-visible {
    background: var(--qc-grey-50);
    text-decoration: underline;
  }

  .qc-side-link[aria-current="page"] {
    background: var(--qc-blue-pale);
    border-left-color: var(--qc-blue-piv);
    color: var(--qc-blue-dark);
    font-weight: 700;
    text-decoration: none;
  }

  .qc-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 4px);
  }

  .qc-side-divider {
    border-top: 1px solid var(--qc-grey-200);
    margin: 0.5rem 0;
  }

  .qc-side-group {
    display: block;
  }

  .qc-side-group__summary {
    align-items: center;
    border-left: 4px solid transparent;
    color: var(--qc-grey-600);
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

  .qc-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .qc-side-group__summary:hover,
  .qc-side-group__summary:focus-visible {
    background: var(--qc-grey-50);
    outline: none;
  }

  .qc-side-group :global(.qc-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .qc-side-group:not([open]) :global(.qc-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .qc-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .qc-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .qc-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .qc-breadcrumb__item {
    align-items: center;
    color: var(--qc-grey-600);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .qc-breadcrumb__item + .qc-breadcrumb__item::before {
    color: var(--qc-grey-600);
    content: "›";
    margin: 0 0.4rem;
  }

  .qc-breadcrumb__link {
    color: var(--qc-blue-piv);
    text-decoration: underline;
  }

  .qc-breadcrumb__item span[aria-current="page"] {
    color: var(--qc-text-primary);
    font-weight: 600;
  }

  /* ── Footer QC (bande bleue foncée + signature blanche) ── */
  .qc-footer {
    background: var(--qc-blue-dark);
    margin-top: auto;
  }

  .qc-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 78rem;
    padding: 1.5rem;
  }

  .qc-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .qc-footer__link {
    color: var(--qc-white);
    font-size: 0.875rem;
    text-decoration: underline;
    opacity: 0.9;
  }

  .qc-footer__link:hover {
    opacity: 1;
    text-decoration-thickness: 2px;
  }

  .qc-footer-sig {
    display: block;
    width: auto;
    height: 28px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .qc-body {
      grid-template-columns: 1fr;
    }

    .qc-sidebar {
      display: none;
    }

    .qc-header__tools {
      display: none;
    }

    .qc-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .qc-nav__link,
    .qc-side-link,
    .qc-side-group :global(.qc-side-group__icon) {
      transition: none;
    }
  }
</style>

<!--
  Chrome documentaire DSFR — Système de Design de l'État (France)
  Forme fidèle à systeme-de-design.gouv.fr :
  - Header : fond BLANC, bloc logo RF (3 lignes + devise) + titre « Système de Design de l'État »
    à droite : « Être tenu informé » + pastille version + grande barre de recherche
  - Nav horizontale sous le header, onglet actif SOULIGNÉ bleu
  - Barre latérale gauche : item actif BLOC bleu clair + barre d'accent bleue, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Typo Marianne (chargée via Fontsource)
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { page } from "$app/state";
  import { ChevronDown, Menu, Search, X } from "@lucide/svelte";
  import {
    DOCS_FOUNDATION_NAV,
    DOCS_TOP_NAV,
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
    localeSwitcher: Snippet;
    compareButton: Snippet;
    mobileMenuOpen: boolean;
    onMobileMenuToggle: () => void;
  };

  let {
    children,
    themeSwitcher,
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

<!-- Marianne chargée globalement dans app.html (CDN DSFR @font-face) — pas de svelte:head redondant -->

<div class="dsfr-shell">
  <!-- ── HEADER DSFR ── -->
  <div class="dsfr-header-wrap">
    <header class="dsfr-header" aria-label="Système de Design de l'État">
      <div class="dsfr-header__inner">
        <!-- Gauche : logo RF + titre -->
        <div class="dsfr-header__brand">
          <a href="/" class="dsfr-header__brand-link" aria-label="Accueil — Système de Design de l'État">
            <!-- Bloc-marque DSFR officiel (dimensions exactes du .fr-logo de
                 systeme-de-design.gouv.fr) : drapeau+Marianne au-dessus de
                 RÉPUBLIQUE FRANÇAISE, puis devise « Liberté Égalité Fraternité ». -->
            <span class="dsfr-logo">
              <img
                src="/chrome/dsfr/logo-rf.svg"
                alt=""
                class="dsfr-logo-img"
                width="33"
                height="14"
                aria-hidden="true"
              />
              <span class="dsfr-logo-rf">RÉPUBLIQUE<br/>FRANÇAISE</span>
              <img
                src="/chrome/dsfr/logo-devise.svg"
                alt=""
                class="dsfr-logo-devise"
                width="32"
                height="23"
                aria-hidden="true"
              />
            </span>
            <span class="dsfr-service-title">Système de Design de l'État</span>
          </a>
        </div>

        <!-- Droite : actions + recherche -->
        <div class="dsfr-header__tools">
          <div class="dsfr-header__tools-links">
            <a class="dsfr-header__tool-link" href="https://github.com/rhanka/sent-tech-design-system" target="_blank" rel="noreferrer">
              Être tenu informé
            </a>
            <span class="dsfr-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
            {@render compareButton()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>
          <!-- Grande barre de recherche DSFR -->
          <div class="dsfr-search" role="search">
            <label class="dsfr-search__label" for="dsfr-search-input">Rechercher</label>
            <div class="dsfr-search__group">
              <input
                type="search"
                id="dsfr-search-input"
                class="dsfr-search__input"
                placeholder="Rechercher…"
                aria-label="Rechercher dans la documentation"
              />
              <button type="button" class="dsfr-search__btn" aria-label="Lancer la recherche">
                <Search size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="dsfr-header__burger"
          onclick={onMobileMenuToggle}
          aria-expanded={mobileMenuOpen}
          aria-label="Menu principal"
        >
          {#if mobileMenuOpen}
            <X size={20} strokeWidth={1.8} aria-hidden="true" />
          {:else}
            <Menu size={20} strokeWidth={1.8} aria-hidden="true" />
          {/if}
        </button>
      </div>
    </header>

    <!-- Nav horizontale DSFR (onglets soulignés, alignée sur le conteneur) -->
    <nav class="dsfr-nav" aria-label="Navigation principale">
      <div class="dsfr-nav__inner">
        <ul class="dsfr-nav__list">
          {#each DOCS_TOP_NAV as item (item.href)}
            <li class="dsfr-nav__item">
              <a
                class="dsfr-nav__link"
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
                <!-- Chevron indiquant un sous-menu déroulant (tous les items top-nav en ont un) -->
                <span class="dsfr-nav__chevron" aria-hidden="true">
                  <ChevronDown size={10} strokeWidth={1.8} />
                </span>
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </nav>
  </div>

  <!-- ── BODY DSFR ── -->
  <div class="dsfr-body">
    <!-- Sidebar -->
    <aside class="dsfr-sidebar" aria-label="Navigation de la documentation">
      <nav class="dsfr-side-nav" aria-label="Sommaire">
        <ul class="dsfr-side-list">
          {#each DOCS_FOUNDATION_NAV as item (item.href)}
            <li>
              <a
                class="dsfr-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="dsfr-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="dsfr-side-group" open={isGroupOpen(group.items)}>
                <summary class="dsfr-side-group__summary">
                  <ChevronDown class="dsfr-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="dsfr-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="dsfr-side-link dsfr-side-link--sub"
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
    </aside>

    <!-- Contenu principal + fil d'Ariane -->
    <div class="dsfr-content">
      <!-- Fil d'Ariane DSFR -->
      <nav class="dsfr-breadcrumb" aria-label="Fil d'Ariane">
        <ol class="dsfr-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="dsfr-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="dsfr-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>
</div>

<style>
  /* ── Variables DSFR ── */
  .dsfr-shell {
    --dsfr-blue: #000091;
    --dsfr-blue-hover: #1212ff;
    --dsfr-blue-active: #0000ff;
    --dsfr-blue-light: #e3e3fd;
    --dsfr-blue-accent: #6a6af4;
    --dsfr-red: #e1000f;
    --dsfr-gray-50: #666;
    --dsfr-gray-100: #f5f5fe;
    --dsfr-gray-200: #ececfe;
    --dsfr-border: #ddd;
    --dsfr-white: #fff;
    --dsfr-black: #1e1e1e;
    --dsfr-sidebar-width: 17rem;
    --dsfr-header-height-lg: 8rem;
    --dsfr-header-height-sm: 4.5rem;
    font-family: 'Marianne', 'Arial', sans-serif;
    background: var(--dsfr-white);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header DSFR ── */
  .dsfr-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .dsfr-header {
    background: var(--dsfr-white);
    border-bottom: 1px solid var(--dsfr-border);
  }

  .dsfr-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 78rem;
    min-height: 5rem;
    padding: 0.75rem 1.5rem;
  }

  .dsfr-header__brand {
    flex: 0 0 auto;
  }

  .dsfr-header__brand-link {
    align-items: center;
    color: var(--dsfr-black);
    display: inline-flex;
    gap: 1.5rem;
    text-decoration: none;
  }

  .dsfr-header__brand-link:hover {
    text-decoration: none;
  }

  /* Bloc-marque DSFR — dimensions exactes du .fr-logo officiel :
     drapeau+Marianne (33×12) + RÉPUBLIQUE FRANÇAISE (12,6px) + devise. */
  .dsfr-logo {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    align-items: flex-start;
  }

  .dsfr-logo-img {
    display: block;
    width: 33px; /* drapeau+Marianne, ratio officiel préservé */
    height: auto;
    margin-bottom: 4px; /* comme le .fr-logo::before officiel */
  }

  .dsfr-logo-rf {
    color: #161616;
    font-size: 12.6px;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 13px;
    text-transform: uppercase;
  }

  /* Devise « Liberté Égalité Fraternité » (gravure officielle), collée sous FRANÇAISE */
  .dsfr-logo-devise {
    display: block;
    width: 31.5px;
    height: auto;
    margin-top: 3px;
  }

  .dsfr-service-title {
    color: #161616;
    font-size: 20px;
    font-weight: 700;
    line-height: 28px;
    white-space: nowrap;
  }

  .dsfr-header__tools {
    align-items: flex-end;
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: center;
  }

  .dsfr-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .dsfr-header__tool-link {
    color: var(--dsfr-blue);
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: underline;
    white-space: nowrap;
  }

  .dsfr-header__tool-link:hover {
    color: var(--dsfr-blue-hover);
  }

  .dsfr-version-badge {
    background: var(--dsfr-gray-100);
    border: 1px solid var(--dsfr-blue-accent);
    border-radius: 2px;
    color: var(--dsfr-blue);
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  /* Overrides switchers dans header DSFR */
  .dsfr-header__tools-links :global(.docs-header-control) {
    background: var(--dsfr-white);
    border-color: var(--dsfr-border);
    color: var(--dsfr-gray-50);
    font-family: inherit;
  }

  .dsfr-header__tools-links :global(.docs-header-control:hover),
  .dsfr-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--dsfr-gray-100);
    border-color: var(--dsfr-blue);
    color: var(--dsfr-blue);
    box-shadow: none;
  }

  /* Barre de recherche DSFR */
  .dsfr-search {
    width: 100%;
    max-width: 28rem;
  }

  .dsfr-search__label {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  .dsfr-search__group {
    display: flex;
    height: 2.5rem;
  }

  .dsfr-search__input {
    background: var(--dsfr-white);
    border: 1px solid #3a3a3a;
    border-right: none;
    border-radius: 0;
    color: var(--dsfr-black);
    flex: 1;
    font-family: inherit;
    font-size: 0.875rem;
    outline: none;
    padding: 0 0.75rem;
  }

  .dsfr-search__input::placeholder {
    color: var(--dsfr-gray-50);
  }

  .dsfr-search__input:focus {
    border-color: var(--dsfr-blue);
    outline: 2px solid var(--dsfr-blue);
    outline-offset: -2px;
  }

  .dsfr-search__btn {
    align-items: center;
    background: var(--dsfr-blue);
    border: none;
    color: var(--dsfr-white);
    cursor: pointer;
    display: inline-flex;
    height: 100%;
    justify-content: center;
    padding: 0 1rem;
    transition: background 120ms ease;
  }

  .dsfr-search__btn:hover,
  .dsfr-search__btn:focus-visible {
    background: var(--dsfr-blue-hover);
    outline: none;
  }

  /* Burger mobile */
  .dsfr-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--dsfr-black);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Nav horizontale DSFR ── */
  .dsfr-nav {
    background: var(--dsfr-white);
    border-bottom: 1px solid var(--dsfr-border);
    box-shadow: 0 1px 4px rgb(0 0 145 / 0.06);
  }

  /* Conteneur interne aligné sur le même conteneur que le header (max 78rem, padding latéral) */
  .dsfr-nav__inner {
    margin: 0 auto;
    max-width: 78rem;
    overflow-x: auto;
    padding: 0 1.5rem;
  }

  .dsfr-nav__list {
    align-items: center;
    display: flex;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .dsfr-nav__item {
    flex: 0 0 auto;
  }

  .dsfr-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--dsfr-black);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 1rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .dsfr-nav__link:hover,
  .dsfr-nav__link:focus-visible {
    background: var(--dsfr-gray-100);
    text-decoration: none;
  }

  .dsfr-nav__link[aria-current="page"] {
    border-bottom-color: var(--dsfr-blue);
    color: var(--dsfr-blue);
    font-weight: 700;
  }

  .dsfr-nav__chevron {
    flex: 0 0 auto;
    opacity: 0.6;
  }

  .dsfr-nav__link[aria-current="page"] .dsfr-nav__chevron {
    color: var(--dsfr-blue);
    opacity: 1;
  }

  /* ── Body DSFR ── */
  .dsfr-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--dsfr-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 78rem;
    width: 100%;
  }

  /* ── Sidebar DSFR ── */
  .dsfr-sidebar {
    background: var(--dsfr-white);
    border-right: 1px solid var(--dsfr-border);
    min-width: 0;
  }

  .dsfr-side-nav {
    max-height: calc(100vh - 10rem);
    overflow-y: auto;
    padding: 1.25rem 0;
    position: sticky;
    top: 10rem; /* approx header+nav height */
  }

  .dsfr-side-list,
  .dsfr-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .dsfr-side-link {
    border-left: 4px solid transparent;
    color: var(--dsfr-black);
    display: block;
    font-size: 0.875rem;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 4px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    line-height: 1.4;
  }

  .dsfr-side-link:hover,
  .dsfr-side-link:focus-visible {
    background: var(--dsfr-gray-100);
    text-decoration: none;
  }

  .dsfr-side-link[aria-current="page"] {
    background: var(--dsfr-blue-light);
    border-left-color: var(--dsfr-blue);
    color: var(--dsfr-blue);
    font-weight: 700;
  }

  .dsfr-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 4px);
  }

  .dsfr-side-divider {
    border-top: 1px solid var(--dsfr-border);
    margin: 0.5rem 0;
  }

  .dsfr-side-group {
    display: block;
  }

  .dsfr-side-group__summary {
    align-items: center;
    border-left: 4px solid transparent;
    color: var(--dsfr-gray-50);
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

  .dsfr-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .dsfr-side-group__summary:hover,
  .dsfr-side-group__summary:focus-visible {
    background: var(--dsfr-gray-100);
    outline: none;
  }

  .dsfr-side-group :global(.dsfr-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .dsfr-side-group:not([open]) :global(.dsfr-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .dsfr-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .dsfr-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .dsfr-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .dsfr-breadcrumb__item {
    align-items: center;
    color: var(--dsfr-gray-50);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .dsfr-breadcrumb__item + .dsfr-breadcrumb__item::before {
    color: var(--dsfr-gray-50);
    content: "›";
    margin: 0 0.4rem;
  }

  .dsfr-breadcrumb__link {
    color: var(--dsfr-blue);
    text-decoration: underline;
  }

  .dsfr-breadcrumb__item span[aria-current="page"] {
    color: var(--dsfr-black);
    font-weight: 600;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .dsfr-body {
      grid-template-columns: 1fr;
    }

    .dsfr-sidebar {
      display: none;
    }

    .dsfr-header__tools {
      display: none;
    }

    .dsfr-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .dsfr-nav__link,
    .dsfr-side-link,
    .dsfr-search__btn,
    .dsfr-side-group :global(.dsfr-side-group__icon) {
      transition: none;
    }
  }
</style>

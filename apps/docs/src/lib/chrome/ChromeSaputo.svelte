<!--
  Chrome documentaire Saputo Inc. (saputo.com) — laitier corporatif de Montréal.
  Forme fidèle à l'en-tête réel de saputo.com :
  - Header : bandeau BLANC, wordmark officiel Saputo (rouge) à gauche,
    nav horizontale centrale, loupe de recherche compacte, CTA ROUGE à droite
  - Onglet de nav actif : SOULIGNÉ rouge
  - Barre latérale gauche : item actif accent rouge à gauche + fond tinté gris,
    sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande claire avec liens + wordmark Saputo
  - Couleurs mesurées : rouge Saputo #e31c23 (primaire), hover #d3281b,
    encre #000000, surfaces blanches, subtle #f5f5f5,
    inverse lie-de-vin #4f0710, accent bleu acier #0464ac,
    bord #cccccc, danger #e31c23 ; radius 4px (cartes 12px)
  - Wordmark officiel Saputo (vecteur Wikimedia « File:Saputo company logo.svg »,
    fill normalisé sur le rouge de marque #e31c23) référencé via
    <img src="/chrome/saputo/logo.svg">
  - Typo : 'Open Sans' (corps, titres EN CAPITALES gras), 'FlamaSemicondensed'
    (display, propriétaire → repli Arial Narrow) ; Open Sans chargée via Google
    Fonts dans <svelte:head>
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

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap"
  />
</svelte:head>

<div class="sap-shell">
  <!-- ── HEADER SAPUTO ── -->
  <div class="sap-header-wrap">
    <header class="sap-header" aria-label="Saputo">
      <div class="sap-header__inner">
        <!-- Gauche : wordmark officiel Saputo (rouge) -->
        <div class="sap-header__brand">
          <a href="/" class="sap-header__brand-link" aria-label="Accueil : Saputo Design System">
            <img
              src="/chrome/saputo/logo.svg"
              alt="Saputo"
              class="sap-logo"
              width="96"
              height="34"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="sap-nav" aria-label="Navigation principale">
          <ul class="sap-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="sap-nav__item">
                <a
                  class="sap-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Saputo : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="sap-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) façon Saputo -->
        <div class="sap-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="sap-header__tools-links">
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
          class="sap-header__burger"
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

  <!-- ── BODY SAPUTO ── -->
  <div class="sap-body">
    <!-- Sidebar -->
    <aside class="sap-sidebar" aria-label="Navigation de la documentation">
      <nav class="sap-side-nav" aria-label="Sommaire">
        <ul class="sap-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="sap-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="sap-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="sap-side-group" open={isGroupOpen(group.items)}>
                <summary class="sap-side-group__summary">
                  <ChevronDown class="sap-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="sap-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="sap-side-link sap-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="sap-side-divider" role="separator"></li>

          <li>
            <a
              class="sap-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="sap-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="sap-side-group__summary">
                  <ChevronDown class="sap-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="sap-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="sap-side-link sap-side-link--sub"
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
      <div class="sap-sidebar-footer">
        <span class="sap-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="sap-sidebar-github"
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
    <div class="sap-content">
      <nav class="sap-breadcrumb" aria-label="Breadcrumb">
        <ol class="sap-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="sap-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="sap-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER SAPUTO ── -->
  <footer class="sap-footer" aria-label="Pied de page Saputo">
    <div class="sap-footer__inner">
      <nav class="sap-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="sap-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/saputo/logo.svg"
        alt="Saputo"
        class="sap-footer__logo"
        width="96"
        height="34"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Saputo ── */
  .sap-shell {
    --sap-red: #e31c23; /* rouge Saputo primaire / danger */
    --sap-red-hover: #d3281b; /* rouge hover */
    --sap-wine: #4f0710; /* lie-de-vin inverse */
    --sap-blue: #0464ac; /* bleu acier accent */
    --sap-ink: #000000; /* encre */
    --sap-grey: #555555; /* gris texte secondaire */
    --sap-subtle: #f5f5f5; /* surface subtile */
    --sap-tint: #fbe8e9; /* tint rouge léger (surface secondaire) */
    --sap-border: #cccccc; /* bord */
    --sap-white: #fff;
    --sap-sidebar-width: 17rem;
    --sap-radius: 4px; /* conteneurs 4px arrondis */
    --sap-radius-card: 12px; /* cartes */
    font-family: 'Open Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--sap-white);
    color: var(--sap-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Saputo ── */
  .sap-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .sap-header {
    background: var(--sap-white);
    border-bottom: 1px solid var(--sap-border);
  }

  .sap-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .sap-header__brand {
    flex: 0 0 auto;
  }

  .sap-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .sap-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Wordmark officiel Saputo (ratio préservé, hauteur ~34px comme l'en-tête réel). */
  .sap-logo {
    display: block;
    width: auto;
    height: 34px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .sap-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .sap-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré 4px, hover tint/rouge. */
  .sap-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--sap-radius);
    color: var(--sap-ink);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .sap-search-btn:hover,
  .sap-search-btn:focus-visible {
    background: var(--sap-tint);
    border-color: var(--sap-red);
    color: var(--sap-red);
    outline: none;
  }

  .sap-nav__item {
    flex: 0 0 auto;
  }

  /* Nav Saputo : libellés EN CAPITALES gras (signature corporate food). */
  .sap-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--sap-ink);
    display: inline-flex;
    font-family: 'FlamaSemicondensed', 'Arial Narrow', 'Open Sans', system-ui, sans-serif;
    font-size: 0.8125rem;
    font-weight: 700;
    gap: 0.3rem;
    letter-spacing: 0.04em;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .sap-nav__link:hover,
  .sap-nav__link:focus-visible {
    color: var(--sap-red);
    outline: none;
  }

  .sap-nav__link[aria-current="page"] {
    border-bottom-color: var(--sap-red);
    color: var(--sap-red);
  }

  /* ── Outils droite ── */
  .sap-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .sap-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .sap-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .sap-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--sap-border);
  }

  /* Overrides switchers dans header Saputo (champs clairs, bord gris 1px). */
  .sap-header__tools-links :global(.docs-header-control) {
    background: var(--sap-white);
    border-color: var(--sap-border);
    border-radius: var(--sap-radius);
    color: var(--sap-ink);
    font-family: inherit;
  }

  .sap-header__tools-links :global(.docs-header-control:hover),
  .sap-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--sap-tint);
    border-color: var(--sap-red);
    color: var(--sap-red);
    box-shadow: none;
  }

  /* CTA rouge corporate (libellé capitales). */
  .sap-cta {
    align-items: center;
    background: var(--sap-red);
    border: 1px solid var(--sap-red);
    border-radius: var(--sap-radius);
    color: var(--sap-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: 'FlamaSemicondensed', 'Arial Narrow', 'Open Sans', system-ui, sans-serif;
    font-size: 0.8125rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.04em;
    padding: 0 1.25rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .sap-cta:hover,
  .sap-cta:focus-visible {
    background: var(--sap-red-hover);
    border-color: var(--sap-red-hover);
    color: var(--sap-white);
    outline: none;
  }

  /* Burger mobile */
  .sap-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--sap-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Saputo ── */
  .sap-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--sap-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Saputo ── */
  .sap-sidebar {
    background: var(--sap-white);
    border-right: 1px solid var(--sap-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .sap-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .sap-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--sap-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .sap-version-badge {
    background: var(--sap-tint);
    border: 1px solid var(--sap-border);
    border-radius: var(--sap-radius);
    color: var(--sap-red);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .sap-sidebar-github {
    align-items: center;
    color: var(--sap-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .sap-sidebar-github:hover,
  .sap-sidebar-github:focus-visible {
    color: var(--sap-red);
  }

  .sap-side-list,
  .sap-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .sap-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--sap-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .sap-side-link:hover,
  .sap-side-link:focus-visible {
    background: var(--sap-subtle);
    color: var(--sap-red);
    text-decoration: none;
  }

  .sap-side-link[aria-current="page"] {
    background: var(--sap-tint);
    border-left-color: var(--sap-red);
    color: var(--sap-red);
    font-weight: 700;
    text-decoration: none;
  }

  .sap-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .sap-side-divider {
    border-top: 1px solid var(--sap-border);
    margin: 0.5rem 0;
  }

  .sap-side-group {
    display: block;
  }

  /* Titres de groupe EN CAPITALES (signature corporate food). */
  .sap-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--sap-grey);
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

  .sap-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .sap-side-group__summary:hover,
  .sap-side-group__summary:focus-visible {
    background: var(--sap-subtle);
    outline: none;
  }

  .sap-side-group :global(.sap-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .sap-side-group:not([open]) :global(.sap-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .sap-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .sap-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .sap-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .sap-breadcrumb__item {
    align-items: center;
    color: var(--sap-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .sap-breadcrumb__item + .sap-breadcrumb__item::before {
    color: var(--sap-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .sap-breadcrumb__link {
    color: var(--sap-blue);
    text-decoration: none;
  }

  .sap-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .sap-breadcrumb__item span[aria-current="page"] {
    color: var(--sap-ink);
    font-weight: 600;
  }

  /* ── Footer Saputo ── */
  .sap-footer {
    background: var(--sap-subtle);
    border-top: 1px solid var(--sap-border);
    margin-top: auto;
  }

  .sap-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .sap-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .sap-footer__link {
    color: var(--sap-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .sap-footer__link:hover {
    color: var(--sap-red);
    text-decoration: underline;
  }

  .sap-footer__logo {
    display: block;
    width: auto;
    height: 30px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .sap-body {
      grid-template-columns: 1fr;
    }

    .sap-sidebar {
      display: none;
    }

    .sap-nav {
      display: none;
    }

    .sap-header__tools {
      display: none;
    }

    .sap-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .sap-nav__link,
    .sap-cta,
    .sap-search-btn,
    .sap-side-link,
    .sap-side-group :global(.sap-side-group__icon) {
      transition: none;
    }
  }
</style>

<!--
  Chrome documentaire Cascades (cascades.com) — emballages écologiques québécois.
  Forme fidèle à l'en-tête éco de cascades.com :
  - Header : barre BLANCHE/crème, logo officiel Cascades (vert forêt) à gauche,
    nav horizontale, loupe de recherche compacte + CTA vert à droite
  - Onglet de nav actif : SOULIGNÉ vert forêt
  - Barre latérale gauche : item actif accent vert à gauche + fond crème tinté,
    sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande crème avec liens + logo Cascades
  - Couleurs mesurées : vert forêt profond #00483c (primaire, hover #00221c),
    encre #464646, surfaces blanches, crème subtil #f3f2ed,
    champ papier-recyclé #ebe8db, bord #b9bab2, danger #dc3545 ;
    radius 10px (contrôles), focus ring vert rgb(0 72 60 / 0.5)
  - Logo officiel Cascades (asset header cascades.com, fill #004e32) référencé
    via <img src="/chrome/cascades/logo.svg">
  - Typo : 'Roboto' (corps) chargée via Google Fonts ; le titrage serif maison
    'Cambon' est propriétaire (pas de webfont public) → fallback Georgia/serif.
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
    href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
  />
</svelte:head>

<div class="casc-shell">
  <!-- ── HEADER CASCADES ── -->
  <div class="casc-header-wrap">
    <header class="casc-header" aria-label="Cascades">
      <div class="casc-header__inner">
        <!-- Gauche : logo officiel Cascades (vert forêt) -->
        <div class="casc-header__brand">
          <a href="/" class="casc-header__brand-link" aria-label="Accueil : Cascades Design System">
            <img
              src="/chrome/cascades/logo.svg"
              alt="Cascades"
              class="casc-logo"
              width="80"
              height="37"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="casc-nav" aria-label="Navigation principale">
          <ul class="casc-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="casc-nav__item">
                <a
                  class="casc-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + loupe + CTA -->
        <div class="casc-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="casc-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render colorModeToggle()}
            {@render localeSwitcher()}
          </div>

          <!-- Loupe de recherche compacte (pas de champ), branchée sur la palette docs. -->
          <button
            type="button"
            class="casc-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="casc-header__burger"
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

  <!-- ── BODY CASCADES ── -->
  <div class="casc-body">
    <!-- Sidebar -->
    <aside class="casc-sidebar" aria-label="Navigation de la documentation">
      <nav class="casc-side-nav" aria-label="Sommaire">
        <ul class="casc-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="casc-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="casc-side-divider" role="separator"></li>

          <li class="casc-side-heading">
            <a
              class="casc-side-link casc-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="casc-side-group" open={isGroupOpen(group.items)}>
                <summary class="casc-side-group__summary">
                  <ChevronDown class="casc-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="casc-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="casc-side-link casc-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="casc-side-divider" role="separator"></li>

          <li class="casc-side-heading">
            <a
              class="casc-side-link casc-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="casc-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="casc-side-group__summary">
                  <ChevronDown class="casc-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="casc-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="casc-side-link casc-side-link--sub"
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
      <div class="casc-sidebar-footer">
        <span class="casc-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="casc-sidebar-github"
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
    <div class="casc-content">
      <nav class="casc-breadcrumb" aria-label="Breadcrumb">
        <ol class="casc-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="casc-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="casc-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER CASCADES ── -->
  <footer class="casc-footer" aria-label="Pied de page Cascades">
    <div class="casc-footer__inner">
      <nav class="casc-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="casc-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/cascades/logo.svg"
        alt="Cascades"
        class="casc-footer__logo"
        width="80"
        height="37"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Cascades ── */
  .casc-shell {
    --casc-green: #00483c; /* vert forêt profond : primaire */
    --casc-green-dark: #00221c; /* vert très profond : hover */
    --casc-green-logo: #004e32; /* vert du logo officiel */
    --casc-ink: #464646; /* encre / texte */
    --casc-grey: #6a6a64; /* gris texte secondaire */
    --casc-cream: #f3f2ed; /* crème subtil (surface secondaire) */
    --casc-paper: #ebe8db; /* champ papier-recyclé */
    --casc-border: #b9bab2; /* bord */
    --casc-danger: #dc3545; /* danger */
    --casc-white: #fff;
    --casc-focus: rgb(0 72 60 / 0.5); /* focus ring vert */
    --casc-sidebar-width: 17rem;
    --casc-radius: 10px; /* contrôles arrondis */
    font-family: 'Roboto', Arial, sans-serif;
    background: var(--casc-white);
    color: var(--casc-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Cascades ── */
  .casc-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .casc-header {
    background: var(--casc-white);
    border-bottom: 1px solid var(--casc-border);
  }

  .casc-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .casc-header__brand {
    flex: 0 0 auto;
  }

  .casc-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .casc-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Cascades (ratio préservé, hauteur ~37px comme l'en-tête réel). */
  .casc-logo {
    display: block;
    width: auto;
    height: 37px;
  }

  /* ── Nav horizontale (centre) ── */
  .casc-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .casc-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  .casc-nav__item {
    flex: 0 0 auto;
  }

  .casc-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--casc-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .casc-nav__link:hover,
  .casc-nav__link:focus-visible {
    color: var(--casc-green);
    outline: none;
  }

  .casc-nav__link[aria-current="page"] {
    border-bottom-color: var(--casc-green);
    color: var(--casc-green);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .casc-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .casc-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Cascades (champs papier, bord gris 1px, radius 10px). */
  .casc-header__tools-links :global(.docs-header-control) {
    background: var(--casc-white);
    border-color: var(--casc-border);
    border-radius: var(--casc-radius);
    color: var(--casc-ink);
    font-family: inherit;
  }

  .casc-header__tools-links :global(.docs-header-control:hover),
  .casc-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--casc-cream);
    border-color: var(--casc-green);
    color: var(--casc-green);
    box-shadow: none;
  }

  /* Loupe de recherche compacte (pas de champ) : carré 10px, hover crème/vert. */
  .casc-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--casc-radius);
    color: var(--casc-ink);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .casc-search-btn:hover,
  .casc-search-btn:focus-visible {
    background: var(--casc-cream);
    border-color: var(--casc-green);
    color: var(--casc-green);
    outline: none;
  }

  .casc-search-btn:focus-visible {
    box-shadow: 0 0 0 3px var(--casc-focus);
  }

  /* CTA vert (radius 10px) : signature Cascades. */
  .casc-cta {
    align-items: center;
    background: var(--casc-green);
    border: 1px solid var(--casc-green);
    border-radius: var(--casc-radius);
    color: var(--casc-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .casc-cta:hover,
  .casc-cta:focus-visible {
    background: var(--casc-green-dark);
    border-color: var(--casc-green-dark);
    color: var(--casc-white);
    outline: none;
  }

  .casc-cta:focus-visible {
    box-shadow: 0 0 0 3px var(--casc-focus);
  }

  /* Burger mobile */
  .casc-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--casc-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Cascades ── */
  .casc-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--casc-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Cascades ── */
  .casc-sidebar {
    background: var(--casc-white);
    border-right: 1px solid var(--casc-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .casc-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .casc-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--casc-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .casc-version-badge {
    background: var(--casc-cream);
    border: 1px solid var(--casc-border);
    border-radius: var(--casc-radius);
    color: var(--casc-green);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .casc-sidebar-github {
    align-items: center;
    color: var(--casc-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .casc-sidebar-github:hover,
  .casc-sidebar-github:focus-visible {
    color: var(--casc-green);
  }

  .casc-side-list,
  .casc-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .casc-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--casc-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .casc-side-link:hover,
  .casc-side-link:focus-visible {
    background: var(--casc-cream);
    color: var(--casc-green);
    text-decoration: none;
  }

  .casc-side-link[aria-current="page"] {
    background: var(--casc-paper);
    border-left-color: var(--casc-green);
    color: var(--casc-green-dark);
    font-weight: 700;
    text-decoration: none;
  }

  .casc-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .casc-side-divider {
    border-top: 1px solid var(--casc-border);
    margin: 0.5rem 0;
  }

  .casc-side-group {
    display: block;
  }

  .casc-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--casc-grey);
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

  .casc-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .casc-side-group__summary:hover,
  .casc-side-group__summary:focus-visible {
    background: var(--casc-cream);
    outline: none;
  }

  .casc-side-group :global(.casc-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .casc-side-group:not([open]) :global(.casc-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .casc-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .casc-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .casc-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .casc-breadcrumb__item {
    align-items: center;
    color: var(--casc-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .casc-breadcrumb__item + .casc-breadcrumb__item::before {
    color: var(--casc-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .casc-breadcrumb__link {
    color: var(--casc-green);
    text-decoration: none;
  }

  .casc-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .casc-breadcrumb__item span[aria-current="page"] {
    color: var(--casc-ink);
    font-weight: 600;
  }

  /* ── Footer Cascades ── */
  .casc-footer {
    background: var(--casc-cream);
    border-top: 1px solid var(--casc-border);
    margin-top: auto;
  }

  .casc-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .casc-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .casc-footer__link {
    color: var(--casc-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .casc-footer__link:hover {
    color: var(--casc-green);
    text-decoration: underline;
  }

  .casc-footer__logo {
    display: block;
    width: auto;
    height: 34px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .casc-body {
      grid-template-columns: 1fr;
    }

    .casc-sidebar {
      display: none;
    }

    .casc-nav {
      display: none;
    }

    .casc-header__tools {
      display: none;
    }

    .casc-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .casc-nav__link,
    .casc-cta,
    .casc-search-btn,
    .casc-side-link,
    .casc-side-group :global(.casc-side-group__icon) {
      transition: none;
    }
  }
</style>

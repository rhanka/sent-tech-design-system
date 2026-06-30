<!--
  Chrome documentaire Cirque du Soleil (cirquedusoleil.com).
  Forme fidèle à l'en-tête réel du Cirque du Soleil :
  - Header : bandeau NOIR (#000), logo officiel « soleil + CIRQUE DU SOLEIL » à gauche,
    nav horizontale élégante au centre, CTA OR à droite ; onglet actif souligné OR
  - Tout le shell est SOMBRE et théâtral (surfaces noires, accents OR, texte clair)
  - Barre latérale gauche sombre : item actif accent OR + fond surélevé, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande sombre avec liens + logo
  - Couleurs mesurées : or #dca85d (primaire, hover #f8d248), noir #000 (surface.default),
    surélevé #191a1a, panneaux #1b1b1b, encre or-clair #f2e7bb, secondaire violet #6349e9,
    focus bleu #0163da, danger #ec091a ; radius doux (contrôles 16px, cartes 24px, CTA ~30px)
  - Logo officiel Cirque du Soleil (variante fond sombre : soleil dégradé or + mot-symbole
    blanc) référencé via <img src="/chrome/cirque-du-soleil/logo.svg"> — il porte déjà ses
    couleurs (dégradé or + texte blanc) donc AUCUNE inversion de filtre n'est appliquée
  - Typo : « Cds Sans » est propriétaire → repli théâtral : titres en
    'Playfair Display', Georgia, serif ; corps en 'Open Sans', sans-serif ;
    les deux chargées via Google Fonts dans <svelte:head>
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
  <!-- « Cds Sans » (police propriétaire) indisponible → repli théâtral :
       Playfair Display (titres serif) + Open Sans (corps). -->
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Open+Sans:wght@400;600;700&display=swap"
  />
</svelte:head>

<div class="cds-shell">
  <!-- ── HEADER Cirque du Soleil ── -->
  <div class="cds-header-wrap">
    <header class="cds-header" aria-label="Cirque du Soleil">
      <div class="cds-header__inner">
        <!-- Gauche : nav horizontale élégante (desktop) ou burger (mobile) -->
        <div class="cds-header__left">
          <nav class="cds-nav" aria-label="Navigation principale">
            <ul class="cds-nav__list">
              {#each topNavItems as item (item.href)}
                <li class="cds-nav__item">
                  <a
                    class="cds-nav__link"
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              {/each}
            </ul>
          </nav>

          <!-- Burger mobile (cellule gauche) -->
          <button
            type="button"
            class="cds-header__burger"
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

        <!-- Centre : logo officiel CENTRÉ (soleil or + mot-symbole blanc, variante fond sombre) -->
        <div class="cds-header__brand">
          <a href="/" class="cds-header__brand-link" aria-label="Accueil : Cirque du Soleil Design System">
            <img
              src="/chrome/cirque-du-soleil/logo.svg"
              alt="Cirque du Soleil"
              class="cds-logo"
              width="157"
              height="40"
            />
          </a>
        </div>

        <!-- Droite : outils + recherche (loupe) + CTA or -->
        <div class="cds-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="cds-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render colorModeToggle()}
            {@render localeSwitcher()}
          </div>

          <!-- Recherche : loupe OR compacte, branchée sur la palette docs. -->
          <button
            type="button"
            class="cds-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  </div>

  <!-- ── BODY Cirque du Soleil ── -->
  <div class="cds-body">
    <!-- Sidebar -->
    <aside class="cds-sidebar" aria-label="Navigation de la documentation">
      <nav class="cds-side-nav" aria-label="Sommaire">
        <ul class="cds-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="cds-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="cds-side-divider" role="separator"></li>

          <li class="cds-side-heading">
            <a
              class="cds-side-link cds-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="cds-side-group" open={isGroupOpen(group.items)}>
                <summary class="cds-side-group__summary">
                  <ChevronDown class="cds-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="cds-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="cds-side-link cds-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="cds-side-divider" role="separator"></li>

          <li class="cds-side-heading">
            <a
              class="cds-side-link cds-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="cds-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="cds-side-group__summary">
                  <ChevronDown class="cds-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="cds-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="cds-side-link cds-side-link--sub"
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
      <div class="cds-sidebar-footer">
        <span class="cds-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="cds-sidebar-github"
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
    <div class="cds-content">
      <nav class="cds-breadcrumb" aria-label="Breadcrumb">
        <ol class="cds-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="cds-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="cds-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Cirque du Soleil ── -->
  <footer class="cds-footer" aria-label="Pied de page Cirque du Soleil">
    <div class="cds-footer__inner">
      <nav class="cds-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="cds-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/cirque-du-soleil/logo.svg"
        alt="Cirque du Soleil"
        class="cds-footer__logo"
        width="118"
        height="30"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Cirque du Soleil (mesurées) ── */
  .cds-shell {
    --cds-gold: #dca85d; /* or primaire */
    --cds-gold-hover: #f8d248; /* or survol */
    --cds-gold-ink: #f2e7bb; /* encre or-clair (titres) */
    --cds-purple: #6349e9; /* secondaire violet */
    --cds-focus: #0163da; /* bleu focus */
    --cds-stage: #000; /* noir scène (surface.default) */
    --cds-raised: #191a1a; /* bandeau surélevé */
    --cds-panel: #1b1b1b; /* panneaux / surfaces */
    --cds-heading: #f6f1e6; /* texte titres clair */
    --cds-body: #cfc8ba; /* texte corps clair chaud */
    --cds-grey: #8c857a; /* texte secondaire / placeholder */
    --cds-border: #2a2722; /* bordure sombre chaude */
    --cds-danger: #ec091a; /* danger */
    --cds-white: #fff;
    --cds-sidebar-width: 17rem;
    --cds-radius: 16px; /* radius contrôles */
    --cds-radius-card: 24px; /* radius cartes */
    --cds-radius-cta: 30px; /* radius CTA */
    font-family: 'Open Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--cds-stage);
    color: var(--cds-body);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Cirque du Soleil ── */
  .cds-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .cds-header {
    background: var(--cds-stage);
    border-bottom: 1px solid var(--cds-border);
  }

  /* Grille 3 colonnes : nav gauche | logo CENTRÉ | outils droite. */
  .cds-header__inner {
    align-items: center;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.75rem;
    padding: 0.75rem 1.5rem;
  }

  /* Cellule gauche : nav (desktop) ou burger (mobile), alignée à gauche. */
  .cds-header__left {
    align-items: center;
    display: flex;
    justify-self: start;
    min-width: 0;
  }

  /* Cellule centrale : logo centré. */
  .cds-header__brand {
    justify-self: center;
  }

  .cds-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .cds-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel (variante fond sombre : porte déjà ses couleurs → pas de filtre). */
  .cds-logo {
    display: block;
    width: auto;
    height: 38px;
  }

  /* ── Nav horizontale (cellule gauche, élégante) ── */
  .cds-nav {
    min-width: 0;
    overflow-x: auto;
  }

  .cds-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cds-nav__item {
    flex: 0 0 auto;
  }

  .cds-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--cds-heading);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.3rem;
    letter-spacing: 0.08em;
    min-height: 2.5rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: color 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .cds-nav__link:hover,
  .cds-nav__link:focus-visible {
    color: var(--cds-gold-hover);
    outline: none;
  }

  .cds-nav__link[aria-current="page"] {
    border-bottom-color: var(--cds-gold);
    color: var(--cds-gold);
  }

  /* ── Outils droite (cellule droite, alignée à droite) ── */
  .cds-header__tools {
    align-items: center;
    display: flex;
    gap: 0.75rem;
    justify-self: end;
    min-width: 0;
  }

  .cds-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Cirque du Soleil (champs sombres surélevés, radius doux). */
  .cds-header__tools-links :global(.docs-header-control) {
    background: var(--cds-raised);
    border-color: var(--cds-border);
    border-radius: var(--cds-radius);
    color: var(--cds-heading);
    font-family: inherit;
  }

  .cds-header__tools-links :global(.docs-header-control:hover),
  .cds-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--cds-raised);
    border-color: var(--cds-gold);
    color: var(--cds-gold-hover);
    box-shadow: none;
  }

  /* Recherche : loupe OR compacte (pilule, branchée sur la palette docs). */
  .cds-search-btn {
    align-items: center;
    background: var(--cds-gold);
    border: 1px solid var(--cds-gold);
    border-radius: var(--cds-radius);
    color: #1a1306;
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease;
    width: 2.5rem;
  }

  .cds-search-btn:hover,
  .cds-search-btn:focus-visible {
    background: var(--cds-gold-hover);
    border-color: var(--cds-gold-hover);
    outline: 2px solid var(--cds-focus);
    outline-offset: 1px;
  }

  /* CTA or (signature du Cirque du Soleil, pilule arrondie). */
  .cds-cta {
    align-items: center;
    background: var(--cds-gold);
    border: 1px solid var(--cds-gold);
    border-radius: var(--cds-radius-cta);
    color: #1a1306;
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.8125rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.06em;
    padding: 0 1.375rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .cds-cta:hover,
  .cds-cta:focus-visible {
    background: var(--cds-gold-hover);
    border-color: var(--cds-gold-hover);
    color: #1a1306;
    outline: none;
  }

  /* Burger mobile */
  .cds-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--cds-gold);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Cirque du Soleil ── */
  .cds-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--cds-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Cirque du Soleil ── */
  .cds-sidebar {
    background: var(--cds-stage);
    border-right: 1px solid var(--cds-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.75rem);
    position: sticky;
    top: 4.75rem;
  }

  .cds-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .cds-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--cds-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .cds-version-badge {
    background: var(--cds-panel);
    border: 1px solid var(--cds-border);
    border-radius: var(--cds-radius);
    color: var(--cds-gold);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.6rem;
    white-space: nowrap;
  }

  .cds-sidebar-github {
    align-items: center;
    color: var(--cds-body);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .cds-sidebar-github:hover,
  .cds-sidebar-github:focus-visible {
    color: var(--cds-gold-hover);
  }

  .cds-side-list,
  .cds-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cds-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--cds-body);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .cds-side-link:hover,
  .cds-side-link:focus-visible {
    background: var(--cds-panel);
    color: var(--cds-heading);
    text-decoration: none;
  }

  .cds-side-link[aria-current="page"] {
    background: var(--cds-panel);
    border-left-color: var(--cds-gold);
    color: var(--cds-gold);
    font-weight: 700;
    text-decoration: none;
  }

  .cds-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .cds-side-divider {
    border-top: 1px solid var(--cds-border);
    margin: 0.5rem 0;
  }

  .cds-side-group {
    display: block;
  }

  .cds-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--cds-grey);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 700;
    gap: 0.35rem;
    letter-spacing: 0.08em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 1rem 0 calc(1rem - 3px);
    text-transform: uppercase;
    transition: background 120ms ease;
  }

  .cds-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .cds-side-group__summary:hover,
  .cds-side-group__summary:focus-visible {
    background: var(--cds-panel);
    outline: none;
  }

  .cds-side-group :global(.cds-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .cds-side-group:not([open]) :global(.cds-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .cds-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .cds-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .cds-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cds-breadcrumb__item {
    align-items: center;
    color: var(--cds-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .cds-breadcrumb__item + .cds-breadcrumb__item::before {
    color: var(--cds-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .cds-breadcrumb__link {
    color: var(--cds-gold);
    text-decoration: none;
  }

  .cds-breadcrumb__link:hover {
    color: var(--cds-gold-hover);
    text-decoration: underline;
  }

  .cds-breadcrumb__item span[aria-current="page"] {
    color: var(--cds-heading);
    font-weight: 600;
  }

  /* ── Footer Cirque du Soleil ── */
  .cds-footer {
    background: var(--cds-stage);
    border-top: 1px solid var(--cds-border);
    margin-top: auto;
  }

  .cds-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .cds-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .cds-footer__link {
    color: var(--cds-body);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .cds-footer__link:hover {
    color: var(--cds-gold-hover);
    text-decoration: underline;
  }

  /* Logo footer (porte déjà ses couleurs → pas de filtre). */
  .cds-footer__logo {
    display: block;
    width: auto;
    height: 28px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .cds-body {
      grid-template-columns: 1fr;
    }

    .cds-sidebar {
      display: none;
    }

    .cds-nav {
      display: none;
    }

    /* Mobile : burger à gauche, loupe à droite ; on masque les autres outils. */
    .cds-header__tools-links,
    .cds-cta {
      display: none;
    }

    .cds-header__burger {
      display: inline-flex;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .cds-nav__link,
    .cds-cta,
    .cds-search-btn,
    .cds-side-link,
    .cds-side-group :global(.cds-side-group__icon) {
      transition: none;
    }
  }
</style>

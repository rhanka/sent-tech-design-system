<!--
  Chrome documentaire Moment Factory (momentfactory.com) — studio immersif montréalais.
  Forme fidèle à l'en-tête réel de momentfactory.com :
  - Header : bandeau NOIR (#000), wordmark officiel « MOMENT FACTORY » BLANC à gauche,
    nav horizontale MAJUSCULES blanche au centre, CTA JAUNE ÉLECTRIQUE à droite
    (texte noir, carré — radius 0)
  - Tout le shell est SOMBRE (surfaces noires, texte clair) — inversion du
    ChromeCanada clair vers le sombre, dans l'esprit du ChromeUbisoft
  - Barre latérale gauche sombre : item actif accent jaune + fond surélevé, sous-items indentés
  - Onglet de nav actif : SOULIGNÉ jaune
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande sombre avec liens + wordmark blanc
  - Couleurs mesurées : jaune électrique #ffea00 (primaire/accent), noir #000
    (surface.default), surélevé #191a1a, titres blancs #f9f9f9, corps gris #c8c8c8,
    secondaire #8c8c8c, bordure #2a2a2a, danger #ec091a ; radius 0 (carré)
  - Logo officiel Moment Factory : asset « Moment-Factory-Logo-BLANC-CMYK-trimmed.png »
    (Shopify CDN /cdn/shop/files), variante BLANCHE officielle (marques blanches, fond
    transparent), encapsulé en SVG via <image> base64 → référencé par <img src=".../logo.svg">.
    Déjà blanc → AUCUN filtre invert nécessaire ; il s'affiche blanc directement sur le noir.
  - Typo : « Calibre » (propriétaire) indisponible → repli sur 'Inter', system-ui ;
    Inter chargée via Google Fonts dans <svelte:head>
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
  <!-- « Calibre » (police propriétaire) indisponible → Inter, repli sans-serif neutre. -->
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
  />
</svelte:head>

<div class="mf-shell">
  <!-- ── HEADER Moment Factory ── -->
  <div class="mf-header-wrap">
    <header class="mf-header" aria-label="Moment Factory">
      <div class="mf-header__inner">
        <!-- Gauche : wordmark officiel blanc -->
        <div class="mf-header__brand">
          <a href="/" class="mf-header__brand-link" aria-label="Accueil : Moment Factory Design System">
            <img
              src="/chrome/moment-factory/logo.svg"
              alt="Moment Factory"
              class="mf-logo"
              width="118"
              height="50"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale MAJUSCULES -->
        <nav class="mf-nav" aria-label="Navigation principale">
          <ul class="mf-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="mf-nav__item">
                <a
                  class="mf-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </nav>

        <!-- Droite : outils + recherche + CTA jaune -->
        <div class="mf-header__tools">
          <!-- Recherche Moment Factory : bouton loupe compact (champ sombre surélevé, palette docs). -->
          <button
            type="button"
            class="mf-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="mf-header__tools-links">
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
          class="mf-header__burger"
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

  <!-- ── BODY Moment Factory ── -->
  <div class="mf-body">
    <!-- Sidebar -->
    <aside class="mf-sidebar" aria-label="Navigation de la documentation">
      <nav class="mf-side-nav" aria-label="Sommaire">
        <ul class="mf-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="mf-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="mf-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="mf-side-group" open={isGroupOpen(group.items)}>
                <summary class="mf-side-group__summary">
                  <ChevronDown class="mf-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="mf-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="mf-side-link mf-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="mf-side-divider" role="separator"></li>

          <li>
            <a
              class="mf-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="mf-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="mf-side-group__summary">
                  <ChevronDown class="mf-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="mf-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="mf-side-link mf-side-link--sub"
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
      <div class="mf-sidebar-footer">
        <span class="mf-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="mf-sidebar-github"
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
    <div class="mf-content">
      <nav class="mf-breadcrumb" aria-label="Breadcrumb">
        <ol class="mf-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="mf-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="mf-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Moment Factory : wordmark blanc ── -->
  <footer class="mf-footer" aria-label="Pied de page Moment Factory">
    <div class="mf-footer__inner">
      <nav class="mf-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="mf-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/moment-factory/logo.svg"
        alt="Moment Factory"
        class="mf-footer__logo"
        width="85"
        height="36"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Moment Factory ── */
  .mf-shell {
    --mf-yellow: #ffea00; /* jaune électrique (primaire/accent) */
    --mf-yellow-soft: #fff35c; /* jaune survol clair */
    --mf-stage: #000; /* noir stage (surface.default) */
    --mf-raised: #191a1a; /* surface surélevée */
    --mf-heading: #f9f9f9; /* texte titres */
    --mf-body: #c8c8c8; /* texte corps gris */
    --mf-grey: #8c8c8c; /* texte secondaire / placeholder */
    --mf-border: #2a2a2a; /* bordure sombre */
    --mf-danger: #ec091a; /* danger */
    --mf-white: #fff;
    --mf-sidebar-width: 17rem;
    --mf-radius: 0; /* carré — radius 0 */
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--mf-stage);
    color: var(--mf-body);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Moment Factory ── */
  .mf-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .mf-header {
    background: var(--mf-stage);
    border-bottom: 1px solid var(--mf-border);
  }

  .mf-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .mf-header__brand {
    flex: 0 0 auto;
  }

  .mf-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .mf-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Wordmark officiel Moment Factory (variante BLANCHE officielle, déjà blanc). */
  .mf-logo {
    display: block;
    width: auto;
    height: 50px;
  }

  /* ── Nav horizontale (centre, MAJUSCULES) ── */
  .mf-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .mf-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .mf-nav__item {
    flex: 0 0 auto;
  }

  .mf-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--mf-white);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 700;
    gap: 0.3rem;
    letter-spacing: 0.05em;
    min-height: 2.5rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: color 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .mf-nav__link:hover,
  .mf-nav__link:focus-visible {
    color: var(--mf-yellow);
    outline: none;
  }

  .mf-nav__link[aria-current="page"] {
    border-bottom-color: var(--mf-yellow);
    color: var(--mf-yellow);
  }

  /* ── Outils droite ── */
  .mf-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .mf-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Moment Factory (champs sombres surélevés, carrés). */
  .mf-header__tools-links :global(.docs-header-control) {
    background: var(--mf-raised);
    border-color: var(--mf-border);
    border-radius: var(--mf-radius);
    color: var(--mf-heading);
    font-family: inherit;
  }

  .mf-header__tools-links :global(.docs-header-control:hover),
  .mf-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--mf-raised);
    border-color: var(--mf-yellow);
    color: var(--mf-yellow);
    box-shadow: none;
  }

  /* Recherche Moment Factory : bouton loupe carré compact (champ sombre surélevé, radius 0). */
  .mf-search__btn {
    align-items: center;
    background: var(--mf-raised);
    border: 1px solid var(--mf-border);
    border-radius: var(--mf-radius);
    color: var(--mf-heading);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .mf-search__btn:hover,
  .mf-search__btn:focus-visible {
    background: var(--mf-raised);
    border-color: var(--mf-yellow);
    color: var(--mf-yellow);
    outline: none;
  }

  /* CTA jaune électrique (texte noir, carré) : signature Moment Factory. */
  .mf-cta {
    align-items: center;
    background: var(--mf-yellow);
    border: 1px solid var(--mf-yellow);
    border-radius: var(--mf-radius);
    color: #000;
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.8125rem;
    font-weight: 800;
    height: 2.5rem;
    letter-spacing: 0.05em;
    padding: 0 1.25rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .mf-cta:hover,
  .mf-cta:focus-visible {
    background: var(--mf-yellow-soft);
    border-color: var(--mf-yellow-soft);
    color: #000;
    outline: none;
  }

  /* Burger mobile */
  .mf-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--mf-white);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Moment Factory ── */
  .mf-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--mf-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Moment Factory ── */
  .mf-sidebar {
    background: var(--mf-stage);
    border-right: 1px solid var(--mf-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .mf-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .mf-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--mf-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .mf-version-badge {
    background: var(--mf-raised);
    border: 1px solid var(--mf-border);
    border-radius: var(--mf-radius);
    color: var(--mf-yellow);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .mf-sidebar-github {
    align-items: center;
    color: var(--mf-body);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .mf-sidebar-github:hover,
  .mf-sidebar-github:focus-visible {
    color: var(--mf-yellow);
  }

  .mf-side-list,
  .mf-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .mf-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--mf-body);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .mf-side-link:hover,
  .mf-side-link:focus-visible {
    background: var(--mf-raised);
    color: var(--mf-heading);
    text-decoration: none;
  }

  .mf-side-link[aria-current="page"] {
    background: var(--mf-raised);
    border-left-color: var(--mf-yellow);
    color: var(--mf-yellow);
    font-weight: 700;
    text-decoration: none;
  }

  .mf-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .mf-side-divider {
    border-top: 1px solid var(--mf-border);
    margin: 0.5rem 0;
  }

  .mf-side-group {
    display: block;
  }

  .mf-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--mf-grey);
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

  .mf-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .mf-side-group__summary:hover,
  .mf-side-group__summary:focus-visible {
    background: var(--mf-raised);
    outline: none;
  }

  .mf-side-group :global(.mf-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .mf-side-group:not([open]) :global(.mf-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .mf-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .mf-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .mf-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .mf-breadcrumb__item {
    align-items: center;
    color: var(--mf-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .mf-breadcrumb__item + .mf-breadcrumb__item::before {
    color: var(--mf-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .mf-breadcrumb__link {
    color: var(--mf-yellow);
    text-decoration: none;
  }

  .mf-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .mf-breadcrumb__item span[aria-current="page"] {
    color: var(--mf-heading);
    font-weight: 600;
  }

  /* ── Footer Moment Factory ── */
  .mf-footer {
    background: var(--mf-stage);
    border-top: 1px solid var(--mf-border);
    margin-top: auto;
  }

  .mf-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .mf-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .mf-footer__link {
    color: var(--mf-body);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .mf-footer__link:hover {
    color: var(--mf-yellow);
    text-decoration: underline;
  }

  /* Wordmark footer (variante blanche officielle, déjà blanc). */
  .mf-footer__logo {
    display: block;
    width: auto;
    height: 36px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .mf-body {
      grid-template-columns: 1fr;
    }

    .mf-sidebar {
      display: none;
    }

    .mf-nav {
      display: none;
    }

    .mf-header__tools {
      display: none;
    }

    .mf-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .mf-nav__link,
    .mf-cta,
    .mf-search__btn,
    .mf-side-link,
    .mf-side-group :global(.mf-side-group__icon) {
      transition: none;
    }
  }
</style>

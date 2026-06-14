<!--
  Chrome documentaire Desjardins (desjardins.com).
  Forme fidèle à l'en-tête réel de Desjardins :
  - Header : barre BLANCHE nette, logo vert Desjardins à gauche (posé sur une tuile verte
    car l'asset officiel est monochrome blanc), nav horizontale principale,
    recherche + outils à droite, accents vert signature
  - Onglet de nav actif : SOULIGNÉ vert ; item de barre latérale actif : accent vert à gauche
    + fond vert très pâle
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande grise avec liens + logo Desjardins (sur tuile verte)
  - Couleurs MESURÉES : vert #00874e (primaire, hover #007142, active #00673b, dark #055b37),
    encre #2f2f2f, texte secondaire #6c6c6c, surfaces blanches, gris page #f4f4f4,
    bordure #d0d0d0 / forte #767676, lien bleu #025aba, anneau de focus bleu #0061cb
    (volontairement bleu, visible sur le vert), radius doux 4px, danger #ca241a
  - Logo officiel Desjardins (vecteur monochrome blanc) référencé via
    <img src="/chrome/desjardins/logo.svg"> sur fond vert
  - Typo : « Desjardins Sans » est propriétaire → repli sur 'Open Sans', system-ui, sans-serif,
    chargée via Google Fonts dans <svelte:head>
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
  <!-- « Desjardins Sans » (police propriétaire Desjardins) indisponible → Open Sans, repli proche. -->
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap"
  />
</svelte:head>

<div class="dsj-shell">
  <!-- ── HEADER Desjardins ── -->
  <div class="dsj-header-wrap">
    <header class="dsj-header" aria-label="Desjardins">
      <div class="dsj-header__inner">
        <!-- Gauche : logo officiel Desjardins (monochrome blanc → posé sur tuile verte) -->
        <div class="dsj-header__brand">
          <a href="/" class="dsj-header__brand-link" aria-label="Accueil : Desjardins Design System">
            <img
              src="/chrome/desjardins/logo.svg"
              alt="Desjardins"
              class="dsj-logo"
              width="151"
              height="31"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale principale (onglets soulignés vert) -->
        <nav class="dsj-nav" aria-label="Navigation principale">
          <ul class="dsj-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="dsj-nav__item">
                <a
                  class="dsj-nav__link"
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
        <div class="dsj-header__tools">
          <!-- Recherche Desjardins : bouton loupe blanc compact (palette docs). -->
          <button
            type="button"
            class="dsj-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="dsj-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="dsj-header__burger"
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

  <!-- ── BODY Desjardins ── -->
  <div class="dsj-body">
    <!-- Sidebar -->
    <aside class="dsj-sidebar" aria-label="Navigation de la documentation">
      <nav class="dsj-side-nav" aria-label="Sommaire">
        <ul class="dsj-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="dsj-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="dsj-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="dsj-side-group" open={isGroupOpen(group.items)}>
                <summary class="dsj-side-group__summary">
                  <ChevronDown class="dsj-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="dsj-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="dsj-side-link dsj-side-link--sub"
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
      <div class="dsj-sidebar-footer">
        <span class="dsj-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="dsj-sidebar-github"
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
    <div class="dsj-content">
      <nav class="dsj-breadcrumb" aria-label="Breadcrumb">
        <ol class="dsj-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="dsj-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="dsj-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Desjardins ── -->
  <footer class="dsj-footer" aria-label="Pied de page Desjardins">
    <div class="dsj-footer__inner">
      <nav class="dsj-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="dsj-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <span class="dsj-logo-tile dsj-logo-tile--footer">
        <img
          src="/chrome/desjardins/logo.svg"
          alt="Desjardins"
          class="dsj-footer__logo"
          width="151"
          height="31"
        />
      </span>
    </div>
  </footer>
</div>

<style>
  /* ── Variables Desjardins (mesurées sur desjardins.com) ── */
  .dsj-shell {
    --dsj-green: #00874e; /* vert primaire Desjardins */
    --dsj-green-hover: #007142; /* survol */
    --dsj-green-active: #00673b; /* actif */
    --dsj-green-dark: #055b37; /* vert foncé */
    --dsj-green-tint: #e6f2ec; /* vert très pâle (fond item actif) */
    --dsj-ink: #2f2f2f; /* encre / texte principal */
    --dsj-grey-text2: #6c6c6c; /* texte secondaire */
    --dsj-grey-50: #f4f4f4; /* gris page */
    --dsj-border: #d0d0d0; /* bordure */
    --dsj-border-strong: #767676; /* bordure forte */
    --dsj-link: #025aba; /* lien bleu */
    --dsj-focus: #0061cb; /* anneau de focus bleu (visible sur le vert) */
    --dsj-danger: #ca241a; /* danger */
    --dsj-white: #fff;
    --dsj-sidebar-width: 17rem;
    --dsj-radius: 4px; /* radius doux */
    font-family: 'Open Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--dsj-white);
    color: var(--dsj-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Desjardins ── */
  .dsj-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .dsj-header {
    background: var(--dsj-green);
    border-bottom: 1px solid var(--dsj-green-dark);
  }

  .dsj-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 80rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .dsj-header__brand {
    flex: 0 0 auto;
  }

  .dsj-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .dsj-header__brand-link:hover {
    opacity: 0.9;
  }

  /* Tuile verte sous le logo (asset officiel monochrome blanc → posé sur fond vert). */
  .dsj-logo-tile {
    align-items: center;
    background: var(--dsj-green);
    border-radius: var(--dsj-radius);
    display: inline-flex;
    justify-content: center;
    padding: 0.4rem 0.6rem;
  }

  /* Logo officiel Desjardins (ratio préservé, hauteur ~24px comme l'en-tête réel). */
  .dsj-logo {
    display: block;
    width: auto;
    height: 24px;
  }

  /* ── Nav horizontale (centre, onglets soulignés vert) ── */
  .dsj-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .dsj-nav__list {
    align-items: center;
    display: flex;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .dsj-nav__item {
    flex: 0 0 auto;
  }

  .dsj-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--dsj-white);
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

  .dsj-nav__link:hover,
  .dsj-nav__link:focus-visible {
    background: rgba(255, 255, 255, 0.14);
    color: var(--dsj-white);
    outline: none;
  }

  .dsj-nav__link[aria-current="page"] {
    border-bottom-color: var(--dsj-white);
    color: var(--dsj-white);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .dsj-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .dsj-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Desjardins (champs blancs, bordure forte). */
  .dsj-header__tools-links :global(.docs-header-control) {
    background: transparent;
    border-color: rgba(255, 255, 255, 0.5);
    border-radius: var(--dsj-radius);
    color: var(--dsj-white);
    font-family: inherit;
  }

  .dsj-header__tools-links :global(.docs-header-control:hover),
  .dsj-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--dsj-grey-50);
    border-color: var(--dsj-green);
    color: var(--dsj-green);
    box-shadow: none;
  }

  /* Recherche Desjardins : bouton loupe blanc compact (sur la barre verte). */
  .dsj-search__btn {
    align-items: center;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: var(--dsj-radius);
    color: var(--dsj-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease;
  }

  .dsj-search__btn:hover,
  .dsj-search__btn:focus-visible {
    background: rgba(255, 255, 255, 0.16);
    border-color: var(--dsj-white);
    outline: 2px solid var(--dsj-white);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .dsj-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--dsj-white);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Desjardins ── */
  .dsj-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--dsj-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 80rem;
    width: 100%;
  }

  /* ── Sidebar Desjardins ── */
  .dsj-sidebar {
    background: var(--dsj-white);
    border-right: 1px solid var(--dsj-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .dsj-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .dsj-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--dsj-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .dsj-version-badge {
    background: var(--dsj-grey-50);
    border: 1px solid var(--dsj-border);
    border-radius: var(--dsj-radius);
    color: var(--dsj-green);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .dsj-sidebar-github {
    align-items: center;
    color: var(--dsj-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .dsj-sidebar-github:hover,
  .dsj-sidebar-github:focus-visible {
    color: var(--dsj-green);
  }

  .dsj-side-list,
  .dsj-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .dsj-side-link {
    align-items: center;
    border-left: 4px solid transparent;
    box-sizing: border-box;
    color: var(--dsj-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 4px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .dsj-side-link:hover,
  .dsj-side-link:focus-visible {
    background: var(--dsj-grey-50);
    color: var(--dsj-green);
    text-decoration: none;
  }

  .dsj-side-link[aria-current="page"] {
    background: var(--dsj-green-tint);
    border-left-color: var(--dsj-green);
    color: var(--dsj-green-dark);
    font-weight: 700;
    text-decoration: none;
  }

  .dsj-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 4px);
  }

  .dsj-side-divider {
    border-top: 1px solid var(--dsj-border);
    margin: 0.5rem 0;
  }

  .dsj-side-group {
    display: block;
  }

  .dsj-side-group__summary {
    align-items: center;
    border-left: 4px solid transparent;
    color: var(--dsj-grey-text2);
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

  .dsj-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .dsj-side-group__summary:hover,
  .dsj-side-group__summary:focus-visible {
    background: var(--dsj-grey-50);
    outline: none;
  }

  .dsj-side-group :global(.dsj-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .dsj-side-group:not([open]) :global(.dsj-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .dsj-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .dsj-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .dsj-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .dsj-breadcrumb__item {
    align-items: center;
    color: var(--dsj-grey-text2);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .dsj-breadcrumb__item + .dsj-breadcrumb__item::before {
    color: var(--dsj-grey-text2);
    content: "›";
    margin: 0 0.4rem;
  }

  .dsj-breadcrumb__link {
    color: var(--dsj-link);
    text-decoration: underline;
  }

  .dsj-breadcrumb__link:hover {
    color: var(--dsj-green);
  }

  .dsj-breadcrumb__item span[aria-current="page"] {
    color: var(--dsj-ink);
    font-weight: 600;
  }

  /* ── Footer Desjardins ── */
  .dsj-footer {
    background: var(--dsj-grey-50);
    border-top: 1px solid var(--dsj-border);
    margin-top: auto;
  }

  .dsj-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 80rem;
    padding: 1.5rem;
  }

  .dsj-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .dsj-footer__link {
    color: var(--dsj-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .dsj-footer__link:hover {
    color: var(--dsj-green);
    text-decoration: underline;
  }

  .dsj-logo-tile--footer {
    padding: 0.45rem 0.7rem;
  }

  .dsj-footer__logo {
    display: block;
    width: auto;
    height: 24px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .dsj-body {
      grid-template-columns: 1fr;
    }

    .dsj-sidebar {
      display: none;
    }

    .dsj-nav {
      display: none;
    }

    .dsj-header__tools {
      display: none;
    }

    .dsj-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .dsj-nav__link,
    .dsj-search__btn,
    .dsj-side-link,
    .dsj-side-group :global(.dsj-side-group__icon) {
      transition: none;
    }
  }
</style>

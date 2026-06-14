<!--
  Chrome documentaire SSENSE (ssense.com — luxe / mode, Montréal).
  Forme fidèle à l'esthétique signature ULTRA-MINIMALE de SSENSE :
  - Header : fond BLANC pur #fff, fine ligne 1px #e2e2e2 en bas, wordmark
    typographique « SSENSE » (le logo officiel EST le mot, aucune icône) à gauche,
    nav horizontale TRÈS sobre en capitales espacées, beaucoup de blanc
  - Coins parfaitement CARRÉS (radius 0 partout), aucune couleur hors noir/blanc/gris
  - Texte/contrôles noir pur #000 sur blanc #fff, gris secondaire #5c5f62
  - Boutons carrés (noir plein texte blanc, ou contour noir 1px)
  - Champ de recherche : boîte fine carrée à liseré noir
  - États actifs = fin soulignement / bord noir, jamais de couleur
  - Wordmark rendu en texte stylé (capitales, weight 600, letter-spacing 0.12em,
    #000) — c'est le logo authentique, aucun SVG nécessaire
  - Typo : 'Helvetica Neue', Arial, sans-serif (face proche d'Helvetica, comme SSENSE),
    aucune police Google requise
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

<div class="ssn-shell">
  <!-- ── HEADER SSENSE ── -->
  <div class="ssn-header-wrap">
    <header class="ssn-header" aria-label="SSENSE">
      <div class="ssn-header__inner">
        <!-- Gauche : wordmark typographique « SSENSE » (le logo EST le mot, aucune icône) -->
        <div class="ssn-header__brand">
          <a href="/" class="ssn-header__brand-link" aria-label="Accueil : SSENSE Design System">
            <span class="ssn-wordmark">SSENSE</span>
          </a>
        </div>

        <!-- Centre : nav horizontale sobre, capitales espacées -->
        <nav class="ssn-nav" aria-label="Navigation principale">
          <ul class="ssn-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="ssn-nav__item">
                <a
                  class="ssn-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </nav>

        <!-- Droite : recherche + outils + CTA carré noir -->
        <div class="ssn-header__tools">
          <!-- Barre de recherche SSENSE : boîte carrée à liseré noir, branchée sur la palette docs. -->
          <div class="ssn-search" role="search">
            <label class="ssn-search__label" for="ssn-search-input">
              {locale.value === "fr" ? "Rechercher" : "Search"}
            </label>
            <div class="ssn-search__group">
              <input
                id="ssn-search-input"
                class="ssn-search__input"
                type="search"
                readonly
                placeholder={locale.value === "fr" ? "Rechercher…" : "Search…"}
                aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
                aria-haspopup="dialog"
                onclick={onSearchOpen}
                onkeydown={handleSearchKeydown}
              />
              <kbd class="ssn-search__kbd" aria-hidden="true">/</kbd>
              <button
                type="button"
                class="ssn-search__btn"
                aria-label={locale.value === "fr" ? "Lancer la recherche" : "Open search"}
                aria-haspopup="dialog"
                onclick={onSearchOpen}
              >
                <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="ssn-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA carré noir plein (radius 0) : signature SSENSE -->
          <a class="ssn-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="ssn-header__burger"
          onclick={onMobileMenuToggle}
          aria-expanded={mobileMenuOpen}
          aria-label="Menu"
        >
          {#if mobileMenuOpen}
            <X size={20} strokeWidth={1.6} aria-hidden="true" />
          {:else}
            <Menu size={20} strokeWidth={1.6} aria-hidden="true" />
          {/if}
        </button>
      </div>
    </header>
  </div>

  <!-- ── BODY SSENSE ── -->
  <div class="ssn-body">
    <!-- Sidebar -->
    <aside class="ssn-sidebar" aria-label="Navigation de la documentation">
      <nav class="ssn-side-nav" aria-label="Sommaire">
        <ul class="ssn-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="ssn-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="ssn-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="ssn-side-group" open={isGroupOpen(group.items)}>
                <summary class="ssn-side-group__summary">
                  <ChevronDown class="ssn-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="ssn-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="ssn-side-link ssn-side-link--sub"
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
      <div class="ssn-sidebar-footer">
        <span class="ssn-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="ssn-sidebar-github"
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
    <div class="ssn-content">
      <nav class="ssn-breadcrumb" aria-label="Breadcrumb">
        <ol class="ssn-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="ssn-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="ssn-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER SSENSE : wordmark typographique ── -->
  <footer class="ssn-footer" aria-label="Pied de page SSENSE">
    <div class="ssn-footer__inner">
      <nav class="ssn-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="ssn-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <span class="ssn-wordmark ssn-wordmark--footer">SSENSE</span>
    </div>
  </footer>
</div>

<style>
  /* ── Variables SSENSE (noir / blanc / gris uniquement) ── */
  .ssn-shell {
    --ssn-ink: #000; /* noir pur : texte, contrôles, CTA */
    --ssn-white: #fff; /* blanc pur : surfaces */
    --ssn-grey: #5c5f62; /* gris secondaire */
    --ssn-grey-soft: #8a8d8f; /* gris atténué (placeholder, kbd) */
    --ssn-hairline: #e2e2e2; /* liseré fin 1px */
    --ssn-subtle: #f5f5f5; /* survol très léger */
    --ssn-sidebar-width: 17rem;
    /* radius 0 partout : coins parfaitement carrés (signature SSENSE) */
    font-family: 'Helvetica Neue', Arial, sans-serif;
    background: var(--ssn-white);
    color: var(--ssn-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Wordmark typographique « SSENSE » (logo authentique, aucune icône) ── */
  .ssn-wordmark {
    color: var(--ssn-ink);
    display: inline-block;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 1.375rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    line-height: 1;
    text-transform: uppercase;
  }

  .ssn-wordmark--footer {
    font-size: 1.125rem;
  }

  /* ── Header SSENSE ── */
  .ssn-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .ssn-header {
    background: var(--ssn-white);
    border-bottom: 1px solid var(--ssn-hairline);
  }

  .ssn-header__inner {
    align-items: center;
    display: flex;
    gap: 2rem;
    margin: 0 auto;
    max-width: 84rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.75rem;
  }

  .ssn-header__brand {
    flex: 0 0 auto;
  }

  .ssn-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .ssn-header__brand-link:hover {
    opacity: 0.7;
  }

  /* ── Nav horizontale (centre) : capitales espacées, très sobre ── */
  .ssn-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .ssn-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    justify-content: center;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ssn-nav__item {
    flex: 0 0 auto;
  }

  .ssn-nav__link {
    align-items: center;
    border-bottom: 1px solid transparent;
    color: var(--ssn-ink);
    display: inline-flex;
    font-size: 0.75rem;
    font-weight: 500;
    gap: 0.3rem;
    letter-spacing: 0.1em;
    min-height: 2.5rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: border-color 120ms ease, color 120ms ease;
    white-space: nowrap;
  }

  .ssn-nav__link:hover,
  .ssn-nav__link:focus-visible {
    border-bottom-color: var(--ssn-ink);
    color: var(--ssn-ink);
    outline: none;
  }

  .ssn-nav__link[aria-current="page"] {
    border-bottom-color: var(--ssn-ink);
    color: var(--ssn-ink);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .ssn-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .ssn-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header SSENSE (champs blancs carrés, liseré noir 1px). */
  .ssn-header__tools-links :global(.docs-header-control) {
    background: var(--ssn-white);
    border-color: var(--ssn-ink);
    border-radius: 0;
    color: var(--ssn-ink);
    font-family: inherit;
  }

  .ssn-header__tools-links :global(.docs-header-control:hover),
  .ssn-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--ssn-ink);
    border-color: var(--ssn-ink);
    color: var(--ssn-white);
    box-shadow: none;
  }

  /* Barre de recherche SSENSE (boîte carrée à liseré noir). */
  .ssn-search {
    width: clamp(11rem, 18vw, 18rem);
  }

  .ssn-search__label {
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

  .ssn-search__group {
    display: flex;
    position: relative;
    width: 100%;
  }

  .ssn-search__input {
    background: var(--ssn-white);
    border: 1px solid var(--ssn-ink);
    border-right: 0;
    border-radius: 0;
    color: var(--ssn-ink);
    cursor: pointer;
    flex: 1 1 auto;
    font-family: inherit;
    font-size: 0.8125rem;
    height: 2.5rem;
    letter-spacing: 0.04em;
    min-width: 0;
    padding: 0 2.125rem 0 0.75rem;
  }

  .ssn-search__input:hover,
  .ssn-search__input:focus-visible {
    background: var(--ssn-white);
    border-color: var(--ssn-ink);
    color: var(--ssn-ink);
    outline: 2px solid var(--ssn-ink);
    outline-offset: 1px;
  }

  .ssn-search__input::placeholder {
    color: var(--ssn-grey-soft);
  }

  .ssn-search__kbd {
    align-items: center;
    border: 1px solid var(--ssn-grey-soft);
    border-radius: 0;
    color: var(--ssn-grey);
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

  .ssn-search__btn {
    align-items: center;
    background: var(--ssn-ink);
    border: 1px solid var(--ssn-ink);
    border-radius: 0;
    color: var(--ssn-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, color 120ms ease;
  }

  .ssn-search__btn:hover,
  .ssn-search__btn:focus-visible {
    background: var(--ssn-white);
    border-color: var(--ssn-ink);
    color: var(--ssn-ink);
    outline: 2px solid var(--ssn-ink);
    outline-offset: 1px;
  }

  /* CTA carré noir plein (radius 0) : signature SSENSE. */
  .ssn-cta {
    align-items: center;
    background: var(--ssn-ink);
    border: 1px solid var(--ssn-ink);
    border-radius: 0;
    color: var(--ssn-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.75rem;
    font-weight: 600;
    height: 2.5rem;
    letter-spacing: 0.1em;
    padding: 0 1.25rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: background 120ms ease, color 120ms ease;
    white-space: nowrap;
  }

  .ssn-cta:hover,
  .ssn-cta:focus-visible {
    background: var(--ssn-white);
    border-color: var(--ssn-ink);
    color: var(--ssn-ink);
    outline: none;
  }

  /* Burger mobile */
  .ssn-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--ssn-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body SSENSE ── */
  .ssn-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--ssn-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 84rem;
    width: 100%;
  }

  /* ── Sidebar SSENSE ── */
  .ssn-sidebar {
    background: var(--ssn-white);
    border-right: 1px solid var(--ssn-hairline);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .ssn-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .ssn-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--ssn-hairline);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .ssn-version-badge {
    background: var(--ssn-white);
    border: 1px solid var(--ssn-ink);
    border-radius: 0;
    color: var(--ssn-ink);
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .ssn-sidebar-github {
    align-items: center;
    color: var(--ssn-grey);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .ssn-sidebar-github:hover,
  .ssn-sidebar-github:focus-visible {
    color: var(--ssn-ink);
  }

  .ssn-side-list,
  .ssn-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ssn-side-link {
    align-items: center;
    border-left: 2px solid transparent;
    box-sizing: border-box;
    color: var(--ssn-grey);
    display: flex;
    font-size: 0.8125rem;
    letter-spacing: 0.02em;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 2px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .ssn-side-link:hover,
  .ssn-side-link:focus-visible {
    background: var(--ssn-subtle);
    color: var(--ssn-ink);
    text-decoration: none;
  }

  /* État actif = bord noir gauche + texte noir, jamais de couleur. */
  .ssn-side-link[aria-current="page"] {
    background: var(--ssn-white);
    border-left-color: var(--ssn-ink);
    color: var(--ssn-ink);
    font-weight: 700;
    text-decoration: none;
  }

  .ssn-side-link--sub {
    font-size: 0.78rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 2px);
  }

  .ssn-side-divider {
    border-top: 1px solid var(--ssn-hairline);
    margin: 0.5rem 0;
  }

  .ssn-side-group {
    display: block;
  }

  .ssn-side-group__summary {
    align-items: center;
    border-left: 2px solid transparent;
    color: var(--ssn-grey);
    cursor: pointer;
    display: flex;
    font-size: 0.7rem;
    font-weight: 700;
    gap: 0.35rem;
    letter-spacing: 0.1em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 1rem 0 calc(1rem - 2px);
    text-transform: uppercase;
    transition: background 120ms ease;
  }

  .ssn-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .ssn-side-group__summary:hover,
  .ssn-side-group__summary:focus-visible {
    background: var(--ssn-subtle);
    color: var(--ssn-ink);
    outline: none;
  }

  .ssn-side-group :global(.ssn-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .ssn-side-group:not([open]) :global(.ssn-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .ssn-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .ssn-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .ssn-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ssn-breadcrumb__item {
    align-items: center;
    color: var(--ssn-grey);
    display: inline-flex;
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .ssn-breadcrumb__item + .ssn-breadcrumb__item::before {
    color: var(--ssn-grey);
    content: "/";
    margin: 0 0.5rem;
  }

  .ssn-breadcrumb__link {
    color: var(--ssn-grey);
    text-decoration: none;
  }

  .ssn-breadcrumb__link:hover {
    color: var(--ssn-ink);
    text-decoration: underline;
  }

  .ssn-breadcrumb__item span[aria-current="page"] {
    color: var(--ssn-ink);
    font-weight: 600;
  }

  /* ── Footer SSENSE ── */
  .ssn-footer {
    background: var(--ssn-white);
    border-top: 1px solid var(--ssn-hairline);
    margin-top: auto;
  }

  .ssn-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 84rem;
    padding: 1.75rem;
  }

  .ssn-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .ssn-footer__link {
    color: var(--ssn-grey);
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-decoration: none;
    text-transform: uppercase;
  }

  .ssn-footer__link:hover {
    color: var(--ssn-ink);
    text-decoration: underline;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .ssn-body {
      grid-template-columns: 1fr;
    }

    .ssn-sidebar {
      display: none;
    }

    .ssn-nav {
      display: none;
    }

    .ssn-header__tools {
      display: none;
    }

    .ssn-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .ssn-nav__link,
    .ssn-cta,
    .ssn-search__btn,
    .ssn-side-link,
    .ssn-side-group :global(.ssn-side-group__icon) {
      transition: none;
    }
  }
</style>

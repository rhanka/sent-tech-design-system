<!--
  Chrome documentaire Ubisoft (ubisoft.com).
  Forme fidèle à l'en-tête réel d'Ubisoft :
  - Header : bandeau NOIR (#0d0d0d), swirl Ubisoft BLANC à gauche,
    nav horizontale MAJUSCULES en blanc au centre, CTA BLEU à droite
  - Tout le shell est SOMBRE (surfaces noires, texte clair) — inversion du
    ChromeCanada clair vers le sombre
  - Barre latérale gauche sombre : item actif accent bleu + fond surélevé, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande sombre avec liens + swirl blanc
  - Couleurs mesurées : bleu interactif #006ef5 (hover #3da2ff), stage noir #0d0d0d,
    surélevé #1f1f1f, titres #f9f9f9, corps gris #c8c8c8, bordure #2a2a2a,
    danger #cc2828 ; radius 8px
  - Logo officiel Ubisoft (swirl monochrome simple-icons, chemin unique) référencé via
    <img src="/chrome/ubisoft/logo.svg"> et rendu BLANC via filter: brightness(0) invert(1)
  - Typo : « Ubisoft Sans » est propriétaire → repli sur 'Open Sans', system-ui ;
    Open Sans chargée via Google Fonts dans <svelte:head>
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
  <!-- « Ubisoft Sans » (police propriétaire) indisponible → Open Sans, police corps officielle. -->
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap"
  />
</svelte:head>

<div class="ubi-shell">
  <!-- ── HEADER Ubisoft ── -->
  <div class="ubi-header-wrap">
    <header class="ubi-header" aria-label="Ubisoft">
      <div class="ubi-header__inner">
        <!-- Gauche : swirl officiel rendu blanc -->
        <div class="ubi-header__brand">
          <a href="/" class="ubi-header__brand-link" aria-label="Accueil : Ubisoft Design System">
            <img
              src="/chrome/ubisoft/logo.svg"
              alt="Ubisoft"
              class="ubi-logo"
              width="34"
              height="34"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale MAJUSCULES -->
        <nav class="ubi-nav" aria-label="Navigation principale">
          <ul class="ubi-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="ubi-nav__item">
                <a
                  class="ubi-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </nav>

        <!-- Droite : outils + recherche + CTA bleu -->
        <div class="ubi-header__tools">
          <!-- Barre de recherche Ubisoft : champ natif + bouton, branché sur la palette docs. -->
          <div class="ubi-search" role="search">
            <label class="ubi-search__label" for="ubi-search-input">
              {locale.value === "fr" ? "Rechercher" : "Search"}
            </label>
            <div class="ubi-search__group">
              <input
                id="ubi-search-input"
                class="ubi-search__input"
                type="search"
                readonly
                placeholder={locale.value === "fr" ? "Rechercher…" : "Search…"}
                aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
                aria-haspopup="dialog"
                onclick={onSearchOpen}
                onkeydown={handleSearchKeydown}
              />
              <kbd class="ubi-search__kbd" aria-hidden="true">/</kbd>
              <button
                type="button"
                class="ubi-search__btn"
                aria-label={locale.value === "fr" ? "Lancer la recherche" : "Open search"}
                aria-haspopup="dialog"
                onclick={onSearchOpen}
              >
                <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="ubi-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA bleu : signature interactive Ubisoft -->
          <a class="ubi-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="ubi-header__burger"
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

  <!-- ── BODY Ubisoft ── -->
  <div class="ubi-body">
    <!-- Sidebar -->
    <aside class="ubi-sidebar" aria-label="Navigation de la documentation">
      <nav class="ubi-side-nav" aria-label="Sommaire">
        <ul class="ubi-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="ubi-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="ubi-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="ubi-side-group" open={isGroupOpen(group.items)}>
                <summary class="ubi-side-group__summary">
                  <ChevronDown class="ubi-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="ubi-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="ubi-side-link ubi-side-link--sub"
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
      <div class="ubi-sidebar-footer">
        <span class="ubi-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="ubi-sidebar-github"
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
    <div class="ubi-content">
      <nav class="ubi-breadcrumb" aria-label="Breadcrumb">
        <ol class="ubi-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="ubi-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="ubi-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Ubisoft : swirl blanc ── -->
  <footer class="ubi-footer" aria-label="Pied de page Ubisoft">
    <div class="ubi-footer__inner">
      <nav class="ubi-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="ubi-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/ubisoft/logo.svg"
        alt="Ubisoft"
        class="ubi-footer__logo"
        width="30"
        height="30"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Ubisoft ── */
  .ubi-shell {
    --ubi-blue: #006ef5; /* bleu interactif Ubisoft */
    --ubi-blue-hover: #3da2ff; /* bleu survol */
    --ubi-stage: #0d0d0d; /* noir stage (surface.default) */
    --ubi-raised: #1f1f1f; /* surface surélevée */
    --ubi-heading: #f9f9f9; /* texte titres */
    --ubi-body: #c8c8c8; /* texte corps gris */
    --ubi-grey: #8c8c8c; /* texte secondaire / placeholder */
    --ubi-border: #2a2a2a; /* bordure sombre */
    --ubi-danger: #cc2828; /* danger */
    --ubi-white: #fff;
    --ubi-sidebar-width: 17rem;
    --ubi-radius: 8px; /* radius Ubisoft */
    font-family: 'Open Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--ubi-stage);
    color: var(--ubi-body);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Ubisoft ── */
  .ubi-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .ubi-header {
    background: var(--ubi-stage);
    border-bottom: 1px solid var(--ubi-border);
  }

  .ubi-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .ubi-header__brand {
    flex: 0 0 auto;
  }

  .ubi-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .ubi-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Swirl officiel Ubisoft rendu BLANC sur le bandeau noir. */
  .ubi-logo {
    display: block;
    width: auto;
    height: 34px;
    filter: brightness(0) invert(1);
  }

  /* ── Nav horizontale (centre, MAJUSCULES) ── */
  .ubi-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .ubi-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ubi-nav__item {
    flex: 0 0 auto;
  }

  .ubi-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--ubi-white);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 700;
    gap: 0.3rem;
    letter-spacing: 0.04em;
    min-height: 2.5rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: color 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .ubi-nav__link:hover,
  .ubi-nav__link:focus-visible {
    color: var(--ubi-blue-hover);
    outline: none;
  }

  .ubi-nav__link[aria-current="page"] {
    border-bottom-color: var(--ubi-blue);
    color: var(--ubi-blue);
  }

  /* ── Outils droite ── */
  .ubi-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .ubi-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Ubisoft (champs sombres surélevés). */
  .ubi-header__tools-links :global(.docs-header-control) {
    background: var(--ubi-raised);
    border-color: var(--ubi-border);
    border-radius: var(--ubi-radius);
    color: var(--ubi-heading);
    font-family: inherit;
  }

  .ubi-header__tools-links :global(.docs-header-control:hover),
  .ubi-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--ubi-raised);
    border-color: var(--ubi-blue);
    color: var(--ubi-blue-hover);
    box-shadow: none;
  }

  /* Barre de recherche Ubisoft (champ sombre surélevé, conteneur 8px). */
  .ubi-search {
    width: clamp(11rem, 18vw, 18rem);
  }

  .ubi-search__label {
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

  .ubi-search__group {
    display: flex;
    position: relative;
    width: 100%;
  }

  .ubi-search__input {
    background: var(--ubi-raised);
    border: 1px solid var(--ubi-border);
    border-right: 0;
    border-radius: var(--ubi-radius);
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
    color: var(--ubi-heading);
    cursor: pointer;
    flex: 1 1 auto;
    font-family: inherit;
    font-size: 0.875rem;
    height: 2.5rem;
    min-width: 0;
    padding: 0 2.125rem 0 0.75rem;
  }

  .ubi-search__input:hover,
  .ubi-search__input:focus-visible {
    background: var(--ubi-raised);
    border-color: var(--ubi-blue);
    color: var(--ubi-heading);
    outline: 2px solid var(--ubi-blue);
    outline-offset: 1px;
  }

  .ubi-search__input::placeholder {
    color: var(--ubi-grey);
  }

  .ubi-search__kbd {
    align-items: center;
    border: 1px solid var(--ubi-border);
    border-radius: 4px;
    color: var(--ubi-grey);
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

  .ubi-search__btn {
    align-items: center;
    background: var(--ubi-blue);
    border: 1px solid var(--ubi-blue);
    border-radius: 0 var(--ubi-radius) var(--ubi-radius) 0;
    color: var(--ubi-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease;
  }

  .ubi-search__btn:hover,
  .ubi-search__btn:focus-visible {
    background: var(--ubi-blue-hover);
    border-color: var(--ubi-blue-hover);
    outline: 2px solid var(--ubi-blue);
    outline-offset: 1px;
  }

  /* CTA bleu (signature interactive Ubisoft). */
  .ubi-cta {
    align-items: center;
    background: var(--ubi-blue);
    border: 1px solid var(--ubi-blue);
    border-radius: var(--ubi-radius);
    color: var(--ubi-white);
    display: inline-flex;
    flex: 0 0 auto;
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

  .ubi-cta:hover,
  .ubi-cta:focus-visible {
    background: var(--ubi-blue-hover);
    border-color: var(--ubi-blue-hover);
    color: var(--ubi-white);
    outline: none;
  }

  /* Burger mobile */
  .ubi-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--ubi-white);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Ubisoft ── */
  .ubi-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--ubi-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Ubisoft ── */
  .ubi-sidebar {
    background: var(--ubi-stage);
    border-right: 1px solid var(--ubi-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .ubi-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .ubi-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--ubi-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .ubi-version-badge {
    background: var(--ubi-raised);
    border: 1px solid var(--ubi-border);
    border-radius: var(--ubi-radius);
    color: var(--ubi-blue-hover);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .ubi-sidebar-github {
    align-items: center;
    color: var(--ubi-body);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .ubi-sidebar-github:hover,
  .ubi-sidebar-github:focus-visible {
    color: var(--ubi-blue-hover);
  }

  .ubi-side-list,
  .ubi-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ubi-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--ubi-body);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .ubi-side-link:hover,
  .ubi-side-link:focus-visible {
    background: var(--ubi-raised);
    color: var(--ubi-heading);
    text-decoration: none;
  }

  .ubi-side-link[aria-current="page"] {
    background: var(--ubi-raised);
    border-left-color: var(--ubi-blue);
    color: var(--ubi-blue-hover);
    font-weight: 700;
    text-decoration: none;
  }

  .ubi-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .ubi-side-divider {
    border-top: 1px solid var(--ubi-border);
    margin: 0.5rem 0;
  }

  .ubi-side-group {
    display: block;
  }

  .ubi-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--ubi-grey);
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

  .ubi-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .ubi-side-group__summary:hover,
  .ubi-side-group__summary:focus-visible {
    background: var(--ubi-raised);
    outline: none;
  }

  .ubi-side-group :global(.ubi-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .ubi-side-group:not([open]) :global(.ubi-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .ubi-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .ubi-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .ubi-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ubi-breadcrumb__item {
    align-items: center;
    color: var(--ubi-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .ubi-breadcrumb__item + .ubi-breadcrumb__item::before {
    color: var(--ubi-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .ubi-breadcrumb__link {
    color: var(--ubi-blue-hover);
    text-decoration: none;
  }

  .ubi-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .ubi-breadcrumb__item span[aria-current="page"] {
    color: var(--ubi-heading);
    font-weight: 600;
  }

  /* ── Footer Ubisoft ── */
  .ubi-footer {
    background: var(--ubi-stage);
    border-top: 1px solid var(--ubi-border);
    margin-top: auto;
  }

  .ubi-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .ubi-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .ubi-footer__link {
    color: var(--ubi-body);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .ubi-footer__link:hover {
    color: var(--ubi-blue-hover);
    text-decoration: underline;
  }

  /* Swirl footer rendu blanc sur le fond sombre. */
  .ubi-footer__logo {
    display: block;
    width: auto;
    height: 28px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .ubi-body {
      grid-template-columns: 1fr;
    }

    .ubi-sidebar {
      display: none;
    }

    .ubi-nav {
      display: none;
    }

    .ubi-header__tools {
      display: none;
    }

    .ubi-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .ubi-nav__link,
    .ubi-cta,
    .ubi-search__btn,
    .ubi-side-link,
    .ubi-side-group :global(.ubi-side-group__icon) {
      transition: none;
    }
  }
</style>

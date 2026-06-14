<!--
  Chrome documentaire Lightspeed (lightspeedhq.com).
  Forme fidèle à l'en-tête réel de Lightspeed :
  - Header : bandeau BLANC clair, logo flamme rouge + wordmark charcoal à gauche,
    nav horizontale au centre, CTA PILULE ROUGE (radius 999px) à droite
  - Barre latérale gauche : item actif accent rouge + fond subtle, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande claire avec liens + logo
  - Couleurs mesurées : rouge #e81c1c (hover #c7141f), charcoal #191513, encre #000,
    gris #757575, surfaces blanches, subtle #f6f4f3 ; pilules + conteneurs 6px + anneaux gris 1px
  - Logo officiel Lightspeed (vecteur) référencé via <img src="/chrome/lightspeed/logo.svg">
  - Typo : lsRegular est propriétaire → repli sur 'DM Sans' (proche géométrique),
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
  <!-- lsRegular (police propriétaire Lightspeed) indisponible → DM Sans, proche géométrique. -->
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap"
  />
</svelte:head>

<div class="ls-shell">
  <!-- ── HEADER Lightspeed ── -->
  <div class="ls-header-wrap">
    <header class="ls-header" aria-label="Lightspeed">
      <div class="ls-header__inner">
        <!-- Gauche : logo officiel (flamme rouge + wordmark charcoal) -->
        <div class="ls-header__brand">
          <a href="/" class="ls-header__brand-link" aria-label="Accueil : Lightspeed Design System">
            <img
              src="/chrome/lightspeed/logo.svg"
              alt="Lightspeed"
              class="ls-logo"
              width="130"
              height="30"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="ls-nav" aria-label="Navigation principale">
          <ul class="ls-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="ls-nav__item">
                <a
                  class="ls-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </nav>

        <!-- Droite : outils + recherche + CTA pilule rouge -->
        <div class="ls-header__tools">
          <!-- Barre de recherche Lightspeed : champ natif + bouton, branché sur la palette docs. -->
          <div class="ls-search" role="search">
            <label class="ls-search__label" for="ls-search-input">
              {locale.value === "fr" ? "Rechercher" : "Search"}
            </label>
            <div class="ls-search__group">
              <input
                id="ls-search-input"
                class="ls-search__input"
                type="search"
                readonly
                placeholder={locale.value === "fr" ? "Rechercher…" : "Search…"}
                aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
                aria-haspopup="dialog"
                onclick={onSearchOpen}
                onkeydown={handleSearchKeydown}
              />
              <kbd class="ls-search__kbd" aria-hidden="true">/</kbd>
              <button
                type="button"
                class="ls-search__btn"
                aria-label={locale.value === "fr" ? "Lancer la recherche" : "Open search"}
                aria-haspopup="dialog"
                onclick={onSearchOpen}
              >
                <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="ls-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA pilule rouge (radius 999px) : signature Lightspeed -->
          <a class="ls-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="ls-header__burger"
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

  <!-- ── BODY Lightspeed ── -->
  <div class="ls-body">
    <!-- Sidebar -->
    <aside class="ls-sidebar" aria-label="Navigation de la documentation">
      <nav class="ls-side-nav" aria-label="Sommaire">
        <ul class="ls-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="ls-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="ls-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="ls-side-group" open={isGroupOpen(group.items)}>
                <summary class="ls-side-group__summary">
                  <ChevronDown class="ls-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="ls-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="ls-side-link ls-side-link--sub"
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
      <div class="ls-sidebar-footer">
        <span class="ls-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="ls-sidebar-github"
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
    <div class="ls-content">
      <nav class="ls-breadcrumb" aria-label="Breadcrumb">
        <ol class="ls-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="ls-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="ls-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Lightspeed ── -->
  <footer class="ls-footer" aria-label="Pied de page Lightspeed">
    <div class="ls-footer__inner">
      <nav class="ls-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="ls-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/lightspeed/logo.svg"
        alt="Lightspeed"
        class="ls-footer__logo"
        width="130"
        height="30"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Lightspeed ── */
  .ls-shell {
    --ls-red: #e81c1c; /* rouge flamme Lightspeed */
    --ls-red-hover: #c7141f; /* rouge survol CTA */
    --ls-charcoal: #191513; /* charcoal wordmark / titres */
    --ls-ink: #000; /* encre */
    --ls-grey: #757575; /* gris texte secondaire */
    --ls-subtle: #f6f4f3; /* surface subtile */
    --ls-border: #e3e0de; /* anneau de champ gris léger */
    --ls-border-strong: #c9c5c2;
    --ls-white: #fff;
    --ls-sidebar-width: 17rem;
    --ls-radius: 6px; /* conteneurs 6px arrondis */
    font-family: 'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--ls-white);
    color: var(--ls-charcoal);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Lightspeed ── */
  .ls-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .ls-header {
    background: var(--ls-white);
    border-bottom: 1px solid var(--ls-border);
  }

  .ls-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .ls-header__brand {
    flex: 0 0 auto;
  }

  .ls-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .ls-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Lightspeed (ratio préservé, hauteur ~28px comme l'en-tête réel). */
  .ls-logo {
    display: block;
    width: auto;
    height: 28px;
  }

  /* ── Nav horizontale (centre) ── */
  .ls-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .ls-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ls-nav__item {
    flex: 0 0 auto;
  }

  .ls-nav__link {
    align-items: center;
    border-radius: 999px; /* pilule au survol, signature Lightspeed */
    color: var(--ls-charcoal);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.5rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: background 120ms ease, color 120ms ease;
    white-space: nowrap;
  }

  .ls-nav__link:hover,
  .ls-nav__link:focus-visible {
    background: var(--ls-subtle);
    color: var(--ls-ink);
    outline: none;
  }

  .ls-nav__link[aria-current="page"] {
    color: var(--ls-red);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .ls-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .ls-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Lightspeed (champs clairs, anneau gris 1px). */
  .ls-header__tools-links :global(.docs-header-control) {
    background: var(--ls-white);
    border-color: var(--ls-border-strong);
    border-radius: var(--ls-radius);
    color: var(--ls-charcoal);
    font-family: inherit;
  }

  .ls-header__tools-links :global(.docs-header-control:hover),
  .ls-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--ls-subtle);
    border-color: var(--ls-red);
    color: var(--ls-red);
    box-shadow: none;
  }

  /* Barre de recherche Lightspeed (anneau gris 1px, conteneur 6px). */
  .ls-search {
    width: clamp(11rem, 18vw, 18rem);
  }

  .ls-search__label {
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

  .ls-search__group {
    display: flex;
    position: relative;
    width: 100%;
  }

  .ls-search__input {
    background: var(--ls-white);
    border: 1px solid var(--ls-border-strong);
    border-right: 0;
    border-radius: var(--ls-radius);
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
    color: var(--ls-charcoal);
    cursor: pointer;
    flex: 1 1 auto;
    font-family: inherit;
    font-size: 0.875rem;
    height: 2.5rem;
    min-width: 0;
    padding: 0 2.125rem 0 0.75rem;
  }

  .ls-search__input:hover,
  .ls-search__input:focus-visible {
    background: var(--ls-white);
    border-color: var(--ls-red);
    color: var(--ls-charcoal);
    outline: 2px solid var(--ls-red);
    outline-offset: 1px;
  }

  .ls-search__input::placeholder {
    color: var(--ls-grey);
  }

  .ls-search__kbd {
    align-items: center;
    border: 1px solid var(--ls-border-strong);
    border-radius: 4px;
    color: var(--ls-grey);
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

  .ls-search__btn {
    align-items: center;
    background: var(--ls-red);
    border: 1px solid var(--ls-red);
    border-radius: 0 var(--ls-radius) var(--ls-radius) 0;
    color: var(--ls-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease;
  }

  .ls-search__btn:hover,
  .ls-search__btn:focus-visible {
    background: var(--ls-red-hover);
    border-color: var(--ls-red-hover);
    outline: 2px solid var(--ls-red);
    outline-offset: 1px;
  }

  /* CTA pilule rouge (radius 999px). */
  .ls-cta {
    align-items: center;
    background: var(--ls-red);
    border: 1px solid var(--ls-red);
    border-radius: 999px;
    color: var(--ls-white);
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

  .ls-cta:hover,
  .ls-cta:focus-visible {
    background: var(--ls-red-hover);
    border-color: var(--ls-red-hover);
    color: var(--ls-white);
    outline: none;
  }

  /* Burger mobile */
  .ls-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--ls-charcoal);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Lightspeed ── */
  .ls-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--ls-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Lightspeed ── */
  .ls-sidebar {
    background: var(--ls-white);
    border-right: 1px solid var(--ls-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .ls-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .ls-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--ls-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .ls-version-badge {
    background: var(--ls-subtle);
    border: 1px solid var(--ls-border);
    border-radius: var(--ls-radius);
    color: var(--ls-red);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .ls-sidebar-github {
    align-items: center;
    color: var(--ls-charcoal);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .ls-sidebar-github:hover,
  .ls-sidebar-github:focus-visible {
    color: var(--ls-red);
  }

  .ls-side-list,
  .ls-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ls-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--ls-charcoal);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .ls-side-link:hover,
  .ls-side-link:focus-visible {
    background: var(--ls-subtle);
    color: var(--ls-ink);
    text-decoration: none;
  }

  .ls-side-link[aria-current="page"] {
    background: var(--ls-subtle);
    border-left-color: var(--ls-red);
    color: var(--ls-red);
    font-weight: 700;
    text-decoration: none;
  }

  .ls-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .ls-side-divider {
    border-top: 1px solid var(--ls-border);
    margin: 0.5rem 0;
  }

  .ls-side-group {
    display: block;
  }

  .ls-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--ls-grey);
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

  .ls-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .ls-side-group__summary:hover,
  .ls-side-group__summary:focus-visible {
    background: var(--ls-subtle);
    outline: none;
  }

  .ls-side-group :global(.ls-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .ls-side-group:not([open]) :global(.ls-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .ls-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .ls-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .ls-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ls-breadcrumb__item {
    align-items: center;
    color: var(--ls-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .ls-breadcrumb__item + .ls-breadcrumb__item::before {
    color: var(--ls-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .ls-breadcrumb__link {
    color: var(--ls-red);
    text-decoration: none;
  }

  .ls-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .ls-breadcrumb__item span[aria-current="page"] {
    color: var(--ls-charcoal);
    font-weight: 600;
  }

  /* ── Footer Lightspeed ── */
  .ls-footer {
    background: var(--ls-subtle);
    border-top: 1px solid var(--ls-border);
    margin-top: auto;
  }

  .ls-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .ls-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .ls-footer__link {
    color: var(--ls-charcoal);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .ls-footer__link:hover {
    color: var(--ls-red);
    text-decoration: underline;
  }

  .ls-footer__logo {
    display: block;
    width: auto;
    height: 26px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .ls-body {
      grid-template-columns: 1fr;
    }

    .ls-sidebar {
      display: none;
    }

    .ls-nav {
      display: none;
    }

    .ls-header__tools {
      display: none;
    }

    .ls-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .ls-nav__link,
    .ls-cta,
    .ls-search__btn,
    .ls-side-link,
    .ls-side-group :global(.ls-side-group__icon) {
      transition: none;
    }
  }
</style>

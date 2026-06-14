<!--
  Chrome documentaire Circle K (circlek.com) — la marque dépanneur de Couche-Tard.
  Forme fidèle à l'en-tête réel de circlek.com :
  - Header : barre BLANCHE nette, logo officiel Circle K (roundel rouge + wordmark) à gauche,
    nav horizontale au centre, recherche + CTA ROUGE rectangulaire (radius 4px) à droite
  - Nav active : SOULIGNÉ rouge Circle K
  - Barre latérale gauche : item actif accent rouge + fond subtle, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande claire avec liens + logo
  - Couleurs mesurées : rouge #DA291C (primaire, hover #b8221a), encre #1a1a1a,
    secondaire #575855, surfaces blanches, subtle #f2f2f2, bordure #e0e0e0,
    accent orange #F58220, danger #DA291C ; radius 4px ; focus outline #DA291C
  - Logo officiel Circle K (vecteur, fetché sur circlek.com) référencé via
    <img src="/chrome/circle-k/logo.svg">
  - Typo : 'Helvetica Neue', Arial, sans-serif (stack système — la webfont exacte
    de circlek.com n'est pas sourçable, pas de Google Font requise)
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

<div class="ck-shell">
  <!-- ── HEADER Circle K ── -->
  <div class="ck-header-wrap">
    <header class="ck-header" aria-label="Circle K">
      <div class="ck-header__inner">
        <!-- Gauche : logo officiel (roundel rouge + wordmark) -->
        <div class="ck-header__brand">
          <a href="/" class="ck-header__brand-link" aria-label="Accueil : Circle K Design System">
            <img
              src="/chrome/circle-k/logo.svg"
              alt="Circle K"
              class="ck-logo"
              width="103"
              height="28"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="ck-nav" aria-label="Navigation principale">
          <ul class="ck-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="ck-nav__item">
                <a
                  class="ck-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </nav>

        <!-- Droite : recherche + outils + CTA rouge -->
        <div class="ck-header__tools">
          <!-- Barre de recherche Circle K : champ natif + bouton, branché sur la palette docs. -->
          <div class="ck-search" role="search">
            <label class="ck-search__label" for="ck-search-input">
              {locale.value === "fr" ? "Rechercher" : "Search"}
            </label>
            <div class="ck-search__group">
              <input
                id="ck-search-input"
                class="ck-search__input"
                type="search"
                readonly
                placeholder={locale.value === "fr" ? "Rechercher…" : "Search…"}
                aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
                aria-haspopup="dialog"
                onclick={onSearchOpen}
                onkeydown={handleSearchKeydown}
              />
              <kbd class="ck-search__kbd" aria-hidden="true">/</kbd>
              <button
                type="button"
                class="ck-search__btn"
                aria-label={locale.value === "fr" ? "Lancer la recherche" : "Open search"}
                aria-haspopup="dialog"
                onclick={onSearchOpen}
              >
                <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="ck-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA rouge rectangulaire (radius 4px) : signature Circle K -->
          <a class="ck-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="ck-header__burger"
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

  <!-- ── BODY Circle K ── -->
  <div class="ck-body">
    <!-- Sidebar -->
    <aside class="ck-sidebar" aria-label="Navigation de la documentation">
      <nav class="ck-side-nav" aria-label="Sommaire">
        <ul class="ck-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="ck-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="ck-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="ck-side-group" open={isGroupOpen(group.items)}>
                <summary class="ck-side-group__summary">
                  <ChevronDown class="ck-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="ck-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="ck-side-link ck-side-link--sub"
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
      <div class="ck-sidebar-footer">
        <span class="ck-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="ck-sidebar-github"
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
    <div class="ck-content">
      <nav class="ck-breadcrumb" aria-label="Breadcrumb">
        <ol class="ck-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="ck-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="ck-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Circle K ── -->
  <footer class="ck-footer" aria-label="Pied de page Circle K">
    <div class="ck-footer__inner">
      <nav class="ck-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="ck-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/circle-k/logo.svg"
        alt="Circle K"
        class="ck-footer__logo"
        width="96"
        height="26"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Circle K (mesurées) ── */
  .ck-shell {
    --ck-red: #DA291C; /* rouge Circle K primaire */
    --ck-red-hover: #b8221a; /* rouge survol CTA */
    --ck-orange: #F58220; /* accent orange */
    --ck-ink: #1a1a1a; /* encre / titres */
    --ck-grey: #575855; /* texte secondaire */
    --ck-subtle: #f2f2f2; /* surface subtile */
    --ck-border: #e0e0e0; /* bordure */
    --ck-border-strong: #c9c9c9;
    --ck-white: #fff;
    --ck-sidebar-width: 17rem;
    --ck-radius: 4px; /* radius marque */
    font-family: 'Helvetica Neue', Arial, system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--ck-white);
    color: var(--ck-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Circle K ── */
  .ck-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .ck-header {
    background: var(--ck-white);
    border-bottom: 1px solid var(--ck-border);
  }

  .ck-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .ck-header__brand {
    flex: 0 0 auto;
  }

  .ck-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .ck-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Circle K (ratio préservé, hauteur ~28px comme l'en-tête réel). */
  .ck-logo {
    display: block;
    width: auto;
    height: 28px;
  }

  /* ── Nav horizontale (centre) ── */
  .ck-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .ck-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ck-nav__item {
    flex: 0 0 auto;
  }

  .ck-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent; /* soulignement rouge à l'actif */
    color: var(--ck-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease;
    white-space: nowrap;
  }

  .ck-nav__link:hover,
  .ck-nav__link:focus-visible {
    color: var(--ck-red);
    outline: none;
  }

  .ck-nav__link[aria-current="page"] {
    border-bottom-color: var(--ck-red);
    color: var(--ck-red);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .ck-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .ck-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Circle K (champs clairs, radius 4px). */
  .ck-header__tools-links :global(.docs-header-control) {
    background: var(--ck-white);
    border-color: var(--ck-border-strong);
    border-radius: var(--ck-radius);
    color: var(--ck-ink);
    font-family: inherit;
  }

  .ck-header__tools-links :global(.docs-header-control:hover),
  .ck-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--ck-subtle);
    border-color: var(--ck-red);
    color: var(--ck-red);
    box-shadow: none;
  }

  /* Barre de recherche Circle K (radius 4px, focus rouge). */
  .ck-search {
    width: clamp(11rem, 18vw, 18rem);
  }

  .ck-search__label {
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

  .ck-search__group {
    display: flex;
    position: relative;
    width: 100%;
  }

  .ck-search__input {
    background: var(--ck-white);
    border: 1px solid var(--ck-border-strong);
    border-right: 0;
    border-radius: var(--ck-radius);
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
    color: var(--ck-ink);
    cursor: pointer;
    flex: 1 1 auto;
    font-family: inherit;
    font-size: 0.875rem;
    height: 2.5rem;
    min-width: 0;
    padding: 0 2.125rem 0 0.75rem;
  }

  .ck-search__input:hover,
  .ck-search__input:focus-visible {
    background: var(--ck-white);
    border-color: var(--ck-red);
    color: var(--ck-ink);
    outline: 2px solid var(--ck-red);
    outline-offset: 1px;
  }

  .ck-search__input::placeholder {
    color: var(--ck-grey);
  }

  .ck-search__kbd {
    align-items: center;
    border: 1px solid var(--ck-border-strong);
    border-radius: var(--ck-radius);
    color: var(--ck-grey);
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

  .ck-search__btn {
    align-items: center;
    background: var(--ck-red);
    border: 1px solid var(--ck-red);
    border-radius: 0 var(--ck-radius) var(--ck-radius) 0;
    color: var(--ck-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease;
  }

  .ck-search__btn:hover,
  .ck-search__btn:focus-visible {
    background: var(--ck-red-hover);
    border-color: var(--ck-red-hover);
    outline: 2px solid var(--ck-red);
    outline-offset: 1px;
  }

  /* CTA rouge rectangulaire (radius 4px). */
  .ck-cta {
    align-items: center;
    background: var(--ck-red);
    border: 1px solid var(--ck-red);
    border-radius: var(--ck-radius);
    color: var(--ck-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    padding: 0 1.25rem;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .ck-cta:hover,
  .ck-cta:focus-visible {
    background: var(--ck-red-hover);
    border-color: var(--ck-red-hover);
    color: var(--ck-white);
    outline: none;
  }

  /* Burger mobile */
  .ck-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--ck-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Circle K ── */
  .ck-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--ck-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Circle K ── */
  .ck-sidebar {
    background: var(--ck-white);
    border-right: 1px solid var(--ck-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .ck-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .ck-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--ck-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .ck-version-badge {
    background: var(--ck-subtle);
    border: 1px solid var(--ck-border);
    border-radius: var(--ck-radius);
    color: var(--ck-red);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .ck-sidebar-github {
    align-items: center;
    color: var(--ck-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .ck-sidebar-github:hover,
  .ck-sidebar-github:focus-visible {
    color: var(--ck-red);
  }

  .ck-side-list,
  .ck-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ck-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--ck-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .ck-side-link:hover,
  .ck-side-link:focus-visible {
    background: var(--ck-subtle);
    color: var(--ck-red);
    text-decoration: none;
  }

  .ck-side-link[aria-current="page"] {
    background: var(--ck-subtle);
    border-left-color: var(--ck-red);
    color: var(--ck-red);
    font-weight: 700;
    text-decoration: none;
  }

  .ck-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .ck-side-divider {
    border-top: 1px solid var(--ck-border);
    margin: 0.5rem 0;
  }

  .ck-side-group {
    display: block;
  }

  .ck-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--ck-grey);
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

  .ck-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .ck-side-group__summary:hover,
  .ck-side-group__summary:focus-visible {
    background: var(--ck-subtle);
    outline: none;
  }

  .ck-side-group :global(.ck-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .ck-side-group:not([open]) :global(.ck-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .ck-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .ck-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .ck-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ck-breadcrumb__item {
    align-items: center;
    color: var(--ck-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .ck-breadcrumb__item + .ck-breadcrumb__item::before {
    color: var(--ck-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .ck-breadcrumb__link {
    color: var(--ck-red);
    text-decoration: none;
  }

  .ck-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .ck-breadcrumb__item span[aria-current="page"] {
    color: var(--ck-ink);
    font-weight: 600;
  }

  /* ── Footer Circle K ── */
  .ck-footer {
    background: var(--ck-subtle);
    border-top: 1px solid var(--ck-border);
    margin-top: auto;
  }

  .ck-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .ck-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .ck-footer__link {
    color: var(--ck-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .ck-footer__link:hover {
    color: var(--ck-red);
    text-decoration: underline;
  }

  .ck-footer__logo {
    display: block;
    width: auto;
    height: 26px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .ck-body {
      grid-template-columns: 1fr;
    }

    .ck-sidebar {
      display: none;
    }

    .ck-nav {
      display: none;
    }

    .ck-header__tools {
      display: none;
    }

    .ck-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .ck-nav__link,
    .ck-cta,
    .ck-search__btn,
    .ck-side-link,
    .ck-side-group :global(.ck-side-group__icon) {
      transition: none;
    }
  }
</style>

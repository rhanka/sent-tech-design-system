<!--
  Chrome documentaire Inflection / Pi (pi.ai — Inflection AI).
  Forme fidèle à l'en-tête de pi.ai : chaleureux, crème, doux & arrondi.
  - Header : bandeau CRÈME chaud #faf3ea, logo OFFICIEL Inflection (wordmark)
    à gauche en vert pin, nav douce au centre, recherche pilule pin à droite
  - Coins ARRONDIS (radius 12px / pilules) — signature Pi ; onglet actif =
    pilule beige + libellé VERT PIN (#1a4631), pas de souligné dur
  - Barre latérale : item actif = pilule beige #f5eadc + texte pin
  - Couleurs MESURÉES sur pi.ai (--color-*) : pin #1a4631, pin hover #1e3c2e,
    émeraude #038247, crème #faf3ea, beige #f5eadc, blanc chaud #fcfaf7,
    fill #ece1d2, bordure tan #e1d3c0 / #d9c9b4, taupe #655e55 / #3e3a35,
    encre chaude #1a1918
  - Logo OFFICIEL Inflection (vecteur wordmark) via <img src="/chrome/inflection/logo.svg">
  - Typo : familles propriétaires Pi indisponibles (GT Alpina serif / ABC Oracle
    sans) → repli système sans / serif (aucune police réseau chargée)
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

<div class="inflection-shell">
  <!-- ── HEADER INFLECTION / Pi ── -->
  <div class="inflection-header-wrap">
    <header class="inflection-header" aria-label="Inflection (Pi)">
      <div class="inflection-header__inner">
        <!-- Gauche : logo officiel Inflection -->
        <div class="inflection-header__brand">
          <a href="/" class="inflection-header__brand-link" aria-label="Accueil : Inflection (Pi) Design System">
            <img
              src="/chrome/inflection/logo.svg"
              alt="Inflection"
              class="inflection-logo"
              width="129"
              height="18"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="inflection-nav" aria-label="Navigation principale">
          <ul class="inflection-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="inflection-nav__item">
                <a
                  class="inflection-nav__link"
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
        <div class="inflection-header__tools">
          <button
            type="button"
            class="inflection-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="inflection-header__tools-links">
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
          class="inflection-header__burger"
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

  <!-- ── BODY INFLECTION / Pi ── -->
  <div class="inflection-body">
    <!-- Sidebar -->
    <aside class="inflection-sidebar" aria-label="Navigation de la documentation">
      <nav class="inflection-side-nav" aria-label="Sommaire">
        <ul class="inflection-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="inflection-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="inflection-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="inflection-side-group" open={isGroupOpen(group.items)}>
                <summary class="inflection-side-group__summary">
                  <ChevronDown class="inflection-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="inflection-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="inflection-side-link inflection-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="inflection-side-divider" role="separator"></li>

          <li>
            <a
              class="inflection-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="inflection-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="inflection-side-group__summary">
                  <ChevronDown class="inflection-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="inflection-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="inflection-side-link inflection-side-link--sub"
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
      <div class="inflection-sidebar-footer">
        <span class="inflection-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="inflection-sidebar-github"
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
    <div class="inflection-content">
      <nav class="inflection-breadcrumb" aria-label="Breadcrumb">
        <ol class="inflection-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="inflection-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="inflection-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER INFLECTION / Pi ── -->
  <footer class="inflection-footer" aria-label="Pied de page Inflection (Pi)">
    <div class="inflection-footer__inner">
      <nav class="inflection-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="inflection-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/inflection/logo.svg"
        alt="Inflection"
        class="inflection-footer__logo"
        width="129"
        height="18"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Inflection / Pi ── */
  .inflection-shell {
    --inflection-primary: #1a4631; /* pine green (primary / accent) */
    --inflection-primary-hover: #1e3c2e; /* pine hover */
    --inflection-primary-deep: #21322a; /* pine tap (darkest) */
    --inflection-emerald: #038247; /* émeraude (success / alt accent) */
    --inflection-ink: #1a1918; /* encre chaude / titres */
    --inflection-ink-2: #3e3a35; /* brun chaud sombre */
    --inflection-secondary: #655e55; /* taupe texte secondaire */
    --inflection-muted: #a69986; /* taupe atténué / placeholder */
    --inflection-cream: #faf3ea; /* crème (fond page / header) */
    --inflection-beige: #f5eadc; /* beige chaud (surfaces alt / hover) */
    --inflection-white: #fcfaf7; /* blanc chaud (cartes / sidebar) */
    --inflection-fill: #ece1d2; /* remplissage neutre (bouton secondaire) */
    --inflection-border: #e1d3c0; /* bordure tan chaude */
    --inflection-border-strong: #d9c9b4; /* bordure renforcée */
    --inflection-focus: #1a4631; /* anneau de focus pin */
    --inflection-sidebar-width: 17rem;
    --inflection-radius: 0.75rem; /* 12px — contrôles arrondis */
    --inflection-radius-pill: 999px; /* pilules */
    font-family: 'ABC Oracle', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--inflection-cream);
    color: var(--inflection-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Inflection / Pi ── */
  .inflection-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .inflection-header {
    background: var(--inflection-cream);
    border-bottom: 1px solid var(--inflection-border);
  }

  .inflection-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .inflection-header__brand {
    flex: 0 0 auto;
  }

  .inflection-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 200ms ease;
  }

  .inflection-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Inflection (ratio préservé). */
  .inflection-logo {
    display: block;
    width: auto;
    height: 22px;
  }

  /* ── Nav horizontale (centre) ── */
  .inflection-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .inflection-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .inflection-nav__item {
    flex: 0 0 auto;
  }

  .inflection-nav__link {
    align-items: center;
    border-radius: var(--inflection-radius-pill);
    color: var(--inflection-secondary);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.5rem;
    padding: 0 0.95rem;
    text-decoration: none;
    transition: background 200ms ease, color 200ms ease;
    white-space: nowrap;
  }

  .inflection-nav__link:hover,
  .inflection-nav__link:focus-visible {
    background: var(--inflection-beige);
    color: var(--inflection-ink);
    outline: none;
  }

  .inflection-nav__link[aria-current="page"] {
    background: var(--inflection-beige);
    color: var(--inflection-primary);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .inflection-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .inflection-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Inflection / Pi. */
  .inflection-header__tools-links :global(.docs-header-control) {
    background: var(--inflection-white);
    border-color: var(--inflection-border-strong);
    border-radius: var(--inflection-radius);
    color: var(--inflection-ink-2);
    font-family: inherit;
  }

  .inflection-header__tools-links :global(.docs-header-control:hover),
  .inflection-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--inflection-beige);
    border-color: var(--inflection-primary);
    color: var(--inflection-ink);
    box-shadow: none;
  }

  /* Recherche Pi : bouton loupe pin, doux. */
  .inflection-search__btn {
    align-items: center;
    background: var(--inflection-primary);
    border: 1px solid var(--inflection-primary);
    border-radius: var(--inflection-radius);
    color: var(--inflection-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 200ms ease, border-color 200ms ease;
  }

  .inflection-search__btn:hover,
  .inflection-search__btn:focus-visible {
    background: var(--inflection-primary-hover);
    border-color: var(--inflection-primary-hover);
    outline: 2px solid var(--inflection-focus);
    outline-offset: 2px;
  }

  /* Burger mobile */
  .inflection-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--inflection-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Inflection / Pi ── */
  .inflection-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--inflection-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Inflection / Pi ── */
  .inflection-sidebar {
    background: var(--inflection-white);
    border-right: 1px solid var(--inflection-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .inflection-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0.5rem;
  }

  .inflection-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--inflection-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .inflection-version-badge {
    background: var(--inflection-beige);
    border: 1px solid var(--inflection-border);
    border-radius: var(--inflection-radius-pill);
    color: var(--inflection-primary);
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.15rem 0.6rem;
    white-space: nowrap;
  }

  .inflection-sidebar-github {
    align-items: center;
    color: var(--inflection-secondary);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 200ms ease;
  }

  .inflection-sidebar-github:hover,
  .inflection-sidebar-github:focus-visible {
    color: var(--inflection-primary);
  }

  .inflection-side-list,
  .inflection-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .inflection-side-link {
    align-items: center;
    border-radius: var(--inflection-radius);
    box-sizing: border-box;
    color: var(--inflection-ink-2);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    margin: 0.0625rem 0.5rem;
    min-height: 2.5rem;
    padding: 0.5rem 0.75rem;
    text-decoration: none;
    transition: background 200ms ease, color 200ms ease;
  }

  .inflection-side-link:hover,
  .inflection-side-link:focus-visible {
    background: var(--inflection-beige);
    color: var(--inflection-primary);
    text-decoration: none;
  }

  .inflection-side-link[aria-current="page"] {
    background: var(--inflection-beige);
    color: var(--inflection-primary);
    font-weight: 600;
    text-decoration: none;
  }

  .inflection-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.125rem;
    padding-left: 1.5rem;
  }

  .inflection-side-divider {
    border-top: 1px solid var(--inflection-border);
    margin: 0.5rem 0.75rem;
  }

  .inflection-side-group {
    display: block;
  }

  .inflection-side-group__summary {
    align-items: center;
    border-radius: var(--inflection-radius);
    color: var(--inflection-secondary);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 700;
    gap: 0.35rem;
    letter-spacing: 0.06em;
    list-style: none;
    margin: 0.0625rem 0.5rem;
    min-height: 2.25rem;
    padding: 0 0.75rem;
    text-transform: uppercase;
    transition: background 200ms ease;
  }

  .inflection-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .inflection-side-group__summary:hover,
  .inflection-side-group__summary:focus-visible {
    background: var(--inflection-beige);
    outline: none;
  }

  .inflection-side-group :global(.inflection-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 200ms ease;
  }

  .inflection-side-group:not([open]) :global(.inflection-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .inflection-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .inflection-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .inflection-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .inflection-breadcrumb__item {
    align-items: center;
    color: var(--inflection-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .inflection-breadcrumb__item + .inflection-breadcrumb__item::before {
    color: var(--inflection-muted);
    content: "›";
    margin: 0 0.4rem;
  }

  .inflection-breadcrumb__link {
    color: var(--inflection-primary);
    text-decoration: none;
  }

  .inflection-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .inflection-breadcrumb__item span[aria-current="page"] {
    color: var(--inflection-ink-2);
    font-weight: 600;
  }

  /* ── Footer Inflection / Pi ── */
  .inflection-footer {
    background: var(--inflection-beige);
    border-top: 1px solid var(--inflection-border);
    margin-top: auto;
  }

  .inflection-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .inflection-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .inflection-footer__link {
    color: var(--inflection-secondary);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .inflection-footer__link:hover {
    color: var(--inflection-primary);
    text-decoration: underline;
  }

  .inflection-footer__logo {
    display: block;
    width: auto;
    height: 18px;
    flex: 0 0 auto;
    opacity: 0.85;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .inflection-body {
      grid-template-columns: 1fr;
    }

    .inflection-sidebar {
      display: none;
    }

    .inflection-nav {
      display: none;
    }

    .inflection-header__tools {
      display: none;
    }

    .inflection-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .inflection-nav__link,
    .inflection-search__btn,
    .inflection-side-link,
    .inflection-side-group :global(.inflection-side-group__icon) {
      transition: none;
    }
  }
</style>

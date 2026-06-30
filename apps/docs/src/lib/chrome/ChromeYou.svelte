<!--
  Chrome documentaire You.com (you.com — moteur de recherche / assistant IA).
  Forme fidèle à l'en-tête de you.com : clair, moderne, compact.
  - Header : bandeau BLANC, logo OFFICIEL You.com (cube + mot « you ») à gauche,
    nav horizontale (casse normale, Lumen Sans) au centre, loupe Iris à droite
  - Coins ARRONDIS 6px (signature des contrôles you.com) ; onglet actif = libellé
    Iris + liseré bas Iris (2px)
  - Barre latérale : item actif liseré Iris + fond bleu très clair (sélection)
  - Couleurs MESURÉES sur you.com (tokens --swatch--*) : Iris #5368ee, Navy #222b5f,
    charcoal #121212, zinc-500 #62636b, border zinc-200 #e0e1e6, card bg #f7f9ff,
    selection #eef2fe, grey-50 #fafafa
  - Logo OFFICIEL You.com (vecteur) via <img src="/chrome/you/logo.svg">
  - Typo : familles you.com propriétaires indisponibles → repli sans système
    ('Lumen Sans' nommée, Manrope, system-ui) — aucune police réseau chargée
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

<div class="you-shell">
  <!-- ── HEADER You.com ── -->
  <div class="you-header-wrap">
    <header class="you-header" aria-label="You.com">
      <div class="you-header__inner">
        <!-- Gauche : logo officiel You.com -->
        <div class="you-header__brand">
          <a href="/" class="you-header__brand-link" aria-label="Accueil : You.com Design System">
            <img
              src="/chrome/you/logo.svg"
              alt="You.com"
              class="you-logo"
              width="112"
              height="28"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="you-nav" aria-label="Navigation principale">
          <ul class="you-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="you-nav__item">
                <a
                  class="you-nav__link"
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
        <div class="you-header__tools">
          <button
            type="button"
            class="you-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="you-header__tools-links">
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
          class="you-header__burger"
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

  <!-- ── BODY You.com ── -->
  <div class="you-body">
    <!-- Sidebar -->
    <aside class="you-sidebar" aria-label="Navigation de la documentation">
      <nav class="you-side-nav" aria-label="Sommaire">
        <ul class="you-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="you-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="you-side-divider" role="separator"></li>

          <li class="you-side-heading">
            <a
              class="you-side-link you-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="you-side-group" open={isGroupOpen(group.items)}>
                <summary class="you-side-group__summary">
                  <ChevronDown class="you-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="you-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="you-side-link you-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="you-side-divider" role="separator"></li>

          <li class="you-side-heading">
            <a
              class="you-side-link you-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="you-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="you-side-group__summary">
                  <ChevronDown class="you-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="you-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="you-side-link you-side-link--sub"
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
      <div class="you-sidebar-footer">
        <span class="you-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="you-sidebar-github"
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
    <div class="you-content">
      <nav class="you-breadcrumb" aria-label="Breadcrumb">
        <ol class="you-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="you-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="you-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER You.com ── -->
  <footer class="you-footer" aria-label="Pied de page You.com">
    <div class="you-footer__inner">
      <nav class="you-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="you-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/you/logo.svg"
        alt="You.com"
        class="you-footer__logo"
        width="96"
        height="24"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables You.com (mesurées sur les tokens --swatch--* de you.com) ── */
  .you-shell {
    --you-primary: #5368ee; /* Iris (brand-500) — action / lien */
    --you-primary-hover: #4757c9; /* brand-700 — survol primaire */
    --you-primary-light: #eef2fe; /* brand-200 — sélection (item actif sidebar) */
    --you-navy: #222b5f; /* brand-800 — ancre de marque */
    --you-ink: #121212; /* charcoal (zinc-900) — texte / titres */
    --you-ink-2: #42424a; /* grey-800 */
    --you-secondary: #62636b; /* zinc-500 — texte secondaire */
    --you-muted: #92939e; /* grey-400 — texte tertiaire */
    --you-surface: #ffffff; /* fond par défaut */
    --you-surface-alt: #fafafa; /* grey-50 — fond alterné */
    --you-subtle: #f7f9ff; /* brand-100 — fond carte bleuté */
    --you-border: #e0e1e6; /* zinc-200 — bordure menu */
    --you-border-subtle: #f0f0f3; /* zinc-100 — bordure discrète */
    --you-border-strong: #d9d9de; /* grey-200 — bordure renforcée */
    --you-focus: #5368ee; /* Iris — anneau de focus */
    --you-white: #fff;
    --you-sidebar-width: 17rem;
    --you-radius: 0.375rem; /* 6px — contrôles you.com */
    --you-radius-pill: 999px;
    font-family: 'Lumen Sans', Manrope, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    background: var(--you-surface);
    color: var(--you-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    letter-spacing: -0.01em;
  }

  /* ── Header You.com ── */
  .you-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .you-header {
    background: var(--you-white);
    border-bottom: 1px solid var(--you-border);
  }

  .you-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4rem;
    padding: 0.625rem 1.5rem;
  }

  .you-header__brand {
    flex: 0 0 auto;
  }

  .you-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 180ms ease;
  }

  .you-header__brand-link:hover {
    opacity: 0.82;
  }

  /* Logo officiel You.com (ratio préservé). */
  .you-logo {
    display: block;
    width: auto;
    height: 26px;
  }

  /* ── Nav horizontale (centre) ── */
  .you-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .you-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .you-nav__item {
    flex: 0 0 auto;
  }

  .you-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--you-secondary);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.5rem;
    padding: 0 0.75rem;
    text-decoration: none;
    transition: border-color 180ms ease, color 180ms ease;
    white-space: nowrap;
  }

  .you-nav__link:hover,
  .you-nav__link:focus-visible {
    color: var(--you-ink);
    outline: none;
  }

  .you-nav__link[aria-current="page"] {
    border-bottom-color: var(--you-primary);
    color: var(--you-primary);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .you-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .you-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header You.com. */
  .you-header__tools-links :global(.docs-header-control) {
    background: var(--you-white);
    border-color: var(--you-border-strong);
    border-radius: var(--you-radius);
    color: var(--you-ink);
    font-family: inherit;
  }

  .you-header__tools-links :global(.docs-header-control:hover),
  .you-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--you-subtle);
    border-color: var(--you-primary);
    color: var(--you-ink);
    box-shadow: none;
  }

  /* Recherche You.com : bouton loupe Iris arrondi. */
  .you-search__btn {
    align-items: center;
    background: var(--you-primary);
    border: 1px solid var(--you-primary);
    border-radius: var(--you-radius);
    color: var(--you-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 180ms ease, border-color 180ms ease;
  }

  .you-search__btn:hover,
  .you-search__btn:focus-visible {
    background: var(--you-primary-hover);
    border-color: var(--you-primary-hover);
    outline: 3px solid color-mix(in srgb, var(--you-focus) 35%, transparent);
    outline-offset: 2px;
  }

  /* Burger mobile */
  .you-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--you-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body You.com ── */
  .you-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--you-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar You.com ── */
  .you-sidebar {
    background: var(--you-white);
    border-right: 1px solid var(--you-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4rem);
    position: sticky;
    top: 4rem;
  }

  .you-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .you-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--you-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .you-version-badge {
    background: var(--you-subtle);
    border: 1px solid var(--you-border);
    border-radius: var(--you-radius);
    color: var(--you-primary);
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .you-sidebar-github {
    align-items: center;
    color: var(--you-secondary);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 180ms ease;
  }

  .you-sidebar-github:hover,
  .you-sidebar-github:focus-visible {
    color: var(--you-primary);
  }

  .you-side-list,
  .you-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .you-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--you-ink-2);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.5rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
  }

  .you-side-link:hover,
  .you-side-link:focus-visible {
    background: var(--you-subtle);
    color: var(--you-primary);
    text-decoration: none;
  }

  .you-side-link[aria-current="page"] {
    background: var(--you-primary-light);
    border-left-color: var(--you-primary);
    color: var(--you-primary);
    font-weight: 600;
    text-decoration: none;
  }

  .you-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .you-side-divider {
    border-top: 1px solid var(--you-border-subtle);
    margin: 0.5rem 0;
  }

  .you-side-group {
    display: block;
  }

  .you-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--you-muted);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 600;
    gap: 0.35rem;
    letter-spacing: 0.04em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 1rem 0 calc(1rem - 3px);
    text-transform: uppercase;
    transition: background 180ms ease;
  }

  .you-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .you-side-group__summary:hover,
  .you-side-group__summary:focus-visible {
    background: var(--you-subtle);
    outline: none;
  }

  .you-side-group :global(.you-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 180ms ease;
  }

  .you-side-group:not([open]) :global(.you-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .you-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .you-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .you-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .you-breadcrumb__item {
    align-items: center;
    color: var(--you-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .you-breadcrumb__item + .you-breadcrumb__item::before {
    color: var(--you-muted);
    content: "›";
    margin: 0 0.4rem;
  }

  .you-breadcrumb__link {
    color: var(--you-primary);
    text-decoration: none;
  }

  .you-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .you-breadcrumb__item span[aria-current="page"] {
    color: var(--you-ink);
    font-weight: 600;
  }

  /* ── Footer You.com ── */
  .you-footer {
    background: var(--you-surface-alt);
    border-top: 1px solid var(--you-border);
    margin-top: auto;
  }

  .you-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .you-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .you-footer__link {
    color: var(--you-secondary);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .you-footer__link:hover {
    color: var(--you-primary);
    text-decoration: underline;
  }

  .you-footer__logo {
    display: block;
    width: auto;
    height: 22px;
    flex: 0 0 auto;
    opacity: 0.85;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .you-body {
      grid-template-columns: 1fr;
    }

    .you-sidebar {
      display: none;
    }

    .you-nav {
      display: none;
    }

    .you-header__tools {
      display: none;
    }

    .you-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .you-nav__link,
    .you-search__btn,
    .you-side-link,
    .you-side-group :global(.you-side-group__icon) {
      transition: none;
    }
  }
</style>

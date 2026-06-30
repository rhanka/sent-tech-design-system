<!--
  Chrome documentaire OpenRouter (openrouter.ai — la place de marché unifiée de LLM).
  Forme fidèle à l'en-tête shadcn/ui d'OpenRouter : surface NEUTRE claire (zinc),
  encre quasi-noire, accents INDIGO #6366f1.
  - Header : bandeau BLANC #ffffff, logo OFFICIEL OpenRouter (marque "routing" +
    wordmark) à GAUCHE, nav horizontale au centre, recherche ⌘K + outils à droite
  - Coins ARRONDIS (radius 8px) — base shadcn `--radius` ; onglet actif = liseré
    INDIGO bas + libellé encre gras
  - Barre latérale : item actif liseré indigo + fond indigo très clair (#eef2ff)
  - Couleurs MESURÉES sur openrouter.ai (échelle Tailwind « zinc » + indigo `--primary`) :
    encre #18181b (zinc 900), noir #09090b (zinc 950), gris muté #71717a (zinc 500),
    bordure #e4e4e7 (zinc 200), bordure forte #a1a1aa (zinc 400),
    subtil #f4f4f5 (zinc 100), indigo #6366f1 (--primary), indigo hover #4f46e5,
    indigo clair #eef2ff
  - Logo OFFICIEL OpenRouter (vecteur) via <img src="/chrome/openrouter/logo.svg">
  - Typo : Inter (police OpenRouter) avec repli système, aucune police réseau chargée
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

<div class="or-shell">
  <!-- ── HEADER OPENROUTER ── -->
  <div class="or-header-wrap">
    <header class="or-header" aria-label="OpenRouter">
      <div class="or-header__inner">
        <!-- Gauche : logo officiel OpenRouter -->
        <div class="or-header__brand">
          <a href="/" class="or-header__brand-link" aria-label="Accueil : OpenRouter Design System">
            <img
              src="/chrome/openrouter/logo.svg"
              alt="OpenRouter"
              class="or-logo"
              width="152"
              height="28"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="or-nav" aria-label="Navigation principale">
          <ul class="or-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="or-nav__item">
                <a
                  class="or-nav__link"
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
        <div class="or-header__tools">
          <button
            type="button"
            class="or-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="or-header__tools-links">
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
          class="or-header__burger"
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

  <!-- ── BODY OPENROUTER ── -->
  <div class="or-body">
    <!-- Sidebar -->
    <aside class="or-sidebar" aria-label="Navigation de la documentation">
      <nav class="or-side-nav" aria-label="Sommaire">
        <ul class="or-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="or-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="or-side-divider" role="separator"></li>

          <li class="or-side-heading">
            <a
              class="or-side-link or-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="or-side-group" open={isGroupOpen(group.items)}>
                <summary class="or-side-group__summary">
                  <ChevronDown class="or-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="or-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="or-side-link or-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="or-side-divider" role="separator"></li>

          <li class="or-side-heading">
            <a
              class="or-side-link or-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="or-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="or-side-group__summary">
                  <ChevronDown class="or-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="or-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="or-side-link or-side-link--sub"
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
      <div class="or-sidebar-footer">
        <span class="or-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="or-sidebar-github"
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
    <div class="or-content">
      <nav class="or-breadcrumb" aria-label="Breadcrumb">
        <ol class="or-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="or-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="or-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER OPENROUTER ── -->
  <footer class="or-footer" aria-label="Pied de page OpenRouter">
    <div class="or-footer__inner">
      <nav class="or-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="or-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/openrouter/logo.svg"
        alt="OpenRouter"
        class="or-footer__logo"
        width="141"
        height="26"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables OpenRouter (mesurées sur openrouter.ai : zinc + indigo) ── */
  .or-shell {
    --or-primary: #6366f1; /* indigo --primary (accent) */
    --or-primary-hover: #4f46e5; /* indigo 600 hover */
    --or-primary-light: #eef2ff; /* indigo 50 (item actif sidebar) */
    --or-ink: #18181b; /* zinc 900 — encre / titres / CTA */
    --or-ink-2: #09090b; /* zinc 950 — noir le plus profond */
    --or-secondary: #71717a; /* zinc 500 — texte secondaire / muté */
    --or-warm: #ffffff; /* surface header (blanc) */
    --or-subtle: #f4f4f5; /* zinc 100 — surface subtile / hover */
    --or-border: #e4e4e7; /* zinc 200 — bordure par défaut */
    --or-border-strong: #a1a1aa; /* zinc 400 — bordure forte / ring */
    --or-focus: #6366f1; /* indigo focus visible */
    --or-white: #fff;
    --or-sidebar-width: 17rem;
    --or-radius: 0.5rem; /* shadcn --radius (8px) */
    --or-radius-sm: 0.375rem; /* 6px — pills nav */
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: var(--or-white);
    color: var(--or-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    letter-spacing: -0.011em;
  }

  /* ── Header OpenRouter ── */
  .or-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .or-header {
    background: var(--or-warm);
    border-bottom: 1px solid var(--or-border);
  }

  .or-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4rem;
    padding: 0.625rem 1.5rem;
  }

  .or-header__brand {
    flex: 0 0 auto;
  }

  .or-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 180ms ease;
  }

  .or-header__brand-link:hover {
    opacity: 0.78;
  }

  /* Logo officiel OpenRouter (ratio préservé). */
  .or-logo {
    display: block;
    width: auto;
    height: 28px;
  }

  /* ── Nav horizontale (centre) ── */
  .or-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .or-nav__list {
    align-items: center;
    display: flex;
    gap: 0.125rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .or-nav__item {
    flex: 0 0 auto;
  }

  .or-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    border-radius: var(--or-radius-sm) var(--or-radius-sm) 0 0;
    color: var(--or-secondary);
    display: inline-flex;
    font-size: 0.875rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.5rem;
    padding: 0 0.75rem;
    text-decoration: none;
    letter-spacing: -0.01em;
    transition: border-color 180ms ease, color 180ms ease, background 180ms ease;
    white-space: nowrap;
  }

  .or-nav__link:hover,
  .or-nav__link:focus-visible {
    background: var(--or-subtle);
    color: var(--or-ink);
    outline: none;
  }

  .or-nav__link[aria-current="page"] {
    border-bottom-color: var(--or-primary);
    color: var(--or-ink);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .or-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .or-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header OpenRouter. */
  .or-header__tools-links :global(.docs-header-control) {
    background: var(--or-white);
    border-color: var(--or-border);
    border-radius: var(--or-radius);
    color: var(--or-ink);
    font-family: inherit;
  }

  .or-header__tools-links :global(.docs-header-control:hover),
  .or-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--or-subtle);
    border-color: var(--or-border-strong);
    color: var(--or-ink);
    box-shadow: none;
  }

  /* Recherche OpenRouter : bouton loupe encre (CTA shadcn). */
  .or-search__btn {
    align-items: center;
    background: var(--or-ink);
    border: 1px solid var(--or-ink);
    border-radius: var(--or-radius);
    color: var(--or-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.25rem;
    height: 2.25rem;
    justify-content: center;
    padding: 0;
    transition: background 180ms ease, border-color 180ms ease;
  }

  .or-search__btn:hover,
  .or-search__btn:focus-visible {
    background: var(--or-ink-2);
    border-color: var(--or-ink-2);
    outline: 2px solid var(--or-focus);
    outline-offset: 2px;
  }

  /* Burger mobile */
  .or-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--or-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.5rem;
    min-width: 2.5rem;
    padding: 0;
  }

  /* ── Body OpenRouter ── */
  .or-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--or-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar OpenRouter ── */
  .or-sidebar {
    background: var(--or-white);
    border-right: 1px solid var(--or-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4rem);
    position: sticky;
    top: 4rem;
  }

  .or-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0.75rem;
  }

  .or-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--or-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .or-version-badge {
    background: var(--or-subtle);
    border: 1px solid var(--or-border);
    border-radius: var(--or-radius-sm);
    color: var(--or-primary-hover);
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .or-sidebar-github {
    align-items: center;
    color: var(--or-secondary);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 180ms ease;
  }

  .or-sidebar-github:hover,
  .or-sidebar-github:focus-visible {
    color: var(--or-ink);
  }

  .or-side-list,
  .or-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .or-side-link {
    align-items: center;
    border-left: 2px solid transparent;
    border-radius: var(--or-radius-sm);
    box-sizing: border-box;
    color: var(--or-secondary);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.25rem;
    padding: 0.4rem 0.75rem;
    text-decoration: none;
    transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
  }

  .or-side-link:hover,
  .or-side-link:focus-visible {
    background: var(--or-subtle);
    color: var(--or-ink);
    text-decoration: none;
  }

  .or-side-link[aria-current="page"] {
    background: var(--or-primary-light);
    border-left-color: var(--or-primary);
    border-radius: 0 var(--or-radius-sm) var(--or-radius-sm) 0;
    color: var(--or-ink);
    font-weight: 600;
    text-decoration: none;
  }

  .or-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2rem;
    padding-left: 1.75rem;
  }

  .or-side-divider {
    border-top: 1px solid var(--or-border);
    margin: 0.5rem 0.25rem;
  }

  .or-side-group {
    display: block;
  }

  .or-side-group__summary {
    align-items: center;
    border-radius: var(--or-radius-sm);
    color: var(--or-secondary);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 600;
    gap: 0.35rem;
    letter-spacing: 0.04em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 0.75rem;
    text-transform: uppercase;
    transition: background 180ms ease;
  }

  .or-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .or-side-group__summary:hover,
  .or-side-group__summary:focus-visible {
    background: var(--or-subtle);
    outline: none;
  }

  .or-side-group :global(.or-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 180ms ease;
  }

  .or-side-group:not([open]) :global(.or-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .or-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .or-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .or-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .or-breadcrumb__item {
    align-items: center;
    color: var(--or-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .or-breadcrumb__item + .or-breadcrumb__item::before {
    color: var(--or-border-strong);
    content: "/";
    margin: 0 0.5rem;
  }

  .or-breadcrumb__link {
    color: var(--or-secondary);
    text-decoration: none;
  }

  .or-breadcrumb__link:hover {
    color: var(--or-ink);
    text-decoration: underline;
  }

  .or-breadcrumb__item span[aria-current="page"] {
    color: var(--or-ink);
    font-weight: 500;
  }

  /* ── Footer OpenRouter ── */
  .or-footer {
    background: var(--or-subtle);
    border-top: 1px solid var(--or-border);
    margin-top: auto;
  }

  .or-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .or-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .or-footer__link {
    color: var(--or-secondary);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .or-footer__link:hover {
    color: var(--or-ink);
    text-decoration: underline;
  }

  .or-footer__logo {
    display: block;
    width: auto;
    height: 26px;
    flex: 0 0 auto;
    opacity: 0.85;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .or-body {
      grid-template-columns: 1fr;
    }

    .or-sidebar {
      display: none;
    }

    .or-nav {
      display: none;
    }

    .or-header__tools {
      display: none;
    }

    .or-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .or-nav__link,
    .or-search__btn,
    .or-side-link,
    .or-side-group :global(.or-side-group__icon) {
      transition: none;
    }
  }
</style>

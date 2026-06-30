<!--
  Chrome documentaire Anthropic / Claude (claude.ai — anthropic.com).
  Forme fidèle à l'en-tête produit Claude : chaleureux, sobre, doucement arrondi.
  - Header : bandeau IVOIRE chaud #faf9f5 (la signature Anthropic — l'app entière
    repose sur un ivoire, jamais du blanc pur), lockup OFFICIEL à gauche (mark
    Claude « sunburst » clay + wordmark Anthropic encre), nav sobre en casse
    normale au centre, recherche clay arrondie à droite
  - Coins DOUX (radius 8px) — signature Anthropic ; onglet actif = SOULIGNÉ CLAY
    (#d97757)
  - Barre latérale : item actif liseré clay + fond crème subtil
  - Couleurs MESURÉES (brand Anthropic + surfaces claude.ai) : ivoire #faf9f5,
    crème bordure #f0eee6, light gray #e8e6dc, mid gray #b0aea5, encre #141413,
    texte secondaire #5e5d59, muted #87867f, clay #d97757, terracotta #c96442
  - Logo OFFICIEL (vecteur) via <img src="/chrome/anthropic/logo.svg"> — mark
    Claude clay + wordmark Anthropic (assets de marque, source svgl.app)
  - Typo : familles propriétaires Anthropic indisponibles (Styrene / Copernicus)
    → on ne référence que leurs NOMS + repli sans système (aucune police réseau
    chargée)
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

<div class="anthropic-shell">
  <!-- ── HEADER ANTHROPIC ── -->
  <div class="anthropic-header-wrap">
    <header class="anthropic-header" aria-label="Anthropic / Claude">
      <div class="anthropic-header__inner">
        <!-- Gauche : lockup officiel Claude + Anthropic -->
        <div class="anthropic-header__brand">
          <a href="/" class="anthropic-header__brand-link" aria-label="Accueil : Anthropic Design System">
            <img
              src="/chrome/anthropic/logo.svg"
              alt="Anthropic"
              class="anthropic-logo"
              width="218"
              height="24"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="anthropic-nav" aria-label="Navigation principale">
          <ul class="anthropic-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="anthropic-nav__item">
                <a
                  class="anthropic-nav__link"
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
        <div class="anthropic-header__tools">
          <button
            type="button"
            class="anthropic-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="anthropic-header__tools-links">
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
          class="anthropic-header__burger"
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

  <!-- ── BODY ANTHROPIC ── -->
  <div class="anthropic-body">
    <!-- Sidebar -->
    <aside class="anthropic-sidebar" aria-label="Navigation de la documentation">
      <nav class="anthropic-side-nav" aria-label="Sommaire">
        <ul class="anthropic-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="anthropic-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="anthropic-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="anthropic-side-group" open={isGroupOpen(group.items)}>
                <summary class="anthropic-side-group__summary">
                  <ChevronDown class="anthropic-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="anthropic-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="anthropic-side-link anthropic-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="anthropic-side-divider" role="separator"></li>

          <li>
            <a
              class="anthropic-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="anthropic-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="anthropic-side-group__summary">
                  <ChevronDown class="anthropic-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="anthropic-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="anthropic-side-link anthropic-side-link--sub"
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
      <div class="anthropic-sidebar-footer">
        <span class="anthropic-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="anthropic-sidebar-github"
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
    <div class="anthropic-content">
      <nav class="anthropic-breadcrumb" aria-label="Breadcrumb">
        <ol class="anthropic-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="anthropic-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="anthropic-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER ANTHROPIC ── -->
  <footer class="anthropic-footer" aria-label="Pied de page Anthropic">
    <div class="anthropic-footer__inner">
      <nav class="anthropic-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="anthropic-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/anthropic/logo.svg"
        alt="Anthropic"
        class="anthropic-footer__logo"
        width="218"
        height="24"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Anthropic / Claude ── */
  .anthropic-shell {
    --anthropic-primary: #d97757; /* clay — accent / action primaire */
    --anthropic-primary-hover: #c96442; /* terracotta — hover/active */
    --anthropic-primary-light: #f0eee6; /* crème (item actif sidebar) */
    --anthropic-ink: #141413; /* encre / titres (brand "Dark") */
    --anthropic-ink-2: #4d4c48; /* encre adoucie */
    --anthropic-secondary: #5e5d59; /* texte secondaire chaud */
    --anthropic-muted: #87867f; /* texte muted chaud */
    --anthropic-clay: #d97757; /* clay accent */
    --anthropic-clay-dark: #c96442; /* terracotta */
    --anthropic-warm: #faf9f5; /* ivoire chaud (surface.default — signature) */
    --anthropic-subtle: #f0eee6; /* crème subtile (surface.subtle) */
    --anthropic-border: #e8e6dc; /* light gray — bordure chaude */
    --anthropic-border-strong: #b0aea5; /* mid gray — bordure forte */
    --anthropic-focus: #d97757; /* anneau focus clay */
    --anthropic-white: #fff;
    --anthropic-sidebar-width: 17rem;
    --anthropic-radius: 0.5rem; /* coins doux — signature Anthropic (8px) */
    font-family: 'Styrene B', 'Styrene A', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    background: var(--anthropic-warm);
    color: var(--anthropic-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Anthropic ── */
  .anthropic-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .anthropic-header {
    background: var(--anthropic-warm);
    border-bottom: 1px solid var(--anthropic-border);
  }

  .anthropic-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .anthropic-header__brand {
    flex: 0 0 auto;
  }

  .anthropic-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 200ms ease;
  }

  .anthropic-header__brand-link:hover {
    opacity: 0.82;
  }

  /* Lockup officiel Claude + Anthropic (ratio préservé). */
  .anthropic-logo {
    display: block;
    width: auto;
    height: 24px;
  }

  /* ── Nav horizontale (centre) — sobre, casse normale ── */
  .anthropic-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .anthropic-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .anthropic-nav__item {
    flex: 0 0 auto;
  }

  .anthropic-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--anthropic-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    letter-spacing: 0;
    transition: border-color 200ms ease, color 200ms ease;
    white-space: nowrap;
  }

  .anthropic-nav__link:hover,
  .anthropic-nav__link:focus-visible {
    color: var(--anthropic-clay-dark);
    border-bottom-color: var(--anthropic-border-strong);
    outline: none;
  }

  .anthropic-nav__link[aria-current="page"] {
    border-bottom-color: var(--anthropic-clay);
    color: var(--anthropic-ink);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .anthropic-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .anthropic-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Anthropic (champ blanc, coin doux). */
  .anthropic-header__tools-links :global(.docs-header-control) {
    background: var(--anthropic-white);
    border-color: var(--anthropic-border);
    border-radius: var(--anthropic-radius);
    color: var(--anthropic-ink);
    font-family: inherit;
  }

  .anthropic-header__tools-links :global(.docs-header-control:hover),
  .anthropic-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--anthropic-subtle);
    border-color: var(--anthropic-clay);
    color: var(--anthropic-ink);
    box-shadow: none;
  }

  /* Recherche Anthropic : bouton loupe clay, doucement arrondi. */
  .anthropic-search__btn {
    align-items: center;
    background: var(--anthropic-clay);
    border: 1px solid var(--anthropic-clay);
    border-radius: var(--anthropic-radius);
    color: var(--anthropic-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 200ms ease, border-color 200ms ease;
  }

  .anthropic-search__btn:hover,
  .anthropic-search__btn:focus-visible {
    background: var(--anthropic-clay-dark);
    border-color: var(--anthropic-clay-dark);
    outline: 2px solid var(--anthropic-focus);
    outline-offset: 2px;
  }

  /* Burger mobile */
  .anthropic-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--anthropic-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Anthropic ── */
  .anthropic-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--anthropic-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Anthropic ── */
  .anthropic-sidebar {
    background: var(--anthropic-warm);
    border-right: 1px solid var(--anthropic-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .anthropic-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .anthropic-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--anthropic-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .anthropic-version-badge {
    background: var(--anthropic-white);
    border: 1px solid var(--anthropic-border);
    border-radius: var(--anthropic-radius);
    color: var(--anthropic-clay-dark);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .anthropic-sidebar-github {
    align-items: center;
    color: var(--anthropic-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 200ms ease;
  }

  .anthropic-sidebar-github:hover,
  .anthropic-sidebar-github:focus-visible {
    color: var(--anthropic-clay-dark);
  }

  .anthropic-side-list,
  .anthropic-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .anthropic-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--anthropic-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 200ms ease, border-color 200ms ease, color 200ms ease;
  }

  .anthropic-side-link:hover,
  .anthropic-side-link:focus-visible {
    background: var(--anthropic-subtle);
    color: var(--anthropic-clay-dark);
    text-decoration: none;
  }

  .anthropic-side-link[aria-current="page"] {
    background: var(--anthropic-primary-light);
    border-left-color: var(--anthropic-clay);
    color: var(--anthropic-ink);
    font-weight: 600;
    text-decoration: none;
  }

  .anthropic-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .anthropic-side-divider {
    border-top: 1px solid var(--anthropic-border);
    margin: 0.5rem 0;
  }

  .anthropic-side-group {
    display: block;
  }

  .anthropic-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--anthropic-secondary);
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
    transition: background 200ms ease;
  }

  .anthropic-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .anthropic-side-group__summary:hover,
  .anthropic-side-group__summary:focus-visible {
    background: var(--anthropic-subtle);
    outline: none;
  }

  .anthropic-side-group :global(.anthropic-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 200ms ease;
  }

  .anthropic-side-group:not([open]) :global(.anthropic-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .anthropic-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .anthropic-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .anthropic-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .anthropic-breadcrumb__item {
    align-items: center;
    color: var(--anthropic-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .anthropic-breadcrumb__item + .anthropic-breadcrumb__item::before {
    color: var(--anthropic-border-strong);
    content: "›";
    margin: 0 0.4rem;
  }

  .anthropic-breadcrumb__link {
    color: var(--anthropic-secondary);
    text-decoration: none;
  }

  .anthropic-breadcrumb__link:hover {
    color: var(--anthropic-clay-dark);
    text-decoration: underline;
  }

  .anthropic-breadcrumb__item span[aria-current="page"] {
    color: var(--anthropic-ink);
    font-weight: 600;
  }

  /* ── Footer Anthropic ── */
  .anthropic-footer {
    background: var(--anthropic-subtle);
    border-top: 1px solid var(--anthropic-border);
    margin-top: auto;
  }

  .anthropic-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .anthropic-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .anthropic-footer__link {
    color: var(--anthropic-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .anthropic-footer__link:hover {
    color: var(--anthropic-clay-dark);
    text-decoration: underline;
  }

  .anthropic-footer__logo {
    display: block;
    width: auto;
    height: 22px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .anthropic-body {
      grid-template-columns: 1fr;
    }

    .anthropic-sidebar {
      display: none;
    }

    .anthropic-nav {
      display: none;
    }

    .anthropic-header__tools {
      display: none;
    }

    .anthropic-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .anthropic-nav__link,
    .anthropic-search__btn,
    .anthropic-side-link,
    .anthropic-side-group :global(.anthropic-side-group__icon) {
      transition: none;
    }
  }
</style>

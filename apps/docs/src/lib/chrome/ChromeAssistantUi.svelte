<!--
  Chrome documentaire assistant-ui (assistant-ui.com — librairie open-source de
  composants de chat React bâtie sur shadcn/ui + Radix + Tailwind).
  Forme fidèle à l'en-tête assistant-ui.com : neutre, minimal, monochrome.
  - Header : bandeau BLANC #ffffff, liseré bas zinc-200, logo OFFICIEL
    assistant-ui (bulle de chat + wordmark) à GAUCHE, nav text-sm sobre au
    centre, déclencheur de recherche outline à droite
  - Coins ARRONDIS (radius 0.625rem / 10px — shadcn `--radius`), contrôles
    rounded-md (8px) ; onglet actif = soulignement zinc-900 (primary sombre)
  - Barre latérale : items en pastilles rounded-md ; actif = fond zinc-100 +
    texte foreground (pas de filet gauche — style shadcn sidebar)
  - Anneau de focus shadcn = box-shadow zinc-400 ~50% (3px), pas d'outline natif
  - Couleurs MESURÉES (assistant-ui / shadcn « zinc », oklch → hex) :
    background #ffffff, foreground #09090b (zinc-950), primary #18181b
    (zinc-900), muted-foreground #71717b (zinc-500), border #e4e4e7 (zinc-200),
    ring #9f9fa9 (zinc-400), surface subtile #f4f4f5 (zinc-100)
  - Logo OFFICIEL assistant-ui (vecteur) via <img src="/chrome/assistant-ui/logo.svg">
  - Typo : noms de familles assistant-ui (Geist, Geist Mono) référencés
    uniquement ; repli système si Geist absent (aucune police réseau chargée)
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

<div class="aui-shell">
  <!-- ── HEADER assistant-ui ── -->
  <div class="aui-header-wrap">
    <header class="aui-header" aria-label="assistant-ui">
      <div class="aui-header__inner">
        <!-- Gauche : logo officiel assistant-ui -->
        <div class="aui-header__brand">
          <a href="/" class="aui-header__brand-link" aria-label="Accueil : assistant-ui Design System">
            <img
              src="/chrome/assistant-ui/logo.svg"
              alt="assistant-ui"
              class="aui-logo"
              width="143"
              height="26"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="aui-nav" aria-label="Navigation principale">
          <ul class="aui-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="aui-nav__item">
                <a
                  class="aui-nav__link"
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
        <div class="aui-header__tools">
          <button
            type="button"
            class="aui-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="aui-header__tools-links">
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
          class="aui-header__burger"
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

  <!-- ── BODY assistant-ui ── -->
  <div class="aui-body">
    <!-- Sidebar -->
    <aside class="aui-sidebar" aria-label="Navigation de la documentation">
      <nav class="aui-side-nav" aria-label="Sommaire">
        <ul class="aui-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="aui-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="aui-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="aui-side-group" open={isGroupOpen(group.items)}>
                <summary class="aui-side-group__summary">
                  <ChevronDown class="aui-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="aui-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="aui-side-link aui-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="aui-side-divider" role="separator"></li>

          <li>
            <a
              class="aui-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="aui-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="aui-side-group__summary">
                  <ChevronDown class="aui-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="aui-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="aui-side-link aui-side-link--sub"
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
      <div class="aui-sidebar-footer">
        <span class="aui-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="aui-sidebar-github"
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
    <div class="aui-content">
      <nav class="aui-breadcrumb" aria-label="Breadcrumb">
        <ol class="aui-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="aui-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="aui-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER assistant-ui ── -->
  <footer class="aui-footer" aria-label="Pied de page assistant-ui">
    <div class="aui-footer__inner">
      <nav class="aui-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="aui-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/assistant-ui/logo.svg"
        alt="assistant-ui"
        class="aui-footer__logo"
        width="132"
        height="24"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables assistant-ui / shadcn « zinc » ── */
  .aui-shell {
    --aui-bg: #ffffff; /* --background */
    --aui-fg: #09090b; /* --foreground (zinc-950) */
    --aui-primary: #18181b; /* --primary (zinc-900, primary sombre) */
    --aui-primary-hover: #27272a; /* zinc-800 (primary/90 hover) */
    --aui-on-primary: #fafafa; /* --primary-foreground (zinc-50) */
    --aui-muted: #71717b; /* --muted-foreground (zinc-500) */
    --aui-muted-2: #9f9fa9; /* --ring (zinc-400) placeholder/disabled */
    --aui-subtle: #f4f4f5; /* --muted / --secondary / --accent (zinc-100) */
    --aui-border: #e4e4e7; /* --border / --input (zinc-200) */
    --aui-ring: rgb(159 159 169 / 0.5); /* --ring zinc-400 @ ~50% (focus) */
    --aui-radius: 0.625rem; /* --radius (10px) */
    --aui-radius-md: 0.5rem; /* --radius-md (8px) — contrôles */
    --aui-sidebar-width: 17rem;
    font-family: 'Geist', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--aui-bg);
    color: var(--aui-fg);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header assistant-ui ── */
  .aui-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .aui-header {
    background: var(--aui-bg);
    border-bottom: 1px solid var(--aui-border);
  }

  .aui-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4rem;
    padding: 0.625rem 1.5rem;
  }

  .aui-header__brand {
    flex: 0 0 auto;
  }

  .aui-header__brand-link {
    align-items: center;
    border-radius: var(--aui-radius-md);
    display: inline-flex;
    text-decoration: none;
    transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .aui-header__brand-link:hover {
    opacity: 0.75;
  }

  .aui-header__brand-link:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--aui-ring);
  }

  /* Logo officiel assistant-ui (ratio préservé). */
  .aui-logo {
    display: block;
    width: auto;
    height: 26px;
  }

  /* ── Nav horizontale (centre) ── */
  .aui-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .aui-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .aui-nav__item {
    flex: 0 0 auto;
  }

  .aui-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--aui-muted);
    display: inline-flex;
    font-size: 0.875rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.5rem;
    padding: 0 0.625rem;
    text-decoration: none;
    transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
  }

  .aui-nav__link:hover,
  .aui-nav__link:focus-visible {
    color: var(--aui-fg);
    outline: none;
  }

  .aui-nav__link[aria-current="page"] {
    border-bottom-color: var(--aui-primary);
    color: var(--aui-fg);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .aui-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .aui-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header assistant-ui (style outline shadcn). */
  .aui-header__tools-links :global(.docs-header-control) {
    background: var(--aui-bg);
    border-color: var(--aui-border);
    border-radius: var(--aui-radius-md);
    color: var(--aui-fg);
    font-family: inherit;
  }

  .aui-header__tools-links :global(.docs-header-control:hover),
  .aui-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--aui-subtle);
    border-color: var(--aui-border);
    color: var(--aui-fg);
    box-shadow: none;
  }

  .aui-header__tools-links :global(.docs-header-control:focus-visible) {
    outline: none;
    box-shadow: 0 0 0 3px var(--aui-ring);
  }

  /* Recherche assistant-ui : déclencheur outline neutre (shadcn). */
  .aui-search__btn {
    align-items: center;
    background: var(--aui-bg);
    border: 1px solid var(--aui-border);
    border-radius: var(--aui-radius-md);
    color: var(--aui-muted);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.25rem;
    height: 2.25rem;
    justify-content: center;
    padding: 0;
    transition: background 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .aui-search__btn:hover {
    background: var(--aui-subtle);
    color: var(--aui-fg);
  }

  .aui-search__btn:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--aui-ring);
  }

  /* Burger mobile */
  .aui-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    border-radius: var(--aui-radius-md);
    color: var(--aui-fg);
    cursor: pointer;
    justify-content: center;
    min-height: 2.5rem;
    min-width: 2.5rem;
    padding: 0;
  }

  .aui-header__burger:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--aui-ring);
  }

  /* ── Body assistant-ui ── */
  .aui-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--aui-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar assistant-ui ── */
  .aui-sidebar {
    background: var(--aui-bg);
    border-right: 1px solid var(--aui-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4rem);
    position: sticky;
    top: 4rem;
  }

  .aui-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1rem 0.75rem;
  }

  .aui-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--aui-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .aui-version-badge {
    background: var(--aui-subtle);
    border-radius: var(--aui-radius-md);
    color: var(--aui-fg);
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .aui-sidebar-github {
    align-items: center;
    border-radius: var(--aui-radius-md);
    color: var(--aui-muted);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .aui-sidebar-github:hover,
  .aui-sidebar-github:focus-visible {
    color: var(--aui-fg);
    outline: none;
  }

  .aui-side-list,
  .aui-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .aui-side-link {
    align-items: center;
    border-radius: var(--aui-radius-md);
    box-sizing: border-box;
    color: var(--aui-fg);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.25rem;
    padding: 0.4rem 0.75rem;
    text-decoration: none;
    transition: background 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .aui-side-link:hover,
  .aui-side-link:focus-visible {
    background: var(--aui-subtle);
    color: var(--aui-fg);
    outline: none;
    text-decoration: none;
  }

  .aui-side-link[aria-current="page"] {
    background: var(--aui-subtle);
    color: var(--aui-fg);
    font-weight: 600;
    text-decoration: none;
  }

  .aui-side-link--sub {
    color: var(--aui-muted);
    font-size: 0.8125rem;
    font-weight: 400;
    min-height: 2rem;
    padding-left: 1.5rem;
  }

  .aui-side-link--sub:hover,
  .aui-side-link--sub:focus-visible,
  .aui-side-link--sub[aria-current="page"] {
    color: var(--aui-fg);
  }

  .aui-side-divider {
    border-top: 1px solid var(--aui-border);
    margin: 0.5rem 0.25rem;
  }

  .aui-side-group {
    display: block;
  }

  .aui-side-group__summary {
    align-items: center;
    border-radius: var(--aui-radius-md);
    color: var(--aui-muted);
    cursor: pointer;
    display: flex;
    font-size: 0.75rem;
    font-weight: 600;
    gap: 0.35rem;
    letter-spacing: 0.02em;
    list-style: none;
    min-height: 2rem;
    padding: 0 0.75rem;
    transition: background 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .aui-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .aui-side-group__summary:hover,
  .aui-side-group__summary:focus-visible {
    background: var(--aui-subtle);
    color: var(--aui-fg);
    outline: none;
  }

  .aui-side-group :global(.aui-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .aui-side-group:not([open]) :global(.aui-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .aui-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .aui-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .aui-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .aui-breadcrumb__item {
    align-items: center;
    color: var(--aui-muted);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .aui-breadcrumb__item + .aui-breadcrumb__item::before {
    color: var(--aui-muted-2);
    content: "/";
    margin: 0 0.5rem;
  }

  .aui-breadcrumb__link {
    color: var(--aui-muted);
    text-decoration: none;
  }

  .aui-breadcrumb__link:hover {
    color: var(--aui-fg);
    text-decoration: none;
  }

  .aui-breadcrumb__item span[aria-current="page"] {
    color: var(--aui-fg);
    font-weight: 400;
  }

  /* ── Footer assistant-ui ── */
  .aui-footer {
    background: var(--aui-bg);
    border-top: 1px solid var(--aui-border);
    margin-top: auto;
  }

  .aui-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .aui-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .aui-footer__link {
    color: var(--aui-muted);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .aui-footer__link:hover {
    color: var(--aui-fg);
    text-decoration: none;
  }

  .aui-footer__logo {
    display: block;
    width: auto;
    height: 24px;
    flex: 0 0 auto;
    opacity: 0.85;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .aui-body {
      grid-template-columns: 1fr;
    }

    .aui-sidebar {
      display: none;
    }

    .aui-nav {
      display: none;
    }

    .aui-header__tools {
      display: none;
    }

    .aui-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .aui-nav__link,
    .aui-search__btn,
    .aui-side-link,
    .aui-side-group :global(.aui-side-group__icon) {
      transition: none;
    }
  }
</style>

<!--
  Chrome documentaire Saint-Gobain (saint-gobain.com — matériaux de construction).
  Forme fidèle au corporate Saint-Gobain : clair, bleu institutionnel profond.
  - Header : bandeau BLANC, wordmark Saint-Gobain (bleu de marque) à gauche, nav au
    centre, recherche BLEUE à droite
  - Onglet actif = SOULIGNÉ bleu #17428C + texte bleu ; item sidebar actif =
    liseré bleu + fond bleu très clair
  - Couleurs (theme-saint-gobain index.ts) : bleu de marque #17428C (Pantone 7687 C —
    action/lien, survol #0f3068), bleu clair accent #249DD9, encre #1c2430, gris #667085,
    surface #f4f6f9, bordure champ #d3dae3
  - WORDMARK reconstruit (non officiel) via <img src="/chrome/saint-gobain/logo.svg"> :
    aucun SVG officiel libre sur Wikimedia → wordmark propre dans le bleu de marque,
    SIGNALÉ au conducteur
  - Typo : « Poppins » (de marque) référencée par NOM → repli système (aucun réseau)
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

<div class="sg-shell">
  <!-- ── HEADER Saint-Gobain ── -->
  <div class="sg-header-wrap">
    <header class="sg-header" aria-label="Saint-Gobain">
      <div class="sg-header__inner">
        <!-- Gauche : logo officiel Saint-Gobain -->
        <div class="sg-header__brand">
          <a href="/" class="sg-header__brand-link" aria-label="Accueil : Saint-Gobain Design System">
            <img
              src="/chrome/saint-gobain/logo.svg"
              alt="Saint-Gobain"
              class="sg-logo"
              width="149"
              height="22"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="sg-nav" aria-label="Navigation principale">
          <ul class="sg-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="sg-nav__item">
                <a
                  class="sg-nav__link"
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
        <div class="sg-header__tools">
          <button
            type="button"
            class="sg-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="sg-header__tools-links">
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
          class="sg-header__burger"
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

  <!-- ── BODY Saint-Gobain ── -->
  <div class="sg-body">
    <!-- Sidebar -->
    <aside class="sg-sidebar" aria-label="Navigation de la documentation">
      <nav class="sg-side-nav" aria-label="Sommaire">
        <ul class="sg-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="sg-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="sg-side-divider" role="separator"></li>

          <li class="sg-side-heading">
            <a
              class="sg-side-link sg-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="sg-side-group" open={isGroupOpen(group.items)}>
                <summary class="sg-side-group__summary">
                  <ChevronDown class="sg-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="sg-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="sg-side-link sg-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="sg-side-divider" role="separator"></li>

          <li class="sg-side-heading">
            <a
              class="sg-side-link sg-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="sg-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="sg-side-group__summary">
                  <ChevronDown class="sg-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="sg-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="sg-side-link sg-side-link--sub"
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
      <div class="sg-sidebar-footer">
        <span class="sg-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="sg-sidebar-github"
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
    <div class="sg-content">
      <nav class="sg-breadcrumb" aria-label="Breadcrumb">
        <ol class="sg-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="sg-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="sg-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Saint-Gobain ── -->
  <footer class="sg-footer" aria-label="Pied de page Saint-Gobain">
    <div class="sg-footer__inner">
      <nav class="sg-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="sg-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/saint-gobain/logo.svg"
        alt="Saint-Gobain"
        class="sg-footer__logo"
        width="136"
        height="20"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Saint-Gobain ── */
  .sg-shell {
    --sg-primary: #17428C; /* bleu de marque Saint-Gobain (Pantone 7687 C) — action/lien */
    --sg-primary-hover: #0f3068; /* bleu survol (theme blue.hover) */
    --sg-primary-light: #e5eaf3; /* bleu très clair (item actif sidebar) */
    --sg-accent: #249DD9; /* bleu clair accent (Pantone 7689 C — anneau focus) */
    --sg-ink: #1c2430; /* corps de texte (grey 800) */
    --sg-secondary: #667085; /* texte secondaire (grey 500) */
    --sg-subtle: #f4f6f9; /* surface alt (grey 50) */
    --sg-border: #e2e6ee; /* bordure subtile (dérivée, plus claire que le champ) */
    --sg-border-strong: #d3dae3; /* bordure champ (grey 200) */
    --sg-white: #fff;
    --sg-sidebar-width: 17rem;
    --sg-radius: 4px;
    font-family: 'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--sg-white);
    color: var(--sg-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Saint-Gobain ── */
  .sg-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .sg-header {
    background: var(--sg-white);
    border-bottom: 1px solid var(--sg-border);
  }

  .sg-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .sg-header__brand {
    flex: 0 0 auto;
  }

  .sg-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 150ms ease;
  }

  .sg-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Saint-Gobain (ratio préservé). */
  .sg-logo {
    display: block;
    width: auto;
    height: 22px;
  }

  /* ── Nav horizontale (centre) ── */
  .sg-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .sg-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .sg-nav__item {
    flex: 0 0 auto;
  }

  .sg-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--sg-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: none;
    letter-spacing: normal;
    transition: border-color 150ms ease, color 150ms ease;
    white-space: nowrap;
  }

  .sg-nav__link:hover,
  .sg-nav__link:focus-visible {
    color: var(--sg-primary);
    outline: none;
  }

  .sg-nav__link[aria-current="page"] {
    border-bottom-color: var(--sg-primary);
    color: var(--sg-primary);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .sg-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .sg-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Saint-Gobain. */
  .sg-header__tools-links :global(.docs-header-control) {
    background: var(--sg-white);
    border-color: var(--sg-border-strong);
    border-radius: var(--sg-radius);
    color: var(--sg-ink);
    font-family: inherit;
  }

  .sg-header__tools-links :global(.docs-header-control:hover),
  .sg-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--sg-subtle);
    border-color: var(--sg-primary);
    color: var(--sg-primary);
    box-shadow: none;
  }

  /* Recherche Saint-Gobain : bouton loupe compact. */
  .sg-search__btn {
    align-items: center;
    background: var(--sg-primary);
    border: 1px solid var(--sg-primary);
    border-radius: var(--sg-radius);
    color: var(--sg-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 150ms ease, border-color 150ms ease;
  }

  .sg-search__btn:hover,
  .sg-search__btn:focus-visible {
    background: var(--sg-primary-hover);
    border-color: var(--sg-primary-hover);
    outline: 2px solid var(--sg-accent);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .sg-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--sg-primary);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Saint-Gobain ── */
  .sg-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--sg-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Saint-Gobain ── */
  .sg-sidebar {
    background: var(--sg-white);
    border-right: 1px solid var(--sg-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .sg-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .sg-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--sg-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .sg-version-badge {
    background: var(--sg-subtle);
    border: 1px solid var(--sg-border);
    border-radius: var(--sg-radius);
    color: var(--sg-primary);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .sg-sidebar-github {
    align-items: center;
    color: var(--sg-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 150ms ease;
  }

  .sg-sidebar-github:hover,
  .sg-sidebar-github:focus-visible {
    color: var(--sg-primary);
  }

  .sg-side-list,
  .sg-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .sg-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--sg-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
  }

  .sg-side-link:hover,
  .sg-side-link:focus-visible {
    background: var(--sg-subtle);
    color: var(--sg-primary);
    text-decoration: none;
  }

  .sg-side-link[aria-current="page"] {
    background: var(--sg-primary-light);
    border-left-color: var(--sg-primary);
    color: var(--sg-primary);
    font-weight: 700;
    text-decoration: none;
  }

  .sg-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .sg-side-divider {
    border-top: 1px solid var(--sg-border);
    margin: 0.5rem 0;
  }

  .sg-side-group {
    display: block;
  }

  .sg-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--sg-secondary);
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
    transition: background 150ms ease;
  }

  .sg-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .sg-side-group__summary:hover,
  .sg-side-group__summary:focus-visible {
    background: var(--sg-subtle);
    outline: none;
  }

  .sg-side-group :global(.sg-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 150ms ease;
  }

  .sg-side-group:not([open]) :global(.sg-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .sg-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .sg-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .sg-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .sg-breadcrumb__item {
    align-items: center;
    color: var(--sg-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .sg-breadcrumb__item + .sg-breadcrumb__item::before {
    color: var(--sg-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .sg-breadcrumb__link {
    color: var(--sg-primary);
    text-decoration: none;
  }

  .sg-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .sg-breadcrumb__item span[aria-current="page"] {
    color: var(--sg-ink);
    font-weight: 600;
  }

  /* ── Footer Saint-Gobain ── */
  .sg-footer {
    background: var(--sg-subtle);
    border-top: 1px solid var(--sg-border);
    margin-top: auto;
  }

  .sg-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .sg-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .sg-footer__link {
    color: var(--sg-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .sg-footer__link:hover {
    color: var(--sg-primary);
    text-decoration: underline;
  }

  .sg-footer__logo {
    display: block;
    width: auto;
    height: 20px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .sg-body {
      grid-template-columns: 1fr;
    }

    .sg-sidebar {
      display: none;
    }

    .sg-nav {
      display: none;
    }

    .sg-header__tools {
      display: none;
    }

    .sg-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .sg-nav__link,
    .sg-search__btn,
    .sg-side-link,
    .sg-side-group :global(.sg-side-group__icon) {
      transition: none;
    }
  }
</style>

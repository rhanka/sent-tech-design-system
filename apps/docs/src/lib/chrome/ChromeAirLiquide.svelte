<!--
  Chrome documentaire Air Liquide (airliquide.com — gaz industriels).
  Forme fidèle à l'identité corporate : clair, bleu institutionnel + « Unique Red ».
  - Header : bandeau BLANC, logo OFFICIEL Air Liquide (carré bleu + rouge) à gauche,
    nav au centre, recherche bleue à droite
  - Onglet actif = SOULIGNÉ ROUGE « Unique Red » + texte bleu corporate
  - Item sidebar actif = liseré bleu + fond bleu très clair
  - Couleurs MESURÉES : bleu corporate #375F9B (Pantone 7684 C, primaire), survol
    #2c4d80, « Unique Red » #D7001E (Pantone 2035 C, accent), encre #1f2a3a,
    gris #6b7785 / #5a6573, surface #f5f7fa, bordure #d5dce5
  - Logo OFFICIEL Air Liquide (vecteur Wikimedia) via <img src="/chrome/air-liquide/logo.svg">
  - Typo : « Montserrat » (proxy géométrique de marque) référencée par NOM → repli
    système sans chargement réseau
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

<div class="al-shell">
  <!-- ── HEADER Air Liquide ── -->
  <div class="al-header-wrap">
    <header class="al-header" aria-label="Air Liquide">
      <div class="al-header__inner">
        <!-- Gauche : logo officiel Air Liquide -->
        <div class="al-header__brand">
          <a href="/" class="al-header__brand-link" aria-label="Accueil : Air Liquide Design System">
            <img
              src="/chrome/air-liquide/logo.svg"
              alt="Air Liquide"
              class="al-logo"
              width="106"
              height="34"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="al-nav" aria-label="Navigation principale">
          <ul class="al-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="al-nav__item">
                <a
                  class="al-nav__link"
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
        <div class="al-header__tools">
          <button
            type="button"
            class="al-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="al-header__tools-links">
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
          class="al-header__burger"
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

  <!-- ── BODY Air Liquide ── -->
  <div class="al-body">
    <!-- Sidebar -->
    <aside class="al-sidebar" aria-label="Navigation de la documentation">
      <nav class="al-side-nav" aria-label="Sommaire">
        <ul class="al-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="al-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="al-side-divider" role="separator"></li>

          <li class="al-side-heading">
            <a
              class="al-side-link al-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="al-side-group" open={isGroupOpen(group.items)}>
                <summary class="al-side-group__summary">
                  <ChevronDown class="al-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="al-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="al-side-link al-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="al-side-divider" role="separator"></li>

          <li class="al-side-heading">
            <a
              class="al-side-link al-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="al-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="al-side-group__summary">
                  <ChevronDown class="al-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="al-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="al-side-link al-side-link--sub"
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
      <div class="al-sidebar-footer">
        <span class="al-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="al-sidebar-github"
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
    <div class="al-content">
      <nav class="al-breadcrumb" aria-label="Breadcrumb">
        <ol class="al-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="al-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="al-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Air Liquide ── -->
  <footer class="al-footer" aria-label="Pied de page Air Liquide">
    <div class="al-footer__inner">
      <nav class="al-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="al-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/air-liquide/logo.svg"
        alt="Air Liquide"
        class="al-footer__logo"
        width="93"
        height="30"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Air Liquide ── */
  .al-shell {
    --al-primary: #375f9b; /* corporate blue (Pantone 7684 C) — action / lien */
    --al-primary-hover: #2c4d80; /* bleu survol */
    --al-primary-light: #e6ecf5; /* bleu clair (item actif sidebar) */
    --al-red: #d7001e; /* « Unique Red » (Pantone 2035 C) — accent / soulignement */
    --al-ink: #1f2a3a; /* corps / titres (dark slate) */
    --al-secondary: #6b7785; /* gris secondaire */
    --al-muted: #5a6573; /* gris atténué */
    --al-subtle: #f5f7fa; /* surface alt */
    --al-border: #d5dce5; /* bordure subtile / stroke champ */
    --al-border-strong: #b9c3cf; /* bordure forte (dérivée) */
    --al-white: #fff;
    --al-sidebar-width: 17rem;
    --al-radius: 4px;
    font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--al-white);
    color: var(--al-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Air Liquide ── */
  .al-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .al-header {
    background: var(--al-white);
    border-bottom: 1px solid var(--al-border);
  }

  .al-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .al-header__brand {
    flex: 0 0 auto;
  }

  .al-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 150ms ease;
  }

  .al-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Air Liquide (ratio préservé). */
  .al-logo {
    display: block;
    width: auto;
    height: 34px;
  }

  /* ── Nav horizontale (centre) ── */
  .al-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .al-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .al-nav__item {
    flex: 0 0 auto;
  }

  .al-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--al-ink);
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

  .al-nav__link:hover,
  .al-nav__link:focus-visible {
    color: var(--al-primary);
    outline: none;
  }

  .al-nav__link[aria-current="page"] {
    border-bottom-color: var(--al-red);
    color: var(--al-primary);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .al-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .al-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Air Liquide. */
  .al-header__tools-links :global(.docs-header-control) {
    background: var(--al-white);
    border-color: var(--al-border-strong);
    border-radius: var(--al-radius);
    color: var(--al-ink);
    font-family: inherit;
  }

  .al-header__tools-links :global(.docs-header-control:hover),
  .al-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--al-subtle);
    border-color: var(--al-red);
    color: var(--al-primary);
    box-shadow: none;
  }

  /* Recherche Air Liquide : bouton loupe compact. */
  .al-search__btn {
    align-items: center;
    background: var(--al-primary);
    border: 1px solid var(--al-primary);
    border-radius: var(--al-radius);
    color: var(--al-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 150ms ease, border-color 150ms ease;
  }

  .al-search__btn:hover,
  .al-search__btn:focus-visible {
    background: var(--al-primary-hover);
    border-color: var(--al-primary-hover);
    outline: 2px solid var(--al-primary);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .al-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--al-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Air Liquide ── */
  .al-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--al-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Air Liquide ── */
  .al-sidebar {
    background: var(--al-white);
    border-right: 1px solid var(--al-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .al-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .al-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--al-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .al-version-badge {
    background: var(--al-subtle);
    border: 1px solid var(--al-border);
    border-radius: var(--al-radius);
    color: var(--al-red);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .al-sidebar-github {
    align-items: center;
    color: var(--al-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 150ms ease;
  }

  .al-sidebar-github:hover,
  .al-sidebar-github:focus-visible {
    color: var(--al-primary);
  }

  .al-side-list,
  .al-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .al-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--al-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
  }

  .al-side-link:hover,
  .al-side-link:focus-visible {
    background: var(--al-subtle);
    color: var(--al-primary);
    text-decoration: none;
  }

  .al-side-link[aria-current="page"] {
    background: var(--al-primary-light);
    border-left-color: var(--al-primary);
    color: var(--al-primary);
    font-weight: 700;
    text-decoration: none;
  }

  .al-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .al-side-divider {
    border-top: 1px solid var(--al-border);
    margin: 0.5rem 0;
  }

  .al-side-group {
    display: block;
  }

  .al-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--al-secondary);
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

  .al-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .al-side-group__summary:hover,
  .al-side-group__summary:focus-visible {
    background: var(--al-subtle);
    outline: none;
  }

  .al-side-group :global(.al-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 150ms ease;
  }

  .al-side-group:not([open]) :global(.al-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .al-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .al-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .al-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .al-breadcrumb__item {
    align-items: center;
    color: var(--al-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .al-breadcrumb__item + .al-breadcrumb__item::before {
    color: var(--al-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .al-breadcrumb__link {
    color: var(--al-primary);
    text-decoration: none;
  }

  .al-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .al-breadcrumb__item span[aria-current="page"] {
    color: var(--al-ink);
    font-weight: 600;
  }

  /* ── Footer Air Liquide ── */
  .al-footer {
    background: var(--al-subtle);
    border-top: 1px solid var(--al-border);
    margin-top: auto;
  }

  .al-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .al-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .al-footer__link {
    color: var(--al-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .al-footer__link:hover {
    color: var(--al-primary);
    text-decoration: underline;
  }

  .al-footer__logo {
    display: block;
    width: auto;
    height: 30px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .al-body {
      grid-template-columns: 1fr;
    }

    .al-sidebar {
      display: none;
    }

    .al-nav {
      display: none;
    }

    .al-header__tools {
      display: none;
    }

    .al-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .al-nav__link,
    .al-search__btn,
    .al-side-link,
    .al-side-group :global(.al-side-group__icon) {
      transition: none;
    }
  }
</style>

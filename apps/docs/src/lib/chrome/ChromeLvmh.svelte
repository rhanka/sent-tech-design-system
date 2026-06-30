<!--
  Chrome documentaire LVMH (lvmh.com — Moët Hennessy Louis Vuitton).
  Forme fidèle à l'en-tête corporate luxe de LVMH : sobre, raffiné, chaleureux.
  - Header : bandeau OFF-WHITE chaud #f7f3ed, logo OFFICIEL LVMH (lockup
    « LVMH / Moët Hennessy · Louis Vuitton ») à gauche, nav CAPITALES espacées au
    centre, recherche carrée encre à droite
  - Coins CARRÉS (radius 0) — signature LVMH ; onglet actif = SOULIGNÉ OR (#bb8e24)
  - Barre latérale : item actif liseré or + fond beige subtil
  - Couleurs MESURÉES sur lvmh.com : encre navy #030f2b, gris-bleu #55626e,
    off-white chaud #f7f3ed, beige #e0d6c8, or #bb8e24, champagne #e5d8ac,
    focus bleu #0071f0
  - Logo OFFICIEL LVMH (vecteur, full lockup) via <img src="/chrome/lvmh/logo.svg">
  - Typo : familles LVMH propriétaires indisponibles → repli sans système
    ('Helvetica Neue', Arial) + capitales espacées (aucune police réseau chargée)
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

<div class="lvmh-shell">
  <!-- ── HEADER LVMH ── -->
  <div class="lvmh-header-wrap">
    <header class="lvmh-header" aria-label="LVMH">
      <div class="lvmh-header__inner">
        <!-- Gauche : logo officiel LVMH -->
        <div class="lvmh-header__brand">
          <a href="/" class="lvmh-header__brand-link" aria-label="Accueil : LVMH Design System">
            <img
              src="/chrome/lvmh/logo.svg"
              alt="LVMH"
              class="lvmh-logo"
              width="186"
              height="30"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="lvmh-nav" aria-label="Navigation principale">
          <ul class="lvmh-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="lvmh-nav__item">
                <a
                  class="lvmh-nav__link"
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
        <div class="lvmh-header__tools">
          <button
            type="button"
            class="lvmh-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="lvmh-header__tools-links">
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
          class="lvmh-header__burger"
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

  <!-- ── BODY LVMH ── -->
  <div class="lvmh-body">
    <!-- Sidebar -->
    <aside class="lvmh-sidebar" aria-label="Navigation de la documentation">
      <nav class="lvmh-side-nav" aria-label="Sommaire">
        <ul class="lvmh-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="lvmh-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="lvmh-side-divider" role="separator"></li>

          <li class="lvmh-side-heading">
            <a
              class="lvmh-side-link lvmh-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="lvmh-side-group" open={isGroupOpen(group.items)}>
                <summary class="lvmh-side-group__summary">
                  <ChevronDown class="lvmh-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="lvmh-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="lvmh-side-link lvmh-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="lvmh-side-divider" role="separator"></li>

          <li class="lvmh-side-heading">
            <a
              class="lvmh-side-link lvmh-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="lvmh-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="lvmh-side-group__summary">
                  <ChevronDown class="lvmh-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="lvmh-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="lvmh-side-link lvmh-side-link--sub"
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
      <div class="lvmh-sidebar-footer">
        <span class="lvmh-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="lvmh-sidebar-github"
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
    <div class="lvmh-content">
      <nav class="lvmh-breadcrumb" aria-label="Breadcrumb">
        <ol class="lvmh-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="lvmh-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="lvmh-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER LVMH ── -->
  <footer class="lvmh-footer" aria-label="Pied de page LVMH">
    <div class="lvmh-footer__inner">
      <nav class="lvmh-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="lvmh-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/lvmh/logo.svg"
        alt="LVMH"
        class="lvmh-footer__logo"
        width="161"
        height="26"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables LVMH ── */
  .lvmh-shell {
    --lvmh-primary: #030f2b; /* corporate-darkBlue (navy) */
    --lvmh-primary-hover: #2b364f; /* darkBlueGraph-2 */
    --lvmh-primary-light: #f0ece3; /* beige tint (item actif sidebar) */
    --lvmh-ink: #030f2b; /* encre / titres (navy) */
    --lvmh-ink-2: #2b364f;
    --lvmh-secondary: #55626e; /* gris-bleu texte secondaire */
    --lvmh-gold: #bb8e24; /* or accent (thematique-yellow) */
    --lvmh-gold-dark: #8f6e1b; /* or foncé */
    --lvmh-warm: #f7f3ed; /* off-white chaud (ultraLightWarmWhite) */
    --lvmh-subtle: #f0ece3; /* surface beige subtile */
    --lvmh-border: #e0d6c8; /* beige bordure */
    --lvmh-border-strong: #cbbfac;
    --lvmh-focus: #0071f0; /* accessibility blue */
    --lvmh-white: #fff;
    --lvmh-sidebar-width: 17rem;
    --lvmh-radius: 0;
    font-family: 'Helvetica Neue', Arial, 'Segoe UI', sans-serif;
    background: var(--lvmh-white);
    color: var(--lvmh-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header LVMH ── */
  .lvmh-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .lvmh-header {
    background: var(--lvmh-warm);
    border-bottom: 1px solid var(--lvmh-border);
  }

  .lvmh-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .lvmh-header__brand {
    flex: 0 0 auto;
  }

  .lvmh-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 200ms ease;
  }

  .lvmh-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel LVMH (ratio préservé). */
  .lvmh-logo {
    display: block;
    width: auto;
    height: 30px;
  }

  /* ── Nav horizontale (centre) ── */
  .lvmh-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .lvmh-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .lvmh-nav__item {
    flex: 0 0 auto;
  }

  .lvmh-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--lvmh-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    transition: border-color 200ms ease, color 200ms ease;
    white-space: nowrap;
  }

  .lvmh-nav__link:hover,
  .lvmh-nav__link:focus-visible {
    color: var(--lvmh-ink);
    outline: none;
  }

  .lvmh-nav__link[aria-current="page"] {
    border-bottom-color: var(--lvmh-gold);
    color: var(--lvmh-ink);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .lvmh-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .lvmh-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header LVMH. */
  .lvmh-header__tools-links :global(.docs-header-control) {
    background: var(--lvmh-white);
    border-color: var(--lvmh-border-strong);
    border-radius: var(--lvmh-radius);
    color: var(--lvmh-ink);
    font-family: inherit;
  }

  .lvmh-header__tools-links :global(.docs-header-control:hover),
  .lvmh-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--lvmh-warm);
    border-color: var(--lvmh-gold);
    color: var(--lvmh-ink);
    box-shadow: none;
  }

  /* Recherche LVMH : bouton loupe compact. */
  .lvmh-search__btn {
    align-items: center;
    background: var(--lvmh-ink);
    border: 1px solid var(--lvmh-ink);
    border-radius: var(--lvmh-radius);
    color: var(--lvmh-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 200ms ease, border-color 200ms ease;
  }

  .lvmh-search__btn:hover,
  .lvmh-search__btn:focus-visible {
    background: var(--lvmh-ink-2);
    border-color: var(--lvmh-ink-2);
    outline: 2px solid var(--lvmh-focus);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .lvmh-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--lvmh-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body LVMH ── */
  .lvmh-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--lvmh-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar LVMH ── */
  .lvmh-sidebar {
    background: var(--lvmh-white);
    border-right: 1px solid var(--lvmh-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .lvmh-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .lvmh-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--lvmh-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .lvmh-version-badge {
    background: var(--lvmh-subtle);
    border: 1px solid var(--lvmh-border);
    border-radius: var(--lvmh-radius);
    color: var(--lvmh-gold-dark);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .lvmh-sidebar-github {
    align-items: center;
    color: var(--lvmh-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 200ms ease;
  }

  .lvmh-sidebar-github:hover,
  .lvmh-sidebar-github:focus-visible {
    color: var(--lvmh-primary);
  }

  .lvmh-side-list,
  .lvmh-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .lvmh-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--lvmh-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 200ms ease, border-color 200ms ease, color 200ms ease;
  }

  .lvmh-side-link:hover,
  .lvmh-side-link:focus-visible {
    background: var(--lvmh-subtle);
    color: var(--lvmh-primary);
    text-decoration: none;
  }

  .lvmh-side-link[aria-current="page"] {
    background: var(--lvmh-primary-light);
    border-left-color: var(--lvmh-primary);
    color: var(--lvmh-ink);
    font-weight: 700;
    text-decoration: none;
  }

  .lvmh-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .lvmh-side-divider {
    border-top: 1px solid var(--lvmh-border);
    margin: 0.5rem 0;
  }

  .lvmh-side-group {
    display: block;
  }

  .lvmh-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--lvmh-secondary);
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

  .lvmh-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .lvmh-side-group__summary:hover,
  .lvmh-side-group__summary:focus-visible {
    background: var(--lvmh-subtle);
    outline: none;
  }

  .lvmh-side-group :global(.lvmh-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 200ms ease;
  }

  .lvmh-side-group:not([open]) :global(.lvmh-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .lvmh-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .lvmh-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .lvmh-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .lvmh-breadcrumb__item {
    align-items: center;
    color: var(--lvmh-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .lvmh-breadcrumb__item + .lvmh-breadcrumb__item::before {
    color: var(--lvmh-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .lvmh-breadcrumb__link {
    color: var(--lvmh-primary);
    text-decoration: none;
  }

  .lvmh-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .lvmh-breadcrumb__item span[aria-current="page"] {
    color: var(--lvmh-ink);
    font-weight: 600;
  }

  /* ── Footer LVMH ── */
  .lvmh-footer {
    background: var(--lvmh-subtle);
    border-top: 1px solid var(--lvmh-border);
    margin-top: auto;
  }

  .lvmh-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .lvmh-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .lvmh-footer__link {
    color: var(--lvmh-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .lvmh-footer__link:hover {
    color: var(--lvmh-primary);
    text-decoration: underline;
  }

  .lvmh-footer__logo {
    display: block;
    width: auto;
    height: 26px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .lvmh-body {
      grid-template-columns: 1fr;
    }

    .lvmh-sidebar {
      display: none;
    }

    .lvmh-nav {
      display: none;
    }

    .lvmh-header__tools {
      display: none;
    }

    .lvmh-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .lvmh-nav__link,
    .lvmh-search__btn,
    .lvmh-side-link,
    .lvmh-side-group :global(.lvmh-side-group__icon) {
      transition: none;
    }
  }
</style>

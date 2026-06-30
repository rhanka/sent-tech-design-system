<!--
  Chrome documentaire Databricks (databricks.com — Databricks, Inc.).
  Forme fidèle à l'en-tête corporate Databricks : net, chaleureux, "Lava" en accent.
  - Header : bandeau BLANC, logo OFFICIEL Databricks (symbole "Lava" + mot-clé
    « databricks ») à gauche, nav horizontale au centre, loupe Lava à droite
  - Coins LÉGÈREMENT arrondis (radius 4px) — produit Databricks net ; onglet actif =
    SOULIGNÉ LAVA #ff3621 (indicateur 2px, comme les tabs Databricks)
  - Barre latérale : item actif liseré Lava + fond Oat subtil
  - Couleurs MESURÉES sur databricks.com (cf. theme-databricks) : Lava #ff3621,
    Navy 800 #1b3139, navy-grey #5b6b71, Oat Light #f4f0e7, Oat Medium #dbd7ce,
    Lava tint #ffe7e2, Lava hover #e62d18, focus Navy #1b3139
  - Logo OFFICIEL Databricks (symbole canonique simple-icons + mot-clé) via
    <img src="/chrome/databricks/logo.svg">
  - Typo : DM Sans (typeface de marque Databricks, nommée seulement) avec repli
    système ; aucune police réseau chargée
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

<div class="dbx-shell">
  <!-- ── HEADER DATABRICKS ── -->
  <div class="dbx-header-wrap">
    <header class="dbx-header" aria-label="Databricks">
      <div class="dbx-header__inner">
        <!-- Gauche : logo officiel Databricks -->
        <div class="dbx-header__brand">
          <a href="/" class="dbx-header__brand-link" aria-label="Accueil : Databricks Design System">
            <img
              src="/chrome/databricks/logo.svg"
              alt="Databricks"
              class="dbx-logo"
              width="184"
              height="36"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="dbx-nav" aria-label="Navigation principale">
          <ul class="dbx-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="dbx-nav__item">
                <a
                  class="dbx-nav__link"
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
        <div class="dbx-header__tools">
          <button
            type="button"
            class="dbx-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="dbx-header__tools-links">
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
          class="dbx-header__burger"
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

  <!-- ── BODY DATABRICKS ── -->
  <div class="dbx-body">
    <!-- Sidebar -->
    <aside class="dbx-sidebar" aria-label="Navigation de la documentation">
      <nav class="dbx-side-nav" aria-label="Sommaire">
        <ul class="dbx-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="dbx-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="dbx-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="dbx-side-group" open={isGroupOpen(group.items)}>
                <summary class="dbx-side-group__summary">
                  <ChevronDown class="dbx-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="dbx-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="dbx-side-link dbx-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="dbx-side-divider" role="separator"></li>

          <li>
            <a
              class="dbx-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="dbx-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="dbx-side-group__summary">
                  <ChevronDown class="dbx-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="dbx-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="dbx-side-link dbx-side-link--sub"
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
      <div class="dbx-sidebar-footer">
        <span class="dbx-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="dbx-sidebar-github"
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
    <div class="dbx-content">
      <nav class="dbx-breadcrumb" aria-label="Breadcrumb">
        <ol class="dbx-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="dbx-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="dbx-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER DATABRICKS ── -->
  <footer class="dbx-footer" aria-label="Pied de page Databricks">
    <div class="dbx-footer__inner">
      <nav class="dbx-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="dbx-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/databricks/logo.svg"
        alt="Databricks"
        class="dbx-footer__logo"
        width="164"
        height="32"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Databricks ── */
  .dbx-shell {
    --dbx-primary: #ff3621; /* Lava 600 — brand / action (measured) */
    --dbx-primary-hover: #e62d18; /* darker Lava (à confirmer) */
    --dbx-primary-light: #ffe7e2; /* light Lava tint (item actif sidebar) */
    --dbx-ink: #1b3139; /* Navy 800 — encre / titres (measured) */
    --dbx-ink-2: #2e4148; /* navy mid */
    --dbx-secondary: #5b6b71; /* navy-grey texte secondaire */
    --dbx-warm: #f4f0e7; /* Oat Light — fond chaud (measured) */
    --dbx-subtle: #f4f0e7; /* surface Oat subtile */
    --dbx-border: #dbd7ce; /* Oat Medium bordure (measured) */
    --dbx-border-strong: #b9b3a6; /* Oat strong */
    --dbx-focus: #1b3139; /* focus Navy (distinct du Lava) */
    --dbx-white: #fff;
    --dbx-sidebar-width: 17rem;
    --dbx-radius: 0.25rem; /* 4px — Databricks net, légèrement arrondi */
    font-family: 'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--dbx-white);
    color: var(--dbx-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Databricks ── */
  .dbx-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .dbx-header {
    background: var(--dbx-white);
    border-bottom: 1px solid var(--dbx-border);
  }

  .dbx-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .dbx-header__brand {
    flex: 0 0 auto;
  }

  .dbx-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 200ms ease;
  }

  .dbx-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Databricks (ratio préservé). */
  .dbx-logo {
    display: block;
    width: auto;
    height: 32px;
  }

  /* ── Nav horizontale (centre) ── */
  .dbx-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .dbx-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .dbx-nav__item {
    flex: 0 0 auto;
  }

  .dbx-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--dbx-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 200ms ease, color 200ms ease;
    white-space: nowrap;
  }

  .dbx-nav__link:hover,
  .dbx-nav__link:focus-visible {
    color: var(--dbx-primary);
    outline: none;
  }

  .dbx-nav__link[aria-current="page"] {
    border-bottom-color: var(--dbx-primary);
    color: var(--dbx-primary);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .dbx-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .dbx-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Databricks. */
  .dbx-header__tools-links :global(.docs-header-control) {
    background: var(--dbx-white);
    border-color: var(--dbx-border-strong);
    border-radius: var(--dbx-radius);
    color: var(--dbx-ink);
    font-family: inherit;
  }

  .dbx-header__tools-links :global(.docs-header-control:hover),
  .dbx-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--dbx-warm);
    border-color: var(--dbx-primary);
    color: var(--dbx-ink);
    box-shadow: none;
  }

  /* Recherche Databricks : bouton loupe Lava compact. */
  .dbx-search__btn {
    align-items: center;
    background: var(--dbx-primary);
    border: 1px solid var(--dbx-primary);
    border-radius: var(--dbx-radius);
    color: var(--dbx-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 200ms ease, border-color 200ms ease;
  }

  .dbx-search__btn:hover,
  .dbx-search__btn:focus-visible {
    background: var(--dbx-primary-hover);
    border-color: var(--dbx-primary-hover);
    outline: 2px solid var(--dbx-focus);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .dbx-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--dbx-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Databricks ── */
  .dbx-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--dbx-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Databricks ── */
  .dbx-sidebar {
    background: var(--dbx-white);
    border-right: 1px solid var(--dbx-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .dbx-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .dbx-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--dbx-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .dbx-version-badge {
    background: var(--dbx-subtle);
    border: 1px solid var(--dbx-border);
    border-radius: var(--dbx-radius);
    color: var(--dbx-ink);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .dbx-sidebar-github {
    align-items: center;
    color: var(--dbx-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 200ms ease;
  }

  .dbx-sidebar-github:hover,
  .dbx-sidebar-github:focus-visible {
    color: var(--dbx-primary);
  }

  .dbx-side-list,
  .dbx-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .dbx-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--dbx-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 200ms ease, border-color 200ms ease, color 200ms ease;
  }

  .dbx-side-link:hover,
  .dbx-side-link:focus-visible {
    background: var(--dbx-subtle);
    color: var(--dbx-primary);
    text-decoration: none;
  }

  .dbx-side-link[aria-current="page"] {
    background: var(--dbx-primary-light);
    border-left-color: var(--dbx-primary);
    color: var(--dbx-ink);
    font-weight: 700;
    text-decoration: none;
  }

  .dbx-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .dbx-side-divider {
    border-top: 1px solid var(--dbx-border);
    margin: 0.5rem 0;
  }

  .dbx-side-group {
    display: block;
  }

  .dbx-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--dbx-secondary);
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

  .dbx-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .dbx-side-group__summary:hover,
  .dbx-side-group__summary:focus-visible {
    background: var(--dbx-subtle);
    outline: none;
  }

  .dbx-side-group :global(.dbx-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 200ms ease;
  }

  .dbx-side-group:not([open]) :global(.dbx-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .dbx-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .dbx-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .dbx-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .dbx-breadcrumb__item {
    align-items: center;
    color: var(--dbx-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .dbx-breadcrumb__item + .dbx-breadcrumb__item::before {
    color: var(--dbx-border-strong);
    content: "›";
    margin: 0 0.4rem;
  }

  .dbx-breadcrumb__link {
    color: var(--dbx-primary);
    text-decoration: none;
  }

  .dbx-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .dbx-breadcrumb__item span[aria-current="page"] {
    color: var(--dbx-ink);
    font-weight: 600;
  }

  /* ── Footer Databricks ── */
  .dbx-footer {
    background: var(--dbx-subtle);
    border-top: 1px solid var(--dbx-border);
    margin-top: auto;
  }

  .dbx-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .dbx-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .dbx-footer__link {
    color: var(--dbx-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .dbx-footer__link:hover {
    color: var(--dbx-primary);
    text-decoration: underline;
  }

  .dbx-footer__logo {
    display: block;
    width: auto;
    height: 28px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .dbx-body {
      grid-template-columns: 1fr;
    }

    .dbx-sidebar {
      display: none;
    }

    .dbx-nav {
      display: none;
    }

    .dbx-header__tools {
      display: none;
    }

    .dbx-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .dbx-nav__link,
    .dbx-search__btn,
    .dbx-side-link,
    .dbx-side-group :global(.dbx-side-group__icon) {
      transition: none;
    }
  }
</style>

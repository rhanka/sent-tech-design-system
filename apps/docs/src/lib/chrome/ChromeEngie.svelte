<!--
  Chrome documentaire ENGIE (engie.com — énergéticien).
  Forme fidèle au Fluid Design System d'ENGIE : clair, « Blue Bolt » d'action.
  - Header : bandeau BLANC, logo OFFICIEL ENGIE (logotype + swirl) à gauche,
    nav au centre, recherche « Blue Bolt » à droite
  - Onglet actif = SOULIGNÉ « Blue Bolt » #007ACD + texte bleu ; item sidebar actif
    = liseré bleu + fond bleu clair
  - Couleurs MESURÉES (Fluid) : « Blue Bolt » #007ACD (Blue 600, action/lien), survol
    #0061a4, « Blue Logo » #00AAFF (réservé au logotype/dégradé), encre #1b2733,
    gris #6b7280 / #4b5563, surface #f3f5f7, bordure #d4d9e0
  - Logo OFFICIEL ENGIE (vecteur Wikimedia) via <img src="/chrome/engie/logo.svg">
  - Typo : « Lato » (Fluid, interfaces digitales) référencée par NOM → repli système
    sans chargement réseau
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

<div class="eng-shell">
  <!-- ── HEADER ENGIE ── -->
  <div class="eng-header-wrap">
    <header class="eng-header" aria-label="ENGIE">
      <div class="eng-header__inner">
        <!-- Gauche : logo officiel ENGIE -->
        <div class="eng-header__brand">
          <a href="/" class="eng-header__brand-link" aria-label="Accueil : ENGIE Design System">
            <img
              src="/chrome/engie/logo.svg"
              alt="ENGIE"
              class="eng-logo"
              width="86"
              height="32"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="eng-nav" aria-label="Navigation principale">
          <ul class="eng-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="eng-nav__item">
                <a
                  class="eng-nav__link"
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
        <div class="eng-header__tools">
          <button
            type="button"
            class="eng-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="eng-header__tools-links">
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
          class="eng-header__burger"
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

  <!-- ── BODY ENGIE ── -->
  <div class="eng-body">
    <!-- Sidebar -->
    <aside class="eng-sidebar" aria-label="Navigation de la documentation">
      <nav class="eng-side-nav" aria-label="Sommaire">
        <ul class="eng-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="eng-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="eng-side-divider" role="separator"></li>

          <li class="eng-side-heading">
            <a
              class="eng-side-link eng-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="eng-side-group" open={isGroupOpen(group.items)}>
                <summary class="eng-side-group__summary">
                  <ChevronDown class="eng-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="eng-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="eng-side-link eng-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="eng-side-divider" role="separator"></li>

          <li class="eng-side-heading">
            <a
              class="eng-side-link eng-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="eng-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="eng-side-group__summary">
                  <ChevronDown class="eng-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="eng-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="eng-side-link eng-side-link--sub"
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
      <div class="eng-sidebar-footer">
        <span class="eng-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="eng-sidebar-github"
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
    <div class="eng-content">
      <nav class="eng-breadcrumb" aria-label="Breadcrumb">
        <ol class="eng-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="eng-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="eng-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER ENGIE ── -->
  <footer class="eng-footer" aria-label="Pied de page ENGIE">
    <div class="eng-footer__inner">
      <nav class="eng-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="eng-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/engie/logo.svg"
        alt="ENGIE"
        class="eng-footer__logo"
        width="75"
        height="28"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables ENGIE ── */
  .eng-shell {
    --eng-primary: #007acd; /* « Blue Bolt » (Blue 600) — action / lien / CTA */
    --eng-primary-hover: #0061a4; /* bleu survol */
    --eng-primary-light: #e5f5fc; /* bleu clair (item actif sidebar) */
    --eng-logo: #00aaff; /* « Blue Logo » — réservé logotype / dégradé (non interactif) */
    --eng-ink: #1b2733; /* corps / titres (dark slate) */
    --eng-secondary: #6b7280; /* gris secondaire */
    --eng-muted: #4b5563; /* gris atténué */
    --eng-subtle: #f3f5f7; /* surface alt */
    --eng-border: #d4d9e0; /* bordure subtile / stroke champ */
    --eng-border-strong: #b9c0ca; /* bordure forte (dérivée) */
    --eng-white: #fff;
    --eng-sidebar-width: 17rem;
    --eng-radius: 4px;
    font-family: 'Lato', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--eng-white);
    color: var(--eng-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header ENGIE ── */
  .eng-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .eng-header {
    background: var(--eng-white);
    border-bottom: 1px solid var(--eng-border);
  }

  .eng-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .eng-header__brand {
    flex: 0 0 auto;
  }

  .eng-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 150ms ease;
  }

  .eng-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel ENGIE (ratio préservé). */
  .eng-logo {
    display: block;
    width: auto;
    height: 32px;
  }

  /* ── Nav horizontale (centre) ── */
  .eng-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .eng-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .eng-nav__item {
    flex: 0 0 auto;
  }

  .eng-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--eng-ink);
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

  .eng-nav__link:hover,
  .eng-nav__link:focus-visible {
    color: var(--eng-primary);
    outline: none;
  }

  .eng-nav__link[aria-current="page"] {
    border-bottom-color: var(--eng-primary);
    color: var(--eng-primary);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .eng-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .eng-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header ENGIE. */
  .eng-header__tools-links :global(.docs-header-control) {
    background: var(--eng-white);
    border-color: var(--eng-border-strong);
    border-radius: var(--eng-radius);
    color: var(--eng-ink);
    font-family: inherit;
  }

  .eng-header__tools-links :global(.docs-header-control:hover),
  .eng-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--eng-subtle);
    border-color: var(--eng-primary);
    color: var(--eng-primary);
    box-shadow: none;
  }

  /* Recherche ENGIE : bouton loupe compact. */
  .eng-search__btn {
    align-items: center;
    background: var(--eng-primary);
    border: 1px solid var(--eng-primary);
    border-radius: var(--eng-radius);
    color: var(--eng-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 150ms ease, border-color 150ms ease;
  }

  .eng-search__btn:hover,
  .eng-search__btn:focus-visible {
    background: var(--eng-primary-hover);
    border-color: var(--eng-primary-hover);
    outline: 2px solid var(--eng-primary);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .eng-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--eng-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body ENGIE ── */
  .eng-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--eng-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar ENGIE ── */
  .eng-sidebar {
    background: var(--eng-white);
    border-right: 1px solid var(--eng-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .eng-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .eng-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--eng-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .eng-version-badge {
    background: var(--eng-subtle);
    border: 1px solid var(--eng-border);
    border-radius: var(--eng-radius);
    color: var(--eng-primary);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .eng-sidebar-github {
    align-items: center;
    color: var(--eng-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 150ms ease;
  }

  .eng-sidebar-github:hover,
  .eng-sidebar-github:focus-visible {
    color: var(--eng-primary);
  }

  .eng-side-list,
  .eng-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .eng-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--eng-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
  }

  .eng-side-link:hover,
  .eng-side-link:focus-visible {
    background: var(--eng-subtle);
    color: var(--eng-primary);
    text-decoration: none;
  }

  .eng-side-link[aria-current="page"] {
    background: var(--eng-primary-light);
    border-left-color: var(--eng-primary);
    color: var(--eng-primary);
    font-weight: 700;
    text-decoration: none;
  }

  .eng-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .eng-side-divider {
    border-top: 1px solid var(--eng-border);
    margin: 0.5rem 0;
  }

  .eng-side-group {
    display: block;
  }

  .eng-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--eng-secondary);
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

  .eng-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .eng-side-group__summary:hover,
  .eng-side-group__summary:focus-visible {
    background: var(--eng-subtle);
    outline: none;
  }

  .eng-side-group :global(.eng-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 150ms ease;
  }

  .eng-side-group:not([open]) :global(.eng-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .eng-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .eng-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .eng-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .eng-breadcrumb__item {
    align-items: center;
    color: var(--eng-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .eng-breadcrumb__item + .eng-breadcrumb__item::before {
    color: var(--eng-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .eng-breadcrumb__link {
    color: var(--eng-primary);
    text-decoration: none;
  }

  .eng-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .eng-breadcrumb__item span[aria-current="page"] {
    color: var(--eng-ink);
    font-weight: 600;
  }

  /* ── Footer ENGIE ── */
  .eng-footer {
    background: var(--eng-subtle);
    border-top: 1px solid var(--eng-border);
    margin-top: auto;
  }

  .eng-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .eng-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .eng-footer__link {
    color: var(--eng-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .eng-footer__link:hover {
    color: var(--eng-primary);
    text-decoration: underline;
  }

  .eng-footer__logo {
    display: block;
    width: auto;
    height: 28px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .eng-body {
      grid-template-columns: 1fr;
    }

    .eng-sidebar {
      display: none;
    }

    .eng-nav {
      display: none;
    }

    .eng-header__tools {
      display: none;
    }

    .eng-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .eng-nav__link,
    .eng-search__btn,
    .eng-side-link,
    .eng-side-group :global(.eng-side-group__icon) {
      transition: none;
    }
  }
</style>

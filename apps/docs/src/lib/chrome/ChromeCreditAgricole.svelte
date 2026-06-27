<!--
  Chrome documentaire Crédit Agricole (credit-agricole.com — « la banque verte »).
  Forme fidele a l'identite CA : clair, vert institutionnel, approche chaleureuse.
  - Header : bandeau BLANC, logo OFFICIEL Crédit Agricole (embleme comete + wordmark
    vert) a gauche, nav au centre, recherche verte a droite
  - Onglet actif = SOULIGNE vert CA #006f4e + texte vert ; item sidebar actif =
    lisere vert + fond vert tres clair
  - Couleurs MESUREES (theme-credit-agricole) : vert CA #006f4e (primaire, survol
    #00553c), teal #009b9d, rouge CA #ed1c24, encre #16201b, gris #3a423f,
    surface #f4f6f5, bordure #dfe3e1
  - Logo OFFICIEL Crédit Agricole (vecteur Wikimedia) via <img src="/chrome/credit-agricole/logo.svg">
  - Typo : sans humaniste de marque (nom public non confirme) → repli systeme
    (system-ui, 'Segoe UI') sans chargement reseau
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

<div class="ca-shell">
  <!-- ── HEADER Crédit Agricole ── -->
  <div class="ca-header-wrap">
    <header class="ca-header" aria-label="Crédit Agricole">
      <div class="ca-header__inner">
        <!-- Gauche : logo officiel Crédit Agricole -->
        <div class="ca-header__brand">
          <a href="/" class="ca-header__brand-link" aria-label="Accueil : Crédit Agricole Design System">
            <img
              src="/chrome/credit-agricole/logo.svg"
              alt="Crédit Agricole"
              class="ca-logo"
              width="127"
              height="28"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="ca-nav" aria-label="Navigation principale">
          <ul class="ca-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="ca-nav__item">
                <a
                  class="ca-nav__link"
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
        <div class="ca-header__tools">
          <button
            type="button"
            class="ca-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="ca-header__tools-links">
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
          class="ca-header__burger"
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

  <!-- ── BODY Crédit Agricole ── -->
  <div class="ca-body">
    <!-- Sidebar -->
    <aside class="ca-sidebar" aria-label="Navigation de la documentation">
      <nav class="ca-side-nav" aria-label="Sommaire">
        <ul class="ca-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="ca-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="ca-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="ca-side-group" open={isGroupOpen(group.items)}>
                <summary class="ca-side-group__summary">
                  <ChevronDown class="ca-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="ca-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="ca-side-link ca-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="ca-side-divider" role="separator"></li>

          <li>
            <a
              class="ca-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="ca-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="ca-side-group__summary">
                  <ChevronDown class="ca-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="ca-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="ca-side-link ca-side-link--sub"
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
      <div class="ca-sidebar-footer">
        <span class="ca-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="ca-sidebar-github"
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
    <div class="ca-content">
      <nav class="ca-breadcrumb" aria-label="Breadcrumb">
        <ol class="ca-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="ca-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="ca-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Crédit Agricole ── -->
  <footer class="ca-footer" aria-label="Pied de page Crédit Agricole">
    <div class="ca-footer__inner">
      <nav class="ca-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="ca-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/credit-agricole/logo.svg"
        alt="Crédit Agricole"
        class="ca-footer__logo"
        width="109"
        height="24"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Crédit Agricole ── */
  .ca-shell {
    --ca-primary: #006f4e; /* vert CA « banque verte » (primaire) */
    --ca-primary-hover: #00553c; /* vert plus profond (survol) */
    --ca-primary-light: #e5f1ec; /* vert tres clair (item actif sidebar) */
    --ca-teal: #009b9d; /* teal CA (accent) */
    --ca-ink: #16201b; /* corps / titres (near-black vert-gris) */
    --ca-secondary: #3a423f; /* gris secondaire */
    --ca-subtle: #f4f6f5; /* surface */
    --ca-border: #dfe3e1; /* bordure subtile */
    --ca-border-strong: #c0c6c3; /* bordure champ */
    --ca-focus: #006f4e; /* anneau focus vert */
    --ca-white: #fff;
    --ca-sidebar-width: 17rem;
    --ca-radius: 0.375rem;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    background: var(--ca-white);
    color: var(--ca-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Crédit Agricole ── */
  .ca-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .ca-header {
    background: var(--ca-white);
    border-bottom: 1px solid var(--ca-border);
  }

  .ca-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .ca-header__brand {
    flex: 0 0 auto;
  }

  .ca-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 180ms ease;
  }

  .ca-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Crédit Agricole (ratio préservé). */
  .ca-logo {
    display: block;
    width: auto;
    height: 28px;
  }

  /* ── Nav horizontale (centre) ── */
  .ca-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .ca-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ca-nav__item {
    flex: 0 0 auto;
  }

  .ca-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--ca-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: none;
    letter-spacing: normal;
    transition: border-color 180ms ease, color 180ms ease;
    white-space: nowrap;
  }

  .ca-nav__link:hover,
  .ca-nav__link:focus-visible {
    color: var(--ca-primary);
    outline: none;
  }

  .ca-nav__link[aria-current="page"] {
    border-bottom-color: var(--ca-primary);
    color: var(--ca-primary);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .ca-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .ca-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Crédit Agricole. */
  .ca-header__tools-links :global(.docs-header-control) {
    background: var(--ca-white);
    border-color: var(--ca-border-strong);
    border-radius: var(--ca-radius);
    color: var(--ca-ink);
    font-family: inherit;
  }

  .ca-header__tools-links :global(.docs-header-control:hover),
  .ca-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--ca-subtle);
    border-color: var(--ca-primary);
    color: var(--ca-primary);
    box-shadow: none;
  }

  /* Recherche Crédit Agricole : bouton loupe compact. */
  .ca-search__btn {
    align-items: center;
    background: var(--ca-primary);
    border: 1px solid var(--ca-primary);
    border-radius: var(--ca-radius);
    color: var(--ca-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 180ms ease, border-color 180ms ease;
  }

  .ca-search__btn:hover,
  .ca-search__btn:focus-visible {
    background: var(--ca-primary-hover);
    border-color: var(--ca-primary-hover);
    outline: 2px solid var(--ca-focus);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .ca-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--ca-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Crédit Agricole ── */
  .ca-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--ca-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Crédit Agricole ── */
  .ca-sidebar {
    background: var(--ca-white);
    border-right: 1px solid var(--ca-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .ca-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .ca-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--ca-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .ca-version-badge {
    background: var(--ca-subtle);
    border: 1px solid var(--ca-border);
    border-radius: var(--ca-radius);
    color: var(--ca-primary);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .ca-sidebar-github {
    align-items: center;
    color: var(--ca-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 180ms ease;
  }

  .ca-sidebar-github:hover,
  .ca-sidebar-github:focus-visible {
    color: var(--ca-primary);
  }

  .ca-side-list,
  .ca-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ca-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--ca-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
  }

  .ca-side-link:hover,
  .ca-side-link:focus-visible {
    background: var(--ca-subtle);
    color: var(--ca-primary);
    text-decoration: none;
  }

  .ca-side-link[aria-current="page"] {
    background: var(--ca-primary-light);
    border-left-color: var(--ca-primary);
    color: var(--ca-primary);
    font-weight: 700;
    text-decoration: none;
  }

  .ca-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .ca-side-divider {
    border-top: 1px solid var(--ca-border);
    margin: 0.5rem 0;
  }

  .ca-side-group {
    display: block;
  }

  .ca-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--ca-secondary);
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
    transition: background 180ms ease;
  }

  .ca-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .ca-side-group__summary:hover,
  .ca-side-group__summary:focus-visible {
    background: var(--ca-subtle);
    outline: none;
  }

  .ca-side-group :global(.ca-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 180ms ease;
  }

  .ca-side-group:not([open]) :global(.ca-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .ca-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .ca-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .ca-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ca-breadcrumb__item {
    align-items: center;
    color: var(--ca-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .ca-breadcrumb__item + .ca-breadcrumb__item::before {
    color: var(--ca-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .ca-breadcrumb__link {
    color: var(--ca-primary);
    text-decoration: none;
  }

  .ca-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .ca-breadcrumb__item span[aria-current="page"] {
    color: var(--ca-ink);
    font-weight: 600;
  }

  /* ── Footer Crédit Agricole ── */
  .ca-footer {
    background: var(--ca-subtle);
    border-top: 1px solid var(--ca-border);
    margin-top: auto;
  }

  .ca-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .ca-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .ca-footer__link {
    color: var(--ca-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .ca-footer__link:hover {
    color: var(--ca-primary);
    text-decoration: underline;
  }

  .ca-footer__logo {
    display: block;
    width: auto;
    height: 24px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .ca-body {
      grid-template-columns: 1fr;
    }

    .ca-sidebar {
      display: none;
    }

    .ca-nav {
      display: none;
    }

    .ca-header__tools {
      display: none;
    }

    .ca-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .ca-nav__link,
    .ca-search__btn,
    .ca-side-link,
    .ca-side-group :global(.ca-side-group__icon) {
      transition: none;
    }
  }
</style>

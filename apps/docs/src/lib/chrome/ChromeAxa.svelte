<!--
  Chrome documentaire AXA (axa.com — assureur).
  Forme fidèle à l'identité AXA : bleu profond institutionnel + barre rouge.
  - Header : bandeau BLANC, logo OFFICIEL AXA (carré bleu « AXA » + barre rouge) à
    gauche, nav au centre, recherche bleue à droite
  - Onglet actif = SOULIGNÉ ROUGE AXA (écho de la barre rouge) + texte bleu
  - Item sidebar actif = liseré bleu + fond bleu très clair
  - Couleurs : AXA Blue #00008f (primaire), AXA Red #ff1721 (accent), survol #2a2aa8,
    encre #16161d, gris #41415a / #6e6e80, surface #f4f4f8, bordure #e1e1e8
  - Logo OFFICIEL AXA (vecteur, emblème carré) via <img src="/chrome/axa/logo.svg">
  - Typo : Source Sans Pro (publique) référencée par NOM → repli système
    ('Source Sans Pro', 'Segoe UI', system-ui) sans chargement réseau
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

<div class="axa-shell">
  <!-- ── HEADER AXA ── -->
  <div class="axa-header-wrap">
    <header class="axa-header" aria-label="AXA">
      <div class="axa-header__inner">
        <!-- Gauche : logo officiel AXA -->
        <div class="axa-header__brand">
          <a href="/" class="axa-header__brand-link" aria-label="Accueil : AXA Design System">
            <img
              src="/chrome/axa/logo.svg"
              alt="AXA"
              class="axa-logo"
              width="42"
              height="42"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="axa-nav" aria-label="Navigation principale">
          <ul class="axa-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="axa-nav__item">
                <a
                  class="axa-nav__link"
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
        <div class="axa-header__tools">
          <button
            type="button"
            class="axa-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="axa-header__tools-links">
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
          class="axa-header__burger"
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

  <!-- ── BODY AXA ── -->
  <div class="axa-body">
    <!-- Sidebar -->
    <aside class="axa-sidebar" aria-label="Navigation de la documentation">
      <nav class="axa-side-nav" aria-label="Sommaire">
        <ul class="axa-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="axa-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="axa-side-divider" role="separator"></li>

          <li class="axa-side-heading">
            <a
              class="axa-side-link axa-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="axa-side-group" open={isGroupOpen(group.items)}>
                <summary class="axa-side-group__summary">
                  <ChevronDown class="axa-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="axa-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="axa-side-link axa-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="axa-side-divider" role="separator"></li>

          <li class="axa-side-heading">
            <a
              class="axa-side-link axa-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="axa-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="axa-side-group__summary">
                  <ChevronDown class="axa-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="axa-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="axa-side-link axa-side-link--sub"
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
      <div class="axa-sidebar-footer">
        <span class="axa-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="axa-sidebar-github"
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
    <div class="axa-content">
      <nav class="axa-breadcrumb" aria-label="Breadcrumb">
        <ol class="axa-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="axa-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="axa-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER AXA ── -->
  <footer class="axa-footer" aria-label="Pied de page AXA">
    <div class="axa-footer__inner">
      <nav class="axa-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="axa-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/axa/logo.svg"
        alt="AXA"
        class="axa-footer__logo"
        width="38"
        height="38"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables AXA ── */
  .axa-shell {
    --axa-primary: #00008f; /* AXA Blue (primaire) */
    --axa-primary-hover: #2a2aa8; /* bleu interactif */
    --axa-primary-light: #e5e5f4; /* bleu très clair (item actif sidebar) */
    --axa-red: #ff1721; /* AXA Red (accent / barre) */
    --axa-ink: #16161d; /* near-black */
    --axa-secondary: #41415a; /* gris secondaire */
    --axa-muted: #6e6e80; /* gris atténué */
    --axa-subtle: #f4f4f8; /* surface */
    --axa-border: #e1e1e8; /* bordure subtile */
    --axa-border-strong: #c4c4d0; /* bordure champ */
    --axa-white: #fff;
    --axa-sidebar-width: 17rem;
    --axa-radius: 2px;
    font-family: 'Source Sans Pro', 'Segoe UI', system-ui, Arial, sans-serif;
    background: var(--axa-white);
    color: var(--axa-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header AXA ── */
  .axa-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .axa-header {
    background: var(--axa-white);
    border-bottom: 1px solid var(--axa-border);
  }

  .axa-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .axa-header__brand {
    flex: 0 0 auto;
  }

  .axa-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 140ms ease;
  }

  .axa-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel AXA (ratio préservé). */
  .axa-logo {
    display: block;
    width: auto;
    height: 42px;
  }

  /* ── Nav horizontale (centre) ── */
  .axa-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .axa-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .axa-nav__item {
    flex: 0 0 auto;
  }

  .axa-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--axa-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: none;
    letter-spacing: normal;
    transition: border-color 140ms ease, color 140ms ease;
    white-space: nowrap;
  }

  .axa-nav__link:hover,
  .axa-nav__link:focus-visible {
    color: var(--axa-primary);
    outline: none;
  }

  .axa-nav__link[aria-current="page"] {
    border-bottom-color: var(--axa-red);
    color: var(--axa-primary);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .axa-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .axa-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header AXA. */
  .axa-header__tools-links :global(.docs-header-control) {
    background: var(--axa-white);
    border-color: var(--axa-border-strong);
    border-radius: var(--axa-radius);
    color: var(--axa-ink);
    font-family: inherit;
  }

  .axa-header__tools-links :global(.docs-header-control:hover),
  .axa-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--axa-subtle);
    border-color: var(--axa-red);
    color: var(--axa-primary);
    box-shadow: none;
  }

  /* Recherche AXA : bouton loupe compact. */
  .axa-search__btn {
    align-items: center;
    background: var(--axa-primary);
    border: 1px solid var(--axa-primary);
    border-radius: var(--axa-radius);
    color: var(--axa-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 140ms ease, border-color 140ms ease;
  }

  .axa-search__btn:hover,
  .axa-search__btn:focus-visible {
    background: var(--axa-primary-hover);
    border-color: var(--axa-primary-hover);
    outline: 2px solid var(--axa-primary);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .axa-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--axa-primary);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body AXA ── */
  .axa-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--axa-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar AXA ── */
  .axa-sidebar {
    background: var(--axa-white);
    border-right: 1px solid var(--axa-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .axa-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .axa-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--axa-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .axa-version-badge {
    background: var(--axa-subtle);
    border: 1px solid var(--axa-border);
    border-radius: var(--axa-radius);
    color: var(--axa-primary);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .axa-sidebar-github {
    align-items: center;
    color: var(--axa-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 140ms ease;
  }

  .axa-sidebar-github:hover,
  .axa-sidebar-github:focus-visible {
    color: var(--axa-primary);
  }

  .axa-side-list,
  .axa-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .axa-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--axa-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
  }

  .axa-side-link:hover,
  .axa-side-link:focus-visible {
    background: var(--axa-subtle);
    color: var(--axa-primary);
    text-decoration: none;
  }

  .axa-side-link[aria-current="page"] {
    background: var(--axa-primary-light);
    border-left-color: var(--axa-primary);
    color: var(--axa-primary);
    font-weight: 700;
    text-decoration: none;
  }

  .axa-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .axa-side-divider {
    border-top: 1px solid var(--axa-border);
    margin: 0.5rem 0;
  }

  .axa-side-group {
    display: block;
  }

  .axa-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--axa-secondary);
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
    transition: background 140ms ease;
  }

  .axa-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .axa-side-group__summary:hover,
  .axa-side-group__summary:focus-visible {
    background: var(--axa-subtle);
    outline: none;
  }

  .axa-side-group :global(.axa-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 140ms ease;
  }

  .axa-side-group:not([open]) :global(.axa-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .axa-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .axa-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .axa-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .axa-breadcrumb__item {
    align-items: center;
    color: var(--axa-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .axa-breadcrumb__item + .axa-breadcrumb__item::before {
    color: var(--axa-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .axa-breadcrumb__link {
    color: var(--axa-primary);
    text-decoration: none;
  }

  .axa-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .axa-breadcrumb__item span[aria-current="page"] {
    color: var(--axa-ink);
    font-weight: 600;
  }

  /* ── Footer AXA ── */
  .axa-footer {
    background: var(--axa-subtle);
    border-top: 1px solid var(--axa-border);
    margin-top: auto;
  }

  .axa-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .axa-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .axa-footer__link {
    color: var(--axa-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .axa-footer__link:hover {
    color: var(--axa-primary);
    text-decoration: underline;
  }

  .axa-footer__logo {
    display: block;
    width: auto;
    height: 38px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .axa-body {
      grid-template-columns: 1fr;
    }

    .axa-sidebar {
      display: none;
    }

    .axa-nav {
      display: none;
    }

    .axa-header__tools {
      display: none;
    }

    .axa-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .axa-nav__link,
    .axa-search__btn,
    .axa-side-link,
    .axa-side-group :global(.axa-side-group__icon) {
      transition: none;
    }
  }
</style>

<!--
  Chrome documentaire Publicis Groupe (publicisgroupe.com — communication & média).
  Forme fidèle à l'identité holding : éditoriale, NOIR sur blanc + accent OR prestige.
  - Header : bandeau BLANC, wordmark « Publicis Groupe » (noir + accent or) à gauche,
    nav CAPITALES espacées au centre, recherche NOIRE à droite
  - Coins CARRÉS (radius 0) éditorial ; onglet actif = SOULIGNÉ OR #9d833e
  - Item sidebar actif = liseré noir + fond or très clair
  - Couleurs MESURÉES (theme-publicis — Media Kit) : Publicis Black #212129 (action /
    texte / inverse), Publicis Gold #9d833e (focus / soulignement, AA-text #7d6831),
    Publicis Grey #e7e7e7, secondaire #52525b, surface #f4f4f5
  - WORDMARK TEXTE (non officiel) : Publicis Groupe ne publie aucun logo SVG libre sur
    Wikimedia (seul « Publicis Sapient » existe) → wordmark reconstruit proprement,
    SIGNALÉ au conducteur, via <img src="/chrome/publicis/logo.svg">
  - Typo : « Gotham Narrow » (de marque) → repli système (aucune police réseau)
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

<div class="pub-shell">
  <!-- ── HEADER Publicis ── -->
  <div class="pub-header-wrap">
    <header class="pub-header" aria-label="Publicis">
      <div class="pub-header__inner">
        <!-- Gauche : logo officiel Publicis -->
        <div class="pub-header__brand">
          <a href="/" class="pub-header__brand-link" aria-label="Accueil : Publicis Design System">
            <img
              src="/chrome/publicis/logo.svg"
              alt="Publicis"
              class="pub-logo"
              width="165"
              height="22"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="pub-nav" aria-label="Navigation principale">
          <ul class="pub-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="pub-nav__item">
                <a
                  class="pub-nav__link"
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
        <div class="pub-header__tools">
          <button
            type="button"
            class="pub-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="pub-header__tools-links">
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
          class="pub-header__burger"
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

  <!-- ── BODY Publicis ── -->
  <div class="pub-body">
    <!-- Sidebar -->
    <aside class="pub-sidebar" aria-label="Navigation de la documentation">
      <nav class="pub-side-nav" aria-label="Sommaire">
        <ul class="pub-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="pub-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="pub-side-divider" role="separator"></li>

          <li class="pub-side-heading">
            <a
              class="pub-side-link pub-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="pub-side-group" open={isGroupOpen(group.items)}>
                <summary class="pub-side-group__summary">
                  <ChevronDown class="pub-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="pub-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="pub-side-link pub-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="pub-side-divider" role="separator"></li>

          <li class="pub-side-heading">
            <a
              class="pub-side-link pub-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="pub-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="pub-side-group__summary">
                  <ChevronDown class="pub-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="pub-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="pub-side-link pub-side-link--sub"
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
      <div class="pub-sidebar-footer">
        <span class="pub-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="pub-sidebar-github"
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
    <div class="pub-content">
      <nav class="pub-breadcrumb" aria-label="Breadcrumb">
        <ol class="pub-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="pub-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="pub-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Publicis ── -->
  <footer class="pub-footer" aria-label="Pied de page Publicis">
    <div class="pub-footer__inner">
      <nav class="pub-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="pub-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/publicis/logo.svg"
        alt="Publicis"
        class="pub-footer__logo"
        width="150"
        height="20"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Publicis ── */
  .pub-shell {
    --pub-primary: #212129; /* Publicis Black (Media Kit) — action / texte / inverse */
    --pub-primary-hover: #3a3a45; /* near-black survol (derived) */
    --pub-primary-light: #f3efe4; /* tint or clair (item actif sidebar) */
    --pub-gold: #9d833e; /* Publicis Gold (Media Kit) — focus / soulignement */
    --pub-gold-deep: #7d6831; /* or foncé AA-text (badge) */
    --pub-ink: #212129; /* corps de texte (Publicis Black) */
    --pub-secondary: #52525b; /* gris secondaire (derived) */
    --pub-subtle: #f4f4f5; /* surface alt (derived) */
    --pub-border: #e7e7e7; /* Publicis Grey (Media Kit — bordure subtile) */
    --pub-border-strong: #c7c7cc; /* bordure champ (derived) */
    --pub-white: #fff;
    --pub-sidebar-width: 17rem;
    --pub-radius: 0;
    font-family: 'Gotham Narrow', 'Gotham', 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--pub-white);
    color: var(--pub-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Publicis ── */
  .pub-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .pub-header {
    background: var(--pub-white);
    border-bottom: 1px solid var(--pub-border);
  }

  .pub-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .pub-header__brand {
    flex: 0 0 auto;
  }

  .pub-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 200ms ease;
  }

  .pub-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Publicis (ratio préservé). */
  .pub-logo {
    display: block;
    width: auto;
    height: 22px;
  }

  /* ── Nav horizontale (centre) ── */
  .pub-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .pub-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .pub-nav__item {
    flex: 0 0 auto;
  }

  .pub-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--pub-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    transition: border-color 200ms ease, color 200ms ease;
    white-space: nowrap;
  }

  .pub-nav__link:hover,
  .pub-nav__link:focus-visible {
    color: var(--pub-ink);
    outline: none;
  }

  .pub-nav__link[aria-current="page"] {
    border-bottom-color: var(--pub-gold);
    color: var(--pub-ink);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .pub-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .pub-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Publicis. */
  .pub-header__tools-links :global(.docs-header-control) {
    background: var(--pub-white);
    border-color: var(--pub-border-strong);
    border-radius: var(--pub-radius);
    color: var(--pub-ink);
    font-family: inherit;
  }

  .pub-header__tools-links :global(.docs-header-control:hover),
  .pub-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--pub-subtle);
    border-color: var(--pub-gold);
    color: var(--pub-ink);
    box-shadow: none;
  }

  /* Recherche Publicis : bouton loupe compact. */
  .pub-search__btn {
    align-items: center;
    background: var(--pub-primary);
    border: 1px solid var(--pub-primary);
    border-radius: var(--pub-radius);
    color: var(--pub-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 200ms ease, border-color 200ms ease;
  }

  .pub-search__btn:hover,
  .pub-search__btn:focus-visible {
    background: var(--pub-primary-hover);
    border-color: var(--pub-primary-hover);
    outline: 2px solid var(--pub-gold);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .pub-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--pub-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Publicis ── */
  .pub-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--pub-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Publicis ── */
  .pub-sidebar {
    background: var(--pub-white);
    border-right: 1px solid var(--pub-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .pub-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .pub-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--pub-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .pub-version-badge {
    background: var(--pub-subtle);
    border: 1px solid var(--pub-border);
    border-radius: var(--pub-radius);
    color: var(--pub-gold-deep);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .pub-sidebar-github {
    align-items: center;
    color: var(--pub-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 200ms ease;
  }

  .pub-sidebar-github:hover,
  .pub-sidebar-github:focus-visible {
    color: var(--pub-primary);
  }

  .pub-side-list,
  .pub-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .pub-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--pub-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 200ms ease, border-color 200ms ease, color 200ms ease;
  }

  .pub-side-link:hover,
  .pub-side-link:focus-visible {
    background: var(--pub-subtle);
    color: var(--pub-primary);
    text-decoration: none;
  }

  .pub-side-link[aria-current="page"] {
    background: var(--pub-primary-light);
    border-left-color: var(--pub-primary);
    color: var(--pub-primary);
    font-weight: 700;
    text-decoration: none;
  }

  .pub-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .pub-side-divider {
    border-top: 1px solid var(--pub-border);
    margin: 0.5rem 0;
  }

  .pub-side-group {
    display: block;
  }

  .pub-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--pub-secondary);
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

  .pub-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .pub-side-group__summary:hover,
  .pub-side-group__summary:focus-visible {
    background: var(--pub-subtle);
    outline: none;
  }

  .pub-side-group :global(.pub-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 200ms ease;
  }

  .pub-side-group:not([open]) :global(.pub-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .pub-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .pub-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .pub-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .pub-breadcrumb__item {
    align-items: center;
    color: var(--pub-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .pub-breadcrumb__item + .pub-breadcrumb__item::before {
    color: var(--pub-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .pub-breadcrumb__link {
    color: var(--pub-primary);
    text-decoration: none;
  }

  .pub-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .pub-breadcrumb__item span[aria-current="page"] {
    color: var(--pub-ink);
    font-weight: 600;
  }

  /* ── Footer Publicis ── */
  .pub-footer {
    background: var(--pub-subtle);
    border-top: 1px solid var(--pub-border);
    margin-top: auto;
  }

  .pub-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .pub-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .pub-footer__link {
    color: var(--pub-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .pub-footer__link:hover {
    color: var(--pub-primary);
    text-decoration: underline;
  }

  .pub-footer__logo {
    display: block;
    width: auto;
    height: 20px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .pub-body {
      grid-template-columns: 1fr;
    }

    .pub-sidebar {
      display: none;
    }

    .pub-nav {
      display: none;
    }

    .pub-header__tools {
      display: none;
    }

    .pub-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .pub-nav__link,
    .pub-search__btn,
    .pub-side-link,
    .pub-side-group :global(.pub-side-group__icon) {
      transition: none;
    }
  }
</style>

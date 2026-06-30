<!--
  Chrome documentaire Pernod Ricard (pernod-ricard.com — site corporate Drupal).
  Forme fidele a l'en-tete corporate : clair, navy institutionnel, bleu d'action.
  - Header : bandeau BLANC, logo OFFICIEL Pernod Ricard (wordmark + embleme bleu)
    a gauche, nav au centre, recherche navy a droite
  - Onglet actif = SOULIGNE bleu d'action #0057d9 + texte navy ; item sidebar actif
    = lisere navy + fond bleu tres clair
  - Couleurs MESUREES (theme-pernod-ricard) : navy #0c294e (primaire), bleu d'action
    #0057d9, encre #222d38, gris #767676, surface #f9f8f7, bordure #ebeced, focus #5f9cf6
  - Logo OFFICIEL Pernod Ricard (vecteur Wikimedia) via <img src="/chrome/pernod-ricard/logo.svg">
  - Typo : « Weave » / « Noto Sans » (de marque) referencees par NOM → repli systeme
    ('Noto Sans', system-ui) sans chargement reseau
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

<div class="pr-shell">
  <!-- ── HEADER Pernod Ricard ── -->
  <div class="pr-header-wrap">
    <header class="pr-header" aria-label="Pernod Ricard">
      <div class="pr-header__inner">
        <!-- Gauche : logo officiel Pernod Ricard -->
        <div class="pr-header__brand">
          <a href="/" class="pr-header__brand-link" aria-label="Accueil : Pernod Ricard Design System">
            <img
              src="/chrome/pernod-ricard/logo.svg"
              alt="Pernod Ricard"
              class="pr-logo"
              width="82"
              height="30"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="pr-nav" aria-label="Navigation principale">
          <ul class="pr-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="pr-nav__item">
                <a
                  class="pr-nav__link"
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
        <div class="pr-header__tools">
          <button
            type="button"
            class="pr-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="pr-header__tools-links">
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
          class="pr-header__burger"
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

  <!-- ── BODY Pernod Ricard ── -->
  <div class="pr-body">
    <!-- Sidebar -->
    <aside class="pr-sidebar" aria-label="Navigation de la documentation">
      <nav class="pr-side-nav" aria-label="Sommaire">
        <ul class="pr-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="pr-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="pr-side-divider" role="separator"></li>

          <li class="pr-side-heading">
            <a
              class="pr-side-link pr-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="pr-side-group" open={isGroupOpen(group.items)}>
                <summary class="pr-side-group__summary">
                  <ChevronDown class="pr-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="pr-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="pr-side-link pr-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="pr-side-divider" role="separator"></li>

          <li class="pr-side-heading">
            <a
              class="pr-side-link pr-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="pr-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="pr-side-group__summary">
                  <ChevronDown class="pr-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="pr-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="pr-side-link pr-side-link--sub"
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
      <div class="pr-sidebar-footer">
        <span class="pr-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="pr-sidebar-github"
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
    <div class="pr-content">
      <nav class="pr-breadcrumb" aria-label="Breadcrumb">
        <ol class="pr-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="pr-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="pr-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Pernod Ricard ── -->
  <footer class="pr-footer" aria-label="Pied de page Pernod Ricard">
    <div class="pr-footer__inner">
      <nav class="pr-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="pr-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/pernod-ricard/logo.svg"
        alt="Pernod Ricard"
        class="pr-footer__logo"
        width="71"
        height="26"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Pernod Ricard ── */
  .pr-shell {
    --pr-primary: #0c294e; /* navy corporate (brand primary) */
    --pr-primary-hover: #081d38; /* navy plus profond (survol) */
    --pr-primary-light: #e6ecf3; /* navy tint (item actif sidebar) */
    --pr-accent: #0057d9; /* bleu d'action (soulignement / recherche survol) */
    --pr-ink: #222d38; /* corps / titres (warm slate) */
    --pr-secondary: #767676; /* gris secondaire accessible */
    --pr-subtle: #f9f8f7; /* surface off-white */
    --pr-border: #ebeced; /* bordure subtile */
    --pr-border-strong: #d3d5d7; /* bordure champ */
    --pr-focus: #5f9cf6; /* anneau focus bleu */
    --pr-white: #fff;
    --pr-sidebar-width: 17rem;
    --pr-radius: 4px;
    font-family: 'Noto Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    background: var(--pr-white);
    color: var(--pr-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Pernod Ricard ── */
  .pr-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .pr-header {
    background: var(--pr-white);
    border-bottom: 1px solid var(--pr-border);
  }

  .pr-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .pr-header__brand {
    flex: 0 0 auto;
  }

  .pr-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 200ms ease;
  }

  .pr-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Pernod Ricard (ratio préservé). */
  .pr-logo {
    display: block;
    width: auto;
    height: 30px;
  }

  /* ── Nav horizontale (centre) ── */
  .pr-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .pr-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .pr-nav__item {
    flex: 0 0 auto;
  }

  .pr-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--pr-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: none;
    letter-spacing: normal;
    transition: border-color 200ms ease, color 200ms ease;
    white-space: nowrap;
  }

  .pr-nav__link:hover,
  .pr-nav__link:focus-visible {
    color: var(--pr-primary);
    outline: none;
  }

  .pr-nav__link[aria-current="page"] {
    border-bottom-color: var(--pr-accent);
    color: var(--pr-primary);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .pr-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .pr-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Pernod Ricard. */
  .pr-header__tools-links :global(.docs-header-control) {
    background: var(--pr-white);
    border-color: var(--pr-border-strong);
    border-radius: var(--pr-radius);
    color: var(--pr-ink);
    font-family: inherit;
  }

  .pr-header__tools-links :global(.docs-header-control:hover),
  .pr-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--pr-subtle);
    border-color: var(--pr-accent);
    color: var(--pr-primary);
    box-shadow: none;
  }

  /* Recherche Pernod Ricard : bouton loupe compact. */
  .pr-search__btn {
    align-items: center;
    background: var(--pr-primary);
    border: 1px solid var(--pr-primary);
    border-radius: var(--pr-radius);
    color: var(--pr-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 200ms ease, border-color 200ms ease;
  }

  .pr-search__btn:hover,
  .pr-search__btn:focus-visible {
    background: var(--pr-accent);
    border-color: var(--pr-accent);
    outline: 2px solid var(--pr-focus);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .pr-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--pr-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Pernod Ricard ── */
  .pr-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--pr-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Pernod Ricard ── */
  .pr-sidebar {
    background: var(--pr-white);
    border-right: 1px solid var(--pr-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .pr-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .pr-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--pr-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .pr-version-badge {
    background: var(--pr-subtle);
    border: 1px solid var(--pr-border);
    border-radius: var(--pr-radius);
    color: var(--pr-accent);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .pr-sidebar-github {
    align-items: center;
    color: var(--pr-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 200ms ease;
  }

  .pr-sidebar-github:hover,
  .pr-sidebar-github:focus-visible {
    color: var(--pr-primary);
  }

  .pr-side-list,
  .pr-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .pr-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--pr-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 200ms ease, border-color 200ms ease, color 200ms ease;
  }

  .pr-side-link:hover,
  .pr-side-link:focus-visible {
    background: var(--pr-subtle);
    color: var(--pr-primary);
    text-decoration: none;
  }

  .pr-side-link[aria-current="page"] {
    background: var(--pr-primary-light);
    border-left-color: var(--pr-primary);
    color: var(--pr-primary);
    font-weight: 700;
    text-decoration: none;
  }

  .pr-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .pr-side-divider {
    border-top: 1px solid var(--pr-border);
    margin: 0.5rem 0;
  }

  .pr-side-group {
    display: block;
  }

  .pr-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--pr-secondary);
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

  .pr-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .pr-side-group__summary:hover,
  .pr-side-group__summary:focus-visible {
    background: var(--pr-subtle);
    outline: none;
  }

  .pr-side-group :global(.pr-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 200ms ease;
  }

  .pr-side-group:not([open]) :global(.pr-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .pr-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .pr-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .pr-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .pr-breadcrumb__item {
    align-items: center;
    color: var(--pr-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .pr-breadcrumb__item + .pr-breadcrumb__item::before {
    color: var(--pr-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .pr-breadcrumb__link {
    color: var(--pr-primary);
    text-decoration: none;
  }

  .pr-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .pr-breadcrumb__item span[aria-current="page"] {
    color: var(--pr-ink);
    font-weight: 600;
  }

  /* ── Footer Pernod Ricard ── */
  .pr-footer {
    background: var(--pr-subtle);
    border-top: 1px solid var(--pr-border);
    margin-top: auto;
  }

  .pr-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .pr-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .pr-footer__link {
    color: var(--pr-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .pr-footer__link:hover {
    color: var(--pr-primary);
    text-decoration: underline;
  }

  .pr-footer__logo {
    display: block;
    width: auto;
    height: 26px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .pr-body {
      grid-template-columns: 1fr;
    }

    .pr-sidebar {
      display: none;
    }

    .pr-nav {
      display: none;
    }

    .pr-header__tools {
      display: none;
    }

    .pr-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .pr-nav__link,
    .pr-search__btn,
    .pr-side-link,
    .pr-side-group :global(.pr-side-group__icon) {
      transition: none;
    }
  }
</style>

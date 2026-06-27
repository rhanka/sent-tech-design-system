<!--
  Chrome documentaire Schneider Electric (se.com — énergie & automatisation).
  Forme fidèle à l'identité Quartz : clair, « Life Green » de marque.
  - Header : bandeau BLANC, logo OFFICIEL Schneider Electric (wordmark vert) à
    gauche, nav au centre, recherche Life Green à droite
  - Onglet actif = SOULIGNÉ « Life Green » #3DCD58 + texte vert profond #1e7e34
    (vert lisible AA) ; item sidebar actif = liseré vert + fond vert clair
  - Couleurs MESURÉES (Quartz) : « Life Green » #3DCD58 (marque/action), vert profond
    #1e7e34 (libellés lisibles), encre #1a2326, gris #6b7780 / #4d575e,
    surface #f4f6f7, bordure #c8d0d4
  - Logo OFFICIEL Schneider Electric (vecteur Wikimedia) via <img src="/chrome/schneider-electric/logo.svg">
  - Typo : « Nunito » (Quartz --qds-font-family-brand) référencée par NOM → repli
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

<div class="se-shell">
  <!-- ── HEADER Schneider Electric ── -->
  <div class="se-header-wrap">
    <header class="se-header" aria-label="Schneider Electric">
      <div class="se-header__inner">
        <!-- Gauche : logo officiel Schneider Electric -->
        <div class="se-header__brand">
          <a href="/" class="se-header__brand-link" aria-label="Accueil : Schneider Electric Design System">
            <img
              src="/chrome/schneider-electric/logo.svg"
              alt="Schneider Electric"
              class="se-logo"
              width="93"
              height="28"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="se-nav" aria-label="Navigation principale">
          <ul class="se-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="se-nav__item">
                <a
                  class="se-nav__link"
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
        <div class="se-header__tools">
          <button
            type="button"
            class="se-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="se-header__tools-links">
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
          class="se-header__burger"
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

  <!-- ── BODY Schneider Electric ── -->
  <div class="se-body">
    <!-- Sidebar -->
    <aside class="se-sidebar" aria-label="Navigation de la documentation">
      <nav class="se-side-nav" aria-label="Sommaire">
        <ul class="se-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="se-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="se-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="se-side-group" open={isGroupOpen(group.items)}>
                <summary class="se-side-group__summary">
                  <ChevronDown class="se-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="se-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="se-side-link se-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="se-side-divider" role="separator"></li>

          <li>
            <a
              class="se-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="se-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="se-side-group__summary">
                  <ChevronDown class="se-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="se-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="se-side-link se-side-link--sub"
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
      <div class="se-sidebar-footer">
        <span class="se-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="se-sidebar-github"
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
    <div class="se-content">
      <nav class="se-breadcrumb" aria-label="Breadcrumb">
        <ol class="se-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="se-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="se-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Schneider Electric ── -->
  <footer class="se-footer" aria-label="Pied de page Schneider Electric">
    <div class="se-footer__inner">
      <nav class="se-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="se-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/schneider-electric/logo.svg"
        alt="Schneider Electric"
        class="se-footer__logo"
        width="79"
        height="24"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Schneider Electric ── */
  .se-shell {
    --se-primary: #1e7e34; /* vert profond lisible (liens / libellés / actif) */
    --se-primary-hover: #176128; /* vert plus profond (survol) */
    --se-primary-light: #e3f7e8; /* vert clair (item actif sidebar) */
    --se-life: #3dcd58; /* « Life Green » — couleur de marque (soulignement / recherche) */
    --se-life-hover: #2fb347; /* Life Green survol */
    --se-ink: #1a2326; /* corps / titres (near-black) */
    --se-secondary: #6b7780; /* gris secondaire */
    --se-muted: #4d575e; /* gris atténué */
    --se-subtle: #f4f6f7; /* surface alt */
    --se-border: #c8d0d4; /* bordure subtile / stroke champ */
    --se-border-strong: #aab4ba; /* bordure forte (dérivée) */
    --se-white: #fff;
    --se-sidebar-width: 17rem;
    --se-radius: 4px;
    font-family: 'Nunito', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--se-white);
    color: var(--se-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Schneider Electric ── */
  .se-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .se-header {
    background: var(--se-white);
    border-bottom: 1px solid var(--se-border);
  }

  .se-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .se-header__brand {
    flex: 0 0 auto;
  }

  .se-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 150ms ease;
  }

  .se-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Schneider Electric (ratio préservé). */
  .se-logo {
    display: block;
    width: auto;
    height: 28px;
  }

  /* ── Nav horizontale (centre) ── */
  .se-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .se-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .se-nav__item {
    flex: 0 0 auto;
  }

  .se-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--se-ink);
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

  .se-nav__link:hover,
  .se-nav__link:focus-visible {
    color: var(--se-primary);
    outline: none;
  }

  .se-nav__link[aria-current="page"] {
    border-bottom-color: var(--se-life);
    color: var(--se-primary);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .se-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .se-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Schneider Electric. */
  .se-header__tools-links :global(.docs-header-control) {
    background: var(--se-white);
    border-color: var(--se-border-strong);
    border-radius: var(--se-radius);
    color: var(--se-ink);
    font-family: inherit;
  }

  .se-header__tools-links :global(.docs-header-control:hover),
  .se-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--se-subtle);
    border-color: var(--se-life);
    color: var(--se-primary);
    box-shadow: none;
  }

  /* Recherche Schneider Electric : bouton loupe compact. */
  .se-search__btn {
    align-items: center;
    background: var(--se-life);
    border: 1px solid var(--se-life);
    border-radius: var(--se-radius);
    color: #0a160d;
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 150ms ease, border-color 150ms ease;
  }

  .se-search__btn:hover,
  .se-search__btn:focus-visible {
    background: var(--se-life-hover);
    border-color: var(--se-life-hover);
    outline: 2px solid var(--se-life);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .se-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--se-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Schneider Electric ── */
  .se-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--se-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Schneider Electric ── */
  .se-sidebar {
    background: var(--se-white);
    border-right: 1px solid var(--se-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .se-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .se-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--se-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .se-version-badge {
    background: var(--se-subtle);
    border: 1px solid var(--se-border);
    border-radius: var(--se-radius);
    color: var(--se-primary);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .se-sidebar-github {
    align-items: center;
    color: var(--se-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 150ms ease;
  }

  .se-sidebar-github:hover,
  .se-sidebar-github:focus-visible {
    color: var(--se-primary);
  }

  .se-side-list,
  .se-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .se-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--se-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
  }

  .se-side-link:hover,
  .se-side-link:focus-visible {
    background: var(--se-subtle);
    color: var(--se-primary);
    text-decoration: none;
  }

  .se-side-link[aria-current="page"] {
    background: var(--se-primary-light);
    border-left-color: var(--se-primary);
    color: var(--se-primary);
    font-weight: 700;
    text-decoration: none;
  }

  .se-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .se-side-divider {
    border-top: 1px solid var(--se-border);
    margin: 0.5rem 0;
  }

  .se-side-group {
    display: block;
  }

  .se-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--se-secondary);
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

  .se-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .se-side-group__summary:hover,
  .se-side-group__summary:focus-visible {
    background: var(--se-subtle);
    outline: none;
  }

  .se-side-group :global(.se-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 150ms ease;
  }

  .se-side-group:not([open]) :global(.se-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .se-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .se-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .se-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .se-breadcrumb__item {
    align-items: center;
    color: var(--se-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .se-breadcrumb__item + .se-breadcrumb__item::before {
    color: var(--se-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .se-breadcrumb__link {
    color: var(--se-primary);
    text-decoration: none;
  }

  .se-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .se-breadcrumb__item span[aria-current="page"] {
    color: var(--se-ink);
    font-weight: 600;
  }

  /* ── Footer Schneider Electric ── */
  .se-footer {
    background: var(--se-subtle);
    border-top: 1px solid var(--se-border);
    margin-top: auto;
  }

  .se-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .se-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .se-footer__link {
    color: var(--se-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .se-footer__link:hover {
    color: var(--se-primary);
    text-decoration: underline;
  }

  .se-footer__logo {
    display: block;
    width: auto;
    height: 24px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .se-body {
      grid-template-columns: 1fr;
    }

    .se-sidebar {
      display: none;
    }

    .se-nav {
      display: none;
    }

    .se-header__tools {
      display: none;
    }

    .se-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .se-nav__link,
    .se-search__btn,
    .se-side-link,
    .se-side-group :global(.se-side-group__icon) {
      transition: none;
    }
  }
</style>

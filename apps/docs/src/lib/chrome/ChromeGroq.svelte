<!--
  Chrome documentaire Groq (groq.com / GroqCloud).
  Forme fidèle à l'en-tête de groq.com : chaud, net, technique.
  - Header : bandeau CRÈME chaud #fafaf8, lockup OFFICIEL Groq (squircle orange +
    wordmark « groq ») à gauche, nav PILULES au centre, recherche pilule orange
    pleine à droite
  - Signature Groq : boutons/onglets PILULES (radius 999px), contrôles boxés 4px,
    accent ORANGE #f43e01 ; onglet actif = texte orange + pilule orange clair
  - Barre latérale : item actif liseré orange + fond orange très clair
  - Couleurs MESURÉES sur groq.com (custom properties --color-*) : orange base
    #f43e01, orange dark #c23101, crème 98 #fafaf8, crème 95 #f3f3ee, crème 91
    #e8e8de (bordure), crème 81 #cecebf, crème 41 #69695d (texte sec.), ink 20
    #2d2f33 (texte), ink 16 #26292e
  - Logo OFFICIEL Groq (svgl id 24, groq.com) via <img src="/chrome/groq/logo.svg">
  - Typo : familles Groq (Space Grotesk display/body + IBM Plex Mono) référencées
    par NOM uniquement, repli système (aucune police réseau chargée)
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

<div class="groq-shell">
  <!-- ── HEADER GROQ ── -->
  <div class="groq-header-wrap">
    <header class="groq-header" aria-label="Groq">
      <div class="groq-header__inner">
        <!-- Gauche : lockup officiel Groq -->
        <div class="groq-header__brand">
          <a href="/" class="groq-header__brand-link" aria-label="Accueil : Groq Design System">
            <img
              src="/chrome/groq/logo.svg"
              alt="Groq"
              class="groq-logo"
              width="85"
              height="28"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="groq-nav" aria-label="Navigation principale">
          <ul class="groq-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="groq-nav__item">
                <a
                  class="groq-nav__link"
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
        <div class="groq-header__tools">
          <button
            type="button"
            class="groq-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="groq-header__tools-links">
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
          class="groq-header__burger"
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

  <!-- ── BODY GROQ ── -->
  <div class="groq-body">
    <!-- Sidebar -->
    <aside class="groq-sidebar" aria-label="Navigation de la documentation">
      <nav class="groq-side-nav" aria-label="Sommaire">
        <ul class="groq-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="groq-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="groq-side-divider" role="separator"></li>

          <li class="groq-side-heading">
            <a
              class="groq-side-link groq-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="groq-side-group" open={isGroupOpen(group.items)}>
                <summary class="groq-side-group__summary">
                  <ChevronDown class="groq-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="groq-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="groq-side-link groq-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="groq-side-divider" role="separator"></li>

          <li class="groq-side-heading">
            <a
              class="groq-side-link groq-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="groq-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="groq-side-group__summary">
                  <ChevronDown class="groq-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="groq-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="groq-side-link groq-side-link--sub"
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
      <div class="groq-sidebar-footer">
        <span class="groq-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="groq-sidebar-github"
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
    <div class="groq-content">
      <nav class="groq-breadcrumb" aria-label="Breadcrumb">
        <ol class="groq-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="groq-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="groq-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER GROQ ── -->
  <footer class="groq-footer" aria-label="Pied de page Groq">
    <div class="groq-footer__inner">
      <nav class="groq-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="groq-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/groq/logo.svg"
        alt="Groq"
        class="groq-footer__logo"
        width="79"
        height="26"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Groq (mesurées sur groq.com) ── */
  .groq-shell {
    --groq-primary: #f43e01; /* --color-orange-base (action / accent) */
    --groq-primary-hover: #c23101; /* --color-orange-dark (hover) */
    --groq-primary-light: #fdeadf; /* tint orange clair (item actif sidebar) */
    --groq-ink: #2d2f33; /* --color-utility-20-blue (texte principal) */
    --groq-ink-2: #26292e; /* --color-utility-16-blue (encre la plus foncée) */
    --groq-secondary: #69695d; /* --color-utility-41-yellow (texte secondaire) */
    --groq-muted: #9c9c90; /* --color-utility-61-yellow (muet) */
    --groq-warm: #fafaf8; /* --color-utility-98-yellow (crème header / page) */
    --groq-subtle: #f3f3ee; /* --color-utility-95-yellow (remplissage subtil) */
    --groq-border: #e8e8de; /* --color-utility-91-yellow (bordure chaude) */
    --groq-border-strong: #cecebf; /* --color-utility-81-yellow (bordure forte) */
    --groq-focus: #f43e01; /* outline orange (focus signature Groq) */
    --groq-white: #fff;
    --groq-sidebar-width: 17rem;
    --groq-radius: 0.25rem; /* 4px — contrôles boxés (--border-radius-input) */
    --groq-radius-pill: 999px; /* pilules (--bdrs-l) */
    font-family: 'Space Grotesk', system-ui, 'Helvetica Neue', Helvetica, Arial, sans-serif;
    background: var(--groq-white);
    color: var(--groq-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Groq ── */
  .groq-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .groq-header {
    background: var(--groq-warm);
    border-bottom: 1px solid var(--groq-border);
  }

  .groq-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .groq-header__brand {
    flex: 0 0 auto;
  }

  .groq-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 200ms ease;
  }

  .groq-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Groq (ratio préservé). */
  .groq-logo {
    display: block;
    width: auto;
    height: 28px;
  }

  /* ── Nav horizontale (centre) ── pilules Groq ── */
  .groq-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .groq-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .groq-nav__item {
    flex: 0 0 auto;
  }

  .groq-nav__link {
    align-items: center;
    border-radius: var(--groq-radius-pill);
    color: var(--groq-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.25rem;
    padding: 0 1rem;
    text-decoration: none;
    transition: background 180ms ease, color 180ms ease;
    white-space: nowrap;
  }

  .groq-nav__link:hover,
  .groq-nav__link:focus-visible {
    background: var(--groq-subtle);
    color: var(--groq-ink);
    outline: none;
  }

  .groq-nav__link[aria-current="page"] {
    background: var(--groq-primary-light);
    color: var(--groq-primary-hover);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .groq-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .groq-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Groq (contrôles boxés 4px). */
  .groq-header__tools-links :global(.docs-header-control) {
    background: var(--groq-white);
    border-color: var(--groq-border-strong);
    border-radius: var(--groq-radius);
    color: var(--groq-ink);
    font-family: inherit;
  }

  .groq-header__tools-links :global(.docs-header-control:hover),
  .groq-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--groq-warm);
    border-color: var(--groq-primary);
    color: var(--groq-ink);
    box-shadow: none;
  }

  /* Recherche Groq : pilule orange pleine (bouton primaire). */
  .groq-search__btn {
    align-items: center;
    background: var(--groq-primary);
    border: 1px solid var(--groq-primary);
    border-radius: var(--groq-radius-pill);
    color: var(--groq-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 180ms ease, border-color 180ms ease;
  }

  .groq-search__btn:hover,
  .groq-search__btn:focus-visible {
    background: var(--groq-primary-hover);
    border-color: var(--groq-primary-hover);
    outline: 3px solid var(--groq-focus);
    outline-offset: 2px;
  }

  /* Burger mobile */
  .groq-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--groq-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Groq ── */
  .groq-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--groq-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Groq ── */
  .groq-sidebar {
    background: var(--groq-white);
    border-right: 1px solid var(--groq-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .groq-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .groq-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--groq-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .groq-version-badge {
    background: var(--groq-subtle);
    border: 1px solid var(--groq-border);
    border-radius: var(--groq-radius-pill);
    color: var(--groq-primary-hover);
    font-family: 'IBM Plex Mono', ui-monospace, 'Source Code Pro', Menlo, Consolas, monospace;
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.15rem 0.6rem;
    white-space: nowrap;
  }

  .groq-sidebar-github {
    align-items: center;
    color: var(--groq-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 200ms ease;
  }

  .groq-sidebar-github:hover,
  .groq-sidebar-github:focus-visible {
    color: var(--groq-primary);
  }

  .groq-side-list,
  .groq-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .groq-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--groq-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 200ms ease, border-color 200ms ease, color 200ms ease;
  }

  .groq-side-link:hover,
  .groq-side-link:focus-visible {
    background: var(--groq-subtle);
    color: var(--groq-primary-hover);
    text-decoration: none;
  }

  .groq-side-link[aria-current="page"] {
    background: var(--groq-primary-light);
    border-left-color: var(--groq-primary);
    color: var(--groq-primary-hover);
    font-weight: 600;
    text-decoration: none;
  }

  .groq-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .groq-side-divider {
    border-top: 1px solid var(--groq-border);
    margin: 0.5rem 0;
  }

  .groq-side-group {
    display: block;
  }

  .groq-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--groq-secondary);
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

  .groq-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .groq-side-group__summary:hover,
  .groq-side-group__summary:focus-visible {
    background: var(--groq-subtle);
    outline: none;
  }

  .groq-side-group :global(.groq-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 200ms ease;
  }

  .groq-side-group:not([open]) :global(.groq-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .groq-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .groq-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .groq-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .groq-breadcrumb__item {
    align-items: center;
    color: var(--groq-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .groq-breadcrumb__item + .groq-breadcrumb__item::before {
    color: var(--groq-muted);
    content: "›";
    margin: 0 0.4rem;
  }

  .groq-breadcrumb__link {
    color: var(--groq-ink);
    text-decoration: none;
  }

  .groq-breadcrumb__link:hover {
    color: var(--groq-primary);
    text-decoration: underline;
  }

  .groq-breadcrumb__item span[aria-current="page"] {
    color: var(--groq-ink);
    font-weight: 600;
  }

  /* ── Footer Groq ── */
  .groq-footer {
    background: var(--groq-subtle);
    border-top: 1px solid var(--groq-border);
    margin-top: auto;
  }

  .groq-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .groq-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .groq-footer__link {
    color: var(--groq-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .groq-footer__link:hover {
    color: var(--groq-primary);
    text-decoration: underline;
  }

  .groq-footer__logo {
    display: block;
    width: auto;
    height: 26px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .groq-body {
      grid-template-columns: 1fr;
    }

    .groq-sidebar {
      display: none;
    }

    .groq-nav {
      display: none;
    }

    .groq-header__tools {
      display: none;
    }

    .groq-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .groq-nav__link,
    .groq-search__btn,
    .groq-side-link,
    .groq-side-group :global(.groq-side-group__icon) {
      transition: none;
    }
  }
</style>

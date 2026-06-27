<!--
  Chrome documentaire Accor (« Welcome by Accor » — design.accor.com).
  Forme fidèle au design system corporate hôtelier d'Accor : clair, aéré, encre
  indigo profond + accent bleu CTA, BOUTONS PLEINEMENT ARRONDIS (pilule) — la
  signature Accor.
  - Header : bandeau BLANC, wordmark Accor (encre indigo) à gauche, nav au centre,
    recherche pilule indigo à droite
  - Onglet actif = SOULIGNÉ bleu accent #2d4cd5 + texte indigo ; item sidebar actif
    = liseré indigo + fond indigo pâle
  - Coins PILULE (radius 999px) — anatomie signature des CTA Accor
  - Couleurs MESURÉES (wel.sem.color.*) : indigo profond #050033 (primaire/inverse),
    bleu CTA #2d4cd5 (accent), lien #0051ae, focus #2a71db, magenta offre #b40875,
    encre #232136, gris #38364d / #5e5b73, surface #f7f9fb, bordure #d9dadc
  - Logo : aucun SVG officiel fiable du logo Accor 2023 sur Wikimedia Commons (seul
    le mark hérité « AccorHotels » pré-2023 existe, écarté par le thème) → REPLI
    WORDMARK TEXTE propre via <img src="/chrome/accor/logo.svg"> (SIGNALÉ).
  - Typo : faces plateforme SF Pro/system (référence par nom) → repli système sans
    chargement réseau
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

<div class="acc-shell">
  <!-- ── HEADER Accor ── -->
  <div class="acc-header-wrap">
    <header class="acc-header" aria-label="Accor">
      <div class="acc-header__inner">
        <!-- Gauche : logo officiel Accor -->
        <div class="acc-header__brand">
          <a href="/" class="acc-header__brand-link" aria-label="Accueil : Accor Design System">
            <img
              src="/chrome/accor/logo.svg"
              alt="Accor"
              class="acc-logo"
              width="109"
              height="24"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="acc-nav" aria-label="Navigation principale">
          <ul class="acc-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="acc-nav__item">
                <a
                  class="acc-nav__link"
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
        <div class="acc-header__tools">
          <button
            type="button"
            class="acc-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="acc-header__tools-links">
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
          class="acc-header__burger"
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

  <!-- ── BODY Accor ── -->
  <div class="acc-body">
    <!-- Sidebar -->
    <aside class="acc-sidebar" aria-label="Navigation de la documentation">
      <nav class="acc-side-nav" aria-label="Sommaire">
        <ul class="acc-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="acc-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="acc-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="acc-side-group" open={isGroupOpen(group.items)}>
                <summary class="acc-side-group__summary">
                  <ChevronDown class="acc-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="acc-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="acc-side-link acc-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="acc-side-divider" role="separator"></li>

          <li>
            <a
              class="acc-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="acc-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="acc-side-group__summary">
                  <ChevronDown class="acc-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="acc-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="acc-side-link acc-side-link--sub"
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
      <div class="acc-sidebar-footer">
        <span class="acc-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="acc-sidebar-github"
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
    <div class="acc-content">
      <nav class="acc-breadcrumb" aria-label="Breadcrumb">
        <ol class="acc-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="acc-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="acc-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Accor ── -->
  <footer class="acc-footer" aria-label="Pied de page Accor">
    <div class="acc-footer__inner">
      <nav class="acc-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="acc-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/accor/logo.svg"
        alt="Accor"
        class="acc-footer__logo"
        width="100"
        height="22"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Accor ── */
  .acc-shell {
    --acc-primary: #050033; /* wel.sem.color.primary — indigo profond (primaire/inverse) */
    --acc-primary-hover: #1f1b4b; /* on-primary-container — indigo interactif */
    --acc-primary-light: #e8edff; /* primary-container-hi — indigo pâle (item actif sidebar) */
    --acc-accent: #2d4cd5; /* wel.sem.color.accent — bleu CTA (soulignement onglet) */
    --acc-link: #0051ae; /* wel.sem.color.link — bleu lien */
    --acc-offer: #b40875; /* wel.sem.color.offer — magenta promo */
    --acc-focus: #2a71db; /* wel.sem.color.focus — anneau focus */
    --acc-ink: #232136; /* on-surface-hi — encre / titres */
    --acc-secondary: #38364d; /* on-surface-mid — texte secondaire */
    --acc-muted: #5e5b73; /* on-surface-low — placeholder / atténué */
    --acc-subtle: #f7f9fb; /* surface-container-mid — surface alt */
    --acc-border: #d9dadc; /* outline-low — bordure subtile */
    --acc-border-strong: #afb1b3; /* outline-mid — bordure champ */
    --acc-white: #fff;
    --acc-sidebar-width: 17rem;
    --acc-radius: 999px;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', Roboto, 'Segoe UI', system-ui, sans-serif;
    background: var(--acc-white);
    color: var(--acc-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Accor ── */
  .acc-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .acc-header {
    background: var(--acc-white);
    border-bottom: 1px solid var(--acc-border);
  }

  .acc-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .acc-header__brand {
    flex: 0 0 auto;
  }

  .acc-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 200ms ease;
  }

  .acc-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Accor (ratio préservé). */
  .acc-logo {
    display: block;
    width: auto;
    height: 24px;
  }

  /* ── Nav horizontale (centre) ── */
  .acc-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .acc-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .acc-nav__item {
    flex: 0 0 auto;
  }

  .acc-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--acc-ink);
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

  .acc-nav__link:hover,
  .acc-nav__link:focus-visible {
    color: var(--acc-primary);
    outline: none;
  }

  .acc-nav__link[aria-current="page"] {
    border-bottom-color: var(--acc-accent);
    color: var(--acc-primary);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .acc-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .acc-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Accor. */
  .acc-header__tools-links :global(.docs-header-control) {
    background: var(--acc-white);
    border-color: var(--acc-border-strong);
    border-radius: var(--acc-radius);
    color: var(--acc-ink);
    font-family: inherit;
  }

  .acc-header__tools-links :global(.docs-header-control:hover),
  .acc-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--acc-subtle);
    border-color: var(--acc-accent);
    color: var(--acc-primary);
    box-shadow: none;
  }

  /* Recherche Accor : bouton loupe compact. */
  .acc-search__btn {
    align-items: center;
    background: var(--acc-primary);
    border: 1px solid var(--acc-primary);
    border-radius: var(--acc-radius);
    color: var(--acc-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 200ms ease, border-color 200ms ease;
  }

  .acc-search__btn:hover,
  .acc-search__btn:focus-visible {
    background: var(--acc-primary-hover);
    border-color: var(--acc-primary-hover);
    outline: 2px solid var(--acc-focus);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .acc-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--acc-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Accor ── */
  .acc-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--acc-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Accor ── */
  .acc-sidebar {
    background: var(--acc-white);
    border-right: 1px solid var(--acc-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .acc-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .acc-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--acc-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .acc-version-badge {
    background: var(--acc-subtle);
    border: 1px solid var(--acc-border);
    border-radius: var(--acc-radius);
    color: var(--acc-accent);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .acc-sidebar-github {
    align-items: center;
    color: var(--acc-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 200ms ease;
  }

  .acc-sidebar-github:hover,
  .acc-sidebar-github:focus-visible {
    color: var(--acc-primary);
  }

  .acc-side-list,
  .acc-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .acc-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--acc-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 200ms ease, border-color 200ms ease, color 200ms ease;
  }

  .acc-side-link:hover,
  .acc-side-link:focus-visible {
    background: var(--acc-subtle);
    color: var(--acc-primary);
    text-decoration: none;
  }

  .acc-side-link[aria-current="page"] {
    background: var(--acc-primary-light);
    border-left-color: var(--acc-primary);
    color: var(--acc-primary);
    font-weight: 700;
    text-decoration: none;
  }

  .acc-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .acc-side-divider {
    border-top: 1px solid var(--acc-border);
    margin: 0.5rem 0;
  }

  .acc-side-group {
    display: block;
  }

  .acc-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--acc-secondary);
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

  .acc-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .acc-side-group__summary:hover,
  .acc-side-group__summary:focus-visible {
    background: var(--acc-subtle);
    outline: none;
  }

  .acc-side-group :global(.acc-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 200ms ease;
  }

  .acc-side-group:not([open]) :global(.acc-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .acc-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .acc-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .acc-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .acc-breadcrumb__item {
    align-items: center;
    color: var(--acc-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .acc-breadcrumb__item + .acc-breadcrumb__item::before {
    color: var(--acc-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .acc-breadcrumb__link {
    color: var(--acc-primary);
    text-decoration: none;
  }

  .acc-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .acc-breadcrumb__item span[aria-current="page"] {
    color: var(--acc-ink);
    font-weight: 600;
  }

  /* ── Footer Accor ── */
  .acc-footer {
    background: var(--acc-subtle);
    border-top: 1px solid var(--acc-border);
    margin-top: auto;
  }

  .acc-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .acc-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .acc-footer__link {
    color: var(--acc-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .acc-footer__link:hover {
    color: var(--acc-primary);
    text-decoration: underline;
  }

  .acc-footer__logo {
    display: block;
    width: auto;
    height: 22px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .acc-body {
      grid-template-columns: 1fr;
    }

    .acc-sidebar {
      display: none;
    }

    .acc-nav {
      display: none;
    }

    .acc-header__tools {
      display: none;
    }

    .acc-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .acc-nav__link,
    .acc-search__btn,
    .acc-side-link,
    .acc-side-group :global(.acc-side-group__icon) {
      transition: none;
    }
  }
</style>

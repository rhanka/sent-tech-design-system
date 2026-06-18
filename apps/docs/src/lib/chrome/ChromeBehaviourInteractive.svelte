<!--
  Chrome documentaire Behaviour Interactive (bhvr.com — le studio de jeux vidéo
  montréalais, Dead by Daylight). Identité bold dark gaming-studio :
  - Header : bandeau SOMBRE near-black #111111, texte / nav BLANCS (#f4f4f4),
    confiance studio de jeu ; le repère officiel BHVR est posé en blanc
    (knockout via filter: brightness(0) invert(1) si le mark source est foncé),
    aligné à gauche ; nav horizontale + loupe de recherche compacte ; CTA pilule
    rouge signal #cc0000 à droite
  - Onglet de nav actif : SOULIGNÉ rouge signal #cc0000 (la barre d'accent)
  - Barre latérale gauche : item actif accent rouge #cc0000 + fond tinté subtil,
    sous-items indentés
  - Fil d'Ariane au-dessus du contenu (zone de contenu sur page claire normale)
  - Footer : bande SOMBRE #111111, liens blancs, ligne d'accent rouge, mark BHVR
    blanche
  - Couleurs : rouge signal #cc0000 (marque / action / nav active / loupe hover),
    rouge-foncé #a30000 (hover), texte blanc #f4f4f4, surface sombre #111111,
    hairline rgba(255,255,255,0.12) ; radius doux
  - Logo officiel Behaviour (mark BHVR) référencé via
    <img src="/chrome/behaviour-interactive/logo.svg">, knocked-out en blanc
  - Typo : grotesk neutre (corps / UI) ; on ne charge AUCUNE police propriétaire.
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

<div class="bhv-shell">
  <!-- ── HEADER BEHAVIOUR INTERACTIVE ── -->
  <div class="bhv-header-wrap">
    <header class="bhv-header" aria-label="Behaviour Interactive">
      <div class="bhv-header__inner">
        <!-- Gauche : mark officielle BHVR (knockout blanc sur fond sombre) -->
        <div class="bhv-header__brand">
          <a href="/" class="bhv-header__brand-link" aria-label="Accueil : Behaviour Interactive Design System">
            <img
              src="/chrome/behaviour-interactive/logo.svg"
              alt="Behaviour Interactive"
              class="bhv-logo"
              width="44"
              height="30"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="bhv-nav" aria-label="Navigation principale">
          <ul class="bhv-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="bhv-nav__item">
                <a
                  class="bhv-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Behaviour : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="bhv-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA pilule -->
        <div class="bhv-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="bhv-header__tools-links">
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
          class="bhv-header__burger"
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

  <!-- ── BODY BEHAVIOUR INTERACTIVE ── -->
  <div class="bhv-body">
    <!-- Sidebar -->
    <aside class="bhv-sidebar" aria-label="Navigation de la documentation">
      <nav class="bhv-side-nav" aria-label="Sommaire">
        <ul class="bhv-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="bhv-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="bhv-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="bhv-side-group" open={isGroupOpen(group.items)}>
                <summary class="bhv-side-group__summary">
                  <ChevronDown class="bhv-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="bhv-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="bhv-side-link bhv-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="bhv-side-divider" role="separator"></li>

          <li>
            <a
              class="bhv-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="bhv-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="bhv-side-group__summary">
                  <ChevronDown class="bhv-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="bhv-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="bhv-side-link bhv-side-link--sub"
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
      <div class="bhv-sidebar-footer">
        <span class="bhv-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="bhv-sidebar-github"
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
    <div class="bhv-content">
      <nav class="bhv-breadcrumb" aria-label="Breadcrumb">
        <ol class="bhv-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="bhv-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="bhv-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER BEHAVIOUR INTERACTIVE ── -->
  <footer class="bhv-footer" aria-label="Pied de page Behaviour Interactive">
    <div class="bhv-footer__inner">
      <nav class="bhv-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="bhv-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/behaviour-interactive/logo.svg"
        alt="Behaviour Interactive"
        class="bhv-footer__logo"
        width="41"
        height="28"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Behaviour Interactive ── */
  .bhv-shell {
    --bhv-red: #cc0000; /* rouge signal : marque / action / nav active / loupe hover */
    --bhv-red-hover: #a30000; /* rouge-foncé : hover */
    --bhv-dark: #111111; /* surface sombre near-black (header / footer) */
    --bhv-ink: #1a1a1a; /* encre : texte primaire sur page claire */
    --bhv-on-dark: #f4f4f4; /* texte / nav blancs sur le header sombre */
    --bhv-on-dark-muted: rgba(244, 244, 244, 0.66); /* texte secondaire sur sombre */
    --bhv-grey: #6b7280; /* gris secondaire (sidebar / fil d'Ariane) */
    --bhv-subtle: #f5f5f5; /* surface subtile / hover doux (clair) */
    --bhv-border: #e0e0e0; /* hairline clair (body / sidebar) */
    --bhv-border-dark: rgba(255, 255, 255, 0.12); /* hairline sur fond sombre */
    --bhv-white: #fff;
    --bhv-sidebar-width: 17rem;
    --bhv-radius: 4px; /* contrôles arrondis doux */
    --bhv-radius-pill: 999px; /* pilules / CTA */
    /* Typo Behaviour : grotesk neutre ; aucune police propriétaire chargée. */
    --bhv-font-body: 'Inter', 'Helvetica Neue', helvetica, arial, sans-serif;
    font-family: var(--bhv-font-body);
    background: var(--bhv-white);
    color: var(--bhv-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Behaviour ── */
  .bhv-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .bhv-header {
    background: var(--bhv-dark);
    border-bottom: 1px solid var(--bhv-border-dark);
  }

  .bhv-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .bhv-header__brand {
    flex: 0 0 auto;
  }

  .bhv-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .bhv-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Mark officielle BHVR : knockout blanc sur le header sombre (ratio préservé). */
  .bhv-logo {
    display: block;
    width: auto;
    height: 30px;
    filter: brightness(0) invert(1);
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .bhv-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .bhv-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : blanche, rouge au hover. */
  .bhv-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--bhv-radius);
    color: var(--bhv-on-dark);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .bhv-search-btn:hover,
  .bhv-search-btn:focus-visible {
    background: rgba(255, 255, 255, 0.06);
    border-color: var(--bhv-red);
    color: var(--bhv-red);
    outline: none;
  }

  .bhv-nav__item {
    flex: 0 0 auto;
  }

  .bhv-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--bhv-on-dark);
    display: inline-flex;
    font-family: var(--bhv-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .bhv-nav__link:hover,
  .bhv-nav__link:focus-visible {
    color: var(--bhv-red);
    outline: none;
  }

  /* Onglet actif : souligné rouge signal (la barre d'accent Behaviour). */
  .bhv-nav__link[aria-current="page"] {
    border-bottom-color: var(--bhv-red);
    color: var(--bhv-white);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .bhv-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .bhv-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .bhv-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .bhv-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--bhv-border-dark);
  }

  /* Overrides switchers dans header Behaviour (champs sombres, texte blanc lisible). */
  .bhv-header__tools-links :global(.docs-header-control) {
    background: rgba(255, 255, 255, 0.04);
    border-color: var(--bhv-border-dark);
    border-radius: var(--bhv-radius);
    color: var(--bhv-on-dark);
    font-family: inherit;
  }

  .bhv-header__tools-links :global(.docs-header-control:hover),
  .bhv-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--bhv-red);
    color: var(--bhv-white);
    box-shadow: none;
  }

  /* CTA pilule rouge signal (signature bold gaming-studio Behaviour). */
  .bhv-cta {
    align-items: center;
    background: var(--bhv-red);
    border: 1px solid var(--bhv-red);
    border-radius: var(--bhv-radius-pill);
    color: var(--bhv-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--bhv-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .bhv-cta:hover,
  .bhv-cta:focus-visible {
    background: var(--bhv-red-hover);
    border-color: var(--bhv-red-hover);
    color: var(--bhv-white);
    outline: none;
  }

  /* Burger mobile */
  .bhv-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--bhv-on-dark);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Behaviour ── */
  .bhv-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--bhv-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Behaviour ── */
  .bhv-sidebar {
    background: var(--bhv-white);
    border-right: 1px solid var(--bhv-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .bhv-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .bhv-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--bhv-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .bhv-version-badge {
    background: var(--bhv-subtle);
    border: 1px solid var(--bhv-border);
    border-radius: var(--bhv-radius);
    color: var(--bhv-red);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .bhv-sidebar-github {
    align-items: center;
    color: var(--bhv-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .bhv-sidebar-github:hover,
  .bhv-sidebar-github:focus-visible {
    color: var(--bhv-red);
  }

  .bhv-side-list,
  .bhv-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .bhv-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--bhv-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .bhv-side-link:hover,
  .bhv-side-link:focus-visible {
    background: var(--bhv-subtle);
    color: var(--bhv-red);
    text-decoration: none;
  }

  .bhv-side-link[aria-current="page"] {
    background: var(--bhv-subtle);
    border-left-color: var(--bhv-red);
    color: var(--bhv-red);
    font-weight: 700;
    text-decoration: none;
  }

  .bhv-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .bhv-side-divider {
    border-top: 1px solid var(--bhv-border);
    margin: 0.5rem 0;
  }

  .bhv-side-group {
    display: block;
  }

  .bhv-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--bhv-grey);
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
    transition: background 120ms ease;
  }

  .bhv-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .bhv-side-group__summary:hover,
  .bhv-side-group__summary:focus-visible {
    background: var(--bhv-subtle);
    outline: none;
  }

  .bhv-side-group :global(.bhv-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .bhv-side-group:not([open]) :global(.bhv-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .bhv-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .bhv-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .bhv-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .bhv-breadcrumb__item {
    align-items: center;
    color: var(--bhv-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .bhv-breadcrumb__item + .bhv-breadcrumb__item::before {
    color: var(--bhv-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .bhv-breadcrumb__link {
    color: var(--bhv-ink);
    text-decoration: none;
  }

  .bhv-breadcrumb__link:hover {
    color: var(--bhv-red);
    text-decoration: underline;
  }

  .bhv-breadcrumb__item span[aria-current="page"] {
    color: var(--bhv-ink);
    font-weight: 600;
  }

  /* ── Footer Behaviour ── */
  .bhv-footer {
    background: var(--bhv-dark);
    border-top: 3px solid var(--bhv-red);
    margin-top: auto;
  }

  .bhv-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .bhv-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .bhv-footer__link {
    color: var(--bhv-on-dark);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .bhv-footer__link:hover {
    color: var(--bhv-red);
    text-decoration: underline;
  }

  /* Mark BHVR au footer : knockout blanc sur le fond sombre. */
  .bhv-footer__logo {
    display: block;
    width: auto;
    height: 28px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .bhv-body {
      grid-template-columns: 1fr;
    }

    .bhv-sidebar {
      display: none;
    }

    .bhv-nav {
      display: none;
    }

    .bhv-header__tools {
      display: none;
    }

    .bhv-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .bhv-nav__link,
    .bhv-cta,
    .bhv-search-btn,
    .bhv-side-link,
    .bhv-side-group :global(.bhv-side-group__icon) {
      transition: none;
    }
  }
</style>

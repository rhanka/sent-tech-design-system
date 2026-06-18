<!--
  Chrome documentaire Plusgrade (plusgrade.com — la tech montréalaise de revenus
  ancillaires / voyage). Forme fidèle à l'en-tête réel de plusgrade.com :
  - Header : bandeau BLANC moderne (feel SaaS) avec un fin filet hairline
    (#e6e8ec) ; logo officiel « +plusgrade » (le « + » orange, le mot encre
    navy) à gauche, ~22px de haut ; nav horizontale + loupe de recherche ; CTA
    pilule orange à droite
  - Onglet de nav actif : SOULIGNÉ orange #ff5722 (barre d'accent)
  - Loupe de recherche : icône orange #ff5722
  - Barre latérale gauche : item actif accent orange à gauche + fond tinté pâle
    orange (#fff1ec), sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande navy #000414, liens blancs, filet d'accent orange #ff5722,
    wordmark « +plusgrade » en blanc/knockout (filtré en blanc)
  - Couleurs marque : orange profond #ff5722 (primaire — nav active, loupe,
    hovers, soulignés), orange foncé #e64a19 (hover), navy quasi-noir #000414
    (texte corps / nav), hairline #e6e8ec, tinte hover pâle orange #fff1ec,
    blanc #ffffff ; radius modernes (md ~8px, pilules 999px)
  - Logo officiel Plusgrade référencé via <img src="/chrome/plusgrade/logo.svg">
  - Typo : grotesk moderne (corps / UI) ; aucune police propriétaire chargée,
    fallback système sans-serif.
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

<div class="plg-shell">
  <!-- ── HEADER PLUSGRADE ── -->
  <div class="plg-header-wrap">
    <header class="plg-header" aria-label="Plusgrade">
      <div class="plg-header__inner">
        <!-- Gauche : logo officiel Plusgrade (wordmark « +plusgrade ») -->
        <div class="plg-header__brand">
          <a href="/" class="plg-header__brand-link" aria-label="Accueil : Plusgrade Design System">
            <img
              src="/chrome/plusgrade/logo.svg"
              alt="Plusgrade"
              class="plg-logo"
              width="132"
              height="22"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="plg-nav" aria-label="Navigation principale">
          <ul class="plg-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="plg-nav__item">
                <a
                  class="plg-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Plusgrade : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="plg-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA pilule -->
        <div class="plg-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="plg-header__tools-links">
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
          class="plg-header__burger"
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

  <!-- ── BODY PLUSGRADE ── -->
  <div class="plg-body">
    <!-- Sidebar -->
    <aside class="plg-sidebar" aria-label="Navigation de la documentation">
      <nav class="plg-side-nav" aria-label="Sommaire">
        <ul class="plg-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="plg-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="plg-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="plg-side-group" open={isGroupOpen(group.items)}>
                <summary class="plg-side-group__summary">
                  <ChevronDown class="plg-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="plg-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="plg-side-link plg-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="plg-side-divider" role="separator"></li>

          <li>
            <a
              class="plg-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="plg-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="plg-side-group__summary">
                  <ChevronDown class="plg-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="plg-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="plg-side-link plg-side-link--sub"
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
      <div class="plg-sidebar-footer">
        <span class="plg-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="plg-sidebar-github"
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
    <div class="plg-content">
      <nav class="plg-breadcrumb" aria-label="Breadcrumb">
        <ol class="plg-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="plg-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="plg-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER PLUSGRADE ── -->
  <footer class="plg-footer" aria-label="Pied de page Plusgrade">
    <div class="plg-footer__inner">
      <nav class="plg-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="plg-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/plusgrade/logo.svg"
        alt="Plusgrade"
        class="plg-footer__logo"
        width="132"
        height="22"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Plusgrade ── */
  .plg-shell {
    --plg-orange: #ff5722; /* orange profond : marque / action / lien / accent */
    --plg-orange-hover: #e64a19; /* orange assombri : hover */
    --plg-ink: #000414; /* navy quasi-noir : texte primaire / corps / nav */
    --plg-ink-footer: #000414; /* bande footer navy */
    --plg-grey: #5b6170; /* gris secondaire (sur fond clair) */
    --plg-grey-muted: #8a90a0; /* gris clair */
    --plg-subtle: #fff1ec; /* tinte hover pâle orange */
    --plg-subtle-2: #f4f5f7; /* surface neutre secondaire */
    --plg-border: #e6e8ec; /* hairline moderne */
    --plg-white: #fff;
    --plg-sidebar-width: 17rem;
    --plg-radius: 8px; /* contrôles arrondis modernes */
    --plg-radius-pill: 999px; /* pilules / CTA */
    /* Typo Plusgrade : grotesk moderne ; aucune police propriétaire chargée. */
    --plg-font-body: 'Inter', system-ui, -apple-system, 'Segoe UI', helvetica, arial, sans-serif;
    font-family: var(--plg-font-body);
    background: var(--plg-white);
    color: var(--plg-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Plusgrade ── */
  .plg-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .plg-header {
    background: var(--plg-white);
    border-bottom: 1px solid var(--plg-border);
  }

  .plg-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .plg-header__brand {
    flex: 0 0 auto;
  }

  .plg-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .plg-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel Plusgrade (wordmark « +plusgrade », ratio préservé, ~22px). */
  .plg-logo {
    display: block;
    width: auto;
    height: 22px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .plg-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .plg-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré doux, icône orange, hover tinte. */
  .plg-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--plg-radius);
    color: var(--plg-orange);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .plg-search-btn:hover,
  .plg-search-btn:focus-visible {
    background: var(--plg-subtle);
    border-color: var(--plg-orange);
    color: var(--plg-orange-hover);
    outline: none;
  }

  .plg-nav__item {
    flex: 0 0 auto;
  }

  .plg-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--plg-ink);
    display: inline-flex;
    font-family: var(--plg-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .plg-nav__link:hover,
  .plg-nav__link:focus-visible {
    color: var(--plg-orange);
    outline: none;
  }

  /* Onglet actif : souligné orange #ff5722 (barre d'accent Plusgrade). */
  .plg-nav__link[aria-current="page"] {
    border-bottom-color: var(--plg-orange);
    color: var(--plg-ink);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .plg-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .plg-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .plg-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .plg-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--plg-border);
  }

  /* Overrides switchers dans header Plusgrade (champs clairs, bord hairline 1px). */
  .plg-header__tools-links :global(.docs-header-control) {
    background: var(--plg-white);
    border-color: var(--plg-border);
    border-radius: var(--plg-radius);
    color: var(--plg-ink);
    font-family: inherit;
  }

  .plg-header__tools-links :global(.docs-header-control:hover),
  .plg-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--plg-subtle);
    border-color: var(--plg-orange);
    color: var(--plg-orange);
    box-shadow: none;
  }

  /* CTA pilule orange (signature Plusgrade moderne). */
  .plg-cta {
    align-items: center;
    background: var(--plg-orange);
    border: 1px solid var(--plg-orange);
    border-radius: var(--plg-radius-pill);
    color: var(--plg-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--plg-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .plg-cta:hover,
  .plg-cta:focus-visible {
    background: var(--plg-orange-hover);
    border-color: var(--plg-orange-hover);
    color: var(--plg-white);
    outline: none;
  }

  /* Burger mobile */
  .plg-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--plg-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Plusgrade ── */
  .plg-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--plg-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Plusgrade ── */
  .plg-sidebar {
    background: var(--plg-white);
    border-right: 1px solid var(--plg-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .plg-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .plg-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--plg-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .plg-version-badge {
    background: var(--plg-subtle);
    border: 1px solid var(--plg-border);
    border-radius: var(--plg-radius);
    color: var(--plg-orange);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .plg-sidebar-github {
    align-items: center;
    color: var(--plg-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .plg-sidebar-github:hover,
  .plg-sidebar-github:focus-visible {
    color: var(--plg-orange);
  }

  .plg-side-list,
  .plg-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .plg-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--plg-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .plg-side-link:hover,
  .plg-side-link:focus-visible {
    background: var(--plg-subtle);
    color: var(--plg-orange);
    text-decoration: none;
  }

  .plg-side-link[aria-current="page"] {
    background: var(--plg-subtle);
    border-left-color: var(--plg-orange);
    color: var(--plg-orange);
    font-weight: 700;
    text-decoration: none;
  }

  .plg-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .plg-side-divider {
    border-top: 1px solid var(--plg-border);
    margin: 0.5rem 0;
  }

  .plg-side-group {
    display: block;
  }

  .plg-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--plg-grey);
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

  .plg-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .plg-side-group__summary:hover,
  .plg-side-group__summary:focus-visible {
    background: var(--plg-subtle);
    outline: none;
  }

  .plg-side-group :global(.plg-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .plg-side-group:not([open]) :global(.plg-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .plg-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .plg-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .plg-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .plg-breadcrumb__item {
    align-items: center;
    color: var(--plg-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .plg-breadcrumb__item + .plg-breadcrumb__item::before {
    color: var(--plg-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .plg-breadcrumb__link {
    color: var(--plg-ink);
    text-decoration: none;
  }

  .plg-breadcrumb__link:hover {
    color: var(--plg-orange);
    text-decoration: underline;
  }

  .plg-breadcrumb__item span[aria-current="page"] {
    color: var(--plg-ink);
    font-weight: 600;
  }

  /* ── Footer Plusgrade ── */
  .plg-footer {
    background: var(--plg-ink-footer);
    border-top: 3px solid var(--plg-orange);
    margin-top: auto;
  }

  .plg-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .plg-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .plg-footer__link {
    color: var(--plg-white);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .plg-footer__link:hover {
    color: var(--plg-orange);
    text-decoration: underline;
  }

  /* Wordmark « +plusgrade » en blanc/knockout sur la bande navy. */
  .plg-footer__logo {
    display: block;
    width: auto;
    height: 22px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .plg-body {
      grid-template-columns: 1fr;
    }

    .plg-sidebar {
      display: none;
    }

    .plg-nav {
      display: none;
    }

    .plg-header__tools {
      display: none;
    }

    .plg-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .plg-nav__link,
    .plg-cta,
    .plg-search-btn,
    .plg-side-link,
    .plg-side-group :global(.plg-side-group__icon) {
      transition: none;
    }
  }
</style>

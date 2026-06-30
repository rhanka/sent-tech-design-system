<!--
  Chrome documentaire Coveo (coveo.com) : SaaS de recherche IA québécois.
  Forme fidèle à l'en-tête réel de coveo.com :
  - Header : barre supérieure BLANCHE épurée, logo officiel Coveo (mark + wordmark) à gauche,
    nav horizontale au centre, CTA ROUGE corail à droite
  - Onglet actif = SOULIGNÉ rouge ; liens interactifs en bleu Coveo
  - Barre latérale gauche : item actif accent rouge + fond subtil, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande claire avec liens + logo
  - Couleurs mesurées : rouge #d2271b (primaire, hover #b51f15), bleu interactif #1169da (liens),
    indigo #393968 / #333357, violet #390076 (accent), encre #0e0f12, surfaces blanches,
    subtle #f9f9fa, bordure #e2e2e6 ; rayon 6px, focus #1169da
  - Logo officiel Coveo (vecteur) référencé via <img src="/chrome/coveo/logo.svg">
  - Typo : 'canada-type-gibson' est propriétaire → repli sur 'Mulish' (sans géométrique
    proche, x-height/rondeur similaires), chargée via Google Fonts dans <svelte:head>
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

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <!-- canada-type-gibson (police propriétaire Coveo) indisponible → Mulish, proche géométrique. -->
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700;800&display=swap"
  />
</svelte:head>

<div class="cvo-shell">
  <!-- ── HEADER Coveo ── -->
  <div class="cvo-header-wrap">
    <header class="cvo-header" aria-label="Coveo">
      <div class="cvo-header__inner">
        <!-- Gauche : logo officiel Coveo (mark + wordmark) -->
        <div class="cvo-header__brand">
          <a href="/" class="cvo-header__brand-link" aria-label="Accueil : Coveo Design System">
            <img
              src="/chrome/coveo/logo.svg"
              alt="Coveo"
              class="cvo-logo"
              width="116"
              height="32"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="cvo-nav" aria-label="Navigation principale">
          <ul class="cvo-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="cvo-nav__item">
                <a
                  class="cvo-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </nav>

        <!-- Droite : recherche + outils + CTA rouge corail -->
        <div class="cvo-header__tools">
          <!-- Recherche Coveo : bouton loupe rouge corail compact (palette docs). -->
          <button
            type="button"
            class="cvo-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="cvo-header__tools-links">
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
          class="cvo-header__burger"
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

  <!-- ── BODY Coveo ── -->
  <div class="cvo-body">
    <!-- Sidebar -->
    <aside class="cvo-sidebar" aria-label="Navigation de la documentation">
      <nav class="cvo-side-nav" aria-label="Sommaire">
        <ul class="cvo-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="cvo-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="cvo-side-divider" role="separator"></li>

          <li class="cvo-side-heading">
            <a
              class="cvo-side-link cvo-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="cvo-side-group" open={isGroupOpen(group.items)}>
                <summary class="cvo-side-group__summary">
                  <ChevronDown class="cvo-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="cvo-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="cvo-side-link cvo-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="cvo-side-divider" role="separator"></li>

          <li class="cvo-side-heading">
            <a
              class="cvo-side-link cvo-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="cvo-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="cvo-side-group__summary">
                  <ChevronDown class="cvo-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="cvo-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="cvo-side-link cvo-side-link--sub"
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
      <div class="cvo-sidebar-footer">
        <span class="cvo-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="cvo-sidebar-github"
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
    <div class="cvo-content">
      <nav class="cvo-breadcrumb" aria-label="Breadcrumb">
        <ol class="cvo-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="cvo-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="cvo-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Coveo ── -->
  <footer class="cvo-footer" aria-label="Pied de page Coveo">
    <div class="cvo-footer__inner">
      <nav class="cvo-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="cvo-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/coveo/logo.svg"
        alt="Coveo"
        class="cvo-footer__logo"
        width="116"
        height="32"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Coveo ── */
  .cvo-shell {
    --cvo-red: #d2271b; /* rouge corail primaire Coveo */
    --cvo-red-hover: #b51f15; /* rouge survol CTA */
    --cvo-blue: #1169da; /* bleu interactif (liens) */
    --cvo-indigo: #393968; /* indigo titres */
    --cvo-indigo-deep: #333357; /* indigo profond */
    --cvo-purple: #390076; /* violet accent */
    --cvo-ink: #0e0f12; /* encre */
    --cvo-grey: #5b5b66; /* gris texte secondaire */
    --cvo-subtle: #f9f9fa; /* surface subtile */
    --cvo-border: #e2e2e6; /* bordure légère */
    --cvo-border-strong: #c9c9d0;
    --cvo-white: #fff;
    --cvo-sidebar-width: 17rem;
    --cvo-radius: 6px; /* conteneurs 6px arrondis */
    font-family: 'Mulish', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif;
    background: var(--cvo-white);
    color: var(--cvo-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Coveo ── */
  .cvo-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .cvo-header {
    background: var(--cvo-white);
    border-bottom: 1px solid var(--cvo-border);
  }

  .cvo-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .cvo-header__brand {
    flex: 0 0 auto;
  }

  .cvo-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .cvo-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Coveo (ratio préservé, hauteur ~30px comme l'en-tête réel). */
  .cvo-logo {
    display: block;
    width: auto;
    height: 30px;
  }

  /* ── Nav horizontale (centre) ── */
  .cvo-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .cvo-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cvo-nav__item {
    flex: 0 0 auto;
  }

  .cvo-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--cvo-indigo);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: color 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .cvo-nav__link:hover,
  .cvo-nav__link:focus-visible {
    color: var(--cvo-red);
    outline: none;
  }

  /* Onglet actif : souligné rouge Coveo. */
  .cvo-nav__link[aria-current="page"] {
    border-bottom-color: var(--cvo-red);
    color: var(--cvo-red);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .cvo-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .cvo-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Coveo (champs clairs, bordure 1px, rayon 6px). */
  .cvo-header__tools-links :global(.docs-header-control) {
    background: var(--cvo-white);
    border-color: var(--cvo-border-strong);
    border-radius: var(--cvo-radius);
    color: var(--cvo-ink);
    font-family: inherit;
  }

  .cvo-header__tools-links :global(.docs-header-control:hover),
  .cvo-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--cvo-subtle);
    border-color: var(--cvo-blue);
    color: var(--cvo-blue);
    box-shadow: none;
  }

  /* Recherche Coveo : bouton loupe rouge corail compact (radius 6px, focus bleu). */
  .cvo-search__btn {
    align-items: center;
    background: var(--cvo-red);
    border: 1px solid var(--cvo-red);
    border-radius: var(--cvo-radius);
    color: var(--cvo-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease;
  }

  .cvo-search__btn:hover,
  .cvo-search__btn:focus-visible {
    background: var(--cvo-red-hover);
    border-color: var(--cvo-red-hover);
    outline: 2px solid var(--cvo-blue);
    outline-offset: 1px;
  }

  /* CTA rouge corail (rayon 6px). */
  .cvo-cta {
    align-items: center;
    background: var(--cvo-red);
    border: 1px solid var(--cvo-red);
    border-radius: var(--cvo-radius);
    color: var(--cvo-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .cvo-cta:hover,
  .cvo-cta:focus-visible {
    background: var(--cvo-red-hover);
    border-color: var(--cvo-red-hover);
    color: var(--cvo-white);
    outline: none;
  }

  /* Burger mobile */
  .cvo-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--cvo-indigo);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Coveo ── */
  .cvo-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--cvo-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Coveo ── */
  .cvo-sidebar {
    background: var(--cvo-white);
    border-right: 1px solid var(--cvo-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .cvo-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .cvo-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--cvo-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .cvo-version-badge {
    background: var(--cvo-subtle);
    border: 1px solid var(--cvo-border);
    border-radius: var(--cvo-radius);
    color: var(--cvo-red);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .cvo-sidebar-github {
    align-items: center;
    color: var(--cvo-indigo);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .cvo-sidebar-github:hover,
  .cvo-sidebar-github:focus-visible {
    color: var(--cvo-red);
  }

  .cvo-side-list,
  .cvo-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cvo-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--cvo-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .cvo-side-link:hover,
  .cvo-side-link:focus-visible {
    background: var(--cvo-subtle);
    color: var(--cvo-red);
    text-decoration: none;
  }

  .cvo-side-link[aria-current="page"] {
    background: var(--cvo-subtle);
    border-left-color: var(--cvo-red);
    color: var(--cvo-red);
    font-weight: 700;
    text-decoration: none;
  }

  .cvo-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .cvo-side-divider {
    border-top: 1px solid var(--cvo-border);
    margin: 0.5rem 0;
  }

  .cvo-side-group {
    display: block;
  }

  .cvo-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--cvo-grey);
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

  .cvo-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .cvo-side-group__summary:hover,
  .cvo-side-group__summary:focus-visible {
    background: var(--cvo-subtle);
    outline: none;
  }

  .cvo-side-group :global(.cvo-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .cvo-side-group:not([open]) :global(.cvo-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .cvo-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .cvo-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .cvo-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cvo-breadcrumb__item {
    align-items: center;
    color: var(--cvo-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .cvo-breadcrumb__item + .cvo-breadcrumb__item::before {
    color: var(--cvo-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .cvo-breadcrumb__link {
    color: var(--cvo-blue);
    text-decoration: none;
  }

  .cvo-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .cvo-breadcrumb__item span[aria-current="page"] {
    color: var(--cvo-ink);
    font-weight: 600;
  }

  /* ── Footer Coveo ── */
  .cvo-footer {
    background: var(--cvo-subtle);
    border-top: 1px solid var(--cvo-border);
    margin-top: auto;
  }

  .cvo-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .cvo-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .cvo-footer__link {
    color: var(--cvo-indigo);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .cvo-footer__link:hover {
    color: var(--cvo-red);
    text-decoration: underline;
  }

  .cvo-footer__logo {
    display: block;
    width: auto;
    height: 28px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .cvo-body {
      grid-template-columns: 1fr;
    }

    .cvo-sidebar {
      display: none;
    }

    .cvo-nav {
      display: none;
    }

    .cvo-header__tools {
      display: none;
    }

    .cvo-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .cvo-nav__link,
    .cvo-cta,
    .cvo-search__btn,
    .cvo-side-link,
    .cvo-side-group :global(.cvo-side-group__icon) {
      transition: none;
    }
  }
</style>

<!--
  Chrome documentaire Air Canada (aircanada.com).
  Forme fidèle à l'en-tête réel d'aircanada.com :
  - Header : barre BLANCHE épurée, logo officiel Air Canada (rondelle/feuille
    d'érable rouge + wordmark) à gauche, nav horizontale, CTA bleu à droite
  - Loupe de recherche compacte (bouton, pas de champ), branchée sur la palette docs
  - Onglet de nav actif : SOULIGNÉ bleu
  - Barre latérale gauche : item actif accent bleu à gauche + fond bleu clair tinté,
    sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande grise claire avec liens + logo Air Canada
  - Couleurs mesurées : bleu UI #1460aa (primaire), profond #003d78 (hover),
    rouge marque #d8292f (accent / feuille d'érable), encre #000000,
    surfaces blanches, gris page #f9f9f9, bord #c9cacc, danger #851109 ;
    radius 4px (cartes 16px)
  - Logo officiel Air Canada (vecteur Wikimedia, rouge) référencé via
    <img src="/chrome/air-canada/logo.svg">
  - Typo : 'AC Nord Display'/'AC Nord Text' propriétaires → repli 'Open Sans',
    chargée via Google Fonts dans <svelte:head>
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
    buildTopNav,
    resolveBreadcrumb,
    type ComponentNavItem
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
    mobileMenuOpen,
    onMobileMenuToggle,
  }: Props = $props();

  const topNavItems = $derived(buildTopNav(locale.value));
  const foundationNavItems = $derived(buildFoundationNav(locale.value));
  const componentGroups = $derived(buildComponentNavGroups(locale.value));
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
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap"
  />
</svelte:head>

<div class="ac-shell">
  <!-- ── HEADER AIR CANADA ── -->
  <div class="ac-header-wrap">
    <header class="ac-header" aria-label="Air Canada">
      <div class="ac-header__inner">
        <!-- Gauche : logo officiel Air Canada (rondelle rouge + wordmark) -->
        <div class="ac-header__brand">
          <a href="/" class="ac-header__brand-link" aria-label="Accueil : Air Canada Design System">
            <img
              src="/chrome/air-canada/logo.svg"
              alt="Air Canada"
              class="ac-logo"
              width="207"
              height="27"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche compacte -->
        <nav class="ac-nav" aria-label="Navigation principale">
          <ul class="ac-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="ac-nav__item">
                <a
                  class="ac-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Air Canada : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="ac-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA bleu -->
        <div class="ac-header__tools">
          <div class="ac-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA bleu (radius 4px) : signature Air Canada -->
          <a class="ac-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="ac-header__burger"
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

  <!-- ── BODY AIR CANADA ── -->
  <div class="ac-body">
    <!-- Sidebar -->
    <aside class="ac-sidebar" aria-label="Navigation de la documentation">
      <nav class="ac-side-nav" aria-label="Sommaire">
        <ul class="ac-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="ac-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="ac-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="ac-side-group" open={isGroupOpen(group.items)}>
                <summary class="ac-side-group__summary">
                  <ChevronDown class="ac-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="ac-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="ac-side-link ac-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
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
      <div class="ac-sidebar-footer">
        <span class="ac-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="ac-sidebar-github"
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
    <div class="ac-content">
      <nav class="ac-breadcrumb" aria-label="Breadcrumb">
        <ol class="ac-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="ac-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="ac-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER AIR CANADA ── -->
  <footer class="ac-footer" aria-label="Pied de page Air Canada">
    <div class="ac-footer__inner">
      <nav class="ac-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="ac-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/air-canada/logo.svg"
        alt="Air Canada"
        class="ac-footer__logo"
        width="184"
        height="24"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Air Canada ── */
  .ac-shell {
    --ac-blue: #1460aa; /* bleu UI primaire */
    --ac-blue-deep: #003d78; /* bleu profond / hover */
    --ac-red: #d8292f; /* rouge marque / accent / feuille d'érable */
    --ac-ink: #000000; /* encre */
    --ac-grey: #5c5c5c; /* gris texte secondaire */
    --ac-page: #f9f9f9; /* gris page / surface subtile */
    --ac-blue-light: #e4eef7; /* bleu clair tinté (surface secondaire) */
    --ac-border: #c9cacc; /* bord */
    --ac-danger: #851109; /* danger */
    --ac-white: #fff;
    --ac-sidebar-width: 17rem;
    --ac-radius: 4px; /* contrôles / conteneurs */
    --ac-radius-card: 16px; /* cartes */
    font-family: 'AC Nord Text', 'Open Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--ac-white);
    color: var(--ac-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Air Canada ── */
  .ac-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .ac-header {
    background: var(--ac-white);
    border-bottom: 1px solid var(--ac-border);
  }

  .ac-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .ac-header__brand {
    flex: 0 0 auto;
  }

  .ac-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .ac-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Air Canada (ratio préservé, hauteur ~27px comme l'en-tête réel). */
  .ac-logo {
    display: block;
    width: auto;
    height: 27px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .ac-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .ac-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré 4px, hover bleu clair/bleu. */
  .ac-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--ac-radius);
    color: var(--ac-ink);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .ac-search-btn:hover,
  .ac-search-btn:focus-visible {
    background: var(--ac-blue-light);
    border-color: var(--ac-blue);
    color: var(--ac-blue);
    outline: none;
  }

  .ac-nav__item {
    flex: 0 0 auto;
  }

  .ac-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--ac-ink);
    display: inline-flex;
    font-family: 'AC Nord Display', 'Open Sans', system-ui, sans-serif;
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .ac-nav__link:hover,
  .ac-nav__link:focus-visible {
    color: var(--ac-blue);
    outline: none;
  }

  .ac-nav__link[aria-current="page"] {
    border-bottom-color: var(--ac-blue);
    color: var(--ac-blue);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .ac-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .ac-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Air Canada (champs clairs, bord gris 1px). */
  .ac-header__tools-links :global(.docs-header-control) {
    background: var(--ac-white);
    border-color: var(--ac-border);
    border-radius: var(--ac-radius);
    color: var(--ac-ink);
    font-family: inherit;
  }

  .ac-header__tools-links :global(.docs-header-control:hover),
  .ac-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--ac-blue-light);
    border-color: var(--ac-blue);
    color: var(--ac-blue);
    box-shadow: none;
  }

  /* CTA bleu (radius 4px). */
  .ac-cta {
    align-items: center;
    background: var(--ac-blue);
    border: 1px solid var(--ac-blue);
    border-radius: var(--ac-radius);
    color: var(--ac-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: 'AC Nord Display', 'Open Sans', system-ui, sans-serif;
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .ac-cta:hover,
  .ac-cta:focus-visible {
    background: var(--ac-blue-deep);
    border-color: var(--ac-blue-deep);
    color: var(--ac-white);
    outline: none;
  }

  /* Burger mobile */
  .ac-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--ac-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Air Canada ── */
  .ac-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--ac-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Air Canada ── */
  .ac-sidebar {
    background: var(--ac-white);
    border-right: 1px solid var(--ac-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .ac-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .ac-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--ac-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .ac-version-badge {
    background: var(--ac-blue-light);
    border: 1px solid var(--ac-border);
    border-radius: var(--ac-radius);
    color: var(--ac-blue);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .ac-sidebar-github {
    align-items: center;
    color: var(--ac-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .ac-sidebar-github:hover,
  .ac-sidebar-github:focus-visible {
    color: var(--ac-blue);
  }

  .ac-side-list,
  .ac-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ac-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--ac-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .ac-side-link:hover,
  .ac-side-link:focus-visible {
    background: var(--ac-page);
    color: var(--ac-blue);
    text-decoration: none;
  }

  .ac-side-link[aria-current="page"] {
    background: var(--ac-blue-light);
    border-left-color: var(--ac-blue);
    color: var(--ac-blue-deep);
    font-weight: 700;
    text-decoration: none;
  }

  .ac-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .ac-side-divider {
    border-top: 1px solid var(--ac-border);
    margin: 0.5rem 0;
  }

  .ac-side-group {
    display: block;
  }

  .ac-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--ac-grey);
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

  .ac-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .ac-side-group__summary:hover,
  .ac-side-group__summary:focus-visible {
    background: var(--ac-page);
    outline: none;
  }

  .ac-side-group :global(.ac-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .ac-side-group:not([open]) :global(.ac-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .ac-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .ac-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .ac-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ac-breadcrumb__item {
    align-items: center;
    color: var(--ac-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .ac-breadcrumb__item + .ac-breadcrumb__item::before {
    color: var(--ac-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .ac-breadcrumb__link {
    color: var(--ac-blue);
    text-decoration: none;
  }

  .ac-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .ac-breadcrumb__item span[aria-current="page"] {
    color: var(--ac-ink);
    font-weight: 600;
  }

  /* ── Footer Air Canada ── */
  .ac-footer {
    background: var(--ac-page);
    border-top: 1px solid var(--ac-border);
    margin-top: auto;
  }

  .ac-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .ac-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .ac-footer__link {
    color: var(--ac-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .ac-footer__link:hover {
    color: var(--ac-blue);
    text-decoration: underline;
  }

  .ac-footer__logo {
    display: block;
    width: auto;
    height: 24px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .ac-body {
      grid-template-columns: 1fr;
    }

    .ac-sidebar {
      display: none;
    }

    .ac-nav {
      display: none;
    }

    .ac-header__tools {
      display: none;
    }

    .ac-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .ac-nav__link,
    .ac-cta,
    .ac-search-btn,
    .ac-side-link,
    .ac-side-group :global(.ac-side-group__icon) {
      transition: none;
    }
  }
</style>

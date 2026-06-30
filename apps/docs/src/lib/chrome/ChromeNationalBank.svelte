<!--
  Chrome documentaire Banque Nationale du Canada / National Bank of Canada (bnc.ca / nbc.ca).
  Forme fidèle à l'en-tête réel de bnc.ca :
  - Header : barre BLANCHE épurée, logo officiel BNC (flèche rouge + mot-symbole encre) à gauche,
    nav horizontale, CTA PILULE ROUGE (radius 999px) à droite
  - Nav active : soulignement rouge ; barre latérale active : accent rouge/encre navy
  - Couleurs MESURÉES : rouge #e41937 (primaire, hover #be171d), encre navy #00314d (titres/inverse),
    surfaces blanches, gris de page #f5f5f5, anneau de champ #e1e1e1, focus bleu #1572c5,
    pilules 999px + entrées 6px, danger #d0011b
  - Logo officiel BNC (vecteur depuis bnc.ca) référencé via <img src="/chrome/national-bank/logo.svg">
  - Typo : "Gilroy"/"Korolev" propriétaires → repli sur 'Poppins', chargée via Google Fonts dans <svelte:head>
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
  <!-- Gilroy / Korolev (polices propriétaires BNC) indisponibles → Poppins, proche géométrique. -->
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
  />
</svelte:head>

<div class="nbc-shell">
  <!-- ── HEADER Banque Nationale ── -->
  <div class="nbc-header-wrap">
    <header class="nbc-header" aria-label="Banque Nationale">
      <div class="nbc-header__inner">
        <!-- Gauche : logo officiel (flèche rouge + mot-symbole encre) -->
        <div class="nbc-header__brand">
          <a href="/" class="nbc-header__brand-link" aria-label="Accueil : National Bank Design System">
            <img
              src="/chrome/national-bank/logo.svg"
              alt="National Bank"
              class="nbc-logo"
              width="124"
              height="40"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="nbc-nav" aria-label="Navigation principale">
          <ul class="nbc-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="nbc-nav__item">
                <a
                  class="nbc-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </nav>

        <!-- Droite : recherche + outils + CTA pilule rouge -->
        <div class="nbc-header__tools">
          <!-- Recherche BNC : bouton loupe compact (anneau gris 1px, palette docs). -->
          <button
            type="button"
            class="nbc-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="nbc-header__tools-links">
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
          class="nbc-header__burger"
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

  <!-- ── BODY Banque Nationale ── -->
  <div class="nbc-body">
    <!-- Sidebar -->
    <aside class="nbc-sidebar" aria-label="Navigation de la documentation">
      <nav class="nbc-side-nav" aria-label="Sommaire">
        <ul class="nbc-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="nbc-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="nbc-side-divider" role="separator"></li>

          <li class="nbc-side-heading">
            <a
              class="nbc-side-link nbc-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="nbc-side-group" open={isGroupOpen(group.items)}>
                <summary class="nbc-side-group__summary">
                  <ChevronDown class="nbc-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="nbc-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="nbc-side-link nbc-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="nbc-side-divider" role="separator"></li>

          <li class="nbc-side-heading">
            <a
              class="nbc-side-link nbc-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="nbc-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="nbc-side-group__summary">
                  <ChevronDown class="nbc-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="nbc-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="nbc-side-link nbc-side-link--sub"
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
      <div class="nbc-sidebar-footer">
        <span class="nbc-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="nbc-sidebar-github"
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
    <div class="nbc-content">
      <nav class="nbc-breadcrumb" aria-label="Breadcrumb">
        <ol class="nbc-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="nbc-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="nbc-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Banque Nationale ── -->
  <footer class="nbc-footer" aria-label="Pied de page Banque Nationale">
    <div class="nbc-footer__inner">
      <nav class="nbc-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="nbc-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/national-bank/logo.svg"
        alt="National Bank"
        class="nbc-footer__logo"
        width="124"
        height="40"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Banque Nationale ── */
  .nbc-shell {
    --nbc-red: #e41937; /* rouge primaire BNC */
    --nbc-red-hover: #be171d; /* rouge survol CTA */
    --nbc-navy: #00314d; /* encre navy : titres / inverse / texte */
    --nbc-ink: #00314d; /* encre */
    --nbc-grey: #5b6770; /* gris texte secondaire */
    --nbc-page: #f5f5f5; /* gris de page / surface subtile */
    --nbc-border: #e1e1e1; /* anneau de champ gris léger */
    --nbc-border-strong: #c9c9c9;
    --nbc-focus: #1572c5; /* bleu de focus */
    --nbc-danger: #d0011b;
    --nbc-white: #fff;
    --nbc-sidebar-width: 17rem;
    --nbc-radius: 6px; /* entrées 6px arrondies */
    font-family: 'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--nbc-white);
    color: var(--nbc-navy);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Banque Nationale ── */
  .nbc-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .nbc-header {
    background: var(--nbc-white);
    border-bottom: 1px solid var(--nbc-border);
  }

  .nbc-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .nbc-header__brand {
    flex: 0 0 auto;
  }

  .nbc-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .nbc-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel BNC (ratio préservé ~3.1:1, hauteur ~36px comme l'en-tête réel). */
  .nbc-logo {
    display: block;
    width: auto;
    height: 36px;
  }

  /* ── Nav horizontale (centre) ── */
  .nbc-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .nbc-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nbc-nav__item {
    flex: 0 0 auto;
  }

  .nbc-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--nbc-navy);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease;
    white-space: nowrap;
  }

  .nbc-nav__link:hover,
  .nbc-nav__link:focus-visible {
    color: var(--nbc-red);
    outline: none;
  }

  /* Onglet actif : soulignement rouge (signature BNC). */
  .nbc-nav__link[aria-current="page"] {
    border-bottom-color: var(--nbc-red);
    color: var(--nbc-red);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .nbc-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .nbc-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header BNC (champs clairs, anneau gris 1px). */
  .nbc-header__tools-links :global(.docs-header-control) {
    background: var(--nbc-white);
    border-color: var(--nbc-border-strong);
    border-radius: var(--nbc-radius);
    color: var(--nbc-navy);
    font-family: inherit;
  }

  .nbc-header__tools-links :global(.docs-header-control:hover),
  .nbc-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--nbc-page);
    border-color: var(--nbc-red);
    color: var(--nbc-red);
    box-shadow: none;
  }

  /* Recherche BNC : bouton loupe carré compact (anneau gris 1px, entrée 6px). */
  .nbc-search__btn {
    align-items: center;
    background: var(--nbc-white);
    border: 1px solid var(--nbc-border-strong);
    border-radius: var(--nbc-radius);
    color: var(--nbc-navy);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .nbc-search__btn:hover,
  .nbc-search__btn:focus-visible {
    background: var(--nbc-page);
    border-color: var(--nbc-red);
    color: var(--nbc-red);
    outline: none;
  }

  /* CTA pilule rouge (radius 999px). */
  .nbc-cta {
    align-items: center;
    background: var(--nbc-red);
    border: 1px solid var(--nbc-red);
    border-radius: 999px;
    color: var(--nbc-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.875rem;
    font-weight: 600;
    height: 2.5rem;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .nbc-cta:hover,
  .nbc-cta:focus-visible {
    background: var(--nbc-red-hover);
    border-color: var(--nbc-red-hover);
    color: var(--nbc-white);
    outline: none;
  }

  /* Burger mobile */
  .nbc-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--nbc-navy);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Banque Nationale ── */
  .nbc-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--nbc-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Banque Nationale ── */
  .nbc-sidebar {
    background: var(--nbc-white);
    border-right: 1px solid var(--nbc-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .nbc-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .nbc-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--nbc-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .nbc-version-badge {
    background: var(--nbc-page);
    border: 1px solid var(--nbc-border);
    border-radius: var(--nbc-radius);
    color: var(--nbc-red);
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .nbc-sidebar-github {
    align-items: center;
    color: var(--nbc-navy);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .nbc-sidebar-github:hover,
  .nbc-sidebar-github:focus-visible {
    color: var(--nbc-red);
  }

  .nbc-side-list,
  .nbc-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nbc-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--nbc-navy);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .nbc-side-link:hover,
  .nbc-side-link:focus-visible {
    background: var(--nbc-page);
    color: var(--nbc-red);
    text-decoration: none;
  }

  /* Item actif : accent rouge + fond subtil + encre navy. */
  .nbc-side-link[aria-current="page"] {
    background: var(--nbc-page);
    border-left-color: var(--nbc-red);
    color: var(--nbc-red);
    font-weight: 600;
    text-decoration: none;
  }

  .nbc-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .nbc-side-divider {
    border-top: 1px solid var(--nbc-border);
    margin: 0.5rem 0;
  }

  .nbc-side-group {
    display: block;
  }

  .nbc-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--nbc-grey);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 600;
    gap: 0.35rem;
    letter-spacing: 0.06em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 1rem 0 calc(1rem - 3px);
    text-transform: uppercase;
    transition: background 120ms ease;
  }

  .nbc-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .nbc-side-group__summary:hover,
  .nbc-side-group__summary:focus-visible {
    background: var(--nbc-page);
    outline: none;
  }

  .nbc-side-group :global(.nbc-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .nbc-side-group:not([open]) :global(.nbc-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .nbc-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .nbc-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .nbc-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nbc-breadcrumb__item {
    align-items: center;
    color: var(--nbc-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .nbc-breadcrumb__item + .nbc-breadcrumb__item::before {
    color: var(--nbc-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .nbc-breadcrumb__link {
    color: var(--nbc-red);
    text-decoration: none;
  }

  .nbc-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .nbc-breadcrumb__item span[aria-current="page"] {
    color: var(--nbc-navy);
    font-weight: 600;
  }

  /* ── Footer Banque Nationale ── */
  .nbc-footer {
    background: var(--nbc-page);
    border-top: 1px solid var(--nbc-border);
    margin-top: auto;
  }

  .nbc-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .nbc-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .nbc-footer__link {
    color: var(--nbc-navy);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .nbc-footer__link:hover {
    color: var(--nbc-red);
    text-decoration: underline;
  }

  .nbc-footer__logo {
    display: block;
    width: auto;
    height: 32px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .nbc-body {
      grid-template-columns: 1fr;
    }

    .nbc-sidebar {
      display: none;
    }

    .nbc-nav {
      display: none;
    }

    .nbc-header__tools {
      display: none;
    }

    .nbc-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .nbc-nav__link,
    .nbc-cta,
    .nbc-search__btn,
    .nbc-side-link,
    .nbc-side-group :global(.nbc-side-group__icon) {
      transition: none;
    }
  }
</style>

<!--
  Chrome documentaire Bombardier (bombardier.com).
  Forme fidèle à l'esprit Bombardier : premium, sobre, raffiné.
  - Header : bandeau DEEP-TEAL pétrole (#003e51), logo OFFICIEL blanc à gauche,
    nav horizontale, CTA pilule contour clair à droite (signature pilule Bombardier)
  - Corps : surfaces claires (blanc + crème chaud #fdfbf3), encre #202020,
    texte bronze #89674a, accents or #d19000 / #c7b289
  - Onglet de nav actif = SOULIGNÉ or (underline)
  - Barre latérale gauche : item actif accent teal + fond crème subtil
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande crème avec liens + logo (sur pastille teal pour la lisibilité du blanc)
  - Boutons PILULE (radius 999px) mais CHAMPS CARRÉS (radius 0) — signature mesurée
  - Focus inset #00171e
  - Logo officiel Bombardier (vecteur blanc) référencé via <img src="/chrome/bombardier/logo.svg">
    Asset blanc → posé sur header teal (aucun filtre requis) ; en pied, posé sur pastille teal.
  - Typo : police propriétaire « Trust » indisponible → repli sans 'Inter', display
    'Playfair Display' (serif raffinée), chargées via Google Fonts dans <svelte:head>
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
  <!-- « Trust » (police propriétaire Bombardier) indisponible → Inter (corps) + Playfair Display (display, repli serif raffiné). -->
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap"
  />
</svelte:head>

<div class="bba-shell">
  <!-- ── HEADER Bombardier ── -->
  <div class="bba-header-wrap">
    <header class="bba-header" aria-label="Bombardier">
      <div class="bba-header__inner">
        <!-- Gauche : logo officiel blanc -->
        <div class="bba-header__brand">
          <a href="/" class="bba-header__brand-link" aria-label="Accueil : Bombardier Design System">
            <img
              src="/chrome/bombardier/logo.svg"
              alt="Bombardier"
              class="bba-logo"
              width="78"
              height="46"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="bba-nav" aria-label="Navigation principale">
          <ul class="bba-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="bba-nav__item">
                <a
                  class="bba-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </nav>

        <!-- Droite : outils + recherche + CTA pilule contour -->
        <div class="bba-header__tools">
          <!-- Recherche Bombardier : bouton loupe CARRÉ or compact (palette docs). -->
          <button
            type="button"
            class="bba-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="bba-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA pilule contour clair (radius 999px) : signature Bombardier -->
          <a class="bba-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="bba-header__burger"
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

  <!-- ── BODY Bombardier ── -->
  <div class="bba-body">
    <!-- Sidebar -->
    <aside class="bba-sidebar" aria-label="Navigation de la documentation">
      <nav class="bba-side-nav" aria-label="Sommaire">
        <ul class="bba-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="bba-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="bba-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="bba-side-group" open={isGroupOpen(group.items)}>
                <summary class="bba-side-group__summary">
                  <ChevronDown class="bba-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="bba-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="bba-side-link bba-side-link--sub"
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
      <div class="bba-sidebar-footer">
        <span class="bba-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="bba-sidebar-github"
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
    <div class="bba-content">
      <nav class="bba-breadcrumb" aria-label="Breadcrumb">
        <ol class="bba-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="bba-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="bba-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Bombardier ── -->
  <footer class="bba-footer" aria-label="Pied de page Bombardier">
    <div class="bba-footer__inner">
      <nav class="bba-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="bba-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <!-- Logo blanc posé sur pastille teal (lisibilité du fill blanc sur fond crème). -->
      <span class="bba-footer__logo-plate">
        <img
          src="/chrome/bombardier/logo.svg"
          alt="Bombardier"
          class="bba-footer__logo"
          width="68"
          height="40"
        />
      </span>
    </div>
  </footer>
</div>

<style>
  /* ── Variables Bombardier (marque mesurée) ── */
  .bba-shell {
    --bba-teal: #003e51; /* pétrole primaire */
    --bba-teal-hover: #00171e; /* survol / focus inset profond */
    --bba-gold: #d19000; /* accent or */
    --bba-gold-soft: #c7b289; /* or assourdi (champagne) */
    --bba-ink: #202020; /* encre titres */
    --bba-bronze: #89674a; /* texte bronze secondaire */
    --bba-cream: #fdfbf3; /* surface crème chaude (surface.subtle) */
    --bba-border: #dcdedc; /* anneau de champ */
    --bba-border-strong: #c4c8c5;
    --bba-danger: #e70d06; /* danger */
    --bba-white: #fff;
    --bba-sidebar-width: 17rem;
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--bba-white);
    color: var(--bba-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Bombardier (teal) ── */
  .bba-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .bba-header {
    background: var(--bba-teal);
    border-bottom: 1px solid var(--bba-teal-hover);
  }

  .bba-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .bba-header__brand {
    flex: 0 0 auto;
  }

  .bba-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .bba-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel blanc (stacked) — lisible sur header teal, aucun filtre requis. */
  .bba-logo {
    display: block;
    width: auto;
    height: 42px;
  }

  /* ── Nav horizontale (centre) ── */
  .bba-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .bba-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .bba-nav__item {
    flex: 0 0 auto;
  }

  .bba-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: rgba(255, 255, 255, 0.86);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    letter-spacing: 0.01em;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: color 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .bba-nav__link:hover,
  .bba-nav__link:focus-visible {
    color: var(--bba-white);
    outline: none;
  }

  /* Onglet actif = soulignement or (signature Bombardier). */
  .bba-nav__link[aria-current="page"] {
    border-bottom-color: var(--bba-gold);
    color: var(--bba-white);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .bba-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .bba-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header teal (champs translucides clairs sur fond profond). */
  .bba-header__tools-links :global(.docs-header-control) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.28);
    color: var(--bba-white);
    font-family: inherit;
  }

  .bba-header__tools-links :global(.docs-header-control:hover),
  .bba-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: rgba(255, 255, 255, 0.16);
    border-color: var(--bba-gold);
    color: var(--bba-white);
    box-shadow: none;
  }

  /* Recherche Bombardier : bouton loupe CARRÉ or compact (radius 0). */
  .bba-search__btn {
    align-items: center;
    background: var(--bba-gold);
    border: 1px solid var(--bba-gold);
    border-radius: 0;
    color: var(--bba-teal-hover);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease;
  }

  .bba-search__btn:hover,
  .bba-search__btn:focus-visible {
    background: var(--bba-gold-soft);
    border-color: var(--bba-gold-soft);
    outline: 2px solid var(--bba-gold);
    outline-offset: 1px;
  }

  /* CTA PILULE contour clair (radius 999px) : signature Bombardier. */
  .bba-cta {
    align-items: center;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 999px;
    color: var(--bba-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.875rem;
    font-weight: 600;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.4rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    white-space: nowrap;
  }

  .bba-cta:hover,
  .bba-cta:focus-visible {
    background: var(--bba-white);
    border-color: var(--bba-white);
    color: var(--bba-teal);
    outline: none;
  }

  /* Burger mobile */
  .bba-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--bba-white);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Bombardier ── */
  .bba-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--bba-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Bombardier ── */
  .bba-sidebar {
    background: var(--bba-white);
    border-right: 1px solid var(--bba-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .bba-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .bba-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--bba-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  /* Badge version CARRÉ (radius 0). */
  .bba-version-badge {
    background: var(--bba-cream);
    border: 1px solid var(--bba-border);
    border-radius: 0;
    color: var(--bba-teal);
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .bba-sidebar-github {
    align-items: center;
    color: var(--bba-bronze);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .bba-sidebar-github:hover,
  .bba-sidebar-github:focus-visible {
    color: var(--bba-teal);
  }

  .bba-side-list,
  .bba-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .bba-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--bba-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .bba-side-link:hover,
  .bba-side-link:focus-visible {
    background: var(--bba-cream);
    color: var(--bba-teal);
    text-decoration: none;
  }

  .bba-side-link[aria-current="page"] {
    background: var(--bba-cream);
    border-left-color: var(--bba-teal);
    color: var(--bba-teal);
    font-weight: 700;
    text-decoration: none;
  }

  .bba-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .bba-side-divider {
    border-top: 1px solid var(--bba-border);
    margin: 0.5rem 0;
  }

  .bba-side-group {
    display: block;
  }

  .bba-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--bba-bronze);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 700;
    gap: 0.35rem;
    letter-spacing: 0.08em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 1rem 0 calc(1rem - 3px);
    text-transform: uppercase;
    transition: background 120ms ease;
  }

  .bba-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .bba-side-group__summary:hover,
  .bba-side-group__summary:focus-visible {
    background: var(--bba-cream);
    outline: none;
  }

  .bba-side-group :global(.bba-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .bba-side-group:not([open]) :global(.bba-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .bba-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .bba-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .bba-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .bba-breadcrumb__item {
    align-items: center;
    color: var(--bba-bronze);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .bba-breadcrumb__item + .bba-breadcrumb__item::before {
    color: var(--bba-bronze);
    content: "›";
    margin: 0 0.4rem;
  }

  .bba-breadcrumb__link {
    color: var(--bba-teal);
    text-decoration: none;
  }

  .bba-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .bba-breadcrumb__item span[aria-current="page"] {
    color: var(--bba-ink);
    font-weight: 600;
  }

  /* ── Footer Bombardier (crème) ── */
  .bba-footer {
    background: var(--bba-cream);
    border-top: 1px solid var(--bba-border);
    margin-top: auto;
  }

  .bba-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .bba-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .bba-footer__link {
    color: var(--bba-bronze);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .bba-footer__link:hover {
    color: var(--bba-teal);
    text-decoration: underline;
  }

  /* Pastille teal pour la lisibilité du logo blanc sur fond crème. */
  .bba-footer__logo-plate {
    align-items: center;
    background: var(--bba-teal);
    border-radius: 0;
    display: inline-flex;
    flex: 0 0 auto;
    justify-content: center;
    padding: 0.6rem 0.9rem;
  }

  .bba-footer__logo {
    display: block;
    width: auto;
    height: 38px;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .bba-body {
      grid-template-columns: 1fr;
    }

    .bba-sidebar {
      display: none;
    }

    .bba-nav {
      display: none;
    }

    .bba-header__tools {
      display: none;
    }

    .bba-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .bba-nav__link,
    .bba-cta,
    .bba-search__btn,
    .bba-side-link,
    .bba-side-group :global(.bba-side-group__icon) {
      transition: none;
    }
  }
</style>

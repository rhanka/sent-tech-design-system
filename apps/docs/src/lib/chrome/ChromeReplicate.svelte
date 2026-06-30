<!--
  Chrome documentaire Replicate (replicate.com — la plateforme de modèles ML).
  Forme fidèle à l'en-tête de replicate.com : strictement MONOCHROME, CARRÉ,
  haut-contraste — noir/blanc avec le rouge de marque réservé aux accents.
  - Header : bandeau BLANC #ffffff, logo OFFICIEL Replicate (marque barres-coin +
    wordmark « replicate ») à gauche, nav near-black au centre (sentence-case, PAS
    de capitales), bouton recherche NOIR carré à droite
  - Coins CARRÉS (radius 0) — signature Replicate (champs/inputs border-radius:0)
  - Onglet actif = SOULIGNÉ near-black (#202020, indicateur 2px monochrome) ;
    survol des liens = ROUGE DE MARQUE #ea2804 (comportement mesuré replicate.com)
  - Barre latérale : item actif liseré rouge de marque + fond gris subtil
  - Couleurs MESURÉES sur replicate.com (échelle Radix gray + branding-*) :
    encre #202020 (gray-12), noir pur #000000 (boutons), gris secondaire #646464
    (gray-11), muet #8d8d8d (gray-9), bordure #d9d9d9 (gray-6), surface subtile
    #f9f9f9 (gray-2) / #f0f0f0 (gray-3), rouge de marque #ea2804 (branding-red),
    rouge foncé #c1370f, focus ring near-black #202020
  - Logo OFFICIEL Replicate (vecteur) via <img src="/chrome/replicate/logo.svg">
  - Typo : 'basier-square' (UI Replicate) indisponible en binaire → repli système
    sans-serif (aucune police réseau chargée, conforme au thème replicate)
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

<div class="rep-shell">
  <!-- ── HEADER Replicate ── -->
  <div class="rep-header-wrap">
    <header class="rep-header" aria-label="Replicate">
      <div class="rep-header__inner">
        <!-- Gauche : logo officiel Replicate -->
        <div class="rep-header__brand">
          <a href="/" class="rep-header__brand-link" aria-label="Accueil : Replicate Design System">
            <img
              src="/chrome/replicate/logo.svg"
              alt="Replicate"
              class="rep-logo"
              width="136"
              height="24"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="rep-nav" aria-label="Navigation principale">
          <ul class="rep-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="rep-nav__item">
                <a
                  class="rep-nav__link"
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
        <div class="rep-header__tools">
          <button
            type="button"
            class="rep-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="rep-header__tools-links">
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
          class="rep-header__burger"
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

  <!-- ── BODY Replicate ── -->
  <div class="rep-body">
    <!-- Sidebar -->
    <aside class="rep-sidebar" aria-label="Navigation de la documentation">
      <nav class="rep-side-nav" aria-label="Sommaire">
        <ul class="rep-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="rep-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="rep-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="rep-side-group" open={isGroupOpen(group.items)}>
                <summary class="rep-side-group__summary">
                  <ChevronDown class="rep-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="rep-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="rep-side-link rep-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="rep-side-divider" role="separator"></li>

          <li>
            <a
              class="rep-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="rep-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="rep-side-group__summary">
                  <ChevronDown class="rep-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="rep-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="rep-side-link rep-side-link--sub"
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
      <div class="rep-sidebar-footer">
        <span class="rep-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="rep-sidebar-github"
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
    <div class="rep-content">
      <nav class="rep-breadcrumb" aria-label="Breadcrumb">
        <ol class="rep-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="rep-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="rep-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Replicate ── -->
  <footer class="rep-footer" aria-label="Pied de page Replicate">
    <div class="rep-footer__inner">
      <nav class="rep-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="rep-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/replicate/logo.svg"
        alt="Replicate"
        class="rep-footer__logo"
        width="136"
        height="24"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Replicate ── */
  .rep-shell {
    --rep-primary: #000000; /* noir pur — bouton primaire iconique */
    --rep-primary-hover: #383838; /* gris foncé hover (à confirmer) */
    --rep-primary-light: #f9f9f9; /* gris subtil (item actif sidebar) */
    --rep-ink: #202020; /* gray-12 — encre / titres */
    --rep-ink-2: #000000; /* noir pur */
    --rep-secondary: #646464; /* gray-11 — texte secondaire */
    --rep-muted: #8d8d8d; /* gray-9 — muet / placeholder */
    --rep-brand: #ea2804; /* branding-red — accent / survol des liens */
    --rep-brand-dark: #c1370f; /* rouge de marque foncé */
    --rep-subtle: #f9f9f9; /* gray-2 — surface subtile / survol */
    --rep-subtle-2: #f0f0f0; /* gray-3 — fond de survol */
    --rep-border: #d9d9d9; /* gray-6 — bordure par défaut */
    --rep-border-strong: #6b7280; /* bordure de champ mesurée */
    --rep-focus: #202020; /* near-black focus ring */
    --rep-white: #fff;
    --rep-sidebar-width: 17rem;
    --rep-radius: 0; /* CARRÉ — signature Replicate */
    font-family: 'basier-square', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--rep-white);
    color: var(--rep-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Replicate ── */
  .rep-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .rep-header {
    background: var(--rep-white);
    border-bottom: 1px solid var(--rep-border);
  }

  .rep-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4rem;
    padding: 0.625rem 1.5rem;
  }

  .rep-header__brand {
    flex: 0 0 auto;
  }

  .rep-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 180ms ease;
  }

  .rep-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel Replicate (ratio préservé). */
  .rep-logo {
    display: block;
    width: auto;
    height: 22px;
  }

  /* ── Nav horizontale (centre) ── */
  .rep-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .rep-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .rep-nav__item {
    flex: 0 0 auto;
  }

  .rep-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--rep-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.75rem;
    text-decoration: none;
    transition: border-color 150ms ease, color 150ms ease;
    white-space: nowrap;
  }

  .rep-nav__link:hover,
  .rep-nav__link:focus-visible {
    color: var(--rep-brand);
    outline: none;
  }

  .rep-nav__link[aria-current="page"] {
    border-bottom-color: var(--rep-ink);
    color: var(--rep-ink);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .rep-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .rep-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Replicate (carrés, monochrome). */
  .rep-header__tools-links :global(.docs-header-control) {
    background: var(--rep-white);
    border-color: var(--rep-border);
    border-radius: var(--rep-radius);
    color: var(--rep-ink);
    font-family: inherit;
  }

  .rep-header__tools-links :global(.docs-header-control:hover),
  .rep-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--rep-subtle);
    border-color: var(--rep-ink);
    color: var(--rep-ink);
    box-shadow: none;
  }

  /* Recherche Replicate : bouton loupe NOIR carré. */
  .rep-search__btn {
    align-items: center;
    background: var(--rep-primary);
    border: 1px solid var(--rep-primary);
    border-radius: var(--rep-radius);
    color: var(--rep-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 150ms ease, border-color 150ms ease;
  }

  .rep-search__btn:hover,
  .rep-search__btn:focus-visible {
    background: var(--rep-primary-hover);
    border-color: var(--rep-primary-hover);
    outline: 2px solid var(--rep-focus);
    outline-offset: 2px;
  }

  /* Burger mobile */
  .rep-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--rep-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Replicate ── */
  .rep-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--rep-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Replicate ── */
  .rep-sidebar {
    background: var(--rep-white);
    border-right: 1px solid var(--rep-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4rem);
    position: sticky;
    top: 4rem;
  }

  .rep-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .rep-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--rep-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .rep-version-badge {
    background: var(--rep-subtle-2);
    border: 1px solid var(--rep-border);
    border-radius: var(--rep-radius);
    color: var(--rep-ink);
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .rep-sidebar-github {
    align-items: center;
    color: var(--rep-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 150ms ease;
  }

  .rep-sidebar-github:hover,
  .rep-sidebar-github:focus-visible {
    color: var(--rep-brand);
  }

  .rep-side-list,
  .rep-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .rep-side-link {
    align-items: center;
    border-left: 2px solid transparent;
    box-sizing: border-box;
    color: var(--rep-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 2px);
    text-decoration: none;
    transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
  }

  .rep-side-link:hover,
  .rep-side-link:focus-visible {
    background: var(--rep-subtle);
    color: var(--rep-brand);
    text-decoration: none;
  }

  .rep-side-link[aria-current="page"] {
    background: var(--rep-primary-light);
    border-left-color: var(--rep-brand);
    color: var(--rep-ink);
    font-weight: 600;
    text-decoration: none;
  }

  .rep-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 2px);
  }

  .rep-side-divider {
    border-top: 1px solid var(--rep-border);
    margin: 0.5rem 0;
  }

  .rep-side-group {
    display: block;
  }

  .rep-side-group__summary {
    align-items: center;
    border-left: 2px solid transparent;
    color: var(--rep-secondary);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 600;
    gap: 0.35rem;
    letter-spacing: 0.04em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 1rem 0 calc(1rem - 2px);
    text-transform: uppercase;
    transition: background 150ms ease;
  }

  .rep-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .rep-side-group__summary:hover,
  .rep-side-group__summary:focus-visible {
    background: var(--rep-subtle);
    outline: none;
  }

  .rep-side-group :global(.rep-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 150ms ease;
  }

  .rep-side-group:not([open]) :global(.rep-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .rep-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .rep-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .rep-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .rep-breadcrumb__item {
    align-items: center;
    color: var(--rep-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .rep-breadcrumb__item + .rep-breadcrumb__item::before {
    color: var(--rep-muted);
    content: "›";
    margin: 0 0.4rem;
  }

  .rep-breadcrumb__link {
    color: var(--rep-secondary);
    text-decoration: none;
  }

  .rep-breadcrumb__link:hover {
    color: var(--rep-brand);
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  .rep-breadcrumb__item span[aria-current="page"] {
    color: var(--rep-ink);
    font-weight: 600;
  }

  /* ── Footer Replicate ── */
  .rep-footer {
    background: var(--rep-subtle);
    border-top: 1px solid var(--rep-border);
    margin-top: auto;
  }

  .rep-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .rep-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .rep-footer__link {
    color: var(--rep-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .rep-footer__link:hover {
    color: var(--rep-brand);
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  .rep-footer__logo {
    display: block;
    width: auto;
    height: 22px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .rep-body {
      grid-template-columns: 1fr;
    }

    .rep-sidebar {
      display: none;
    }

    .rep-nav {
      display: none;
    }

    .rep-header__tools {
      display: none;
    }

    .rep-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .rep-nav__link,
    .rep-search__btn,
    .rep-side-link,
    .rep-side-group :global(.rep-side-group__icon) {
      transition: none;
    }
  }
</style>

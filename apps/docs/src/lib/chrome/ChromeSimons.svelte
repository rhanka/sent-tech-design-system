<!--
  Chrome documentaire Simons (simons.ca — le détaillant de mode québécois,
  minimaliste et élégant). Forme fidèle à l'en-tête réel de simons.ca :
  - Header : bandeau BLANC, fine hairline gris clair en bas (#d8d8d8),
    beaucoup d'air, registre éditorial / minimal ; logo officiel « SIMONS »
    (wordmark noir, ~22px) à gauche
  - Nav : texte en sans système pour la lisibilité ; onglet actif / hover en
    NOIR pur (#010101) avec soulignement noir ; reste en encre #404040
  - Loupe de recherche : bouton compact (pas de champ), icône noire,
    branché sur la palette docs
  - Barre latérale gauche : item actif accent noir à gauche + fond tinté très
    clair, sous-items indentés ; fil d'Ariane au-dessus du contenu
  - Footer : bande claire / blanche avec hairline, wordmark « SIMONS » noir +
    liens docs en encre grise
  - Couleurs : encre corps #404040, noir pur #010101 (emphase / actif / loupe),
    hairline #d8d8d8, hover tinté #f1f1f1, blanc #ffffff
  - Logo officiel SIMONS (wordmark vectoriel) référencé via
    <img src="/chrome/simons/logo.svg">
  - Typo : accent serif ('Times New Roman', Times, serif) toléré côté wordmark ;
    nav et corps en sans système pour la légibilité. Aucune police
    propriétaire chargée.
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

<div class="sim-shell">
  <!-- ── HEADER SIMONS ── -->
  <div class="sim-header-wrap">
    <header class="sim-header" aria-label="Simons">
      <div class="sim-header__inner">
        <!-- Gauche : wordmark officiel SIMONS (noir) -->
        <div class="sim-header__brand">
          <a href="/" class="sim-header__brand-link" aria-label="Accueil : Simons Design System">
            <img
              src="/chrome/simons/logo.svg"
              alt="Simons"
              class="sim-logo"
              width="120"
              height="22"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="sim-nav" aria-label="Navigation principale">
          <ul class="sim-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="sim-nav__item">
                <a
                  class="sim-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Simons : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="sim-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA -->
        <div class="sim-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="sim-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA Simons : lien minimal encadré noir -->
          <a class="sim-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="sim-header__burger"
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

  <!-- ── BODY SIMONS ── -->
  <div class="sim-body">
    <!-- Sidebar -->
    <aside class="sim-sidebar" aria-label="Navigation de la documentation">
      <nav class="sim-side-nav" aria-label="Sommaire">
        <ul class="sim-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="sim-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="sim-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="sim-side-group" open={isGroupOpen(group.items)}>
                <summary class="sim-side-group__summary">
                  <ChevronDown class="sim-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="sim-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="sim-side-link sim-side-link--sub"
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
      <div class="sim-sidebar-footer">
        <span class="sim-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="sim-sidebar-github"
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
    <div class="sim-content">
      <nav class="sim-breadcrumb" aria-label="Breadcrumb">
        <ol class="sim-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="sim-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="sim-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER SIMONS ── -->
  <footer class="sim-footer" aria-label="Pied de page Simons">
    <div class="sim-footer__inner">
      <nav class="sim-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="sim-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/simons/logo.svg"
        alt="Simons"
        class="sim-footer__logo"
        width="109"
        height="20"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Simons (palette minimale éditoriale) ── */
  .sim-shell {
    --sim-black: #010101; /* noir pur : emphase / nav actif / loupe */
    --sim-black-hover: #000; /* noir hover */
    --sim-ink: #404040; /* encre corps : texte primaire */
    --sim-grey: #767676; /* gris secondaire */
    --sim-grey-muted: #9a9a9a; /* gris clair */
    --sim-subtle: #f1f1f1; /* surface subtile / hover doux */
    --sim-subtle-2: #ebebeb; /* hover secondaire */
    --sim-border: #d8d8d8; /* hairline gris clair */
    --sim-white: #fff;
    --sim-sidebar-width: 17rem;
    --sim-radius: 0px; /* coins nets : registre minimal Simons */
    --sim-radius-pill: 0px; /* idem pour le CTA */
    /* Typo Simons : sans système pour le corps / l'UI ; serif tolérée côté wordmark. */
    --sim-font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    --sim-font-display: "Times New Roman", Times, serif;
    font-family: var(--sim-font-body);
    background: var(--sim-white);
    color: var(--sim-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Simons ── */
  .sim-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .sim-header {
    background: var(--sim-white);
    border-bottom: 1px solid var(--sim-border);
  }

  .sim-header__inner {
    align-items: center;
    display: flex;
    gap: 1.75rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .sim-header__brand {
    flex: 0 0 auto;
  }

  .sim-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .sim-header__brand-link:hover {
    opacity: 0.7;
  }

  /* Wordmark officiel SIMONS (noir, ~22px de haut, ratio préservé). */
  .sim-logo {
    display: block;
    width: auto;
    height: 22px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .sim-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .sim-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré net, icône noire au hover. */
  .sim-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--sim-radius);
    color: var(--sim-black);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .sim-search-btn:hover,
  .sim-search-btn:focus-visible {
    background: var(--sim-subtle);
    border-color: var(--sim-border);
    color: var(--sim-black);
    outline: none;
  }

  .sim-nav__item {
    flex: 0 0 auto;
  }

  .sim-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--sim-ink);
    display: inline-flex;
    font-family: var(--sim-font-body);
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    letter-spacing: 0.01em;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .sim-nav__link:hover,
  .sim-nav__link:focus-visible {
    color: var(--sim-black);
    outline: none;
  }

  /* Onglet actif : texte noir + soulignement noir (registre éditorial Simons). */
  .sim-nav__link[aria-current="page"] {
    border-bottom-color: var(--sim-black);
    color: var(--sim-black);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .sim-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .sim-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .sim-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .sim-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--sim-border);
  }

  /* Overrides switchers dans header Simons (champs blancs, bord hairline 1px). */
  .sim-header__tools-links :global(.docs-header-control) {
    background: var(--sim-white);
    border-color: var(--sim-border);
    border-radius: var(--sim-radius);
    color: var(--sim-ink);
    font-family: inherit;
  }

  .sim-header__tools-links :global(.docs-header-control:hover),
  .sim-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--sim-subtle);
    border-color: var(--sim-black);
    color: var(--sim-black);
    box-shadow: none;
  }

  /* CTA Simons : lien minimal, encadré noir net (pas de pilule). */
  .sim-cta {
    align-items: center;
    background: var(--sim-black);
    border: 1px solid var(--sim-black);
    border-radius: var(--sim-radius-pill);
    color: var(--sim-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--sim-font-body);
    font-size: 0.8125rem;
    font-weight: 600;
    height: 2.5rem;
    letter-spacing: 0.04em;
    padding: 0 1.25rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    white-space: nowrap;
  }

  .sim-cta:hover,
  .sim-cta:focus-visible {
    background: var(--sim-white);
    border-color: var(--sim-black);
    color: var(--sim-black);
    outline: none;
  }

  /* Burger mobile */
  .sim-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--sim-black);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Simons ── */
  .sim-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--sim-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Simons ── */
  .sim-sidebar {
    background: var(--sim-white);
    border-right: 1px solid var(--sim-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .sim-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .sim-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--sim-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .sim-version-badge {
    background: var(--sim-subtle);
    border: 1px solid var(--sim-border);
    border-radius: var(--sim-radius);
    color: var(--sim-black);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .sim-sidebar-github {
    align-items: center;
    color: var(--sim-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .sim-sidebar-github:hover,
  .sim-sidebar-github:focus-visible {
    color: var(--sim-black);
  }

  .sim-side-list,
  .sim-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .sim-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--sim-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .sim-side-link:hover,
  .sim-side-link:focus-visible {
    background: var(--sim-subtle);
    color: var(--sim-black);
    text-decoration: none;
  }

  .sim-side-link[aria-current="page"] {
    background: var(--sim-subtle);
    border-left-color: var(--sim-black);
    color: var(--sim-black);
    font-weight: 700;
    text-decoration: none;
  }

  .sim-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .sim-side-divider {
    border-top: 1px solid var(--sim-border);
    margin: 0.5rem 0;
  }

  .sim-side-group {
    display: block;
  }

  .sim-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--sim-grey);
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

  .sim-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .sim-side-group__summary:hover,
  .sim-side-group__summary:focus-visible {
    background: var(--sim-subtle);
    outline: none;
  }

  .sim-side-group :global(.sim-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .sim-side-group:not([open]) :global(.sim-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .sim-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .sim-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .sim-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .sim-breadcrumb__item {
    align-items: center;
    color: var(--sim-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .sim-breadcrumb__item + .sim-breadcrumb__item::before {
    color: var(--sim-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .sim-breadcrumb__link {
    color: var(--sim-ink);
    text-decoration: none;
  }

  .sim-breadcrumb__link:hover {
    color: var(--sim-black);
    text-decoration: underline;
  }

  .sim-breadcrumb__item span[aria-current="page"] {
    color: var(--sim-black);
    font-weight: 600;
  }

  /* ── Footer Simons ── */
  .sim-footer {
    background: var(--sim-white);
    border-top: 1px solid var(--sim-border);
    margin-top: auto;
  }

  .sim-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .sim-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .sim-footer__link {
    color: var(--sim-grey);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .sim-footer__link:hover {
    color: var(--sim-black);
    text-decoration: underline;
  }

  .sim-footer__logo {
    display: block;
    width: auto;
    height: 20px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .sim-body {
      grid-template-columns: 1fr;
    }

    .sim-sidebar {
      display: none;
    }

    .sim-nav {
      display: none;
    }

    .sim-header__tools {
      display: none;
    }

    .sim-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .sim-nav__link,
    .sim-cta,
    .sim-search-btn,
    .sim-side-link,
    .sim-side-group :global(.sim-side-group__icon) {
      transition: none;
    }
  }
</style>

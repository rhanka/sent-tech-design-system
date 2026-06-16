<!--
  Chrome documentaire Hydro-Québec (hydroquebec.com — la société d'État
  québécoise, emblématique société de la couronne d'électricité publique). Forme
  fidèle à l'en-tête institutionnel de hydroquebec.com :
  - Header : bandeau BLANC, fin filet hairline (#e1e2ec), allure institutionnelle ;
    logo officiel Hydro-Québec (~28px) à gauche ; nav horizontale au centre +
    loupe de recherche ; barre utilitaire (switchers + comparateur) à droite
  - Onglet de nav actif : SOULIGNÉ ambre chaud #ff9b00 (l'indicateur de marque)
    sur libellé indigo profond #0f096c
  - Barre latérale gauche : item actif accent indigo #0f096c à gauche + fond tinté
    indigo très clair #ececf6, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande indigo profond #0f096c, liens blancs, filet d'accent ambre
    #ff9b00, logo Hydro-Québec en blanc/knockout (filtre vers blanc)
  - Couleurs de marque : indigo profond #0f096c (primaire : nav actif, loupe,
    hovers), ambre chaud #ff9b00 (accent : indicateur actif), bleu vif #104cce
    (highlight), encre #1a1a1a (corps), hairline #e1e2ec, teinte hover #ececf6,
    blanc #ffffff
  - Logo officiel Hydro-Québec référencé via <img src="/chrome/hydro-quebec/logo.svg">
  - Typo : système sans-serif neutre (institutionnel) ; on ne charge AUCUNE
    police propriétaire.
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

<div class="hyq-shell">
  <!-- ── HEADER HYDRO-QUÉBEC ── -->
  <div class="hyq-header-wrap">
    <header class="hyq-header" aria-label="Hydro-Québec">
      <div class="hyq-header__inner">
        <!-- Gauche : logo officiel Hydro-Québec -->
        <div class="hyq-header__brand">
          <a href="/" class="hyq-header__brand-link" aria-label="Accueil : Hydro-Québec Design System">
            <img
              src="/chrome/hydro-quebec/logo.svg"
              alt="Hydro-Québec"
              class="hyq-logo"
              width="120"
              height="28"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="hyq-nav" aria-label="Navigation principale">
          <ul class="hyq-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="hyq-nav__item">
                <a
                  class="hyq-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Hydro-Québec : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="hyq-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) -->
        <div class="hyq-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="hyq-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="hyq-header__burger"
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

  <!-- ── BODY HYDRO-QUÉBEC ── -->
  <div class="hyq-body">
    <!-- Sidebar -->
    <aside class="hyq-sidebar" aria-label="Navigation de la documentation">
      <nav class="hyq-side-nav" aria-label="Sommaire">
        <ul class="hyq-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="hyq-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="hyq-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="hyq-side-group" open={isGroupOpen(group.items)}>
                <summary class="hyq-side-group__summary">
                  <ChevronDown class="hyq-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="hyq-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="hyq-side-link hyq-side-link--sub"
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
      <div class="hyq-sidebar-footer">
        <span class="hyq-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="hyq-sidebar-github"
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
    <div class="hyq-content">
      <nav class="hyq-breadcrumb" aria-label="Breadcrumb">
        <ol class="hyq-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="hyq-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="hyq-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER HYDRO-QUÉBEC ── -->
  <footer class="hyq-footer" aria-label="Pied de page Hydro-Québec">
    <div class="hyq-footer__inner">
      <nav class="hyq-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="hyq-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/hydro-quebec/logo.svg"
        alt="Hydro-Québec"
        class="hyq-footer__logo"
        width="120"
        height="28"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Hydro-Québec (couleurs de marque institutionnelles) ── */
  .hyq-shell {
    --hyq-indigo: #0f096c; /* indigo profond : primaire (nav actif, loupe, hovers) */
    --hyq-indigo-hover: #0a0650; /* indigo assombri : hover */
    --hyq-amber: #ff9b00; /* ambre chaud : accent / indicateur actif */
    --hyq-blue: #104cce; /* bleu vif : highlight */
    --hyq-ink: #1a1a1a; /* encre : texte primaire */
    --hyq-grey: #5a5b66; /* gris secondaire */
    --hyq-grey-muted: #8a8b94; /* gris clair */
    --hyq-subtle: #ececf6; /* teinte hover indigo très clair */
    --hyq-border: #e1e2ec; /* hairline institutionnel */
    --hyq-white: #fff;
    --hyq-sidebar-width: 17rem;
    --hyq-radius: 4px; /* contrôles arrondis doux */
    --hyq-radius-pill: 999px; /* pilules */
    /* Typo Hydro-Québec : sans-serif système neutre ; aucune police propriétaire chargée. */
    --hyq-font-body: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-family: var(--hyq-font-body);
    background: var(--hyq-white);
    color: var(--hyq-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Hydro-Québec ── */
  .hyq-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .hyq-header {
    background: var(--hyq-white);
    border-bottom: 1px solid var(--hyq-border);
  }

  .hyq-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .hyq-header__brand {
    flex: 0 0 auto;
  }

  .hyq-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .hyq-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel Hydro-Québec (ratio préservé, ~28px de haut). */
  .hyq-logo {
    display: block;
    width: auto;
    height: 28px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .hyq-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .hyq-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré doux, icône indigo, hover tinté. */
  .hyq-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--hyq-radius);
    color: var(--hyq-indigo);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .hyq-search-btn:hover,
  .hyq-search-btn:focus-visible {
    background: var(--hyq-subtle);
    border-color: var(--hyq-indigo);
    color: var(--hyq-indigo);
    outline: none;
  }

  .hyq-nav__item {
    flex: 0 0 auto;
  }

  .hyq-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--hyq-ink);
    display: inline-flex;
    font-family: var(--hyq-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .hyq-nav__link:hover,
  .hyq-nav__link:focus-visible {
    color: var(--hyq-indigo);
    outline: none;
  }

  /* Onglet actif : souligné ambre #ff9b00, libellé indigo profond (signature Hydro-Québec). */
  .hyq-nav__link[aria-current="page"] {
    border-bottom-color: var(--hyq-amber);
    color: var(--hyq-indigo);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .hyq-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .hyq-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .hyq-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .hyq-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--hyq-border);
  }

  /* Overrides switchers dans header Hydro-Québec (champs clairs, bord hairline 1px). */
  .hyq-header__tools-links :global(.docs-header-control) {
    background: var(--hyq-white);
    border-color: var(--hyq-border);
    border-radius: var(--hyq-radius);
    color: var(--hyq-ink);
    font-family: inherit;
  }

  .hyq-header__tools-links :global(.docs-header-control:hover),
  .hyq-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--hyq-subtle);
    border-color: var(--hyq-indigo);
    color: var(--hyq-indigo);
    box-shadow: none;
  }

  /* Burger mobile */
  .hyq-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--hyq-indigo);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Hydro-Québec ── */
  .hyq-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--hyq-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Hydro-Québec ── */
  .hyq-sidebar {
    background: var(--hyq-white);
    border-right: 1px solid var(--hyq-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .hyq-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .hyq-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--hyq-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .hyq-version-badge {
    background: var(--hyq-subtle);
    border: 1px solid var(--hyq-border);
    border-radius: var(--hyq-radius);
    color: var(--hyq-indigo);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .hyq-sidebar-github {
    align-items: center;
    color: var(--hyq-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .hyq-sidebar-github:hover,
  .hyq-sidebar-github:focus-visible {
    color: var(--hyq-indigo);
  }

  .hyq-side-list,
  .hyq-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .hyq-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--hyq-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .hyq-side-link:hover,
  .hyq-side-link:focus-visible {
    background: var(--hyq-subtle);
    color: var(--hyq-indigo);
    text-decoration: none;
  }

  .hyq-side-link[aria-current="page"] {
    background: var(--hyq-subtle);
    border-left-color: var(--hyq-indigo);
    color: var(--hyq-indigo);
    font-weight: 700;
    text-decoration: none;
  }

  .hyq-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .hyq-side-divider {
    border-top: 1px solid var(--hyq-border);
    margin: 0.5rem 0;
  }

  .hyq-side-group {
    display: block;
  }

  .hyq-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--hyq-grey);
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

  .hyq-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .hyq-side-group__summary:hover,
  .hyq-side-group__summary:focus-visible {
    background: var(--hyq-subtle);
    outline: none;
  }

  .hyq-side-group :global(.hyq-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .hyq-side-group:not([open]) :global(.hyq-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .hyq-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .hyq-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .hyq-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .hyq-breadcrumb__item {
    align-items: center;
    color: var(--hyq-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .hyq-breadcrumb__item + .hyq-breadcrumb__item::before {
    color: var(--hyq-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .hyq-breadcrumb__link {
    color: var(--hyq-indigo);
    text-decoration: none;
  }

  .hyq-breadcrumb__link:hover {
    color: var(--hyq-indigo-hover);
    text-decoration: underline;
  }

  .hyq-breadcrumb__item span[aria-current="page"] {
    color: var(--hyq-ink);
    font-weight: 600;
  }

  /* ── Footer Hydro-Québec ── */
  .hyq-footer {
    background: var(--hyq-indigo);
    border-top: 3px solid var(--hyq-amber);
    margin-top: auto;
  }

  .hyq-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .hyq-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .hyq-footer__link {
    color: var(--hyq-white);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .hyq-footer__link:hover {
    color: var(--hyq-amber);
    text-decoration: underline;
  }

  /* Logo en blanc/knockout (filtré vers blanc sur la bande indigo). */
  .hyq-footer__logo {
    display: block;
    width: auto;
    height: 28px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .hyq-body {
      grid-template-columns: 1fr;
    }

    .hyq-sidebar {
      display: none;
    }

    .hyq-nav {
      display: none;
    }

    .hyq-header__tools {
      display: none;
    }

    .hyq-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .hyq-nav__link,
    .hyq-search-btn,
    .hyq-side-link,
    .hyq-side-group :global(.hyq-side-group__icon) {
      transition: none;
    }
  }
</style>

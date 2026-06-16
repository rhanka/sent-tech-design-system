<!--
  Chrome documentaire Gildan (gildan.com — le fabricant mondial de vêtements né à
  Montréal). Forme fidèle à l'esprit corporatif épuré de gildan.com :
  - Header : bandeau BLANC propre, hairline gris clair fine (#e2e2e2), allure
    corporate épurée ; logo officiel Gildan (img) aligné à gauche (~26px) ; nav
    horizontale au centre + loupe de recherche compacte branchée sur la palette
    docs ; barre utilitaire (switchers + comparateur) à droite + CTA.
  - Onglet de nav actif : barre/soulignement BLEU royal #003087 (l'indicateur).
  - Loupe de recherche : icône bleu royal #003087.
  - Barre latérale gauche : item actif accent bleu royal à gauche + fond tinté
    bleuté, sous-items indentés ; fil d'Ariane au-dessus du contenu.
  - Footer : bande NAVY #00205a, liens blancs, filet d'accent bleu, logo Gildan
    blanc/knockout (filtré en blanc).
  - Couleurs marque : bleu royal #003087 (primaire : nav active, loupe, hovers),
    navy #00205a (emphase / footer), encre charbon #313131 (corps), hairline
    #e2e2e2, teinte hover #eef2f9, blanc #ffffff ; radius corporate doux (md 4px).
  - Logo officiel Gildan référencé via <img src="/chrome/gildan/logo.svg">.
  - On ne charge AUCUNE police propriétaire ; fallbacks système sans-serif.
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

<div class="gil-shell">
  <!-- ── HEADER GILDAN ── -->
  <div class="gil-header-wrap">
    <header class="gil-header" aria-label="Gildan">
      <div class="gil-header__inner">
        <!-- Gauche : logo officiel Gildan -->
        <div class="gil-header__brand">
          <a href="/" class="gil-header__brand-link" aria-label="Accueil : Gildan Design System">
            <img
              src="/chrome/gildan/logo.svg"
              alt="Gildan"
              class="gil-logo"
              width="130"
              height="26"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="gil-nav" aria-label="Navigation principale">
          <ul class="gil-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="gil-nav__item">
                <a
                  class="gil-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Gildan : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="gil-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA -->
        <div class="gil-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="gil-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA bleu royal : signature corporate Gildan -->
          <a class="gil-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="gil-header__burger"
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

  <!-- ── BODY GILDAN ── -->
  <div class="gil-body">
    <!-- Sidebar -->
    <aside class="gil-sidebar" aria-label="Navigation de la documentation">
      <nav class="gil-side-nav" aria-label="Sommaire">
        <ul class="gil-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="gil-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="gil-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="gil-side-group" open={isGroupOpen(group.items)}>
                <summary class="gil-side-group__summary">
                  <ChevronDown class="gil-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="gil-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="gil-side-link gil-side-link--sub"
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
      <div class="gil-sidebar-footer">
        <span class="gil-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="gil-sidebar-github"
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
    <div class="gil-content">
      <nav class="gil-breadcrumb" aria-label="Breadcrumb">
        <ol class="gil-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="gil-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="gil-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER GILDAN ── -->
  <footer class="gil-footer" aria-label="Pied de page Gildan">
    <div class="gil-footer__inner">
      <nav class="gil-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="gil-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/gildan/logo.svg"
        alt="Gildan"
        class="gil-footer__logo"
        width="130"
        height="26"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Gildan ── */
  .gil-shell {
    --gil-blue: #003087; /* bleu royal : marque / nav active / loupe / hovers */
    --gil-blue-hover: #00256b; /* bleu royal assombri : hover CTA */
    --gil-navy: #00205a; /* navy : emphase / footer */
    --gil-ink: #313131; /* encre charbon : texte primaire */
    --gil-grey: #6b6b6b; /* gris secondaire */
    --gil-grey-muted: #8a8a8a; /* gris clair */
    --gil-subtle: #eef2f9; /* surface subtile / hover bleuté */
    --gil-subtle-2: #e6ecf6; /* hover secondaire */
    --gil-border: #e2e2e2; /* hairline gris clair */
    --gil-white: #fff;
    --gil-sidebar-width: 17rem;
    --gil-radius: 4px; /* contrôles arrondis corporate */
    --gil-radius-pill: 4px; /* CTA corporate carré-doux */
    /* Typo Gildan : grotesk système ; aucune police propriétaire chargée. */
    --gil-font-body: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-family: var(--gil-font-body);
    background: var(--gil-white);
    color: var(--gil-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Gildan ── */
  .gil-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .gil-header {
    background: var(--gil-white);
    border-bottom: 1px solid var(--gil-border);
  }

  .gil-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .gil-header__brand {
    flex: 0 0 auto;
  }

  .gil-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .gil-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel Gildan (ratio préservé, ~26px de haut). */
  .gil-logo {
    display: block;
    width: auto;
    height: 26px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .gil-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .gil-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré doux, icône bleu royal, hover tinté. */
  .gil-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--gil-radius);
    color: var(--gil-blue);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .gil-search-btn:hover,
  .gil-search-btn:focus-visible {
    background: var(--gil-subtle);
    border-color: var(--gil-blue);
    color: var(--gil-blue);
    outline: none;
  }

  .gil-nav__item {
    flex: 0 0 auto;
  }

  .gil-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--gil-ink);
    display: inline-flex;
    font-family: var(--gil-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .gil-nav__link:hover,
  .gil-nav__link:focus-visible {
    color: var(--gil-blue);
    outline: none;
  }

  /* Onglet actif : barre/soulignement bleu royal (l'indicateur Gildan). */
  .gil-nav__link[aria-current="page"] {
    border-bottom-color: var(--gil-blue);
    color: var(--gil-blue);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .gil-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .gil-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .gil-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .gil-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--gil-border);
  }

  /* Overrides switchers dans header Gildan (champs clairs, bord hairline 1px). */
  .gil-header__tools-links :global(.docs-header-control) {
    background: var(--gil-white);
    border-color: var(--gil-border);
    border-radius: var(--gil-radius);
    color: var(--gil-ink);
    font-family: inherit;
  }

  .gil-header__tools-links :global(.docs-header-control:hover),
  .gil-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--gil-subtle);
    border-color: var(--gil-blue);
    color: var(--gil-blue);
    box-shadow: none;
  }

  /* CTA bleu royal (signature corporate Gildan). */
  .gil-cta {
    align-items: center;
    background: var(--gil-blue);
    border: 1px solid var(--gil-blue);
    border-radius: var(--gil-radius-pill);
    color: var(--gil-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--gil-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .gil-cta:hover,
  .gil-cta:focus-visible {
    background: var(--gil-blue-hover);
    border-color: var(--gil-blue-hover);
    color: var(--gil-white);
    outline: none;
  }

  /* Burger mobile */
  .gil-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--gil-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Gildan ── */
  .gil-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--gil-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Gildan ── */
  .gil-sidebar {
    background: var(--gil-white);
    border-right: 1px solid var(--gil-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .gil-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .gil-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--gil-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .gil-version-badge {
    background: var(--gil-subtle);
    border: 1px solid var(--gil-border);
    border-radius: var(--gil-radius);
    color: var(--gil-blue);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .gil-sidebar-github {
    align-items: center;
    color: var(--gil-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .gil-sidebar-github:hover,
  .gil-sidebar-github:focus-visible {
    color: var(--gil-blue);
  }

  .gil-side-list,
  .gil-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .gil-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--gil-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .gil-side-link:hover,
  .gil-side-link:focus-visible {
    background: var(--gil-subtle);
    color: var(--gil-blue);
    text-decoration: none;
  }

  .gil-side-link[aria-current="page"] {
    background: var(--gil-subtle);
    border-left-color: var(--gil-blue);
    color: var(--gil-blue);
    font-weight: 700;
    text-decoration: none;
  }

  .gil-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .gil-side-divider {
    border-top: 1px solid var(--gil-border);
    margin: 0.5rem 0;
  }

  .gil-side-group {
    display: block;
  }

  .gil-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--gil-grey);
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

  .gil-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .gil-side-group__summary:hover,
  .gil-side-group__summary:focus-visible {
    background: var(--gil-subtle);
    outline: none;
  }

  .gil-side-group :global(.gil-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .gil-side-group:not([open]) :global(.gil-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .gil-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .gil-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .gil-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .gil-breadcrumb__item {
    align-items: center;
    color: var(--gil-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .gil-breadcrumb__item + .gil-breadcrumb__item::before {
    color: var(--gil-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .gil-breadcrumb__link {
    color: var(--gil-ink);
    text-decoration: none;
  }

  .gil-breadcrumb__link:hover {
    color: var(--gil-blue);
    text-decoration: underline;
  }

  .gil-breadcrumb__item span[aria-current="page"] {
    color: var(--gil-ink);
    font-weight: 600;
  }

  /* ── Footer Gildan (bande navy, accent bleu, logo knockout) ── */
  .gil-footer {
    background: var(--gil-navy);
    border-top: 3px solid var(--gil-blue);
    margin-top: auto;
  }

  .gil-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .gil-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .gil-footer__link {
    color: var(--gil-white);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .gil-footer__link:hover {
    color: var(--gil-white);
    text-decoration: underline;
  }

  /* Logo Gildan en blanc/knockout sur la bande navy. */
  .gil-footer__logo {
    display: block;
    width: auto;
    height: 26px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .gil-body {
      grid-template-columns: 1fr;
    }

    .gil-sidebar {
      display: none;
    }

    .gil-nav {
      display: none;
    }

    .gil-header__tools {
      display: none;
    }

    .gil-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .gil-nav__link,
    .gil-cta,
    .gil-search-btn,
    .gil-side-link,
    .gil-side-group :global(.gil-side-group__icon) {
      transition: none;
    }
  }
</style>

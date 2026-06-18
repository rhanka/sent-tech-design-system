<!--
  Chrome documentaire Gameloft (gameloft.com — le studio montréalais de jeux
  mobiles). Forme fidèle à l'en-tête réel de gameloft.com, ambiance gaming
  moderne :
  - Header : bandeau SOMBRE navy-noir #14182b, texte/nav BLANCS, feeling jeu
    vidéo ; logo officiel Gameloft (wordmark) détouré en blanc
    (filter: brightness(0) invert(1)) à gauche pour rester lisible sur fond
    sombre
  - Onglet de nav actif : SOULIGNÉ bleu Gameloft #0095f3 (la barre d'accent)
  - Couleurs marque : bleu Gameloft #0095f3 (primaire : nav actif, loupe,
    hovers, soulignement d'accent), cyan plus clair #2eaeff (hover /
    surbrillance), texte nav blanc sur sombre, hairline rgba(255,255,255,0.12)
  - Loupe de recherche : icône blanche, bleue au survol
  - Contenu principal sur la page claire ; seuls header/footer sont sombres
  - Footer : bande sombre #14182b, liens blancs, filet d'accent bleu, wordmark
    Gameloft détouré en blanc ; dropdowns des switchers lisibles sur sombre
    (texte blanc / popovers sombres)
  - Logo officiel Gameloft (wordmark) référencé via
    <img src="/chrome/gameloft/logo.svg">
  - Typo : pile sans-serif système (aucune police propriétaire chargée).
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

<div class="gml-shell">
  <!-- ── HEADER GAMELOFT ── -->
  <div class="gml-header-wrap">
    <header class="gml-header" aria-label="Gameloft">
      <div class="gml-header__inner">
        <!-- Gauche : logo officiel Gameloft (wordmark détouré en blanc) -->
        <div class="gml-header__brand">
          <a href="/" class="gml-header__brand-link" aria-label="Accueil : Gameloft Design System">
            <img
              src="/chrome/gameloft/logo.svg"
              alt="Gameloft"
              class="gml-logo"
              width="120"
              height="22"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="gml-nav" aria-label="Navigation principale">
          <ul class="gml-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="gml-nav__item">
                <a
                  class="gml-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Gameloft : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="gml-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA pilule -->
        <div class="gml-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="gml-header__tools-links">
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
          class="gml-header__burger"
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

  <!-- ── BODY GAMELOFT ── -->
  <div class="gml-body">
    <!-- Sidebar -->
    <aside class="gml-sidebar" aria-label="Navigation de la documentation">
      <nav class="gml-side-nav" aria-label="Sommaire">
        <ul class="gml-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="gml-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="gml-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="gml-side-group" open={isGroupOpen(group.items)}>
                <summary class="gml-side-group__summary">
                  <ChevronDown class="gml-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="gml-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="gml-side-link gml-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="gml-side-divider" role="separator"></li>

          <li>
            <a
              class="gml-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="gml-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="gml-side-group__summary">
                  <ChevronDown class="gml-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="gml-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="gml-side-link gml-side-link--sub"
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
      <div class="gml-sidebar-footer">
        <span class="gml-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="gml-sidebar-github"
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
    <div class="gml-content">
      <nav class="gml-breadcrumb" aria-label="Breadcrumb">
        <ol class="gml-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="gml-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="gml-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER GAMELOFT ── -->
  <footer class="gml-footer" aria-label="Pied de page Gameloft">
    <div class="gml-footer__inner">
      <nav class="gml-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="gml-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/gameloft/logo.svg"
        alt="Gameloft"
        class="gml-footer__logo"
        width="110"
        height="20"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Gameloft (gaming, dark navy-noir) ── */
  .gml-shell {
    --gml-blue: #0095f3; /* bleu Gameloft : marque / action / nav actif */
    --gml-cyan: #2eaeff; /* cyan clair : hover / surbrillance */
    --gml-dark: #14182b; /* navy-noir : header / footer */
    --gml-dark-2: #1c2138; /* surface sombre secondaire (hover header) */
    --gml-ink: #14182b; /* encre : texte primaire sur page claire */
    --gml-grey: #868e96; /* gris secondaire */
    --gml-grey-muted: #a8a8a8; /* gris clair */
    --gml-subtle: #f5f6f9; /* surface subtile / hover doux (page claire) */
    --gml-border: #e3e6ee; /* hairline page claire */
    --gml-border-dark: rgba(255, 255, 255, 0.12); /* hairline sur sombre */
    --gml-on-dark: #ffffff; /* texte blanc sur sombre */
    --gml-on-dark-muted: rgba(255, 255, 255, 0.72); /* texte blanc atténué */
    --gml-white: #fff;
    --gml-sidebar-width: 17rem;
    --gml-radius: 4px; /* contrôles arrondis doux */
    --gml-radius-pill: 999px; /* pilules / CTA */
    /* Typo Gameloft : pile système sans-serif ; aucune police propriétaire chargée. */
    --gml-font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-family: var(--gml-font-body);
    background: var(--gml-white);
    color: var(--gml-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Gameloft ── */
  .gml-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .gml-header {
    background: var(--gml-dark);
    border-bottom: 1px solid var(--gml-border-dark);
  }

  .gml-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .gml-header__brand {
    flex: 0 0 auto;
  }

  .gml-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .gml-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel Gameloft (wordmark) détouré en BLANC pour rester lisible sur fond sombre. */
  .gml-logo {
    display: block;
    width: auto;
    height: 22px;
    filter: brightness(0) invert(1);
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .gml-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .gml-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : icône blanche, bleue/cyan au survol. */
  .gml-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--gml-radius);
    color: var(--gml-on-dark);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .gml-search-btn:hover,
  .gml-search-btn:focus-visible {
    background: var(--gml-dark-2);
    border-color: var(--gml-blue);
    color: var(--gml-cyan);
    outline: none;
  }

  .gml-nav__item {
    flex: 0 0 auto;
  }

  .gml-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--gml-on-dark);
    display: inline-flex;
    font-family: var(--gml-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .gml-nav__link:hover,
  .gml-nav__link:focus-visible {
    color: var(--gml-cyan);
    outline: none;
  }

  /* Onglet actif : souligné bleu Gameloft (la barre d'accent). */
  .gml-nav__link[aria-current="page"] {
    border-bottom-color: var(--gml-blue);
    color: var(--gml-on-dark);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .gml-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .gml-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .gml-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .gml-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--gml-border-dark);
  }

  /* Overrides switchers dans header Gameloft (champs sombres, texte blanc, lisibles). */
  .gml-header__tools-links :global(.docs-header-control) {
    background: var(--gml-dark-2);
    border-color: var(--gml-border-dark);
    border-radius: var(--gml-radius);
    color: var(--gml-on-dark);
    font-family: inherit;
  }

  .gml-header__tools-links :global(.docs-header-control:hover),
  .gml-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--gml-dark-2);
    border-color: var(--gml-blue);
    color: var(--gml-cyan);
    box-shadow: none;
  }

  /* CTA pilule bleu Gameloft (signature gaming). */
  .gml-cta {
    align-items: center;
    background: var(--gml-blue);
    border: 1px solid var(--gml-blue);
    border-radius: var(--gml-radius-pill);
    color: var(--gml-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--gml-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .gml-cta:hover,
  .gml-cta:focus-visible {
    background: var(--gml-cyan);
    border-color: var(--gml-cyan);
    color: var(--gml-white);
    outline: none;
  }

  /* Burger mobile */
  .gml-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--gml-on-dark);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Gameloft ── */
  .gml-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--gml-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Gameloft ── */
  .gml-sidebar {
    background: var(--gml-white);
    border-right: 1px solid var(--gml-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .gml-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .gml-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--gml-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .gml-version-badge {
    background: var(--gml-subtle);
    border: 1px solid var(--gml-border);
    border-radius: var(--gml-radius);
    color: var(--gml-blue);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .gml-sidebar-github {
    align-items: center;
    color: var(--gml-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .gml-sidebar-github:hover,
  .gml-sidebar-github:focus-visible {
    color: var(--gml-blue);
  }

  .gml-side-list,
  .gml-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .gml-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--gml-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .gml-side-link:hover,
  .gml-side-link:focus-visible {
    background: var(--gml-subtle);
    color: var(--gml-blue);
    text-decoration: none;
  }

  .gml-side-link[aria-current="page"] {
    background: var(--gml-subtle);
    border-left-color: var(--gml-blue);
    color: var(--gml-blue);
    font-weight: 700;
    text-decoration: none;
  }

  .gml-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .gml-side-divider {
    border-top: 1px solid var(--gml-border);
    margin: 0.5rem 0;
  }

  .gml-side-group {
    display: block;
  }

  .gml-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--gml-grey);
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

  .gml-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .gml-side-group__summary:hover,
  .gml-side-group__summary:focus-visible {
    background: var(--gml-subtle);
    outline: none;
  }

  .gml-side-group :global(.gml-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .gml-side-group:not([open]) :global(.gml-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .gml-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .gml-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .gml-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .gml-breadcrumb__item {
    align-items: center;
    color: var(--gml-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .gml-breadcrumb__item + .gml-breadcrumb__item::before {
    color: var(--gml-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .gml-breadcrumb__link {
    color: var(--gml-ink);
    text-decoration: none;
  }

  .gml-breadcrumb__link:hover {
    color: var(--gml-blue);
    text-decoration: underline;
  }

  .gml-breadcrumb__item span[aria-current="page"] {
    color: var(--gml-ink);
    font-weight: 600;
  }

  /* ── Footer Gameloft ── */
  .gml-footer {
    background: var(--gml-dark);
    border-top: 3px solid var(--gml-blue);
    margin-top: auto;
  }

  .gml-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .gml-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .gml-footer__link {
    color: var(--gml-on-dark);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .gml-footer__link:hover {
    color: var(--gml-cyan);
    text-decoration: underline;
  }

  /* Wordmark Gameloft du footer : détouré en blanc sur fond sombre. */
  .gml-footer__logo {
    display: block;
    width: auto;
    height: 20px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .gml-body {
      grid-template-columns: 1fr;
    }

    .gml-sidebar {
      display: none;
    }

    .gml-nav {
      display: none;
    }

    .gml-header__tools {
      display: none;
    }

    .gml-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .gml-nav__link,
    .gml-cta,
    .gml-search-btn,
    .gml-side-link,
    .gml-side-group :global(.gml-side-group__icon) {
      transition: none;
    }
  }
</style>

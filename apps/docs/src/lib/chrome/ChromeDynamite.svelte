<!--
  Chrome documentaire Dynamite (dynamiteclothing.com — marque de mode féminine
  chic née à Montréal). Forme fidèle à l'en-tête réel : esthétique mode minimale
  et sophistiquée.
  - Header : bandeau BLANC, fine ligne hairline (#e6e2df) en bas, ambiance mode
    raffinée et épurée ; logo officiel Dynamite (mot-symbole « DYNAMITE » noir
    lettré-espacé, ~20px) à gauche ; nav horizontale + loupe de recherche compacte ;
    barre utilitaire (switchers + comparateur) à droite
  - Onglet de nav actif : SOULIGNÉ rose blush (#b76e79), l'indicateur raffiné de
    la marque
  - Couleurs : near-black confiant #1a1a1a (nav actif, loupe, hovers), rose blush
    chaud #b76e79 (indicateur actif / touches raffinées), encre #1a1a1a (corps),
    hairline #e6e2df, teinte de survol #f7f3f1, blanc #ffffff ; petits radius nets
    et minimaux
  - Barre latérale gauche : item actif accent blush à gauche + fond tinté, sous-items
    indentés ; fil d'Ariane au-dessus du contenu
  - Footer : bande near-black #1a1a1a, liens blancs, fine ligne d'accent blush
    #b76e79, mot-symbole DYNAMITE en blanc/découpe (filter → blanc)
  - Logo officiel Dynamite référencé via <img src="/chrome/dynamite/logo.svg">
  - Typo : grotesk neutre (corps / UI) ; on ne charge AUCUNE police propriétaire,
    fallbacks Helvetica / Georgia.
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

<div class="dyn-shell">
  <!-- ── HEADER DYNAMITE ── -->
  <div class="dyn-header-wrap">
    <header class="dyn-header" aria-label="Dynamite">
      <div class="dyn-header__inner">
        <!-- Gauche : logo officiel Dynamite (mot-symbole lettré-espacé) -->
        <div class="dyn-header__brand">
          <a href="/" class="dyn-header__brand-link" aria-label="Accueil : Dynamite Design System">
            <img
              src="/chrome/dynamite/logo.svg"
              alt="Dynamite"
              class="dyn-logo"
              width="150"
              height="20"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="dyn-nav" aria-label="Navigation principale">
          <ul class="dyn-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="dyn-nav__item">
                <a
                  class="dyn-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Dynamite : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="dyn-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) -->
        <div class="dyn-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="dyn-header__tools-links">
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
          class="dyn-header__burger"
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

  <!-- ── BODY DYNAMITE ── -->
  <div class="dyn-body">
    <!-- Sidebar -->
    <aside class="dyn-sidebar" aria-label="Navigation de la documentation">
      <nav class="dyn-side-nav" aria-label="Sommaire">
        <ul class="dyn-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="dyn-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="dyn-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="dyn-side-group" open={isGroupOpen(group.items)}>
                <summary class="dyn-side-group__summary">
                  <ChevronDown class="dyn-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="dyn-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="dyn-side-link dyn-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="dyn-side-divider" role="separator"></li>

          <li>
            <a
              class="dyn-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="dyn-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="dyn-side-group__summary">
                  <ChevronDown class="dyn-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="dyn-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="dyn-side-link dyn-side-link--sub"
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
      <div class="dyn-sidebar-footer">
        <span class="dyn-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="dyn-sidebar-github"
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
    <div class="dyn-content">
      <nav class="dyn-breadcrumb" aria-label="Breadcrumb">
        <ol class="dyn-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="dyn-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="dyn-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER DYNAMITE ── -->
  <footer class="dyn-footer" aria-label="Pied de page Dynamite">
    <div class="dyn-footer__inner">
      <nav class="dyn-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="dyn-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/dynamite/logo.svg"
        alt="Dynamite"
        class="dyn-footer__logo"
        width="150"
        height="20"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Dynamite (mode minimale chic) ── */
  .dyn-shell {
    --dyn-ink: #1a1a1a; /* near-black confiant : texte / nav actif / loupe / hovers */
    --dyn-ink-hover: #000; /* noir plein : hover renforcé */
    --dyn-blush: #b76e79; /* rose blush chaud : indicateur actif / touches raffinées */
    --dyn-blush-hover: #a35c67; /* blush assombri : hover */
    --dyn-grey: #8a8480; /* gris secondaire chaud */
    --dyn-grey-muted: #b3aca7; /* gris clair chaud */
    --dyn-tint: #f7f3f1; /* teinte de survol chaude */
    --dyn-border: #e6e2df; /* hairline mode */
    --dyn-white: #fff;
    --dyn-footer-bg: #1a1a1a; /* bande footer near-black */
    --dyn-sidebar-width: 17rem;
    --dyn-radius: 2px; /* petits radius nets et minimaux */
    /* Typo Dynamite : grotesk neutre ; aucune police propriétaire chargée. */
    --dyn-font-body: helvetica, arial, sans-serif;
    --dyn-font-display: Georgia, Times, serif;
    font-family: var(--dyn-font-body);
    background: var(--dyn-white);
    color: var(--dyn-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Dynamite ── */
  .dyn-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .dyn-header {
    background: var(--dyn-white);
    border-bottom: 1px solid var(--dyn-border);
  }

  .dyn-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .dyn-header__brand {
    flex: 0 0 auto;
  }

  .dyn-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .dyn-header__brand-link:hover {
    opacity: 0.7;
  }

  /* Logo officiel Dynamite (mot-symbole lettré-espacé, ratio préservé, ~20px). */
  .dyn-logo {
    display: block;
    width: auto;
    height: 20px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .dyn-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .dyn-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré minimal, icône near-black. */
  .dyn-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--dyn-radius);
    color: var(--dyn-ink);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .dyn-search-btn:hover,
  .dyn-search-btn:focus-visible {
    background: var(--dyn-tint);
    border-color: var(--dyn-border);
    color: var(--dyn-ink-hover);
    outline: none;
  }

  .dyn-nav__item {
    flex: 0 0 auto;
  }

  .dyn-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--dyn-ink);
    display: inline-flex;
    font-family: var(--dyn-font-body);
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.3rem;
    letter-spacing: 0.06em;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .dyn-nav__link:hover,
  .dyn-nav__link:focus-visible {
    color: var(--dyn-ink-hover);
    outline: none;
  }

  /* Onglet actif : souligné blush (l'indicateur raffiné Dynamite). */
  .dyn-nav__link[aria-current="page"] {
    border-bottom-color: var(--dyn-blush);
    color: var(--dyn-ink);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .dyn-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .dyn-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .dyn-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .dyn-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--dyn-border);
  }

  /* Overrides switchers dans header Dynamite (champs blancs, bord hairline 1px). */
  .dyn-header__tools-links :global(.docs-header-control) {
    background: var(--dyn-white);
    border-color: var(--dyn-border);
    border-radius: var(--dyn-radius);
    color: var(--dyn-ink);
    font-family: inherit;
  }

  .dyn-header__tools-links :global(.docs-header-control:hover),
  .dyn-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--dyn-tint);
    border-color: var(--dyn-blush);
    color: var(--dyn-ink);
    box-shadow: none;
  }

  /* Burger mobile */
  .dyn-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--dyn-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Dynamite ── */
  .dyn-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--dyn-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Dynamite ── */
  .dyn-sidebar {
    background: var(--dyn-white);
    border-right: 1px solid var(--dyn-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .dyn-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .dyn-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--dyn-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .dyn-version-badge {
    background: var(--dyn-tint);
    border: 1px solid var(--dyn-border);
    border-radius: var(--dyn-radius);
    color: var(--dyn-blush);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .dyn-sidebar-github {
    align-items: center;
    color: var(--dyn-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .dyn-sidebar-github:hover,
  .dyn-sidebar-github:focus-visible {
    color: var(--dyn-blush);
  }

  .dyn-side-list,
  .dyn-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .dyn-side-link {
    align-items: center;
    border-left: 2px solid transparent;
    box-sizing: border-box;
    color: var(--dyn-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 2px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .dyn-side-link:hover,
  .dyn-side-link:focus-visible {
    background: var(--dyn-tint);
    color: var(--dyn-ink-hover);
    text-decoration: none;
  }

  .dyn-side-link[aria-current="page"] {
    background: var(--dyn-tint);
    border-left-color: var(--dyn-blush);
    color: var(--dyn-ink);
    font-weight: 700;
    text-decoration: none;
  }

  .dyn-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 2px);
  }

  .dyn-side-divider {
    border-top: 1px solid var(--dyn-border);
    margin: 0.5rem 0;
  }

  .dyn-side-group {
    display: block;
  }

  .dyn-side-group__summary {
    align-items: center;
    border-left: 2px solid transparent;
    color: var(--dyn-grey);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 700;
    gap: 0.35rem;
    letter-spacing: 0.08em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 1rem 0 calc(1rem - 2px);
    text-transform: uppercase;
    transition: background 120ms ease;
  }

  .dyn-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .dyn-side-group__summary:hover,
  .dyn-side-group__summary:focus-visible {
    background: var(--dyn-tint);
    outline: none;
  }

  .dyn-side-group :global(.dyn-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .dyn-side-group:not([open]) :global(.dyn-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .dyn-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .dyn-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .dyn-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .dyn-breadcrumb__item {
    align-items: center;
    color: var(--dyn-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .dyn-breadcrumb__item + .dyn-breadcrumb__item::before {
    color: var(--dyn-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .dyn-breadcrumb__link {
    color: var(--dyn-ink);
    text-decoration: none;
  }

  .dyn-breadcrumb__link:hover {
    color: var(--dyn-blush);
    text-decoration: underline;
  }

  .dyn-breadcrumb__item span[aria-current="page"] {
    color: var(--dyn-ink);
    font-weight: 600;
  }

  /* ── Footer Dynamite ── */
  .dyn-footer {
    background: var(--dyn-footer-bg);
    border-top: 2px solid var(--dyn-blush); /* fine ligne d'accent blush */
    margin-top: auto;
  }

  .dyn-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .dyn-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .dyn-footer__link {
    color: var(--dyn-white);
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    text-decoration: none;
    text-transform: uppercase;
  }

  .dyn-footer__link:hover {
    color: var(--dyn-blush);
    text-decoration: underline;
  }

  /* Mot-symbole DYNAMITE en blanc/découpe sur la bande sombre (filter → blanc). */
  .dyn-footer__logo {
    display: block;
    width: auto;
    height: 20px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .dyn-body {
      grid-template-columns: 1fr;
    }

    .dyn-sidebar {
      display: none;
    }

    .dyn-nav {
      display: none;
    }

    .dyn-header__tools {
      display: none;
    }

    .dyn-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .dyn-nav__link,
    .dyn-search-btn,
    .dyn-side-link,
    .dyn-side-group :global(.dyn-side-group__icon) {
      transition: none;
    }
  }
</style>

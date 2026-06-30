<!--
  Chrome documentaire Eidos-Montréal (eidosmontreal.com — studio de jeux AAA
  montréalais, Deus Ex / Tomb Raider). Forme fidèle à l'en-tête réel du studio :
  esthétique minimaliste monochrome sombre avec un accent chaud orange.
  - Header : bandeau SOMBRE quasi-noir #1a1a1a, texte/nav BLANCS #f2f2f2, allure
    de studio épurée et sobre ; logo officiel Eidos-Montréal détouré en blanc
    (filter brightness(0) invert(1)) à gauche, ~26px de haut
  - Onglet de nav actif : SOULIGNÉ orange #e8552d (la barre d'accent chaud)
  - Loupe de recherche : icône blanche, vire à l'orange #e8552d au survol
  - Barre latérale gauche : item actif accent orange à gauche + fond tinté subtil,
    sous-items indentés ; contenu principal CLAIR (seuls header/footer sont sombres)
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande sombre #1a1a1a, liens blancs, filet d'accent orange #e8552d,
    marque Eidos détourée en blanc ; dropdowns des switchers lisibles sur sombre
  - Couleurs marque : orange chaud #e8552d (accent / nav actif / hover loupe),
    orange assombri #c8431f (hover), blanc nav #f2f2f2, hairline rgba(255,255,255,
    0.12), gris neutres mesurés pour le non-accent
  - Logo officiel Eidos-Montréal référencé via <img src="/chrome/eidos-montreal/logo.svg">
  - Typo : grotesk neutre (corps / UI) ; on ne charge AUCUNE police propriétaire ;
    fallbacks Helvetica / Arial.
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

<div class="eid-shell">
  <!-- ── HEADER EIDOS-MONTRÉAL ── -->
  <div class="eid-header-wrap">
    <header class="eid-header" aria-label="Eidos-Montréal">
      <div class="eid-header__inner">
        <!-- Gauche : logo officiel Eidos-Montréal détouré en blanc -->
        <div class="eid-header__brand">
          <a href="/" class="eid-header__brand-link" aria-label="Accueil : Eidos-Montréal Design System">
            <img
              src="/chrome/eidos-montreal/logo.svg"
              alt="Eidos-Montréal"
              class="eid-logo"
              width="120"
              height="26"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="eid-nav" aria-label="Navigation principale">
          <ul class="eid-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="eid-nav__item">
                <a
                  class="eid-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Eidos-Montréal : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="eid-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA -->
        <div class="eid-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="eid-header__tools-links">
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
          class="eid-header__burger"
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

  <!-- ── BODY EIDOS-MONTRÉAL ── -->
  <div class="eid-body">
    <!-- Sidebar -->
    <aside class="eid-sidebar" aria-label="Navigation de la documentation">
      <nav class="eid-side-nav" aria-label="Sommaire">
        <ul class="eid-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="eid-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="eid-side-divider" role="separator"></li>

          <li class="eid-side-heading">
            <a
              class="eid-side-link eid-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="eid-side-group" open={isGroupOpen(group.items)}>
                <summary class="eid-side-group__summary">
                  <ChevronDown class="eid-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="eid-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="eid-side-link eid-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="eid-side-divider" role="separator"></li>

          <li class="eid-side-heading">
            <a
              class="eid-side-link eid-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="eid-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="eid-side-group__summary">
                  <ChevronDown class="eid-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="eid-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="eid-side-link eid-side-link--sub"
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
      <div class="eid-sidebar-footer">
        <span class="eid-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="eid-sidebar-github"
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
    <div class="eid-content">
      <nav class="eid-breadcrumb" aria-label="Breadcrumb">
        <ol class="eid-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="eid-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="eid-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER EIDOS-MONTRÉAL ── -->
  <footer class="eid-footer" aria-label="Pied de page Eidos-Montréal">
    <div class="eid-footer__inner">
      <nav class="eid-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="eid-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/eidos-montreal/logo.svg"
        alt="Eidos-Montréal"
        class="eid-footer__logo"
        width="115"
        height="25"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Eidos-Montréal (minimal dark studio + accent chaud orange) ── */
  .eid-shell {
    --eid-orange: #e8552d; /* orange chaud : accent / nav actif / hover loupe */
    --eid-orange-hover: #c8431f; /* orange assombri : hover */
    --eid-dark: #1a1a1a; /* quasi-noir : surfaces header / footer */
    --eid-dark-2: #232323; /* surface sombre secondaire (hover sur sombre) */
    --eid-white: #f2f2f2; /* blanc nav / texte sur sombre */
    --eid-ink: #1a1a1a; /* encre : texte primaire sur clair */
    --eid-grey: #868e96; /* gris secondaire neutre mesuré */
    --eid-grey-muted: #a8a8a8; /* gris clair neutre mesuré */
    --eid-subtle: #f5f5f5; /* surface subtile / hover doux (clair) */
    --eid-subtle-2: #e9e9e9; /* hover secondaire mesuré (clair) */
    --eid-border: #e0e0e0; /* hairline clair (corps) */
    --eid-hairline-dark: rgba(255, 255, 255, 0.12); /* hairline sur sombre */
    --eid-bg: #fff;
    --eid-sidebar-width: 17rem;
    --eid-radius: 4px; /* contrôles arrondis doux */
    --eid-radius-pill: 999px; /* pilules / CTA */
    /* Typo Eidos-Montréal : grotesk neutre (corps) ; aucune police propriétaire chargée. */
    --eid-font-body: helvetica, arial, sans-serif;
    font-family: var(--eid-font-body);
    background: var(--eid-bg);
    color: var(--eid-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Eidos-Montréal (sombre) ── */
  .eid-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .eid-header {
    background: var(--eid-dark);
    border-bottom: 1px solid var(--eid-hairline-dark);
  }

  .eid-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .eid-header__brand {
    flex: 0 0 auto;
  }

  .eid-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .eid-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel Eidos-Montréal détouré en blanc sur le header sombre. */
  .eid-logo {
    display: block;
    width: auto;
    height: 26px;
    filter: brightness(0) invert(1);
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .eid-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .eid-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : icône blanche, orange au survol. */
  .eid-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--eid-radius);
    color: var(--eid-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .eid-search-btn:hover,
  .eid-search-btn:focus-visible {
    background: var(--eid-dark-2);
    border-color: var(--eid-orange);
    color: var(--eid-orange);
    outline: none;
  }

  .eid-nav__item {
    flex: 0 0 auto;
  }

  .eid-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--eid-white);
    display: inline-flex;
    font-family: var(--eid-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .eid-nav__link:hover,
  .eid-nav__link:focus-visible {
    color: var(--eid-orange);
    outline: none;
  }

  /* Onglet actif : souligné orange chaud (la barre d'accent Eidos-Montréal). */
  .eid-nav__link[aria-current="page"] {
    border-bottom-color: var(--eid-orange);
    color: var(--eid-white);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .eid-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .eid-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .eid-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .eid-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--eid-hairline-dark);
  }

  /* Overrides switchers dans header Eidos-Montréal (champs sombres lisibles, hairline blanc). */
  .eid-header__tools-links :global(.docs-header-control) {
    background: var(--eid-dark-2);
    border-color: var(--eid-hairline-dark);
    border-radius: var(--eid-radius);
    color: var(--eid-white);
    font-family: inherit;
  }

  .eid-header__tools-links :global(.docs-header-control:hover),
  .eid-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--eid-dark);
    border-color: var(--eid-orange);
    color: var(--eid-orange);
    box-shadow: none;
  }

  /* CTA orange chaud (signature minimal studio Eidos-Montréal). */
  .eid-cta {
    align-items: center;
    background: var(--eid-orange);
    border: 1px solid var(--eid-orange);
    border-radius: var(--eid-radius-pill);
    color: var(--eid-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--eid-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .eid-cta:hover,
  .eid-cta:focus-visible {
    background: var(--eid-orange-hover);
    border-color: var(--eid-orange-hover);
    color: var(--eid-white);
    outline: none;
  }

  /* Burger mobile */
  .eid-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--eid-white);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Eidos-Montréal ── */
  .eid-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--eid-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Eidos-Montréal (claire) ── */
  .eid-sidebar {
    background: var(--eid-bg);
    border-right: 1px solid var(--eid-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .eid-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .eid-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--eid-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .eid-version-badge {
    background: var(--eid-subtle);
    border: 1px solid var(--eid-border);
    border-radius: var(--eid-radius);
    color: var(--eid-orange);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .eid-sidebar-github {
    align-items: center;
    color: var(--eid-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .eid-sidebar-github:hover,
  .eid-sidebar-github:focus-visible {
    color: var(--eid-orange);
  }

  .eid-side-list,
  .eid-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .eid-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--eid-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .eid-side-link:hover,
  .eid-side-link:focus-visible {
    background: var(--eid-subtle);
    color: var(--eid-orange);
    text-decoration: none;
  }

  .eid-side-link[aria-current="page"] {
    background: var(--eid-subtle);
    border-left-color: var(--eid-orange);
    color: var(--eid-orange);
    font-weight: 700;
    text-decoration: none;
  }

  .eid-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .eid-side-divider {
    border-top: 1px solid var(--eid-border);
    margin: 0.5rem 0;
  }

  .eid-side-group {
    display: block;
  }

  .eid-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--eid-grey);
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

  .eid-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .eid-side-group__summary:hover,
  .eid-side-group__summary:focus-visible {
    background: var(--eid-subtle);
    outline: none;
  }

  .eid-side-group :global(.eid-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .eid-side-group:not([open]) :global(.eid-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .eid-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .eid-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .eid-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .eid-breadcrumb__item {
    align-items: center;
    color: var(--eid-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .eid-breadcrumb__item + .eid-breadcrumb__item::before {
    color: var(--eid-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .eid-breadcrumb__link {
    color: var(--eid-ink);
    text-decoration: none;
  }

  .eid-breadcrumb__link:hover {
    color: var(--eid-orange);
    text-decoration: underline;
  }

  .eid-breadcrumb__item span[aria-current="page"] {
    color: var(--eid-ink);
    font-weight: 600;
  }

  /* ── Footer Eidos-Montréal (sombre) ── */
  .eid-footer {
    background: var(--eid-dark);
    border-top: 2px solid var(--eid-orange);
    margin-top: auto;
  }

  .eid-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .eid-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .eid-footer__link {
    color: var(--eid-white);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .eid-footer__link:hover {
    color: var(--eid-orange);
    text-decoration: underline;
  }

  /* Marque Eidos détourée en blanc sur la bande sombre du footer. */
  .eid-footer__logo {
    display: block;
    width: auto;
    height: 25px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .eid-body {
      grid-template-columns: 1fr;
    }

    .eid-sidebar {
      display: none;
    }

    .eid-nav {
      display: none;
    }

    .eid-header__tools {
      display: none;
    }

    .eid-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .eid-nav__link,
    .eid-cta,
    .eid-search-btn,
    .eid-side-link,
    .eid-side-group :global(.eid-side-group__icon) {
      transition: none;
    }
  }
</style>

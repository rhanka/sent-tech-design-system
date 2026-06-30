<!--
  Chrome documentaire BRP Inc. (brp.com — Ski-Doo, Sea-Doo, Can-Am).
  Forme fidèle à l'en-tête réel de brp.com :
  - Header : bandeau BLANC, logo officiel BRP (wordmark noir) à gauche,
    nav horizontale + loupe, CTA JAUNE CARRÉ (texte noir, uppercase) à droite
  - Onglet de nav actif : SOULIGNÉ noir
  - Barre latérale gauche : item actif accent noir + fond jaune pâle, sous-items indentés
  - Footer : bande claire avec liens + logo BRP
  - Couleurs mesurées (brp.com) : jaune signature #ffd200 (CTA, texte noir),
    encre noire #000, canvas #f0f0f0, bord #b2b2b2, danger #d32f2f ; CTA carré (radius 0)
  - Logo officiel BRP repris tel quel de brp.com (BRP-Digital_and_Campaign_Logo-K-RGB.svg),
    référencé via <img src="/chrome/brp/logo.svg"> — non redessiné
  - Typo : 'Inter' (corps) + 'Oswald' (titres/CTA, condensé), chargées via Google Fonts
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
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Oswald:wght@500;600;700&display=swap"
  />
</svelte:head>

<div class="brp-shell">
  <!-- ── HEADER BRP ── -->
  <div class="brp-header-wrap">
    <header class="brp-header" aria-label="BRP">
      <div class="brp-header__inner">
        <!-- Gauche : logo officiel BRP (wordmark rouge) -->
        <div class="brp-header__brand">
          <a href="/" class="brp-header__brand-link" aria-label="Accueil : BRP Design System">
            <img
              src="/chrome/brp/logo.svg"
              alt="BRP"
              class="brp-logo"
              width="64"
              height="30"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="brp-nav" aria-label="Navigation principale">
          <ul class="brp-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="brp-nav__item">
                <a
                  class="brp-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche BRP : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="brp-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) façon BRP -->
        <div class="brp-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="brp-header__tools-links">
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
          class="brp-header__burger"
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

  <!-- ── BODY BRP ── -->
  <div class="brp-body">
    <!-- Sidebar -->
    <aside class="brp-sidebar" aria-label="Navigation de la documentation">
      <nav class="brp-side-nav" aria-label="Sommaire">
        <ul class="brp-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="brp-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="brp-side-divider" role="separator"></li>

          <li class="brp-side-heading">
            <a
              class="brp-side-link brp-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="brp-side-group" open={isGroupOpen(group.items)}>
                <summary class="brp-side-group__summary">
                  <ChevronDown class="brp-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="brp-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="brp-side-link brp-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="brp-side-divider" role="separator"></li>

          <li class="brp-side-heading">
            <a
              class="brp-side-link brp-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="brp-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="brp-side-group__summary">
                  <ChevronDown class="brp-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="brp-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="brp-side-link brp-side-link--sub"
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
      <div class="brp-sidebar-footer">
        <span class="brp-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="brp-sidebar-github"
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
    <div class="brp-content">
      <nav class="brp-breadcrumb" aria-label="Breadcrumb">
        <ol class="brp-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="brp-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="brp-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER BRP ── -->
  <footer class="brp-footer" aria-label="Pied de page BRP">
    <div class="brp-footer__inner">
      <nav class="brp-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="brp-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/brp/logo.svg"
        alt="BRP"
        class="brp-footer__logo"
        width="64"
        height="30"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables BRP ── */
  .brp-shell {
    --brp-yellow: #ffd200; /* jaune signature BRP (fond CTA, texte noir) */
    --brp-purple: #000000; /* accent noir BRP (nav active, liens, soulignement) */
    --brp-purple-deep: #1a1a1a; /* hover */
    --brp-purple-bright: #333333; /* variante */
    --brp-red: #d32f2f; /* danger */
    --brp-magenta: #ffd200; /* jaune (réutilisé) */
    --brp-teal: #5c6060; /* gris secondaire */
    --brp-ink: #000000; /* encre noire BRP */
    --brp-grey: #5c5c5c; /* gris texte secondaire */
    --brp-subtle: #f0f0f0; /* canvas BRP */
    --brp-lavender: #fff7cc; /* jaune pâle (surface secondaire) */
    --brp-border: #b2b2b2; /* bord mesuré BRP */
    --brp-white: #fff;
    --brp-sidebar-width: 17rem;
    --brp-radius: 4px; /* conteneurs 4px */
    --brp-radius-pill: 0; /* CTA carré BRP */
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--brp-white);
    color: var(--brp-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header BRP ── */
  .brp-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .brp-header {
    background: var(--brp-white);
    border-bottom: 1px solid var(--brp-border);
  }

  .brp-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .brp-header__brand {
    flex: 0 0 auto;
  }

  .brp-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .brp-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel BRP (ratio préservé, hauteur ~30px comme l'en-tête réel). */
  .brp-logo {
    display: block;
    width: auto;
    height: 30px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .brp-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .brp-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré 4px, hover lavande/violet. */
  .brp-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--brp-radius);
    color: var(--brp-ink);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .brp-search-btn:hover,
  .brp-search-btn:focus-visible {
    background: var(--brp-lavender);
    border-color: var(--brp-purple);
    color: var(--brp-purple);
    outline: none;
  }

  .brp-nav__item {
    flex: 0 0 auto;
  }

  .brp-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--brp-ink);
    display: inline-flex;
    font-family: 'Oswald', system-ui, sans-serif;
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .brp-nav__link:hover,
  .brp-nav__link:focus-visible {
    color: var(--brp-purple);
    outline: none;
  }

  .brp-nav__link[aria-current="page"] {
    border-bottom-color: var(--brp-purple);
    color: var(--brp-purple);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .brp-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  /* Barre utilitaire BRP : groupes séparés par de fins traits verticaux
     ("… | 🌐 | FR"). Chaque snippet rend un wrapper direct, on insère le
     diviseur avant chaque groupe sauf le premier. */
  .brp-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .brp-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .brp-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--brp-border);
  }

  /* Overrides switchers dans header BRP (champs clairs, bord gris 1px). */
  .brp-header__tools-links :global(.docs-header-control) {
    background: var(--brp-white);
    border-color: var(--brp-border);
    border-radius: var(--brp-radius);
    color: var(--brp-ink);
    font-family: inherit;
  }

  .brp-header__tools-links :global(.docs-header-control:hover),
  .brp-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--brp-lavender);
    border-color: var(--brp-purple);
    color: var(--brp-purple);
    box-shadow: none;
  }

  /* CTA BRP : jaune carré, texte noir, uppercase (signature BRP). */
  .brp-cta {
    align-items: center;
    background: var(--brp-yellow);
    border: 1px solid var(--brp-yellow);
    border-radius: 0;
    color: #000;
    display: inline-flex;
    flex: 0 0 auto;
    font-family: 'Oswald', system-ui, sans-serif;
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    padding: 0 1.25rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .brp-cta:hover,
  .brp-cta:focus-visible {
    background: #e6bd00;
    border-color: #e6bd00;
    color: #000;
    outline: none;
  }

  /* Burger mobile */
  .brp-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--brp-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body BRP ── */
  .brp-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--brp-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar BRP ── */
  .brp-sidebar {
    background: var(--brp-white);
    border-right: 1px solid var(--brp-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .brp-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .brp-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--brp-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .brp-version-badge {
    background: var(--brp-lavender);
    border: 1px solid var(--brp-border);
    border-radius: var(--brp-radius);
    color: var(--brp-purple);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .brp-sidebar-github {
    align-items: center;
    color: var(--brp-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .brp-sidebar-github:hover,
  .brp-sidebar-github:focus-visible {
    color: var(--brp-purple);
  }

  .brp-side-list,
  .brp-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .brp-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--brp-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .brp-side-link:hover,
  .brp-side-link:focus-visible {
    background: var(--brp-subtle);
    color: var(--brp-purple);
    text-decoration: none;
  }

  .brp-side-link[aria-current="page"] {
    background: var(--brp-lavender);
    border-left-color: var(--brp-purple);
    color: var(--brp-purple-deep);
    font-weight: 700;
    text-decoration: none;
  }

  .brp-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .brp-side-divider {
    border-top: 1px solid var(--brp-border);
    margin: 0.5rem 0;
  }

  .brp-side-group {
    display: block;
  }

  .brp-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--brp-grey);
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

  .brp-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .brp-side-group__summary:hover,
  .brp-side-group__summary:focus-visible {
    background: var(--brp-subtle);
    outline: none;
  }

  .brp-side-group :global(.brp-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .brp-side-group:not([open]) :global(.brp-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .brp-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .brp-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .brp-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .brp-breadcrumb__item {
    align-items: center;
    color: var(--brp-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .brp-breadcrumb__item + .brp-breadcrumb__item::before {
    color: var(--brp-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .brp-breadcrumb__link {
    color: var(--brp-purple);
    text-decoration: none;
  }

  .brp-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .brp-breadcrumb__item span[aria-current="page"] {
    color: var(--brp-ink);
    font-weight: 600;
  }

  /* ── Footer BRP ── */
  .brp-footer {
    background: var(--brp-subtle);
    border-top: 1px solid var(--brp-border);
    margin-top: auto;
  }

  .brp-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .brp-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .brp-footer__link {
    color: var(--brp-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .brp-footer__link:hover {
    color: var(--brp-purple);
    text-decoration: underline;
  }

  .brp-footer__logo {
    display: block;
    width: auto;
    height: 28px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .brp-body {
      grid-template-columns: 1fr;
    }

    .brp-sidebar {
      display: none;
    }

    .brp-nav {
      display: none;
    }

    .brp-header__tools {
      display: none;
    }

    .brp-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .brp-nav__link,
    .brp-cta,
    .brp-search-btn,
    .brp-side-link,
    .brp-side-group :global(.brp-side-group__icon) {
      transition: none;
    }
  }
</style>

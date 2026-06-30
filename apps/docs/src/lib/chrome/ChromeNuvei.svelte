<!--
  Chrome documentaire Nuvei (nuvei.com — fintech montréalaise).
  Forme fidèle à l'en-tête réel de Nuvei :
  - Header : bandeau BLANC clair, wordmark officiel Nuvei (indigo + point cyan du « i »)
    à gauche, nav horizontale au centre, CTA INDIGO arrondi (8px) à droite
  - Barre latérale gauche : item actif accent cyan + fond subtle, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande crème claire avec liens + wordmark
  - Couleurs MESURÉES sur le logo/site : indigo #160850 (primaire, hover #2a1a6e),
    cyan #0C98D4 (interactif/lien + anneau focus), magenta #E40046 (accent/danger),
    encre #160850, secondaire #6B778C, surfaces blanches, crème subtile #FAF9F8,
    bordure #CFC9C2 ; conteneurs 8px arrondis
  - Logo officiel Nuvei (vecteur inline extrait de nuvei.com) référencé via
    <img src="/chrome/nuvei/logo.svg">
  - Typo : « Inter Tight » (display + sans), repli system-ui ; chargée via Google Fonts
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
    href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&display=swap"
  />
</svelte:head>

<div class="nuv-shell">
  <!-- ── HEADER Nuvei ── -->
  <div class="nuv-header-wrap">
    <header class="nuv-header" aria-label="Nuvei">
      <div class="nuv-header__inner">
        <!-- Gauche : wordmark officiel (indigo + point cyan du « i ») -->
        <div class="nuv-header__brand">
          <a href="/" class="nuv-header__brand-link" aria-label="Accueil : Nuvei Design System">
            <img
              src="/chrome/nuvei/logo.svg"
              alt="Nuvei"
              class="nuv-logo"
              width="92"
              height="30"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="nuv-nav" aria-label="Navigation principale">
          <ul class="nuv-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="nuv-nav__item">
                <a
                  class="nuv-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </nav>

        <!-- Droite : recherche + outils + CTA indigo -->
        <div class="nuv-header__tools">
          <!-- Recherche Nuvei : bouton loupe indigo compact (palette docs). -->
          <button
            type="button"
            class="nuv-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="nuv-header__tools-links">
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
          class="nuv-header__burger"
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

  <!-- ── BODY Nuvei ── -->
  <div class="nuv-body">
    <!-- Sidebar -->
    <aside class="nuv-sidebar" aria-label="Navigation de la documentation">
      <nav class="nuv-side-nav" aria-label="Sommaire">
        <ul class="nuv-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="nuv-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="nuv-side-divider" role="separator"></li>

          <li class="nuv-side-heading">
            <a
              class="nuv-side-link nuv-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="nuv-side-group" open={isGroupOpen(group.items)}>
                <summary class="nuv-side-group__summary">
                  <ChevronDown class="nuv-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="nuv-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="nuv-side-link nuv-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="nuv-side-divider" role="separator"></li>

          <li class="nuv-side-heading">
            <a
              class="nuv-side-link nuv-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="nuv-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="nuv-side-group__summary">
                  <ChevronDown class="nuv-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="nuv-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="nuv-side-link nuv-side-link--sub"
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
      <div class="nuv-sidebar-footer">
        <span class="nuv-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="nuv-sidebar-github"
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
    <div class="nuv-content">
      <nav class="nuv-breadcrumb" aria-label="Breadcrumb">
        <ol class="nuv-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="nuv-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="nuv-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Nuvei ── -->
  <footer class="nuv-footer" aria-label="Pied de page Nuvei">
    <div class="nuv-footer__inner">
      <nav class="nuv-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="nuv-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/nuvei/logo.svg"
        alt="Nuvei"
        class="nuv-footer__logo"
        width="92"
        height="30"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Nuvei (mesurées sur le logo + le site) ── */
  .nuv-shell {
    --nuv-indigo: #160850; /* indigo primaire / wordmark / titres */
    --nuv-indigo-hover: #2a1a6e; /* survol primaire */
    --nuv-cyan: #0c98d4; /* cyan interactif / lien / anneau focus */
    --nuv-magenta: #e40046; /* magenta accent / danger */
    --nuv-ink: #160850; /* encre */
    --nuv-secondary: #6b778c; /* texte secondaire */
    --nuv-subtle: #faf9f8; /* surface crème subtile */
    --nuv-border: #cfc9c2; /* bordure */
    --nuv-border-strong: #b8b2aa;
    --nuv-white: #fff;
    --nuv-sidebar-width: 17rem;
    --nuv-radius: 8px; /* conteneurs 8px arrondis */
    font-family: 'Inter Tight', system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--nuv-white);
    color: var(--nuv-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Nuvei ── */
  .nuv-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .nuv-header {
    background: var(--nuv-white);
    border-bottom: 1px solid var(--nuv-border);
  }

  .nuv-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .nuv-header__brand {
    flex: 0 0 auto;
  }

  .nuv-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .nuv-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Wordmark officiel Nuvei (ratio préservé, hauteur ~30px comme l'en-tête réel). */
  .nuv-logo {
    display: block;
    width: auto;
    height: 30px;
  }

  /* ── Nav horizontale (centre) ── */
  .nuv-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .nuv-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nuv-nav__item {
    flex: 0 0 auto;
  }

  .nuv-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--nuv-indigo);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: color 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .nuv-nav__link:hover,
  .nuv-nav__link:focus-visible {
    color: var(--nuv-cyan);
    outline: none;
  }

  /* Onglet actif : soulignement cyan/indigo (signature Nuvei). */
  .nuv-nav__link[aria-current="page"] {
    border-bottom-color: var(--nuv-cyan);
    color: var(--nuv-indigo);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .nuv-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .nuv-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Nuvei (champs clairs, anneau 1px, focus cyan). */
  .nuv-header__tools-links :global(.docs-header-control) {
    background: var(--nuv-white);
    border-color: var(--nuv-border-strong);
    border-radius: var(--nuv-radius);
    color: var(--nuv-indigo);
    font-family: inherit;
  }

  .nuv-header__tools-links :global(.docs-header-control:hover),
  .nuv-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--nuv-subtle);
    border-color: var(--nuv-cyan);
    color: var(--nuv-cyan);
    box-shadow: none;
  }

  /* Recherche Nuvei : bouton loupe indigo compact (radius 8px, focus cyan). */
  .nuv-search__btn {
    align-items: center;
    background: var(--nuv-indigo);
    border: 1px solid var(--nuv-indigo);
    border-radius: var(--nuv-radius);
    color: var(--nuv-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease;
  }

  .nuv-search__btn:hover,
  .nuv-search__btn:focus-visible {
    background: var(--nuv-indigo-hover);
    border-color: var(--nuv-indigo-hover);
    outline: 2px solid var(--nuv-cyan);
    outline-offset: 1px;
  }

  /* CTA indigo (radius 8px). */
  .nuv-cta {
    align-items: center;
    background: var(--nuv-indigo);
    border: 1px solid var(--nuv-indigo);
    border-radius: var(--nuv-radius);
    color: var(--nuv-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .nuv-cta:hover,
  .nuv-cta:focus-visible {
    background: var(--nuv-indigo-hover);
    border-color: var(--nuv-indigo-hover);
    color: var(--nuv-white);
    outline: none;
  }

  /* Burger mobile */
  .nuv-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--nuv-indigo);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Nuvei ── */
  .nuv-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--nuv-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Nuvei ── */
  .nuv-sidebar {
    background: var(--nuv-white);
    border-right: 1px solid var(--nuv-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .nuv-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .nuv-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--nuv-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .nuv-version-badge {
    background: var(--nuv-subtle);
    border: 1px solid var(--nuv-border);
    border-radius: var(--nuv-radius);
    color: var(--nuv-cyan);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .nuv-sidebar-github {
    align-items: center;
    color: var(--nuv-indigo);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .nuv-sidebar-github:hover,
  .nuv-sidebar-github:focus-visible {
    color: var(--nuv-cyan);
  }

  .nuv-side-list,
  .nuv-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nuv-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--nuv-indigo);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .nuv-side-link:hover,
  .nuv-side-link:focus-visible {
    background: var(--nuv-subtle);
    color: var(--nuv-cyan);
    text-decoration: none;
  }

  .nuv-side-link[aria-current="page"] {
    background: var(--nuv-subtle);
    border-left-color: var(--nuv-cyan);
    color: var(--nuv-cyan);
    font-weight: 700;
    text-decoration: none;
  }

  .nuv-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .nuv-side-divider {
    border-top: 1px solid var(--nuv-border);
    margin: 0.5rem 0;
  }

  .nuv-side-group {
    display: block;
  }

  .nuv-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--nuv-secondary);
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

  .nuv-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .nuv-side-group__summary:hover,
  .nuv-side-group__summary:focus-visible {
    background: var(--nuv-subtle);
    outline: none;
  }

  .nuv-side-group :global(.nuv-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .nuv-side-group:not([open]) :global(.nuv-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .nuv-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .nuv-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .nuv-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nuv-breadcrumb__item {
    align-items: center;
    color: var(--nuv-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .nuv-breadcrumb__item + .nuv-breadcrumb__item::before {
    color: var(--nuv-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .nuv-breadcrumb__link {
    color: var(--nuv-cyan);
    text-decoration: none;
  }

  .nuv-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .nuv-breadcrumb__item span[aria-current="page"] {
    color: var(--nuv-indigo);
    font-weight: 600;
  }

  /* ── Footer Nuvei ── */
  .nuv-footer {
    background: var(--nuv-subtle);
    border-top: 1px solid var(--nuv-border);
    margin-top: auto;
  }

  .nuv-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .nuv-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .nuv-footer__link {
    color: var(--nuv-indigo);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .nuv-footer__link:hover {
    color: var(--nuv-cyan);
    text-decoration: underline;
  }

  .nuv-footer__logo {
    display: block;
    width: auto;
    height: 28px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .nuv-body {
      grid-template-columns: 1fr;
    }

    .nuv-sidebar {
      display: none;
    }

    .nuv-nav {
      display: none;
    }

    .nuv-header__tools {
      display: none;
    }

    .nuv-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .nuv-nav__link,
    .nuv-cta,
    .nuv-search__btn,
    .nuv-side-link,
    .nuv-side-group :global(.nuv-side-group__icon) {
      transition: none;
    }
  }
</style>

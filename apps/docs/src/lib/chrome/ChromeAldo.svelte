<!--
  Chrome documentaire ALDO (aldoshoes.com — chaussures / mode, Montréal).
  Forme fidèle à l'esthétique retail-mode signature d'ALDO :
  - Fine bande JAUNE signature (#ffef71) tout en haut de la page (touche de marque
    immédiate), puis header BLANC pur #fff avec fine ligne 1px #e2e2e2 en bas
  - Gauche : logo officiel ALDO (le wordmark vectoriel « ALDO » noir, asset officiel
    icon-aldo-logo.svg) ; aucune icône inventée
  - Nav horizontale sobre sous le header, onglet actif SOULIGNÉ jaune (#ffef71) épais
    sur ink noir — c'est la signature ALDO qui fait lire le chrome comme « ALDO »
  - Outils + barre de recherche à droite (champ blanc carré, bouton noir plein)
  - Barre latérale gauche : item actif accent NOIR + survol gris #f7f7f7
  - Fil d'Ariane au-dessus du contenu ; footer blanc avec wordmark + bande jaune
  - Coins quasi carrés (radius md ~2px) ; CTA noir plein, focus outline noir
  - Typo : 'Helvetica Neue', Arial, sans-serif (aucune police Google requise)
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

<div class="ald-shell">
  <!-- Fine bande jaune signature ALDO tout en haut. -->
  <div class="ald-strip" aria-hidden="true"></div>

  <!-- ── HEADER ALDO ── -->
  <div class="ald-header-wrap">
    <header class="ald-header" aria-label="ALDO">
      <div class="ald-header__inner">
        <!-- Gauche : logo officiel ALDO (wordmark vectoriel noir) -->
        <div class="ald-header__brand">
          <a href="/" class="ald-header__brand-link" aria-label="Accueil : ALDO Design System">
            <img
              src="/chrome/aldo/logo.svg"
              alt="ALDO"
              class="ald-logo"
              width="111"
              height="20"
            />
          </a>
        </div>

        <!-- Droite : outils + recherche -->
        <div class="ald-header__tools">
          <div class="ald-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render colorModeToggle()}
            {@render localeSwitcher()}
          </div>
          <!-- Recherche ALDO : bouton loupe noir carré compact, branché sur la palette docs. -->
          <button
            type="button"
            class="ald-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="ald-header__burger"
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

    <!-- Nav horizontale ALDO (onglet actif souligné jaune signature) -->
    <nav class="ald-nav" aria-label="Navigation principale">
      <div class="ald-nav__inner">
        <ul class="ald-nav__list">
          {#each topNavItems as item (item.href)}
            <li class="ald-nav__item">
              <a
                class="ald-nav__link"
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </nav>
  </div>

  <!-- ── BODY ALDO ── -->
  <div class="ald-body">
    <!-- Sidebar -->
    <aside class="ald-sidebar" aria-label="Navigation de la documentation">
      <nav class="ald-side-nav" aria-label="Sommaire">
        <ul class="ald-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="ald-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="ald-side-divider" role="separator"></li>

          <li class="ald-side-heading">
            <a
              class="ald-side-link ald-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="ald-side-group" open={isGroupOpen(group.items)}>
                <summary class="ald-side-group__summary">
                  <ChevronDown class="ald-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="ald-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="ald-side-link ald-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="ald-side-divider" role="separator"></li>

          <li class="ald-side-heading">
            <a
              class="ald-side-link ald-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="ald-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="ald-side-group__summary">
                  <ChevronDown class="ald-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="ald-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="ald-side-link ald-side-link--sub"
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
      <div class="ald-sidebar-footer">
        <span class="ald-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="ald-sidebar-github"
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
    <div class="ald-content">
      <nav class="ald-breadcrumb" aria-label="Breadcrumb">
        <ol class="ald-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="ald-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="ald-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER ALDO : wordmark officiel + bande jaune signature ── -->
  <footer class="ald-footer" aria-label="Pied de page ALDO">
    <div class="ald-footer__inner">
      <nav class="ald-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="ald-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/aldo/logo.svg"
        alt="ALDO"
        class="ald-footer__logo"
        width="89"
        height="16"
      />
    </div>
    <div class="ald-footer__strip" aria-hidden="true"></div>
  </footer>
</div>

<style>
  /* ── Variables ALDO (mesurées : ink noir + jaune signature) ── */
  .ald-shell {
    --ald-ink: #000000; /* noir pur : encre, CTA, boutons */
    --ald-yellow: #ffef71; /* jaune signature ALDO : strip + souligné actif */
    --ald-text: #111111; /* texte principal */
    --ald-text2: #5c5f62; /* texte secondaire */
    --ald-white: #ffffff; /* surfaces */
    --ald-subtle: #f7f7f7; /* survol léger */
    --ald-border: #e2e2e2; /* liseré */
    --ald-danger: #c0202e; /* danger */
    --ald-radius: 2px; /* radius md : coins quasi carrés */
    --ald-sidebar-width: 17rem;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    background: var(--ald-white);
    color: var(--ald-text);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Bande jaune signature en tête de page ── */
  .ald-strip {
    background: var(--ald-yellow);
    height: 6px;
    width: 100%;
  }

  /* ── Header ALDO ── */
  .ald-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .ald-header {
    background: var(--ald-white);
    border-bottom: 1px solid var(--ald-border);
  }

  .ald-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 80rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .ald-header__brand {
    flex: 0 0 auto;
  }

  .ald-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .ald-header__brand-link:hover {
    opacity: 0.75;
  }

  /* Logo officiel ALDO (wordmark vectoriel noir, ratio préservé). */
  .ald-logo {
    display: block;
    width: auto;
    height: 20px;
  }

  .ald-header__tools {
    align-items: flex-end;
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: center;
  }

  .ald-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header ALDO (champs blancs carrés, liseré noir au survol). */
  .ald-header__tools-links :global(.docs-header-control) {
    background: var(--ald-white);
    border-color: var(--ald-border);
    border-radius: var(--ald-radius);
    color: var(--ald-text);
    font-family: inherit;
  }

  .ald-header__tools-links :global(.docs-header-control:hover),
  .ald-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--ald-subtle);
    border-color: var(--ald-ink);
    color: var(--ald-ink);
    box-shadow: none;
  }

  /* Recherche ALDO : bouton loupe noir carré compact (coins quasi carrés). */
  .ald-search__btn {
    align-items: center;
    background: var(--ald-ink);
    border: 1px solid var(--ald-ink);
    border-radius: var(--ald-radius);
    color: var(--ald-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
  }

  .ald-search__btn:hover,
  .ald-search__btn:focus-visible {
    background: var(--ald-white);
    border-color: var(--ald-ink);
    color: var(--ald-ink);
    outline: 2px solid var(--ald-ink);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .ald-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--ald-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Nav horizontale ALDO (onglet actif souligné jaune signature) ── */
  .ald-nav {
    background: var(--ald-white);
    border-bottom: 1px solid var(--ald-border);
  }

  .ald-nav__inner {
    margin: 0 auto;
    max-width: 80rem;
    overflow-x: auto;
    padding: 0 1.5rem;
  }

  .ald-nav__list {
    align-items: center;
    display: flex;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ald-nav__item {
    flex: 0 0 auto;
  }

  .ald-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--ald-text);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.3rem;
    letter-spacing: 0.04em;
    min-height: 3rem;
    padding: 0 1rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .ald-nav__link:hover,
  .ald-nav__link:focus-visible {
    background: var(--ald-subtle);
    border-bottom-color: var(--ald-ink);
    outline: none;
  }

  /* État actif = soulignement JAUNE signature épais sur ink noir. */
  .ald-nav__link[aria-current="page"] {
    border-bottom-color: var(--ald-yellow);
    border-bottom-width: 4px;
    color: var(--ald-ink);
    font-weight: 700;
  }

  /* ── Body ALDO ── */
  .ald-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--ald-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 80rem;
    width: 100%;
  }

  /* ── Sidebar ALDO ── */
  .ald-sidebar {
    background: var(--ald-white);
    border-right: 1px solid var(--ald-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 7.5rem);
    position: sticky;
    top: 7.5rem;
  }

  .ald-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .ald-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--ald-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .ald-version-badge {
    background: var(--ald-subtle);
    border: 1px solid var(--ald-border);
    border-radius: var(--ald-radius);
    color: var(--ald-ink);
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .ald-sidebar-github {
    align-items: center;
    color: var(--ald-text2);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .ald-sidebar-github:hover,
  .ald-sidebar-github:focus-visible {
    color: var(--ald-ink);
  }

  .ald-side-list,
  .ald-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ald-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--ald-text);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .ald-side-link:hover,
  .ald-side-link:focus-visible {
    background: var(--ald-subtle);
    color: var(--ald-ink);
    text-decoration: none;
  }

  /* État actif = bord noir gauche + fond léger + texte noir. */
  .ald-side-link[aria-current="page"] {
    background: var(--ald-subtle);
    border-left-color: var(--ald-ink);
    color: var(--ald-ink);
    font-weight: 700;
    text-decoration: none;
  }

  .ald-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .ald-side-divider {
    border-top: 1px solid var(--ald-border);
    margin: 0.5rem 0;
  }

  .ald-side-group {
    display: block;
  }

  .ald-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--ald-text2);
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
    transition: background 120ms ease, color 120ms ease;
  }

  .ald-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .ald-side-group__summary:hover,
  .ald-side-group__summary:focus-visible {
    background: var(--ald-subtle);
    color: var(--ald-ink);
    outline: none;
  }

  .ald-side-group :global(.ald-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .ald-side-group:not([open]) :global(.ald-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .ald-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .ald-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .ald-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ald-breadcrumb__item {
    align-items: center;
    color: var(--ald-text2);
    display: inline-flex;
    font-size: 0.8125rem;
  }

  .ald-breadcrumb__item + .ald-breadcrumb__item::before {
    color: var(--ald-text2);
    content: "/";
    margin: 0 0.5rem;
  }

  .ald-breadcrumb__link {
    color: var(--ald-text2);
    text-decoration: none;
  }

  .ald-breadcrumb__link:hover {
    color: var(--ald-ink);
    text-decoration: underline;
  }

  .ald-breadcrumb__item span[aria-current="page"] {
    color: var(--ald-ink);
    font-weight: 600;
  }

  /* ── Footer ALDO (wordmark officiel + bande jaune signature) ── */
  .ald-footer {
    background: var(--ald-white);
    border-top: 1px solid var(--ald-border);
    margin-top: auto;
  }

  .ald-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 80rem;
    padding: 1.5rem;
  }

  .ald-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .ald-footer__link {
    color: var(--ald-text2);
    font-size: 0.8125rem;
    letter-spacing: 0.04em;
    text-decoration: none;
    text-transform: uppercase;
  }

  .ald-footer__link:hover {
    color: var(--ald-ink);
    text-decoration: underline;
  }

  .ald-footer__logo {
    display: block;
    width: auto;
    height: 16px;
    flex: 0 0 auto;
  }

  /* Bande jaune signature en bas du footer. */
  .ald-footer__strip {
    background: var(--ald-yellow);
    height: 6px;
    width: 100%;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .ald-body {
      grid-template-columns: 1fr;
    }

    .ald-sidebar {
      display: none;
    }

    .ald-header__tools {
      display: none;
    }

    .ald-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .ald-nav__link,
    .ald-search__btn,
    .ald-side-link,
    .ald-side-group :global(.ald-side-group__icon) {
      transition: none;
    }
  }
</style>

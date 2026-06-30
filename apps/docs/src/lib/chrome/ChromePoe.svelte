<!--
  Chrome documentaire Poe (poe.com — Poe by Quora, plateforme multi-modèles de chat IA).
  Forme fidèle à l'en-tête poe.com : clair, minimal, violet de marque, contrôles en pilule.
  - Header : bandeau BLANC #ffffff, liseré bas gris #e3e3e7, logo OFFICIEL Poe (bulle
    de chat + wordmark) à GAUCHE, nav text-sm sobre au centre, déclencheur de recherche
    en PILULE violette à droite
  - Boutons / contrôles en PILULE (9999px) — signature Poe ; champs/menus arrondis 8px ;
    onglet actif = label violet + soulignement violet
  - Barre latérale : items en pastilles arrondies (rounded-md) ; actif = fond violet ténu
    #e4e7f9 + texte violet #413fa9 (pas de filet gauche — style Poe)
  - Anneau de focus Poe = double anneau NEUTRE gris (halo blanc interne + gris #505157
    externe), pas l'accent violet — box-shadow 0 0 0 1px #fff, 0 0 0 3px #505157
  - Couleurs MESURÉES sur poe.com (jeu --pdl-*) : accent violet #5d5cde, hover/lien
    #413fa9, violet ténu #e4e7f9, encre #0d0d0d, secondaire #505157, sourdine #616165,
    surface ténue #f6f6f8, survol #eaeaee, bordure #e3e3e7, bordure champ #cccdd1,
    bordure forte #bbbcc1
  - Logo OFFICIEL Poe (vecteur Simple Icons) via <img src="/chrome/poe/logo.svg">
  - Typo : pile system-ui native de Poe (aucune police réseau chargée)
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

<div class="poe-shell">
  <!-- ── HEADER Poe ── -->
  <div class="poe-header-wrap">
    <header class="poe-header" aria-label="Poe">
      <div class="poe-header__inner">
        <!-- Gauche : logo officiel Poe -->
        <div class="poe-header__brand">
          <a href="/" class="poe-header__brand-link" aria-label="Accueil : Poe Design System">
            <img
              src="/chrome/poe/logo.svg"
              alt="Poe"
              class="poe-logo"
              width="92"
              height="24"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="poe-nav" aria-label="Navigation principale">
          <ul class="poe-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="poe-nav__item">
                <a
                  class="poe-nav__link"
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
        <div class="poe-header__tools">
          <button
            type="button"
            class="poe-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="poe-header__tools-links">
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
          class="poe-header__burger"
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

  <!-- ── BODY Poe ── -->
  <div class="poe-body">
    <!-- Sidebar -->
    <aside class="poe-sidebar" aria-label="Navigation de la documentation">
      <nav class="poe-side-nav" aria-label="Sommaire">
        <ul class="poe-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="poe-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="poe-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="poe-side-group" open={isGroupOpen(group.items)}>
                <summary class="poe-side-group__summary">
                  <ChevronDown class="poe-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="poe-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="poe-side-link poe-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="poe-side-divider" role="separator"></li>

          <li>
            <a
              class="poe-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="poe-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="poe-side-group__summary">
                  <ChevronDown class="poe-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="poe-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="poe-side-link poe-side-link--sub"
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
      <div class="poe-sidebar-footer">
        <span class="poe-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="poe-sidebar-github"
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
    <div class="poe-content">
      <nav class="poe-breadcrumb" aria-label="Breadcrumb">
        <ol class="poe-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="poe-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="poe-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Poe ── -->
  <footer class="poe-footer" aria-label="Pied de page Poe">
    <div class="poe-footer__inner">
      <nav class="poe-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="poe-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/poe/logo.svg"
        alt="Poe"
        class="poe-footer__logo"
        width="84"
        height="22"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Poe (--pdl-* mesurés sur poe.com) ── */
  .poe-shell {
    --poe-violet: #5d5cde; /* --pdl-accent-base — accent / action / bulle */
    --poe-violet-emphasis: #413fa9; /* --pdl-accent-emphasis — hover + lien */
    --poe-violet-bold: #333180; /* --pdl-accent-bold */
    --poe-violet-subtle: #d7dbf4; /* --pdl-accent-subtle */
    --poe-violet-faint: #e4e7f9; /* --pdl-accent-faint — fond actif sidebar */
    --poe-ink: #0d0d0d; /* --pdl-fg-base — texte primaire */
    --poe-secondary: #505157; /* --pdl-fg-muted — texte secondaire + anneau focus */
    --poe-muted: #616165; /* --pdl-fg-subtle — texte tertiaire / placeholder */
    --poe-bg: #ffffff; /* --pdl-bg-base */
    --poe-faint: #f6f6f8; /* --pdl-bg-faint — surface ténue / survol */
    --poe-subtle: #eaeaee; /* --pdl-bg-subtle — survol secondaire */
    --poe-border: #e3e3e7; /* --pdl-border-base */
    --poe-border-input: #cccdd1; /* --pdl-action-default-border */
    --poe-border-strong: #bbbcc1; /* --pdl-border-emphasis */
    --poe-focus: #505157; /* anneau de focus neutre gris */
    --poe-radius: 0.5rem; /* 8px — champs / menus / pastilles sidebar */
    --poe-radius-pill: 9999px; /* signature Poe — boutons / contrôles */
    --poe-sidebar-width: 17rem;
    font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
    background: var(--poe-bg);
    color: var(--poe-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Poe ── */
  .poe-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .poe-header {
    background: var(--poe-bg);
    border-bottom: 1px solid var(--poe-border);
  }

  .poe-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4rem;
    padding: 0.625rem 1.5rem;
  }

  .poe-header__brand {
    flex: 0 0 auto;
  }

  .poe-header__brand-link {
    align-items: center;
    border-radius: var(--poe-radius);
    display: inline-flex;
    text-decoration: none;
    transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .poe-header__brand-link:hover {
    opacity: 0.8;
  }

  .poe-header__brand-link:focus-visible {
    outline: none;
    box-shadow: 0 0 0 1px var(--poe-bg), 0 0 0 3px var(--poe-focus);
  }

  /* Logo officiel Poe (ratio préservé). */
  .poe-logo {
    display: block;
    width: auto;
    height: 24px;
  }

  /* ── Nav horizontale (centre) ── */
  .poe-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .poe-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .poe-nav__item {
    flex: 0 0 auto;
  }

  .poe-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--poe-secondary);
    display: inline-flex;
    font-size: 0.875rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.5rem;
    padding: 0 0.75rem;
    text-decoration: none;
    transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
  }

  .poe-nav__link:hover,
  .poe-nav__link:focus-visible {
    color: var(--poe-ink);
    outline: none;
  }

  .poe-nav__link[aria-current="page"] {
    border-bottom-color: var(--poe-violet);
    color: var(--poe-violet-emphasis);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .poe-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .poe-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Poe : contrôles en pilule (signature Poe). */
  .poe-header__tools-links :global(.docs-header-control) {
    background: var(--poe-bg);
    border-color: var(--poe-border-input);
    border-radius: var(--poe-radius-pill);
    color: var(--poe-ink);
    font-family: inherit;
  }

  .poe-header__tools-links :global(.docs-header-control:hover),
  .poe-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--poe-faint);
    border-color: var(--poe-violet);
    color: var(--poe-ink);
    box-shadow: none;
  }

  .poe-header__tools-links :global(.docs-header-control:focus-visible) {
    outline: none;
    box-shadow: 0 0 0 1px var(--poe-bg), 0 0 0 3px var(--poe-focus);
  }

  /* Recherche Poe : déclencheur en PILULE violette pleine (signature Poe). */
  .poe-search__btn {
    align-items: center;
    background: var(--poe-violet);
    border: 1px solid var(--poe-violet);
    border-radius: var(--poe-radius-pill);
    color: var(--poe-bg);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .poe-search__btn:hover {
    background: var(--poe-violet-emphasis);
    border-color: var(--poe-violet-emphasis);
  }

  .poe-search__btn:focus-visible {
    outline: none;
    box-shadow: 0 0 0 1px var(--poe-bg), 0 0 0 3px var(--poe-focus);
  }

  /* Burger mobile */
  .poe-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    border-radius: var(--poe-radius);
    color: var(--poe-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.5rem;
    min-width: 2.5rem;
    padding: 0;
  }

  .poe-header__burger:focus-visible {
    outline: none;
    box-shadow: 0 0 0 1px var(--poe-bg), 0 0 0 3px var(--poe-focus);
  }

  /* ── Body Poe ── */
  .poe-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--poe-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Poe ── */
  .poe-sidebar {
    background: var(--poe-bg);
    border-right: 1px solid var(--poe-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4rem);
    position: sticky;
    top: 4rem;
  }

  .poe-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1rem 0.75rem;
  }

  .poe-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--poe-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .poe-version-badge {
    background: var(--poe-violet-faint);
    border-radius: var(--poe-radius-pill);
    color: var(--poe-violet-emphasis);
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.15rem 0.6rem;
    white-space: nowrap;
  }

  .poe-sidebar-github {
    align-items: center;
    border-radius: var(--poe-radius);
    color: var(--poe-secondary);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .poe-sidebar-github:hover,
  .poe-sidebar-github:focus-visible {
    color: var(--poe-violet-emphasis);
    outline: none;
  }

  .poe-side-list,
  .poe-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .poe-side-link {
    align-items: center;
    border-radius: var(--poe-radius);
    box-sizing: border-box;
    color: var(--poe-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.25rem;
    padding: 0.4rem 0.75rem;
    text-decoration: none;
    transition: background 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .poe-side-link:hover,
  .poe-side-link:focus-visible {
    background: var(--poe-faint);
    color: var(--poe-ink);
    outline: none;
    text-decoration: none;
  }

  .poe-side-link[aria-current="page"] {
    background: var(--poe-violet-faint);
    color: var(--poe-violet-emphasis);
    font-weight: 600;
    text-decoration: none;
  }

  .poe-side-link--sub {
    color: var(--poe-secondary);
    font-size: 0.8125rem;
    font-weight: 400;
    min-height: 2rem;
    padding-left: 1.5rem;
  }

  .poe-side-link--sub:hover,
  .poe-side-link--sub:focus-visible {
    color: var(--poe-ink);
  }

  .poe-side-link--sub[aria-current="page"] {
    color: var(--poe-violet-emphasis);
  }

  .poe-side-divider {
    border-top: 1px solid var(--poe-border);
    margin: 0.5rem 0.25rem;
  }

  .poe-side-group {
    display: block;
  }

  .poe-side-group__summary {
    align-items: center;
    border-radius: var(--poe-radius);
    color: var(--poe-muted);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 700;
    gap: 0.35rem;
    letter-spacing: 0.04em;
    list-style: none;
    min-height: 2rem;
    padding: 0 0.75rem;
    text-transform: uppercase;
    transition: background 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .poe-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .poe-side-group__summary:hover,
  .poe-side-group__summary:focus-visible {
    background: var(--poe-faint);
    color: var(--poe-secondary);
    outline: none;
  }

  .poe-side-group :global(.poe-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .poe-side-group:not([open]) :global(.poe-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .poe-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .poe-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .poe-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .poe-breadcrumb__item {
    align-items: center;
    color: var(--poe-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .poe-breadcrumb__item + .poe-breadcrumb__item::before {
    color: var(--poe-muted);
    content: "›";
    margin: 0 0.4rem;
  }

  .poe-breadcrumb__link {
    color: var(--poe-violet-emphasis);
    text-decoration: none;
  }

  .poe-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .poe-breadcrumb__item span[aria-current="page"] {
    color: var(--poe-ink);
    font-weight: 600;
  }

  /* ── Footer Poe ── */
  .poe-footer {
    background: var(--poe-faint);
    border-top: 1px solid var(--poe-border);
    margin-top: auto;
  }

  .poe-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .poe-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .poe-footer__link {
    color: var(--poe-secondary);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .poe-footer__link:hover {
    color: var(--poe-violet-emphasis);
    text-decoration: none;
  }

  .poe-footer__logo {
    display: block;
    width: auto;
    height: 22px;
    flex: 0 0 auto;
    opacity: 0.9;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .poe-body {
      grid-template-columns: 1fr;
    }

    .poe-sidebar {
      display: none;
    }

    .poe-nav {
      display: none;
    }

    .poe-header__tools {
      display: none;
    }

    .poe-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .poe-nav__link,
    .poe-search__btn,
    .poe-side-link,
    .poe-side-group :global(.poe-side-group__icon) {
      transition: none;
    }
  }
</style>

<!--
  Chrome documentaire Quebecor (quebecor.com — le groupe média et télécom
  montréalais). Forme corporate sobre fidèle à l'en-tête de quebecor.com :
  - Header : bandeau BLANC propre, fine ligne hairline gris clair (#e3e6ea),
    logo officiel Quebecor (~26px) à gauche ; nav horizontale au centre + loupe
    de recherche compacte ; barre utilitaire (switchers + comparateur) à droite
  - Onglet de nav actif : SOULIGNÉ bleu acier #4d7fa7 (l'indicateur corporate)
  - Loupe de recherche : icône bleu acier #4d7fa7
  - Barre latérale gauche : item actif accent bleu acier à gauche + fond tinté
    bleu très clair, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande bleu marine profond #18364d, liens blancs, filet d'accent
    bleu acier, logo Quebecor en blanc (filtre knockout)
  - Couleurs corporate Quebecor : bleu acier #4d7fa7 (marque / action / lien),
    bleu clair #64a7dc (highlight), bleu marine profond #18364d (emphase /
    footer), anthracite #263238 (corps), gris secondaire #656e76, hairline
    #e3e6ea, teinte hover #eef3f7, blanc #ffffff ; radius corporate doux (md 4px)
  - Logo officiel Quebecor référencé via <img src="/chrome/quebecor/logo.svg">
  - Typo : 'Montserrat' (sans corporate) ; aucune police propriétaire chargée,
    fallbacks système (Helvetica / Arial).
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

<div class="qbc-shell">
  <!-- ── HEADER QUEBECOR ── -->
  <div class="qbc-header-wrap">
    <header class="qbc-header" aria-label="Quebecor">
      <div class="qbc-header__inner">
        <!-- Gauche : logo officiel Quebecor -->
        <div class="qbc-header__brand">
          <a href="/" class="qbc-header__brand-link" aria-label="Accueil : Quebecor Design System">
            <img
              src="/chrome/quebecor/logo.svg"
              alt="Quebecor"
              class="qbc-logo"
              width="120"
              height="26"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="qbc-nav" aria-label="Navigation principale">
          <ul class="qbc-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="qbc-nav__item">
                <a
                  class="qbc-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Quebecor : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="qbc-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) -->
        <div class="qbc-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="qbc-header__tools-links">
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
          class="qbc-header__burger"
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

  <!-- ── BODY QUEBECOR ── -->
  <div class="qbc-body">
    <!-- Sidebar -->
    <aside class="qbc-sidebar" aria-label="Navigation de la documentation">
      <nav class="qbc-side-nav" aria-label="Sommaire">
        <ul class="qbc-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="qbc-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="qbc-side-divider" role="separator"></li>

          <li class="qbc-side-heading">
            <a
              class="qbc-side-link qbc-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="qbc-side-group" open={isGroupOpen(group.items)}>
                <summary class="qbc-side-group__summary">
                  <ChevronDown class="qbc-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="qbc-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="qbc-side-link qbc-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="qbc-side-divider" role="separator"></li>

          <li class="qbc-side-heading">
            <a
              class="qbc-side-link qbc-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="qbc-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="qbc-side-group__summary">
                  <ChevronDown class="qbc-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="qbc-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="qbc-side-link qbc-side-link--sub"
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
      <div class="qbc-sidebar-footer">
        <span class="qbc-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="qbc-sidebar-github"
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
    <div class="qbc-content">
      <nav class="qbc-breadcrumb" aria-label="Breadcrumb">
        <ol class="qbc-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="qbc-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="qbc-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER QUEBECOR ── -->
  <footer class="qbc-footer" aria-label="Pied de page Quebecor">
    <div class="qbc-footer__inner">
      <nav class="qbc-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="qbc-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/quebecor/logo.svg"
        alt="Quebecor"
        class="qbc-footer__logo"
        width="120"
        height="26"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Quebecor (couleurs corporate quebecor.com) ── */
  .qbc-shell {
    --qbc-steel: #4d7fa7; /* bleu acier : marque / action / lien / nav actif */
    --qbc-steel-hover: #3f6c90; /* bleu acier assombri : hover */
    --qbc-blue-light: #64a7dc; /* bleu clair : highlight */
    --qbc-navy: #18364d; /* bleu marine profond : emphase / footer */
    --qbc-ink: #263238; /* anthracite : texte primaire */
    --qbc-grey: #656e76; /* gris secondaire */
    --qbc-subtle: #eef3f7; /* teinte hover / surface subtile bleutée */
    --qbc-border: #e3e6ea; /* hairline gris clair */
    --qbc-white: #fff;
    --qbc-sidebar-width: 17rem;
    --qbc-radius: 4px; /* contrôles arrondis corporate */
    --qbc-radius-pill: 999px; /* pilules / CTA */
    /* Typo Quebecor : Montserrat (sans corporate) ; aucune police propriétaire chargée. */
    --qbc-font-body: 'Montserrat', helvetica, arial, sans-serif;
    --qbc-font-display: 'Montserrat', helvetica, arial, sans-serif;
    font-family: var(--qbc-font-body);
    background: var(--qbc-white);
    color: var(--qbc-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Quebecor ── */
  .qbc-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .qbc-header {
    background: var(--qbc-white);
    border-bottom: 1px solid var(--qbc-border);
  }

  .qbc-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .qbc-header__brand {
    flex: 0 0 auto;
  }

  .qbc-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .qbc-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel Quebecor (~26px, ratio préservé). */
  .qbc-logo {
    display: block;
    width: auto;
    height: 26px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .qbc-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .qbc-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré doux, hover bleu acier. */
  .qbc-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--qbc-radius);
    color: var(--qbc-steel);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .qbc-search-btn:hover,
  .qbc-search-btn:focus-visible {
    background: var(--qbc-subtle);
    border-color: var(--qbc-steel);
    color: var(--qbc-steel-hover);
    outline: none;
  }

  .qbc-nav__item {
    flex: 0 0 auto;
  }

  .qbc-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--qbc-ink);
    display: inline-flex;
    font-family: var(--qbc-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .qbc-nav__link:hover,
  .qbc-nav__link:focus-visible {
    color: var(--qbc-steel);
    outline: none;
  }

  /* Onglet actif : souligné bleu acier (l'indicateur corporate Quebecor). */
  .qbc-nav__link[aria-current="page"] {
    border-bottom-color: var(--qbc-steel);
    color: var(--qbc-navy);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .qbc-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .qbc-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .qbc-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .qbc-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--qbc-border);
  }

  /* Overrides switchers dans header Quebecor (champs clairs, bord hairline 1px). */
  .qbc-header__tools-links :global(.docs-header-control) {
    background: var(--qbc-white);
    border-color: var(--qbc-border);
    border-radius: var(--qbc-radius);
    color: var(--qbc-ink);
    font-family: inherit;
  }

  .qbc-header__tools-links :global(.docs-header-control:hover),
  .qbc-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--qbc-subtle);
    border-color: var(--qbc-steel);
    color: var(--qbc-steel);
    box-shadow: none;
  }

  /* CTA corporate Quebecor (pilule bleu acier sobre). */
  .qbc-cta {
    align-items: center;
    background: var(--qbc-steel);
    border: 1px solid var(--qbc-steel);
    border-radius: var(--qbc-radius-pill);
    color: var(--qbc-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--qbc-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .qbc-cta:hover,
  .qbc-cta:focus-visible {
    background: var(--qbc-steel-hover);
    border-color: var(--qbc-steel-hover);
    color: var(--qbc-white);
    outline: none;
  }

  /* Burger mobile */
  .qbc-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--qbc-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Quebecor ── */
  .qbc-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--qbc-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Quebecor ── */
  .qbc-sidebar {
    background: var(--qbc-white);
    border-right: 1px solid var(--qbc-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .qbc-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .qbc-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--qbc-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .qbc-version-badge {
    background: var(--qbc-subtle);
    border: 1px solid var(--qbc-border);
    border-radius: var(--qbc-radius);
    color: var(--qbc-steel);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .qbc-sidebar-github {
    align-items: center;
    color: var(--qbc-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .qbc-sidebar-github:hover,
  .qbc-sidebar-github:focus-visible {
    color: var(--qbc-steel);
  }

  .qbc-side-list,
  .qbc-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .qbc-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--qbc-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .qbc-side-link:hover,
  .qbc-side-link:focus-visible {
    background: var(--qbc-subtle);
    color: var(--qbc-steel);
    text-decoration: none;
  }

  .qbc-side-link[aria-current="page"] {
    background: var(--qbc-subtle);
    border-left-color: var(--qbc-steel);
    color: var(--qbc-steel);
    font-weight: 700;
    text-decoration: none;
  }

  .qbc-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .qbc-side-divider {
    border-top: 1px solid var(--qbc-border);
    margin: 0.5rem 0;
  }

  .qbc-side-group {
    display: block;
  }

  .qbc-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--qbc-grey);
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

  .qbc-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .qbc-side-group__summary:hover,
  .qbc-side-group__summary:focus-visible {
    background: var(--qbc-subtle);
    outline: none;
  }

  .qbc-side-group :global(.qbc-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .qbc-side-group:not([open]) :global(.qbc-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .qbc-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .qbc-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .qbc-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .qbc-breadcrumb__item {
    align-items: center;
    color: var(--qbc-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .qbc-breadcrumb__item + .qbc-breadcrumb__item::before {
    color: var(--qbc-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .qbc-breadcrumb__link {
    color: var(--qbc-steel);
    text-decoration: none;
  }

  .qbc-breadcrumb__link:hover {
    color: var(--qbc-steel-hover);
    text-decoration: underline;
  }

  .qbc-breadcrumb__item span[aria-current="page"] {
    color: var(--qbc-ink);
    font-weight: 600;
  }

  /* ── Footer Quebecor ── */
  .qbc-footer {
    background: var(--qbc-navy);
    border-top: 3px solid var(--qbc-steel);
    margin-top: auto;
  }

  .qbc-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .qbc-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .qbc-footer__link {
    color: var(--qbc-white);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .qbc-footer__link:hover {
    color: var(--qbc-blue-light);
    text-decoration: underline;
  }

  /* Logo Quebecor en blanc (knockout) sur la bande marine. */
  .qbc-footer__logo {
    display: block;
    width: auto;
    height: 26px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .qbc-body {
      grid-template-columns: 1fr;
    }

    .qbc-sidebar {
      display: none;
    }

    .qbc-nav {
      display: none;
    }

    .qbc-header__tools {
      display: none;
    }

    .qbc-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .qbc-nav__link,
    .qbc-cta,
    .qbc-search-btn,
    .qbc-side-link,
    .qbc-side-group :global(.qbc-side-group__icon) {
      transition: none;
    }
  }
</style>

<!--
  Chrome documentaire Jean Coutu (jeancoutu.com — l'emblématique chaîne de
  pharmacies québécoise, chaleureuse et grand public). Forme calquée sur la
  structure de l'en-tête réel, restylée aux couleurs Jean Coutu :
  - Header : bandeau BLANC, fine hairline (#e4e4e4), allure pharmacie de
    quartier accueillante ; logo officiel Jean Coutu (~28px) à gauche ; nav
    horizontale + loupe de recherche rouge ; CTA pilule rouge à droite
  - Onglet de nav actif : SOULIGNÉ rouge iconique #ff3000 (la barre accent)
  - Barre latérale gauche : item actif accent rouge à gauche + fond tinté
    rosé doux, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande BLEU MARINE #234b8d, liens blancs, filet accent rouge
    #ff3000, logo Jean Coutu en blanc (knockout via filtre)
  - Couleurs Jean Coutu : rouge iconique #ff3000 (marque / action / lien /
    loupe), bleu secondaire #0875cf, bleu marine #234b8d (footer), encre
    #1a1a1a (corps), hairline #e4e4e4, teinte hover rosée #fff0ed, blanc
    #ffffff ; boutons doux et arrondis (radius md 6px, pilules 999px).
  - Logo officiel Jean Coutu référencé via <img src="/chrome/jean-coutu/logo.svg">
  - Typo : grotesk humaniste chaleureux (corps / UI) ; on ne charge AUCUNE
    police propriétaire ; fallback Helvetica / Arial.
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

<div class="jc-shell">
  <!-- ── HEADER JEAN COUTU ── -->
  <div class="jc-header-wrap">
    <header class="jc-header" aria-label="Jean Coutu">
      <div class="jc-header__inner">
        <!-- Gauche : logo officiel Jean Coutu -->
        <div class="jc-header__brand">
          <a href="/" class="jc-header__brand-link" aria-label="Accueil : Jean Coutu Design System">
            <img
              src="/chrome/jean-coutu/logo.svg"
              alt="Jean Coutu"
              class="jc-logo"
              width="100"
              height="28"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="jc-nav" aria-label="Navigation principale">
          <ul class="jc-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="jc-nav__item">
                <a
                  class="jc-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Jean Coutu : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="jc-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA pilule -->
        <div class="jc-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="jc-header__tools-links">
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
          class="jc-header__burger"
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

  <!-- ── BODY JEAN COUTU ── -->
  <div class="jc-body">
    <!-- Sidebar -->
    <aside class="jc-sidebar" aria-label="Navigation de la documentation">
      <nav class="jc-side-nav" aria-label="Sommaire">
        <ul class="jc-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="jc-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="jc-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="jc-side-group" open={isGroupOpen(group.items)}>
                <summary class="jc-side-group__summary">
                  <ChevronDown class="jc-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="jc-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="jc-side-link jc-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="jc-side-divider" role="separator"></li>

          <li>
            <a
              class="jc-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="jc-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="jc-side-group__summary">
                  <ChevronDown class="jc-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="jc-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="jc-side-link jc-side-link--sub"
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
      <div class="jc-sidebar-footer">
        <span class="jc-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="jc-sidebar-github"
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
    <div class="jc-content">
      <nav class="jc-breadcrumb" aria-label="Breadcrumb">
        <ol class="jc-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="jc-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="jc-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER JEAN COUTU ── -->
  <footer class="jc-footer" aria-label="Pied de page Jean Coutu">
    <div class="jc-footer__inner">
      <nav class="jc-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="jc-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/jean-coutu/logo.svg"
        alt="Jean Coutu"
        class="jc-footer__logo"
        width="100"
        height="28"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Jean Coutu ── */
  .jc-shell {
    --jc-red: #ff3000; /* rouge iconique : marque / action / lien / loupe */
    --jc-red-hover: #e02900; /* rouge assombri : hover */
    --jc-blue: #0875cf; /* bleu secondaire */
    --jc-navy: #234b8d; /* bleu marine : bande footer */
    --jc-ink: #1a1a1a; /* encre : texte primaire */
    --jc-grey: #6b7280; /* gris secondaire */
    --jc-grey-muted: #9ca3af; /* gris clair */
    --jc-subtle: #f6f7f9; /* surface subtile / hover doux */
    --jc-tint: #fff0ed; /* teinte hover rosée (rouge délavé) */
    --jc-border: #e4e4e4; /* hairline */
    --jc-white: #fff;
    --jc-sidebar-width: 17rem;
    --jc-radius: 6px; /* contrôles arrondis doux (allure conviviale) */
    --jc-radius-pill: 999px; /* pilules / CTA */
    /* Typo Jean Coutu : grotesk humaniste chaleureux ; aucune police propriétaire chargée. */
    --jc-font-body: 'Helvetica Neue', helvetica, arial, sans-serif;
    font-family: var(--jc-font-body);
    background: var(--jc-white);
    color: var(--jc-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Jean Coutu ── */
  .jc-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .jc-header {
    background: var(--jc-white);
    border-bottom: 1px solid var(--jc-border);
  }

  .jc-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .jc-header__brand {
    flex: 0 0 auto;
  }

  .jc-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .jc-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel Jean Coutu (~28px, ratio préservé). */
  .jc-logo {
    display: block;
    width: auto;
    height: 28px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .jc-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .jc-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré doux, icône rouge, hover rosé. */
  .jc-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--jc-radius);
    color: var(--jc-red);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .jc-search-btn:hover,
  .jc-search-btn:focus-visible {
    background: var(--jc-tint);
    border-color: var(--jc-red);
    color: var(--jc-red);
    outline: none;
  }

  .jc-nav__item {
    flex: 0 0 auto;
  }

  .jc-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--jc-ink);
    display: inline-flex;
    font-family: var(--jc-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .jc-nav__link:hover,
  .jc-nav__link:focus-visible {
    color: var(--jc-red);
    outline: none;
  }

  /* Onglet actif : souligné rouge iconique (la barre accent Jean Coutu). */
  .jc-nav__link[aria-current="page"] {
    border-bottom-color: var(--jc-red);
    color: var(--jc-ink);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .jc-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .jc-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .jc-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .jc-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--jc-border);
  }

  /* Overrides switchers dans header Jean Coutu (champs clairs, bord hairline 1px). */
  .jc-header__tools-links :global(.docs-header-control) {
    background: var(--jc-white);
    border-color: var(--jc-border);
    border-radius: var(--jc-radius);
    color: var(--jc-ink);
    font-family: inherit;
  }

  .jc-header__tools-links :global(.docs-header-control:hover),
  .jc-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--jc-tint);
    border-color: var(--jc-red);
    color: var(--jc-red);
    box-shadow: none;
  }

  /* CTA pilule rouge (signature conviviale Jean Coutu). */
  .jc-cta {
    align-items: center;
    background: var(--jc-red);
    border: 1px solid var(--jc-red);
    border-radius: var(--jc-radius-pill);
    color: var(--jc-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--jc-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .jc-cta:hover,
  .jc-cta:focus-visible {
    background: var(--jc-red-hover);
    border-color: var(--jc-red-hover);
    color: var(--jc-white);
    outline: none;
  }

  /* Burger mobile */
  .jc-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--jc-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Jean Coutu ── */
  .jc-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--jc-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Jean Coutu ── */
  .jc-sidebar {
    background: var(--jc-white);
    border-right: 1px solid var(--jc-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .jc-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .jc-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--jc-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .jc-version-badge {
    background: var(--jc-tint);
    border: 1px solid var(--jc-border);
    border-radius: var(--jc-radius);
    color: var(--jc-red);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .jc-sidebar-github {
    align-items: center;
    color: var(--jc-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .jc-sidebar-github:hover,
  .jc-sidebar-github:focus-visible {
    color: var(--jc-red);
  }

  .jc-side-list,
  .jc-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .jc-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--jc-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .jc-side-link:hover,
  .jc-side-link:focus-visible {
    background: var(--jc-tint);
    color: var(--jc-red);
    text-decoration: none;
  }

  .jc-side-link[aria-current="page"] {
    background: var(--jc-tint);
    border-left-color: var(--jc-red);
    color: var(--jc-red);
    font-weight: 700;
    text-decoration: none;
  }

  .jc-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .jc-side-divider {
    border-top: 1px solid var(--jc-border);
    margin: 0.5rem 0;
  }

  .jc-side-group {
    display: block;
  }

  .jc-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--jc-grey);
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

  .jc-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .jc-side-group__summary:hover,
  .jc-side-group__summary:focus-visible {
    background: var(--jc-subtle);
    outline: none;
  }

  .jc-side-group :global(.jc-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .jc-side-group:not([open]) :global(.jc-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .jc-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .jc-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .jc-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .jc-breadcrumb__item {
    align-items: center;
    color: var(--jc-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .jc-breadcrumb__item + .jc-breadcrumb__item::before {
    color: var(--jc-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .jc-breadcrumb__link {
    color: var(--jc-ink);
    text-decoration: none;
  }

  .jc-breadcrumb__link:hover {
    color: var(--jc-red);
    text-decoration: underline;
  }

  .jc-breadcrumb__item span[aria-current="page"] {
    color: var(--jc-ink);
    font-weight: 600;
  }

  /* ── Footer Jean Coutu : bande bleu marine + filet accent rouge ── */
  .jc-footer {
    background: var(--jc-navy);
    border-top: 3px solid var(--jc-red);
    color: var(--jc-white);
    margin-top: auto;
  }

  .jc-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .jc-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .jc-footer__link {
    color: var(--jc-white);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .jc-footer__link:hover {
    color: var(--jc-white);
    text-decoration: underline;
  }

  /* Logo Jean Coutu en blanc (knockout via filtre) sur la bande marine. */
  .jc-footer__logo {
    display: block;
    width: auto;
    height: 28px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .jc-body {
      grid-template-columns: 1fr;
    }

    .jc-sidebar {
      display: none;
    }

    .jc-nav {
      display: none;
    }

    .jc-header__tools {
      display: none;
    }

    .jc-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .jc-nav__link,
    .jc-cta,
    .jc-search-btn,
    .jc-side-link,
    .jc-side-group :global(.jc-side-group__icon) {
      transition: none;
    }
  }
</style>

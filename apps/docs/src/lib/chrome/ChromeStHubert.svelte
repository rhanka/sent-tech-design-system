<!--
  Chrome documentaire St-Hubert (st-hubert.com — l'emblématique rôtisserie
  québécoise, chaleureuse et conviviale). Forme fidèle à un en-tête St-Hubert :
  - Header : bandeau BLANC chaleureux, hairline fine (#e6e2df), feel amical ;
    logo St-Hubert (mot-symbole rouge ~24px) à gauche ; nav horizontale au centre
    + loupe de recherche ; CTA arrondi rouge à droite
  - Onglet de nav actif : SOULIGNÉ rouge St-Hubert #e2231a (barre d'accent)
  - Barre latérale gauche : item actif accent rouge à gauche + fond tinté
    chaleureux (#fdeeec), sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande rouge #e2231a, liens blancs, ligne d'accent jaune #ffcd00,
    mot-symbole St-Hubert en blanc (filtre knockout)
  - Couleurs St-Hubert : rouge #e2231a (marque / action / lien / loupe), jaune
    chaleureux #ffcd00 (accent), encre #1a1a1a (corps), hairline #e6e2df,
    teinte de survol chaleureuse #fdeeec, blanc #ffffff ; boutons ARRONDIS amicaux
  - Logo St-Hubert (mot-symbole rouge) référencé via
    <img src="/chrome/st-hubert/logo.svg">
  - Typo : sans-serif chaleureuse (corps / UI). On ne charge AUCUNE police
    propriétaire ; fallbacks Helvetica / Arial.
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

<div class="shb-shell">
  <!-- ── HEADER ST-HUBERT ── -->
  <div class="shb-header-wrap">
    <header class="shb-header" aria-label="St-Hubert">
      <div class="shb-header__inner">
        <!-- Gauche : logo St-Hubert (mot-symbole rouge) -->
        <div class="shb-header__brand">
          <a href="/" class="shb-header__brand-link" aria-label="Accueil : St-Hubert Design System">
            <img
              src="/chrome/st-hubert/logo.svg"
              alt="St-Hubert"
              class="shb-logo"
              width="96"
              height="24"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="shb-nav" aria-label="Navigation principale">
          <ul class="shb-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="shb-nav__item">
                <a
                  class="shb-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche St-Hubert : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="shb-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA pilule -->
        <div class="shb-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="shb-header__tools-links">
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
          class="shb-header__burger"
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

  <!-- ── BODY ST-HUBERT ── -->
  <div class="shb-body">
    <!-- Sidebar -->
    <aside class="shb-sidebar" aria-label="Navigation de la documentation">
      <nav class="shb-side-nav" aria-label="Sommaire">
        <ul class="shb-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="shb-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="shb-side-divider" role="separator"></li>

          <li class="shb-side-heading">
            <a
              class="shb-side-link shb-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="shb-side-group" open={isGroupOpen(group.items)}>
                <summary class="shb-side-group__summary">
                  <ChevronDown class="shb-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="shb-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="shb-side-link shb-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="shb-side-divider" role="separator"></li>

          <li class="shb-side-heading">
            <a
              class="shb-side-link shb-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="shb-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="shb-side-group__summary">
                  <ChevronDown class="shb-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="shb-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="shb-side-link shb-side-link--sub"
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
      <div class="shb-sidebar-footer">
        <span class="shb-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="shb-sidebar-github"
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
    <div class="shb-content">
      <nav class="shb-breadcrumb" aria-label="Breadcrumb">
        <ol class="shb-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="shb-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="shb-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER ST-HUBERT ── -->
  <footer class="shb-footer" aria-label="Pied de page St-Hubert">
    <div class="shb-footer__inner">
      <nav class="shb-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="shb-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/st-hubert/logo.svg"
        alt="St-Hubert"
        class="shb-footer__logo"
        width="96"
        height="24"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables St-Hubert ── */
  .shb-shell {
    --shb-red: #e2231a; /* rouge St-Hubert : marque / action / lien / loupe */
    --shb-red-hover: #c41d15; /* rouge assombri : hover */
    --shb-yellow: #ffcd00; /* jaune chaleureux : accent */
    --shb-ink: #1a1a1a; /* encre : texte primaire */
    --shb-grey: #6b6660; /* gris secondaire chaleureux */
    --shb-grey-muted: #9a948c; /* gris clair chaleureux */
    --shb-subtle: #faf8f6; /* surface subtile / hover doux */
    --shb-tint: #fdeeec; /* teinte rouge chaleureuse : hover / actif */
    --shb-border: #e6e2df; /* hairline chaleureux */
    --shb-white: #fff;
    --shb-sidebar-width: 17rem;
    --shb-radius: 8px; /* contrôles arrondis amicaux */
    --shb-radius-pill: 999px; /* pilules / CTA */
    /* Typo St-Hubert : sans-serif chaleureuse ; aucune police propriétaire chargée. */
    --shb-font-body: helvetica, arial, sans-serif;
    font-family: var(--shb-font-body);
    background: var(--shb-white);
    color: var(--shb-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header St-Hubert ── */
  .shb-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .shb-header {
    background: var(--shb-white);
    border-bottom: 1px solid var(--shb-border);
  }

  .shb-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .shb-header__brand {
    flex: 0 0 auto;
  }

  .shb-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .shb-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo St-Hubert (mot-symbole rouge, ratio préservé, ~24px de hauteur). */
  .shb-logo {
    display: block;
    width: auto;
    height: 24px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .shb-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .shb-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré arrondi, hover teinte/rouge. */
  .shb-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--shb-radius);
    color: var(--shb-red);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .shb-search-btn:hover,
  .shb-search-btn:focus-visible {
    background: var(--shb-tint);
    border-color: var(--shb-red);
    color: var(--shb-red);
    outline: none;
  }

  .shb-nav__item {
    flex: 0 0 auto;
  }

  .shb-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--shb-ink);
    display: inline-flex;
    font-family: var(--shb-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .shb-nav__link:hover,
  .shb-nav__link:focus-visible {
    color: var(--shb-red);
    outline: none;
  }

  /* Onglet actif : souligné rouge St-Hubert (barre d'accent chaleureuse). */
  .shb-nav__link[aria-current="page"] {
    border-bottom-color: var(--shb-red);
    color: var(--shb-ink);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .shb-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .shb-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .shb-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .shb-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--shb-border);
  }

  /* Overrides switchers dans header St-Hubert (champs clairs, bord hairline 1px). */
  .shb-header__tools-links :global(.docs-header-control) {
    background: var(--shb-white);
    border-color: var(--shb-border);
    border-radius: var(--shb-radius);
    color: var(--shb-ink);
    font-family: inherit;
  }

  .shb-header__tools-links :global(.docs-header-control:hover),
  .shb-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--shb-tint);
    border-color: var(--shb-red);
    color: var(--shb-red);
    box-shadow: none;
  }

  /* CTA arrondi rouge (signature chaleureuse et conviviale St-Hubert). */
  .shb-cta {
    align-items: center;
    background: var(--shb-red);
    border: 1px solid var(--shb-red);
    border-radius: var(--shb-radius-pill);
    color: var(--shb-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--shb-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .shb-cta:hover,
  .shb-cta:focus-visible {
    background: var(--shb-red-hover);
    border-color: var(--shb-red-hover);
    color: var(--shb-white);
    outline: none;
  }

  /* Burger mobile */
  .shb-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--shb-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body St-Hubert ── */
  .shb-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--shb-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar St-Hubert ── */
  .shb-sidebar {
    background: var(--shb-white);
    border-right: 1px solid var(--shb-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .shb-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .shb-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--shb-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .shb-version-badge {
    background: var(--shb-tint);
    border: 1px solid var(--shb-border);
    border-radius: var(--shb-radius);
    color: var(--shb-red);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .shb-sidebar-github {
    align-items: center;
    color: var(--shb-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .shb-sidebar-github:hover,
  .shb-sidebar-github:focus-visible {
    color: var(--shb-red);
  }

  .shb-side-list,
  .shb-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .shb-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--shb-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .shb-side-link:hover,
  .shb-side-link:focus-visible {
    background: var(--shb-tint);
    color: var(--shb-red);
    text-decoration: none;
  }

  .shb-side-link[aria-current="page"] {
    background: var(--shb-tint);
    border-left-color: var(--shb-red);
    color: var(--shb-red);
    font-weight: 700;
    text-decoration: none;
  }

  .shb-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .shb-side-divider {
    border-top: 1px solid var(--shb-border);
    margin: 0.5rem 0;
  }

  .shb-side-group {
    display: block;
  }

  .shb-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--shb-grey);
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

  .shb-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .shb-side-group__summary:hover,
  .shb-side-group__summary:focus-visible {
    background: var(--shb-subtle);
    outline: none;
  }

  .shb-side-group :global(.shb-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .shb-side-group:not([open]) :global(.shb-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .shb-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .shb-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .shb-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .shb-breadcrumb__item {
    align-items: center;
    color: var(--shb-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .shb-breadcrumb__item + .shb-breadcrumb__item::before {
    color: var(--shb-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .shb-breadcrumb__link {
    color: var(--shb-ink);
    text-decoration: none;
  }

  .shb-breadcrumb__link:hover {
    color: var(--shb-red);
    text-decoration: underline;
  }

  .shb-breadcrumb__item span[aria-current="page"] {
    color: var(--shb-ink);
    font-weight: 600;
  }

  /* ── Footer St-Hubert ── */
  .shb-footer {
    background: var(--shb-red);
    border-top: 3px solid var(--shb-yellow);
    margin-top: auto;
  }

  .shb-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .shb-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .shb-footer__link {
    color: var(--shb-white);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .shb-footer__link:hover {
    color: var(--shb-yellow);
    text-decoration: underline;
  }

  /* Mot-symbole St-Hubert en blanc (filtre knockout sur la bande rouge). */
  .shb-footer__logo {
    display: block;
    width: auto;
    height: 24px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .shb-body {
      grid-template-columns: 1fr;
    }

    .shb-sidebar {
      display: none;
    }

    .shb-nav {
      display: none;
    }

    .shb-header__tools {
      display: none;
    }

    .shb-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .shb-nav__link,
    .shb-cta,
    .shb-search-btn,
    .shb-side-link,
    .shb-side-group :global(.shb-side-group__icon) {
      transition: none;
    }
  }
</style>

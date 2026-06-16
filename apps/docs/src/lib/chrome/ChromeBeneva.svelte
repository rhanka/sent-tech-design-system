<!--
  Chrome documentaire Beneva (beneva.ca — le plus grand assureur mutualiste au
  Canada, né au Québec). Forme fidèle à l'en-tête réel de beneva.ca :
  - Header : bandeau BLANC propre et moderne, hairline fin (#e1e7e3) ; logo
    officiel Beneva (mot-symbole « beneva » vert) à gauche, ~24px de haut ; nav
    horizontale au centre + loupe de recherche ; CTA pilule vert à droite — le
    ressenti épuré d'un assureur de confiance
  - Onglet de nav actif : SOULIGNÉ vert Beneva #00a651 (barre d'accent)
  - Loupe de recherche : icône verte #00a651
  - Barre latérale gauche : item actif accent vert à gauche + fond tinté
    vert très clair (#eaf6ef), sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande vert profond #0a3d22, liens blancs, ligne d'accent vert
    #00a651, mot-symbole « beneva » blanc/knockout (filtré en blanc)
  - Couleurs de marque Beneva : vert primaire #00a651 (nav active, loupe, hovers,
    soulignés d'accent), vert profond #0a3d22 (emphase / footer), encre #1a1a1a
    (corps), hairline #e1e7e3, teinte de hover vert clair #eaf6ef, blanc #ffffff ;
    radius doux (md 4px, pilules 999px)
  - Logo officiel Beneva (mot-symbole vert vectoriel) référencé via
    <img src="/chrome/beneva/logo.svg"> ; knockout blanc dans le footer (filtre)
  - Typo : grotesk humaniste (corps / UI). On ne charge AUCUNE police
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
    buildTopNav,
    resolveBreadcrumb,
    type ComponentNavItem
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
    mobileMenuOpen,
    onMobileMenuToggle,
  }: Props = $props();

  const topNavItems = $derived(buildTopNav(locale.value));
  const foundationNavItems = $derived(buildFoundationNav(locale.value));
  const componentGroups = $derived(buildComponentNavGroups(locale.value));
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
</script>

<div class="ben-shell">
  <!-- ── HEADER BENEVA ── -->
  <div class="ben-header-wrap">
    <header class="ben-header" aria-label="Beneva">
      <div class="ben-header__inner">
        <!-- Gauche : logo officiel Beneva (mot-symbole vert) -->
        <div class="ben-header__brand">
          <a href="/" class="ben-header__brand-link" aria-label="Accueil : Beneva Design System">
            <img
              src="/chrome/beneva/logo.svg"
              alt="Beneva"
              class="ben-logo"
              width="96"
              height="24"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="ben-nav" aria-label="Navigation principale">
          <ul class="ben-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="ben-nav__item">
                <a
                  class="ben-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Beneva : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="ben-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA pilule -->
        <div class="ben-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="ben-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA pilule vert : signature Beneva -->
          <a class="ben-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="ben-header__burger"
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

  <!-- ── BODY BENEVA ── -->
  <div class="ben-body">
    <!-- Sidebar -->
    <aside class="ben-sidebar" aria-label="Navigation de la documentation">
      <nav class="ben-side-nav" aria-label="Sommaire">
        <ul class="ben-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="ben-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="ben-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="ben-side-group" open={isGroupOpen(group.items)}>
                <summary class="ben-side-group__summary">
                  <ChevronDown class="ben-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="ben-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="ben-side-link ben-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
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
      <div class="ben-sidebar-footer">
        <span class="ben-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="ben-sidebar-github"
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
    <div class="ben-content">
      <nav class="ben-breadcrumb" aria-label="Breadcrumb">
        <ol class="ben-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="ben-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="ben-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER BENEVA ── -->
  <footer class="ben-footer" aria-label="Pied de page Beneva">
    <div class="ben-footer__inner">
      <nav class="ben-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="ben-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/beneva/logo.svg"
        alt="Beneva"
        class="ben-footer__logo"
        width="96"
        height="24"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Beneva (couleurs de marque beneva.ca) ── */
  .ben-shell {
    --ben-green: #00a651; /* vert primaire : marque / action / nav active / loupe */
    --ben-green-hover: #008a43; /* vert assombri : hover */
    --ben-green-deep: #0a3d22; /* vert profond : emphase / footer */
    --ben-ink: #1a1a1a; /* encre : texte primaire */
    --ben-grey: #6b7670; /* gris secondaire (teinté vert) */
    --ben-grey-muted: #9aa5a0; /* gris clair */
    --ben-subtle: #eaf6ef; /* teinte de hover vert clair */
    --ben-subtle-2: #dceee4; /* hover secondaire */
    --ben-border: #e1e7e3; /* hairline fin */
    --ben-white: #fff;
    --ben-sidebar-width: 17rem;
    --ben-radius: 4px; /* contrôles arrondis doux */
    --ben-radius-pill: 999px; /* pilules / CTA */
    /* Typo Beneva : grotesk humaniste (corps) ; aucune police propriétaire chargée. */
    --ben-font-body: helvetica, arial, sans-serif;
    font-family: var(--ben-font-body);
    background: var(--ben-white);
    color: var(--ben-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Beneva ── */
  .ben-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .ben-header {
    background: var(--ben-white);
    border-bottom: 1px solid var(--ben-border);
  }

  .ben-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .ben-header__brand {
    flex: 0 0 auto;
  }

  .ben-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .ben-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel Beneva (mot-symbole vert, ratio préservé, ~24px de haut). */
  .ben-logo {
    display: block;
    width: auto;
    height: 24px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .ben-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .ben-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré doux, icône verte Beneva. */
  .ben-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--ben-radius);
    color: var(--ben-green);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .ben-search-btn:hover,
  .ben-search-btn:focus-visible {
    background: var(--ben-subtle);
    border-color: var(--ben-green);
    color: var(--ben-green-hover);
    outline: none;
  }

  .ben-nav__item {
    flex: 0 0 auto;
  }

  .ben-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--ben-ink);
    display: inline-flex;
    font-family: var(--ben-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .ben-nav__link:hover,
  .ben-nav__link:focus-visible {
    color: var(--ben-green);
    outline: none;
  }

  /* Onglet actif : souligné vert Beneva (barre d'accent). */
  .ben-nav__link[aria-current="page"] {
    border-bottom-color: var(--ben-green);
    color: var(--ben-green-deep);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .ben-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .ben-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .ben-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .ben-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--ben-border);
  }

  /* Overrides switchers dans header Beneva (champs clairs, bord hairline 1px). */
  .ben-header__tools-links :global(.docs-header-control) {
    background: var(--ben-white);
    border-color: var(--ben-border);
    border-radius: var(--ben-radius);
    color: var(--ben-ink);
    font-family: inherit;
  }

  .ben-header__tools-links :global(.docs-header-control:hover),
  .ben-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--ben-subtle);
    border-color: var(--ben-green);
    color: var(--ben-green);
    box-shadow: none;
  }

  /* CTA pilule vert (signature Beneva). */
  .ben-cta {
    align-items: center;
    background: var(--ben-green);
    border: 1px solid var(--ben-green);
    border-radius: var(--ben-radius-pill);
    color: var(--ben-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--ben-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .ben-cta:hover,
  .ben-cta:focus-visible {
    background: var(--ben-green-hover);
    border-color: var(--ben-green-hover);
    color: var(--ben-white);
    outline: none;
  }

  /* Burger mobile */
  .ben-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--ben-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Beneva ── */
  .ben-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--ben-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Beneva ── */
  .ben-sidebar {
    background: var(--ben-white);
    border-right: 1px solid var(--ben-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .ben-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .ben-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--ben-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .ben-version-badge {
    background: var(--ben-subtle);
    border: 1px solid var(--ben-border);
    border-radius: var(--ben-radius);
    color: var(--ben-green);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .ben-sidebar-github {
    align-items: center;
    color: var(--ben-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .ben-sidebar-github:hover,
  .ben-sidebar-github:focus-visible {
    color: var(--ben-green);
  }

  .ben-side-list,
  .ben-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ben-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--ben-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .ben-side-link:hover,
  .ben-side-link:focus-visible {
    background: var(--ben-subtle);
    color: var(--ben-green);
    text-decoration: none;
  }

  .ben-side-link[aria-current="page"] {
    background: var(--ben-subtle);
    border-left-color: var(--ben-green);
    color: var(--ben-green-deep);
    font-weight: 700;
    text-decoration: none;
  }

  .ben-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .ben-side-divider {
    border-top: 1px solid var(--ben-border);
    margin: 0.5rem 0;
  }

  .ben-side-group {
    display: block;
  }

  .ben-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--ben-grey);
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

  .ben-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .ben-side-group__summary:hover,
  .ben-side-group__summary:focus-visible {
    background: var(--ben-subtle);
    outline: none;
  }

  .ben-side-group :global(.ben-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .ben-side-group:not([open]) :global(.ben-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .ben-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .ben-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .ben-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ben-breadcrumb__item {
    align-items: center;
    color: var(--ben-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .ben-breadcrumb__item + .ben-breadcrumb__item::before {
    color: var(--ben-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .ben-breadcrumb__link {
    color: var(--ben-ink);
    text-decoration: none;
  }

  .ben-breadcrumb__link:hover {
    color: var(--ben-green);
    text-decoration: underline;
  }

  .ben-breadcrumb__item span[aria-current="page"] {
    color: var(--ben-ink);
    font-weight: 600;
  }

  /* ── Footer Beneva ── */
  .ben-footer {
    background: var(--ben-green-deep);
    border-top: 3px solid var(--ben-green);
    margin-top: auto;
  }

  .ben-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .ben-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .ben-footer__link {
    color: var(--ben-white);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .ben-footer__link:hover {
    color: var(--ben-green);
    text-decoration: underline;
  }

  /* Mot-symbole Beneva en knockout blanc dans le footer (filtré en blanc). */
  .ben-footer__logo {
    display: block;
    width: auto;
    height: 24px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .ben-body {
      grid-template-columns: 1fr;
    }

    .ben-sidebar {
      display: none;
    }

    .ben-nav {
      display: none;
    }

    .ben-header__tools {
      display: none;
    }

    .ben-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .ben-nav__link,
    .ben-cta,
    .ben-search-btn,
    .ben-side-link,
    .ben-side-group :global(.ben-side-group__icon) {
      transition: none;
    }
  }
</style>

<!--
  Chrome documentaire Cogeco (cogeco.com — groupe québécois de télécommunications
  et de médias). Forme fidèle à l'en-tête corporatif réel de cogeco.com :
  - Header : bandeau BLANC, hairline fine (#e2e4ea), corporate moderne ; logo
    officiel Cogeco (marine) à gauche, ~26px de haut ; nav horizontale au centre
    + loupe de recherche compacte (icône marine #001e62) ; CTA pilule corail à
    droite
  - Onglet de nav actif : SOULIGNÉ corail #ff6d70 (l'indicateur d'accent Cogeco)
  - Barre latérale gauche : item actif barre marine #001e62 à gauche + fond tinté
    bleuté (#eef1f8), sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande MARINE profonde #001e62, liens blancs, trait d'accent corail
    #ff6d70, logo Cogeco en blanc/knockout (filtre vers blanc)
  - Couleurs de marque Cogeco : marine profonde #001e62 (primaire : nav active,
    loupe, hovers), corail #ff6d70 (accent : soulignement/indicateur actif),
    encre #1a1a1a (corps), hairline #e2e4ea, teinte de survol #eef1f8, blanc #fff
  - Logo officiel Cogeco référencé via <img src="/chrome/cogeco/logo.svg">
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

<div class="cgo-shell">
  <!-- ── HEADER COGECO ── -->
  <div class="cgo-header-wrap">
    <header class="cgo-header" aria-label="Cogeco">
      <div class="cgo-header__inner">
        <!-- Gauche : logo officiel Cogeco (marine) -->
        <div class="cgo-header__brand">
          <a href="/" class="cgo-header__brand-link" aria-label="Accueil : Cogeco Design System">
            <img
              src="/chrome/cogeco/logo.svg"
              alt="Cogeco"
              class="cgo-logo"
              width="118"
              height="26"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="cgo-nav" aria-label="Navigation principale">
          <ul class="cgo-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="cgo-nav__item">
                <a
                  class="cgo-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Cogeco : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="cgo-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA pilule -->
        <div class="cgo-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="cgo-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA pilule corail : signature d'accent Cogeco -->
          <a class="cgo-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="cgo-header__burger"
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

  <!-- ── BODY COGECO ── -->
  <div class="cgo-body">
    <!-- Sidebar -->
    <aside class="cgo-sidebar" aria-label="Navigation de la documentation">
      <nav class="cgo-side-nav" aria-label="Sommaire">
        <ul class="cgo-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="cgo-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="cgo-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="cgo-side-group" open={isGroupOpen(group.items)}>
                <summary class="cgo-side-group__summary">
                  <ChevronDown class="cgo-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="cgo-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="cgo-side-link cgo-side-link--sub"
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
      <div class="cgo-sidebar-footer">
        <span class="cgo-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="cgo-sidebar-github"
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
    <div class="cgo-content">
      <nav class="cgo-breadcrumb" aria-label="Breadcrumb">
        <ol class="cgo-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="cgo-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="cgo-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER COGECO ── -->
  <footer class="cgo-footer" aria-label="Pied de page Cogeco">
    <div class="cgo-footer__inner">
      <nav class="cgo-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="cgo-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/cogeco/logo.svg"
        alt="Cogeco"
        class="cgo-footer__logo"
        width="109"
        height="24"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Cogeco (marque corporate cogeco.com) ── */
  .cgo-shell {
    --cgo-navy: #001e62; /* marine profonde : primaire (nav active, loupe, hovers) */
    --cgo-navy-hover: #00164a; /* marine assombrie : hover */
    --cgo-coral: #ff6d70; /* corail : accent (soulignement / indicateur actif) */
    --cgo-coral-hover: #f0585b; /* corail assombri : hover CTA */
    --cgo-ink: #1a1a1a; /* encre : texte primaire */
    --cgo-grey: #5b6170; /* gris secondaire */
    --cgo-grey-muted: #8a8f9c; /* gris clair */
    --cgo-tint: #eef1f8; /* teinte de survol bleutée */
    --cgo-subtle: #f6f7fb; /* surface subtile */
    --cgo-border: #e2e4ea; /* hairline fine */
    --cgo-white: #fff;
    --cgo-sidebar-width: 17rem;
    --cgo-radius: 4px; /* contrôles arrondis doux */
    --cgo-radius-pill: 999px; /* pilules / CTA */
    /* Typo Cogeco : grotesk corporate ; aucune police propriétaire chargée. */
    --cgo-font-body: 'Helvetica Neue', helvetica, arial, sans-serif;
    font-family: var(--cgo-font-body);
    background: var(--cgo-white);
    color: var(--cgo-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Cogeco ── */
  .cgo-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .cgo-header {
    background: var(--cgo-white);
    border-bottom: 1px solid var(--cgo-border);
  }

  .cgo-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .cgo-header__brand {
    flex: 0 0 auto;
  }

  .cgo-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .cgo-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel Cogeco (marine, ratio préservé, ~26px de haut). */
  .cgo-logo {
    display: block;
    width: auto;
    height: 26px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .cgo-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .cgo-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré doux, icône marine, hover bleuté. */
  .cgo-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--cgo-radius);
    color: var(--cgo-navy);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .cgo-search-btn:hover,
  .cgo-search-btn:focus-visible {
    background: var(--cgo-tint);
    border-color: var(--cgo-navy);
    color: var(--cgo-navy);
    outline: none;
  }

  .cgo-nav__item {
    flex: 0 0 auto;
  }

  .cgo-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--cgo-ink);
    display: inline-flex;
    font-family: var(--cgo-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .cgo-nav__link:hover,
  .cgo-nav__link:focus-visible {
    color: var(--cgo-navy);
    outline: none;
  }

  /* Onglet actif : souligné corail (l'indicateur d'accent Cogeco). */
  .cgo-nav__link[aria-current="page"] {
    border-bottom-color: var(--cgo-coral);
    color: var(--cgo-navy);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .cgo-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .cgo-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .cgo-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .cgo-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--cgo-border);
  }

  /* Overrides switchers dans header Cogeco (champs clairs, bord hairline 1px). */
  .cgo-header__tools-links :global(.docs-header-control) {
    background: var(--cgo-white);
    border-color: var(--cgo-border);
    border-radius: var(--cgo-radius);
    color: var(--cgo-ink);
    font-family: inherit;
  }

  .cgo-header__tools-links :global(.docs-header-control:hover),
  .cgo-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--cgo-tint);
    border-color: var(--cgo-navy);
    color: var(--cgo-navy);
    box-shadow: none;
  }

  /* CTA pilule corail (signature d'accent Cogeco). */
  .cgo-cta {
    align-items: center;
    background: var(--cgo-coral);
    border: 1px solid var(--cgo-coral);
    border-radius: var(--cgo-radius-pill);
    color: var(--cgo-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--cgo-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .cgo-cta:hover,
  .cgo-cta:focus-visible {
    background: var(--cgo-coral-hover);
    border-color: var(--cgo-coral-hover);
    color: var(--cgo-white);
    outline: none;
  }

  /* Burger mobile */
  .cgo-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--cgo-navy);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Cogeco ── */
  .cgo-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--cgo-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Cogeco ── */
  .cgo-sidebar {
    background: var(--cgo-white);
    border-right: 1px solid var(--cgo-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .cgo-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .cgo-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--cgo-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .cgo-version-badge {
    background: var(--cgo-subtle);
    border: 1px solid var(--cgo-border);
    border-radius: var(--cgo-radius);
    color: var(--cgo-navy);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .cgo-sidebar-github {
    align-items: center;
    color: var(--cgo-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .cgo-sidebar-github:hover,
  .cgo-sidebar-github:focus-visible {
    color: var(--cgo-navy);
  }

  .cgo-side-list,
  .cgo-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cgo-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--cgo-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .cgo-side-link:hover,
  .cgo-side-link:focus-visible {
    background: var(--cgo-tint);
    color: var(--cgo-navy);
    text-decoration: none;
  }

  .cgo-side-link[aria-current="page"] {
    background: var(--cgo-tint);
    border-left-color: var(--cgo-navy);
    color: var(--cgo-navy);
    font-weight: 700;
    text-decoration: none;
  }

  .cgo-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .cgo-side-divider {
    border-top: 1px solid var(--cgo-border);
    margin: 0.5rem 0;
  }

  .cgo-side-group {
    display: block;
  }

  .cgo-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--cgo-grey);
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

  .cgo-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .cgo-side-group__summary:hover,
  .cgo-side-group__summary:focus-visible {
    background: var(--cgo-tint);
    outline: none;
  }

  .cgo-side-group :global(.cgo-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .cgo-side-group:not([open]) :global(.cgo-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .cgo-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .cgo-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .cgo-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cgo-breadcrumb__item {
    align-items: center;
    color: var(--cgo-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .cgo-breadcrumb__item + .cgo-breadcrumb__item::before {
    color: var(--cgo-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .cgo-breadcrumb__link {
    color: var(--cgo-navy);
    text-decoration: none;
  }

  .cgo-breadcrumb__link:hover {
    color: var(--cgo-navy-hover);
    text-decoration: underline;
  }

  .cgo-breadcrumb__item span[aria-current="page"] {
    color: var(--cgo-ink);
    font-weight: 600;
  }

  /* ── Footer Cogeco ── */
  .cgo-footer {
    background: var(--cgo-navy);
    border-top: 3px solid var(--cgo-coral);
    margin-top: auto;
  }

  .cgo-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .cgo-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .cgo-footer__link {
    color: var(--cgo-white);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .cgo-footer__link:hover {
    color: var(--cgo-coral);
    text-decoration: underline;
  }

  /* Logo Cogeco en blanc/knockout dans le footer marine (filtre vers blanc). */
  .cgo-footer__logo {
    display: block;
    width: auto;
    height: 24px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .cgo-body {
      grid-template-columns: 1fr;
    }

    .cgo-sidebar {
      display: none;
    }

    .cgo-nav {
      display: none;
    }

    .cgo-header__tools {
      display: none;
    }

    .cgo-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .cgo-nav__link,
    .cgo-cta,
    .cgo-search-btn,
    .cgo-side-link,
    .cgo-side-group :global(.cgo-side-group__icon) {
      transition: none;
    }
  }
</style>

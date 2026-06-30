<!--
  Chrome documentaire Dialogue (dialogue.co) — santé virtuelle, Montréal.
  Forme fidèle à l'en-tête réel de dialogue.co (santé « chaleureuse ») :
  - Header : bandeau BLANC, wordmark officiel Dialogue à gauche, nav horizontale
    centrée + loupe de recherche compacte (bouton, pas de champ), CTA pilule
    CORAIL à droite
  - Onglet de nav actif : SOULIGNÉ corail
  - Barre latérale gauche : item actif accent corail à gauche + fond crème tinté,
    sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande lavande très claire avec liens + wordmark Dialogue
  - Couleurs mesurées : corail #dd7146 (primaire), profond #c85a30 (hover),
    lavande #534f70 (secondaire), crème #ffefe2 (surface chaude), lavande subtile
    #f9f7fa, encre #212120, bleu vif #1fa5ff (focus), danger #d64545 ;
    surfaces blanches, bord #e7e2ea ; radius pilule (CTA) / md 5px
  - Wordmark officiel Dialogue (vecteur dialogue.co, fill encre #212120)
    référencé via <img src="/chrome/dialogue/logo.svg"> (ratio 319:62.3 préservé)
  - Typo : 'Roboto' (corps, chargée via Google Fonts) ; affichage serif 'Poynter'
    (propriétaire → fallback Georgia)
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
    href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
  />
</svelte:head>

<div class="dlg-shell">
  <!-- ── HEADER DIALOGUE ── -->
  <div class="dlg-header-wrap">
    <header class="dlg-header" aria-label="Dialogue">
      <div class="dlg-header__inner">
        <!-- Gauche : wordmark officiel Dialogue -->
        <div class="dlg-header__brand">
          <a href="/" class="dlg-header__brand-link" aria-label="Accueil : Dialogue Design System">
            <img
              src="/chrome/dialogue/logo.svg"
              alt="Dialogue"
              class="dlg-logo"
              width="143"
              height="28"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="dlg-nav" aria-label="Navigation principale">
          <ul class="dlg-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="dlg-nav__item">
                <a
                  class="dlg-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Dialogue : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="dlg-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA corail -->
        <div class="dlg-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="dlg-header__tools-links">
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
          class="dlg-header__burger"
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

  <!-- ── BODY DIALOGUE ── -->
  <div class="dlg-body">
    <!-- Sidebar -->
    <aside class="dlg-sidebar" aria-label="Navigation de la documentation">
      <nav class="dlg-side-nav" aria-label="Sommaire">
        <ul class="dlg-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="dlg-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="dlg-side-divider" role="separator"></li>

          <li class="dlg-side-heading">
            <a
              class="dlg-side-link dlg-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="dlg-side-group" open={isGroupOpen(group.items)}>
                <summary class="dlg-side-group__summary">
                  <ChevronDown class="dlg-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="dlg-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="dlg-side-link dlg-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="dlg-side-divider" role="separator"></li>

          <li class="dlg-side-heading">
            <a
              class="dlg-side-link dlg-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="dlg-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="dlg-side-group__summary">
                  <ChevronDown class="dlg-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="dlg-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="dlg-side-link dlg-side-link--sub"
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
      <div class="dlg-sidebar-footer">
        <span class="dlg-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="dlg-sidebar-github"
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
    <div class="dlg-content">
      <nav class="dlg-breadcrumb" aria-label="Breadcrumb">
        <ol class="dlg-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="dlg-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="dlg-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER DIALOGUE ── -->
  <footer class="dlg-footer" aria-label="Pied de page Dialogue">
    <div class="dlg-footer__inner">
      <nav class="dlg-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="dlg-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/dialogue/logo.svg"
        alt="Dialogue"
        class="dlg-footer__logo"
        width="143"
        height="28"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Dialogue ── */
  .dlg-shell {
    --dlg-coral: #dd7146; /* corail primaire */
    --dlg-coral-deep: #c85a30; /* corail profond / hover */
    --dlg-lavender: #534f70; /* lavande secondaire */
    --dlg-cream: #ffefe2; /* crème chaude (surface) */
    --dlg-subtle: #f9f7fa; /* lavande subtile (surface secondaire) */
    --dlg-ink: #212120; /* encre */
    --dlg-grey: #5d5b6a; /* gris texte secondaire (lavande grisée) */
    --dlg-blue: #1fa5ff; /* bleu vif (focus) */
    --dlg-danger: #d64545; /* danger (à confirmer) */
    --dlg-border: #e7e2ea; /* bord */
    --dlg-white: #fff;
    --dlg-sidebar-width: 17rem;
    --dlg-radius: 5px; /* conteneurs md 5px */
    --dlg-radius-pill: 999px; /* pilules / CTA */
    font-family: 'Roboto', system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--dlg-white);
    color: var(--dlg-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Dialogue ── */
  .dlg-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .dlg-header {
    background: var(--dlg-white);
    border-bottom: 1px solid var(--dlg-border);
  }

  .dlg-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .dlg-header__brand {
    flex: 0 0 auto;
  }

  .dlg-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .dlg-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Wordmark officiel Dialogue (ratio 319:62.3 préservé, hauteur ~28px). */
  .dlg-logo {
    display: block;
    width: auto;
    height: 28px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .dlg-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .dlg-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : pilule chaude, hover crème/corail. */
  .dlg-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--dlg-radius-pill);
    color: var(--dlg-ink);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .dlg-search-btn:hover,
  .dlg-search-btn:focus-visible {
    background: var(--dlg-cream);
    border-color: var(--dlg-coral);
    color: var(--dlg-coral-deep);
    outline: none;
  }

  .dlg-search-btn:focus-visible {
    outline: 2px solid var(--dlg-blue);
    outline-offset: 2px;
  }

  .dlg-nav__item {
    flex: 0 0 auto;
  }

  .dlg-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--dlg-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .dlg-nav__link:hover,
  .dlg-nav__link:focus-visible {
    color: var(--dlg-coral);
    outline: none;
  }

  .dlg-nav__link[aria-current="page"] {
    border-bottom-color: var(--dlg-coral);
    color: var(--dlg-coral-deep);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .dlg-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .dlg-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Dialogue (champs clairs, bord doux, radius 5px). */
  .dlg-header__tools-links :global(.docs-header-control) {
    background: var(--dlg-white);
    border-color: var(--dlg-border);
    border-radius: var(--dlg-radius);
    color: var(--dlg-ink);
    font-family: inherit;
  }

  .dlg-header__tools-links :global(.docs-header-control:hover),
  .dlg-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--dlg-cream);
    border-color: var(--dlg-coral);
    color: var(--dlg-coral-deep);
    box-shadow: none;
  }

  /* CTA pilule corail : signature Dialogue. */
  .dlg-cta {
    align-items: center;
    background: var(--dlg-coral);
    border: 1px solid var(--dlg-coral);
    border-radius: var(--dlg-radius-pill);
    color: var(--dlg-white);
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

  .dlg-cta:hover,
  .dlg-cta:focus-visible {
    background: var(--dlg-coral-deep);
    border-color: var(--dlg-coral-deep);
    color: var(--dlg-white);
    outline: none;
  }

  /* Burger mobile */
  .dlg-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--dlg-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Dialogue ── */
  .dlg-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--dlg-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Dialogue ── */
  .dlg-sidebar {
    background: var(--dlg-white);
    border-right: 1px solid var(--dlg-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .dlg-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .dlg-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--dlg-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .dlg-version-badge {
    background: var(--dlg-cream);
    border: 1px solid var(--dlg-border);
    border-radius: var(--dlg-radius);
    color: var(--dlg-coral-deep);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .dlg-sidebar-github {
    align-items: center;
    color: var(--dlg-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .dlg-sidebar-github:hover,
  .dlg-sidebar-github:focus-visible {
    color: var(--dlg-coral);
  }

  .dlg-side-list,
  .dlg-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .dlg-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--dlg-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .dlg-side-link:hover,
  .dlg-side-link:focus-visible {
    background: var(--dlg-subtle);
    color: var(--dlg-coral);
    text-decoration: none;
  }

  .dlg-side-link[aria-current="page"] {
    background: var(--dlg-cream);
    border-left-color: var(--dlg-coral);
    color: var(--dlg-coral-deep);
    font-weight: 700;
    text-decoration: none;
  }

  .dlg-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .dlg-side-divider {
    border-top: 1px solid var(--dlg-border);
    margin: 0.5rem 0;
  }

  .dlg-side-group {
    display: block;
  }

  .dlg-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--dlg-grey);
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

  .dlg-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .dlg-side-group__summary:hover,
  .dlg-side-group__summary:focus-visible {
    background: var(--dlg-subtle);
    outline: none;
  }

  .dlg-side-group :global(.dlg-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .dlg-side-group:not([open]) :global(.dlg-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .dlg-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .dlg-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .dlg-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .dlg-breadcrumb__item {
    align-items: center;
    color: var(--dlg-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .dlg-breadcrumb__item + .dlg-breadcrumb__item::before {
    color: var(--dlg-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .dlg-breadcrumb__link {
    color: var(--dlg-coral);
    text-decoration: none;
  }

  .dlg-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .dlg-breadcrumb__item span[aria-current="page"] {
    color: var(--dlg-ink);
    font-weight: 700;
  }

  /* ── Footer Dialogue ── */
  .dlg-footer {
    background: var(--dlg-subtle);
    border-top: 1px solid var(--dlg-border);
    margin-top: auto;
  }

  .dlg-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .dlg-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .dlg-footer__link {
    color: var(--dlg-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .dlg-footer__link:hover {
    color: var(--dlg-coral);
    text-decoration: underline;
  }

  .dlg-footer__logo {
    display: block;
    width: auto;
    height: 26px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .dlg-body {
      grid-template-columns: 1fr;
    }

    .dlg-sidebar {
      display: none;
    }

    .dlg-nav {
      display: none;
    }

    .dlg-header__tools {
      display: none;
    }

    .dlg-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .dlg-nav__link,
    .dlg-cta,
    .dlg-search-btn,
    .dlg-side-link,
    .dlg-side-group :global(.dlg-side-group__icon) {
      transition: none;
    }
  }
</style>

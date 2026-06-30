<!--
  Chrome documentaire Cohere (cohere.com — la plateforme LLM entreprise).
  Forme fidèle à l'en-tête de cohere.com : clair, chaleureux, doucement arrondi.
  - Header : bandeau CRÈME Alabaster #fafafa, logo OFFICIEL Cohere (wordmark
    Pentagram : logotype vert conifère + marque verte/orchidée/corail) à gauche,
    nav horizontale au centre (casse normale), recherche corail à droite
  - Coins DOUCEMENT ARRONDIS (radius 8px contrôles, 12px cartes) — signature
    Cohere ; onglet/lien actif = CORAIL #ff7759 (texte + filet bas)
  - Barre latérale : item actif liseré corail + fond corail très pâle
  - Couleurs MESURÉES sur cohere.com / palette Pentagram : crème Alabaster
    #fafafa, blanc #ffffff, beige chaud bordure #d7cfc1, noir volcanique #17171c,
    gris secondaire #616161, gris pierre #8d8d86, corail Bittersweet #ff7759,
    corail/rouille #ca492d, bleu acrylique focus #4c6ee6, vert conifère #39594d
  - Logo OFFICIEL Cohere (vecteur, wordmark) via <img src="/chrome/cohere/logo.svg">
  - Typo : familles Cohere propriétaires (CohereText / CohereVariable)
    indisponibles → repli système (noms seulement, aucune police réseau chargée)
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

<div class="cohere-shell">
  <!-- ── HEADER COHERE ── -->
  <div class="cohere-header-wrap">
    <header class="cohere-header" aria-label="Cohere">
      <div class="cohere-header__inner">
        <!-- Gauche : logo officiel Cohere -->
        <div class="cohere-header__brand">
          <a href="/" class="cohere-header__brand-link" aria-label="Accueil : Cohere Design System">
            <img
              src="/chrome/cohere/logo.svg"
              alt="Cohere"
              class="cohere-logo"
              width="150"
              height="25"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="cohere-nav" aria-label="Navigation principale">
          <ul class="cohere-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="cohere-nav__item">
                <a
                  class="cohere-nav__link"
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
        <div class="cohere-header__tools">
          <button
            type="button"
            class="cohere-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="cohere-header__tools-links">
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
          class="cohere-header__burger"
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

  <!-- ── BODY COHERE ── -->
  <div class="cohere-body">
    <!-- Sidebar -->
    <aside class="cohere-sidebar" aria-label="Navigation de la documentation">
      <nav class="cohere-side-nav" aria-label="Sommaire">
        <ul class="cohere-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="cohere-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="cohere-side-divider" role="separator"></li>

          <li class="cohere-side-heading">
            <a
              class="cohere-side-link cohere-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="cohere-side-group" open={isGroupOpen(group.items)}>
                <summary class="cohere-side-group__summary">
                  <ChevronDown class="cohere-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="cohere-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="cohere-side-link cohere-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="cohere-side-divider" role="separator"></li>

          <li class="cohere-side-heading">
            <a
              class="cohere-side-link cohere-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="cohere-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="cohere-side-group__summary">
                  <ChevronDown class="cohere-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="cohere-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="cohere-side-link cohere-side-link--sub"
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
      <div class="cohere-sidebar-footer">
        <span class="cohere-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="cohere-sidebar-github"
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
    <div class="cohere-content">
      <nav class="cohere-breadcrumb" aria-label="Breadcrumb">
        <ol class="cohere-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="cohere-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="cohere-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER COHERE ── -->
  <footer class="cohere-footer" aria-label="Pied de page Cohere">
    <div class="cohere-footer__inner">
      <nav class="cohere-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="cohere-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/cohere/logo.svg"
        alt="Cohere"
        class="cohere-footer__logo"
        width="138"
        height="23"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Cohere ── */
  .cohere-shell {
    --cohere-primary: #ff7759; /* corail Bittersweet — accent / action primaire */
    --cohere-primary-hover: #ca492d; /* corail/rouille foncé — hover/active */
    --cohere-primary-light: #ffe5e5; /* corail très pâle (item actif sidebar) */
    --cohere-ink: #17171c; /* noir volcanique / titres */
    --cohere-ink-2: #2e2e2e;
    --cohere-secondary: #616161; /* gris texte secondaire */
    --cohere-muted: #8d8d86; /* gris pierre chaud (muted) */
    --cohere-green: #39594d; /* vert conifère (logo / accent de marque) */
    --cohere-cream: #fafafa; /* crème Alabaster — fond de page */
    --cohere-subtle: #f2f2f2; /* gris clair surface / fond hover */
    --cohere-border: #d7cfc1; /* beige chaud bordure (signature) */
    --cohere-border-strong: #c4bba8;
    --cohere-focus: #4c6ee6; /* bleu acrylique (anneau de focus) */
    --cohere-white: #fff;
    --cohere-sidebar-width: 17rem;
    --cohere-radius: 0.5rem; /* 8px — contrôles doucement arrondis */
    --cohere-radius-lg: 0.75rem; /* 12px — cartes */
    font-family: 'CohereText', Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--cohere-white);
    color: var(--cohere-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Cohere ── */
  .cohere-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .cohere-header {
    background: var(--cohere-cream);
    border-bottom: 1px solid var(--cohere-border);
  }

  .cohere-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .cohere-header__brand {
    flex: 0 0 auto;
  }

  .cohere-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 200ms ease;
  }

  .cohere-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Cohere (ratio préservé). */
  .cohere-logo {
    display: block;
    width: auto;
    height: 25px;
  }

  /* ── Nav horizontale (centre) ── */
  .cohere-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .cohere-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cohere-nav__item {
    flex: 0 0 auto;
  }

  .cohere-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--cohere-secondary);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 200ms ease, color 200ms ease;
    white-space: nowrap;
  }

  .cohere-nav__link:hover,
  .cohere-nav__link:focus-visible {
    color: var(--cohere-ink);
    outline: none;
  }

  .cohere-nav__link[aria-current="page"] {
    border-bottom-color: var(--cohere-primary);
    color: var(--cohere-primary);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .cohere-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .cohere-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Cohere. */
  .cohere-header__tools-links :global(.docs-header-control) {
    background: var(--cohere-white);
    border-color: var(--cohere-border-strong);
    border-radius: var(--cohere-radius);
    color: var(--cohere-ink);
    font-family: inherit;
  }

  .cohere-header__tools-links :global(.docs-header-control:hover),
  .cohere-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--cohere-subtle);
    border-color: var(--cohere-primary);
    color: var(--cohere-ink);
    box-shadow: none;
  }

  /* Recherche Cohere : bouton loupe corail compact (texte volcanique, AA). */
  .cohere-search__btn {
    align-items: center;
    background: var(--cohere-primary);
    border: 1px solid var(--cohere-primary);
    border-radius: var(--cohere-radius);
    color: var(--cohere-ink);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 200ms ease, border-color 200ms ease;
  }

  .cohere-search__btn:hover,
  .cohere-search__btn:focus-visible {
    background: var(--cohere-primary-hover);
    border-color: var(--cohere-primary-hover);
    color: var(--cohere-white);
    outline: 3px solid var(--cohere-focus);
    outline-offset: 2px;
  }

  /* Burger mobile */
  .cohere-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--cohere-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Cohere ── */
  .cohere-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--cohere-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Cohere ── */
  .cohere-sidebar {
    background: var(--cohere-white);
    border-right: 1px solid var(--cohere-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .cohere-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .cohere-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--cohere-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .cohere-version-badge {
    background: var(--cohere-subtle);
    border: 1px solid var(--cohere-border);
    border-radius: var(--cohere-radius);
    color: var(--cohere-green);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .cohere-sidebar-github {
    align-items: center;
    color: var(--cohere-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 200ms ease;
  }

  .cohere-sidebar-github:hover,
  .cohere-sidebar-github:focus-visible {
    color: var(--cohere-primary);
  }

  .cohere-side-list,
  .cohere-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cohere-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--cohere-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 200ms ease, border-color 200ms ease, color 200ms ease;
  }

  .cohere-side-link:hover,
  .cohere-side-link:focus-visible {
    background: var(--cohere-subtle);
    color: var(--cohere-primary);
    text-decoration: none;
  }

  .cohere-side-link[aria-current="page"] {
    background: var(--cohere-primary-light);
    border-left-color: var(--cohere-primary);
    color: var(--cohere-ink);
    font-weight: 700;
    text-decoration: none;
  }

  .cohere-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .cohere-side-divider {
    border-top: 1px solid var(--cohere-border);
    margin: 0.5rem 0;
  }

  .cohere-side-group {
    display: block;
  }

  .cohere-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--cohere-secondary);
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
    transition: background 200ms ease;
  }

  .cohere-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .cohere-side-group__summary:hover,
  .cohere-side-group__summary:focus-visible {
    background: var(--cohere-subtle);
    outline: none;
  }

  .cohere-side-group :global(.cohere-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 200ms ease;
  }

  .cohere-side-group:not([open]) :global(.cohere-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .cohere-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .cohere-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .cohere-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cohere-breadcrumb__item {
    align-items: center;
    color: var(--cohere-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .cohere-breadcrumb__item + .cohere-breadcrumb__item::before {
    color: var(--cohere-muted);
    content: "›";
    margin: 0 0.4rem;
  }

  .cohere-breadcrumb__link {
    color: var(--cohere-primary);
    text-decoration: none;
  }

  .cohere-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .cohere-breadcrumb__item span[aria-current="page"] {
    color: var(--cohere-ink);
    font-weight: 600;
  }

  /* ── Footer Cohere ── */
  .cohere-footer {
    background: var(--cohere-cream);
    border-top: 1px solid var(--cohere-border);
    margin-top: auto;
  }

  .cohere-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .cohere-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .cohere-footer__link {
    color: var(--cohere-secondary);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .cohere-footer__link:hover {
    color: var(--cohere-primary);
    text-decoration: underline;
  }

  .cohere-footer__logo {
    display: block;
    width: auto;
    height: 23px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .cohere-body {
      grid-template-columns: 1fr;
    }

    .cohere-sidebar {
      display: none;
    }

    .cohere-nav {
      display: none;
    }

    .cohere-header__tools {
      display: none;
    }

    .cohere-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .cohere-nav__link,
    .cohere-search__btn,
    .cohere-side-link,
    .cohere-side-group :global(.cohere-side-group__icon) {
      transition: none;
    }
  }
</style>

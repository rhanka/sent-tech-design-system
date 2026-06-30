<!--
  Chrome documentaire Writer (writer.com — la plateforme d'IA générative entreprise).
  Forme fidèle à l'en-tête de writer.com : clair, net, doucement arrondi, CTA pilule.
  - Header : bandeau BLANC #ffffff, logo OFFICIEL Writer (wordmark « WRITER ») à
    gauche, nav horizontale au centre (casse normale, Poppins), recherche en
    pilule INDIGO à droite
  - Boutons PILULE (radius 9999px) — signature Writer ; lien/onglet actif =
    INDIGO #5551ff (texte + filet bas 2px)
  - Barre latérale : item actif liseré indigo + fond lavande très pâle #f3f5ff
  - Couleurs MESURÉES sur writer.com (cf. packages/theme-writer) : Writer Indigo
    #5551ff (CTA / lien), indigo foncé #2e2ae8 (hover), lavande pâle #f3f5ff /
    #e4e9ff, blanc #ffffff, gris 50 #eff0f2, bordure #e4e7ed, bordure forte
    #9aa2af, gris secondaire #5e5e5e, encre #262626, encre forte #151515
  - Logo OFFICIEL Writer (vecteur, wordmark) via <img src="/chrome/writer/logo.svg">
  - Typo : Poppins (UI / nav / boutons) — repli système ('Poppins', system-ui…),
    aucune police réseau chargée
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

<div class="writer-shell">
  <!-- ── HEADER WRITER ── -->
  <div class="writer-header-wrap">
    <header class="writer-header" aria-label="Writer">
      <div class="writer-header__inner">
        <!-- Gauche : logo officiel Writer -->
        <div class="writer-header__brand">
          <a href="/" class="writer-header__brand-link" aria-label="Accueil : Writer Design System">
            <img
              src="/chrome/writer/logo.svg"
              alt="Writer"
              class="writer-logo"
              width="88"
              height="28"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="writer-nav" aria-label="Navigation principale">
          <ul class="writer-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="writer-nav__item">
                <a
                  class="writer-nav__link"
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
        <div class="writer-header__tools">
          <button
            type="button"
            class="writer-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="writer-header__tools-links">
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
          class="writer-header__burger"
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

  <!-- ── BODY WRITER ── -->
  <div class="writer-body">
    <!-- Sidebar -->
    <aside class="writer-sidebar" aria-label="Navigation de la documentation">
      <nav class="writer-side-nav" aria-label="Sommaire">
        <ul class="writer-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="writer-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="writer-side-divider" role="separator"></li>

          <li class="writer-side-heading">
            <a
              class="writer-side-link writer-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="writer-side-group" open={isGroupOpen(group.items)}>
                <summary class="writer-side-group__summary">
                  <ChevronDown class="writer-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="writer-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="writer-side-link writer-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="writer-side-divider" role="separator"></li>

          <li class="writer-side-heading">
            <a
              class="writer-side-link writer-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="writer-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="writer-side-group__summary">
                  <ChevronDown class="writer-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="writer-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="writer-side-link writer-side-link--sub"
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
      <div class="writer-sidebar-footer">
        <span class="writer-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="writer-sidebar-github"
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
    <div class="writer-content">
      <nav class="writer-breadcrumb" aria-label="Breadcrumb">
        <ol class="writer-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="writer-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="writer-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER WRITER ── -->
  <footer class="writer-footer" aria-label="Pied de page Writer">
    <div class="writer-footer__inner">
      <nav class="writer-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="writer-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/writer/logo.svg"
        alt="Writer"
        class="writer-footer__logo"
        width="79"
        height="25"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Writer ── */
  .writer-shell {
    --writer-primary: #5551ff; /* Writer Indigo — CTA / lien / interactif */
    --writer-primary-hover: #2e2ae8; /* indigo foncé (hover / active) */
    --writer-primary-light: #f3f5ff; /* lavande la plus pâle (item actif sidebar) */
    --writer-primary-tint: #e4e9ff; /* lavande pâle (wash de marque) */
    --writer-ink: #151515; /* encre forte / titres (near-black) */
    --writer-ink-2: #262626; /* encre forte */
    --writer-secondary: #5e5e5e; /* gris texte secondaire */
    --writer-muted: #828282; /* gris atténué / placeholder */
    --writer-surface-alt: #eff0f2; /* gris 50 (surface alt / hover) */
    --writer-border: #e4e7ed; /* bordure par défaut */
    --writer-border-strong: #9aa2af; /* bordure forte / input */
    --writer-focus: #5551ff; /* anneau de focus indigo */
    --writer-white: #fff;
    --writer-sidebar-width: 17rem;
    --writer-radius: 0.5rem; /* contrôles doucement arrondis (8px) */
    --writer-radius-pill: 9999px; /* boutons pilule */
    font-family: 'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--writer-white);
    color: var(--writer-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Writer ── */
  .writer-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .writer-header {
    background: var(--writer-white);
    border-bottom: 1px solid var(--writer-border);
  }

  .writer-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .writer-header__brand {
    flex: 0 0 auto;
  }

  .writer-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 200ms ease;
  }

  .writer-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Writer (ratio préservé). */
  .writer-logo {
    display: block;
    width: auto;
    height: 28px;
  }

  /* ── Nav horizontale (centre) ── */
  .writer-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .writer-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .writer-nav__item {
    flex: 0 0 auto;
  }

  .writer-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--writer-ink-2);
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

  .writer-nav__link:hover,
  .writer-nav__link:focus-visible {
    color: var(--writer-primary);
    outline: none;
  }

  .writer-nav__link[aria-current="page"] {
    border-bottom-color: var(--writer-primary);
    color: var(--writer-primary);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .writer-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .writer-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Writer. */
  .writer-header__tools-links :global(.docs-header-control) {
    background: var(--writer-white);
    border-color: var(--writer-border-strong);
    border-radius: var(--writer-radius);
    color: var(--writer-ink-2);
    font-family: inherit;
  }

  .writer-header__tools-links :global(.docs-header-control:hover),
  .writer-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--writer-primary-light);
    border-color: var(--writer-primary);
    color: var(--writer-primary);
    box-shadow: none;
  }

  /* Recherche Writer : bouton loupe en pilule indigo. */
  .writer-search__btn {
    align-items: center;
    background: var(--writer-primary);
    border: 1px solid var(--writer-primary);
    border-radius: var(--writer-radius-pill);
    color: var(--writer-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 200ms ease, border-color 200ms ease;
  }

  .writer-search__btn:hover,
  .writer-search__btn:focus-visible {
    background: var(--writer-primary-hover);
    border-color: var(--writer-primary-hover);
    outline: 2px solid var(--writer-focus);
    outline-offset: 2px;
  }

  /* Burger mobile */
  .writer-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--writer-ink-2);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Writer ── */
  .writer-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--writer-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Writer ── */
  .writer-sidebar {
    background: var(--writer-white);
    border-right: 1px solid var(--writer-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .writer-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .writer-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--writer-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .writer-version-badge {
    background: var(--writer-primary-light);
    border: 1px solid var(--writer-primary-tint);
    border-radius: var(--writer-radius-pill);
    color: var(--writer-primary);
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.15rem 0.6rem;
    white-space: nowrap;
  }

  .writer-sidebar-github {
    align-items: center;
    color: var(--writer-ink-2);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 200ms ease;
  }

  .writer-sidebar-github:hover,
  .writer-sidebar-github:focus-visible {
    color: var(--writer-primary);
  }

  .writer-side-list,
  .writer-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .writer-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--writer-ink-2);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 200ms ease, border-color 200ms ease, color 200ms ease;
  }

  .writer-side-link:hover,
  .writer-side-link:focus-visible {
    background: var(--writer-surface-alt);
    color: var(--writer-primary);
    text-decoration: none;
  }

  .writer-side-link[aria-current="page"] {
    background: var(--writer-primary-light);
    border-left-color: var(--writer-primary);
    color: var(--writer-primary);
    font-weight: 600;
    text-decoration: none;
  }

  .writer-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .writer-side-divider {
    border-top: 1px solid var(--writer-border);
    margin: 0.5rem 0;
  }

  .writer-side-group {
    display: block;
  }

  .writer-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--writer-secondary);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 600;
    gap: 0.35rem;
    letter-spacing: 0.06em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 1rem 0 calc(1rem - 3px);
    text-transform: uppercase;
    transition: background 200ms ease;
  }

  .writer-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .writer-side-group__summary:hover,
  .writer-side-group__summary:focus-visible {
    background: var(--writer-surface-alt);
    outline: none;
  }

  .writer-side-group :global(.writer-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 200ms ease;
  }

  .writer-side-group:not([open]) :global(.writer-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .writer-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .writer-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .writer-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .writer-breadcrumb__item {
    align-items: center;
    color: var(--writer-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .writer-breadcrumb__item + .writer-breadcrumb__item::before {
    color: var(--writer-muted);
    content: "›";
    margin: 0 0.4rem;
  }

  .writer-breadcrumb__link {
    color: var(--writer-primary);
    text-decoration: none;
  }

  .writer-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .writer-breadcrumb__item span[aria-current="page"] {
    color: var(--writer-ink);
    font-weight: 600;
  }

  /* ── Footer Writer ── */
  .writer-footer {
    background: var(--writer-surface-alt);
    border-top: 1px solid var(--writer-border);
    margin-top: auto;
  }

  .writer-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .writer-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .writer-footer__link {
    color: var(--writer-ink-2);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .writer-footer__link:hover {
    color: var(--writer-primary);
    text-decoration: underline;
  }

  .writer-footer__logo {
    display: block;
    width: auto;
    height: 25px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .writer-body {
      grid-template-columns: 1fr;
    }

    .writer-sidebar {
      display: none;
    }

    .writer-nav {
      display: none;
    }

    .writer-header__tools {
      display: none;
    }

    .writer-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .writer-nav__link,
    .writer-search__btn,
    .writer-side-link,
    .writer-side-group :global(.writer-side-group__icon) {
      transition: none;
    }
  }
</style>

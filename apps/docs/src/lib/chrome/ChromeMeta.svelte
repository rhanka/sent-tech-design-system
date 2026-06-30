<!--
  Chrome documentaire Meta AI (ai.meta.com — meta.ai — Llama).
  Forme fidèle à l'en-tête produit Meta AI : clair, aéré, rond, bleu Meta.
  - Header : bandeau BLANC #ffffff, fine ligne signature en DÉGRADÉ Meta AI
    (turquoise → bleu → rose) en haut, logo OFFICIEL Meta (boucle « infinity »
    en dégradé bleu) + wordmark « Meta AI » à gauche, nav arrondie au centre,
    recherche bleu Meta à droite
  - Coins ARRONDIS (radius 8px) — signature Meta ; onglet actif = SOULIGNÉ bleu
    Meta (#0064e0) ; recherche = bouton bleu Meta plein, pilule
  - Barre latérale : item actif liseré bleu Meta + fond bleu très clair #e7f0fe
  - Couleurs PUBLIQUES Meta : Meta Blue #0064e0, Bright Blue #0082fb,
    hover #0653b3, light tint #e7f0fe, Meta Gray #1c2b33, near-black #050505,
    gris secondaire #65676b, gris muted #8a8d91, bg alt #f0f2f5,
    surface subtile #e4e6eb, bordure #ced0d4 ; anneau Meta AI turquoise #71f6d2,
    sky #0dacf1, rose #f5a3e0
  - Logo OFFICIEL Meta (vecteur, dégradé bleu) via <img src="/chrome/meta/logo.svg">
  - Typo : familles Meta propriétaires (Optimistic Display / Text — Dalton Maag)
    indisponibles → repli système (aucune police réseau chargée)
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

<div class="meta-shell">
  <!-- ── HEADER META AI ── -->
  <div class="meta-header-wrap">
    <header class="meta-header" aria-label="Meta AI">
      <!-- Fine ligne signature en dégradé Meta AI. -->
      <div class="meta-header__signature" aria-hidden="true"></div>
      <div class="meta-header__inner">
        <!-- Gauche : logo officiel Meta + wordmark Meta AI -->
        <div class="meta-header__brand">
          <a href="/" class="meta-header__brand-link" aria-label="Accueil : Meta AI Design System">
            <img
              src="/chrome/meta/logo.svg"
              alt="Meta"
              class="meta-logo"
              width="36"
              height="24"
            />
            <span class="meta-wordmark">Meta&nbsp;AI</span>
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="meta-nav" aria-label="Navigation principale">
          <ul class="meta-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="meta-nav__item">
                <a
                  class="meta-nav__link"
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
        <div class="meta-header__tools">
          <button
            type="button"
            class="meta-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="meta-header__tools-links">
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
          class="meta-header__burger"
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

  <!-- ── BODY META AI ── -->
  <div class="meta-body">
    <!-- Sidebar -->
    <aside class="meta-sidebar" aria-label="Navigation de la documentation">
      <nav class="meta-side-nav" aria-label="Sommaire">
        <ul class="meta-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="meta-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="meta-side-divider" role="separator"></li>

          <li class="meta-side-heading">
            <a
              class="meta-side-link meta-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="meta-side-group" open={isGroupOpen(group.items)}>
                <summary class="meta-side-group__summary">
                  <ChevronDown class="meta-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="meta-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="meta-side-link meta-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="meta-side-divider" role="separator"></li>

          <li class="meta-side-heading">
            <a
              class="meta-side-link meta-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="meta-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="meta-side-group__summary">
                  <ChevronDown class="meta-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="meta-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="meta-side-link meta-side-link--sub"
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
      <div class="meta-sidebar-footer">
        <span class="meta-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="meta-sidebar-github"
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
    <div class="meta-content">
      <nav class="meta-breadcrumb" aria-label="Breadcrumb">
        <ol class="meta-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="meta-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="meta-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER META AI ── -->
  <footer class="meta-footer" aria-label="Pied de page Meta AI">
    <div class="meta-footer__inner">
      <nav class="meta-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="meta-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <a href="/" class="meta-footer__brand" aria-label="Meta AI">
        <img
          src="/chrome/meta/logo.svg"
          alt="Meta"
          class="meta-footer__logo"
          width="30"
          height="20"
        />
        <span class="meta-footer__wordmark">Meta&nbsp;AI</span>
      </a>
    </div>
  </footer>
</div>

<style>
  /* ── Variables Meta AI ── */
  .meta-shell {
    --meta-primary: #0064e0; /* Meta Blue (official) — action / link */
    --meta-primary-hover: #0653b3; /* darker Meta Blue */
    --meta-primary-light: #e7f0fe; /* light blue selected tint */
    --meta-bright: #0082fb; /* Meta Bright Blue accent */
    --meta-ink: #1c2b33; /* Meta Gray — strong text / titres */
    --meta-ink-2: #050505; /* near-black */
    --meta-secondary: #65676b; /* gris secondaire */
    --meta-muted: #8a8d91; /* gris muted / placeholder */
    --meta-warm: #f0f2f5; /* bg alt Meta/FB */
    --meta-subtle: #e4e6eb; /* surface subtile / hover fill */
    --meta-border: #ced0d4; /* bordure par défaut */
    --meta-border-strong: #8a8d91; /* bordure forte */
    --meta-focus: #0064e0; /* focus blue */
    --meta-white: #fff;
    /* Anneau signature Meta AI (turquoise → bleu → rose). */
    --meta-ai-gradient: linear-gradient(90deg, #71f6d2 0%, #0dacf1 38%, #0064e0 64%, #f5a3e0 100%);
    --meta-sidebar-width: 17rem;
    --meta-radius: 0.5rem; /* 8px — signature Meta arrondie */
    --meta-radius-pill: 999px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    background: var(--meta-white);
    color: var(--meta-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Meta AI ── */
  .meta-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .meta-header {
    background: var(--meta-white);
    border-bottom: 1px solid var(--meta-border);
  }

  /* Fine ligne signature en dégradé Meta AI en haut du header. */
  .meta-header__signature {
    height: 3px;
    width: 100%;
    background: var(--meta-ai-gradient);
  }

  .meta-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4rem;
    padding: 0.625rem 1.5rem;
  }

  .meta-header__brand {
    flex: 0 0 auto;
  }

  .meta-header__brand-link {
    align-items: center;
    display: inline-flex;
    gap: 0.6rem;
    text-decoration: none;
    transition: opacity 200ms ease;
  }

  .meta-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Meta (ratio préservé). */
  .meta-logo {
    display: block;
    width: auto;
    height: 24px;
  }

  .meta-wordmark {
    color: var(--meta-ink);
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1;
    white-space: nowrap;
  }

  /* ── Nav horizontale (centre) ── */
  .meta-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .meta-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .meta-nav__item {
    flex: 0 0 auto;
  }

  .meta-nav__link {
    align-items: center;
    border-radius: var(--meta-radius);
    color: var(--meta-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.5rem;
    padding: 0 0.875rem;
    position: relative;
    text-decoration: none;
    transition: background 180ms ease, color 180ms ease;
    white-space: nowrap;
  }

  .meta-nav__link:hover,
  .meta-nav__link:focus-visible {
    background: var(--meta-warm);
    color: var(--meta-ink);
    outline: none;
  }

  .meta-nav__link[aria-current="page"] {
    color: var(--meta-primary);
    font-weight: 700;
  }

  .meta-nav__link[aria-current="page"]::after {
    content: "";
    position: absolute;
    left: 0.875rem;
    right: 0.875rem;
    bottom: -0.625rem;
    height: 2px;
    border-radius: 2px;
    background: var(--meta-primary);
  }

  /* ── Outils droite ── */
  .meta-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .meta-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Meta AI. */
  .meta-header__tools-links :global(.docs-header-control) {
    background: var(--meta-white);
    border-color: var(--meta-border);
    border-radius: var(--meta-radius);
    color: var(--meta-ink);
    font-family: inherit;
  }

  .meta-header__tools-links :global(.docs-header-control:hover),
  .meta-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--meta-warm);
    border-color: var(--meta-primary);
    color: var(--meta-primary);
    box-shadow: none;
  }

  /* Recherche Meta AI : bouton bleu Meta plein, arrondi. */
  .meta-search__btn {
    align-items: center;
    background: var(--meta-primary);
    border: 1px solid var(--meta-primary);
    border-radius: var(--meta-radius);
    color: var(--meta-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 180ms ease, border-color 180ms ease;
  }

  .meta-search__btn:hover,
  .meta-search__btn:focus-visible {
    background: var(--meta-primary-hover);
    border-color: var(--meta-primary-hover);
    outline: 2px solid var(--meta-focus);
    outline-offset: 2px;
  }

  /* Burger mobile */
  .meta-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--meta-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Meta AI ── */
  .meta-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--meta-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Meta AI ── */
  .meta-sidebar {
    background: var(--meta-white);
    border-right: 1px solid var(--meta-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4rem);
    position: sticky;
    top: 4rem;
  }

  .meta-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0.75rem;
  }

  .meta-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--meta-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .meta-version-badge {
    background: var(--meta-subtle);
    border: 1px solid var(--meta-border);
    border-radius: var(--meta-radius-pill);
    color: var(--meta-primary);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.6rem;
    white-space: nowrap;
  }

  .meta-sidebar-github {
    align-items: center;
    color: var(--meta-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 200ms ease;
  }

  .meta-sidebar-github:hover,
  .meta-sidebar-github:focus-visible {
    color: var(--meta-primary);
  }

  .meta-side-list,
  .meta-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .meta-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    border-radius: var(--meta-radius);
    box-sizing: border-box;
    color: var(--meta-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.5rem;
    padding: 0.5rem 0.75rem 0.5rem calc(0.75rem - 3px);
    text-decoration: none;
    transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
  }

  .meta-side-link:hover,
  .meta-side-link:focus-visible {
    background: var(--meta-warm);
    color: var(--meta-primary);
    text-decoration: none;
  }

  .meta-side-link[aria-current="page"] {
    background: var(--meta-primary-light);
    border-left-color: var(--meta-primary);
    color: var(--meta-primary);
    font-weight: 700;
    text-decoration: none;
  }

  .meta-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(1.75rem - 3px);
  }

  .meta-side-divider {
    border-top: 1px solid var(--meta-border);
    margin: 0.5rem 0.25rem;
  }

  .meta-side-group {
    display: block;
  }

  .meta-side-group__summary {
    align-items: center;
    border-radius: var(--meta-radius);
    color: var(--meta-secondary);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 700;
    gap: 0.35rem;
    letter-spacing: 0.04em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 0.75rem;
    text-transform: uppercase;
    transition: background 180ms ease;
  }

  .meta-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .meta-side-group__summary:hover,
  .meta-side-group__summary:focus-visible {
    background: var(--meta-warm);
    outline: none;
  }

  .meta-side-group :global(.meta-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 200ms ease;
  }

  .meta-side-group:not([open]) :global(.meta-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .meta-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .meta-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .meta-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .meta-breadcrumb__item {
    align-items: center;
    color: var(--meta-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .meta-breadcrumb__item + .meta-breadcrumb__item::before {
    color: var(--meta-muted);
    content: "›";
    margin: 0 0.4rem;
  }

  .meta-breadcrumb__link {
    color: var(--meta-primary);
    text-decoration: none;
  }

  .meta-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .meta-breadcrumb__item span[aria-current="page"] {
    color: var(--meta-ink);
    font-weight: 600;
  }

  /* ── Footer Meta AI ── */
  .meta-footer {
    background: var(--meta-warm);
    border-top: 1px solid var(--meta-border);
    margin-top: auto;
  }

  .meta-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .meta-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .meta-footer__link {
    color: var(--meta-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .meta-footer__link:hover {
    color: var(--meta-primary);
    text-decoration: underline;
  }

  .meta-footer__brand {
    align-items: center;
    display: inline-flex;
    gap: 0.5rem;
    flex: 0 0 auto;
    text-decoration: none;
  }

  .meta-footer__logo {
    display: block;
    width: auto;
    height: 20px;
  }

  .meta-footer__wordmark {
    color: var(--meta-ink);
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .meta-body {
      grid-template-columns: 1fr;
    }

    .meta-sidebar {
      display: none;
    }

    .meta-nav {
      display: none;
    }

    .meta-header__tools {
      display: none;
    }

    .meta-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .meta-nav__link,
    .meta-search__btn,
    .meta-side-link,
    .meta-side-group :global(.meta-side-group__icon) {
      transition: none;
    }
  }
</style>

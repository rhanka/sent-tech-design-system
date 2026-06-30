<!--
  Chrome documentaire Stability AI (stability.ai — build Squarespace).
  Forme fidèle à l'en-tête de stability.ai : scène quasi-noire, accent VIOLET vif,
  contrôles FIGTREE en CAPITALES, CTA en PILULE violette.
  - Header : bandeau quasi-noir #1f1f1f (la « scène » --black), logo OFFICIEL
    Stability AI (mark « S » dégradé violet + point) à gauche, nav CAPITALES
    espacées au centre, bouton recherche = PILULE VIOLETTE à droite
  - Coins arrondis (radius 10px contrôles, pilule 999px CTA) ; onglet actif =
    SOULIGNÉ VIOLET (#a381ff)
  - Barre latérale : item actif liseré violet + fond sombre relevé
  - Couleurs MESURÉES sur stability.ai : scène #1f1f1f (--black 0,0%,12%),
    surface relevée #272727, encre off-white #e5e7e6 (--white), gris clair
    #cccccc (--lightAccent), gris moyen #888888, violet vif #a381ff (accent
    on-dark), violet profond #340068 (--accent), violet sourd #725d91
  - Logo OFFICIEL Stability AI (vecteur, mark « S ») via
    <img src="/chrome/stability/logo.svg"> — asset de marque (source svgl.app)
  - Typo : familles de la marque référencées par NOM seulement (Archivo corps,
    Figtree contrôles) + repli système (aucune police réseau chargée)
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

<div class="stability-shell">
  <!-- ── HEADER STABILITY ── -->
  <div class="stability-header-wrap">
    <header class="stability-header" aria-label="Stability AI">
      <div class="stability-header__inner">
        <!-- Gauche : logo officiel Stability AI -->
        <div class="stability-header__brand">
          <a href="/" class="stability-header__brand-link" aria-label="Accueil : Stability AI Design System">
            <img
              src="/chrome/stability/logo.svg"
              alt="Stability AI"
              class="stability-logo"
              width="34"
              height="28"
            />
            <span class="stability-wordmark">Stability AI</span>
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="stability-nav" aria-label="Navigation principale">
          <ul class="stability-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="stability-nav__item">
                <a
                  class="stability-nav__link"
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
        <div class="stability-header__tools">
          <button
            type="button"
            class="stability-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="stability-header__tools-links">
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
          class="stability-header__burger"
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

  <!-- ── BODY STABILITY ── -->
  <div class="stability-body">
    <!-- Sidebar -->
    <aside class="stability-sidebar" aria-label="Navigation de la documentation">
      <nav class="stability-side-nav" aria-label="Sommaire">
        <ul class="stability-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="stability-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="stability-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="stability-side-group" open={isGroupOpen(group.items)}>
                <summary class="stability-side-group__summary">
                  <ChevronDown class="stability-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="stability-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="stability-side-link stability-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="stability-side-divider" role="separator"></li>

          <li>
            <a
              class="stability-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="stability-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="stability-side-group__summary">
                  <ChevronDown class="stability-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="stability-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="stability-side-link stability-side-link--sub"
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
      <div class="stability-sidebar-footer">
        <span class="stability-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="stability-sidebar-github"
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
    <div class="stability-content">
      <nav class="stability-breadcrumb" aria-label="Breadcrumb">
        <ol class="stability-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="stability-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="stability-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER STABILITY ── -->
  <footer class="stability-footer" aria-label="Pied de page Stability AI">
    <div class="stability-footer__inner">
      <nav class="stability-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="stability-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/stability/logo.svg"
        alt="Stability AI"
        class="stability-footer__logo"
        width="30"
        height="25"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Stability AI ── */
  .stability-shell {
    --stability-stage: #1f1f1f; /* --black hsl(0,0%,12%) — scène quasi-noire */
    --stability-surface: #272727; /* surface sombre relevée (submit bg mesuré) */
    --stability-raised: #2e2e2e; /* surface relevée (dérivé) */
    --stability-ink: #e5e7e6; /* --white off-white — encre primaire */
    --stability-ink-strong: #ffffff; /* --darkAccent blanc pur */
    --stability-secondary: #cccccc; /* --lightAccent gris clair (texte secondaire) */
    --stability-muted: #888888; /* gris moyen (texte muet) */
    --stability-violet: #a381ff; /* violet vif — accent on-dark (primaire / CTA) */
    --stability-violet-hover: #b89cff; /* violet plus clair au survol (dérivé) */
    --stability-violet-deep: #340068; /* violet profond ≈ --accent */
    --stability-violet-muted: #725d91; /* violet sourd mesuré */
    --stability-border: #3a3a3a; /* filet sombre subtil (dérivé) */
    --stability-border-strong: #555555; /* bordure forte sur sombre (dérivé) */
    --stability-focus: #a381ff; /* anneau focus violet vif */
    --stability-white: #ffffff;
    --stability-sidebar-width: 17rem;
    --stability-radius: 10px; /* radius contrôle md */
    --stability-radius-sm: 5px; /* radius champ */
    --stability-pill: 999px; /* CTA pilule */
    font-family: 'Archivo', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background: var(--stability-stage);
    color: var(--stability-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Stability ── */
  .stability-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .stability-header {
    background: var(--stability-stage);
    border-bottom: 1px solid var(--stability-border);
  }

  .stability-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .stability-header__brand {
    flex: 0 0 auto;
  }

  .stability-header__brand-link {
    align-items: center;
    display: inline-flex;
    gap: 0.625rem;
    text-decoration: none;
    transition: opacity 200ms ease;
  }

  .stability-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Stability AI (ratio préservé). */
  .stability-logo {
    display: block;
    width: auto;
    height: 28px;
  }

  .stability-wordmark {
    color: var(--stability-ink);
    font-family: 'Figtree', 'Archivo', system-ui, sans-serif;
    font-size: 1.0625rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    white-space: nowrap;
  }

  /* ── Nav horizontale (centre) ── */
  .stability-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .stability-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .stability-nav__item {
    flex: 0 0 auto;
  }

  .stability-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--stability-secondary);
    display: inline-flex;
    font-family: 'Figtree', 'Archivo', system-ui, sans-serif;
    font-size: 0.875rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    transition: border-color 200ms ease, color 200ms ease;
    white-space: nowrap;
  }

  .stability-nav__link:hover,
  .stability-nav__link:focus-visible {
    color: var(--stability-ink);
    outline: none;
  }

  .stability-nav__link[aria-current="page"] {
    border-bottom-color: var(--stability-violet);
    color: var(--stability-ink-strong);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .stability-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .stability-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Stability. */
  .stability-header__tools-links :global(.docs-header-control) {
    background: var(--stability-surface);
    border-color: var(--stability-border-strong);
    border-radius: var(--stability-radius);
    color: var(--stability-ink);
    font-family: inherit;
  }

  .stability-header__tools-links :global(.docs-header-control:hover),
  .stability-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--stability-raised);
    border-color: var(--stability-violet);
    color: var(--stability-ink-strong);
    box-shadow: none;
  }

  /* Recherche Stability : CTA PILULE violette. */
  .stability-search__btn {
    align-items: center;
    background: var(--stability-violet);
    border: 1px solid var(--stability-violet);
    border-radius: var(--stability-pill);
    color: var(--stability-stage);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0 1.1rem;
    transition: background 200ms ease, border-color 200ms ease;
  }

  .stability-search__btn:hover,
  .stability-search__btn:focus-visible {
    background: var(--stability-violet-hover);
    border-color: var(--stability-violet-hover);
    outline: 2px solid var(--stability-focus);
    outline-offset: 2px;
  }

  /* Burger mobile */
  .stability-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--stability-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Stability ── */
  .stability-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--stability-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Stability ── */
  .stability-sidebar {
    background: var(--stability-stage);
    border-right: 1px solid var(--stability-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .stability-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .stability-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--stability-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .stability-version-badge {
    background: var(--stability-surface);
    border: 1px solid var(--stability-border);
    border-radius: var(--stability-radius-sm);
    color: var(--stability-violet);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .stability-sidebar-github {
    align-items: center;
    color: var(--stability-secondary);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 200ms ease;
  }

  .stability-sidebar-github:hover,
  .stability-sidebar-github:focus-visible {
    color: var(--stability-violet);
  }

  .stability-side-list,
  .stability-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .stability-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--stability-secondary);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 200ms ease, border-color 200ms ease, color 200ms ease;
  }

  .stability-side-link:hover,
  .stability-side-link:focus-visible {
    background: var(--stability-surface);
    color: var(--stability-ink);
    text-decoration: none;
  }

  .stability-side-link[aria-current="page"] {
    background: var(--stability-surface);
    border-left-color: var(--stability-violet);
    color: var(--stability-ink-strong);
    font-weight: 700;
    text-decoration: none;
  }

  .stability-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .stability-side-divider {
    border-top: 1px solid var(--stability-border);
    margin: 0.5rem 0;
  }

  .stability-side-group {
    display: block;
  }

  .stability-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--stability-muted);
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

  .stability-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .stability-side-group__summary:hover,
  .stability-side-group__summary:focus-visible {
    background: var(--stability-surface);
    outline: none;
  }

  .stability-side-group :global(.stability-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 200ms ease;
  }

  .stability-side-group:not([open]) :global(.stability-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .stability-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .stability-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .stability-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .stability-breadcrumb__item {
    align-items: center;
    color: var(--stability-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .stability-breadcrumb__item + .stability-breadcrumb__item::before {
    color: var(--stability-muted);
    content: "›";
    margin: 0 0.4rem;
  }

  .stability-breadcrumb__link {
    color: var(--stability-violet);
    text-decoration: none;
  }

  .stability-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .stability-breadcrumb__item span[aria-current="page"] {
    color: var(--stability-ink);
    font-weight: 600;
  }

  /* ── Footer Stability ── */
  .stability-footer {
    background: var(--stability-surface);
    border-top: 1px solid var(--stability-border);
    margin-top: auto;
  }

  .stability-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .stability-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .stability-footer__link {
    color: var(--stability-secondary);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .stability-footer__link:hover {
    color: var(--stability-violet);
    text-decoration: underline;
  }

  .stability-footer__logo {
    display: block;
    width: auto;
    height: 25px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .stability-body {
      grid-template-columns: 1fr;
    }

    .stability-sidebar {
      display: none;
    }

    .stability-nav {
      display: none;
    }

    .stability-header__tools {
      display: none;
    }

    .stability-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .stability-nav__link,
    .stability-search__btn,
    .stability-side-link,
    .stability-side-group :global(.stability-side-group__icon) {
      transition: none;
    }
  }
</style>

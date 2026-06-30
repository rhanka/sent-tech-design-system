<!--
  Chrome documentaire Fireworks AI (fireworks.ai — la plateforme d'inférence LLM).
  Forme fidèle à l'en-tête de fireworks.ai : « inherently dark », scène
  développeur quasi-noire + un seul accent purple électrique + secondaire teal.
  - Header : bandeau SOMBRE #101113 (dark app stage), logo OFFICIEL Fireworks
    (monogramme purple + wordmark) à gauche, nav horizontale au centre (casse
    normale), recherche en pavé PURPLE de marque à droite
  - Coins ARRONDIS (radius 8px contrôles, 12px cartes) — signature Tailwind v4 ;
    onglet/lien actif = PURPLE clair #9d72fe (texte + filet bas purple #6726fe)
  - Barre latérale : item actif liseré purple + fond purple translucide subtil
  - Couleurs MESURÉES sur fireworks.ai (tokens OKLCH décodés) : stage #101113,
    panneau #16181d, surface carte #1a1a1f, bordure #28282e / #3a3a40, texte muet
    #696969, secondaire #bababa, primaire #f2f2f2, Fireworks Purple #6726fe,
    purple vif #8349fe, purple clair #9d72fe, marine/teal #00e6cc
  - Logo OFFICIEL Fireworks AI (vecteur, wordmark) via <img src="/chrome/fireworks/logo.svg">
    (wordmark redessiné en off-white pour la scène sombre, monogramme purple conservé)
  - Typo : familles Fireworks (Aspekta UI / Favorit display) indisponibles → repli
    Inter puis système (noms seulement, aucune police réseau chargée)
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

<div class="fw-shell">
  <!-- ── HEADER FIREWORKS ── -->
  <div class="fw-header-wrap">
    <header class="fw-header" aria-label="Fireworks AI">
      <div class="fw-header__inner">
        <!-- Gauche : logo officiel Fireworks AI -->
        <div class="fw-header__brand">
          <a href="/" class="fw-header__brand-link" aria-label="Accueil : Fireworks AI Design System">
            <img
              src="/chrome/fireworks/logo.svg"
              alt="Fireworks AI"
              class="fw-logo"
              width="179"
              height="20"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="fw-nav" aria-label="Navigation principale">
          <ul class="fw-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="fw-nav__item">
                <a
                  class="fw-nav__link"
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
        <div class="fw-header__tools">
          <button
            type="button"
            class="fw-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="fw-header__tools-links">
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
          class="fw-header__burger"
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

  <!-- ── BODY FIREWORKS ── -->
  <div class="fw-body">
    <!-- Sidebar -->
    <aside class="fw-sidebar" aria-label="Navigation de la documentation">
      <nav class="fw-side-nav" aria-label="Sommaire">
        <ul class="fw-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="fw-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="fw-side-divider" role="separator"></li>

          <li class="fw-side-heading">
            <a
              class="fw-side-link fw-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="fw-side-group" open={isGroupOpen(group.items)}>
                <summary class="fw-side-group__summary">
                  <ChevronDown class="fw-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="fw-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="fw-side-link fw-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="fw-side-divider" role="separator"></li>

          <li class="fw-side-heading">
            <a
              class="fw-side-link fw-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="fw-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="fw-side-group__summary">
                  <ChevronDown class="fw-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="fw-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="fw-side-link fw-side-link--sub"
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
      <div class="fw-sidebar-footer">
        <span class="fw-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="fw-sidebar-github"
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
    <div class="fw-content">
      <nav class="fw-breadcrumb" aria-label="Breadcrumb">
        <ol class="fw-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="fw-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="fw-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER FIREWORKS ── -->
  <footer class="fw-footer" aria-label="Pied de page Fireworks AI">
    <div class="fw-footer__inner">
      <nav class="fw-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="fw-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/fireworks/logo.svg"
        alt="Fireworks AI"
        class="fw-footer__logo"
        width="161"
        height="18"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Fireworks AI ── */
  .fw-shell {
    --fw-stage: #101113; /* --background — dark app stage */
    --fw-panel: #16181d; /* neutrals-900 — subtle / deepest panel */
    --fw-surface: #1a1a1f; /* neutrals-800 — card / raised surface */
    --fw-border: #28282e; /* neutrals-700 — subtle divider */
    --fw-border-strong: #3a3a40; /* neutrals-600 — stronger border */
    --fw-muted: #696969; /* neutrals-400 — muted / placeholder text */
    --fw-secondary: #bababa; /* neutrals-200 — secondary text */
    --fw-ink: #f2f2f2; /* neutrals-50 — primary text */
    --fw-purple: #6726fe; /* purple-400 — THE Fireworks Purple accent */
    --fw-purple-bright: #8349fe; /* purple-300 — bright purple (hover) */
    --fw-purple-light: #9d72fe; /* purple-200 — light purple (links / active) */
    --fw-purple-soft: rgb(103 38 254 / 0.14); /* brand purple translucent tint */
    --fw-teal: #00e6cc; /* marine-500 — secondary teal accent */
    --fw-white: #fff;
    --fw-sidebar-width: 17rem;
    --fw-radius: 0.5rem; /* 8px — controls / tabs */
    --fw-radius-lg: 0.75rem; /* 12px — cards */
    font-family: 'Aspekta', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--fw-stage);
    color: var(--fw-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Fireworks ── */
  .fw-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .fw-header {
    background: var(--fw-stage);
    border-bottom: 1px solid var(--fw-border);
  }

  .fw-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4rem;
    padding: 0.75rem 1.5rem;
  }

  .fw-header__brand {
    flex: 0 0 auto;
  }

  .fw-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 180ms ease;
  }

  .fw-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Fireworks AI (ratio préservé). */
  .fw-logo {
    display: block;
    width: auto;
    height: 20px;
  }

  /* ── Nav horizontale (centre) ── */
  .fw-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .fw-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .fw-nav__item {
    flex: 0 0 auto;
  }

  .fw-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--fw-secondary);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.5rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 180ms ease, color 180ms ease;
    white-space: nowrap;
  }

  .fw-nav__link:hover,
  .fw-nav__link:focus-visible {
    color: var(--fw-ink);
    outline: none;
  }

  .fw-nav__link[aria-current="page"] {
    border-bottom-color: var(--fw-purple);
    color: var(--fw-purple-light);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .fw-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .fw-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Fireworks (contrôles sombres). */
  .fw-header__tools-links :global(.docs-header-control) {
    background: var(--fw-surface);
    border-color: var(--fw-border-strong);
    border-radius: var(--fw-radius);
    color: var(--fw-ink);
    font-family: inherit;
  }

  .fw-header__tools-links :global(.docs-header-control:hover),
  .fw-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--fw-panel);
    border-color: var(--fw-purple);
    color: var(--fw-ink);
    box-shadow: none;
  }

  /* Recherche Fireworks : pavé PURPLE de marque. */
  .fw-search__btn {
    align-items: center;
    background: var(--fw-purple);
    border: 1px solid var(--fw-purple);
    border-radius: var(--fw-radius);
    color: var(--fw-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 180ms ease, border-color 180ms ease;
  }

  .fw-search__btn:hover,
  .fw-search__btn:focus-visible {
    background: var(--fw-purple-bright);
    border-color: var(--fw-purple-bright);
    outline: 2px solid var(--fw-purple-light);
    outline-offset: 2px;
  }

  /* Burger mobile */
  .fw-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--fw-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Fireworks ── */
  .fw-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--fw-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Fireworks ── */
  .fw-sidebar {
    background: var(--fw-panel);
    border-right: 1px solid var(--fw-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4rem);
    position: sticky;
    top: 4rem;
  }

  .fw-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .fw-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--fw-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .fw-version-badge {
    background: var(--fw-surface);
    border: 1px solid var(--fw-border-strong);
    border-radius: var(--fw-radius);
    color: var(--fw-purple-light);
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .fw-sidebar-github {
    align-items: center;
    color: var(--fw-secondary);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 180ms ease;
  }

  .fw-sidebar-github:hover,
  .fw-sidebar-github:focus-visible {
    color: var(--fw-purple-light);
  }

  .fw-side-list,
  .fw-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .fw-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--fw-secondary);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.5rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
  }

  .fw-side-link:hover,
  .fw-side-link:focus-visible {
    background: var(--fw-surface);
    color: var(--fw-ink);
    text-decoration: none;
  }

  .fw-side-link[aria-current="page"] {
    background: var(--fw-purple-soft);
    border-left-color: var(--fw-purple);
    color: var(--fw-ink);
    font-weight: 600;
    text-decoration: none;
  }

  .fw-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .fw-side-divider {
    border-top: 1px solid var(--fw-border);
    margin: 0.5rem 0;
  }

  .fw-side-group {
    display: block;
  }

  .fw-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--fw-muted);
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
    transition: background 180ms ease, color 180ms ease;
  }

  .fw-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .fw-side-group__summary:hover,
  .fw-side-group__summary:focus-visible {
    background: var(--fw-surface);
    color: var(--fw-secondary);
    outline: none;
  }

  .fw-side-group :global(.fw-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 180ms ease;
  }

  .fw-side-group:not([open]) :global(.fw-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .fw-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .fw-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .fw-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .fw-breadcrumb__item {
    align-items: center;
    color: var(--fw-muted);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .fw-breadcrumb__item + .fw-breadcrumb__item::before {
    color: var(--fw-muted);
    content: "›";
    margin: 0 0.4rem;
  }

  .fw-breadcrumb__link {
    color: var(--fw-purple-light);
    text-decoration: none;
  }

  .fw-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .fw-breadcrumb__item span[aria-current="page"] {
    color: var(--fw-ink);
    font-weight: 600;
  }

  /* ── Footer Fireworks ── */
  .fw-footer {
    background: var(--fw-panel);
    border-top: 1px solid var(--fw-border);
    margin-top: auto;
  }

  .fw-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .fw-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .fw-footer__link {
    color: var(--fw-secondary);
    font-size: 0.875rem;
    text-decoration: none;
    transition: color 180ms ease;
  }

  .fw-footer__link:hover {
    color: var(--fw-purple-light);
    text-decoration: underline;
  }

  .fw-footer__logo {
    display: block;
    width: auto;
    height: 18px;
    flex: 0 0 auto;
    opacity: 0.85;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .fw-body {
      grid-template-columns: 1fr;
    }

    .fw-sidebar {
      display: none;
    }

    .fw-nav {
      display: none;
    }

    .fw-header__tools {
      display: none;
    }

    .fw-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .fw-nav__link,
    .fw-search__btn,
    .fw-side-link,
    .fw-side-group :global(.fw-side-group__icon) {
      transition: none;
    }
  }
</style>

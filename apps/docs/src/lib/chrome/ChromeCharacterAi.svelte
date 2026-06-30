<!--
  Chrome documentaire Character.AI (character.ai — Character Technologies).
  Forme fidèle à l'en-tête de character.ai : LUDIQUE, très ARRONDI, accents bleus.
  - Header : bandeau BLANC, logo OFFICIEL Character.AI (wordmark) à gauche, nav en
    PILULES arrondies au centre, recherche en PILULE SOMBRE #202024 à droite
  - Coins TRÈS ARRONDIS (radius 12px / pilules 999px) — signature Character.AI ;
    onglet/lien actif = pilule bleue tintée + libellé BLEU #195eff (PAS de rail gauche)
  - Barre latérale : item actif = pilule bleue tintée, libellé bleu (rounded, no filet)
  - Couleurs MESURÉES sur character.ai (thème clair) : bleu de marque #195eff
    (interactif/focus), encre #26272b (--G800), pilule sombre #202024 (--G850 / CTA),
    secondaire #585962, gris page #f4f4f5, surface #ececee, bordure #e4e4e7,
    outline #d9d9df
  - Logo OFFICIEL Character.AI (wordmark vecteur) via <img src="/chrome/character-ai/logo.svg">
  - Typo : familles Character.AI propriétaires indisponibles → repli sans système
    (atHauss → Inter → system-ui) ; aucune police réseau chargée
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

<div class="cai-shell">
  <!-- ── HEADER CHARACTER.AI ── -->
  <div class="cai-header-wrap">
    <header class="cai-header" aria-label="Character.AI">
      <div class="cai-header__inner">
        <!-- Gauche : logo officiel Character.AI -->
        <div class="cai-header__brand">
          <a href="/" class="cai-header__brand-link" aria-label="Accueil : Character.AI Design System">
            <img
              src="/chrome/character-ai/logo.svg"
              alt="Character.AI"
              class="cai-logo"
              width="150"
              height="22"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale (pilules) -->
        <nav class="cai-nav" aria-label="Navigation principale">
          <ul class="cai-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="cai-nav__item">
                <a
                  class="cai-nav__link"
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
        <div class="cai-header__tools">
          <button
            type="button"
            class="cai-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="cai-header__tools-links">
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
          class="cai-header__burger"
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

  <!-- ── BODY CHARACTER.AI ── -->
  <div class="cai-body">
    <!-- Sidebar -->
    <aside class="cai-sidebar" aria-label="Navigation de la documentation">
      <nav class="cai-side-nav" aria-label="Sommaire">
        <ul class="cai-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="cai-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="cai-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="cai-side-group" open={isGroupOpen(group.items)}>
                <summary class="cai-side-group__summary">
                  <ChevronDown class="cai-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="cai-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="cai-side-link cai-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="cai-side-divider" role="separator"></li>

          <li>
            <a
              class="cai-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="cai-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="cai-side-group__summary">
                  <ChevronDown class="cai-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="cai-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="cai-side-link cai-side-link--sub"
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
      <div class="cai-sidebar-footer">
        <span class="cai-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="cai-sidebar-github"
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
    <div class="cai-content">
      <nav class="cai-breadcrumb" aria-label="Breadcrumb">
        <ol class="cai-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="cai-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="cai-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER CHARACTER.AI ── -->
  <footer class="cai-footer" aria-label="Pied de page Character.AI">
    <div class="cai-footer__inner">
      <nav class="cai-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="cai-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/character-ai/logo.svg"
        alt="Character.AI"
        class="cai-footer__logo"
        width="130"
        height="19"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Character.AI ── */
  .cai-shell {
    --cai-blue: #195eff; /* --primary-refresh / --primary-blue (interactif + focus) */
    --cai-blue-dark: #1448d6; /* hover/active (à confirmer) */
    --cai-blue-tint: rgba(25, 94, 255, 0.1); /* pilule active tintée */
    --cai-link: #3e87f3; /* --link (bleu plus clair) */
    --cai-ink: #26272b; /* --G800 / --foreground (encre / titres) */
    --cai-ink-strong: #202024; /* --G850 / --primary (pilule sombre / CTA) */
    --cai-ink-darkest: #131316; /* --G950 / --button-background */
    --cai-secondary: #585962; /* --G600 texte secondaire */
    --cai-muted: #a2a2ac; /* --G400 (séparateur fil d'Ariane) */
    --cai-bg: #ffffff; /* blanc (cartes / header) */
    --cai-surface: #f4f4f5; /* --G100 fond de page */
    --cai-surface-2: #ececee; /* --G150 surface subtile / hover */
    --cai-border: #e4e4e7; /* --G200 bordure / séparateur */
    --cai-border-strong: #d9d9df; /* --G250 outline */
    --cai-focus: #195eff; /* bleu de focus */
    --cai-white: #fff;
    --cai-sidebar-width: 17rem;
    --cai-radius: 0.75rem; /* 12px — controls / pilules sidebar */
    --cai-radius-pill: 999px; /* pilules nav / recherche */
    font-family: 'atHauss', Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--cai-bg);
    color: var(--cai-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Character.AI ── */
  .cai-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .cai-header {
    background: var(--cai-white);
    border-bottom: 1px solid var(--cai-border);
  }

  .cai-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .cai-header__brand {
    flex: 0 0 auto;
  }

  .cai-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 200ms ease;
  }

  .cai-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel Character.AI (ratio préservé). */
  .cai-logo {
    display: block;
    width: auto;
    height: 22px;
  }

  /* ── Nav horizontale (centre) en pilules ── */
  .cai-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .cai-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cai-nav__item {
    flex: 0 0 auto;
  }

  .cai-nav__link {
    align-items: center;
    border-radius: var(--cai-radius-pill);
    color: var(--cai-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.5rem;
    padding: 0 1rem;
    text-decoration: none;
    transition: background 180ms ease, color 180ms ease;
    white-space: nowrap;
  }

  .cai-nav__link:hover,
  .cai-nav__link:focus-visible {
    background: var(--cai-surface-2);
    color: var(--cai-ink);
    outline: none;
  }

  .cai-nav__link[aria-current="page"] {
    background: var(--cai-blue-tint);
    color: var(--cai-blue);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .cai-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .cai-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Character.AI (rounded). */
  .cai-header__tools-links :global(.docs-header-control) {
    background: var(--cai-white);
    border-color: var(--cai-border-strong);
    border-radius: var(--cai-radius);
    color: var(--cai-ink);
    font-family: inherit;
  }

  .cai-header__tools-links :global(.docs-header-control:hover),
  .cai-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--cai-surface);
    border-color: var(--cai-blue);
    color: var(--cai-ink);
    box-shadow: none;
  }

  /* Recherche Character.AI : pilule sombre #202024 (CTA primaire). */
  .cai-search__btn {
    align-items: center;
    background: var(--cai-ink-strong);
    border: 1px solid var(--cai-ink-strong);
    border-radius: var(--cai-radius-pill);
    color: var(--cai-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 180ms ease, border-color 180ms ease;
  }

  .cai-search__btn:hover,
  .cai-search__btn:focus-visible {
    background: var(--cai-ink-darkest);
    border-color: var(--cai-ink-darkest);
    outline: 2px solid var(--cai-focus);
    outline-offset: 2px;
  }

  /* Burger mobile */
  .cai-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    border-radius: var(--cai-radius);
    color: var(--cai-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Character.AI ── */
  .cai-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--cai-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Character.AI ── */
  .cai-sidebar {
    background: var(--cai-white);
    border-right: 1px solid var(--cai-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .cai-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0.5rem;
  }

  .cai-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--cai-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .cai-version-badge {
    background: var(--cai-surface-2);
    border: 1px solid var(--cai-border);
    border-radius: var(--cai-radius-pill);
    color: var(--cai-secondary);
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.15rem 0.6rem;
    white-space: nowrap;
  }

  .cai-sidebar-github {
    align-items: center;
    color: var(--cai-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 180ms ease;
  }

  .cai-sidebar-github:hover,
  .cai-sidebar-github:focus-visible {
    color: var(--cai-blue);
  }

  .cai-side-list,
  .cai-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  /* Liens latéraux : pilule arrondie (PAS de rail/filet gauche). */
  .cai-side-link {
    align-items: center;
    border-radius: var(--cai-radius);
    box-sizing: border-box;
    color: var(--cai-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.5rem;
    padding: 0.5rem 0.75rem;
    text-decoration: none;
    transition: background 180ms ease, color 180ms ease;
  }

  .cai-side-link:hover,
  .cai-side-link:focus-visible {
    background: var(--cai-surface-2);
    color: var(--cai-ink);
    text-decoration: none;
  }

  .cai-side-link[aria-current="page"] {
    background: var(--cai-blue-tint);
    color: var(--cai-blue);
    font-weight: 600;
    text-decoration: none;
  }

  .cai-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: 1.5rem;
  }

  .cai-side-divider {
    border-top: 1px solid var(--cai-border);
    margin: 0.5rem 0.75rem;
  }

  .cai-side-group {
    display: block;
  }

  .cai-side-group__summary {
    align-items: center;
    border-radius: var(--cai-radius);
    color: var(--cai-secondary);
    cursor: pointer;
    display: flex;
    font-size: 0.74rem;
    font-weight: 600;
    gap: 0.35rem;
    letter-spacing: 0.02em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 0.75rem;
    text-transform: uppercase;
    transition: background 180ms ease;
  }

  .cai-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .cai-side-group__summary:hover,
  .cai-side-group__summary:focus-visible {
    background: var(--cai-surface-2);
    outline: none;
  }

  .cai-side-group :global(.cai-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 200ms ease;
  }

  .cai-side-group:not([open]) :global(.cai-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .cai-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .cai-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .cai-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cai-breadcrumb__item {
    align-items: center;
    color: var(--cai-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .cai-breadcrumb__item + .cai-breadcrumb__item::before {
    color: var(--cai-muted);
    content: "›";
    margin: 0 0.4rem;
  }

  .cai-breadcrumb__link {
    color: var(--cai-blue);
    text-decoration: none;
  }

  .cai-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .cai-breadcrumb__item span[aria-current="page"] {
    color: var(--cai-ink);
    font-weight: 500;
  }

  /* ── Footer Character.AI ── */
  .cai-footer {
    background: var(--cai-surface);
    border-top: 1px solid var(--cai-border);
    margin-top: auto;
  }

  .cai-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .cai-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .cai-footer__link {
    color: var(--cai-secondary);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .cai-footer__link:hover {
    color: var(--cai-blue);
    text-decoration: underline;
  }

  .cai-footer__logo {
    display: block;
    width: auto;
    height: 19px;
    flex: 0 0 auto;
    opacity: 0.85;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .cai-body {
      grid-template-columns: 1fr;
    }

    .cai-sidebar {
      display: none;
    }

    .cai-nav {
      display: none;
    }

    .cai-header__tools {
      display: none;
    }

    .cai-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .cai-nav__link,
    .cai-search__btn,
    .cai-side-link,
    .cai-side-group :global(.cai-side-group__icon) {
      transition: none;
    }
  }
</style>

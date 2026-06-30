<!--
  Chrome documentaire DeepSeek (deepseek.com / chat.deepseek.com).
  Forme fidèle à l'en-tête clair et arrondi de DeepSeek : surfaces blanches,
  neutres bluish, accent bleu électrique, contrôles à coins doux.
  - Header : bandeau BLANC #ffffff, logo OFFICIEL DeepSeek (baleine + wordmark
    « deepseek » bleu) à gauche, nav en casse normale au centre, bouton de
    recherche bleu plein arrondi à droite
  - Coins ARRONDIS (radius ~10px contrôles, 12px panneaux) — signature DeepSeek ;
    onglet actif = LABEL BLEU + filet bleu en bas (mode indicateur DeepSeek)
  - Barre latérale : item actif fond bleu très clair + liseré bleu + label bleu
  - Couleurs MESURÉES sur deepseek.com (`--dsw-static-*`, thème clair) :
    blanc #ffffff, bluish-50 #f9fafb, bluish-75 #f1f3f5, bluish-100 #ebeef2,
    bluish-200 #e1e5ee, bluish-700 #61666b, bluish-1000 #0f1115,
    deepseek-50 #edf3fe (bulle), deepseek-500 #3964fe (action), 450 #5686fe (hover)
  - Logo OFFICIEL DeepSeek (vecteur, wordmark baleine) via <img src="/chrome/deepseek/logo.svg">
  - Typo : DeepSeek UI = Inter (repli système), aucune police réseau chargée
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

<div class="deepseek-shell">
  <!-- ── HEADER DEEPSEEK ── -->
  <div class="deepseek-header-wrap">
    <header class="deepseek-header" aria-label="DeepSeek">
      <div class="deepseek-header__inner">
        <!-- Gauche : logo officiel DeepSeek -->
        <div class="deepseek-header__brand">
          <a href="/" class="deepseek-header__brand-link" aria-label="Accueil : DeepSeek Design System">
            <img
              src="/chrome/deepseek/logo.svg"
              alt="DeepSeek"
              class="deepseek-logo"
              width="148"
              height="27"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="deepseek-nav" aria-label="Navigation principale">
          <ul class="deepseek-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="deepseek-nav__item">
                <a
                  class="deepseek-nav__link"
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
        <div class="deepseek-header__tools">
          <button
            type="button"
            class="deepseek-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="deepseek-header__tools-links">
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
          class="deepseek-header__burger"
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

  <!-- ── BODY DEEPSEEK ── -->
  <div class="deepseek-body">
    <!-- Sidebar -->
    <aside class="deepseek-sidebar" aria-label="Navigation de la documentation">
      <nav class="deepseek-side-nav" aria-label="Sommaire">
        <ul class="deepseek-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="deepseek-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="deepseek-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="deepseek-side-group" open={isGroupOpen(group.items)}>
                <summary class="deepseek-side-group__summary">
                  <ChevronDown class="deepseek-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="deepseek-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="deepseek-side-link deepseek-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="deepseek-side-divider" role="separator"></li>

          <li>
            <a
              class="deepseek-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="deepseek-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="deepseek-side-group__summary">
                  <ChevronDown class="deepseek-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="deepseek-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="deepseek-side-link deepseek-side-link--sub"
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
      <div class="deepseek-sidebar-footer">
        <span class="deepseek-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="deepseek-sidebar-github"
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
    <div class="deepseek-content">
      <nav class="deepseek-breadcrumb" aria-label="Breadcrumb">
        <ol class="deepseek-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="deepseek-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="deepseek-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER DEEPSEEK ── -->
  <footer class="deepseek-footer" aria-label="Pied de page DeepSeek">
    <div class="deepseek-footer__inner">
      <nav class="deepseek-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="deepseek-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/deepseek/logo.svg"
        alt="DeepSeek"
        class="deepseek-footer__logo"
        width="132"
        height="24"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables DeepSeek ── */
  .deepseek-shell {
    --deepseek-primary: #3964fe; /* deepseek-500 — brand-primary / action */
    --deepseek-primary-hover: #5686fe; /* deepseek-450 — primary hover */
    --deepseek-primary-light: #edf3fe; /* deepseek-50 — bulle / item actif sidebar */
    --deepseek-ink: #0f1115; /* bluish-1000 — texte primaire */
    --deepseek-ink-2: #353638; /* bluish-800 — texte fort */
    --deepseek-secondary: #61666b; /* bluish-700 — texte secondaire */
    --deepseek-muted: #81858c; /* bluish-600 — texte tertiaire */
    --deepseek-accent: #3964fe; /* accent bleu */
    --deepseek-accent-dark: #4868b2; /* deepseek-600 — bleu marine atténué */
    --deepseek-surface: #f9fafb; /* bluish-50 — surface alternative */
    --deepseek-subtle: #f1f3f5; /* bluish-75 — surface hover/subtile */
    --deepseek-active-fill: #ebeef2; /* bluish-100 — sidebar active (neutre) */
    --deepseek-border: #e1e5ee; /* bluish-200 — bordure par défaut */
    --deepseek-border-strong: #cfd3d6; /* bluish-300 — bordure forte */
    --deepseek-focus: #3964fe; /* anneau focus bleu */
    --deepseek-white: #fff;
    --deepseek-sidebar-width: 17rem;
    --deepseek-radius: 0.625rem; /* 10px — contrôles */
    --deepseek-radius-lg: 0.75rem; /* 12px — panneaux */
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: var(--deepseek-white);
    color: var(--deepseek-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header DeepSeek ── */
  .deepseek-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .deepseek-header {
    background: var(--deepseek-white);
    border-bottom: 1px solid var(--deepseek-border);
  }

  .deepseek-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .deepseek-header__brand {
    flex: 0 0 auto;
  }

  .deepseek-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 180ms ease;
  }

  .deepseek-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel DeepSeek (ratio préservé). */
  .deepseek-logo {
    display: block;
    width: auto;
    height: 27px;
  }

  /* ── Nav horizontale (centre) ── */
  .deepseek-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .deepseek-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .deepseek-nav__item {
    flex: 0 0 auto;
  }

  .deepseek-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--deepseek-secondary);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 180ms ease, color 180ms ease;
    white-space: nowrap;
  }

  .deepseek-nav__link:hover,
  .deepseek-nav__link:focus-visible {
    color: var(--deepseek-ink);
    outline: none;
  }

  .deepseek-nav__link[aria-current="page"] {
    border-bottom-color: var(--deepseek-primary);
    color: var(--deepseek-primary);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .deepseek-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .deepseek-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header DeepSeek. */
  .deepseek-header__tools-links :global(.docs-header-control) {
    background: var(--deepseek-white);
    border-color: var(--deepseek-border);
    border-radius: var(--deepseek-radius);
    color: var(--deepseek-ink);
    font-family: inherit;
  }

  .deepseek-header__tools-links :global(.docs-header-control:hover),
  .deepseek-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--deepseek-surface);
    border-color: var(--deepseek-primary);
    color: var(--deepseek-ink);
    box-shadow: none;
  }

  /* Recherche DeepSeek : bouton loupe bleu plein arrondi. */
  .deepseek-search__btn {
    align-items: center;
    background: var(--deepseek-primary);
    border: 1px solid var(--deepseek-primary);
    border-radius: var(--deepseek-radius);
    color: var(--deepseek-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 180ms ease, border-color 180ms ease;
  }

  .deepseek-search__btn:hover,
  .deepseek-search__btn:focus-visible {
    background: var(--deepseek-primary-hover);
    border-color: var(--deepseek-primary-hover);
    outline: 3px solid rgb(57 100 254 / 0.3);
    outline-offset: 2px;
  }

  /* Burger mobile */
  .deepseek-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--deepseek-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body DeepSeek ── */
  .deepseek-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--deepseek-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar DeepSeek ── */
  .deepseek-sidebar {
    background: var(--deepseek-white);
    border-right: 1px solid var(--deepseek-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .deepseek-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0.75rem;
  }

  .deepseek-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--deepseek-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .deepseek-version-badge {
    background: var(--deepseek-primary-light);
    border: 1px solid var(--deepseek-border);
    border-radius: var(--deepseek-radius);
    color: var(--deepseek-primary);
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .deepseek-sidebar-github {
    align-items: center;
    color: var(--deepseek-secondary);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 180ms ease;
  }

  .deepseek-sidebar-github:hover,
  .deepseek-sidebar-github:focus-visible {
    color: var(--deepseek-primary);
  }

  .deepseek-side-list,
  .deepseek-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .deepseek-side-link {
    align-items: center;
    border-radius: var(--deepseek-radius);
    box-sizing: border-box;
    color: var(--deepseek-secondary);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.5rem;
    padding: 0.5rem 0.75rem;
    text-decoration: none;
    transition: background 180ms ease, color 180ms ease;
  }

  .deepseek-side-link:hover,
  .deepseek-side-link:focus-visible {
    background: var(--deepseek-subtle);
    color: var(--deepseek-ink);
    text-decoration: none;
  }

  .deepseek-side-link[aria-current="page"] {
    background: var(--deepseek-primary-light);
    color: var(--deepseek-primary);
    font-weight: 600;
    text-decoration: none;
  }

  .deepseek-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: 1.75rem;
  }

  .deepseek-side-divider {
    border-top: 1px solid var(--deepseek-border);
    margin: 0.5rem 0.75rem;
  }

  .deepseek-side-group {
    display: block;
  }

  .deepseek-side-group__summary {
    align-items: center;
    border-radius: var(--deepseek-radius);
    color: var(--deepseek-muted);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 600;
    gap: 0.35rem;
    letter-spacing: 0.06em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 0.75rem;
    text-transform: uppercase;
    transition: background 180ms ease;
  }

  .deepseek-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .deepseek-side-group__summary:hover,
  .deepseek-side-group__summary:focus-visible {
    background: var(--deepseek-subtle);
    outline: none;
  }

  .deepseek-side-group :global(.deepseek-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 180ms ease;
  }

  .deepseek-side-group:not([open]) :global(.deepseek-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .deepseek-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .deepseek-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .deepseek-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .deepseek-breadcrumb__item {
    align-items: center;
    color: var(--deepseek-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .deepseek-breadcrumb__item + .deepseek-breadcrumb__item::before {
    color: var(--deepseek-muted);
    content: "›";
    margin: 0 0.4rem;
  }

  .deepseek-breadcrumb__link {
    color: var(--deepseek-primary);
    text-decoration: none;
  }

  .deepseek-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .deepseek-breadcrumb__item span[aria-current="page"] {
    color: var(--deepseek-ink);
    font-weight: 600;
  }

  /* ── Footer DeepSeek ── */
  .deepseek-footer {
    background: var(--deepseek-surface);
    border-top: 1px solid var(--deepseek-border);
    margin-top: auto;
  }

  .deepseek-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .deepseek-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .deepseek-footer__link {
    color: var(--deepseek-secondary);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .deepseek-footer__link:hover {
    color: var(--deepseek-primary);
    text-decoration: underline;
  }

  .deepseek-footer__logo {
    display: block;
    width: auto;
    height: 24px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .deepseek-body {
      grid-template-columns: 1fr;
    }

    .deepseek-sidebar {
      display: none;
    }

    .deepseek-nav {
      display: none;
    }

    .deepseek-header__tools {
      display: none;
    }

    .deepseek-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .deepseek-nav__link,
    .deepseek-search__btn,
    .deepseek-side-link,
    .deepseek-side-group :global(.deepseek-side-group__icon) {
      transition: none;
    }
  }
</style>

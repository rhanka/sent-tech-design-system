<!--
  Chrome documentaire AI21 Labs (ai21.com).
  Forme fidèle à l'en-tête d'ai21.com : surface claire, rose vif de marque,
  neutres TEINTÉS VIOLET, contrôles en PILULE à libellé MAJUSCULE.
  - Header : bandeau blanc, logo OFFICIEL AI21 (wordmark) à gauche, nav au
    centre, recherche + outils à droite en pilules
  - Accent de marque : deep-pink #e61e93 (lien actif, pilule de recherche,
    anneau de focus) ; hover plus profond #d00b4e
  - Neutres purple-tinted mesurés sur ai21.com : texte #141125 / #2a263f,
    secondaire #5b5675, muet #8c87a6, bordures #e1dfec / #bcb8d0,
    surface subtile #f8f7fc
  - Coins : contrôles en PILULE (999px) — signature des boutons AI21 ;
    libellés en MAJUSCULES espacées (évoque l'« Aeonik Fono » de marque)
  - Logo OFFICIEL AI21 (vecteur) via <img src="/chrome/ai21/logo.svg">
  - Typo : familles propriétaires (Polysans / Aeonik) indisponibles → repli
    système ('Inter' si présent, sinon system-ui) ; aucune police réseau chargée
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

<div class="ai21-shell">
  <!-- ── HEADER AI21 ── -->
  <div class="ai21-header-wrap">
    <header class="ai21-header" aria-label="AI21 Labs">
      <div class="ai21-header__inner">
        <!-- Gauche : logo officiel AI21 -->
        <div class="ai21-header__brand">
          <a href="/" class="ai21-header__brand-link" aria-label="Accueil : AI21 Labs Design System">
            <img
              src="/chrome/ai21/logo.svg"
              alt="AI21 Labs"
              class="ai21-logo"
              width="69"
              height="24"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="ai21-nav" aria-label="Navigation principale">
          <ul class="ai21-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="ai21-nav__item">
                <a
                  class="ai21-nav__link"
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
        <div class="ai21-header__tools">
          <button
            type="button"
            class="ai21-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="ai21-header__tools-links">
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
          class="ai21-header__burger"
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

  <!-- ── BODY AI21 ── -->
  <div class="ai21-body">
    <!-- Sidebar -->
    <aside class="ai21-sidebar" aria-label="Navigation de la documentation">
      <nav class="ai21-side-nav" aria-label="Sommaire">
        <ul class="ai21-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="ai21-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="ai21-side-divider" role="separator"></li>

          <li class="ai21-side-heading">
            <a
              class="ai21-side-link ai21-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="ai21-side-group" open={isGroupOpen(group.items)}>
                <summary class="ai21-side-group__summary">
                  <ChevronDown class="ai21-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="ai21-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="ai21-side-link ai21-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="ai21-side-divider" role="separator"></li>

          <li class="ai21-side-heading">
            <a
              class="ai21-side-link ai21-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="ai21-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="ai21-side-group__summary">
                  <ChevronDown class="ai21-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="ai21-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="ai21-side-link ai21-side-link--sub"
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
      <div class="ai21-sidebar-footer">
        <span class="ai21-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="ai21-sidebar-github"
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
    <div class="ai21-content">
      <nav class="ai21-breadcrumb" aria-label="Breadcrumb">
        <ol class="ai21-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="ai21-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="ai21-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER AI21 ── -->
  <footer class="ai21-footer" aria-label="Pied de page AI21 Labs">
    <div class="ai21-footer__inner">
      <nav class="ai21-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="ai21-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/ai21/logo.svg"
        alt="AI21 Labs"
        class="ai21-footer__logo"
        width="63"
        height="22"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables AI21 ── */
  .ai21-shell {
    --ai21-pink: #e61e93; /* deep-pink — brand primary */
    --ai21-pink-hover: #d00b4e; /* primary-magenta-dark — hover/active */
    --ai21-pink-tint: #fde7f2; /* light pink fill (item actif sidebar) */
    --ai21-ink: #141125; /* neutral-800 — texte primaire (purple-tinted) */
    --ai21-ink-2: #2a263f; /* neutral-700 */
    --ai21-secondary: #5b5675; /* neutral-500 — texte secondaire */
    --ai21-muted: #8c87a6; /* neutral-400 — muet / placeholder */
    --ai21-surface: #ffffff;
    --ai21-subtle: #f8f7fc; /* neutral-100 — surface subtile / hover */
    --ai21-cream: #fbf9f6; /* repli crème chaud (page ai21.com) */
    --ai21-border: #e1dfec; /* neutral-200 — bordure */
    --ai21-border-strong: #bcb8d0; /* neutral-300 — bordure forte */
    --ai21-focus: #e61e93; /* anneau de focus = rose de marque */
    --ai21-white: #fff;
    --ai21-sidebar-width: 17rem;
    --ai21-radius: 0.625rem; /* 10px — rayon de carte mesuré */
    --ai21-pill: 999px; /* pilules de contrôle (boutons AI21) */
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--ai21-surface);
    color: var(--ai21-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header AI21 ── */
  .ai21-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .ai21-header {
    background: var(--ai21-white);
    border-bottom: 1px solid var(--ai21-border);
  }

  .ai21-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .ai21-header__brand {
    flex: 0 0 auto;
  }

  .ai21-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 200ms ease;
  }

  .ai21-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel AI21 (ratio préservé). */
  .ai21-logo {
    display: block;
    width: auto;
    height: 24px;
  }

  /* ── Nav horizontale (centre) ── */
  .ai21-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .ai21-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ai21-nav__item {
    flex: 0 0 auto;
  }

  .ai21-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--ai21-ink-2);
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

  .ai21-nav__link:hover,
  .ai21-nav__link:focus-visible {
    color: var(--ai21-pink);
    outline: none;
  }

  .ai21-nav__link[aria-current="page"] {
    border-bottom-color: var(--ai21-pink);
    color: var(--ai21-pink);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .ai21-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .ai21-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header AI21 : pilules MAJUSCULES (signature AI21). */
  .ai21-header__tools-links :global(.docs-header-control) {
    background: var(--ai21-white);
    border-color: var(--ai21-border-strong);
    border-radius: var(--ai21-pill);
    color: var(--ai21-ink);
    font-family: inherit;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .ai21-header__tools-links :global(.docs-header-control:hover),
  .ai21-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--ai21-pink-tint);
    border-color: var(--ai21-pink);
    color: var(--ai21-pink-hover);
    box-shadow: none;
  }

  /* Recherche AI21 : pilule rose de marque (CTA). */
  .ai21-search__btn {
    align-items: center;
    background: var(--ai21-pink);
    border: 1px solid var(--ai21-pink);
    border-radius: var(--ai21-pill);
    color: var(--ai21-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 200ms ease, border-color 200ms ease;
  }

  .ai21-search__btn:hover,
  .ai21-search__btn:focus-visible {
    background: var(--ai21-pink-hover);
    border-color: var(--ai21-pink-hover);
    outline: 2px solid var(--ai21-focus);
    outline-offset: 2px;
  }

  /* Burger mobile */
  .ai21-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--ai21-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body AI21 ── */
  .ai21-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--ai21-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar AI21 ── */
  .ai21-sidebar {
    background: var(--ai21-white);
    border-right: 1px solid var(--ai21-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .ai21-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .ai21-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--ai21-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .ai21-version-badge {
    background: var(--ai21-pink-tint);
    border: 1px solid var(--ai21-border);
    border-radius: var(--ai21-pill);
    color: var(--ai21-pink-hover);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .ai21-sidebar-github {
    align-items: center;
    color: var(--ai21-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 200ms ease;
  }

  .ai21-sidebar-github:hover,
  .ai21-sidebar-github:focus-visible {
    color: var(--ai21-pink);
  }

  .ai21-side-list,
  .ai21-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ai21-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--ai21-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 200ms ease, border-color 200ms ease, color 200ms ease;
  }

  .ai21-side-link:hover,
  .ai21-side-link:focus-visible {
    background: var(--ai21-subtle);
    color: var(--ai21-pink);
    text-decoration: none;
  }

  .ai21-side-link[aria-current="page"] {
    background: var(--ai21-pink-tint);
    border-left-color: var(--ai21-pink);
    color: var(--ai21-pink-hover);
    font-weight: 700;
    text-decoration: none;
  }

  .ai21-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .ai21-side-divider {
    border-top: 1px solid var(--ai21-border);
    margin: 0.5rem 0;
  }

  .ai21-side-group {
    display: block;
  }

  .ai21-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--ai21-secondary);
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

  .ai21-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .ai21-side-group__summary:hover,
  .ai21-side-group__summary:focus-visible {
    background: var(--ai21-subtle);
    outline: none;
  }

  .ai21-side-group :global(.ai21-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 200ms ease;
  }

  .ai21-side-group:not([open]) :global(.ai21-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .ai21-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .ai21-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .ai21-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ai21-breadcrumb__item {
    align-items: center;
    color: var(--ai21-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .ai21-breadcrumb__item + .ai21-breadcrumb__item::before {
    color: var(--ai21-muted);
    content: "›";
    margin: 0 0.4rem;
  }

  .ai21-breadcrumb__link {
    color: var(--ai21-pink);
    text-decoration: none;
  }

  .ai21-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .ai21-breadcrumb__item span[aria-current="page"] {
    color: var(--ai21-ink);
    font-weight: 600;
  }

  /* ── Footer AI21 ── */
  .ai21-footer {
    background: var(--ai21-cream);
    border-top: 1px solid var(--ai21-border);
    margin-top: auto;
  }

  .ai21-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .ai21-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .ai21-footer__link {
    color: var(--ai21-ink-2);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .ai21-footer__link:hover {
    color: var(--ai21-pink);
    text-decoration: underline;
  }

  .ai21-footer__logo {
    display: block;
    width: auto;
    height: 22px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .ai21-body {
      grid-template-columns: 1fr;
    }

    .ai21-sidebar {
      display: none;
    }

    .ai21-nav {
      display: none;
    }

    .ai21-header__tools {
      display: none;
    }

    .ai21-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .ai21-nav__link,
    .ai21-search__btn,
    .ai21-side-link,
    .ai21-side-group :global(.ai21-side-group__icon) {
      transition: none;
    }
  }
</style>

<!--
  Chrome documentaire Nous Research / Hermes (nousresearch.com — dashboard
  hermes-agent.nousresearch.com). Forme fidèle à l'identité « terminal » dark de
  Nous : stage navy presque noir, ink ICE BLUE qui est à la fois texte et accent,
  type MONOSPACE, halo ambre chaud.
  - Header : bandeau NAVY presque-noir #05091a, wordmark OFFICIEL « NOUS » ice à
    gauche, nav mono en casse normale au centre, recherche ice (bloc plein) à droite
  - Coins CRISP (radius 4px) — signature terminal Nous ; onglet actif = SOULIGNÉ ICE
  - Barre latérale : item actif liseré ice + fond raised subtil
  - Couleurs MESURÉES (Hermes palette + Elementor kit) : stage navy #05091a, ice
    #d8f0ff (text + accent), foreground #ffffff, card #161c2c, raised #1e2536,
    bordure #2b3343 / forte #3c4658, secondaire #a3b6c6, muted #798898, brand blue
    #0171a9, lien #7fc5ec, halo ambre #ffc737
  - Logo OFFICIEL Nous Research (wordmark vecteur) via
    <img src="/chrome/nous-hermes/logo.svg"> (set d'icônes LobeHub, brand assets)
  - Typo : « Share Tech Mono » (Hermes fontMono) + repli « Courier Prime » /
    ui-monospace — on ne référence que les NOMS (aucune police réseau chargée)
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

<div class="nous-shell">
  <!-- ── HEADER NOUS / HERMES ── -->
  <div class="nous-header-wrap">
    <header class="nous-header" aria-label="Nous Research / Hermes">
      <div class="nous-header__inner">
        <!-- Gauche : wordmark officiel NOUS -->
        <div class="nous-header__brand">
          <a href="/" class="nous-header__brand-link" aria-label="Accueil : Nous Research Design System">
            <img
              src="/chrome/nous-hermes/logo.svg"
              alt="Nous Research"
              class="nous-logo"
              width="55"
              height="24"
            />
            <span class="nous-header__brand-tag">Hermes</span>
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="nous-nav" aria-label="Navigation principale">
          <ul class="nous-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="nous-nav__item">
                <a
                  class="nous-nav__link"
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
        <div class="nous-header__tools">
          <button
            type="button"
            class="nous-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="nous-header__tools-links">
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
          class="nous-header__burger"
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

  <!-- ── BODY NOUS / HERMES ── -->
  <div class="nous-body">
    <!-- Sidebar -->
    <aside class="nous-sidebar" aria-label="Navigation de la documentation">
      <nav class="nous-side-nav" aria-label="Sommaire">
        <ul class="nous-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="nous-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="nous-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="nous-side-group" open={isGroupOpen(group.items)}>
                <summary class="nous-side-group__summary">
                  <ChevronDown class="nous-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="nous-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="nous-side-link nous-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="nous-side-divider" role="separator"></li>

          <li>
            <a
              class="nous-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="nous-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="nous-side-group__summary">
                  <ChevronDown class="nous-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="nous-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="nous-side-link nous-side-link--sub"
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
      <div class="nous-sidebar-footer">
        <span class="nous-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="nous-sidebar-github"
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
    <div class="nous-content">
      <nav class="nous-breadcrumb" aria-label="Breadcrumb">
        <ol class="nous-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="nous-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="nous-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER NOUS / HERMES ── -->
  <footer class="nous-footer" aria-label="Pied de page Nous Research">
    <div class="nous-footer__inner">
      <nav class="nous-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="nous-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/nous-hermes/logo.svg"
        alt="Nous Research"
        class="nous-footer__logo"
        width="55"
        height="24"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Nous Research / Hermes ── */
  .nous-shell {
    --nous-primary: #d8f0ff; /* ice — accent / action primaire (palette.midground) */
    --nous-primary-hover: #b9e0f5; /* ice dim — hover/active */
    --nous-primary-light: #1e2536; /* raised (item actif sidebar) */
    --nous-ink: #d8f0ff; /* encre / titres (ice midground) */
    --nous-ink-2: #ffffff; /* foreground highlight */
    --nous-secondary: #a3b6c6; /* texte secondaire (derived) */
    --nous-muted: #798898; /* texte muted (derived) */
    --nous-link: #7fc5ec; /* lien (brand blue éclairci) */
    --nous-amber: #ffc737; /* halo ambre chaud (warmGlow) */
    --nous-stage: #05091a; /* stage navy presque-noir (palette.background) */
    --nous-card: #161c2c; /* card / input surface (derived) */
    --nous-raised: #1e2536; /* surface raised (derived) */
    --nous-border: #2b3343; /* bordure / divider (derived) */
    --nous-border-strong: #3c4658; /* bordure forte (derived) */
    --nous-focus: #d8f0ff; /* anneau focus ice */
    --nous-sidebar-width: 17rem;
    --nous-radius: 4px; /* coins crisp — signature terminal Nous */
    font-family: 'Share Tech Mono', 'Courier Prime', ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
    background: var(--nous-stage);
    color: var(--nous-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Nous / Hermes ── */
  .nous-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .nous-header {
    background: var(--nous-stage);
    border-bottom: 1px solid var(--nous-border);
    /* signature : voile ambre chaud (warmGlow) en haut du stage */
    background-image: radial-gradient(120% 180% at 50% -40%, rgba(255, 199, 55, 0.10), transparent 60%);
  }

  .nous-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .nous-header__brand {
    flex: 0 0 auto;
  }

  .nous-header__brand-link {
    align-items: center;
    display: inline-flex;
    gap: 0.6rem;
    text-decoration: none;
    transition: opacity 200ms ease;
  }

  .nous-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Wordmark officiel NOUS (ratio préservé). */
  .nous-logo {
    display: block;
    width: auto;
    height: 22px;
  }

  /* Étiquette « Hermes » accolée au wordmark (mono, ton secondaire). */
  .nous-header__brand-tag {
    border-left: 1px solid var(--nous-border-strong);
    color: var(--nous-secondary);
    font-size: 0.8125rem;
    letter-spacing: 0.04em;
    padding-left: 0.6rem;
    text-transform: lowercase;
  }

  /* ── Nav horizontale (centre) — mono, casse normale ── */
  .nous-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .nous-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nous-nav__item {
    flex: 0 0 auto;
  }

  .nous-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--nous-secondary);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 400;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    letter-spacing: 0.01em;
    transition: border-color 200ms ease, color 200ms ease;
    white-space: nowrap;
  }

  .nous-nav__link:hover,
  .nous-nav__link:focus-visible {
    color: var(--nous-ink);
    border-bottom-color: var(--nous-border-strong);
    outline: none;
  }

  .nous-nav__link[aria-current="page"] {
    border-bottom-color: var(--nous-primary);
    color: var(--nous-ink);
    font-weight: 400;
  }

  /* ── Outils droite ── */
  .nous-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .nous-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Nous (champ dark, coin crisp). */
  .nous-header__tools-links :global(.docs-header-control) {
    background: var(--nous-card);
    border-color: var(--nous-border-strong);
    border-radius: var(--nous-radius);
    color: var(--nous-ink);
    font-family: inherit;
  }

  .nous-header__tools-links :global(.docs-header-control:hover),
  .nous-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--nous-raised);
    border-color: var(--nous-primary);
    color: var(--nous-ink);
    box-shadow: none;
  }

  /* Recherche Nous : bouton loupe ice plein, coin crisp. */
  .nous-search__btn {
    align-items: center;
    background: var(--nous-primary);
    border: 1px solid var(--nous-primary);
    border-radius: var(--nous-radius);
    color: var(--nous-stage);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 200ms ease, border-color 200ms ease;
  }

  .nous-search__btn:hover,
  .nous-search__btn:focus-visible {
    background: var(--nous-primary-hover);
    border-color: var(--nous-primary-hover);
    outline: 2px solid var(--nous-focus);
    outline-offset: 2px;
  }

  /* Burger mobile */
  .nous-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--nous-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Nous ── */
  .nous-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--nous-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Nous ── */
  .nous-sidebar {
    background: var(--nous-stage);
    border-right: 1px solid var(--nous-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .nous-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .nous-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--nous-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .nous-version-badge {
    background: var(--nous-card);
    border: 1px solid var(--nous-border);
    border-radius: var(--nous-radius);
    color: var(--nous-primary);
    font-size: 0.78rem;
    font-weight: 400;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .nous-sidebar-github {
    align-items: center;
    color: var(--nous-secondary);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 400;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 200ms ease;
  }

  .nous-sidebar-github:hover,
  .nous-sidebar-github:focus-visible {
    color: var(--nous-primary);
  }

  .nous-side-list,
  .nous-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nous-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--nous-secondary);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 200ms ease, border-color 200ms ease, color 200ms ease;
  }

  .nous-side-link:hover,
  .nous-side-link:focus-visible {
    background: var(--nous-card);
    color: var(--nous-ink);
    text-decoration: none;
  }

  .nous-side-link[aria-current="page"] {
    background: var(--nous-primary-light);
    border-left-color: var(--nous-primary);
    color: var(--nous-ink);
    font-weight: 400;
    text-decoration: none;
  }

  .nous-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .nous-side-divider {
    border-top: 1px solid var(--nous-border);
    margin: 0.5rem 0;
  }

  .nous-side-group {
    display: block;
  }

  .nous-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--nous-muted);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 400;
    gap: 0.35rem;
    letter-spacing: 0.08em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 1rem 0 calc(1rem - 3px);
    text-transform: uppercase;
    transition: background 200ms ease;
  }

  .nous-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .nous-side-group__summary:hover,
  .nous-side-group__summary:focus-visible {
    background: var(--nous-card);
    outline: none;
  }

  .nous-side-group :global(.nous-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 200ms ease;
  }

  .nous-side-group:not([open]) :global(.nous-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .nous-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .nous-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .nous-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nous-breadcrumb__item {
    align-items: center;
    color: var(--nous-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .nous-breadcrumb__item + .nous-breadcrumb__item::before {
    color: var(--nous-muted);
    content: "›";
    margin: 0 0.4rem;
  }

  .nous-breadcrumb__link {
    color: var(--nous-link);
    text-decoration: none;
  }

  .nous-breadcrumb__link:hover {
    color: var(--nous-primary);
    text-decoration: underline;
  }

  .nous-breadcrumb__item span[aria-current="page"] {
    color: var(--nous-ink);
    font-weight: 400;
  }

  /* ── Footer Nous ── */
  .nous-footer {
    background: var(--nous-card);
    border-top: 1px solid var(--nous-border);
    margin-top: auto;
  }

  .nous-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .nous-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .nous-footer__link {
    color: var(--nous-secondary);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .nous-footer__link:hover {
    color: var(--nous-primary);
    text-decoration: underline;
  }

  .nous-footer__logo {
    display: block;
    width: auto;
    height: 22px;
    flex: 0 0 auto;
    opacity: 0.9;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .nous-body {
      grid-template-columns: 1fr;
    }

    .nous-sidebar {
      display: none;
    }

    .nous-nav {
      display: none;
    }

    .nous-header__tools {
      display: none;
    }

    .nous-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .nous-nav__link,
    .nous-search__btn,
    .nous-side-link,
    .nous-side-group :global(.nous-side-group__icon) {
      transition: none;
    }
  }
</style>

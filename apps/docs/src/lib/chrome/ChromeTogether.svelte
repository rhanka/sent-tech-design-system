<!--
  Chrome documentaire Together AI (together.ai).
  Forme fidèle à l'en-tête marketing Together : clair, technique, signature mono.
  - Header : bandeau BLANC, logo OFFICIEL « together.ai » à gauche (wordmark encre
    + point bleu de marque), nav sobre au centre, CTA recherche NOIR à droite
  - Coins doux (radius 8px — --_radius---8 mesuré) ; onglet actif = libellé BLEU
    de marque + indicateur bas 2px bleu (tabs mesurés)
  - Barre latérale : item actif liseré bleu + fond bleu très clair (#e5f3ff)
  - Signature MONO : libellés-groupes + version + CTA en MONO MAJUSCULES
    ('The Future Mono' / 'PP Neue Montreal Mono'), tracking léger
  - Couleurs MESURÉES sur together.ai : bleu de marque #0f6fff, blanc #ffffff,
    surface claire #f6fafd, bleu très clair #e5f3ff, bordure #d6e0ef, gris fort
    #758696, gris secondaire #626e7f, encre dark-blue #010120, noir #000000
  - Logo OFFICIEL Together AI (vecteur) via <img src="/chrome/together/logo.svg">
    (asset de marque, source svgl.app)
  - Typo : familles propriétaires Together ('The Future', 'The Future Mono')
    indisponibles → on ne référence que leurs NOMS + repli système (aucune police
    réseau chargée)
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

<div class="together-shell">
  <!-- ── HEADER TOGETHER ── -->
  <div class="together-header-wrap">
    <header class="together-header" aria-label="Together AI">
      <div class="together-header__inner">
        <!-- Gauche : logo officiel together.ai -->
        <div class="together-header__brand">
          <a href="/" class="together-header__brand-link" aria-label="Accueil : Together AI Design System">
            <img
              src="/chrome/together/logo.svg"
              alt="Together AI"
              class="together-logo"
              width="95"
              height="22"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="together-nav" aria-label="Navigation principale">
          <ul class="together-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="together-nav__item">
                <a
                  class="together-nav__link"
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
        <div class="together-header__tools">
          <button
            type="button"
            class="together-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="together-header__tools-links">
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
          class="together-header__burger"
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

  <!-- ── BODY TOGETHER ── -->
  <div class="together-body">
    <!-- Sidebar -->
    <aside class="together-sidebar" aria-label="Navigation de la documentation">
      <nav class="together-side-nav" aria-label="Sommaire">
        <ul class="together-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="together-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="together-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="together-side-group" open={isGroupOpen(group.items)}>
                <summary class="together-side-group__summary">
                  <ChevronDown class="together-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="together-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="together-side-link together-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="together-side-divider" role="separator"></li>

          <li>
            <a
              class="together-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="together-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="together-side-group__summary">
                  <ChevronDown class="together-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="together-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="together-side-link together-side-link--sub"
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
      <div class="together-sidebar-footer">
        <span class="together-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="together-sidebar-github"
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
    <div class="together-content">
      <nav class="together-breadcrumb" aria-label="Breadcrumb">
        <ol class="together-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="together-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="together-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER TOGETHER ── -->
  <footer class="together-footer" aria-label="Pied de page Together AI">
    <div class="together-footer__inner">
      <nav class="together-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="together-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/together/logo.svg"
        alt="Together AI"
        class="together-footer__logo"
        width="86"
        height="20"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Together AI ── */
  .together-shell {
    --together-primary: #0f6fff; /* bleu de marque — liens / actif / focus */
    --together-primary-hover: #0d62e0; /* bleu plus foncé — hover/active */
    --together-primary-light: #e5f3ff; /* bleu très clair (item actif sidebar) */
    --together-ink: #010120; /* encre dark-blue — titres / texte primaire */
    --together-ink-2: #1f232e; /* texte foncé adouci */
    --together-secondary: #626e7f; /* texte secondaire */
    --together-muted: #758696; /* texte muted / placeholder */
    --together-cta: #000000; /* noir — CTA mono (signature Together) */
    --together-cta-hover: #1f232e; /* presque noir — hover CTA */
    --together-warm: #fff; /* surface blanche (header) */
    --together-subtle: #f6fafd; /* surface claire subtile */
    --together-tint: #e5f3ff; /* bleu très clair */
    --together-border: #d6e0ef; /* bordure claire */
    --together-border-strong: #758696; /* gris fort — bordure forte */
    --together-focus: #0f6fff; /* anneau focus bleu */
    --together-white: #fff;
    --together-sidebar-width: 17rem;
    --together-radius: 0.5rem; /* coins doux — --_radius---8 mesuré (8px) */
    --together-mono: 'The Future Mono', 'PP Neue Montreal Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace;
    font-family: 'The Future', Arial, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--together-white);
    color: var(--together-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Together ── */
  .together-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .together-header {
    background: var(--together-warm);
    border-bottom: 1px solid var(--together-border);
  }

  .together-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .together-header__brand {
    flex: 0 0 auto;
  }

  .together-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 200ms ease;
  }

  .together-header__brand-link:hover {
    opacity: 0.82;
  }

  /* Logo officiel together.ai (ratio préservé). */
  .together-logo {
    display: block;
    width: auto;
    height: 22px;
  }

  /* ── Nav horizontale (centre) — sobre, casse normale ── */
  .together-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .together-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .together-nav__item {
    flex: 0 0 auto;
  }

  .together-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--together-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    letter-spacing: 0;
    transition: border-color 200ms ease, color 200ms ease;
    white-space: nowrap;
  }

  .together-nav__link:hover,
  .together-nav__link:focus-visible {
    color: var(--together-primary);
    border-bottom-color: var(--together-border-strong);
    outline: none;
  }

  .together-nav__link[aria-current="page"] {
    border-bottom-color: var(--together-primary);
    color: var(--together-primary);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .together-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .together-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Together (champ blanc, coin doux). */
  .together-header__tools-links :global(.docs-header-control) {
    background: var(--together-white);
    border-color: var(--together-border);
    border-radius: var(--together-radius);
    color: var(--together-ink);
    font-family: inherit;
  }

  .together-header__tools-links :global(.docs-header-control:hover),
  .together-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--together-subtle);
    border-color: var(--together-primary);
    color: var(--together-ink);
    box-shadow: none;
  }

  /* Recherche Together : CTA NOIR mono, doucement arrondi (signature). */
  .together-search__btn {
    align-items: center;
    background: var(--together-cta);
    border: 1px solid var(--together-cta);
    border-radius: var(--together-radius);
    color: var(--together-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 200ms ease, border-color 200ms ease;
  }

  .together-search__btn:hover,
  .together-search__btn:focus-visible {
    background: var(--together-cta-hover);
    border-color: var(--together-cta-hover);
    outline: 2px solid var(--together-focus);
    outline-offset: 2px;
  }

  /* Burger mobile */
  .together-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--together-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Together ── */
  .together-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--together-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Together ── */
  .together-sidebar {
    background: var(--together-white);
    border-right: 1px solid var(--together-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .together-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .together-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--together-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .together-version-badge {
    background: var(--together-subtle);
    border: 1px solid var(--together-border);
    border-radius: var(--together-radius);
    color: var(--together-primary);
    font-family: var(--together-mono);
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .together-sidebar-github {
    align-items: center;
    color: var(--together-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 200ms ease;
  }

  .together-sidebar-github:hover,
  .together-sidebar-github:focus-visible {
    color: var(--together-primary);
  }

  .together-side-list,
  .together-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .together-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--together-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 200ms ease, border-color 200ms ease, color 200ms ease;
  }

  .together-side-link:hover,
  .together-side-link:focus-visible {
    background: var(--together-subtle);
    color: var(--together-primary);
    text-decoration: none;
  }

  .together-side-link[aria-current="page"] {
    background: var(--together-primary-light);
    border-left-color: var(--together-primary);
    color: var(--together-primary);
    font-weight: 600;
    text-decoration: none;
  }

  .together-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .together-side-divider {
    border-top: 1px solid var(--together-border);
    margin: 0.5rem 0;
  }

  .together-side-group {
    display: block;
  }

  .together-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--together-secondary);
    cursor: pointer;
    display: flex;
    font-family: var(--together-mono);
    font-size: 0.72rem;
    font-weight: 500;
    gap: 0.35rem;
    letter-spacing: 0.06em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 1rem 0 calc(1rem - 3px);
    text-transform: uppercase;
    transition: background 200ms ease;
  }

  .together-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .together-side-group__summary:hover,
  .together-side-group__summary:focus-visible {
    background: var(--together-subtle);
    outline: none;
  }

  .together-side-group :global(.together-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 200ms ease;
  }

  .together-side-group:not([open]) :global(.together-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .together-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .together-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .together-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .together-breadcrumb__item {
    align-items: center;
    color: var(--together-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .together-breadcrumb__item + .together-breadcrumb__item::before {
    color: var(--together-border-strong);
    content: "›";
    margin: 0 0.4rem;
  }

  .together-breadcrumb__link {
    color: var(--together-primary);
    text-decoration: none;
  }

  .together-breadcrumb__link:hover {
    color: var(--together-primary-hover);
    text-decoration: underline;
  }

  .together-breadcrumb__item span[aria-current="page"] {
    color: var(--together-ink);
    font-weight: 600;
  }

  /* ── Footer Together ── */
  .together-footer {
    background: var(--together-subtle);
    border-top: 1px solid var(--together-border);
    margin-top: auto;
  }

  .together-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .together-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .together-footer__link {
    color: var(--together-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .together-footer__link:hover {
    color: var(--together-primary);
    text-decoration: underline;
  }

  .together-footer__logo {
    display: block;
    width: auto;
    height: 20px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .together-body {
      grid-template-columns: 1fr;
    }

    .together-sidebar {
      display: none;
    }

    .together-nav {
      display: none;
    }

    .together-header__tools {
      display: none;
    }

    .together-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .together-nav__link,
    .together-search__btn,
    .together-side-link,
    .together-side-group :global(.together-side-group__icon) {
      transition: none;
    }
  }
</style>

<!--
  Chrome documentaire LG2 (lg2.com — la plus grande agence de publicité
  indépendante de Montréal). Forme fidèle à l'identité réelle de lg2.com :
  - Header : bandeau BLANC, fine bordure inférieure NOIRE (#111), parti pris
    brutaliste / éditorial ; nav et libellés en police MONOSPACE ('IBM Plex
    Mono', ui-monospace) pour coller au site LG2
  - Logo : marque officielle lg2 en rouge-orangé (#ff2300), alignée à gauche
  - Onglet de nav actif : SOULIGNÉ épais rouge #ff2300 (l'accent expressif LG2)
  - Loupe de recherche compacte (carrée) : icône #111, rouge #ff2300 au survol
  - Barre latérale gauche : item actif accent rouge #ff2300 + fond tinté
    #fff0ee, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande NOIRE #111, liens monospace blancs, filet d'accent rouge
    #ff2300, marque lg2 en blanc/knockout (filtre vers blanc)
  - Radius BRUTALISTES tranchants : 0 partout (boutons carrés, loupe carrée)
  - Couleurs : rouge-orangé #ff2300 (marque / action / lien / accent), noir
    #111 (texte / nav / hairline bold), survol tinté #fff0ee, blanc #ffffff
  - Marque officielle lg2 référencée via <img src="/chrome/lg2/logo.svg">
  - Typo : 'IBM Plex Mono' (monospace, nav / UI / corps) — aucune police
    propriétaire chargée ; fallbacks ui-monospace / monospace.
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

<div class="lg2-shell">
  <!-- ── HEADER LG2 ── -->
  <div class="lg2-header-wrap">
    <header class="lg2-header" aria-label="LG2">
      <div class="lg2-header__inner">
        <!-- Gauche : marque officielle lg2 (rouge-orangé) -->
        <div class="lg2-header__brand">
          <a href="/" class="lg2-header__brand-link" aria-label="Accueil : LG2 Design System">
            <img
              src="/chrome/lg2/logo.svg"
              alt="lg2"
              class="lg2-logo"
              width="64"
              height="28"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="lg2-nav" aria-label="Navigation principale">
          <ul class="lg2-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="lg2-nav__item">
                <a
                  class="lg2-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche LG2 : bouton compact carré (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="lg2-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA carré -->
        <div class="lg2-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="lg2-header__tools-links">
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
          class="lg2-header__burger"
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

  <!-- ── BODY LG2 ── -->
  <div class="lg2-body">
    <!-- Sidebar -->
    <aside class="lg2-sidebar" aria-label="Navigation de la documentation">
      <nav class="lg2-side-nav" aria-label="Sommaire">
        <ul class="lg2-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="lg2-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="lg2-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="lg2-side-group" open={isGroupOpen(group.items)}>
                <summary class="lg2-side-group__summary">
                  <ChevronDown class="lg2-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="lg2-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="lg2-side-link lg2-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="lg2-side-divider" role="separator"></li>

          <li>
            <a
              class="lg2-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="lg2-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="lg2-side-group__summary">
                  <ChevronDown class="lg2-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="lg2-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="lg2-side-link lg2-side-link--sub"
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
      <div class="lg2-sidebar-footer">
        <span class="lg2-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="lg2-sidebar-github"
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
    <div class="lg2-content">
      <nav class="lg2-breadcrumb" aria-label="Breadcrumb">
        <ol class="lg2-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="lg2-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="lg2-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER LG2 ── -->
  <footer class="lg2-footer" aria-label="Pied de page LG2">
    <div class="lg2-footer__inner">
      <nav class="lg2-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="lg2-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/lg2/logo.svg"
        alt="lg2"
        class="lg2-footer__logo"
        width="64"
        height="28"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables LG2 (identité brutaliste monospace lg2.com) ── */
  .lg2-shell {
    --lg2-red: #ff2300; /* rouge-orangé : marque / action / lien / accent */
    --lg2-red-hover: #d61d00; /* rouge-orangé assombri : hover */
    --lg2-ink: #111; /* noir : texte / nav / hairline bold */
    --lg2-ink-soft: #444; /* gris-noir secondaire */
    --lg2-grey: #6b6b6b; /* gris labels / fil d'Ariane */
    --lg2-tint: #fff0ee; /* survol tinté rouge très clair */
    --lg2-white: #fff;
    --lg2-sidebar-width: 17rem;
    --lg2-radius: 0; /* brutaliste : carré partout */
    /* Typo LG2 : IBM Plex Mono (monospace) ; aucune police propriétaire chargée. */
    --lg2-font-mono: 'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
    font-family: var(--lg2-font-mono);
    background: var(--lg2-white);
    color: var(--lg2-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header LG2 ── */
  .lg2-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .lg2-header {
    background: var(--lg2-white);
    border-bottom: 1px solid var(--lg2-ink);
  }

  .lg2-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .lg2-header__brand {
    flex: 0 0 auto;
  }

  .lg2-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .lg2-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Marque officielle lg2 (rouge-orangé, ratio préservé). */
  .lg2-logo {
    display: block;
    width: auto;
    height: 28px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .lg2-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .lg2-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte carrée (pas de champ) : icône encre, rouge au survol. */
  .lg2-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--lg2-radius);
    color: var(--lg2-ink);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .lg2-search-btn:hover,
  .lg2-search-btn:focus-visible {
    background: var(--lg2-tint);
    border-color: var(--lg2-red);
    color: var(--lg2-red);
    outline: none;
  }

  .lg2-nav__item {
    flex: 0 0 auto;
  }

  .lg2-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--lg2-ink);
    display: inline-flex;
    font-family: var(--lg2-font-mono);
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.3rem;
    letter-spacing: -0.01em;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .lg2-nav__link:hover,
  .lg2-nav__link:focus-visible {
    color: var(--lg2-red);
    outline: none;
  }

  /* Onglet actif : souligné épais rouge #ff2300 (l'accent expressif LG2). */
  .lg2-nav__link[aria-current="page"] {
    border-bottom-color: var(--lg2-red);
    color: var(--lg2-ink);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .lg2-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .lg2-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .lg2-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .lg2-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--lg2-ink);
  }

  /* Overrides switchers dans header LG2 (champs blancs, bord noir brutaliste, carré). */
  .lg2-header__tools-links :global(.docs-header-control) {
    background: var(--lg2-white);
    border-color: var(--lg2-ink);
    border-radius: var(--lg2-radius);
    color: var(--lg2-ink);
    font-family: inherit;
  }

  .lg2-header__tools-links :global(.docs-header-control:hover),
  .lg2-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--lg2-tint);
    border-color: var(--lg2-red);
    color: var(--lg2-red);
    box-shadow: none;
  }

  /* CTA carré rouge-orangé (signature brutaliste LG2). */
  .lg2-cta {
    align-items: center;
    background: var(--lg2-red);
    border: 1px solid var(--lg2-red);
    border-radius: var(--lg2-radius);
    color: var(--lg2-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--lg2-font-mono);
    font-size: 0.8125rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.02em;
    padding: 0 1.25rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .lg2-cta:hover,
  .lg2-cta:focus-visible {
    background: var(--lg2-red-hover);
    border-color: var(--lg2-red-hover);
    color: var(--lg2-white);
    outline: none;
  }

  /* Burger mobile */
  .lg2-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--lg2-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body LG2 ── */
  .lg2-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--lg2-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar LG2 ── */
  .lg2-sidebar {
    background: var(--lg2-white);
    border-right: 1px solid var(--lg2-ink);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .lg2-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .lg2-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--lg2-ink);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .lg2-version-badge {
    background: var(--lg2-white);
    border: 1px solid var(--lg2-ink);
    border-radius: var(--lg2-radius);
    color: var(--lg2-red);
    font-family: var(--lg2-font-mono);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .lg2-sidebar-github {
    align-items: center;
    color: var(--lg2-ink);
    display: inline-flex;
    font-family: var(--lg2-font-mono);
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .lg2-sidebar-github:hover,
  .lg2-sidebar-github:focus-visible {
    color: var(--lg2-red);
  }

  .lg2-side-list,
  .lg2-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .lg2-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--lg2-ink);
    display: flex;
    font-family: var(--lg2-font-mono);
    font-size: 0.8125rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .lg2-side-link:hover,
  .lg2-side-link:focus-visible {
    background: var(--lg2-tint);
    color: var(--lg2-red);
    text-decoration: none;
  }

  .lg2-side-link[aria-current="page"] {
    background: var(--lg2-tint);
    border-left-color: var(--lg2-red);
    color: var(--lg2-red);
    font-weight: 700;
    text-decoration: none;
  }

  .lg2-side-link--sub {
    font-size: 0.75rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .lg2-side-divider {
    border-top: 1px solid var(--lg2-ink);
    margin: 0.5rem 0;
  }

  .lg2-side-group {
    display: block;
  }

  .lg2-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--lg2-grey);
    cursor: pointer;
    display: flex;
    font-family: var(--lg2-font-mono);
    font-size: 0.72rem;
    font-weight: 700;
    gap: 0.35rem;
    letter-spacing: 0.06em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 1rem 0 calc(1rem - 3px);
    text-transform: uppercase;
    transition: background 120ms ease;
  }

  .lg2-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .lg2-side-group__summary:hover,
  .lg2-side-group__summary:focus-visible {
    background: var(--lg2-tint);
    outline: none;
  }

  .lg2-side-group :global(.lg2-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .lg2-side-group:not([open]) :global(.lg2-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .lg2-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .lg2-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .lg2-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .lg2-breadcrumb__item {
    align-items: center;
    color: var(--lg2-grey);
    display: inline-flex;
    font-family: var(--lg2-font-mono);
    font-size: 0.8125rem;
  }

  .lg2-breadcrumb__item + .lg2-breadcrumb__item::before {
    color: var(--lg2-grey);
    content: "/";
    margin: 0 0.4rem;
  }

  .lg2-breadcrumb__link {
    color: var(--lg2-ink);
    text-decoration: none;
  }

  .lg2-breadcrumb__link:hover {
    color: var(--lg2-red);
    text-decoration: underline;
  }

  .lg2-breadcrumb__item span[aria-current="page"] {
    color: var(--lg2-ink);
    font-weight: 700;
  }

  /* ── Footer LG2 ── */
  .lg2-footer {
    background: var(--lg2-ink);
    border-top: 3px solid var(--lg2-red); /* filet d'accent rouge */
    margin-top: auto;
  }

  .lg2-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .lg2-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .lg2-footer__link {
    color: var(--lg2-white);
    font-family: var(--lg2-font-mono);
    font-size: 0.8125rem;
    text-decoration: none;
    text-transform: uppercase;
  }

  .lg2-footer__link:hover {
    color: var(--lg2-red);
    text-decoration: underline;
  }

  /* Marque lg2 en blanc / knockout : filtre vers blanc sur la bande noire. */
  .lg2-footer__logo {
    display: block;
    width: auto;
    height: 28px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .lg2-body {
      grid-template-columns: 1fr;
    }

    .lg2-sidebar {
      display: none;
    }

    .lg2-nav {
      display: none;
    }

    .lg2-header__tools {
      display: none;
    }

    .lg2-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .lg2-nav__link,
    .lg2-cta,
    .lg2-search-btn,
    .lg2-side-link,
    .lg2-side-group :global(.lg2-side-group__icon) {
      transition: none;
    }
  }
</style>

<!--
  Chrome documentaire La Vie en Rose (lavieenrose.com — détaillant de lingerie
  et mode féminine québécois ; univers romantique, doux et aérien). Forme
  fidèle à un en-tête de marque mode haut de gamme :
  - Header : bandeau BLANC, clair et aéré, fine ligne d'accent rose en bas du
    bandeau ; logo officiel (marque carrée de la marque) à gauche, ~36-40px de
    haut ; nav horizontale + loupe de recherche compacte ; CTA pilule rose à
    droite
  - Onglet de nav actif : SOULIGNÉ rose #d4667c (l'accent féminin de la marque)
  - Barre latérale gauche : item actif accent rose à gauche + fond tinté rose
    pâle, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande rose pâle / blanche avec liens rose + la marque
  - Couleurs : rose #d4667c (marque / action / lien / loupe / souligné actif),
    rose-foncé #c25068 (hover), encre grise douce #404040 (corps de nav),
    gris secondaire #8a8a8a, hairline #ececec, surface rose pâle #faf2f4
    (hover doux), blanc #ffffff ; radius doux (md 4px, pilules 999px)
  - Logo officiel La Vie en Rose référencé via
    <img src="/chrome/la-vie-en-rose/logo.svg">
  - Typo : grotesk neutre (corps / UI) + serif élégant (titres) ; aucune police
    propriétaire chargée ; fallbacks Helvetica / Georgia.
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

<div class="lvr-shell">
  <!-- ── HEADER LA VIE EN ROSE ── -->
  <div class="lvr-header-wrap">
    <header class="lvr-header" aria-label="La Vie en Rose">
      <div class="lvr-header__inner">
        <!-- Gauche : logo officiel La Vie en Rose (marque carrée de la marque) -->
        <div class="lvr-header__brand">
          <a href="/" class="lvr-header__brand-link" aria-label="Accueil : La Vie en Rose Design System">
            <img
              src="/chrome/la-vie-en-rose/logo.svg"
              alt="La Vie en Rose"
              class="lvr-logo"
              width="40"
              height="40"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="lvr-nav" aria-label="Navigation principale">
          <ul class="lvr-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="lvr-nav__item">
                <a
                  class="lvr-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche La Vie en Rose : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="lvr-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA pilule -->
        <div class="lvr-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="lvr-header__tools-links">
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
          class="lvr-header__burger"
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

  <!-- ── BODY LA VIE EN ROSE ── -->
  <div class="lvr-body">
    <!-- Sidebar -->
    <aside class="lvr-sidebar" aria-label="Navigation de la documentation">
      <nav class="lvr-side-nav" aria-label="Sommaire">
        <ul class="lvr-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="lvr-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="lvr-side-divider" role="separator"></li>

          <li class="lvr-side-heading">
            <a
              class="lvr-side-link lvr-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="lvr-side-group" open={isGroupOpen(group.items)}>
                <summary class="lvr-side-group__summary">
                  <ChevronDown class="lvr-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="lvr-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="lvr-side-link lvr-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="lvr-side-divider" role="separator"></li>

          <li class="lvr-side-heading">
            <a
              class="lvr-side-link lvr-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="lvr-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="lvr-side-group__summary">
                  <ChevronDown class="lvr-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="lvr-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="lvr-side-link lvr-side-link--sub"
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
      <div class="lvr-sidebar-footer">
        <span class="lvr-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="lvr-sidebar-github"
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
    <div class="lvr-content">
      <nav class="lvr-breadcrumb" aria-label="Breadcrumb">
        <ol class="lvr-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="lvr-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="lvr-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER LA VIE EN ROSE ── -->
  <footer class="lvr-footer" aria-label="Pied de page La Vie en Rose">
    <div class="lvr-footer__inner">
      <nav class="lvr-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="lvr-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/la-vie-en-rose/logo.svg"
        alt="La Vie en Rose"
        class="lvr-footer__logo"
        width="38"
        height="38"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables La Vie en Rose (univers rose / blanc aéré) ── */
  .lvr-shell {
    --lvr-rose: #d4667c; /* rose : marque / action / lien / souligné actif */
    --lvr-rose-hover: #c25068; /* rose foncé : hover */
    --lvr-ink: #404040; /* encre grise douce : corps de nav */
    --lvr-ink-strong: #2a2a2a; /* encre plus appuyée (titres / actif) */
    --lvr-grey: #8a8a8a; /* gris secondaire */
    --lvr-grey-muted: #b0b0b0; /* gris clair */
    --lvr-subtle: #faf2f4; /* surface rose pâle / hover doux */
    --lvr-subtle-2: #f3e7eb; /* hover secondaire rose pâle */
    --lvr-border: #ececec; /* hairline */
    --lvr-white: #fff;
    --lvr-sidebar-width: 17rem;
    --lvr-radius: 4px; /* contrôles arrondis doux */
    --lvr-radius-pill: 999px; /* pilules / CTA */
    /* Typo La Vie en Rose : grotesk neutre (corps) ; aucune police propriétaire chargée. */
    --lvr-font-body: helvetica, arial, sans-serif;
    --lvr-font-display: Georgia, Times, serif;
    font-family: var(--lvr-font-body);
    background: var(--lvr-white);
    color: var(--lvr-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header La Vie en Rose ── */
  .lvr-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .lvr-header {
    background: var(--lvr-white);
    border-bottom: 1px solid var(--lvr-border);
    /* Fine ligne d'accent rose en bas du bandeau (l'accent féminin). */
    box-shadow: inset 0 -2px 0 0 var(--lvr-rose);
  }

  .lvr-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .lvr-header__brand {
    flex: 0 0 auto;
  }

  .lvr-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .lvr-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel La Vie en Rose (marque carrée, ratio préservé). */
  .lvr-logo {
    display: block;
    width: auto;
    height: 40px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .lvr-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .lvr-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré doux, hover rose pâle / rose. */
  .lvr-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--lvr-radius);
    color: var(--lvr-rose);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .lvr-search-btn:hover,
  .lvr-search-btn:focus-visible {
    background: var(--lvr-subtle);
    border-color: var(--lvr-rose);
    color: var(--lvr-rose-hover);
    outline: none;
  }

  .lvr-nav__item {
    flex: 0 0 auto;
  }

  .lvr-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--lvr-ink);
    display: inline-flex;
    font-family: var(--lvr-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .lvr-nav__link:hover,
  .lvr-nav__link:focus-visible {
    color: var(--lvr-rose);
    outline: none;
  }

  /* Onglet actif : souligné rose (l'accent féminin La Vie en Rose). */
  .lvr-nav__link[aria-current="page"] {
    border-bottom-color: var(--lvr-rose);
    color: var(--lvr-ink-strong);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .lvr-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .lvr-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .lvr-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .lvr-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--lvr-border);
  }

  /* Overrides switchers dans header La Vie en Rose (champs clairs, bord hairline 1px). */
  .lvr-header__tools-links :global(.docs-header-control) {
    background: var(--lvr-white);
    border-color: var(--lvr-border);
    border-radius: var(--lvr-radius);
    color: var(--lvr-ink);
    font-family: inherit;
  }

  .lvr-header__tools-links :global(.docs-header-control:hover),
  .lvr-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--lvr-subtle);
    border-color: var(--lvr-rose);
    color: var(--lvr-rose);
    box-shadow: none;
  }

  /* CTA pilule rose (signature douce et féminine La Vie en Rose). */
  .lvr-cta {
    align-items: center;
    background: var(--lvr-rose);
    border: 1px solid var(--lvr-rose);
    border-radius: var(--lvr-radius-pill);
    color: var(--lvr-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--lvr-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .lvr-cta:hover,
  .lvr-cta:focus-visible {
    background: var(--lvr-rose-hover);
    border-color: var(--lvr-rose-hover);
    color: var(--lvr-white);
    outline: none;
  }

  /* Burger mobile */
  .lvr-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--lvr-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body La Vie en Rose ── */
  .lvr-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--lvr-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar La Vie en Rose ── */
  .lvr-sidebar {
    background: var(--lvr-white);
    border-right: 1px solid var(--lvr-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .lvr-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .lvr-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--lvr-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .lvr-version-badge {
    background: var(--lvr-subtle);
    border: 1px solid var(--lvr-border);
    border-radius: var(--lvr-radius);
    color: var(--lvr-rose);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .lvr-sidebar-github {
    align-items: center;
    color: var(--lvr-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .lvr-sidebar-github:hover,
  .lvr-sidebar-github:focus-visible {
    color: var(--lvr-rose);
  }

  .lvr-side-list,
  .lvr-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .lvr-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--lvr-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .lvr-side-link:hover,
  .lvr-side-link:focus-visible {
    background: var(--lvr-subtle);
    color: var(--lvr-rose);
    text-decoration: none;
  }

  .lvr-side-link[aria-current="page"] {
    background: var(--lvr-subtle);
    border-left-color: var(--lvr-rose);
    color: var(--lvr-rose);
    font-weight: 700;
    text-decoration: none;
  }

  .lvr-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .lvr-side-divider {
    border-top: 1px solid var(--lvr-border);
    margin: 0.5rem 0;
  }

  .lvr-side-group {
    display: block;
  }

  .lvr-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--lvr-grey);
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
    transition: background 120ms ease;
  }

  .lvr-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .lvr-side-group__summary:hover,
  .lvr-side-group__summary:focus-visible {
    background: var(--lvr-subtle);
    outline: none;
  }

  .lvr-side-group :global(.lvr-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .lvr-side-group:not([open]) :global(.lvr-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .lvr-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .lvr-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .lvr-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .lvr-breadcrumb__item {
    align-items: center;
    color: var(--lvr-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .lvr-breadcrumb__item + .lvr-breadcrumb__item::before {
    color: var(--lvr-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .lvr-breadcrumb__link {
    color: var(--lvr-ink);
    text-decoration: none;
  }

  .lvr-breadcrumb__link:hover {
    color: var(--lvr-rose);
    text-decoration: underline;
  }

  .lvr-breadcrumb__item span[aria-current="page"] {
    color: var(--lvr-ink-strong);
    font-weight: 600;
  }

  /* ── Footer La Vie en Rose ── */
  .lvr-footer {
    background: var(--lvr-subtle);
    border-top: 1px solid var(--lvr-border);
    margin-top: auto;
  }

  .lvr-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .lvr-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .lvr-footer__link {
    color: var(--lvr-rose);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .lvr-footer__link:hover {
    color: var(--lvr-rose-hover);
    text-decoration: underline;
  }

  .lvr-footer__logo {
    display: block;
    width: auto;
    height: 38px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .lvr-body {
      grid-template-columns: 1fr;
    }

    .lvr-sidebar {
      display: none;
    }

    .lvr-nav {
      display: none;
    }

    .lvr-header__tools {
      display: none;
    }

    .lvr-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .lvr-nav__link,
    .lvr-cta,
    .lvr-search-btn,
    .lvr-side-link,
    .lvr-side-group :global(.lvr-side-group__icon) {
      transition: none;
    }
  }
</style>

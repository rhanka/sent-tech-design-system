<!--
  Chrome documentaire Van Houtte (vanhoutte.com — l'emblématique torréfacteur
  québécois fondé en 1919 ; chaleureux, artisanal, esprit café). Forme fidèle au
  ton « café » de la marque :
  - Header : bandeau CRÈME CHAUD #f6f0e8 (crème de café), texte/nav presque noir
    #1a1a1a, ambiance café cosy, fin filet chaud #e6ddd2 ; logo Van Houtte
    (mot-symbole bordeaux « VAN HOUTTE ») à gauche ; nav horizontale au centre +
    loupe de recherche ; CTA pilule bordeaux à droite
  - Onglet de nav actif : SOULIGNÉ bordeaux #9e1b32 (l'indicateur de marque)
  - Loupe de recherche : icône bordeaux #9e1b32 ; rayons chaleureux/amicaux
  - Barre latérale gauche : item actif accent bordeaux à gauche + fond crème
    plus profond #efe3da, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande bordeaux profond #9e1b32, liens crème/blanc, filet d'accent
    or #c8a45c, mot-symbole VAN HOUTTE en réserve crème (filtré blanc)
  - Couleurs de marque Van Houtte : bordeaux-rouge #9e1b32 (marque / action /
    lien / actif), or #c8a45c (accent), encre #1a1a1a (corps), crème #f6f0e8
    (surface header), filet chaud #e6ddd2 (hairline), crème profonde #efe3da
    (hover) ; rayons doux et chaleureux (md 5px, pilules 999px)
  - Logo Van Houtte (mot-symbole bordeaux) référencé via
    <img src="/chrome/van-houtte/logo.svg">
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

<div class="vh-shell">
  <!-- ── HEADER VAN HOUTTE ── -->
  <div class="vh-header-wrap">
    <header class="vh-header" aria-label="Van Houtte">
      <div class="vh-header__inner">
        <!-- Gauche : mot-symbole Van Houtte (bordeaux) -->
        <div class="vh-header__brand">
          <a href="/" class="vh-header__brand-link" aria-label="Accueil : Van Houtte Design System">
            <img
              src="/chrome/van-houtte/logo.svg"
              alt="Van Houtte"
              class="vh-logo"
              width="150"
              height="22"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="vh-nav" aria-label="Navigation principale">
          <ul class="vh-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="vh-nav__item">
                <a
                  class="vh-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Van Houtte : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="vh-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA pilule -->
        <div class="vh-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="vh-header__tools-links">
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
          class="vh-header__burger"
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

  <!-- ── BODY VAN HOUTTE ── -->
  <div class="vh-body">
    <!-- Sidebar -->
    <aside class="vh-sidebar" aria-label="Navigation de la documentation">
      <nav class="vh-side-nav" aria-label="Sommaire">
        <ul class="vh-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="vh-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="vh-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="vh-side-group" open={isGroupOpen(group.items)}>
                <summary class="vh-side-group__summary">
                  <ChevronDown class="vh-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="vh-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="vh-side-link vh-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="vh-side-divider" role="separator"></li>

          <li>
            <a
              class="vh-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="vh-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="vh-side-group__summary">
                  <ChevronDown class="vh-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="vh-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="vh-side-link vh-side-link--sub"
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
      <div class="vh-sidebar-footer">
        <span class="vh-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="vh-sidebar-github"
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
    <div class="vh-content">
      <nav class="vh-breadcrumb" aria-label="Breadcrumb">
        <ol class="vh-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="vh-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="vh-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER VAN HOUTTE ── -->
  <footer class="vh-footer" aria-label="Pied de page Van Houtte">
    <div class="vh-footer__inner">
      <nav class="vh-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="vh-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/van-houtte/logo.svg"
        alt="Van Houtte"
        class="vh-footer__logo"
        width="150"
        height="22"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Van Houtte (couleurs de marque) ── */
  .vh-shell {
    --vh-maroon: #9e1b32; /* bordeaux-rouge : marque / action / lien / actif */
    --vh-maroon-hover: #841627; /* bordeaux assombri : hover */
    --vh-gold: #c8a45c; /* or : accent / filet */
    --vh-ink: #1a1a1a; /* encre : texte primaire (presque noir) */
    --vh-ink-inverse: #f6f0e8; /* surface inverse (réserve crème footer) */
    --vh-grey: #7a6f63; /* gris chaud secondaire */
    --vh-grey-muted: #a89c8d; /* gris chaud clair */
    --vh-cream: #f6f0e8; /* crème de café : surface header */
    --vh-cream-deep: #efe3da; /* crème profonde : hover doux */
    --vh-border: #e6ddd2; /* filet chaud (hairline) */
    --vh-white: #fff;
    --vh-sidebar-width: 17rem;
    --vh-radius: 5px; /* contrôles arrondis doux / chaleureux */
    --vh-radius-pill: 999px; /* pilules / CTA */
    /* Typo Van Houtte : sans chaleureux pour le corps ; serif pour le display. */
    --vh-font-body: 'Helvetica Neue', helvetica, arial, sans-serif;
    --vh-font-display: Georgia, 'Times New Roman', serif;
    font-family: var(--vh-font-body);
    background: var(--vh-white);
    color: var(--vh-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Van Houtte ── */
  .vh-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .vh-header {
    background: var(--vh-cream);
    border-bottom: 1px solid var(--vh-border);
  }

  .vh-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .vh-header__brand {
    flex: 0 0 auto;
  }

  .vh-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .vh-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Mot-symbole Van Houtte (bordeaux, ratio préservé, ~22px de haut). */
  .vh-logo {
    display: block;
    width: auto;
    height: 22px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .vh-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .vh-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : icône bordeaux, hover crème. */
  .vh-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--vh-radius);
    color: var(--vh-maroon);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .vh-search-btn:hover,
  .vh-search-btn:focus-visible {
    background: var(--vh-cream-deep);
    border-color: var(--vh-maroon);
    color: var(--vh-maroon);
    outline: none;
  }

  .vh-nav__item {
    flex: 0 0 auto;
  }

  .vh-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--vh-ink);
    display: inline-flex;
    font-family: var(--vh-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .vh-nav__link:hover,
  .vh-nav__link:focus-visible {
    color: var(--vh-maroon);
    outline: none;
  }

  /* Onglet actif : souligné bordeaux (l'indicateur de marque Van Houtte). */
  .vh-nav__link[aria-current="page"] {
    border-bottom-color: var(--vh-maroon);
    color: var(--vh-maroon);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .vh-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .vh-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .vh-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .vh-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--vh-border);
  }

  /* Overrides switchers dans header Van Houtte (champs crème, bord hairline 1px). */
  .vh-header__tools-links :global(.docs-header-control) {
    background: var(--vh-white);
    border-color: var(--vh-border);
    border-radius: var(--vh-radius);
    color: var(--vh-ink);
    font-family: inherit;
  }

  .vh-header__tools-links :global(.docs-header-control:hover),
  .vh-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--vh-cream-deep);
    border-color: var(--vh-maroon);
    color: var(--vh-maroon);
    box-shadow: none;
  }

  /* CTA pilule bordeaux (signature chaleureuse Van Houtte). */
  .vh-cta {
    align-items: center;
    background: var(--vh-maroon);
    border: 1px solid var(--vh-maroon);
    border-radius: var(--vh-radius-pill);
    color: var(--vh-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--vh-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .vh-cta:hover,
  .vh-cta:focus-visible {
    background: var(--vh-maroon-hover);
    border-color: var(--vh-maroon-hover);
    color: var(--vh-white);
    outline: none;
  }

  /* Burger mobile */
  .vh-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--vh-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Van Houtte ── */
  .vh-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--vh-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Van Houtte ── */
  .vh-sidebar {
    background: var(--vh-white);
    border-right: 1px solid var(--vh-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .vh-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .vh-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--vh-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .vh-version-badge {
    background: var(--vh-cream);
    border: 1px solid var(--vh-border);
    border-radius: var(--vh-radius);
    color: var(--vh-maroon);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .vh-sidebar-github {
    align-items: center;
    color: var(--vh-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .vh-sidebar-github:hover,
  .vh-sidebar-github:focus-visible {
    color: var(--vh-maroon);
  }

  .vh-side-list,
  .vh-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .vh-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--vh-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .vh-side-link:hover,
  .vh-side-link:focus-visible {
    background: var(--vh-cream-deep);
    color: var(--vh-maroon);
    text-decoration: none;
  }

  .vh-side-link[aria-current="page"] {
    background: var(--vh-cream-deep);
    border-left-color: var(--vh-maroon);
    color: var(--vh-maroon);
    font-weight: 700;
    text-decoration: none;
  }

  .vh-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .vh-side-divider {
    border-top: 1px solid var(--vh-border);
    margin: 0.5rem 0;
  }

  .vh-side-group {
    display: block;
  }

  .vh-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--vh-grey);
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

  .vh-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .vh-side-group__summary:hover,
  .vh-side-group__summary:focus-visible {
    background: var(--vh-cream-deep);
    outline: none;
  }

  .vh-side-group :global(.vh-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .vh-side-group:not([open]) :global(.vh-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .vh-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .vh-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .vh-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .vh-breadcrumb__item {
    align-items: center;
    color: var(--vh-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .vh-breadcrumb__item + .vh-breadcrumb__item::before {
    color: var(--vh-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .vh-breadcrumb__link {
    color: var(--vh-ink);
    text-decoration: none;
  }

  .vh-breadcrumb__link:hover {
    color: var(--vh-maroon);
    text-decoration: underline;
  }

  .vh-breadcrumb__item span[aria-current="page"] {
    color: var(--vh-ink);
    font-weight: 600;
  }

  /* ── Footer Van Houtte ── */
  .vh-footer {
    background: var(--vh-maroon);
    border-top: 3px solid var(--vh-gold);
    margin-top: auto;
  }

  .vh-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .vh-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .vh-footer__link {
    color: var(--vh-cream);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .vh-footer__link:hover {
    color: var(--vh-white);
    text-decoration: underline;
    text-decoration-color: var(--vh-gold);
  }

  /* Mot-symbole VAN HOUTTE en réserve crème (filtré blanc/crème sur fond bordeaux). */
  .vh-footer__logo {
    display: block;
    width: auto;
    height: 22px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
    opacity: 0.95;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .vh-body {
      grid-template-columns: 1fr;
    }

    .vh-sidebar {
      display: none;
    }

    .vh-nav {
      display: none;
    }

    .vh-header__tools {
      display: none;
    }

    .vh-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .vh-nav__link,
    .vh-cta,
    .vh-search-btn,
    .vh-side-link,
    .vh-side-group :global(.vh-side-group__icon) {
      transition: none;
    }
  }
</style>

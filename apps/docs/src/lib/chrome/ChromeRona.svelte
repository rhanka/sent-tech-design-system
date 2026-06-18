<!--
  Chrome documentaire RONA (rona.ca — le détaillant québécois de rénovation et
  quincaillerie, ton audacieux et amical, refondu par lg2). Forme fidèle à
  l'en-tête réel de rona.ca :
  - Header : bandeau BLANC, fin liseré bas hairline (#e2e2e2) + accent CHARTREUSE
    signature RONA (#e1fa00) en filet supérieur ; logo officiel RONA (wordmark
    navy #002E56) à gauche ; nav horizontale au centre + loupe de recherche
    bleue (#0046AD) ; switchers + CTA à droite
  - Onglet de nav actif : SOULIGNÉ chartreuse #e1fa00 (l'indicateur signature
    RONA) sur du texte bleu #0046AD pour la lisibilité
  - Loupe de recherche : icône bleu RONA #0046AD
  - Barre latérale gauche : item actif accent bleu #0046AD à gauche + fond tinté
    bleu pâle (#eef3fb), sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande NAVY #002E56, liens blancs, filet d'accent chartreuse, zone
    wordmark RONA en knockout blanc
  - Couleurs RONA : bleu #0046AD primaire (nav active, loupe, hovers), navy
    #002E56 (logo / emphase / footer), chartreuse #e1fa00 (accent / indicateur),
    encre #111827 (corps), hairline #e2e2e2, tinte hover #eef3fb, blanc #ffffff
  - Logo officiel RONA (wordmark navy) référencé via
    <img src="/chrome/rona/logo.svg">
  - Typo : grotesk neutre (corps / UI) ; on ne charge AUCUNE police
    propriétaire ; fallbacks système (Helvetica / Arial).
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

<div class="rona-shell">
  <!-- ── HEADER RONA ── -->
  <div class="rona-header-wrap">
    <header class="rona-header" aria-label="RONA">
      <div class="rona-header__inner">
        <!-- Gauche : logo officiel RONA (wordmark navy) -->
        <div class="rona-header__brand">
          <a href="/" class="rona-header__brand-link" aria-label="Accueil : RONA Design System">
            <img
              src="/chrome/rona/logo.svg"
              alt="RONA"
              class="rona-logo"
              width="80"
              height="24"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="rona-nav" aria-label="Navigation principale">
          <ul class="rona-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="rona-nav__item">
                <a
                  class="rona-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche RONA : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="rona-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA pilule -->
        <div class="rona-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="rona-header__tools-links">
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
          class="rona-header__burger"
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

  <!-- ── BODY RONA ── -->
  <div class="rona-body">
    <!-- Sidebar -->
    <aside class="rona-sidebar" aria-label="Navigation de la documentation">
      <nav class="rona-side-nav" aria-label="Sommaire">
        <ul class="rona-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="rona-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="rona-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="rona-side-group" open={isGroupOpen(group.items)}>
                <summary class="rona-side-group__summary">
                  <ChevronDown class="rona-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="rona-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="rona-side-link rona-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="rona-side-divider" role="separator"></li>

          <li>
            <a
              class="rona-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="rona-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="rona-side-group__summary">
                  <ChevronDown class="rona-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="rona-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="rona-side-link rona-side-link--sub"
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
      <div class="rona-sidebar-footer">
        <span class="rona-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="rona-sidebar-github"
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
    <div class="rona-content">
      <nav class="rona-breadcrumb" aria-label="Breadcrumb">
        <ol class="rona-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="rona-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="rona-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER RONA ── -->
  <footer class="rona-footer" aria-label="Pied de page RONA">
    <div class="rona-footer__inner">
      <nav class="rona-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="rona-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/rona/logo.svg"
        alt="RONA"
        class="rona-footer__logo"
        width="74"
        height="22"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables RONA (rona.ca) ── */
  .rona-shell {
    --rona-blue: #0046ad; /* bleu RONA primaire : nav active, loupe, hovers */
    --rona-blue-hover: #003a8f; /* bleu assombri : hover CTA */
    --rona-navy: #002e56; /* navy : logo / emphase / footer */
    --rona-chartreuse: #e1fa00; /* chartreuse signature : accent / indicateur */
    --rona-ink: #111827; /* encre : texte primaire */
    --rona-grey: #6b7280; /* gris secondaire */
    --rona-grey-muted: #9ca3af; /* gris clair */
    --rona-subtle: #eef3fb; /* tinte hover bleu pâle */
    --rona-subtle-2: #e5edf8; /* hover secondaire */
    --rona-border: #e2e2e2; /* hairline */
    --rona-white: #fff;
    --rona-sidebar-width: 17rem;
    --rona-radius: 4px; /* contrôles arrondis doux */
    --rona-radius-pill: 999px; /* pilules / CTA */
    /* Typo RONA : grotesk neutre ; aucune police propriétaire chargée. */
    --rona-font-body: helvetica, arial, sans-serif;
    font-family: var(--rona-font-body);
    background: var(--rona-white);
    color: var(--rona-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header RONA ── */
  .rona-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .rona-header {
    background: var(--rona-white);
    /* Filet supérieur chartreuse signature RONA + hairline bas. */
    border-top: 3px solid var(--rona-chartreuse);
    border-bottom: 1px solid var(--rona-border);
  }

  .rona-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .rona-header__brand {
    flex: 0 0 auto;
  }

  .rona-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .rona-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel RONA (wordmark navy, ratio préservé). */
  .rona-logo {
    display: block;
    width: auto;
    height: 24px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .rona-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .rona-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré doux, icône bleu RONA. */
  .rona-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--rona-radius);
    color: var(--rona-blue);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .rona-search-btn:hover,
  .rona-search-btn:focus-visible {
    background: var(--rona-subtle);
    border-color: var(--rona-blue);
    color: var(--rona-blue);
    outline: none;
  }

  .rona-nav__item {
    flex: 0 0 auto;
  }

  .rona-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--rona-ink);
    display: inline-flex;
    font-family: var(--rona-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .rona-nav__link:hover,
  .rona-nav__link:focus-visible {
    color: var(--rona-blue);
    outline: none;
  }

  /* Onglet actif : souligné chartreuse signature RONA, texte bleu pour la lisibilité. */
  .rona-nav__link[aria-current="page"] {
    border-bottom-color: var(--rona-chartreuse);
    color: var(--rona-blue);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .rona-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .rona-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .rona-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .rona-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--rona-border);
  }

  /* Overrides switchers dans header RONA (champs clairs, bord hairline 1px). */
  .rona-header__tools-links :global(.docs-header-control) {
    background: var(--rona-white);
    border-color: var(--rona-border);
    border-radius: var(--rona-radius);
    color: var(--rona-ink);
    font-family: inherit;
  }

  .rona-header__tools-links :global(.docs-header-control:hover),
  .rona-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--rona-subtle);
    border-color: var(--rona-blue);
    color: var(--rona-blue);
    box-shadow: none;
  }

  /* CTA pilule bleu RONA (action principale). */
  .rona-cta {
    align-items: center;
    background: var(--rona-blue);
    border: 1px solid var(--rona-blue);
    border-radius: var(--rona-radius-pill);
    color: var(--rona-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--rona-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .rona-cta:hover,
  .rona-cta:focus-visible {
    background: var(--rona-blue-hover);
    border-color: var(--rona-blue-hover);
    color: var(--rona-white);
    outline: none;
  }

  /* Burger mobile */
  .rona-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--rona-navy);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body RONA ── */
  .rona-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--rona-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar RONA ── */
  .rona-sidebar {
    background: var(--rona-white);
    border-right: 1px solid var(--rona-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .rona-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .rona-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--rona-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .rona-version-badge {
    background: var(--rona-subtle);
    border: 1px solid var(--rona-border);
    border-radius: var(--rona-radius);
    color: var(--rona-blue);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .rona-sidebar-github {
    align-items: center;
    color: var(--rona-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .rona-sidebar-github:hover,
  .rona-sidebar-github:focus-visible {
    color: var(--rona-blue);
  }

  .rona-side-list,
  .rona-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .rona-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--rona-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .rona-side-link:hover,
  .rona-side-link:focus-visible {
    background: var(--rona-subtle);
    color: var(--rona-blue);
    text-decoration: none;
  }

  .rona-side-link[aria-current="page"] {
    background: var(--rona-subtle);
    border-left-color: var(--rona-blue);
    color: var(--rona-blue);
    font-weight: 700;
    text-decoration: none;
  }

  .rona-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .rona-side-divider {
    border-top: 1px solid var(--rona-border);
    margin: 0.5rem 0;
  }

  .rona-side-group {
    display: block;
  }

  .rona-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--rona-grey);
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

  .rona-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .rona-side-group__summary:hover,
  .rona-side-group__summary:focus-visible {
    background: var(--rona-subtle);
    outline: none;
  }

  .rona-side-group :global(.rona-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .rona-side-group:not([open]) :global(.rona-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .rona-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .rona-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .rona-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .rona-breadcrumb__item {
    align-items: center;
    color: var(--rona-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .rona-breadcrumb__item + .rona-breadcrumb__item::before {
    color: var(--rona-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .rona-breadcrumb__link {
    color: var(--rona-blue);
    text-decoration: none;
  }

  .rona-breadcrumb__link:hover {
    color: var(--rona-blue-hover);
    text-decoration: underline;
  }

  .rona-breadcrumb__item span[aria-current="page"] {
    color: var(--rona-ink);
    font-weight: 600;
  }

  /* ── Footer RONA ── */
  .rona-footer {
    background: var(--rona-navy);
    /* Filet d'accent chartreuse signature RONA. */
    border-top: 3px solid var(--rona-chartreuse);
    margin-top: auto;
  }

  .rona-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .rona-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .rona-footer__link {
    color: var(--rona-white);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .rona-footer__link:hover {
    color: var(--rona-chartreuse);
    text-decoration: underline;
  }

  /* Zone wordmark RONA en knockout blanc sur le navy. */
  .rona-footer__logo {
    display: block;
    width: auto;
    height: 22px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .rona-body {
      grid-template-columns: 1fr;
    }

    .rona-sidebar {
      display: none;
    }

    .rona-nav {
      display: none;
    }

    .rona-header__tools {
      display: none;
    }

    .rona-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .rona-nav__link,
    .rona-cta,
    .rona-search-btn,
    .rona-side-link,
    .rona-side-group :global(.rona-side-group__icon) {
      transition: none;
    }
  }
</style>

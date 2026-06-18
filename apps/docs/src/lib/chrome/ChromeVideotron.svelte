<!--
  Chrome documentaire Vidéotron (videotron.com — le télécom québécois de Québecor :
  internet, mobile, télé). Forme fidèle à l'en-tête réel de videotron.com (build
  Drupal « dxp_front », méga-menu `bf-mega-menu`) :
  - Header : barre BLANCHE (mesurée `--bf-color-bg-ground:#ffffff`), lockup de marque
    à gauche = carré JAUNE Vidéotron (#ffd200, flèche noire) + mot-symbole « Vidéotron »
    JAUNE (le SVG officiel `fill:var(--bf-color-brand)` = #ffd200), nav horizontale
    charcoal, loupe de recherche compacte, CTA pilule JAUNE (texte charcoal)
  - Onglet de nav actif : SOULIGNÉ jaune Vidéotron (le `tabs.indicatorSide:bottom`
    mesuré), label charcoal gras
  - Barre latérale gauche : item actif accent jaune à gauche + fond jaune tinté,
    sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande claire avec liens + le lockup Vidéotron
  - Couleurs mesurées (theme-videotron) : jaune marque #ffd200 (action), jaune profond
    #e0b400 (hover), encre charcoal #2a2a27 (texte/labels), slate chaud #575754
    (secondaire), gris chaud sourd #9b9b95 (placeholder), bord de champ #bebeb7,
    divider chaud #e0e0da, surface faible chaude #f2f2f0, blanc #ffffff ; radius 4px
    (`--bf-border-radius-small`), pilules 999px (CTA)
  - Logos officiels Vidéotron (vecteurs extraits du méga-menu live) référencés via
    <img src="/chrome/videotron/mark.svg"> (carré) + <img src="/chrome/videotron/logo.svg"> (mot)
  - Typo : 'Nunito Sans' (corps/UI, mesurée 89× font-family) + 'Urbanist' (display /
    labels CTA en capitales 700), chargées via Google Fonts dans <svelte:head>
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

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700&family=Urbanist:wght@600;700;800&display=swap"
  />
</svelte:head>

<div class="vt-shell">
  <!-- ── HEADER VIDÉOTRON ── -->
  <div class="vt-header-wrap">
    <header class="vt-header" aria-label="Vidéotron">
      <div class="vt-header__inner">
        <!-- Gauche : lockup officiel (carré jaune + mot-symbole) -->
        <div class="vt-header__brand">
          <a href="/" class="vt-header__brand-link" aria-label="Accueil : Vidéotron Design System">
            <img
              src="/chrome/videotron/mark.svg"
              alt=""
              class="vt-mark"
              width="24"
              height="24"
              aria-hidden="true"
            />
            <img
              src="/chrome/videotron/logo.svg"
              alt="Vidéotron"
              class="vt-logo"
              width="91"
              height="24"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="vt-nav" aria-label="Navigation principale">
          <ul class="vt-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="vt-nav__item">
                <a
                  class="vt-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Vidéotron : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="vt-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA jaune -->
        <div class="vt-header__tools">
          <div class="vt-header__tools-links">
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
          class="vt-header__burger"
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

  <!-- ── BODY VIDÉOTRON ── -->
  <div class="vt-body">
    <!-- Sidebar -->
    <aside class="vt-sidebar" aria-label="Navigation de la documentation">
      <nav class="vt-side-nav" aria-label="Sommaire">
        <ul class="vt-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="vt-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="vt-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="vt-side-group" open={isGroupOpen(group.items)}>
                <summary class="vt-side-group__summary">
                  <ChevronDown class="vt-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="vt-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="vt-side-link vt-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="vt-side-divider" role="separator"></li>

          <li>
            <a
              class="vt-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="vt-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="vt-side-group__summary">
                  <ChevronDown class="vt-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="vt-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="vt-side-link vt-side-link--sub"
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
      <div class="vt-sidebar-footer">
        <span class="vt-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="vt-sidebar-github"
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
    <div class="vt-content">
      <nav class="vt-breadcrumb" aria-label="Breadcrumb">
        <ol class="vt-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="vt-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="vt-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER VIDÉOTRON ── -->
  <footer class="vt-footer" aria-label="Pied de page Vidéotron">
    <div class="vt-footer__inner">
      <nav class="vt-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="vt-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <a href="/" class="vt-footer__brand-link" aria-label="Vidéotron">
        <img
          src="/chrome/videotron/mark.svg"
          alt=""
          class="vt-footer__mark"
          width="24"
          height="24"
          aria-hidden="true"
        />
        <img
          src="/chrome/videotron/logo.svg"
          alt="Vidéotron"
          class="vt-footer__logo"
          width="91"
          height="24"
        />
      </a>
    </div>
  </footer>
</div>

<style>
  /* ── Variables Vidéotron (mesurées theme-videotron / brand css_*.css) ── */
  .vt-shell {
    --vt-yellow: #ffd200; /* jaune marque / action (.btn-primary, 306×) */
    --vt-yellow-deep: #e0b400; /* jaune profond / hover (123×) */
    --vt-yellow-tint: #fff2b8; /* jaune tinté faible (fond actif) */
    --vt-ink: #2a2a27; /* encre charcoal (texte + label sur jaune, 134×) */
    --vt-ink-contrast: #1e1e1b; /* encre la plus forte (78×) */
    --vt-slate: #575754; /* texte secondaire / champ (89×) */
    --vt-grey-muted: #9b9b95; /* gris chaud sourd / placeholder (193×) */
    --vt-border: #e0e0da; /* divider chaud / bord subtil (161×) */
    --vt-border-strong: #bebeb7; /* bord de champ (1px, 91×) */
    --vt-surface-subtle: #f2f2f0; /* surface faible chaude (97×) */
    --vt-white: #fff; /* surface par défaut */
    --vt-sidebar-width: 17rem;
    --vt-radius: 4px; /* --bf-border-radius-small (btn + form-control) */
    --vt-radius-pill: 999px; /* pilules / CTA */
    font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: var(--vt-white);
    color: var(--vt-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Vidéotron ── */
  .vt-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .vt-header {
    background: var(--vt-white);
    border-bottom: 1px solid var(--vt-border);
  }

  .vt-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .vt-header__brand {
    flex: 0 0 auto;
  }

  /* Lockup officiel : carré jaune + mot-symbole, ratio préservé (~24px de haut). */
  .vt-header__brand-link {
    align-items: center;
    display: inline-flex;
    gap: 0.5rem;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .vt-header__brand-link:hover {
    opacity: 0.85;
  }

  .vt-mark {
    display: block;
    width: auto;
    height: 28px;
    border-radius: 2px;
  }

  .vt-logo {
    display: block;
    width: auto;
    height: 24px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .vt-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .vt-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré 4px, hover jaune tinté. */
  .vt-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--vt-radius);
    color: var(--vt-ink);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .vt-search-btn:hover,
  .vt-search-btn:focus-visible {
    background: var(--vt-yellow-tint);
    border-color: var(--vt-yellow);
    color: var(--vt-ink);
    outline: none;
  }

  .vt-nav__item {
    flex: 0 0 auto;
  }

  .vt-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--vt-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .vt-nav__link:hover,
  .vt-nav__link:focus-visible {
    color: var(--vt-ink-contrast);
    border-bottom-color: var(--vt-border-strong);
    outline: none;
  }

  /* Onglet actif : soulignement jaune Vidéotron (indicatorSide:bottom mesuré). */
  .vt-nav__link[aria-current="page"] {
    border-bottom-color: var(--vt-yellow);
    color: var(--vt-ink);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .vt-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .vt-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .vt-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .vt-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--vt-border);
  }

  /* Overrides switchers dans header Vidéotron (champs blancs, bord chaud 1px). */
  .vt-header__tools-links :global(.docs-header-control) {
    background: var(--vt-white);
    border-color: var(--vt-border-strong);
    border-radius: var(--vt-radius);
    color: var(--vt-ink);
    font-family: inherit;
  }

  .vt-header__tools-links :global(.docs-header-control:hover),
  .vt-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--vt-yellow-tint);
    border-color: var(--vt-yellow);
    color: var(--vt-ink);
    box-shadow: none;
  }

  /* CTA pilule jaune (label charcoal, capitales display) : signature Vidéotron. */
  .vt-cta {
    align-items: center;
    background: var(--vt-yellow);
    border: 1px solid var(--vt-yellow);
    border-radius: var(--vt-radius-pill);
    color: var(--vt-ink);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: 'Urbanist', 'Nunito Sans', system-ui, sans-serif;
    font-size: 0.8125rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.04em;
    padding: 0 1.25rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .vt-cta:hover,
  .vt-cta:focus-visible {
    background: var(--vt-yellow-deep);
    border-color: var(--vt-yellow-deep);
    color: var(--vt-ink);
    outline: none;
  }

  /* Burger mobile */
  .vt-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--vt-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Vidéotron ── */
  .vt-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--vt-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Vidéotron ── */
  .vt-sidebar {
    background: var(--vt-white);
    border-right: 1px solid var(--vt-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .vt-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .vt-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--vt-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .vt-version-badge {
    background: var(--vt-surface-subtle);
    border: 1px solid var(--vt-border);
    border-radius: var(--vt-radius);
    color: var(--vt-ink);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .vt-sidebar-github {
    align-items: center;
    color: var(--vt-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .vt-sidebar-github:hover,
  .vt-sidebar-github:focus-visible {
    color: var(--vt-ink-contrast);
    text-decoration: underline;
  }

  .vt-side-list,
  .vt-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .vt-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--vt-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .vt-side-link:hover,
  .vt-side-link:focus-visible {
    background: var(--vt-surface-subtle);
    color: var(--vt-ink-contrast);
    text-decoration: none;
  }

  .vt-side-link[aria-current="page"] {
    background: var(--vt-yellow-tint);
    border-left-color: var(--vt-yellow);
    color: var(--vt-ink-contrast);
    font-weight: 700;
    text-decoration: none;
  }

  .vt-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .vt-side-divider {
    border-top: 1px solid var(--vt-border);
    margin: 0.5rem 0;
  }

  .vt-side-group {
    display: block;
  }

  .vt-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--vt-slate);
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

  .vt-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .vt-side-group__summary:hover,
  .vt-side-group__summary:focus-visible {
    background: var(--vt-surface-subtle);
    outline: none;
  }

  .vt-side-group :global(.vt-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .vt-side-group:not([open]) :global(.vt-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .vt-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .vt-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .vt-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .vt-breadcrumb__item {
    align-items: center;
    color: var(--vt-slate);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .vt-breadcrumb__item + .vt-breadcrumb__item::before {
    color: var(--vt-grey-muted);
    content: "›";
    margin: 0 0.4rem;
  }

  .vt-breadcrumb__link {
    color: var(--vt-ink);
    text-decoration: none;
  }

  .vt-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .vt-breadcrumb__item span[aria-current="page"] {
    color: var(--vt-ink);
    font-weight: 700;
  }

  /* ── Footer Vidéotron ── */
  .vt-footer {
    background: var(--vt-surface-subtle);
    border-top: 1px solid var(--vt-border);
    margin-top: auto;
  }

  .vt-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .vt-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .vt-footer__link {
    color: var(--vt-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .vt-footer__link:hover {
    color: var(--vt-ink-contrast);
    text-decoration: underline;
  }

  .vt-footer__brand-link {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    gap: 0.5rem;
    text-decoration: none;
  }

  .vt-footer__mark {
    display: block;
    width: auto;
    height: 26px;
    border-radius: 2px;
  }

  .vt-footer__logo {
    display: block;
    width: auto;
    height: 22px;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .vt-body {
      grid-template-columns: 1fr;
    }

    .vt-sidebar {
      display: none;
    }

    .vt-nav {
      display: none;
    }

    .vt-header__tools {
      display: none;
    }

    .vt-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .vt-nav__link,
    .vt-cta,
    .vt-search-btn,
    .vt-side-link,
    .vt-side-group :global(.vt-side-group__icon) {
      transition: none;
    }
  }
</style>

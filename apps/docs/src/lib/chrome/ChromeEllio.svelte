<!--
  Chrome documentaire Ellio (ellio.ca / en.ellio.ca).
  Forme fidèle à l'en-tête réel d'Ellio — cabinet-conseil québécois en
  développement durable, B Corp certifié, site Webflow :
  - Header : barre BLANCHE, wordmark Ellio (bleu + swirl empreinte bleu→vert)
    à gauche, nav horizontale, CTA bleu→vert au survol à droite, loupe de
    recherche compacte (façon CGI)
  - Onglet de nav actif : SOULIGNÉ bleu de marque
  - Barre latérale gauche : item actif accent bleu à gauche + fond bleu tinté,
    sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : surface bleu de marque (inverse) avec liens + wordmark
  - Couleurs MESURÉES (theme-ellio) : bleu #194f90 (primaire / liens / nav),
    vert #00c08b (accent, survol bleu→vert), vert profond #0ca783,
    encre #333333, gris secondaire #464444, gris muet #959595,
    bord #bdb9b9, surface subtile #f1f1f1, blanc #ffffff
  - Typo : 'Exo' (tout l'habillage Ellio), chargée via Google Fonts.
    Les CTA / nav active sont en MAJUSCULES (signature Ellio).
  - Pas de SVG officiel publié (ellio.ca ne sert qu'un PNG d'en-tête) : le
    wordmark est un REBUILD vectoriel fidèle référencé via
    <img src="/chrome/ellio/logo.svg">.
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
    buildTopNav,
    resolveBreadcrumb,
    type ComponentNavItem
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
    mobileMenuOpen,
    onMobileMenuToggle,
  }: Props = $props();

  const topNavItems = $derived(buildTopNav(locale.value));
  const foundationNavItems = $derived(buildFoundationNav(locale.value));
  const componentGroups = $derived(buildComponentNavGroups(locale.value));
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
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Exo:wght@400;500;600;700&display=swap"
  />
</svelte:head>

<div class="ell-shell">
  <!-- ── HEADER ELLIO ── -->
  <div class="ell-header-wrap">
    <header class="ell-header" aria-label="Ellio">
      <div class="ell-header__inner">
        <!-- Gauche : wordmark Ellio (bleu + swirl empreinte bleu→vert) -->
        <div class="ell-header__brand">
          <a href="/" class="ell-header__brand-link" aria-label="Accueil : Ellio Design System">
            <img
              src="/chrome/ellio/logo.svg"
              alt="Ellio"
              class="ell-logo"
              width="116"
              height="40"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="ell-nav" aria-label="Navigation principale">
          <ul class="ell-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="ell-nav__item">
                <a
                  class="ell-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Ellio : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="ell-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA -->
        <div class="ell-header__tools">
          <div class="ell-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA Ellio : bleu de marque, passe au VERT au survol (signature bleu→vert) -->
          <a class="ell-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="ell-header__burger"
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

  <!-- ── BODY ELLIO ── -->
  <div class="ell-body">
    <!-- Sidebar -->
    <aside class="ell-sidebar" aria-label="Navigation de la documentation">
      <nav class="ell-side-nav" aria-label="Sommaire">
        <ul class="ell-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="ell-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="ell-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="ell-side-group" open={isGroupOpen(group.items)}>
                <summary class="ell-side-group__summary">
                  <ChevronDown class="ell-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="ell-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="ell-side-link ell-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
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
      <div class="ell-sidebar-footer">
        <span class="ell-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="ell-sidebar-github"
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
    <div class="ell-content">
      <nav class="ell-breadcrumb" aria-label="Breadcrumb">
        <ol class="ell-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="ell-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="ell-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER ELLIO : surface bleu de marque (inverse) ── -->
  <footer class="ell-footer" aria-label="Pied de page Ellio">
    <div class="ell-footer__inner">
      <nav class="ell-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="ell-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/ellio/logo.svg"
        alt="Ellio"
        class="ell-footer__logo"
        width="100"
        height="34"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Ellio (tokens MESURÉS, theme-ellio) ── */
  .ell-shell {
    --ell-blue: #194f90; /* --ellio_blue : bleu de marque (liens, nav, primaire) */
    --ell-blue-deep: #123a6c; /* bleu foncé hover/active (dérivé) */
    --ell-green: #00c08b; /* --ellio_vert : accent (survol bleu→vert, B Corp) */
    --ell-green-deep: #0ca783; /* vert profond */
    --ell-ink: #333333; /* encre corps (body { color: #333 }) */
    --ell-grey: #464444; /* --grey : texte secondaire */
    --ell-grey-muted: #959595; /* --grey-light-2 : texte muet */
    --ell-border: #bdb9b9; /* --grey_3 : bord subtil */
    --ell-subtle: #f1f1f1; /* --grey-light : surface subtile */
    --ell-blue-tint: #e3edf6; /* bleu tinté (surface active sidebar) */
    --ell-white: #fff; /* --white */
    --ell-sidebar-width: 17rem;
    --ell-radius: 0.375rem; /* 6px : contrôles légèrement arrondis */
    --ell-radius-pill: 100px; /* pilules / CTA */
    font-family: 'Exo', Arial, system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--ell-white);
    color: var(--ell-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Ellio ── */
  .ell-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .ell-header {
    background: var(--ell-white);
    border-bottom: 1px solid var(--ell-border);
  }

  .ell-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .ell-header__brand {
    flex: 0 0 auto;
  }

  .ell-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .ell-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Wordmark Ellio (ratio préservé, hauteur ~40px comme l'en-tête réel). */
  .ell-logo {
    display: block;
    width: auto;
    height: 40px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .ell-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .ell-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  .ell-nav__item {
    flex: 0 0 auto;
  }

  .ell-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--ell-ink);
    display: inline-flex;
    font-size: 0.875rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    transition: border-color 120ms ease, color 120ms ease;
    white-space: nowrap;
  }

  .ell-nav__link:hover,
  .ell-nav__link:focus-visible {
    color: var(--ell-blue);
    outline: none;
  }

  /* Onglet actif : souligné bleu de marque. */
  .ell-nav__link[aria-current="page"] {
    border-bottom-color: var(--ell-blue);
    color: var(--ell-blue);
    font-weight: 700;
  }

  /* Loupe de recherche compacte (pas de champ) : carré arrondi, hover bleu tinté. */
  .ell-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--ell-radius);
    color: var(--ell-ink);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .ell-search-btn:hover,
  .ell-search-btn:focus-visible {
    background: var(--ell-blue-tint);
    border-color: var(--ell-blue);
    color: var(--ell-blue);
    outline: none;
  }

  /* ── Outils droite ── */
  .ell-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .ell-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Ellio (champs clairs, bord gris 1px). */
  .ell-header__tools-links :global(.docs-header-control) {
    background: var(--ell-white);
    border-color: var(--ell-border);
    border-radius: var(--ell-radius);
    color: var(--ell-ink);
    font-family: inherit;
  }

  .ell-header__tools-links :global(.docs-header-control:hover),
  .ell-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--ell-blue-tint);
    border-color: var(--ell-blue);
    color: var(--ell-blue);
    box-shadow: none;
  }

  /* CTA Ellio : bleu de marque → VERT au survol (signature bleu→vert), pilule. */
  .ell-cta {
    align-items: center;
    background: var(--ell-blue);
    border: 1px solid var(--ell-blue);
    border-radius: var(--ell-radius-pill);
    color: var(--ell-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.8125rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.04em;
    padding: 0 1.375rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: background 150ms ease, border-color 150ms ease;
    white-space: nowrap;
  }

  .ell-cta:hover,
  .ell-cta:focus-visible {
    background: var(--ell-green);
    border-color: var(--ell-green);
    color: var(--ell-white);
    outline: none;
  }

  /* Burger mobile */
  .ell-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--ell-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Ellio ── */
  .ell-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--ell-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Ellio ── */
  .ell-sidebar {
    background: var(--ell-white);
    border-right: 1px solid var(--ell-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .ell-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .ell-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--ell-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .ell-version-badge {
    background: var(--ell-blue-tint);
    border: 1px solid var(--ell-border);
    border-radius: var(--ell-radius);
    color: var(--ell-blue);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .ell-sidebar-github {
    align-items: center;
    color: var(--ell-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .ell-sidebar-github:hover,
  .ell-sidebar-github:focus-visible {
    color: var(--ell-blue);
  }

  .ell-side-list,
  .ell-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ell-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--ell-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .ell-side-link:hover,
  .ell-side-link:focus-visible {
    background: var(--ell-subtle);
    color: var(--ell-blue);
    text-decoration: none;
  }

  /* Item actif : accent bleu à gauche + fond bleu tinté. */
  .ell-side-link[aria-current="page"] {
    background: var(--ell-blue-tint);
    border-left-color: var(--ell-blue);
    color: var(--ell-blue-deep);
    font-weight: 700;
    text-decoration: none;
  }

  .ell-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .ell-side-divider {
    border-top: 1px solid var(--ell-border);
    margin: 0.5rem 0;
  }

  .ell-side-group {
    display: block;
  }

  .ell-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--ell-grey);
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

  .ell-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .ell-side-group__summary:hover,
  .ell-side-group__summary:focus-visible {
    background: var(--ell-subtle);
    outline: none;
  }

  .ell-side-group :global(.ell-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .ell-side-group:not([open]) :global(.ell-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .ell-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .ell-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .ell-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ell-breadcrumb__item {
    align-items: center;
    color: var(--ell-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .ell-breadcrumb__item + .ell-breadcrumb__item::before {
    color: var(--ell-grey-muted);
    content: "›";
    margin: 0 0.4rem;
  }

  .ell-breadcrumb__link {
    color: var(--ell-blue);
    text-decoration: none;
  }

  .ell-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .ell-breadcrumb__item span[aria-current="page"] {
    color: var(--ell-ink);
    font-weight: 700;
  }

  /* ── Footer Ellio : surface bleu de marque (inverse) ── */
  .ell-footer {
    background: var(--ell-blue);
    border-top: 1px solid var(--ell-blue);
    margin-top: auto;
  }

  .ell-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .ell-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .ell-footer__link {
    color: var(--ell-white);
    font-size: 0.875rem;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .ell-footer__link:hover {
    color: var(--ell-green);
    text-decoration: underline;
  }

  /* Wordmark sur fond bleu : on l'éclaircit pour le contraste. */
  .ell-footer__logo {
    display: block;
    width: auto;
    height: 34px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .ell-body {
      grid-template-columns: 1fr;
    }

    .ell-sidebar {
      display: none;
    }

    .ell-nav {
      display: none;
    }

    .ell-header__tools {
      display: none;
    }

    .ell-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .ell-nav__link,
    .ell-cta,
    .ell-search-btn,
    .ell-side-link,
    .ell-side-group :global(.ell-side-group__icon) {
      transition: none;
    }
  }
</style>

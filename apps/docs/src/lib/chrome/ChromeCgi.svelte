<!--
  Chrome documentaire CGI Inc. (cgi.com).
  Forme fidèle à l'en-tête réel de cgi.com :
  - Header : bandeau BLANC, logo officiel CGI (wordmark rouge) à gauche,
    nav horizontale, CTA VIOLET (radius 30px, pilule) à droite
  - Onglet de nav actif : SOULIGNÉ violet
  - Barre latérale gauche : item actif accent violet à gauche + fond tinté lavande,
    sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande claire avec liens + logo CGI
  - Couleurs mesurées : violet #5236ab (primaire), profond #200a58 (hover),
    vif #7a5aed, rouge patrimonial #e41937 (accent), magenta #762f8f,
    encre #151515, gris-sarcelle secondaire #407080, surfaces blanches,
    subtle #f8f8f8, lavande tintée #ece9f6 (surface secondaire),
    bord #d2d2d2 ; radius 4px (pilules 30px)
  - Logo officiel CGI (vecteur Wikimedia, fill rouge #e11937) référencé via
    <img src="/chrome/cgi/logo.svg">
  - Typo : 'Source Sans Pro' (corps) + 'Nunito Sans' (titres), chargées via
    Google Fonts dans <svelte:head>
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

  function handleSearchKeydown(event: KeyboardEvent) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSearchOpen();
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@600;700;800&family=Source+Sans+Pro:wght@400;600;700&display=swap"
  />
</svelte:head>

<div class="cgi-shell">
  <!-- ── HEADER CGI ── -->
  <div class="cgi-header-wrap">
    <header class="cgi-header" aria-label="CGI">
      <div class="cgi-header__inner">
        <!-- Gauche : logo officiel CGI (wordmark rouge) -->
        <div class="cgi-header__brand">
          <a href="/" class="cgi-header__brand-link" aria-label="Accueil : CGI Design System">
            <img
              src="/chrome/cgi/logo.svg"
              alt="CGI"
              class="cgi-logo"
              width="64"
              height="30"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="cgi-nav" aria-label="Navigation principale">
          <ul class="cgi-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="cgi-nav__item">
                <a
                  class="cgi-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </nav>

        <!-- Droite : outils + recherche + CTA violet -->
        <div class="cgi-header__tools">
          <!-- Barre de recherche CGI : champ natif + bouton, branché sur la palette docs. -->
          <div class="cgi-search" role="search">
            <label class="cgi-search__label" for="cgi-search-input">
              {locale.value === "fr" ? "Rechercher" : "Search"}
            </label>
            <div class="cgi-search__group">
              <input
                id="cgi-search-input"
                class="cgi-search__input"
                type="search"
                readonly
                placeholder={locale.value === "fr" ? "Rechercher…" : "Search…"}
                aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
                aria-haspopup="dialog"
                onclick={onSearchOpen}
                onkeydown={handleSearchKeydown}
              />
              <kbd class="cgi-search__kbd" aria-hidden="true">/</kbd>
              <button
                type="button"
                class="cgi-search__btn"
                aria-label={locale.value === "fr" ? "Lancer la recherche" : "Open search"}
                aria-haspopup="dialog"
                onclick={onSearchOpen}
              >
                <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="cgi-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA pilule violette (radius 30px) : signature CGI -->
          <a class="cgi-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="cgi-header__burger"
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

  <!-- ── BODY CGI ── -->
  <div class="cgi-body">
    <!-- Sidebar -->
    <aside class="cgi-sidebar" aria-label="Navigation de la documentation">
      <nav class="cgi-side-nav" aria-label="Sommaire">
        <ul class="cgi-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="cgi-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="cgi-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="cgi-side-group" open={isGroupOpen(group.items)}>
                <summary class="cgi-side-group__summary">
                  <ChevronDown class="cgi-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="cgi-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="cgi-side-link cgi-side-link--sub"
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
      <div class="cgi-sidebar-footer">
        <span class="cgi-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="cgi-sidebar-github"
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
    <div class="cgi-content">
      <nav class="cgi-breadcrumb" aria-label="Breadcrumb">
        <ol class="cgi-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="cgi-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="cgi-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER CGI ── -->
  <footer class="cgi-footer" aria-label="Pied de page CGI">
    <div class="cgi-footer__inner">
      <nav class="cgi-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="cgi-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/cgi/logo.svg"
        alt="CGI"
        class="cgi-footer__logo"
        width="64"
        height="30"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables CGI ── */
  .cgi-shell {
    --cgi-purple: #5236ab; /* violet primaire */
    --cgi-purple-deep: #200a58; /* violet profond / hover */
    --cgi-purple-bright: #7a5aed; /* violet vif */
    --cgi-red: #e41937; /* rouge patrimonial / accent / danger */
    --cgi-magenta: #762f8f; /* magenta */
    --cgi-teal: #407080; /* gris-sarcelle secondaire */
    --cgi-ink: #151515; /* encre */
    --cgi-grey: #5c5c5c; /* gris texte secondaire */
    --cgi-subtle: #f8f8f8; /* surface subtile */
    --cgi-lavender: #ece9f6; /* lavande tintée (surface secondaire) */
    --cgi-border: #d2d2d2; /* bord */
    --cgi-white: #fff;
    --cgi-sidebar-width: 17rem;
    --cgi-radius: 4px; /* conteneurs 4px arrondis */
    --cgi-radius-pill: 30px; /* pilules / CTA */
    font-family: 'Source Sans Pro', system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--cgi-white);
    color: var(--cgi-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header CGI ── */
  .cgi-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .cgi-header {
    background: var(--cgi-white);
    border-bottom: 1px solid var(--cgi-border);
  }

  .cgi-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .cgi-header__brand {
    flex: 0 0 auto;
  }

  .cgi-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .cgi-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel CGI (ratio préservé, hauteur ~30px comme l'en-tête réel). */
  .cgi-logo {
    display: block;
    width: auto;
    height: 30px;
  }

  /* ── Nav horizontale (centre) ── */
  .cgi-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .cgi-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cgi-nav__item {
    flex: 0 0 auto;
  }

  .cgi-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--cgi-ink);
    display: inline-flex;
    font-family: 'Nunito Sans', system-ui, sans-serif;
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .cgi-nav__link:hover,
  .cgi-nav__link:focus-visible {
    color: var(--cgi-purple);
    outline: none;
  }

  .cgi-nav__link[aria-current="page"] {
    border-bottom-color: var(--cgi-purple);
    color: var(--cgi-purple);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .cgi-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .cgi-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header CGI (champs clairs, bord gris 1px). */
  .cgi-header__tools-links :global(.docs-header-control) {
    background: var(--cgi-white);
    border-color: var(--cgi-border);
    border-radius: var(--cgi-radius);
    color: var(--cgi-ink);
    font-family: inherit;
  }

  .cgi-header__tools-links :global(.docs-header-control:hover),
  .cgi-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--cgi-lavender);
    border-color: var(--cgi-purple);
    color: var(--cgi-purple);
    box-shadow: none;
  }

  /* Barre de recherche CGI (bord gris 1px, conteneur 4px). */
  .cgi-search {
    width: clamp(11rem, 18vw, 18rem);
  }

  .cgi-search__label {
    clip: rect(0 0 0 0);
    border: 0;
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  .cgi-search__group {
    display: flex;
    position: relative;
    width: 100%;
  }

  .cgi-search__input {
    background: var(--cgi-white);
    border: 1px solid var(--cgi-border);
    border-right: 0;
    border-radius: var(--cgi-radius);
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
    color: var(--cgi-ink);
    cursor: pointer;
    flex: 1 1 auto;
    font-family: inherit;
    font-size: 0.875rem;
    height: 2.5rem;
    min-width: 0;
    padding: 0 2.125rem 0 0.75rem;
  }

  .cgi-search__input:hover,
  .cgi-search__input:focus-visible {
    background: var(--cgi-white);
    border-color: var(--cgi-purple);
    color: var(--cgi-ink);
    outline: 2px solid var(--cgi-purple);
    outline-offset: 1px;
  }

  .cgi-search__input::placeholder {
    color: var(--cgi-grey);
  }

  .cgi-search__kbd {
    align-items: center;
    border: 1px solid var(--cgi-border);
    border-radius: 4px;
    color: var(--cgi-grey);
    display: inline-flex;
    font-size: 0.75rem;
    height: 1.25rem;
    justify-content: center;
    position: absolute;
    right: 3rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1.25rem;
  }

  .cgi-search__btn {
    align-items: center;
    background: var(--cgi-purple);
    border: 1px solid var(--cgi-purple);
    border-radius: 0 var(--cgi-radius) var(--cgi-radius) 0;
    color: var(--cgi-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease;
  }

  .cgi-search__btn:hover,
  .cgi-search__btn:focus-visible {
    background: var(--cgi-purple-deep);
    border-color: var(--cgi-purple-deep);
    outline: 2px solid var(--cgi-purple);
    outline-offset: 1px;
  }

  /* CTA pilule violette (radius 30px). */
  .cgi-cta {
    align-items: center;
    background: var(--cgi-purple);
    border: 1px solid var(--cgi-purple);
    border-radius: var(--cgi-radius-pill);
    color: var(--cgi-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: 'Nunito Sans', system-ui, sans-serif;
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .cgi-cta:hover,
  .cgi-cta:focus-visible {
    background: var(--cgi-purple-deep);
    border-color: var(--cgi-purple-deep);
    color: var(--cgi-white);
    outline: none;
  }

  /* Burger mobile */
  .cgi-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--cgi-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body CGI ── */
  .cgi-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--cgi-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar CGI ── */
  .cgi-sidebar {
    background: var(--cgi-white);
    border-right: 1px solid var(--cgi-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .cgi-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .cgi-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--cgi-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .cgi-version-badge {
    background: var(--cgi-lavender);
    border: 1px solid var(--cgi-border);
    border-radius: var(--cgi-radius);
    color: var(--cgi-purple);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .cgi-sidebar-github {
    align-items: center;
    color: var(--cgi-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .cgi-sidebar-github:hover,
  .cgi-sidebar-github:focus-visible {
    color: var(--cgi-purple);
  }

  .cgi-side-list,
  .cgi-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cgi-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--cgi-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .cgi-side-link:hover,
  .cgi-side-link:focus-visible {
    background: var(--cgi-subtle);
    color: var(--cgi-purple);
    text-decoration: none;
  }

  .cgi-side-link[aria-current="page"] {
    background: var(--cgi-lavender);
    border-left-color: var(--cgi-purple);
    color: var(--cgi-purple-deep);
    font-weight: 700;
    text-decoration: none;
  }

  .cgi-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .cgi-side-divider {
    border-top: 1px solid var(--cgi-border);
    margin: 0.5rem 0;
  }

  .cgi-side-group {
    display: block;
  }

  .cgi-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--cgi-grey);
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

  .cgi-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .cgi-side-group__summary:hover,
  .cgi-side-group__summary:focus-visible {
    background: var(--cgi-subtle);
    outline: none;
  }

  .cgi-side-group :global(.cgi-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .cgi-side-group:not([open]) :global(.cgi-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .cgi-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .cgi-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .cgi-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cgi-breadcrumb__item {
    align-items: center;
    color: var(--cgi-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .cgi-breadcrumb__item + .cgi-breadcrumb__item::before {
    color: var(--cgi-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .cgi-breadcrumb__link {
    color: var(--cgi-purple);
    text-decoration: none;
  }

  .cgi-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .cgi-breadcrumb__item span[aria-current="page"] {
    color: var(--cgi-ink);
    font-weight: 600;
  }

  /* ── Footer CGI ── */
  .cgi-footer {
    background: var(--cgi-subtle);
    border-top: 1px solid var(--cgi-border);
    margin-top: auto;
  }

  .cgi-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .cgi-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .cgi-footer__link {
    color: var(--cgi-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .cgi-footer__link:hover {
    color: var(--cgi-purple);
    text-decoration: underline;
  }

  .cgi-footer__logo {
    display: block;
    width: auto;
    height: 28px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .cgi-body {
      grid-template-columns: 1fr;
    }

    .cgi-sidebar {
      display: none;
    }

    .cgi-nav {
      display: none;
    }

    .cgi-header__tools {
      display: none;
    }

    .cgi-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .cgi-nav__link,
    .cgi-cta,
    .cgi-search__btn,
    .cgi-side-link,
    .cgi-side-group :global(.cgi-side-group__icon) {
      transition: none;
    }
  }
</style>

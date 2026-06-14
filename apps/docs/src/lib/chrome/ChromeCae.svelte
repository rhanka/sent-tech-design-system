<!--
  Chrome documentaire CAE (cae.com) — simulation de vol & formation, Montréal.
  Forme fidèle à l'en-tête réel de cae.com :
  - Header : bandeau DEEP NAVY (bg-dkBlue), wordmark CAE BLANC officiel à gauche,
    nav horizontale au centre, CTA BLEU à droite (signature aviation/tech)
  - Nav active : SOULIGNÉ bleu sous l'onglet
  - Barre latérale gauche : item actif accent bleu + fond subtil, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande navy claire avec liens + wordmark
  - Couleurs MESURÉES : navy #06103D (marque / inverse / titres), bleu interactif
    #2969F2 (primaire, variante #197CF3), encre #111827, secondaire #6b7280,
    surfaces blanches, subtil #f8f8f8, bordure #e5e7eb, danger #dc2626 ;
    radius sm 6px / md 8px / lg 12px ; anneau de focus #2969F2
  - Logo CAE officiel : PNG blanc repris tel quel de cae.com
    (/chrome/cae/logo.png = assets/img/new-cae-white.png, 160×62)
  - Typo : 'Red Hat Display' (display + sans), chargée via Google Fonts
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
  <!-- Red Hat Display : display + sans de la marque CAE. -->
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;600;700&display=swap"
  />
</svelte:head>

<div class="cae-shell">
  <!-- ── HEADER CAE (deep navy) ── -->
  <div class="cae-header-wrap">
    <header class="cae-header" aria-label="CAE">
      <div class="cae-header__inner">
        <!-- Gauche : wordmark CAE officiel (blanc) -->
        <div class="cae-header__brand">
          <a href="/" class="cae-header__brand-link" aria-label="Accueil : CAE Design System">
            <img
              src="/chrome/cae/logo.png"
              alt="CAE"
              class="cae-logo"
              width="92"
              height="32"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="cae-nav" aria-label="Navigation principale">
          <ul class="cae-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="cae-nav__item">
                <a
                  class="cae-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </nav>

        <!-- Droite : outils + recherche + CTA bleu -->
        <div class="cae-header__tools">
          <!-- Barre de recherche CAE : champ natif + bouton, branché sur la palette docs. -->
          <div class="cae-search" role="search">
            <label class="cae-search__label" for="cae-search-input">
              {locale.value === "fr" ? "Rechercher" : "Search"}
            </label>
            <div class="cae-search__group">
              <input
                id="cae-search-input"
                class="cae-search__input"
                type="search"
                readonly
                placeholder={locale.value === "fr" ? "Rechercher…" : "Search…"}
                aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
                aria-haspopup="dialog"
                onclick={onSearchOpen}
                onkeydown={handleSearchKeydown}
              />
              <kbd class="cae-search__kbd" aria-hidden="true">/</kbd>
              <button
                type="button"
                class="cae-search__btn"
                aria-label={locale.value === "fr" ? "Lancer la recherche" : "Open search"}
                aria-haspopup="dialog"
                onclick={onSearchOpen}
              >
                <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="cae-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA bleu : signature aviation/tech CAE -->
          <a class="cae-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="cae-header__burger"
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

  <!-- ── BODY CAE ── -->
  <div class="cae-body">
    <!-- Sidebar -->
    <aside class="cae-sidebar" aria-label="Navigation de la documentation">
      <nav class="cae-side-nav" aria-label="Sommaire">
        <ul class="cae-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="cae-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="cae-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="cae-side-group" open={isGroupOpen(group.items)}>
                <summary class="cae-side-group__summary">
                  <ChevronDown class="cae-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="cae-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="cae-side-link cae-side-link--sub"
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
      <div class="cae-sidebar-footer">
        <span class="cae-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="cae-sidebar-github"
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
    <div class="cae-content">
      <nav class="cae-breadcrumb" aria-label="Breadcrumb">
        <ol class="cae-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="cae-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="cae-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER CAE ── -->
  <footer class="cae-footer" aria-label="Pied de page CAE">
    <div class="cae-footer__inner">
      <nav class="cae-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="cae-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/cae/logo.png"
        alt="CAE"
        class="cae-footer__logo"
        width="86"
        height="30"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables CAE (mesurées) ── */
  .cae-shell {
    --cae-navy: #06103d; /* marque / inverse / titres */
    --cae-blue: #2969f2; /* bleu interactif primaire */
    --cae-blue-variant: #197cf3; /* variante interactive */
    --cae-ink: #111827; /* encre texte primaire */
    --cae-secondary: #6b7280; /* texte secondaire */
    --cae-white: #fff;
    --cae-subtle: #f8f8f8; /* surface subtile */
    --cae-border: #e5e7eb; /* bordure */
    --cae-danger: #dc2626; /* danger */
    --cae-radius-sm: 6px;
    --cae-radius-md: 8px;
    --cae-radius-lg: 12px;
    --cae-sidebar-width: 17rem;
    font-family: 'Red Hat Display', system-ui, sans-serif;
    background: var(--cae-white);
    color: var(--cae-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header CAE (deep navy) ── */
  .cae-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .cae-header {
    background: var(--cae-navy);
    border-bottom: 1px solid var(--cae-navy);
  }

  .cae-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .cae-header__brand {
    flex: 0 0 auto;
  }

  .cae-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .cae-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Wordmark CAE officiel (blanc), hauteur ~32px comme l'en-tête réel. */
  .cae-logo {
    display: block;
    width: auto;
    height: 32px;
  }

  /* ── Nav horizontale (centre) — onglet actif souligné bleu ── */
  .cae-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .cae-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cae-nav__item {
    flex: 0 0 auto;
  }

  .cae-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: rgba(255, 255, 255, 0.82);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: color 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .cae-nav__link:hover,
  .cae-nav__link:focus-visible {
    color: var(--cae-white);
    outline: none;
  }

  .cae-nav__link[aria-current="page"] {
    border-bottom-color: var(--cae-blue);
    color: var(--cae-white);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .cae-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .cae-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header CAE (champs sombres sur navy). */
  .cae-header__tools-links :global(.docs-header-control) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.24);
    border-radius: var(--cae-radius-sm);
    color: var(--cae-white);
    font-family: inherit;
  }

  .cae-header__tools-links :global(.docs-header-control:hover),
  .cae-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: rgba(41, 105, 242, 0.18);
    border-color: var(--cae-blue);
    color: var(--cae-white);
    box-shadow: none;
  }

  /* Barre de recherche CAE (champ clair, conteneur 6px). */
  .cae-search {
    width: clamp(11rem, 18vw, 18rem);
  }

  .cae-search__label {
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

  .cae-search__group {
    display: flex;
    position: relative;
    width: 100%;
  }

  .cae-search__input {
    background: var(--cae-white);
    border: 1px solid rgba(255, 255, 255, 0.24);
    border-right: 0;
    border-radius: var(--cae-radius-sm);
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
    color: var(--cae-ink);
    cursor: pointer;
    flex: 1 1 auto;
    font-family: inherit;
    font-size: 0.875rem;
    height: 2.5rem;
    min-width: 0;
    padding: 0 2.125rem 0 0.75rem;
  }

  .cae-search__input:hover,
  .cae-search__input:focus-visible {
    background: var(--cae-white);
    border-color: var(--cae-blue);
    color: var(--cae-ink);
    outline: 2px solid var(--cae-blue);
    outline-offset: 1px;
  }

  .cae-search__input::placeholder {
    color: var(--cae-secondary);
  }

  .cae-search__kbd {
    align-items: center;
    border: 1px solid var(--cae-border);
    border-radius: 4px;
    color: var(--cae-secondary);
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

  .cae-search__btn {
    align-items: center;
    background: var(--cae-blue);
    border: 1px solid var(--cae-blue);
    border-radius: 0 var(--cae-radius-sm) var(--cae-radius-sm) 0;
    color: var(--cae-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease;
  }

  .cae-search__btn:hover,
  .cae-search__btn:focus-visible {
    background: var(--cae-blue-variant);
    border-color: var(--cae-blue-variant);
    outline: 2px solid var(--cae-blue);
    outline-offset: 1px;
  }

  /* CTA bleu (radius md). */
  .cae-cta {
    align-items: center;
    background: var(--cae-blue);
    border: 1px solid var(--cae-blue);
    border-radius: var(--cae-radius-md);
    color: var(--cae-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.875rem;
    font-weight: 600;
    height: 2.5rem;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .cae-cta:hover,
  .cae-cta:focus-visible {
    background: var(--cae-blue-variant);
    border-color: var(--cae-blue-variant);
    color: var(--cae-white);
    outline: none;
  }

  /* Burger mobile */
  .cae-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--cae-white);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body CAE ── */
  .cae-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--cae-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar CAE ── */
  .cae-sidebar {
    background: var(--cae-white);
    border-right: 1px solid var(--cae-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .cae-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .cae-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--cae-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .cae-version-badge {
    background: var(--cae-subtle);
    border: 1px solid var(--cae-border);
    border-radius: var(--cae-radius-sm);
    color: var(--cae-blue);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .cae-sidebar-github {
    align-items: center;
    color: var(--cae-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .cae-sidebar-github:hover,
  .cae-sidebar-github:focus-visible {
    color: var(--cae-blue);
  }

  .cae-side-list,
  .cae-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cae-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--cae-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .cae-side-link:hover,
  .cae-side-link:focus-visible {
    background: var(--cae-subtle);
    color: var(--cae-navy);
    text-decoration: none;
  }

  .cae-side-link[aria-current="page"] {
    background: var(--cae-subtle);
    border-left-color: var(--cae-blue);
    color: var(--cae-blue);
    font-weight: 700;
    text-decoration: none;
  }

  .cae-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .cae-side-divider {
    border-top: 1px solid var(--cae-border);
    margin: 0.5rem 0;
  }

  .cae-side-group {
    display: block;
  }

  .cae-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--cae-secondary);
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

  .cae-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .cae-side-group__summary:hover,
  .cae-side-group__summary:focus-visible {
    background: var(--cae-subtle);
    outline: none;
  }

  .cae-side-group :global(.cae-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .cae-side-group:not([open]) :global(.cae-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .cae-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .cae-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .cae-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cae-breadcrumb__item {
    align-items: center;
    color: var(--cae-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .cae-breadcrumb__item + .cae-breadcrumb__item::before {
    color: var(--cae-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .cae-breadcrumb__link {
    color: var(--cae-blue);
    text-decoration: none;
  }

  .cae-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .cae-breadcrumb__item span[aria-current="page"] {
    color: var(--cae-navy);
    font-weight: 600;
  }

  /* ── Footer CAE ── */
  .cae-footer {
    background: var(--cae-navy);
    border-top: 1px solid var(--cae-navy);
    margin-top: auto;
  }

  .cae-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .cae-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .cae-footer__link {
    color: rgba(255, 255, 255, 0.82);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .cae-footer__link:hover {
    color: var(--cae-white);
    text-decoration: underline;
  }

  .cae-footer__logo {
    display: block;
    width: auto;
    height: 30px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .cae-body {
      grid-template-columns: 1fr;
    }

    .cae-sidebar {
      display: none;
    }

    .cae-nav {
      display: none;
    }

    .cae-header__tools {
      display: none;
    }

    .cae-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .cae-nav__link,
    .cae-cta,
    .cae-search__btn,
    .cae-side-link,
    .cae-side-group :global(.cae-side-group__icon) {
      transition: none;
    }
  }
</style>

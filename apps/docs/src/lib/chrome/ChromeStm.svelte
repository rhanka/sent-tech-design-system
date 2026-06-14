<!--
  Chrome documentaire STM (Société de transport de Montréal, stm.info).
  Forme fidèle à l'en-tête transport en commun de la STM :
  - Header : bandeau BLANC propre, logo officiel STM (roundel + lockup « Société de
    transport de Montréal ») à gauche, nav horizontale au centre, CTA BLEU STM à droite
  - Onglet de nav actif : SOULIGNÉ bleu STM (signature transit)
  - Barre latérale gauche : item actif accent bleu + fond bleu clair, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande claire avec liens + logo STM
  - Couleurs mesurées : bleu STM #009ee0 (primaire, survol #0084bd), encre #3c3c3c,
    secondaire #515151, surfaces blanches, subtle #ebebeb, bordure #cccccc,
    accent vert transit #008f4c, danger #d0021b ; rayon 4px ; focus #009ee0
  - Logo officiel STM (vecteur) référencé via <img src="/chrome/stm/logo.svg">
  - Typo : la police web exacte de la STM n'a pas été sourcée → repli sur une sans
    transit propre ('Helvetica Neue', Arial, Roboto) ; aucune Google Font requise
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

<div class="stm-shell">
  <!-- ── HEADER STM ── -->
  <div class="stm-header-wrap">
    <header class="stm-header" aria-label="Société de transport de Montréal">
      <div class="stm-header__inner">
        <!-- Gauche : logo officiel STM (roundel + lockup) -->
        <div class="stm-header__brand">
          <a href="/" class="stm-header__brand-link" aria-label="Accueil : STM Design System">
            <img
              src="/chrome/stm/logo.svg"
              alt="Société de transport de Montréal"
              class="stm-logo"
              width="171"
              height="26"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="stm-nav" aria-label="Navigation principale">
          <ul class="stm-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="stm-nav__item">
                <a
                  class="stm-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </nav>

        <!-- Droite : outils + recherche + CTA bleu STM -->
        <div class="stm-header__tools">
          <!-- Barre de recherche STM : champ natif + bouton, branché sur la palette docs. -->
          <div class="stm-search" role="search">
            <label class="stm-search__label" for="stm-search-input">
              {locale.value === "fr" ? "Rechercher" : "Search"}
            </label>
            <div class="stm-search__group">
              <input
                id="stm-search-input"
                class="stm-search__input"
                type="search"
                readonly
                placeholder={locale.value === "fr" ? "Rechercher…" : "Search…"}
                aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
                aria-haspopup="dialog"
                onclick={onSearchOpen}
                onkeydown={handleSearchKeydown}
              />
              <kbd class="stm-search__kbd" aria-hidden="true">/</kbd>
              <button
                type="button"
                class="stm-search__btn"
                aria-label={locale.value === "fr" ? "Lancer la recherche" : "Open search"}
                aria-haspopup="dialog"
                onclick={onSearchOpen}
              >
                <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="stm-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA bleu STM : signature transit -->
          <a class="stm-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="stm-header__burger"
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

  <!-- ── BODY STM ── -->
  <div class="stm-body">
    <!-- Sidebar -->
    <aside class="stm-sidebar" aria-label="Navigation de la documentation">
      <nav class="stm-side-nav" aria-label="Sommaire">
        <ul class="stm-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="stm-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="stm-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="stm-side-group" open={isGroupOpen(group.items)}>
                <summary class="stm-side-group__summary">
                  <ChevronDown class="stm-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="stm-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="stm-side-link stm-side-link--sub"
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
      <div class="stm-sidebar-footer">
        <span class="stm-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="stm-sidebar-github"
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
    <div class="stm-content">
      <nav class="stm-breadcrumb" aria-label="Breadcrumb">
        <ol class="stm-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="stm-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="stm-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER STM ── -->
  <footer class="stm-footer" aria-label="Pied de page STM">
    <div class="stm-footer__inner">
      <nav class="stm-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="stm-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/stm/logo.svg"
        alt="Société de transport de Montréal"
        class="stm-footer__logo"
        width="171"
        height="26"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables STM ── */
  .stm-shell {
    --stm-blue: #009ee0; /* bleu STM primaire */
    --stm-blue-hover: #0084bd; /* bleu survol */
    --stm-blue-light: #e1f4fb; /* teinte bleu clair (item actif sidebar) */
    --stm-green: #008f4c; /* accent vert transit */
    --stm-danger: #d0021b; /* danger */
    --stm-ink: #3c3c3c; /* encre / titres */
    --stm-secondary: #515151; /* texte secondaire */
    --stm-subtle: #ebebeb; /* surface subtile */
    --stm-border: #cccccc; /* bordure */
    --stm-white: #fff;
    --stm-sidebar-width: 17rem;
    --stm-radius: 4px; /* rayon STM */
    font-family: 'Helvetica Neue', Arial, Roboto, sans-serif;
    background: var(--stm-white);
    color: var(--stm-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header STM ── */
  .stm-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .stm-header {
    background: var(--stm-white);
    border-bottom: 1px solid var(--stm-border);
  }

  .stm-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .stm-header__brand {
    flex: 0 0 auto;
  }

  .stm-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .stm-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel STM (ratio préservé, hauteur ~26px comme l'en-tête réel). */
  .stm-logo {
    display: block;
    width: auto;
    height: 26px;
  }

  /* ── Nav horizontale (centre) ── */
  .stm-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .stm-nav__list {
    align-items: center;
    display: flex;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .stm-nav__item {
    flex: 0 0 auto;
  }

  .stm-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--stm-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 1rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .stm-nav__link:hover,
  .stm-nav__link:focus-visible {
    background: var(--stm-subtle);
    color: var(--stm-blue);
    outline: none;
  }

  /* Onglet actif : soulignement bleu STM (signature transit). */
  .stm-nav__link[aria-current="page"] {
    border-bottom-color: var(--stm-blue);
    color: var(--stm-blue);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .stm-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .stm-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header STM (champs clairs, bordure 1px). */
  .stm-header__tools-links :global(.docs-header-control) {
    background: var(--stm-white);
    border-color: var(--stm-border);
    border-radius: var(--stm-radius);
    color: var(--stm-ink);
    font-family: inherit;
  }

  .stm-header__tools-links :global(.docs-header-control:hover),
  .stm-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--stm-subtle);
    border-color: var(--stm-blue);
    color: var(--stm-blue);
    box-shadow: none;
  }

  /* Barre de recherche STM (bordure 1px, conteneur 4px). */
  .stm-search {
    width: clamp(11rem, 18vw, 18rem);
  }

  .stm-search__label {
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

  .stm-search__group {
    display: flex;
    position: relative;
    width: 100%;
  }

  .stm-search__input {
    background: var(--stm-white);
    border: 1px solid var(--stm-border);
    border-right: 0;
    border-radius: var(--stm-radius);
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
    color: var(--stm-ink);
    cursor: pointer;
    flex: 1 1 auto;
    font-family: inherit;
    font-size: 0.875rem;
    height: 2.5rem;
    min-width: 0;
    padding: 0 2.125rem 0 0.75rem;
  }

  .stm-search__input:hover,
  .stm-search__input:focus-visible {
    background: var(--stm-white);
    border-color: var(--stm-blue);
    color: var(--stm-ink);
    outline: 2px solid var(--stm-blue);
    outline-offset: 1px;
  }

  .stm-search__input::placeholder {
    color: var(--stm-secondary);
  }

  .stm-search__kbd {
    align-items: center;
    border: 1px solid var(--stm-border);
    border-radius: 4px;
    color: var(--stm-secondary);
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

  .stm-search__btn {
    align-items: center;
    background: var(--stm-blue);
    border: 1px solid var(--stm-blue);
    border-radius: 0 var(--stm-radius) var(--stm-radius) 0;
    color: var(--stm-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease;
  }

  .stm-search__btn:hover,
  .stm-search__btn:focus-visible {
    background: var(--stm-blue-hover);
    border-color: var(--stm-blue-hover);
    outline: 2px solid var(--stm-blue);
    outline-offset: 1px;
  }

  /* CTA bleu STM. */
  .stm-cta {
    align-items: center;
    background: var(--stm-blue);
    border: 1px solid var(--stm-blue);
    border-radius: var(--stm-radius);
    color: var(--stm-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .stm-cta:hover,
  .stm-cta:focus-visible {
    background: var(--stm-blue-hover);
    border-color: var(--stm-blue-hover);
    color: var(--stm-white);
    outline: none;
  }

  /* Burger mobile */
  .stm-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--stm-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body STM ── */
  .stm-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--stm-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar STM ── */
  .stm-sidebar {
    background: var(--stm-white);
    border-right: 1px solid var(--stm-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .stm-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .stm-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--stm-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .stm-version-badge {
    background: var(--stm-subtle);
    border: 1px solid var(--stm-border);
    border-radius: var(--stm-radius);
    color: var(--stm-blue);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .stm-sidebar-github {
    align-items: center;
    color: var(--stm-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .stm-sidebar-github:hover,
  .stm-sidebar-github:focus-visible {
    color: var(--stm-blue);
  }

  .stm-side-list,
  .stm-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .stm-side-link {
    align-items: center;
    border-left: 4px solid transparent;
    box-sizing: border-box;
    color: var(--stm-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 4px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .stm-side-link:hover,
  .stm-side-link:focus-visible {
    background: var(--stm-subtle);
    color: var(--stm-blue);
    text-decoration: none;
  }

  .stm-side-link[aria-current="page"] {
    background: var(--stm-blue-light);
    border-left-color: var(--stm-blue);
    color: var(--stm-blue-hover);
    font-weight: 700;
    text-decoration: none;
  }

  .stm-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 4px);
  }

  .stm-side-divider {
    border-top: 1px solid var(--stm-border);
    margin: 0.5rem 0;
  }

  .stm-side-group {
    display: block;
  }

  .stm-side-group__summary {
    align-items: center;
    border-left: 4px solid transparent;
    color: var(--stm-secondary);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 700;
    gap: 0.35rem;
    letter-spacing: 0.06em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 1rem 0 calc(1rem - 4px);
    text-transform: uppercase;
    transition: background 120ms ease;
  }

  .stm-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .stm-side-group__summary:hover,
  .stm-side-group__summary:focus-visible {
    background: var(--stm-subtle);
    outline: none;
  }

  .stm-side-group :global(.stm-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .stm-side-group:not([open]) :global(.stm-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .stm-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .stm-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .stm-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .stm-breadcrumb__item {
    align-items: center;
    color: var(--stm-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .stm-breadcrumb__item + .stm-breadcrumb__item::before {
    color: var(--stm-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .stm-breadcrumb__link {
    color: var(--stm-blue);
    text-decoration: none;
  }

  .stm-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .stm-breadcrumb__item span[aria-current="page"] {
    color: var(--stm-ink);
    font-weight: 600;
  }

  /* ── Footer STM ── */
  .stm-footer {
    background: var(--stm-subtle);
    border-top: 1px solid var(--stm-border);
    margin-top: auto;
  }

  .stm-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .stm-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .stm-footer__link {
    color: var(--stm-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .stm-footer__link:hover {
    color: var(--stm-blue);
    text-decoration: underline;
  }

  .stm-footer__logo {
    display: block;
    width: auto;
    height: 24px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .stm-body {
      grid-template-columns: 1fr;
    }

    .stm-sidebar {
      display: none;
    }

    .stm-nav {
      display: none;
    }

    .stm-header__tools {
      display: none;
    }

    .stm-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .stm-nav__link,
    .stm-cta,
    .stm-search__btn,
    .stm-side-link,
    .stm-side-group :global(.stm-side-group__icon) {
      transition: none;
    }
  }
</style>

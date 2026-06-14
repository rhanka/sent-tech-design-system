<!--
  Chrome documentaire SAQ (saq.com — Société des alcools du Québec).
  Forme fidèle à l'en-tête e-commerce/retail de saq.com :
  - Header : bandeau BLANC, logo officiel SAQ (lettrage coral) à gauche,
    nav horizontale au centre, CTA CORAL (quasi carré, radius 8px) à droite
  - Barre latérale gauche : item actif SOULIGNÉ coral + fond subtil, sous-items indentés
  - Onglet de nav actif = soulignement coral (signature retail SAQ)
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande crème claire avec liens + logo
  - Couleurs MESURÉES : coral-red #fc4d30 (primaire, survol #e43d22), bordeaux #7e003f
    (accent profond/inverse), sarcelle #004451, encre #1d1d1b, secondaire #878787,
    surfaces blanches, subtil #f2f2f2, crème #e1ded9, bordure #dde8e8, danger #d0011b ;
    radius majoritairement carré (md 8px), outline focus #fc4d30
  - Logo officiel SAQ (vecteur) référencé via <img src="/chrome/saq/logo.svg">
  - Typo : 'Maax' est propriétaire → repli sur 'Helvetica Neue', Arial, sans-serif
    (aucune police Google chargée — fidèle au repli SAQ)
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
  <!-- 'Maax' (police propriétaire SAQ) indisponible → repli Helvetica Neue / Arial.
       Aucune police Google n'est chargée, fidèle au repli système de saq.com. -->
</svelte:head>

<div class="saq-shell">
  <!-- ── HEADER SAQ ── -->
  <div class="saq-header-wrap">
    <header class="saq-header" aria-label="SAQ">
      <div class="saq-header__inner">
        <!-- Gauche : logo officiel SAQ (lettrage coral) -->
        <div class="saq-header__brand">
          <a href="/" class="saq-header__brand-link" aria-label="Accueil : SAQ Design System">
            <img
              src="/chrome/saq/logo.svg"
              alt="SAQ"
              class="saq-logo"
              width="28"
              height="46"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="saq-nav" aria-label="Navigation principale">
          <ul class="saq-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="saq-nav__item">
                <a
                  class="saq-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </nav>

        <!-- Droite : outils + recherche + CTA coral -->
        <div class="saq-header__tools">
          <!-- Barre de recherche SAQ : champ natif + bouton, branché sur la palette docs. -->
          <div class="saq-search" role="search">
            <label class="saq-search__label" for="saq-search-input">
              {locale.value === "fr" ? "Rechercher" : "Search"}
            </label>
            <div class="saq-search__group">
              <input
                id="saq-search-input"
                class="saq-search__input"
                type="search"
                readonly
                placeholder={locale.value === "fr" ? "Rechercher…" : "Search…"}
                aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
                aria-haspopup="dialog"
                onclick={onSearchOpen}
                onkeydown={handleSearchKeydown}
              />
              <kbd class="saq-search__kbd" aria-hidden="true">/</kbd>
              <button
                type="button"
                class="saq-search__btn"
                aria-label={locale.value === "fr" ? "Lancer la recherche" : "Open search"}
                aria-haspopup="dialog"
                onclick={onSearchOpen}
              >
                <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="saq-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA coral (quasi carré, radius 8px) : signature retail SAQ -->
          <a class="saq-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="saq-header__burger"
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

  <!-- ── BODY SAQ ── -->
  <div class="saq-body">
    <!-- Sidebar -->
    <aside class="saq-sidebar" aria-label="Navigation de la documentation">
      <nav class="saq-side-nav" aria-label="Sommaire">
        <ul class="saq-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="saq-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="saq-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="saq-side-group" open={isGroupOpen(group.items)}>
                <summary class="saq-side-group__summary">
                  <ChevronDown class="saq-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="saq-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="saq-side-link saq-side-link--sub"
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
      <div class="saq-sidebar-footer">
        <span class="saq-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="saq-sidebar-github"
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
    <div class="saq-content">
      <nav class="saq-breadcrumb" aria-label="Breadcrumb">
        <ol class="saq-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="saq-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="saq-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER SAQ ── -->
  <footer class="saq-footer" aria-label="Pied de page SAQ">
    <div class="saq-footer__inner">
      <nav class="saq-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="saq-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/saq/logo.svg"
        alt="SAQ"
        class="saq-footer__logo"
        width="26"
        height="42"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables SAQ (mesurées sur saq.com) ── */
  .saq-shell {
    --saq-coral: #fc4d30; /* coral-red primaire */
    --saq-coral-hover: #e43d22; /* coral survol */
    --saq-burgundy: #7e003f; /* bordeaux accent profond / inverse */
    --saq-teal: #004451; /* sarcelle */
    --saq-ink: #1d1d1b; /* encre / titres */
    --saq-secondary: #878787; /* gris texte secondaire */
    --saq-subtle: #f2f2f2; /* surface subtile */
    --saq-cream: #e1ded9; /* crème */
    --saq-border: #dde8e8; /* bordure */
    --saq-border-strong: #c7d2d2;
    --saq-danger: #d0011b; /* danger */
    --saq-white: #fff;
    --saq-sidebar-width: 17rem;
    --saq-radius: 8px; /* md : radius majoritairement carré */
    font-family: 'Maax', 'Helvetica Neue', Arial, sans-serif;
    background: var(--saq-white);
    color: var(--saq-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header SAQ ── */
  .saq-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .saq-header {
    background: var(--saq-white);
    border-bottom: 1px solid var(--saq-border);
  }

  .saq-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .saq-header__brand {
    flex: 0 0 auto;
  }

  .saq-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .saq-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel SAQ (ratio préservé, hauteur ~40px comme l'en-tête réel). */
  .saq-logo {
    display: block;
    width: auto;
    height: 40px;
  }

  /* ── Nav horizontale (centre) ── */
  .saq-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .saq-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .saq-nav__item {
    flex: 0 0 auto;
  }

  /* Onglet de nav : soulignement coral à l'état actif (signature retail SAQ). */
  .saq-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--saq-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease;
    white-space: nowrap;
  }

  .saq-nav__link:hover,
  .saq-nav__link:focus-visible {
    color: var(--saq-coral);
    outline: none;
  }

  .saq-nav__link[aria-current="page"] {
    border-bottom-color: var(--saq-coral);
    color: var(--saq-coral);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .saq-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .saq-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header SAQ (champs clairs, bordure sarcelle, coins carrés). */
  .saq-header__tools-links :global(.docs-header-control) {
    background: var(--saq-white);
    border-color: var(--saq-border-strong);
    border-radius: var(--saq-radius);
    color: var(--saq-ink);
    font-family: inherit;
  }

  .saq-header__tools-links :global(.docs-header-control:hover),
  .saq-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--saq-subtle);
    border-color: var(--saq-coral);
    color: var(--saq-coral);
    box-shadow: none;
  }

  /* Barre de recherche SAQ (bordure 1px, conteneur carré 8px). */
  .saq-search {
    width: clamp(11rem, 18vw, 18rem);
  }

  .saq-search__label {
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

  .saq-search__group {
    display: flex;
    position: relative;
    width: 100%;
  }

  .saq-search__input {
    background: var(--saq-white);
    border: 1px solid var(--saq-border-strong);
    border-right: 0;
    border-radius: var(--saq-radius);
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
    color: var(--saq-ink);
    cursor: pointer;
    flex: 1 1 auto;
    font-family: inherit;
    font-size: 0.875rem;
    height: 2.5rem;
    min-width: 0;
    padding: 0 2.125rem 0 0.75rem;
  }

  .saq-search__input:hover,
  .saq-search__input:focus-visible {
    background: var(--saq-white);
    border-color: var(--saq-coral);
    color: var(--saq-ink);
    outline: 2px solid var(--saq-coral);
    outline-offset: 1px;
  }

  .saq-search__input::placeholder {
    color: var(--saq-secondary);
  }

  .saq-search__kbd {
    align-items: center;
    border: 1px solid var(--saq-border-strong);
    border-radius: 4px;
    color: var(--saq-secondary);
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

  .saq-search__btn {
    align-items: center;
    background: var(--saq-coral);
    border: 1px solid var(--saq-coral);
    border-radius: 0 var(--saq-radius) var(--saq-radius) 0;
    color: var(--saq-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease;
  }

  .saq-search__btn:hover,
  .saq-search__btn:focus-visible {
    background: var(--saq-coral-hover);
    border-color: var(--saq-coral-hover);
    outline: 2px solid var(--saq-coral);
    outline-offset: 1px;
  }

  /* CTA coral (quasi carré, radius 8px) : signature retail SAQ. */
  .saq-cta {
    align-items: center;
    background: var(--saq-coral);
    border: 1px solid var(--saq-coral);
    border-radius: var(--saq-radius);
    color: var(--saq-white);
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

  .saq-cta:hover,
  .saq-cta:focus-visible {
    background: var(--saq-coral-hover);
    border-color: var(--saq-coral-hover);
    color: var(--saq-white);
    outline: none;
  }

  /* Burger mobile */
  .saq-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--saq-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body SAQ ── */
  .saq-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--saq-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar SAQ ── */
  .saq-sidebar {
    background: var(--saq-white);
    border-right: 1px solid var(--saq-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .saq-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .saq-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--saq-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .saq-version-badge {
    background: var(--saq-subtle);
    border: 1px solid var(--saq-border);
    border-radius: var(--saq-radius);
    color: var(--saq-coral);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .saq-sidebar-github {
    align-items: center;
    color: var(--saq-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .saq-sidebar-github:hover,
  .saq-sidebar-github:focus-visible {
    color: var(--saq-coral);
  }

  .saq-side-list,
  .saq-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .saq-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--saq-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .saq-side-link:hover,
  .saq-side-link:focus-visible {
    background: var(--saq-subtle);
    color: var(--saq-coral);
    text-decoration: none;
  }

  .saq-side-link[aria-current="page"] {
    background: var(--saq-subtle);
    border-left-color: var(--saq-coral);
    color: var(--saq-coral);
    font-weight: 700;
    text-decoration: none;
  }

  .saq-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .saq-side-divider {
    border-top: 1px solid var(--saq-border);
    margin: 0.5rem 0;
  }

  .saq-side-group {
    display: block;
  }

  .saq-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--saq-secondary);
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

  .saq-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .saq-side-group__summary:hover,
  .saq-side-group__summary:focus-visible {
    background: var(--saq-subtle);
    outline: none;
  }

  .saq-side-group :global(.saq-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .saq-side-group:not([open]) :global(.saq-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .saq-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .saq-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .saq-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .saq-breadcrumb__item {
    align-items: center;
    color: var(--saq-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .saq-breadcrumb__item + .saq-breadcrumb__item::before {
    color: var(--saq-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .saq-breadcrumb__link {
    color: var(--saq-coral);
    text-decoration: none;
  }

  .saq-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .saq-breadcrumb__item span[aria-current="page"] {
    color: var(--saq-ink);
    font-weight: 600;
  }

  /* ── Footer SAQ (bande crème claire) ── */
  .saq-footer {
    background: var(--saq-subtle);
    border-top: 1px solid var(--saq-border);
    margin-top: auto;
  }

  .saq-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .saq-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .saq-footer__link {
    color: var(--saq-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .saq-footer__link:hover {
    color: var(--saq-coral);
    text-decoration: underline;
  }

  .saq-footer__logo {
    display: block;
    width: auto;
    height: 34px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .saq-body {
      grid-template-columns: 1fr;
    }

    .saq-sidebar {
      display: none;
    }

    .saq-nav {
      display: none;
    }

    .saq-header__tools {
      display: none;
    }

    .saq-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .saq-nav__link,
    .saq-cta,
    .saq-search__btn,
    .saq-side-link,
    .saq-side-group :global(.saq-side-group__icon) {
      transition: none;
    }
  }
</style>

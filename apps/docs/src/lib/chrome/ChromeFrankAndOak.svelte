<!--
  Chrome documentaire Frank And Oak (frankandoak.com — maison de mode / lifestyle
  montréalaise). Forme fidèle à l'en-tête réel de frankandoak.com :
  - Header : bandeau BLANC pur #fff, fine ligne 1px #CFCFCF en bas, logo officiel
    Frank And Oak (wordmark noir, vecteur du CDN Shopify) à gauche, nav horizontale
    TRÈS sobre, beaucoup de blanc, loupe de recherche + CTA NOIR plein à droite
  - Coins quasi CARRÉS (radius 2px sur les contrôles, signature minimale FOA),
    aucune couleur hors noir / encre / gris / blanc
  - Onglet de nav actif : SOULIGNÉ noir (filet bas)
  - Barre latérale gauche : item actif bord noir à gauche + texte encre, sous-items
    indentés ; jamais de couleur
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande blanche avec liens + logo Frank And Oak
  - Couleurs mesurées (theme-frank-and-oak) : noir #000, encre #292929,
    secondaire #6A6A6A, atténué #7A7A7A, bord #CFCFCF, surface subtile #f7f7f7,
    blanc #fff ; radius 2px (contrôles)
  - Logo officiel Frank And Oak (vecteur CDN Shopify, wordmark noir) référencé via
    <img src="/chrome/frank-and-oak/logo.svg">
  - Typo : 'CircularStd' (la géométrique de marque), repli 'Helvetica Neue', Arial.
    Aucune police réseau chargée — le DS source ne charge pas CircularStd ; on
    référence le NOM uniquement avec un repli Helvetica.
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

<div class="foa-shell">
  <!-- ── HEADER FRANK AND OAK ── -->
  <div class="foa-header-wrap">
    <header class="foa-header" aria-label="Frank And Oak">
      <div class="foa-header__inner">
        <!-- Gauche : logo officiel Frank And Oak (wordmark noir) -->
        <div class="foa-header__brand">
          <a href="/" class="foa-header__brand-link" aria-label="Accueil : Frank And Oak Design System">
            <img
              src="/chrome/frank-and-oak/logo.svg"
              alt="Frank And Oak"
              class="foa-logo"
              width="140"
              height="16"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale sobre -->
        <nav class="foa-nav" aria-label="Navigation principale">
          <ul class="foa-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="foa-nav__item">
                <a
                  class="foa-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </nav>

        <!-- Droite : recherche (loupe) + outils + CTA noir plein -->
        <div class="foa-header__tools">
          <!-- Recherche Frank And Oak : bouton loupe carré compact (palette docs). -->
          <button
            type="button"
            class="foa-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={1.8} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="foa-header__tools-links">
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
          class="foa-header__burger"
          onclick={onMobileMenuToggle}
          aria-expanded={mobileMenuOpen}
          aria-label="Menu"
        >
          {#if mobileMenuOpen}
            <X size={20} strokeWidth={1.6} aria-hidden="true" />
          {:else}
            <Menu size={20} strokeWidth={1.6} aria-hidden="true" />
          {/if}
        </button>
      </div>
    </header>
  </div>

  <!-- ── BODY FRANK AND OAK ── -->
  <div class="foa-body">
    <!-- Sidebar -->
    <aside class="foa-sidebar" aria-label="Navigation de la documentation">
      <nav class="foa-side-nav" aria-label="Sommaire">
        <ul class="foa-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="foa-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="foa-side-divider" role="separator"></li>

          <li class="foa-side-heading">
            <a
              class="foa-side-link foa-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="foa-side-group" open={isGroupOpen(group.items)}>
                <summary class="foa-side-group__summary">
                  <ChevronDown class="foa-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="foa-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="foa-side-link foa-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="foa-side-divider" role="separator"></li>

          <li class="foa-side-heading">
            <a
              class="foa-side-link foa-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="foa-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="foa-side-group__summary">
                  <ChevronDown class="foa-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="foa-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="foa-side-link foa-side-link--sub"
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
      <div class="foa-sidebar-footer">
        <span class="foa-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="foa-sidebar-github"
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
    <div class="foa-content">
      <nav class="foa-breadcrumb" aria-label="Breadcrumb">
        <ol class="foa-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="foa-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="foa-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER FRANK AND OAK ── -->
  <footer class="foa-footer" aria-label="Pied de page Frank And Oak">
    <div class="foa-footer__inner">
      <nav class="foa-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="foa-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/frank-and-oak/logo.svg"
        alt="Frank And Oak"
        class="foa-footer__logo"
        width="140"
        height="16"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Frank And Oak (noir / encre / gris / blanc uniquement) ── */
  .foa-shell {
    --foa-black: #000; /* noir pur : CTA, focus, liens */
    --foa-black-hover: #202020; /* hover CTA / inverse */
    --foa-ink: #292929; /* texte primaire (encre douce) */
    --foa-grey: #6a6a6a; /* gris secondaire (dominant) */
    --foa-grey-muted: #7a7a7a; /* gris atténué */
    --foa-border: #cfcfcf; /* liseré fin 1px (mesuré) */
    --foa-subtle: #f7f7f7; /* surface subtile (survol) */
    --foa-white: #fff; /* blanc pur : surfaces */
    --foa-radius: 2px; /* contrôles à peine arrondis (signature FOA) */
    --foa-sidebar-width: 17rem;
    font-family: 'CircularStd', 'Helvetica Neue', Arial, sans-serif;
    background: var(--foa-white);
    color: var(--foa-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Frank And Oak ── */
  .foa-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .foa-header {
    background: var(--foa-white);
    border-bottom: 1px solid var(--foa-border);
  }

  .foa-header__inner {
    align-items: center;
    display: flex;
    gap: 2rem;
    margin: 0 auto;
    max-width: 84rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.75rem;
  }

  .foa-header__brand {
    flex: 0 0 auto;
  }

  .foa-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .foa-header__brand-link:hover {
    opacity: 0.7;
  }

  /* Logo officiel Frank And Oak (ratio préservé, hauteur ~16px comme l'en-tête réel). */
  .foa-logo {
    display: block;
    width: auto;
    height: 16px;
  }

  /* ── Nav horizontale (centre) : sobre, capitales légères ── */
  .foa-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .foa-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    justify-content: center;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .foa-nav__item {
    flex: 0 0 auto;
  }

  .foa-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--foa-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.3rem;
    letter-spacing: 0.04em;
    min-height: 2.5rem;
    padding: 0 0.875rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: border-color 120ms ease, color 120ms ease;
    white-space: nowrap;
  }

  .foa-nav__link:hover,
  .foa-nav__link:focus-visible {
    border-bottom-color: var(--foa-black);
    color: var(--foa-black);
    outline: none;
  }

  /* État actif = soulignement noir (filet bas), jamais de couleur. */
  .foa-nav__link[aria-current="page"] {
    border-bottom-color: var(--foa-black);
    color: var(--foa-black);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .foa-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .foa-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header FOA (champs blancs, liseré gris 1px, radius 2px). */
  .foa-header__tools-links :global(.docs-header-control) {
    background: var(--foa-white);
    border-color: var(--foa-border);
    border-radius: var(--foa-radius);
    color: var(--foa-ink);
    font-family: inherit;
  }

  .foa-header__tools-links :global(.docs-header-control:hover),
  .foa-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--foa-white);
    border-color: var(--foa-black);
    color: var(--foa-black);
    box-shadow: none;
  }

  /* Recherche Frank And Oak : bouton loupe carré compact (liseré gris 1px, radius 2px). */
  .foa-search__btn {
    align-items: center;
    background: var(--foa-white);
    border: 1px solid var(--foa-border);
    border-radius: var(--foa-radius);
    color: var(--foa-ink);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .foa-search__btn:hover,
  .foa-search__btn:focus-visible {
    background: var(--foa-black);
    border-color: var(--foa-black);
    color: var(--foa-white);
    outline: none;
  }

  /* CTA noir plein (radius 2px) : signature Frank And Oak. */
  .foa-cta {
    align-items: center;
    background: var(--foa-black);
    border: 1px solid var(--foa-black);
    border-radius: var(--foa-radius);
    color: var(--foa-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.8125rem;
    font-weight: 500;
    height: 2.5rem;
    letter-spacing: 0.04em;
    padding: 0 1.25rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    white-space: nowrap;
  }

  .foa-cta:hover,
  .foa-cta:focus-visible {
    background: var(--foa-black-hover);
    border-color: var(--foa-black-hover);
    color: var(--foa-white);
    outline: none;
  }

  /* Burger mobile */
  .foa-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--foa-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Frank And Oak ── */
  .foa-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--foa-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 84rem;
    width: 100%;
  }

  /* ── Sidebar Frank And Oak ── */
  .foa-sidebar {
    background: var(--foa-white);
    border-right: 1px solid var(--foa-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .foa-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .foa-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--foa-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .foa-version-badge {
    background: var(--foa-white);
    border: 1px solid var(--foa-border);
    border-radius: var(--foa-radius);
    color: var(--foa-ink);
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .foa-sidebar-github {
    align-items: center;
    color: var(--foa-grey);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .foa-sidebar-github:hover,
  .foa-sidebar-github:focus-visible {
    color: var(--foa-black);
  }

  .foa-side-list,
  .foa-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .foa-side-link {
    align-items: center;
    border-left: 2px solid transparent;
    box-sizing: border-box;
    color: var(--foa-grey);
    display: flex;
    font-size: 0.8125rem;
    letter-spacing: 0.01em;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 2px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .foa-side-link:hover,
  .foa-side-link:focus-visible {
    background: var(--foa-subtle);
    color: var(--foa-ink);
    text-decoration: none;
  }

  /* État actif = bord noir gauche + texte encre, jamais de couleur. */
  .foa-side-link[aria-current="page"] {
    background: var(--foa-white);
    border-left-color: var(--foa-black);
    color: var(--foa-ink);
    font-weight: 700;
    text-decoration: none;
  }

  .foa-side-link--sub {
    font-size: 0.78rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 2px);
  }

  .foa-side-divider {
    border-top: 1px solid var(--foa-border);
    margin: 0.5rem 0;
  }

  .foa-side-group {
    display: block;
  }

  .foa-side-group__summary {
    align-items: center;
    border-left: 2px solid transparent;
    color: var(--foa-grey);
    cursor: pointer;
    display: flex;
    font-size: 0.7rem;
    font-weight: 700;
    gap: 0.35rem;
    letter-spacing: 0.08em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 1rem 0 calc(1rem - 2px);
    text-transform: uppercase;
    transition: background 120ms ease;
  }

  .foa-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .foa-side-group__summary:hover,
  .foa-side-group__summary:focus-visible {
    background: var(--foa-subtle);
    color: var(--foa-ink);
    outline: none;
  }

  .foa-side-group :global(.foa-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .foa-side-group:not([open]) :global(.foa-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .foa-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .foa-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .foa-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .foa-breadcrumb__item {
    align-items: center;
    color: var(--foa-grey);
    display: inline-flex;
    font-size: 0.75rem;
  }

  .foa-breadcrumb__item + .foa-breadcrumb__item::before {
    color: var(--foa-grey);
    content: "/";
    margin: 0 0.5rem;
  }

  .foa-breadcrumb__link {
    color: var(--foa-ink);
    text-decoration: none;
  }

  .foa-breadcrumb__link:hover {
    color: var(--foa-black);
    text-decoration: underline;
  }

  .foa-breadcrumb__item span[aria-current="page"] {
    color: var(--foa-ink);
    font-weight: 500;
  }

  /* ── Footer Frank And Oak ── */
  .foa-footer {
    background: var(--foa-white);
    border-top: 1px solid var(--foa-border);
    margin-top: auto;
  }

  .foa-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 84rem;
    padding: 1.75rem;
  }

  .foa-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .foa-footer__link {
    color: var(--foa-grey);
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    text-decoration: none;
    text-transform: uppercase;
  }

  .foa-footer__link:hover {
    color: var(--foa-black);
    text-decoration: underline;
  }

  .foa-footer__logo {
    display: block;
    width: auto;
    height: 16px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .foa-body {
      grid-template-columns: 1fr;
    }

    .foa-sidebar {
      display: none;
    }

    .foa-nav {
      display: none;
    }

    .foa-header__tools {
      display: none;
    }

    .foa-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .foa-nav__link,
    .foa-cta,
    .foa-search__btn,
    .foa-side-link,
    .foa-side-group :global(.foa-side-group__icon) {
      transition: none;
    }
  }
</style>

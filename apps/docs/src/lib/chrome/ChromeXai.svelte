<!--
  Chrome documentaire xAI (x.ai / grok.com — xAI, Grok).
  Forme fidèle à l'en-tête de x.ai / grok : ultra-minimal, dark monochrome,
  haut-contraste.
  - Header : bandeau JET near-black #0a0a0a, logo OFFICIEL xAI (logomark « X »
    barré, blanc inversé) à gauche, nav au centre, recherche INVERSÉE (pastille
    blanche / icône jet) à droite — le bouton iconique blanc de xAI.
  - Coins ARRONDIS (radius 12px) — signature xAI/Grok (contrôles & cards) ;
    onglet actif = SOULIGNÉ ORANGE sunset (#ff6308), l'unique teinte saturée,
    utilisée avec parcimonie.
  - Barre latérale : item actif liseré orange + fond charcoal subtil.
  - Couleurs MESURÉES sur le palette `.dark` de x.ai (cf. packages/theme-xai) :
    jet #0a0a0a, charcoal #1a1a1a, umbra #1f2228, steel #36383a, fog #7d8187,
    pewter #a9b2bc, dove #d5d9e2, blanc #ffffff, sunset (accent) #ff6308,
    dawn (accent hover) #ffd085.
  - Logo OFFICIEL xAI (vecteur, logomark blanc) via <img src="/chrome/xai/logo.svg">
  - Typo : « Universal Sans » (police de marque xAI) indisponible en réseau →
    repli système ('Vazirmatn' fallback, system-ui) ; aucune police réseau chargée.
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

<div class="xai-shell">
  <!-- ── HEADER xAI ── -->
  <div class="xai-header-wrap">
    <header class="xai-header" aria-label="xAI">
      <div class="xai-header__inner">
        <!-- Gauche : logo officiel xAI -->
        <div class="xai-header__brand">
          <a href="/" class="xai-header__brand-link" aria-label="Accueil : xAI Design System">
            <img
              src="/chrome/xai/logo.svg"
              alt="xAI"
              class="xai-logo"
              width="24"
              height="26"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="xai-nav" aria-label="Navigation principale">
          <ul class="xai-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="xai-nav__item">
                <a
                  class="xai-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </nav>

        <!-- Droite : outils + recherche -->
        <div class="xai-header__tools">
          <button
            type="button"
            class="xai-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="xai-header__tools-links">
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
          class="xai-header__burger"
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

  <!-- ── BODY xAI ── -->
  <div class="xai-body">
    <!-- Sidebar -->
    <aside class="xai-sidebar" aria-label="Navigation de la documentation">
      <nav class="xai-side-nav" aria-label="Sommaire">
        <ul class="xai-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="xai-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="xai-side-divider" role="separator"></li>

          <li class="xai-side-heading">
            <a
              class="xai-side-link xai-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="xai-side-group" open={isGroupOpen(group.items)}>
                <summary class="xai-side-group__summary">
                  <ChevronDown class="xai-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="xai-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="xai-side-link xai-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="xai-side-divider" role="separator"></li>

          <li class="xai-side-heading">
            <a
              class="xai-side-link xai-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="xai-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="xai-side-group__summary">
                  <ChevronDown class="xai-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="xai-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="xai-side-link xai-side-link--sub"
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
      <div class="xai-sidebar-footer">
        <span class="xai-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="xai-sidebar-github"
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
    <div class="xai-content">
      <nav class="xai-breadcrumb" aria-label="Breadcrumb">
        <ol class="xai-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="xai-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="xai-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER xAI ── -->
  <footer class="xai-footer" aria-label="Pied de page xAI">
    <div class="xai-footer__inner">
      <nav class="xai-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="xai-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/xai/logo.svg"
        alt="xAI"
        class="xai-footer__logo"
        width="22"
        height="24"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables xAI (palette `.dark` mesurée sur x.ai) ── */
  .xai-shell {
    --xai-jet: #0a0a0a; /* --color-jet — fond app dark */
    --xai-charcoal: #1a1a1a; /* --color-charcoal — surface card / footer */
    --xai-umbra: #1f2228; /* --color-umbra — hover / bordure / divider */
    --xai-steel: #36383a; /* --color-steel — bordure renforcée */
    --xai-fog: #7d8187; /* --color-fog — texte muet / placeholder */
    --xai-pewter: #a9b2bc; /* --color-pewter — texte secondaire */
    --xai-dove: #d5d9e2; /* --color-dove — texte primaire (--foreground) */
    --xai-white: #ffffff; /* --color-white — action inversée iconique */
    --xai-accent: #ff6308; /* --color-sunset / --accent — orange de marque */
    --xai-accent-hover: #ffd085; /* --color-dawn — amber hover */
    --xai-focus: #ffffff; /* anneau focus monochrome */
    --xai-sidebar-width: 17rem;
    --xai-radius: 0.75rem; /* contrôles arrondis (signature xAI) */
    --xai-radius-pill: 999px;
    font-family: 'universalSans', 'Vazirmatn', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--xai-jet);
    color: var(--xai-dove);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header xAI ── */
  .xai-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .xai-header {
    background: var(--xai-jet);
    border-bottom: 1px solid var(--xai-umbra);
  }

  .xai-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4rem;
    padding: 0.75rem 1.5rem;
  }

  .xai-header__brand {
    flex: 0 0 auto;
  }

  .xai-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 90ms linear;
  }

  .xai-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel xAI (ratio préservé). */
  .xai-logo {
    display: block;
    width: auto;
    height: 26px;
  }

  /* ── Nav horizontale (centre) ── */
  .xai-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .xai-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .xai-nav__item {
    flex: 0 0 auto;
  }

  .xai-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--xai-pewter);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.5rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 90ms linear, color 90ms linear;
    white-space: nowrap;
  }

  .xai-nav__link:hover,
  .xai-nav__link:focus-visible {
    color: var(--xai-dove);
    outline: none;
  }

  .xai-nav__link[aria-current="page"] {
    border-bottom-color: var(--xai-accent);
    color: var(--xai-white);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .xai-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .xai-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header xAI. */
  .xai-header__tools-links :global(.docs-header-control) {
    background: var(--xai-umbra);
    border-color: var(--xai-steel);
    border-radius: var(--xai-radius);
    color: var(--xai-dove);
    font-family: inherit;
  }

  .xai-header__tools-links :global(.docs-header-control:hover),
  .xai-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--xai-charcoal);
    border-color: var(--xai-fog);
    color: var(--xai-white);
    box-shadow: none;
  }

  /* Recherche xAI : pastille INVERSÉE (blanche / icône jet) — bouton iconique. */
  .xai-search__btn {
    align-items: center;
    background: var(--xai-white);
    border: 1px solid var(--xai-white);
    border-radius: var(--xai-radius-pill);
    color: var(--xai-jet);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 90ms linear, border-color 90ms linear;
  }

  .xai-search__btn:hover,
  .xai-search__btn:focus-visible {
    background: var(--xai-accent-hover);
    border-color: var(--xai-accent-hover);
    outline: 2px solid var(--xai-focus);
    outline-offset: 2px;
  }

  /* Burger mobile */
  .xai-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--xai-dove);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body xAI ── */
  .xai-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--xai-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar xAI ── */
  .xai-sidebar {
    background: var(--xai-jet);
    border-right: 1px solid var(--xai-umbra);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4rem);
    position: sticky;
    top: 4rem;
  }

  .xai-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .xai-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--xai-umbra);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .xai-version-badge {
    background: var(--xai-umbra);
    border: 1px solid var(--xai-steel);
    border-radius: var(--xai-radius);
    color: var(--xai-accent);
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .xai-sidebar-github {
    align-items: center;
    color: var(--xai-pewter);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 90ms linear;
  }

  .xai-sidebar-github:hover,
  .xai-sidebar-github:focus-visible {
    color: var(--xai-white);
  }

  .xai-side-list,
  .xai-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .xai-side-link {
    align-items: center;
    border-left: 2px solid transparent;
    box-sizing: border-box;
    color: var(--xai-pewter);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.5rem;
    margin: 0 0.5rem;
    border-radius: var(--xai-radius);
    padding: 0.5rem 0.75rem;
    text-decoration: none;
    transition: background 90ms linear, border-color 90ms linear, color 90ms linear;
  }

  .xai-side-link:hover,
  .xai-side-link:focus-visible {
    background: var(--xai-umbra);
    color: var(--xai-dove);
    text-decoration: none;
  }

  .xai-side-link[aria-current="page"] {
    background: var(--xai-charcoal);
    border-left-color: var(--xai-accent);
    color: var(--xai-white);
    font-weight: 600;
    text-decoration: none;
  }

  .xai-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: 1.5rem;
  }

  .xai-side-divider {
    border-top: 1px solid var(--xai-umbra);
    margin: 0.5rem 1rem;
  }

  .xai-side-group {
    display: block;
  }

  .xai-side-group__summary {
    align-items: center;
    color: var(--xai-fog);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 600;
    gap: 0.35rem;
    letter-spacing: 0.06em;
    list-style: none;
    min-height: 2.25rem;
    margin: 0 0.5rem;
    border-radius: var(--xai-radius);
    padding: 0 0.75rem;
    text-transform: uppercase;
    transition: background 90ms linear, color 90ms linear;
  }

  .xai-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .xai-side-group__summary:hover,
  .xai-side-group__summary:focus-visible {
    background: var(--xai-umbra);
    color: var(--xai-pewter);
    outline: none;
  }

  .xai-side-group :global(.xai-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 90ms linear;
  }

  .xai-side-group:not([open]) :global(.xai-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .xai-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .xai-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .xai-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .xai-breadcrumb__item {
    align-items: center;
    color: var(--xai-fog);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .xai-breadcrumb__item + .xai-breadcrumb__item::before {
    color: var(--xai-fog);
    content: "›";
    margin: 0 0.4rem;
  }

  .xai-breadcrumb__link {
    color: var(--xai-pewter);
    text-decoration: none;
  }

  .xai-breadcrumb__link:hover {
    color: var(--xai-white);
    text-decoration: underline;
  }

  .xai-breadcrumb__item span[aria-current="page"] {
    color: var(--xai-dove);
    font-weight: 500;
  }

  /* ── Footer xAI ── */
  .xai-footer {
    background: var(--xai-charcoal);
    border-top: 1px solid var(--xai-umbra);
    margin-top: auto;
  }

  .xai-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .xai-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .xai-footer__link {
    color: var(--xai-pewter);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .xai-footer__link:hover {
    color: var(--xai-white);
    text-decoration: underline;
  }

  .xai-footer__logo {
    display: block;
    width: auto;
    height: 24px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .xai-body {
      grid-template-columns: 1fr;
    }

    .xai-sidebar {
      display: none;
    }

    .xai-nav {
      display: none;
    }

    .xai-header__tools {
      display: none;
    }

    .xai-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .xai-nav__link,
    .xai-search__btn,
    .xai-side-link,
    .xai-side-group :global(.xai-side-group__icon) {
      transition: none;
    }
  }
</style>

<!--
  Chrome documentaire Amazon (AWS / Cloudscape — la langue de la console AWS).
  Forme fidèle à la barre de navigation de l'AWS Management Console :
  - Header : bandeau SOMBRE squid-ink #232f3e, logo OFFICIEL AWS (wordmark blanc +
    « smile » orange) à gauche, nav blanche au centre, recherche à droite
  - Onglet actif = SOULIGNÉ ORANGE #ff9900 (l'accent de marque Amazon)
  - Barre latérale claire : item actif liseré AWS Blue #006ce0 + fond gris subtil
  - Coins légèrement arrondis (radius 8px) — densité applicative Cloudscape
  - Couleurs MESURÉES sur les tokens publics Cloudscape (visual refresh, light) :
    squid-ink #232f3e, orange #ff9900, AWS Blue #006ce0 / hover #002b66,
    gris 100 #f9f9fa / 200 #f3f3f7 / 350 #c6c6cd / 600 #656871 / 650 #424650 /
    950 #0f141a, focus AWS Blue #006ce0
  - Logo OFFICIEL AWS (vecteur) via <img src="/chrome/amazon/logo.svg">
  - Typo : « Amazon Ember » (la face de la console AWS) référencée par son NOM,
    repli Open Sans / système (aucune police réseau chargée)
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

<div class="aws-shell">
  <!-- ── HEADER AWS ── -->
  <div class="aws-header-wrap">
    <header class="aws-header" aria-label="Amazon Web Services">
      <div class="aws-header__inner">
        <!-- Gauche : logo officiel AWS -->
        <div class="aws-header__brand">
          <a href="/" class="aws-header__brand-link" aria-label="Accueil : Amazon Design System">
            <img
              src="/chrome/amazon/logo.svg"
              alt="AWS"
              class="aws-logo"
              width="50"
              height="30"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="aws-nav" aria-label="Navigation principale">
          <ul class="aws-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="aws-nav__item">
                <a
                  class="aws-nav__link"
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
        <div class="aws-header__tools">
          <button
            type="button"
            class="aws-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="aws-header__tools-links">
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
          class="aws-header__burger"
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

  <!-- ── BODY AWS ── -->
  <div class="aws-body">
    <!-- Sidebar -->
    <aside class="aws-sidebar" aria-label="Navigation de la documentation">
      <nav class="aws-side-nav" aria-label="Sommaire">
        <ul class="aws-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="aws-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="aws-side-divider" role="separator"></li>

          <li class="aws-side-heading">
            <a
              class="aws-side-link aws-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="aws-side-group" open={isGroupOpen(group.items)}>
                <summary class="aws-side-group__summary">
                  <ChevronDown class="aws-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="aws-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="aws-side-link aws-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="aws-side-divider" role="separator"></li>

          <li class="aws-side-heading">
            <a
              class="aws-side-link aws-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="aws-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="aws-side-group__summary">
                  <ChevronDown class="aws-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="aws-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="aws-side-link aws-side-link--sub"
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
      <div class="aws-sidebar-footer">
        <span class="aws-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="aws-sidebar-github"
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
    <div class="aws-content">
      <nav class="aws-breadcrumb" aria-label="Breadcrumb">
        <ol class="aws-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="aws-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="aws-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER AWS ── -->
  <footer class="aws-footer" aria-label="Pied de page Amazon Web Services">
    <div class="aws-footer__inner">
      <nav class="aws-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="aws-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/amazon/logo.svg"
        alt="AWS"
        class="aws-footer__logo"
        width="44"
        height="26"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables AWS / Cloudscape ── */
  .aws-shell {
    --aws-squid-ink: #232f3e; /* colorAwsSquidInk — top-nav sombre */
    --aws-squid-ink-2: #1b2530; /* squid ink plus foncé (bordure / hover header) */
    --aws-squid-hover: #2e3c4d; /* hover items header sombre */
    --aws-orange: #ff9900; /* colorAmber400 — accent de marque (le « smile ») */
    --aws-orange-dark: #d14600; /* colorAmber600 — orange foncé */
    --aws-blue: #006ce0; /* colorPrimary600 / colorTextLinkDefault — AWS Blue */
    --aws-blue-dark: #002b66; /* colorBackgroundButtonPrimaryHover */
    --aws-blue-tint: #f0fbff; /* colorBlue50 — fond bleu très clair */
    --aws-ink: #0f141a; /* colorTextBodyDefault — corps / titres */
    --aws-ink-2: #232b37; /* colorGrey750 — texte fort */
    --aws-secondary: #424650; /* colorTextBodySecondary */
    --aws-muted: #656871; /* colorGrey600 — texte atténué */
    --aws-subtle: #f9f9fa; /* colorGrey100 — surface subtile / hover */
    --aws-contrast: #f3f3f7; /* colorGrey200 — fond de contraste */
    --aws-border: #dedee3; /* colorGrey300 — bordure subtile */
    --aws-divider: #c6c6cd; /* colorBorderDividerDefault */
    --aws-focus: #006ce0; /* AWS Blue focus ring */
    --aws-white: #fff;
    --aws-sidebar-width: 17rem;
    --aws-radius: 0.5rem; /* 8px — densité applicative Cloudscape */
    --aws-radius-sm: 0.25rem; /* 4px */
    font-family: 'Amazon Ember', 'Open Sans', 'Helvetica Neue', Roboto, Arial, sans-serif;
    background: var(--aws-white);
    color: var(--aws-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header AWS (barre squid-ink sombre, à la console AWS) ── */
  .aws-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .aws-header {
    background: var(--aws-squid-ink);
    border-bottom: 1px solid var(--aws-squid-ink-2);
  }

  .aws-header__inner {
    align-items: center;
    display: flex;
    gap: 1.25rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 3.5rem;
    padding: 0.5rem 1.25rem;
  }

  .aws-header__brand {
    flex: 0 0 auto;
  }

  .aws-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 135ms ease;
  }

  .aws-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel AWS (ratio préservé). */
  .aws-logo {
    display: block;
    width: auto;
    height: 30px;
  }

  /* ── Nav horizontale (centre) ── */
  .aws-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .aws-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .aws-nav__item {
    flex: 0 0 auto;
  }

  .aws-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: #d5dbe0; /* gris clair sur squid-ink */
    display: inline-flex;
    font-size: 0.875rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.5rem;
    padding: 0 0.75rem;
    text-decoration: none;
    transition: border-color 135ms ease, color 135ms ease;
    white-space: nowrap;
  }

  .aws-nav__link:hover,
  .aws-nav__link:focus-visible {
    color: var(--aws-white);
    outline: none;
  }

  .aws-nav__link[aria-current="page"] {
    border-bottom-color: var(--aws-orange);
    color: var(--aws-white);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .aws-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.625rem;
  }

  .aws-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans le header sombre AWS. */
  .aws-header__tools-links :global(.docs-header-control) {
    background: var(--aws-squid-hover);
    border-color: #3c4b5e;
    border-radius: var(--aws-radius);
    color: #e7eaee;
    font-family: inherit;
  }

  .aws-header__tools-links :global(.docs-header-control:hover),
  .aws-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: #3c4b5e;
    border-color: var(--aws-orange);
    color: var(--aws-white);
    box-shadow: none;
  }

  /* Recherche AWS : bouton loupe compact (fond AWS Blue). */
  .aws-search__btn {
    align-items: center;
    background: var(--aws-blue);
    border: 1px solid var(--aws-blue);
    border-radius: var(--aws-radius);
    color: var(--aws-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.25rem;
    height: 2.25rem;
    justify-content: center;
    padding: 0;
    transition: background 135ms ease, border-color 135ms ease;
  }

  .aws-search__btn:hover,
  .aws-search__btn:focus-visible {
    background: var(--aws-blue-dark);
    border-color: var(--aws-blue-dark);
    outline: 2px solid var(--aws-orange);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .aws-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--aws-white);
    cursor: pointer;
    justify-content: center;
    min-height: 2.5rem;
    min-width: 2.5rem;
    padding: 0;
  }

  /* ── Body AWS ── */
  .aws-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--aws-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar AWS ── */
  .aws-sidebar {
    background: var(--aws-white);
    border-right: 1px solid var(--aws-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 3.5rem);
    position: sticky;
    top: 3.5rem;
  }

  .aws-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .aws-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--aws-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .aws-version-badge {
    background: var(--aws-contrast);
    border: 1px solid var(--aws-border);
    border-radius: var(--aws-radius-sm);
    color: var(--aws-blue);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .aws-sidebar-github {
    align-items: center;
    color: var(--aws-secondary);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 135ms ease;
  }

  .aws-sidebar-github:hover,
  .aws-sidebar-github:focus-visible {
    color: var(--aws-blue);
  }

  .aws-side-list,
  .aws-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .aws-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--aws-ink-2);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.43;
    min-height: 2.5rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 135ms ease, border-color 135ms ease, color 135ms ease;
  }

  .aws-side-link:hover,
  .aws-side-link:focus-visible {
    background: var(--aws-subtle);
    color: var(--aws-blue);
    text-decoration: none;
  }

  .aws-side-link[aria-current="page"] {
    background: var(--aws-blue-tint);
    border-left-color: var(--aws-blue);
    color: var(--aws-blue);
    font-weight: 700;
    text-decoration: none;
  }

  .aws-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .aws-side-divider {
    border-top: 1px solid var(--aws-border);
    margin: 0.5rem 0;
  }

  .aws-side-group {
    display: block;
  }

  .aws-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--aws-muted);
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
    transition: background 135ms ease;
  }

  .aws-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .aws-side-group__summary:hover,
  .aws-side-group__summary:focus-visible {
    background: var(--aws-subtle);
    outline: none;
  }

  .aws-side-group :global(.aws-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 135ms ease;
  }

  .aws-side-group:not([open]) :global(.aws-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .aws-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .aws-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .aws-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .aws-breadcrumb__item {
    align-items: center;
    color: var(--aws-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .aws-breadcrumb__item + .aws-breadcrumb__item::before {
    color: var(--aws-muted);
    content: "/";
    margin: 0 0.4rem;
  }

  .aws-breadcrumb__link {
    color: var(--aws-blue);
    text-decoration: none;
  }

  .aws-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .aws-breadcrumb__item span[aria-current="page"] {
    color: var(--aws-ink);
    font-weight: 400;
  }

  /* ── Footer AWS (squid-ink sombre) ── */
  .aws-footer {
    background: var(--aws-squid-ink);
    border-top: 1px solid var(--aws-squid-ink-2);
    margin-top: auto;
  }

  .aws-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .aws-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .aws-footer__link {
    color: #d5dbe0;
    font-size: 0.875rem;
    text-decoration: none;
  }

  .aws-footer__link:hover {
    color: var(--aws-white);
    text-decoration: underline;
  }

  .aws-footer__logo {
    display: block;
    width: auto;
    height: 26px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .aws-body {
      grid-template-columns: 1fr;
    }

    .aws-sidebar {
      display: none;
    }

    .aws-nav {
      display: none;
    }

    .aws-header__tools {
      display: none;
    }

    .aws-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .aws-nav__link,
    .aws-search__btn,
    .aws-side-link,
    .aws-side-group :global(.aws-side-group__icon) {
      transition: none;
    }
  }
</style>

<!--
  Chrome documentaire Reitmans (reitmans.com — le détaillant de mode féminine
  né à Montréal). Forme fidèle à l'en-tête réel de reitmans.com :
  - Header : bandeau crème chaud #f8f3ec (near-white mesuré), logo officiel
    Reitmans (wordmark, ~22px) à gauche ; nav horizontale (encre quasi noire)
    au centre + loupe de recherche ; switchers + comparateur à droite ; fine
    hairline chaude (#e7e4e1). Feel mode épuré, radii nets/minimaux.
  - Onglet de nav actif : SOULIGNÉ rouge #e70404 (l'accent signature Reitmans)
  - Loupe de recherche : icône encre #1a1a1a, rouge #e70404 au survol
  - Barre latérale gauche : item actif accent rouge #e70404 à gauche + fond
    tinté pâle, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande quasi noire #1a1a1a, liens blancs, fine ligne d'accent rouge
    #e70404, wordmark Reitmans en knockout crème (filter blanc/crème)
  - Couleurs marque Reitmans : rouge #e70404 (marque / action / lien / soulign.
    actif / hover), navy #34459c (accent secondaire), encre #1a1a1a (corps),
    hairline chaude #e7e4e1, hover tint pâle #f1e7e7, crème header #f8f3ec ;
    radii nets (sm 2px) — esprit mode minimal.
  - Logo officiel Reitmans (wordmark vectoriel) référencé via
    <img src="/chrome/reitmans/logo.svg">
  - Typo : grotesk neutre (corps / UI). On ne charge AUCUNE police
    propriétaire ; fallbacks Helvetica / Georgia.
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

<div class="rtm-shell">
  <!-- ── HEADER REITMANS ── -->
  <div class="rtm-header-wrap">
    <header class="rtm-header" aria-label="Reitmans">
      <div class="rtm-header__inner">
        <!-- Gauche : logo officiel Reitmans (wordmark) -->
        <div class="rtm-header__brand">
          <a href="/" class="rtm-header__brand-link" aria-label="Accueil : Reitmans Design System">
            <img
              src="/chrome/reitmans/logo.svg"
              alt="Reitmans"
              class="rtm-logo"
              width="120"
              height="22"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="rtm-nav" aria-label="Navigation principale">
          <ul class="rtm-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="rtm-nav__item">
                <a
                  class="rtm-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Reitmans : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="rtm-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) -->
        <div class="rtm-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="rtm-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="rtm-header__burger"
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

  <!-- ── BODY REITMANS ── -->
  <div class="rtm-body">
    <!-- Sidebar -->
    <aside class="rtm-sidebar" aria-label="Navigation de la documentation">
      <nav class="rtm-side-nav" aria-label="Sommaire">
        <ul class="rtm-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="rtm-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="rtm-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="rtm-side-group" open={isGroupOpen(group.items)}>
                <summary class="rtm-side-group__summary">
                  <ChevronDown class="rtm-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="rtm-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="rtm-side-link rtm-side-link--sub"
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
      <div class="rtm-sidebar-footer">
        <span class="rtm-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="rtm-sidebar-github"
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
    <div class="rtm-content">
      <nav class="rtm-breadcrumb" aria-label="Breadcrumb">
        <ol class="rtm-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="rtm-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="rtm-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER REITMANS ── -->
  <footer class="rtm-footer" aria-label="Pied de page Reitmans">
    <div class="rtm-footer__inner">
      <nav class="rtm-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="rtm-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/reitmans/logo.svg"
        alt="Reitmans"
        class="rtm-footer__logo"
        width="120"
        height="22"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Reitmans (marque reitmans.com) ── */
  .rtm-shell {
    --rtm-red: #e70404; /* rouge Reitmans : marque / action / lien / actif / hover */
    --rtm-red-hover: #c40303; /* rouge assombri : hover (CTA / accent) */
    --rtm-navy: #34459c; /* navy : accent secondaire */
    --rtm-ink: #1a1a1a; /* encre quasi noire : texte primaire */
    --rtm-ink-inverse: #1a1a1a; /* surface inverse (ton footer) */
    --rtm-grey: #868e96; /* gris secondaire */
    --rtm-grey-muted: #a8a8a8; /* gris clair */
    --rtm-cream: #f8f3ec; /* crème chaud : fond header mesuré */
    --rtm-subtle: #f1e7e7; /* hover tint pâle (rosé) */
    --rtm-subtle-2: #efe9e2; /* hover secondaire crème */
    --rtm-border: #e7e4e1; /* hairline chaude */
    --rtm-white: #fff;
    --rtm-sidebar-width: 17rem;
    --rtm-radius: 2px; /* contrôles nets / minimaux (esprit mode) */
    --rtm-radius-pill: 2px; /* pas de pilule : mode épuré */
    /* Typo Reitmans : grotesk neutre (corps) ; aucune police propriétaire chargée. */
    --rtm-font-body: helvetica, arial, sans-serif;
    --rtm-font-display: Georgia, Times, serif;
    font-family: var(--rtm-font-body);
    background: var(--rtm-white);
    color: var(--rtm-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Reitmans ── */
  .rtm-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .rtm-header {
    background: var(--rtm-cream);
    border-bottom: 1px solid var(--rtm-border);
  }

  .rtm-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .rtm-header__brand {
    flex: 0 0 auto;
  }

  .rtm-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .rtm-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel Reitmans (wordmark, ratio préservé, ~22px). */
  .rtm-logo {
    display: block;
    width: auto;
    height: 22px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .rtm-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .rtm-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré net, icône encre, rouge au survol. */
  .rtm-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--rtm-radius);
    color: var(--rtm-ink);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .rtm-search-btn:hover,
  .rtm-search-btn:focus-visible {
    background: var(--rtm-subtle);
    border-color: var(--rtm-red);
    color: var(--rtm-red);
    outline: none;
  }

  .rtm-nav__item {
    flex: 0 0 auto;
  }

  .rtm-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--rtm-ink);
    display: inline-flex;
    font-family: var(--rtm-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .rtm-nav__link:hover,
  .rtm-nav__link:focus-visible {
    color: var(--rtm-red);
    outline: none;
  }

  /* Onglet actif : souligné rouge #e70404 (l'accent signature Reitmans). */
  .rtm-nav__link[aria-current="page"] {
    border-bottom-color: var(--rtm-red);
    color: var(--rtm-ink);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .rtm-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .rtm-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .rtm-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .rtm-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--rtm-border);
  }

  /* Overrides switchers dans header Reitmans (champs crème, bord hairline 1px). */
  .rtm-header__tools-links :global(.docs-header-control) {
    background: var(--rtm-white);
    border-color: var(--rtm-border);
    border-radius: var(--rtm-radius);
    color: var(--rtm-ink);
    font-family: inherit;
  }

  .rtm-header__tools-links :global(.docs-header-control:hover),
  .rtm-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--rtm-subtle);
    border-color: var(--rtm-red);
    color: var(--rtm-red);
    box-shadow: none;
  }

  /* Burger mobile */
  .rtm-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--rtm-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Reitmans ── */
  .rtm-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--rtm-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Reitmans ── */
  .rtm-sidebar {
    background: var(--rtm-white);
    border-right: 1px solid var(--rtm-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .rtm-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .rtm-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--rtm-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .rtm-version-badge {
    background: var(--rtm-subtle);
    border: 1px solid var(--rtm-border);
    border-radius: var(--rtm-radius);
    color: var(--rtm-red);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .rtm-sidebar-github {
    align-items: center;
    color: var(--rtm-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .rtm-sidebar-github:hover,
  .rtm-sidebar-github:focus-visible {
    color: var(--rtm-red);
  }

  .rtm-side-list,
  .rtm-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .rtm-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--rtm-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .rtm-side-link:hover,
  .rtm-side-link:focus-visible {
    background: var(--rtm-subtle);
    color: var(--rtm-red);
    text-decoration: none;
  }

  .rtm-side-link[aria-current="page"] {
    background: var(--rtm-subtle);
    border-left-color: var(--rtm-red);
    color: var(--rtm-red);
    font-weight: 700;
    text-decoration: none;
  }

  .rtm-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .rtm-side-divider {
    border-top: 1px solid var(--rtm-border);
    margin: 0.5rem 0;
  }

  .rtm-side-group {
    display: block;
  }

  .rtm-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--rtm-grey);
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

  .rtm-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .rtm-side-group__summary:hover,
  .rtm-side-group__summary:focus-visible {
    background: var(--rtm-subtle);
    outline: none;
  }

  .rtm-side-group :global(.rtm-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .rtm-side-group:not([open]) :global(.rtm-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .rtm-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .rtm-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .rtm-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .rtm-breadcrumb__item {
    align-items: center;
    color: var(--rtm-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .rtm-breadcrumb__item + .rtm-breadcrumb__item::before {
    color: var(--rtm-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .rtm-breadcrumb__link {
    color: var(--rtm-ink);
    text-decoration: none;
  }

  .rtm-breadcrumb__link:hover {
    color: var(--rtm-red);
    text-decoration: underline;
  }

  .rtm-breadcrumb__item span[aria-current="page"] {
    color: var(--rtm-ink);
    font-weight: 600;
  }

  /* ── Footer Reitmans : bande quasi noire, accent rouge, wordmark knockout ── */
  .rtm-footer {
    background: var(--rtm-ink-inverse);
    border-top: 2px solid var(--rtm-red);
    margin-top: auto;
  }

  .rtm-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .rtm-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .rtm-footer__link {
    color: var(--rtm-white);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .rtm-footer__link:hover {
    color: var(--rtm-red);
    text-decoration: underline;
  }

  /* Wordmark Reitmans en knockout crème (filter → blanc/crème) sur bande noire. */
  .rtm-footer__logo {
    display: block;
    width: auto;
    height: 22px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .rtm-body {
      grid-template-columns: 1fr;
    }

    .rtm-sidebar {
      display: none;
    }

    .rtm-nav {
      display: none;
    }

    .rtm-header__tools {
      display: none;
    }

    .rtm-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .rtm-nav__link,
    .rtm-search-btn,
    .rtm-side-link,
    .rtm-side-group :global(.rtm-side-group__icon) {
      transition: none;
    }
  }
</style>

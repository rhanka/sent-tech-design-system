<!--
  Chrome documentaire Maison Birks (maisonbirks.com — joaillier de luxe
  montréalais depuis 1879). Forme fidèle à l'esprit raffiné de l'en-tête réel :
  - Header : bandeau BLANC, fin filet hairline élégant (#e4e2dd), beaucoup de
    blanc, sensation minimale et luxueuse ; logo officiel Maison Birks
    (wordmark gravé, ~26px de haut) à gauche ; nav horizontale au centre +
    loupe de recherche ; CTA pilule bleu Birks à droite
  - Onglet de nav actif : SOULIGNÉ or #b08d57 (touche raffinée Birks)
  - Loupe de recherche : icône bleu Birks #00558c
  - Barre latérale gauche : item actif accent bleu Birks à gauche + fond tinté
    bleuté très clair, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande encre quasi noire #1a1a1a, liens blancs, fin liseré or
    #b08d57, wordmark Birks en blanc (knockout via filter)
  - Couleurs Maison Birks : bleu Birks #00558c (marque / actif / loupe / hover),
    or #b08d57 (accent / indicateur actif / touches raffinées), encre quasi
    noire #1a1a1a (corps), hairline #e4e2dd, teinte de survol #eef3f7,
    blanc #ffffff ; petits rayons nets (md 3px, pilules 999px)
  - Logo officiel Maison Birks (wordmark vectoriel) référencé via
    <img src="/chrome/birks/logo.svg">
  - Typo : serif élégante pour la marque (rappel du wordmark gravé) + grotesk
    neutre pour le corps / l'UI. On ne charge AUCUNE police propriétaire ;
    fallbacks Georgia (serif) / Helvetica (corps).
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

<div class="brk-shell">
  <!-- ── HEADER MAISON BIRKS ── -->
  <div class="brk-header-wrap">
    <header class="brk-header" aria-label="Maison Birks">
      <div class="brk-header__inner">
        <!-- Gauche : logo officiel Maison Birks (wordmark gravé) -->
        <div class="brk-header__brand">
          <a href="/" class="brk-header__brand-link" aria-label="Accueil : Maison Birks Design System">
            <img
              src="/chrome/birks/logo.svg"
              alt="Maison Birks"
              class="brk-logo"
              width="120"
              height="26"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="brk-nav" aria-label="Navigation principale">
          <ul class="brk-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="brk-nav__item">
                <a
                  class="brk-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Birks : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="brk-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA pilule -->
        <div class="brk-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="brk-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA pilule bleu Birks : touche raffinée -->
          <a class="brk-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="brk-header__burger"
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

  <!-- ── BODY MAISON BIRKS ── -->
  <div class="brk-body">
    <!-- Sidebar -->
    <aside class="brk-sidebar" aria-label="Navigation de la documentation">
      <nav class="brk-side-nav" aria-label="Sommaire">
        <ul class="brk-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="brk-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="brk-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="brk-side-group" open={isGroupOpen(group.items)}>
                <summary class="brk-side-group__summary">
                  <ChevronDown class="brk-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="brk-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="brk-side-link brk-side-link--sub"
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
      <div class="brk-sidebar-footer">
        <span class="brk-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="brk-sidebar-github"
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
    <div class="brk-content">
      <nav class="brk-breadcrumb" aria-label="Breadcrumb">
        <ol class="brk-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="brk-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="brk-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER MAISON BIRKS ── -->
  <footer class="brk-footer" aria-label="Pied de page Maison Birks">
    <div class="brk-footer__inner">
      <nav class="brk-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="brk-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/birks/logo.svg"
        alt="Maison Birks"
        class="brk-footer__logo"
        width="120"
        height="26"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Maison Birks (joaillier de luxe, palette raffinée) ── */
  .brk-shell {
    --brk-blue: #00558c; /* bleu Birks : marque / actif / loupe / hover */
    --brk-blue-hover: #00436f; /* bleu Birks assombri : hover CTA */
    --brk-gold: #b08d57; /* or : accent / indicateur actif / touches raffinées */
    --brk-ink: #1a1a1a; /* encre quasi noire : texte primaire / footer */
    --brk-grey: #6b6b6b; /* gris secondaire */
    --brk-grey-muted: #9a9a9a; /* gris clair */
    --brk-subtle: #f6f4f0; /* surface subtile crème (papier de luxe) */
    --brk-tint: #eef3f7; /* teinte de survol bleutée très claire */
    --brk-border: #e4e2dd; /* hairline élégant */
    --brk-white: #fff;
    --brk-sidebar-width: 17rem;
    --brk-radius: 3px; /* petits rayons nets */
    --brk-radius-pill: 999px; /* pilules / CTA */
    /* Typo Birks : serif élégante (marque) + grotesk neutre (corps) ; aucune police propriétaire chargée. */
    --brk-font-body: helvetica, arial, sans-serif;
    --brk-font-display: Georgia, 'Times New Roman', Times, serif;
    font-family: var(--brk-font-body);
    background: var(--brk-white);
    color: var(--brk-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Maison Birks ── */
  .brk-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .brk-header {
    background: var(--brk-white);
    border-bottom: 1px solid var(--brk-border);
  }

  .brk-header__inner {
    align-items: center;
    display: flex;
    gap: 2rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.75rem;
    padding: 0.875rem 1.75rem;
  }

  .brk-header__brand {
    flex: 0 0 auto;
  }

  .brk-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .brk-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel Maison Birks (wordmark gravé, ratio préservé, ~26px de haut). */
  .brk-logo {
    display: block;
    width: auto;
    height: 26px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .brk-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .brk-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré net, icône bleu Birks, hover teinté. */
  .brk-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--brk-radius);
    color: var(--brk-blue);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .brk-search-btn:hover,
  .brk-search-btn:focus-visible {
    background: var(--brk-tint);
    border-color: var(--brk-blue);
    color: var(--brk-blue);
    outline: none;
  }

  .brk-nav__item {
    flex: 0 0 auto;
  }

  .brk-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--brk-ink);
    display: inline-flex;
    font-family: var(--brk-font-body);
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    letter-spacing: 0.01em;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .brk-nav__link:hover,
  .brk-nav__link:focus-visible {
    color: var(--brk-blue);
    outline: none;
  }

  /* Onglet actif : souligné or (touche raffinée Maison Birks). */
  .brk-nav__link[aria-current="page"] {
    border-bottom-color: var(--brk-gold);
    color: var(--brk-blue);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .brk-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .brk-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .brk-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .brk-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--brk-border);
  }

  /* Overrides switchers dans header Birks (champs clairs, bord hairline 1px). */
  .brk-header__tools-links :global(.docs-header-control) {
    background: var(--brk-white);
    border-color: var(--brk-border);
    border-radius: var(--brk-radius);
    color: var(--brk-ink);
    font-family: inherit;
  }

  .brk-header__tools-links :global(.docs-header-control:hover),
  .brk-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--brk-tint);
    border-color: var(--brk-blue);
    color: var(--brk-blue);
    box-shadow: none;
  }

  /* CTA pilule bleu Birks (touche raffinée). */
  .brk-cta {
    align-items: center;
    background: var(--brk-blue);
    border: 1px solid var(--brk-blue);
    border-radius: var(--brk-radius-pill);
    color: var(--brk-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--brk-font-body);
    font-size: 0.875rem;
    font-weight: 600;
    height: 2.5rem;
    letter-spacing: 0.02em;
    padding: 0 1.375rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .brk-cta:hover,
  .brk-cta:focus-visible {
    background: var(--brk-blue-hover);
    border-color: var(--brk-blue-hover);
    color: var(--brk-white);
    outline: none;
  }

  /* Burger mobile */
  .brk-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--brk-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Maison Birks ── */
  .brk-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--brk-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Maison Birks ── */
  .brk-sidebar {
    background: var(--brk-white);
    border-right: 1px solid var(--brk-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.75rem);
    position: sticky;
    top: 4.75rem;
  }

  .brk-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .brk-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--brk-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .brk-version-badge {
    background: var(--brk-subtle);
    border: 1px solid var(--brk-border);
    border-radius: var(--brk-radius);
    color: var(--brk-blue);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .brk-sidebar-github {
    align-items: center;
    color: var(--brk-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .brk-sidebar-github:hover,
  .brk-sidebar-github:focus-visible {
    color: var(--brk-blue);
  }

  .brk-side-list,
  .brk-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .brk-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--brk-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .brk-side-link:hover,
  .brk-side-link:focus-visible {
    background: var(--brk-tint);
    color: var(--brk-blue);
    text-decoration: none;
  }

  .brk-side-link[aria-current="page"] {
    background: var(--brk-tint);
    border-left-color: var(--brk-blue);
    color: var(--brk-blue);
    font-weight: 700;
    text-decoration: none;
  }

  .brk-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .brk-side-divider {
    border-top: 1px solid var(--brk-border);
    margin: 0.5rem 0;
  }

  .brk-side-group {
    display: block;
  }

  .brk-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--brk-grey);
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

  .brk-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .brk-side-group__summary:hover,
  .brk-side-group__summary:focus-visible {
    background: var(--brk-tint);
    outline: none;
  }

  .brk-side-group :global(.brk-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .brk-side-group:not([open]) :global(.brk-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .brk-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .brk-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .brk-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .brk-breadcrumb__item {
    align-items: center;
    color: var(--brk-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .brk-breadcrumb__item + .brk-breadcrumb__item::before {
    color: var(--brk-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .brk-breadcrumb__link {
    color: var(--brk-ink);
    text-decoration: none;
  }

  .brk-breadcrumb__link:hover {
    color: var(--brk-blue);
    text-decoration: underline;
  }

  .brk-breadcrumb__item span[aria-current="page"] {
    color: var(--brk-ink);
    font-weight: 600;
  }

  /* ── Footer Maison Birks (bande encre quasi noire, liseré or) ── */
  .brk-footer {
    background: var(--brk-ink);
    border-top: 2px solid var(--brk-gold);
    margin-top: auto;
  }

  .brk-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.75rem;
  }

  .brk-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .brk-footer__link {
    color: var(--brk-white);
    font-size: 0.875rem;
    letter-spacing: 0.01em;
    text-decoration: none;
  }

  .brk-footer__link:hover {
    color: var(--brk-gold);
    text-decoration: underline;
  }

  /* Wordmark Birks en blanc (knockout via filter) sur le footer encre. */
  .brk-footer__logo {
    display: block;
    width: auto;
    height: 26px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .brk-body {
      grid-template-columns: 1fr;
    }

    .brk-sidebar {
      display: none;
    }

    .brk-nav {
      display: none;
    }

    .brk-header__tools {
      display: none;
    }

    .brk-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .brk-nav__link,
    .brk-cta,
    .brk-search-btn,
    .brk-side-link,
    .brk-side-group :global(.brk-side-group__icon) {
      transition: none;
    }
  }
</style>

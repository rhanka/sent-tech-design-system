<!--
  Chrome documentaire Cossette (cossette.com — agence de publicité montréalaise,
  audacieuse ; signature visuelle JAUNE VIF + NOIR). Forme calquée sur le gabarit
  Sid Lee, restylée Cossette :
  - Header : bandeau JAUNE VIF #ffee00 avec texte / nav NOIRS #111111 — assumé,
    fort, « agency ». Logo officiel « cossette » (wordmark noir) à gauche ; nav
    horizontale + loupe de recherche compacte (icône noire) ; CTA pilule inversée
    (fond noir, texte jaune) à droite.
  - Onglet de nav actif : SOULIGNÉ NOIR épais (l'indicateur Cossette).
  - Barre latérale gauche : item actif accent noir à gauche + fond tinté jaune
    léger, sous-items indentés. Fil d'Ariane au-dessus du contenu.
  - Footer : bande NOIRE #111111 avec liens BLANCS + filet d'accent JAUNE #ffee00 ;
    wordmark « cossette » posé sur une puce jaune (le noir reste lisible).
  - Radii nets / carrés (radius 0) pour coller à l'esthétique agence.
  - Logo officiel « cossette » référencé via <img src="/chrome/cossette/logo.svg">.
  - Typo : grotesk neutre (Helvetica/Arial) ; aucune police propriétaire chargée.
  - Préfixe de classes unique `cos-` partout.
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

<div class="cos-shell">
  <!-- ── HEADER COSSETTE ── -->
  <div class="cos-header-wrap">
    <header class="cos-header" aria-label="Cossette">
      <div class="cos-header__inner">
        <!-- Gauche : logo officiel Cossette (wordmark noir sur bandeau jaune) -->
        <div class="cos-header__brand">
          <a href="/" class="cos-header__brand-link" aria-label="Accueil : Cossette Design System">
            <img
              src="/chrome/cossette/logo.svg"
              alt="Cossette"
              class="cos-logo"
              width="120"
              height="20"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="cos-nav" aria-label="Navigation principale">
          <ul class="cos-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="cos-nav__item">
                <a
                  class="cos-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Cossette : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="cos-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA pilule inversée -->
        <div class="cos-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="cos-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA pilule inversée (fond noir, texte jaune) : signature Cossette -->
          <a class="cos-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="cos-header__burger"
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

  <!-- ── BODY COSSETTE ── -->
  <div class="cos-body">
    <!-- Sidebar -->
    <aside class="cos-sidebar" aria-label="Navigation de la documentation">
      <nav class="cos-side-nav" aria-label="Sommaire">
        <ul class="cos-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="cos-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="cos-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="cos-side-group" open={isGroupOpen(group.items)}>
                <summary class="cos-side-group__summary">
                  <ChevronDown class="cos-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="cos-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="cos-side-link cos-side-link--sub"
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
      <div class="cos-sidebar-footer">
        <span class="cos-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="cos-sidebar-github"
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
    <div class="cos-content">
      <nav class="cos-breadcrumb" aria-label="Breadcrumb">
        <ol class="cos-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="cos-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="cos-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER COSSETTE ── -->
  <footer class="cos-footer" aria-label="Pied de page Cossette">
    <div class="cos-footer__inner">
      <nav class="cos-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="cos-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <span class="cos-footer__chip">
        <img
          src="/chrome/cossette/logo.svg"
          alt="Cossette"
          class="cos-footer__logo"
          width="100"
          height="17"
        />
      </span>
    </div>
  </footer>
</div>

<style>
  /* ── Variables Cossette (jaune vif + noir) ── */
  .cos-shell {
    --cos-yellow: #ffee00; /* jaune vif : surface marque / header / accents */
    --cos-yellow-soft: #fff7a8; /* jaune léger : tint hover sidebar */
    --cos-ink: #111111; /* noir : texte / nav / actif / loupe */
    --cos-ink-hover: #111111; /* noir : hover (jouer sur l'opacité) */
    --cos-grey: #5a5a5a; /* gris secondaire (libellés de groupe) */
    --cos-grey-muted: #767676; /* gris clair */
    --cos-subtle: #f4f4f4; /* surface subtile / hover doux */
    --cos-border: #e2e2e2; /* hairline clair */
    --cos-border-ink: #111111; /* hairline noir (sur jaune) */
    --cos-white: #ffffff;
    --cos-sidebar-width: 17rem;
    --cos-radius: 0; /* carré : esthétique agence */
    --cos-radius-pill: 0; /* CTA carré aussi (pilule = rectangle net) */
    /* Typo Cossette : grotesk neutre ; aucune police propriétaire chargée. */
    --cos-font-body: helvetica, arial, sans-serif;
    font-family: var(--cos-font-body);
    background: var(--cos-white);
    color: var(--cos-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Cossette : bandeau jaune vif ── */
  .cos-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .cos-header {
    background: var(--cos-yellow);
    border-bottom: 2px solid var(--cos-ink);
  }

  .cos-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .cos-header__brand {
    flex: 0 0 auto;
  }

  .cos-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .cos-header__brand-link:hover {
    opacity: 0.7;
  }

  /* Logo officiel Cossette (wordmark noir, ratio préservé). */
  .cos-logo {
    display: block;
    width: auto;
    height: 20px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .cos-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .cos-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré, icône noire, hover encre. */
  .cos-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--cos-radius);
    color: var(--cos-ink);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .cos-search-btn:hover,
  .cos-search-btn:focus-visible {
    background: var(--cos-ink);
    border-color: var(--cos-ink);
    color: var(--cos-yellow);
    outline: none;
  }

  .cos-nav__item {
    flex: 0 0 auto;
  }

  .cos-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--cos-ink);
    display: inline-flex;
    font-family: var(--cos-font-body);
    font-size: 0.9375rem;
    font-weight: 700;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, opacity 120ms ease;
    white-space: nowrap;
  }

  .cos-nav__link:hover,
  .cos-nav__link:focus-visible {
    color: var(--cos-ink);
    opacity: 0.6;
    outline: none;
  }

  /* Onglet actif : souligné noir épais (l'indicateur Cossette). */
  .cos-nav__link[aria-current="page"] {
    border-bottom-color: var(--cos-ink);
    color: var(--cos-ink);
    font-weight: 800;
    opacity: 1;
  }

  /* ── Outils droite ── */
  .cos-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .cos-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .cos-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .cos-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--cos-border-ink);
  }

  /* Overrides switchers dans header Cossette : popovers clairs, texte sombre lisible. */
  .cos-header__tools-links :global(.docs-header-control) {
    background: var(--cos-white);
    border-color: var(--cos-ink);
    border-radius: var(--cos-radius);
    color: var(--cos-ink);
    font-family: inherit;
  }

  .cos-header__tools-links :global(.docs-header-control:hover),
  .cos-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--cos-ink);
    border-color: var(--cos-ink);
    color: var(--cos-yellow);
    box-shadow: none;
  }

  /* CTA pilule inversée : fond noir, texte jaune (signature bold Cossette). */
  .cos-cta {
    align-items: center;
    background: var(--cos-ink);
    border: 1px solid var(--cos-ink);
    border-radius: var(--cos-radius-pill);
    color: var(--cos-yellow);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--cos-font-body);
    font-size: 0.875rem;
    font-weight: 800;
    height: 2.5rem;
    letter-spacing: 0.02em;
    padding: 0 1.25rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: background 120ms ease, color 120ms ease;
    white-space: nowrap;
  }

  .cos-cta:hover,
  .cos-cta:focus-visible {
    background: var(--cos-white);
    border-color: var(--cos-ink);
    color: var(--cos-ink);
    outline: none;
  }

  /* Burger mobile */
  .cos-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--cos-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Cossette ── */
  .cos-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--cos-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Cossette ── */
  .cos-sidebar {
    background: var(--cos-white);
    border-right: 1px solid var(--cos-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .cos-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .cos-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--cos-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .cos-version-badge {
    background: var(--cos-yellow);
    border: 1px solid var(--cos-ink);
    border-radius: var(--cos-radius);
    color: var(--cos-ink);
    font-size: 0.78rem;
    font-weight: 800;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .cos-sidebar-github {
    align-items: center;
    color: var(--cos-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 700;
    gap: 0.4rem;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .cos-sidebar-github:hover,
  .cos-sidebar-github:focus-visible {
    opacity: 0.6;
  }

  .cos-side-list,
  .cos-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cos-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--cos-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .cos-side-link:hover,
  .cos-side-link:focus-visible {
    background: var(--cos-subtle);
    color: var(--cos-ink);
    text-decoration: none;
  }

  /* Item actif : accent noir à gauche + fond tinté jaune léger. */
  .cos-side-link[aria-current="page"] {
    background: var(--cos-yellow-soft);
    border-left-color: var(--cos-ink);
    color: var(--cos-ink);
    font-weight: 800;
    text-decoration: none;
  }

  .cos-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .cos-side-divider {
    border-top: 1px solid var(--cos-border);
    margin: 0.5rem 0;
  }

  .cos-side-group {
    display: block;
  }

  .cos-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--cos-grey);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 800;
    gap: 0.35rem;
    letter-spacing: 0.06em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 1rem 0 calc(1rem - 3px);
    text-transform: uppercase;
    transition: background 120ms ease;
  }

  .cos-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .cos-side-group__summary:hover,
  .cos-side-group__summary:focus-visible {
    background: var(--cos-subtle);
    outline: none;
  }

  .cos-side-group :global(.cos-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .cos-side-group:not([open]) :global(.cos-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .cos-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .cos-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .cos-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cos-breadcrumb__item {
    align-items: center;
    color: var(--cos-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .cos-breadcrumb__item + .cos-breadcrumb__item::before {
    color: var(--cos-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .cos-breadcrumb__link {
    color: var(--cos-ink);
    text-decoration: none;
  }

  .cos-breadcrumb__link:hover {
    color: var(--cos-ink);
    text-decoration: underline;
  }

  .cos-breadcrumb__item span[aria-current="page"] {
    color: var(--cos-ink);
    font-weight: 700;
  }

  /* ── Footer Cossette : bande noire + accent jaune ── */
  .cos-footer {
    background: var(--cos-ink);
    border-top: 4px solid var(--cos-yellow);
    margin-top: auto;
  }

  .cos-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .cos-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .cos-footer__link {
    color: var(--cos-white);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .cos-footer__link:hover {
    color: var(--cos-yellow);
    text-decoration: underline;
  }

  /* Wordmark posé sur une puce jaune : le noir reste parfaitement lisible. */
  .cos-footer__chip {
    align-items: center;
    background: var(--cos-yellow);
    display: inline-flex;
    flex: 0 0 auto;
    padding: 0.5rem 0.75rem;
  }

  .cos-footer__logo {
    display: block;
    width: auto;
    height: 17px;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .cos-body {
      grid-template-columns: 1fr;
    }

    .cos-sidebar {
      display: none;
    }

    .cos-nav {
      display: none;
    }

    .cos-header__tools {
      display: none;
    }

    .cos-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .cos-nav__link,
    .cos-cta,
    .cos-search-btn,
    .cos-side-link,
    .cos-side-group :global(.cos-side-group__icon) {
      transition: none;
    }
  }
</style>

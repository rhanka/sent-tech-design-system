<!--
  Chrome documentaire Agropur (agropur.com — la coopérative laitière québécoise).
  Forme fidèle à l'en-tête réel d'agropur.com :
  - Header : bandeau BLANC, hairline fin (#e2e4ea), allure coopérative moderne ;
    logo officiel Agropur (référencé via <img src="/chrome/agropur/logo.svg">,
    ~28px de haut) aligné à gauche ; nav horizontale + loupe de recherche compacte
    (icône #162f53) au centre ; barre utilitaire (switchers + comparateur) à droite
  - Onglet de nav actif : SOULIGNÉ rose #eb6888 (l'indicateur d'accent Agropur),
    texte navy #162f53
  - Barre latérale gauche : item actif accent navy à gauche + fond tinté clair
    (#eef0f5), sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande NAVY #162f53, liens blancs, ligne d'accent rose #eb6888, logo
    Agropur en knockout blanc (filtre to-white)
  - Couleurs marque Agropur :
    navy #162f53 (marque / nav actif / loupe / hovers), rose #eb6888 (accent /
    indicateur actif), bleu d'appui #1997cc (highlight), encre #1a1a1a (corps),
    hairline #e2e4ea, teinte de survol #eef0f5, blanc #ffffff ; radius doux
  - Logo officiel Agropur référencé via <img src="/chrome/agropur/logo.svg"> ;
    aucune police propriétaire chargée (fallbacks système sans-serif).
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

<div class="agr-shell">
  <!-- ── HEADER AGROPUR ── -->
  <div class="agr-header-wrap">
    <header class="agr-header" aria-label="Agropur">
      <div class="agr-header__inner">
        <!-- Gauche : logo officiel Agropur -->
        <div class="agr-header__brand">
          <a href="/" class="agr-header__brand-link" aria-label="Accueil : Agropur Design System">
            <img
              src="/chrome/agropur/logo.svg"
              alt="Agropur"
              class="agr-logo"
              width="110"
              height="28"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="agr-nav" aria-label="Navigation principale">
          <ul class="agr-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="agr-nav__item">
                <a
                  class="agr-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Agropur : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="agr-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA pilule -->
        <div class="agr-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="agr-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA pilule navy : signature coopérative Agropur -->
          <a class="agr-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="agr-header__burger"
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

  <!-- ── BODY AGROPUR ── -->
  <div class="agr-body">
    <!-- Sidebar -->
    <aside class="agr-sidebar" aria-label="Navigation de la documentation">
      <nav class="agr-side-nav" aria-label="Sommaire">
        <ul class="agr-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="agr-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="agr-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="agr-side-group" open={isGroupOpen(group.items)}>
                <summary class="agr-side-group__summary">
                  <ChevronDown class="agr-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="agr-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="agr-side-link agr-side-link--sub"
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
      <div class="agr-sidebar-footer">
        <span class="agr-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="agr-sidebar-github"
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
    <div class="agr-content">
      <nav class="agr-breadcrumb" aria-label="Breadcrumb">
        <ol class="agr-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="agr-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="agr-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER AGROPUR ── -->
  <footer class="agr-footer" aria-label="Pied de page Agropur">
    <div class="agr-footer__inner">
      <nav class="agr-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="agr-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/agropur/logo.svg"
        alt="Agropur"
        class="agr-footer__logo"
        width="103"
        height="26"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Agropur (couleurs de marque agropur.com) ── */
  .agr-shell {
    --agr-navy: #162f53; /* navy : marque / nav actif / loupe / hovers */
    --agr-navy-hover: #0f2340; /* navy assombri : hover CTA */
    --agr-pink: #eb6888; /* rose : accent / indicateur actif */
    --agr-blue: #1997cc; /* bleu d'appui : highlight */
    --agr-ink: #1a1a1a; /* encre : texte primaire */
    --agr-grey: #5b6472; /* gris secondaire */
    --agr-grey-muted: #8a93a3; /* gris clair */
    --agr-subtle: #eef0f5; /* teinte de survol / surface subtile */
    --agr-border: #e2e4ea; /* hairline */
    --agr-white: #fff;
    --agr-sidebar-width: 17rem;
    --agr-radius: 6px; /* contrôles arrondis doux */
    --agr-radius-pill: 999px; /* pilules / CTA */
    /* Typo Agropur : sans-serif moderne ; aucune police propriétaire chargée. */
    --agr-font-body: 'Helvetica Neue', helvetica, arial, sans-serif;
    font-family: var(--agr-font-body);
    background: var(--agr-white);
    color: var(--agr-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Agropur ── */
  .agr-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .agr-header {
    background: var(--agr-white);
    border-bottom: 1px solid var(--agr-border);
  }

  .agr-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .agr-header__brand {
    flex: 0 0 auto;
  }

  .agr-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .agr-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel Agropur (ratio préservé, ~28px de haut). */
  .agr-logo {
    display: block;
    width: auto;
    height: 28px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .agr-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .agr-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré doux, icône navy, hover tinté. */
  .agr-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--agr-radius);
    color: var(--agr-navy);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .agr-search-btn:hover,
  .agr-search-btn:focus-visible {
    background: var(--agr-subtle);
    border-color: var(--agr-navy);
    color: var(--agr-navy);
    outline: none;
  }

  .agr-nav__item {
    flex: 0 0 auto;
  }

  .agr-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--agr-ink);
    display: inline-flex;
    font-family: var(--agr-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .agr-nav__link:hover,
  .agr-nav__link:focus-visible {
    color: var(--agr-navy);
    outline: none;
  }

  /* Onglet actif : souligné rose #eb6888 (l'indicateur d'accent Agropur), texte navy. */
  .agr-nav__link[aria-current="page"] {
    border-bottom-color: var(--agr-pink);
    color: var(--agr-navy);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .agr-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .agr-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .agr-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .agr-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--agr-border);
  }

  /* Overrides switchers dans header Agropur (champs clairs, bord hairline 1px). */
  .agr-header__tools-links :global(.docs-header-control) {
    background: var(--agr-white);
    border-color: var(--agr-border);
    border-radius: var(--agr-radius);
    color: var(--agr-ink);
    font-family: inherit;
  }

  .agr-header__tools-links :global(.docs-header-control:hover),
  .agr-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--agr-subtle);
    border-color: var(--agr-navy);
    color: var(--agr-navy);
    box-shadow: none;
  }

  /* CTA pilule navy (signature coopérative Agropur). */
  .agr-cta {
    align-items: center;
    background: var(--agr-navy);
    border: 1px solid var(--agr-navy);
    border-radius: var(--agr-radius-pill);
    color: var(--agr-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--agr-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .agr-cta:hover,
  .agr-cta:focus-visible {
    background: var(--agr-navy-hover);
    border-color: var(--agr-navy-hover);
    color: var(--agr-white);
    outline: none;
  }

  /* Burger mobile */
  .agr-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--agr-navy);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Agropur ── */
  .agr-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--agr-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Agropur ── */
  .agr-sidebar {
    background: var(--agr-white);
    border-right: 1px solid var(--agr-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .agr-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .agr-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--agr-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .agr-version-badge {
    background: var(--agr-subtle);
    border: 1px solid var(--agr-border);
    border-radius: var(--agr-radius);
    color: var(--agr-navy);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .agr-sidebar-github {
    align-items: center;
    color: var(--agr-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .agr-sidebar-github:hover,
  .agr-sidebar-github:focus-visible {
    color: var(--agr-navy);
  }

  .agr-side-list,
  .agr-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .agr-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--agr-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .agr-side-link:hover,
  .agr-side-link:focus-visible {
    background: var(--agr-subtle);
    color: var(--agr-navy);
    text-decoration: none;
  }

  .agr-side-link[aria-current="page"] {
    background: var(--agr-subtle);
    border-left-color: var(--agr-navy);
    color: var(--agr-navy);
    font-weight: 700;
    text-decoration: none;
  }

  .agr-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .agr-side-divider {
    border-top: 1px solid var(--agr-border);
    margin: 0.5rem 0;
  }

  .agr-side-group {
    display: block;
  }

  .agr-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--agr-grey);
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

  .agr-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .agr-side-group__summary:hover,
  .agr-side-group__summary:focus-visible {
    background: var(--agr-subtle);
    outline: none;
  }

  .agr-side-group :global(.agr-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .agr-side-group:not([open]) :global(.agr-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .agr-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .agr-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .agr-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .agr-breadcrumb__item {
    align-items: center;
    color: var(--agr-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .agr-breadcrumb__item + .agr-breadcrumb__item::before {
    color: var(--agr-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .agr-breadcrumb__link {
    color: var(--agr-navy);
    text-decoration: none;
  }

  .agr-breadcrumb__link:hover {
    color: var(--agr-navy-hover);
    text-decoration: underline;
  }

  .agr-breadcrumb__item span[aria-current="page"] {
    color: var(--agr-ink);
    font-weight: 600;
  }

  /* ── Footer Agropur (bande navy + ligne d'accent rose + logo knockout) ── */
  .agr-footer {
    background: var(--agr-navy);
    border-top: 3px solid var(--agr-pink);
    margin-top: auto;
  }

  .agr-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .agr-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .agr-footer__link {
    color: var(--agr-white);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .agr-footer__link:hover {
    color: var(--agr-pink);
    text-decoration: underline;
  }

  /* Logo Agropur en knockout blanc (filtre to-white) sur la bande navy. */
  .agr-footer__logo {
    display: block;
    width: auto;
    height: 26px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .agr-body {
      grid-template-columns: 1fr;
    }

    .agr-sidebar {
      display: none;
    }

    .agr-nav {
      display: none;
    }

    .agr-header__tools {
      display: none;
    }

    .agr-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .agr-nav__link,
    .agr-cta,
    .agr-search-btn,
    .agr-side-link,
    .agr-side-group :global(.agr-side-group__icon) {
      transition: none;
    }
  }
</style>

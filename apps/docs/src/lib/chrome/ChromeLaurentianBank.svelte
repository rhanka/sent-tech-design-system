<!--
  Chrome documentaire Banque Laurentienne / Laurentian Bank (banquelaurentienne.ca —
  la banque montréalaise). Forme fidèle à l'en-tête corporatif réel :
  - Header : bandeau BLANC, fine ligne hairline gris clair (#e1e4ea), allure
    corporative bancaire ; logo officiel Laurentian Bank (bleu marine #13416F,
    ~26px de haut) à gauche ; nav horizontale au centre + loupe de recherche
    compacte (icône bleue #0068b8) ; switchers docs + CTA à droite
  - Onglet de nav actif : indicateur or #fdb813 (soulignement) + accent bleu
    Laurentienne #0068b8 sur le libellé
  - Barre latérale gauche : item actif accent bleu #0068b8 à gauche + fond tinté
    bleuté #eef4fb, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande bleu marine profond #003054, liens blancs, filet d'accent or
    #fdb813, logo Laurentienne en blanc (knockout via filtre)
  - Couleurs marque : bleu Laurentienne #0068b8 (primaire : nav active, loupe,
    hovers), marine profond #003054 (emphase / footer), or #fdb813 (accent /
    indicateur actif), encre #1a1a1a (corps), hairline #e1e4ea, teinte hover
    #eef4fb, blanc #ffffff
  - Logo officiel Laurentian Bank référencé via
    <img src="/chrome/laurentian-bank/logo.svg">
  - Typo : grotesk corporative ; on ne charge AUCUNE police propriétaire ;
    fallbacks Helvetica / Arial.
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

<div class="lbc-shell">
  <!-- ── HEADER LAURENTIAN BANK ── -->
  <div class="lbc-header-wrap">
    <header class="lbc-header" aria-label="Laurentian Bank">
      <div class="lbc-header__inner">
        <!-- Gauche : logo officiel Laurentian Bank (marine #13416F) -->
        <div class="lbc-header__brand">
          <a href="/" class="lbc-header__brand-link" aria-label="Accueil : Laurentian Bank Design System">
            <img
              src="/chrome/laurentian-bank/logo.svg"
              alt="Laurentian Bank"
              class="lbc-logo"
              width="160"
              height="26"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="lbc-nav" aria-label="Navigation principale">
          <ul class="lbc-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="lbc-nav__item">
                <a
                  class="lbc-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Laurentian Bank : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="lbc-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA -->
        <div class="lbc-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="lbc-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA bleu Laurentienne : signature corporative bancaire -->
          <a class="lbc-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="lbc-header__burger"
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

  <!-- ── BODY LAURENTIAN BANK ── -->
  <div class="lbc-body">
    <!-- Sidebar -->
    <aside class="lbc-sidebar" aria-label="Navigation de la documentation">
      <nav class="lbc-side-nav" aria-label="Sommaire">
        <ul class="lbc-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="lbc-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="lbc-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="lbc-side-group" open={isGroupOpen(group.items)}>
                <summary class="lbc-side-group__summary">
                  <ChevronDown class="lbc-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="lbc-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="lbc-side-link lbc-side-link--sub"
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
      <div class="lbc-sidebar-footer">
        <span class="lbc-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="lbc-sidebar-github"
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
    <div class="lbc-content">
      <nav class="lbc-breadcrumb" aria-label="Breadcrumb">
        <ol class="lbc-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="lbc-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="lbc-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER LAURENTIAN BANK ── -->
  <footer class="lbc-footer" aria-label="Pied de page Laurentian Bank">
    <div class="lbc-footer__inner">
      <nav class="lbc-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="lbc-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/laurentian-bank/logo.svg"
        alt="Laurentian Bank"
        class="lbc-footer__logo"
        width="160"
        height="26"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Laurentian Bank ── */
  .lbc-shell {
    --lbc-blue: #0068b8; /* bleu Laurentienne : primaire (nav active, loupe, hovers) */
    --lbc-blue-hover: #00549a; /* bleu assombri : hover CTA */
    --lbc-navy: #003054; /* marine profond : emphase / footer */
    --lbc-gold: #fdb813; /* or : accent / indicateur actif */
    --lbc-ink: #1a1a1a; /* encre : texte primaire */
    --lbc-grey: #5b6470; /* gris secondaire (libellés, fil d'Ariane) */
    --lbc-grey-muted: #8a929c; /* gris clair */
    --lbc-subtle: #eef4fb; /* teinte bleutée : hover doux / surface active */
    --lbc-border: #e1e4ea; /* hairline gris clair */
    --lbc-white: #fff;
    --lbc-sidebar-width: 17rem;
    --lbc-radius: 4px; /* contrôles arrondis doux corporatifs */
    --lbc-radius-pill: 4px; /* CTA bancaire : peu arrondi */
    /* Typo Laurentian Bank : grotesk corporative ; aucune police propriétaire chargée. */
    --lbc-font-body: helvetica, arial, sans-serif;
    font-family: var(--lbc-font-body);
    background: var(--lbc-white);
    color: var(--lbc-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Laurentian Bank ── */
  .lbc-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .lbc-header {
    background: var(--lbc-white);
    border-bottom: 1px solid var(--lbc-border);
  }

  .lbc-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .lbc-header__brand {
    flex: 0 0 auto;
  }

  .lbc-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .lbc-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel Laurentian Bank (marine #13416F, ratio préservé, ~26px). */
  .lbc-logo {
    display: block;
    width: auto;
    height: 26px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .lbc-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .lbc-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré doux, icône bleue, hover bleuté. */
  .lbc-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--lbc-radius);
    color: var(--lbc-blue);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .lbc-search-btn:hover,
  .lbc-search-btn:focus-visible {
    background: var(--lbc-subtle);
    border-color: var(--lbc-blue);
    color: var(--lbc-blue);
    outline: none;
  }

  .lbc-nav__item {
    flex: 0 0 auto;
  }

  .lbc-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--lbc-ink);
    display: inline-flex;
    font-family: var(--lbc-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .lbc-nav__link:hover,
  .lbc-nav__link:focus-visible {
    color: var(--lbc-blue);
    outline: none;
  }

  /* Onglet actif : soulignement or #fdb813 + libellé bleu Laurentienne. */
  .lbc-nav__link[aria-current="page"] {
    border-bottom-color: var(--lbc-gold);
    color: var(--lbc-blue);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .lbc-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .lbc-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .lbc-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .lbc-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--lbc-border);
  }

  /* Overrides switchers dans header Laurentian Bank (champs clairs, bord hairline 1px). */
  .lbc-header__tools-links :global(.docs-header-control) {
    background: var(--lbc-white);
    border-color: var(--lbc-border);
    border-radius: var(--lbc-radius);
    color: var(--lbc-ink);
    font-family: inherit;
  }

  .lbc-header__tools-links :global(.docs-header-control:hover),
  .lbc-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--lbc-subtle);
    border-color: var(--lbc-blue);
    color: var(--lbc-blue);
    box-shadow: none;
  }

  /* CTA bleu Laurentienne (signature corporative bancaire, peu arrondi). */
  .lbc-cta {
    align-items: center;
    background: var(--lbc-blue);
    border: 1px solid var(--lbc-blue);
    border-radius: var(--lbc-radius-pill);
    color: var(--lbc-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--lbc-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .lbc-cta:hover,
  .lbc-cta:focus-visible {
    background: var(--lbc-blue-hover);
    border-color: var(--lbc-blue-hover);
    color: var(--lbc-white);
    outline: none;
  }

  /* Burger mobile */
  .lbc-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--lbc-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Laurentian Bank ── */
  .lbc-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--lbc-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Laurentian Bank ── */
  .lbc-sidebar {
    background: var(--lbc-white);
    border-right: 1px solid var(--lbc-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .lbc-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .lbc-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--lbc-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .lbc-version-badge {
    background: var(--lbc-subtle);
    border: 1px solid var(--lbc-border);
    border-radius: var(--lbc-radius);
    color: var(--lbc-blue);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .lbc-sidebar-github {
    align-items: center;
    color: var(--lbc-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .lbc-sidebar-github:hover,
  .lbc-sidebar-github:focus-visible {
    color: var(--lbc-blue);
  }

  .lbc-side-list,
  .lbc-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .lbc-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--lbc-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .lbc-side-link:hover,
  .lbc-side-link:focus-visible {
    background: var(--lbc-subtle);
    color: var(--lbc-blue);
    text-decoration: none;
  }

  .lbc-side-link[aria-current="page"] {
    background: var(--lbc-subtle);
    border-left-color: var(--lbc-blue);
    color: var(--lbc-blue);
    font-weight: 700;
    text-decoration: none;
  }

  .lbc-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .lbc-side-divider {
    border-top: 1px solid var(--lbc-border);
    margin: 0.5rem 0;
  }

  .lbc-side-group {
    display: block;
  }

  .lbc-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--lbc-grey);
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

  .lbc-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .lbc-side-group__summary:hover,
  .lbc-side-group__summary:focus-visible {
    background: var(--lbc-subtle);
    outline: none;
  }

  .lbc-side-group :global(.lbc-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .lbc-side-group:not([open]) :global(.lbc-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .lbc-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .lbc-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .lbc-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .lbc-breadcrumb__item {
    align-items: center;
    color: var(--lbc-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .lbc-breadcrumb__item + .lbc-breadcrumb__item::before {
    color: var(--lbc-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .lbc-breadcrumb__link {
    color: var(--lbc-blue);
    text-decoration: none;
  }

  .lbc-breadcrumb__link:hover {
    color: var(--lbc-blue-hover);
    text-decoration: underline;
  }

  .lbc-breadcrumb__item span[aria-current="page"] {
    color: var(--lbc-ink);
    font-weight: 600;
  }

  /* ── Footer Laurentian Bank ── */
  .lbc-footer {
    background: var(--lbc-navy);
    border-top: 3px solid var(--lbc-gold);
    margin-top: auto;
  }

  .lbc-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .lbc-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .lbc-footer__link {
    color: var(--lbc-white);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .lbc-footer__link:hover {
    color: var(--lbc-gold);
    text-decoration: underline;
  }

  /* Logo Laurentian Bank en blanc / knockout (filtré vers le blanc) sur le marine. */
  .lbc-footer__logo {
    display: block;
    width: auto;
    height: 26px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .lbc-body {
      grid-template-columns: 1fr;
    }

    .lbc-sidebar {
      display: none;
    }

    .lbc-nav {
      display: none;
    }

    .lbc-header__tools {
      display: none;
    }

    .lbc-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .lbc-nav__link,
    .lbc-cta,
    .lbc-search-btn,
    .lbc-side-link,
    .lbc-side-group :global(.lbc-side-group__icon) {
      transition: none;
    }
  }
</style>

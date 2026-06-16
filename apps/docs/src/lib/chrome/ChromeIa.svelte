<!--
  Chrome documentaire iA Groupe financier (ia.ca — assurance & gestion de
  patrimoine, Québec). Forme fidèle à l'en-tête corporatif iA :
  - Header : bandeau BLANC propre, fin filet gris clair (#e1e4ea), allure
    corporative épurée ; logo officiel iA (bleu, ~28px) aligné à gauche ; nav
    horizontale + loupe de recherche bleue ; CTA pilule bleu iA à droite
  - Onglet de nav actif : SOULIGNÉ bleu iA #064dd9 (l'indicateur de marque)
  - Barre latérale gauche : item actif accent bleu #064dd9 à gauche + fond tinté
    bleuté (#eef2fd), sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande bleu iA #064dd9, liens blancs, fin liseré rouge #cc0000 en
    accent, logo iA en blanc (knockout via filtre)
  - Couleurs marque iA : bleu #064dd9 (primaire : nav active, loupe, hovers),
    rouge #cc0000 (accent / emphase / indicateur), or #f5de32 (highlight),
    encre #1a1a1a (corps), hairline #e1e4ea, tinte hover #eef2fd, blanc #ffffff
  - Logo officiel iA référencé via <img src="/chrome/ia/logo.svg">
  - Typo : grotesk neutre corporatif ; on ne charge AUCUNE police
    propriétaire ; fallbacks Helvetica / Arial.
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

<div class="ia-shell">
  <!-- ── HEADER iA ── -->
  <div class="ia-header-wrap">
    <header class="ia-header" aria-label="iA Groupe financier">
      <div class="ia-header__inner">
        <!-- Gauche : logo officiel iA (bleu) -->
        <div class="ia-header__brand">
          <a href="/" class="ia-header__brand-link" aria-label="Accueil : iA Design System">
            <img
              src="/chrome/ia/logo.svg"
              alt="iA Groupe financier"
              class="ia-logo"
              width="62"
              height="28"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="ia-nav" aria-label="Navigation principale">
          <ul class="ia-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="ia-nav__item">
                <a
                  class="ia-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche iA : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="ia-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA pilule -->
        <div class="ia-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="ia-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA pilule bleu iA : signature corporative -->
          <a class="ia-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="ia-header__burger"
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

  <!-- ── BODY iA ── -->
  <div class="ia-body">
    <!-- Sidebar -->
    <aside class="ia-sidebar" aria-label="Navigation de la documentation">
      <nav class="ia-side-nav" aria-label="Sommaire">
        <ul class="ia-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="ia-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="ia-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="ia-side-group" open={isGroupOpen(group.items)}>
                <summary class="ia-side-group__summary">
                  <ChevronDown class="ia-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="ia-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="ia-side-link ia-side-link--sub"
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
      <div class="ia-sidebar-footer">
        <span class="ia-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="ia-sidebar-github"
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
    <div class="ia-content">
      <nav class="ia-breadcrumb" aria-label="Breadcrumb">
        <ol class="ia-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="ia-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="ia-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER iA ── -->
  <footer class="ia-footer" aria-label="Pied de page iA Groupe financier">
    <div class="ia-footer__inner">
      <nav class="ia-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="ia-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/ia/logo.svg"
        alt="iA Groupe financier"
        class="ia-footer__logo"
        width="62"
        height="28"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables iA (couleurs de marque ia.ca) ── */
  .ia-shell {
    --ia-blue: #064dd9; /* bleu iA : primaire (nav active, loupe, hovers, CTA) */
    --ia-blue-hover: #0540b3; /* bleu iA assombri : hover */
    --ia-red: #cc0000; /* rouge accent : emphase / indicateur / liseré */
    --ia-gold: #f5de32; /* or : highlight */
    --ia-ink: #1a1a1a; /* encre : texte primaire */
    --ia-grey: #6b7280; /* gris secondaire */
    --ia-grey-muted: #9aa1ad; /* gris clair */
    --ia-subtle: #f6f8fc; /* surface subtile */
    --ia-tint: #eef2fd; /* tinte hover bleutée */
    --ia-border: #e1e4ea; /* hairline gris clair */
    --ia-white: #fff;
    --ia-sidebar-width: 17rem;
    --ia-radius: 4px; /* contrôles arrondis doux */
    --ia-radius-pill: 999px; /* pilules / CTA */
    /* Typo iA : grotesk neutre corporatif ; aucune police propriétaire chargée. */
    --ia-font-body: 'Helvetica Neue', helvetica, arial, sans-serif;
    font-family: var(--ia-font-body);
    background: var(--ia-white);
    color: var(--ia-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header iA ── */
  .ia-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .ia-header {
    background: var(--ia-white);
    border-bottom: 1px solid var(--ia-border);
  }

  .ia-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .ia-header__brand {
    flex: 0 0 auto;
  }

  .ia-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .ia-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel iA (bleu, ratio préservé, ~28px). */
  .ia-logo {
    display: block;
    width: auto;
    height: 28px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .ia-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .ia-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré doux, hover bleu iA. */
  .ia-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--ia-radius);
    color: var(--ia-blue);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .ia-search-btn:hover,
  .ia-search-btn:focus-visible {
    background: var(--ia-tint);
    border-color: var(--ia-blue);
    color: var(--ia-blue);
    outline: none;
  }

  .ia-nav__item {
    flex: 0 0 auto;
  }

  .ia-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--ia-ink);
    display: inline-flex;
    font-family: var(--ia-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .ia-nav__link:hover,
  .ia-nav__link:focus-visible {
    color: var(--ia-blue);
    outline: none;
  }

  /* Onglet actif : souligné bleu iA (l'indicateur de marque). */
  .ia-nav__link[aria-current="page"] {
    border-bottom-color: var(--ia-blue);
    color: var(--ia-blue);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .ia-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .ia-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .ia-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .ia-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--ia-border);
  }

  /* Overrides switchers dans header iA (champs clairs, bord hairline 1px). */
  .ia-header__tools-links :global(.docs-header-control) {
    background: var(--ia-white);
    border-color: var(--ia-border);
    border-radius: var(--ia-radius);
    color: var(--ia-ink);
    font-family: inherit;
  }

  .ia-header__tools-links :global(.docs-header-control:hover),
  .ia-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--ia-tint);
    border-color: var(--ia-blue);
    color: var(--ia-blue);
    box-shadow: none;
  }

  /* CTA pilule bleu iA (signature corporative). */
  .ia-cta {
    align-items: center;
    background: var(--ia-blue);
    border: 1px solid var(--ia-blue);
    border-radius: var(--ia-radius-pill);
    color: var(--ia-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--ia-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .ia-cta:hover,
  .ia-cta:focus-visible {
    background: var(--ia-blue-hover);
    border-color: var(--ia-blue-hover);
    color: var(--ia-white);
    outline: none;
  }

  /* Burger mobile */
  .ia-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--ia-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body iA ── */
  .ia-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--ia-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar iA ── */
  .ia-sidebar {
    background: var(--ia-white);
    border-right: 1px solid var(--ia-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .ia-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .ia-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--ia-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .ia-version-badge {
    background: var(--ia-tint);
    border: 1px solid var(--ia-border);
    border-radius: var(--ia-radius);
    color: var(--ia-blue);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .ia-sidebar-github {
    align-items: center;
    color: var(--ia-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .ia-sidebar-github:hover,
  .ia-sidebar-github:focus-visible {
    color: var(--ia-blue);
  }

  .ia-side-list,
  .ia-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ia-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--ia-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .ia-side-link:hover,
  .ia-side-link:focus-visible {
    background: var(--ia-tint);
    color: var(--ia-blue);
    text-decoration: none;
  }

  .ia-side-link[aria-current="page"] {
    background: var(--ia-tint);
    border-left-color: var(--ia-blue);
    color: var(--ia-blue);
    font-weight: 700;
    text-decoration: none;
  }

  .ia-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .ia-side-divider {
    border-top: 1px solid var(--ia-border);
    margin: 0.5rem 0;
  }

  .ia-side-group {
    display: block;
  }

  .ia-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--ia-grey);
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

  .ia-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .ia-side-group__summary:hover,
  .ia-side-group__summary:focus-visible {
    background: var(--ia-tint);
    outline: none;
  }

  .ia-side-group :global(.ia-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .ia-side-group:not([open]) :global(.ia-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .ia-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .ia-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .ia-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ia-breadcrumb__item {
    align-items: center;
    color: var(--ia-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .ia-breadcrumb__item + .ia-breadcrumb__item::before {
    color: var(--ia-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .ia-breadcrumb__link {
    color: var(--ia-ink);
    text-decoration: none;
  }

  .ia-breadcrumb__link:hover {
    color: var(--ia-blue);
    text-decoration: underline;
  }

  .ia-breadcrumb__item span[aria-current="page"] {
    color: var(--ia-ink);
    font-weight: 600;
  }

  /* ── Footer iA ── */
  .ia-footer {
    background: var(--ia-blue);
    border-top: 3px solid var(--ia-red);
    margin-top: auto;
  }

  .ia-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .ia-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .ia-footer__link {
    color: var(--ia-white);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .ia-footer__link:hover {
    color: var(--ia-white);
    text-decoration: underline;
    text-decoration-color: var(--ia-red);
  }

  /* Logo iA en blanc (knockout via filtre) sur la bande bleue. */
  .ia-footer__logo {
    display: block;
    width: auto;
    height: 28px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .ia-body {
      grid-template-columns: 1fr;
    }

    .ia-sidebar {
      display: none;
    }

    .ia-nav {
      display: none;
    }

    .ia-header__tools {
      display: none;
    }

    .ia-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .ia-nav__link,
    .ia-cta,
    .ia-search-btn,
    .ia-side-link,
    .ia-side-group :global(.ia-side-group__icon) {
      transition: none;
    }
  }
</style>

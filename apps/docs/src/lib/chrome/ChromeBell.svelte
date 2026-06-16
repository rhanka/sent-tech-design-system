<!--
  Chrome documentaire Bell (bell.ca — le plus grand opérateur télécom du Canada,
  registre corporate / institutionnel digne de confiance). Forme fidèle à
  l'en-tête réel de bell.ca :
  - Header : bandeau BLANC propre, hairline gris clair (#e1e1e1) en bas ; logo
    officiel Bell (roundel + wordmark bleu #0067A4, ~28-30px) aligné à gauche ;
    nav horizontale + loupe de recherche compacte ; aspect corporate net
  - Onglet de nav actif : SOULIGNÉ bleu Bell #0070CE (l'indicateur de marque)
  - Loupe de recherche : icône #0070CE
  - Barre latérale gauche : item actif accent bleu #0070CE à gauche + fond tinté
    (#eef5fc), sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande bleu marine profond #003078 avec liens BLANCS + zone wordmark
    Bell en réserve blanche, accents bleu
  - Couleurs de marque Bell : bleu #0070CE (marque / action / lien / loupe),
    marine profond #003078 (emphase / footer), encre #1d1d1b (corps),
    hairline #e1e1e1, teinte hover #eef5fc, blanc #ffffff
  - Logo officiel Bell référencé via <img src="/chrome/bell/logo.svg">
  - Typo : pile système sans-serif neutre (corporate / lisible) — on ne charge
    AUCUNE police propriétaire.
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

<div class="bel-shell">
  <!-- ── HEADER BELL ── -->
  <div class="bel-header-wrap">
    <header class="bel-header" aria-label="Bell">
      <div class="bel-header__inner">
        <!-- Gauche : logo officiel Bell (roundel + wordmark bleu) -->
        <div class="bel-header__brand">
          <a href="/" class="bel-header__brand-link" aria-label="Accueil : Bell Design System">
            <img
              src="/chrome/bell/logo.svg"
              alt="Bell"
              class="bel-logo"
              width="74"
              height="30"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="bel-nav" aria-label="Navigation principale">
          <ul class="bel-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="bel-nav__item">
                <a
                  class="bel-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Bell : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="bel-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA pilule -->
        <div class="bel-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="bel-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA pilule bleu Bell -->
          <a class="bel-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="bel-header__burger"
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

  <!-- ── BODY BELL ── -->
  <div class="bel-body">
    <!-- Sidebar -->
    <aside class="bel-sidebar" aria-label="Navigation de la documentation">
      <nav class="bel-side-nav" aria-label="Sommaire">
        <ul class="bel-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="bel-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="bel-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="bel-side-group" open={isGroupOpen(group.items)}>
                <summary class="bel-side-group__summary">
                  <ChevronDown class="bel-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="bel-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="bel-side-link bel-side-link--sub"
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
      <div class="bel-sidebar-footer">
        <span class="bel-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="bel-sidebar-github"
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
    <div class="bel-content">
      <nav class="bel-breadcrumb" aria-label="Breadcrumb">
        <ol class="bel-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="bel-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="bel-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER BELL ── -->
  <footer class="bel-footer" aria-label="Pied de page Bell">
    <div class="bel-footer__inner">
      <nav class="bel-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="bel-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/bell/logo.svg"
        alt="Bell"
        class="bel-footer__logo"
        width="68"
        height="28"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Bell (marque corporate télécom) ── */
  .bel-shell {
    --bel-blue: #0070ce; /* bleu Bell : marque / action / lien / loupe */
    --bel-blue-hover: #005bab; /* bleu Bell assombri : hover */
    --bel-navy: #003078; /* marine profond : emphase / footer */
    --bel-ink: #1d1d1b; /* encre : texte primaire */
    --bel-grey: #6b7280; /* gris secondaire */
    --bel-grey-muted: #9aa1aa; /* gris clair */
    --bel-subtle: #eef5fc; /* teinte hover bleutée */
    --bel-subtle-2: #e4eefb; /* hover secondaire */
    --bel-border: #e1e1e1; /* hairline gris clair */
    --bel-white: #fff;
    --bel-sidebar-width: 17rem;
    --bel-radius: 4px; /* contrôles arrondis doux */
    --bel-radius-pill: 999px; /* pilules / CTA */
    /* Typo Bell : pile système sans-serif neutre ; aucune police propriétaire chargée. */
    --bel-font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-family: var(--bel-font-body);
    background: var(--bel-white);
    color: var(--bel-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Bell ── */
  .bel-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .bel-header {
    background: var(--bel-white);
    border-bottom: 1px solid var(--bel-border);
  }

  .bel-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .bel-header__brand {
    flex: 0 0 auto;
  }

  .bel-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .bel-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel Bell (roundel + wordmark, ratio préservé). */
  .bel-logo {
    display: block;
    width: auto;
    height: 30px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .bel-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .bel-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré doux, icône/hover bleu Bell. */
  .bel-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--bel-radius);
    color: var(--bel-blue);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .bel-search-btn:hover,
  .bel-search-btn:focus-visible {
    background: var(--bel-subtle);
    border-color: var(--bel-blue);
    color: var(--bel-blue-hover);
    outline: none;
  }

  .bel-nav__item {
    flex: 0 0 auto;
  }

  .bel-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--bel-ink);
    display: inline-flex;
    font-family: var(--bel-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .bel-nav__link:hover,
  .bel-nav__link:focus-visible {
    color: var(--bel-blue);
    outline: none;
  }

  /* Onglet actif : souligné bleu Bell (l'indicateur de marque). */
  .bel-nav__link[aria-current="page"] {
    border-bottom-color: var(--bel-blue);
    color: var(--bel-navy);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .bel-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .bel-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .bel-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .bel-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--bel-border);
  }

  /* Overrides switchers dans header Bell (champs clairs, bord hairline 1px). */
  .bel-header__tools-links :global(.docs-header-control) {
    background: var(--bel-white);
    border-color: var(--bel-border);
    border-radius: var(--bel-radius);
    color: var(--bel-ink);
    font-family: inherit;
  }

  .bel-header__tools-links :global(.docs-header-control:hover),
  .bel-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--bel-subtle);
    border-color: var(--bel-blue);
    color: var(--bel-blue);
    box-shadow: none;
  }

  /* CTA pilule bleu Bell (action de marque). */
  .bel-cta {
    align-items: center;
    background: var(--bel-blue);
    border: 1px solid var(--bel-blue);
    border-radius: var(--bel-radius-pill);
    color: var(--bel-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--bel-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .bel-cta:hover,
  .bel-cta:focus-visible {
    background: var(--bel-blue-hover);
    border-color: var(--bel-blue-hover);
    color: var(--bel-white);
    outline: none;
  }

  /* Burger mobile */
  .bel-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--bel-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Bell ── */
  .bel-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--bel-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Bell ── */
  .bel-sidebar {
    background: var(--bel-white);
    border-right: 1px solid var(--bel-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .bel-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .bel-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--bel-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .bel-version-badge {
    background: var(--bel-subtle);
    border: 1px solid var(--bel-border);
    border-radius: var(--bel-radius);
    color: var(--bel-blue);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .bel-sidebar-github {
    align-items: center;
    color: var(--bel-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .bel-sidebar-github:hover,
  .bel-sidebar-github:focus-visible {
    color: var(--bel-blue);
  }

  .bel-side-list,
  .bel-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .bel-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--bel-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .bel-side-link:hover,
  .bel-side-link:focus-visible {
    background: var(--bel-subtle);
    color: var(--bel-blue);
    text-decoration: none;
  }

  .bel-side-link[aria-current="page"] {
    background: var(--bel-subtle);
    border-left-color: var(--bel-blue);
    color: var(--bel-blue);
    font-weight: 700;
    text-decoration: none;
  }

  .bel-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .bel-side-divider {
    border-top: 1px solid var(--bel-border);
    margin: 0.5rem 0;
  }

  .bel-side-group {
    display: block;
  }

  .bel-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--bel-grey);
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

  .bel-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .bel-side-group__summary:hover,
  .bel-side-group__summary:focus-visible {
    background: var(--bel-subtle);
    outline: none;
  }

  .bel-side-group :global(.bel-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .bel-side-group:not([open]) :global(.bel-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .bel-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .bel-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .bel-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .bel-breadcrumb__item {
    align-items: center;
    color: var(--bel-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .bel-breadcrumb__item + .bel-breadcrumb__item::before {
    color: var(--bel-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .bel-breadcrumb__link {
    color: var(--bel-blue);
    text-decoration: none;
  }

  .bel-breadcrumb__link:hover {
    color: var(--bel-blue-hover);
    text-decoration: underline;
  }

  .bel-breadcrumb__item span[aria-current="page"] {
    color: var(--bel-ink);
    font-weight: 600;
  }

  /* ── Footer Bell ── */
  .bel-footer {
    background: var(--bel-navy);
    border-top: 1px solid var(--bel-navy);
    margin-top: auto;
  }

  .bel-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .bel-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .bel-footer__link {
    color: var(--bel-white);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .bel-footer__link:hover {
    color: var(--bel-white);
    text-decoration: underline;
    text-decoration-color: var(--bel-blue);
  }

  /* Wordmark Bell en réserve blanche (knockout) sur le bandeau marine. */
  .bel-footer__logo {
    display: block;
    width: auto;
    height: 28px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .bel-body {
      grid-template-columns: 1fr;
    }

    .bel-sidebar {
      display: none;
    }

    .bel-nav {
      display: none;
    }

    .bel-header__tools {
      display: none;
    }

    .bel-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .bel-nav__link,
    .bel-cta,
    .bel-search-btn,
    .bel-side-link,
    .bel-side-group :global(.bel-side-group__icon) {
      transition: none;
    }
  }
</style>

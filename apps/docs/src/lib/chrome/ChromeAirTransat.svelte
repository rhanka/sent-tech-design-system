<!--
  Chrome documentaire Air Transat (airtransat.com — la compagnie aérienne /
  voyagiste montréalais). Forme fidèle à l'en-tête réel d'airtransat.com :
  - Header : bandeau BLANC propre et moderne (esprit aérien), hairline fine
    (#e1e6ec) ; logo officiel Air Transat (~28 px) aligné à gauche ; nav
    horizontale au centre + loupe de recherche ; CTA pilule bleu Transat à droite
  - Onglet de nav actif : SOULIGNÉ bleu Transat #005eba (l'indicateur de marque)
  - Loupe de recherche : icône bleu Transat #005eba
  - Barre latérale gauche : item actif accent bleu à gauche + fond tinté bleu
    clair (#eaf3fc), sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande bleu marine profond #002855, liens blancs, ligne d'accent
    bleu clair #3fbbef, logo Air Transat blanc/knockout (filtré en blanc)
  - Couleurs de marque Air Transat :
    bleu Transat #005eba (marque / action / lien / nav active / loupe / hovers),
    bleu clair #3fbbef (accent), bleu marine profond #002855 (emphase / footer),
    encre #1a1a1a (corps), hairline #e1e6ec, teinte de survol #eaf3fc, blanc #fff
  - Logo officiel Air Transat référencé via <img src="/chrome/air-transat/logo.svg">
  - Typo : grotesk neutre (corps / UI). On ne charge AUCUNE police propriétaire ;
    fallback Helvetica / Arial.
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

<div class="atr-shell">
  <!-- ── HEADER AIR TRANSAT ── -->
  <div class="atr-header-wrap">
    <header class="atr-header" aria-label="Air Transat">
      <div class="atr-header__inner">
        <!-- Gauche : logo officiel Air Transat -->
        <div class="atr-header__brand">
          <a href="/" class="atr-header__brand-link" aria-label="Accueil : Air Transat Design System">
            <img
              src="/chrome/air-transat/logo.svg"
              alt="Air Transat"
              class="atr-logo"
              width="120"
              height="28"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="atr-nav" aria-label="Navigation principale">
          <ul class="atr-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="atr-nav__item">
                <a
                  class="atr-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Air Transat : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="atr-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA pilule -->
        <div class="atr-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="atr-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA pilule bleu Transat : signature Air Transat -->
          <a class="atr-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="atr-header__burger"
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

  <!-- ── BODY AIR TRANSAT ── -->
  <div class="atr-body">
    <!-- Sidebar -->
    <aside class="atr-sidebar" aria-label="Navigation de la documentation">
      <nav class="atr-side-nav" aria-label="Sommaire">
        <ul class="atr-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="atr-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="atr-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="atr-side-group" open={isGroupOpen(group.items)}>
                <summary class="atr-side-group__summary">
                  <ChevronDown class="atr-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="atr-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="atr-side-link atr-side-link--sub"
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
      <div class="atr-sidebar-footer">
        <span class="atr-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="atr-sidebar-github"
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
    <div class="atr-content">
      <nav class="atr-breadcrumb" aria-label="Breadcrumb">
        <ol class="atr-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="atr-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="atr-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER AIR TRANSAT ── -->
  <footer class="atr-footer" aria-label="Pied de page Air Transat">
    <div class="atr-footer__inner">
      <nav class="atr-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="atr-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/air-transat/logo.svg"
        alt="Air Transat"
        class="atr-footer__logo"
        width="120"
        height="28"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Air Transat (couleurs de marque airtransat.com) ── */
  .atr-shell {
    --atr-blue: #005eba; /* bleu Transat : marque / action / lien / nav active */
    --atr-blue-hover: #004a96; /* bleu Transat assombri : hover */
    --atr-accent: #3fbbef; /* bleu clair : ligne d'accent */
    --atr-navy: #002855; /* bleu marine profond : emphase / footer */
    --atr-ink: #1a1a1a; /* encre : texte primaire */
    --atr-grey: #5a6573; /* gris secondaire */
    --atr-grey-muted: #8a94a3; /* gris clair */
    --atr-subtle: #eaf3fc; /* teinte de survol bleu clair */
    --atr-border: #e1e6ec; /* hairline */
    --atr-white: #fff;
    --atr-sidebar-width: 17rem;
    --atr-radius: 4px; /* contrôles arrondis doux */
    --atr-radius-pill: 999px; /* pilules / CTA */
    /* Typo Air Transat : grotesk neutre (corps) ; aucune police propriétaire chargée. */
    --atr-font-body: helvetica, arial, sans-serif;
    font-family: var(--atr-font-body);
    background: var(--atr-white);
    color: var(--atr-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Air Transat ── */
  .atr-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .atr-header {
    background: var(--atr-white);
    border-bottom: 1px solid var(--atr-border);
  }

  .atr-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .atr-header__brand {
    flex: 0 0 auto;
  }

  .atr-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .atr-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel Air Transat (~28 px, ratio préservé). */
  .atr-logo {
    display: block;
    width: auto;
    height: 28px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .atr-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .atr-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré doux, icône bleu Transat. */
  .atr-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--atr-radius);
    color: var(--atr-blue);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .atr-search-btn:hover,
  .atr-search-btn:focus-visible {
    background: var(--atr-subtle);
    border-color: var(--atr-blue);
    color: var(--atr-blue);
    outline: none;
  }

  .atr-nav__item {
    flex: 0 0 auto;
  }

  .atr-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--atr-ink);
    display: inline-flex;
    font-family: var(--atr-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .atr-nav__link:hover,
  .atr-nav__link:focus-visible {
    color: var(--atr-blue);
    outline: none;
  }

  /* Onglet actif : souligné bleu Transat (l'indicateur de marque Air Transat). */
  .atr-nav__link[aria-current="page"] {
    border-bottom-color: var(--atr-blue);
    color: var(--atr-blue);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .atr-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .atr-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .atr-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .atr-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--atr-border);
  }

  /* Overrides switchers dans header Air Transat (champs clairs, bord hairline 1px). */
  .atr-header__tools-links :global(.docs-header-control) {
    background: var(--atr-white);
    border-color: var(--atr-border);
    border-radius: var(--atr-radius);
    color: var(--atr-ink);
    font-family: inherit;
  }

  .atr-header__tools-links :global(.docs-header-control:hover),
  .atr-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--atr-subtle);
    border-color: var(--atr-blue);
    color: var(--atr-blue);
    box-shadow: none;
  }

  /* CTA pilule bleu Transat (signature Air Transat). */
  .atr-cta {
    align-items: center;
    background: var(--atr-blue);
    border: 1px solid var(--atr-blue);
    border-radius: var(--atr-radius-pill);
    color: var(--atr-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--atr-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .atr-cta:hover,
  .atr-cta:focus-visible {
    background: var(--atr-blue-hover);
    border-color: var(--atr-blue-hover);
    color: var(--atr-white);
    outline: none;
  }

  /* Burger mobile */
  .atr-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--atr-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Air Transat ── */
  .atr-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--atr-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Air Transat ── */
  .atr-sidebar {
    background: var(--atr-white);
    border-right: 1px solid var(--atr-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .atr-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .atr-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--atr-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .atr-version-badge {
    background: var(--atr-subtle);
    border: 1px solid var(--atr-border);
    border-radius: var(--atr-radius);
    color: var(--atr-blue);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .atr-sidebar-github {
    align-items: center;
    color: var(--atr-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .atr-sidebar-github:hover,
  .atr-sidebar-github:focus-visible {
    color: var(--atr-blue);
  }

  .atr-side-list,
  .atr-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .atr-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--atr-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .atr-side-link:hover,
  .atr-side-link:focus-visible {
    background: var(--atr-subtle);
    color: var(--atr-blue);
    text-decoration: none;
  }

  .atr-side-link[aria-current="page"] {
    background: var(--atr-subtle);
    border-left-color: var(--atr-blue);
    color: var(--atr-blue);
    font-weight: 700;
    text-decoration: none;
  }

  .atr-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .atr-side-divider {
    border-top: 1px solid var(--atr-border);
    margin: 0.5rem 0;
  }

  .atr-side-group {
    display: block;
  }

  .atr-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--atr-grey);
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

  .atr-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .atr-side-group__summary:hover,
  .atr-side-group__summary:focus-visible {
    background: var(--atr-subtle);
    outline: none;
  }

  .atr-side-group :global(.atr-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .atr-side-group:not([open]) :global(.atr-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .atr-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .atr-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .atr-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .atr-breadcrumb__item {
    align-items: center;
    color: var(--atr-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .atr-breadcrumb__item + .atr-breadcrumb__item::before {
    color: var(--atr-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .atr-breadcrumb__link {
    color: var(--atr-ink);
    text-decoration: none;
  }

  .atr-breadcrumb__link:hover {
    color: var(--atr-blue);
    text-decoration: underline;
  }

  .atr-breadcrumb__item span[aria-current="page"] {
    color: var(--atr-ink);
    font-weight: 600;
  }

  /* ── Footer Air Transat ── */
  .atr-footer {
    background: var(--atr-navy);
    border-top: 3px solid var(--atr-accent);
    margin-top: auto;
  }

  .atr-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .atr-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .atr-footer__link {
    color: var(--atr-white);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .atr-footer__link:hover {
    color: var(--atr-accent);
    text-decoration: underline;
  }

  /* Logo Air Transat en blanc/knockout sur la bande marine. */
  .atr-footer__logo {
    display: block;
    width: auto;
    height: 28px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .atr-body {
      grid-template-columns: 1fr;
    }

    .atr-sidebar {
      display: none;
    }

    .atr-nav {
      display: none;
    }

    .atr-header__tools {
      display: none;
    }

    .atr-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .atr-nav__link,
    .atr-cta,
    .atr-search-btn,
    .atr-side-link,
    .atr-side-group :global(.atr-side-group__icon) {
      transition: none;
    }
  }
</style>

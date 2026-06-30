<!--
  Chrome documentaire Énergir (energir.com — le distributeur de gaz naturel /
  l'utilité énergétique du Québec). Forme fidèle à l'en-tête réel d'energir.com :
  - Header : bandeau BLANC, hairline fine (#e1e5ec), allure propre et utilitaire ;
    logo officiel Énergir (référencé via <img src="/chrome/energir/logo.svg">,
    ~28px de haut) aligné à gauche ; nav horizontale au centre + loupe de
    recherche compacte (icône bleu #0047bb) ; CTA pilule bleu à droite
  - Onglet de nav actif : SOULIGNÉ cyan #009fdf (indicateur d'accent Énergir)
  - Barre latérale gauche : item actif accent bleu #0047bb à gauche + fond tinté
    bleu très clair, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande bleu marine profond #002855, liens blancs, ligne d'accent cyan
    #009fdf, logo Énergir en blanc/knockout (filtre vers blanc)
  - Couleurs marque Énergir : bleu #0047bb (primaire : nav actif, loupe, hovers,
    CTA), cyan #009fdf (accent / soulignement actif), marine #002855 (emphase /
    footer), encre #1a1a1a (corps), hairline #e1e5ec, teinte de survol #eaf1fb,
    blanc #ffffff ; radius doux (md 4px, pilules 999px)
  - Typo : grotesk neutre (corps / UI) ; on ne charge AUCUNE police
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

<div class="enr-shell">
  <!-- ── HEADER ÉNERGIR ── -->
  <div class="enr-header-wrap">
    <header class="enr-header" aria-label="Énergir">
      <div class="enr-header__inner">
        <!-- Gauche : logo officiel Énergir -->
        <div class="enr-header__brand">
          <a href="/" class="enr-header__brand-link" aria-label="Accueil : Énergir Design System">
            <img
              src="/chrome/energir/logo.svg"
              alt="Énergir"
              class="enr-logo"
              width="120"
              height="28"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="enr-nav" aria-label="Navigation principale">
          <ul class="enr-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="enr-nav__item">
                <a
                  class="enr-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Énergir : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="enr-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA pilule -->
        <div class="enr-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="enr-header__tools-links">
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
          class="enr-header__burger"
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

  <!-- ── BODY ÉNERGIR ── -->
  <div class="enr-body">
    <!-- Sidebar -->
    <aside class="enr-sidebar" aria-label="Navigation de la documentation">
      <nav class="enr-side-nav" aria-label="Sommaire">
        <ul class="enr-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="enr-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="enr-side-divider" role="separator"></li>

          <li class="enr-side-heading">
            <a
              class="enr-side-link enr-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="enr-side-group" open={isGroupOpen(group.items)}>
                <summary class="enr-side-group__summary">
                  <ChevronDown class="enr-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="enr-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="enr-side-link enr-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="enr-side-divider" role="separator"></li>

          <li class="enr-side-heading">
            <a
              class="enr-side-link enr-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="enr-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="enr-side-group__summary">
                  <ChevronDown class="enr-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="enr-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="enr-side-link enr-side-link--sub"
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
      <div class="enr-sidebar-footer">
        <span class="enr-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="enr-sidebar-github"
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
    <div class="enr-content">
      <nav class="enr-breadcrumb" aria-label="Breadcrumb">
        <ol class="enr-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="enr-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="enr-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER ÉNERGIR ── -->
  <footer class="enr-footer" aria-label="Pied de page Énergir">
    <div class="enr-footer__inner">
      <nav class="enr-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="enr-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/energir/logo.svg"
        alt="Énergir"
        class="enr-footer__logo"
        width="120"
        height="28"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Énergir (marque energir.com) ── */
  .enr-shell {
    --enr-blue: #0047bb; /* bleu primaire : marque / action / nav actif / loupe */
    --enr-blue-hover: #003a99; /* bleu assombri : hover CTA */
    --enr-cyan: #009fdf; /* cyan accent : soulignement actif / ligne footer */
    --enr-navy: #002855; /* marine profond : emphase / bande footer */
    --enr-ink: #1a1a1a; /* encre : texte primaire */
    --enr-grey: #6b7280; /* gris secondaire */
    --enr-grey-muted: #9aa3ad; /* gris clair */
    --enr-subtle: #eaf1fb; /* teinte de survol bleu très clair */
    --enr-subtle-2: #dde7f6; /* hover secondaire */
    --enr-border: #e1e5ec; /* hairline */
    --enr-white: #fff;
    --enr-sidebar-width: 17rem;
    --enr-radius: 4px; /* contrôles arrondis doux */
    --enr-radius-pill: 999px; /* pilules / CTA */
    /* Typo Énergir : grotesk neutre ; aucune police propriétaire chargée. */
    --enr-font-body: helvetica, arial, sans-serif;
    --enr-font-display: helvetica, arial, sans-serif;
    font-family: var(--enr-font-body);
    background: var(--enr-white);
    color: var(--enr-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Énergir ── */
  .enr-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .enr-header {
    background: var(--enr-white);
    border-bottom: 1px solid var(--enr-border);
  }

  .enr-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .enr-header__brand {
    flex: 0 0 auto;
  }

  .enr-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .enr-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel Énergir (ratio préservé, ~28px de haut). */
  .enr-logo {
    display: block;
    width: auto;
    height: 28px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .enr-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .enr-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré doux, icône bleu, hover tinté. */
  .enr-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--enr-radius);
    color: var(--enr-blue);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .enr-search-btn:hover,
  .enr-search-btn:focus-visible {
    background: var(--enr-subtle);
    border-color: var(--enr-blue);
    color: var(--enr-blue);
    outline: none;
  }

  .enr-nav__item {
    flex: 0 0 auto;
  }

  .enr-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--enr-ink);
    display: inline-flex;
    font-family: var(--enr-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .enr-nav__link:hover,
  .enr-nav__link:focus-visible {
    color: var(--enr-blue);
    outline: none;
  }

  /* Onglet actif : souligné cyan (indicateur d'accent Énergir). */
  .enr-nav__link[aria-current="page"] {
    border-bottom-color: var(--enr-cyan);
    color: var(--enr-blue);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .enr-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .enr-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .enr-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .enr-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--enr-border);
  }

  /* Overrides switchers dans header Énergir (champs clairs, bord hairline 1px). */
  .enr-header__tools-links :global(.docs-header-control) {
    background: var(--enr-white);
    border-color: var(--enr-border);
    border-radius: var(--enr-radius);
    color: var(--enr-ink);
    font-family: inherit;
  }

  .enr-header__tools-links :global(.docs-header-control:hover),
  .enr-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--enr-subtle);
    border-color: var(--enr-blue);
    color: var(--enr-blue);
    box-shadow: none;
  }

  /* CTA pilule bleu (signature utilitaire Énergir). */
  .enr-cta {
    align-items: center;
    background: var(--enr-blue);
    border: 1px solid var(--enr-blue);
    border-radius: var(--enr-radius-pill);
    color: var(--enr-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--enr-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .enr-cta:hover,
  .enr-cta:focus-visible {
    background: var(--enr-blue-hover);
    border-color: var(--enr-blue-hover);
    color: var(--enr-white);
    outline: none;
  }

  /* Burger mobile */
  .enr-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--enr-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Énergir ── */
  .enr-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--enr-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Énergir ── */
  .enr-sidebar {
    background: var(--enr-white);
    border-right: 1px solid var(--enr-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .enr-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .enr-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--enr-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .enr-version-badge {
    background: var(--enr-subtle);
    border: 1px solid var(--enr-border);
    border-radius: var(--enr-radius);
    color: var(--enr-blue);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .enr-sidebar-github {
    align-items: center;
    color: var(--enr-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .enr-sidebar-github:hover,
  .enr-sidebar-github:focus-visible {
    color: var(--enr-blue);
  }

  .enr-side-list,
  .enr-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .enr-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--enr-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .enr-side-link:hover,
  .enr-side-link:focus-visible {
    background: var(--enr-subtle);
    color: var(--enr-blue);
    text-decoration: none;
  }

  .enr-side-link[aria-current="page"] {
    background: var(--enr-subtle);
    border-left-color: var(--enr-blue);
    color: var(--enr-blue);
    font-weight: 700;
    text-decoration: none;
  }

  .enr-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .enr-side-divider {
    border-top: 1px solid var(--enr-border);
    margin: 0.5rem 0;
  }

  .enr-side-group {
    display: block;
  }

  .enr-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--enr-grey);
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

  .enr-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .enr-side-group__summary:hover,
  .enr-side-group__summary:focus-visible {
    background: var(--enr-subtle);
    outline: none;
  }

  .enr-side-group :global(.enr-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .enr-side-group:not([open]) :global(.enr-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .enr-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .enr-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .enr-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .enr-breadcrumb__item {
    align-items: center;
    color: var(--enr-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .enr-breadcrumb__item + .enr-breadcrumb__item::before {
    color: var(--enr-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .enr-breadcrumb__link {
    color: var(--enr-blue);
    text-decoration: none;
  }

  .enr-breadcrumb__link:hover {
    color: var(--enr-blue-hover);
    text-decoration: underline;
  }

  .enr-breadcrumb__item span[aria-current="page"] {
    color: var(--enr-ink);
    font-weight: 600;
  }

  /* ── Footer Énergir ── */
  .enr-footer {
    background: var(--enr-navy);
    border-top: 3px solid var(--enr-cyan);
    margin-top: auto;
  }

  .enr-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .enr-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .enr-footer__link {
    color: var(--enr-white);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .enr-footer__link:hover {
    color: var(--enr-cyan);
    text-decoration: underline;
  }

  /* Logo Énergir en blanc/knockout (filtre vers blanc) sur la bande marine. */
  .enr-footer__logo {
    display: block;
    width: auto;
    height: 28px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .enr-body {
      grid-template-columns: 1fr;
    }

    .enr-sidebar {
      display: none;
    }

    .enr-nav {
      display: none;
    }

    .enr-header__tools {
      display: none;
    }

    .enr-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .enr-nav__link,
    .enr-cta,
    .enr-search-btn,
    .enr-side-link,
    .enr-side-group :global(.enr-side-group__icon) {
      transition: none;
    }
  }
</style>

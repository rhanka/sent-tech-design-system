<!--
  Chrome documentaire Sid Lee (sidlee.com — l'agence de création mondiale née à
  Montréal). Forme fidèle à l'en-tête réel de sidlee.com :
  - Header : bandeau BLANC, logo officiel Sid Lee (monogramme « SL e » inline,
    récupéré du header réel, fill encre) à gauche ; nav horizontale au centre +
    loupe de recherche ; CTA orange-rouge (pilule) à droite
  - Onglet de nav actif : SOULIGNÉ orange-rouge (l'indicateur expressif Sid Lee)
  - Barre latérale gauche : item actif accent orange-rouge à gauche + fond tinté
    gris clair, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande claire avec liens + logo Sid Lee
  - Couleurs MESURÉES depuis le CSS calculé de sidlee.com (cf. theme-sid-lee) :
    orange-rouge #FF440B (marque / action / lien), encre #1a1a1a, gris
    secondaire #868e96, gris clair #a8a8a8, surface subtile #f5f5f5, bord
    hairline #e0e0e0, blanc #ffffff ; radius doux (md 4px, pilules 999px)
  - Logo officiel Sid Lee (monogramme vectoriel du header réel) référencé via
    <img src="/chrome/sid-lee/logo.svg">
  - Typo : 'visuelt' (grotesk suisse, corps / UI) + 'sang-bleu-kingdom' (serif
    de display, titres) — alias webfont propres à Sid Lee. On ne charge AUCUNE
    police propriétaire ; fallbacks Helvetica (visuelt) / Georgia (sang-bleu).
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

<div class="sl-shell">
  <!-- ── HEADER SID LEE ── -->
  <div class="sl-header-wrap">
    <header class="sl-header" aria-label="Sid Lee">
      <div class="sl-header__inner">
        <!-- Gauche : logo officiel Sid Lee (monogramme du header réel) -->
        <div class="sl-header__brand">
          <a href="/" class="sl-header__brand-link" aria-label="Accueil : Sid Lee Design System">
            <img
              src="/chrome/sid-lee/logo.svg"
              alt="Sid Lee"
              class="sl-logo"
              width="44"
              height="30"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="sl-nav" aria-label="Navigation principale">
          <ul class="sl-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="sl-nav__item">
                <a
                  class="sl-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Sid Lee : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="sl-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA pilule -->
        <div class="sl-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="sl-header__tools-links">
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
          class="sl-header__burger"
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

  <!-- ── BODY SID LEE ── -->
  <div class="sl-body">
    <!-- Sidebar -->
    <aside class="sl-sidebar" aria-label="Navigation de la documentation">
      <nav class="sl-side-nav" aria-label="Sommaire">
        <ul class="sl-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="sl-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="sl-side-divider" role="separator"></li>

          <li class="sl-side-heading">
            <a
              class="sl-side-link sl-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="sl-side-group" open={isGroupOpen(group.items)}>
                <summary class="sl-side-group__summary">
                  <ChevronDown class="sl-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="sl-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="sl-side-link sl-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="sl-side-divider" role="separator"></li>

          <li class="sl-side-heading">
            <a
              class="sl-side-link sl-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="sl-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="sl-side-group__summary">
                  <ChevronDown class="sl-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="sl-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="sl-side-link sl-side-link--sub"
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
      <div class="sl-sidebar-footer">
        <span class="sl-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="sl-sidebar-github"
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
    <div class="sl-content">
      <nav class="sl-breadcrumb" aria-label="Breadcrumb">
        <ol class="sl-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="sl-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="sl-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER SID LEE ── -->
  <footer class="sl-footer" aria-label="Pied de page Sid Lee">
    <div class="sl-footer__inner">
      <nav class="sl-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="sl-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/sid-lee/logo.svg"
        alt="Sid Lee"
        class="sl-footer__logo"
        width="41"
        height="28"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Sid Lee (mesurées depuis sidlee.com) ── */
  .sl-shell {
    --sl-orange: #ff440b; /* orange-rouge : marque / action / lien (11 els) */
    --sl-orange-hover: #e03808; /* orange-rouge assombri : hover (à confirmer) */
    --sl-ink: #1a1a1a; /* encre : texte primaire */
    --sl-ink-inverse: #191919; /* surface inverse (ton footer) */
    --sl-grey: #868e96; /* gris secondaire mesuré */
    --sl-grey-muted: #a8a8a8; /* gris clair mesuré */
    --sl-subtle: #f5f5f5; /* surface subtile / hover doux */
    --sl-subtle-2: #e9e9e9; /* hover secondaire mesuré */
    --sl-border: #e0e0e0; /* hairline (à confirmer) */
    --sl-white: #fff;
    --sl-sidebar-width: 17rem;
    --sl-radius: 4px; /* contrôles arrondis doux */
    --sl-radius-pill: 999px; /* pilules / CTA */
    /* Typo Sid Lee : visuelt (grotesk, corps) ; aucune police propriétaire chargée. */
    --sl-font-body: 'visuelt', helvetica, arial, sans-serif;
    --sl-font-display: 'sang-bleu-kingdom', Georgia, Times, serif;
    font-family: var(--sl-font-body);
    background: var(--sl-white);
    color: var(--sl-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Sid Lee ── */
  .sl-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .sl-header {
    background: var(--sl-white);
    border-bottom: 1px solid var(--sl-border);
  }

  .sl-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .sl-header__brand {
    flex: 0 0 auto;
  }

  .sl-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .sl-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel Sid Lee (monogramme inline du header réel, ratio préservé). */
  .sl-logo {
    display: block;
    width: auto;
    height: 30px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .sl-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .sl-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré doux, hover gris/orange. */
  .sl-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--sl-radius);
    color: var(--sl-ink);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .sl-search-btn:hover,
  .sl-search-btn:focus-visible {
    background: var(--sl-subtle);
    border-color: var(--sl-orange);
    color: var(--sl-orange);
    outline: none;
  }

  .sl-nav__item {
    flex: 0 0 auto;
  }

  .sl-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--sl-ink);
    display: inline-flex;
    font-family: var(--sl-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .sl-nav__link:hover,
  .sl-nav__link:focus-visible {
    color: var(--sl-orange);
    outline: none;
  }

  /* Onglet actif : souligné orange-rouge (l'indicateur expressif Sid Lee). */
  .sl-nav__link[aria-current="page"] {
    border-bottom-color: var(--sl-orange);
    color: var(--sl-ink);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .sl-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .sl-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .sl-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .sl-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--sl-border);
  }

  /* Overrides switchers dans header Sid Lee (champs clairs, bord hairline 1px). */
  .sl-header__tools-links :global(.docs-header-control) {
    background: var(--sl-white);
    border-color: var(--sl-border);
    border-radius: var(--sl-radius);
    color: var(--sl-ink);
    font-family: inherit;
  }

  .sl-header__tools-links :global(.docs-header-control:hover),
  .sl-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--sl-subtle);
    border-color: var(--sl-orange);
    color: var(--sl-orange);
    box-shadow: none;
  }

  /* CTA pilule orange-rouge (signature bold creative Sid Lee). */
  .sl-cta {
    align-items: center;
    background: var(--sl-orange);
    border: 1px solid var(--sl-orange);
    border-radius: var(--sl-radius-pill);
    color: var(--sl-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--sl-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .sl-cta:hover,
  .sl-cta:focus-visible {
    background: var(--sl-orange-hover);
    border-color: var(--sl-orange-hover);
    color: var(--sl-white);
    outline: none;
  }

  /* Burger mobile */
  .sl-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--sl-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Sid Lee ── */
  .sl-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--sl-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Sid Lee ── */
  .sl-sidebar {
    background: var(--sl-white);
    border-right: 1px solid var(--sl-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .sl-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .sl-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--sl-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .sl-version-badge {
    background: var(--sl-subtle);
    border: 1px solid var(--sl-border);
    border-radius: var(--sl-radius);
    color: var(--sl-orange);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .sl-sidebar-github {
    align-items: center;
    color: var(--sl-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .sl-sidebar-github:hover,
  .sl-sidebar-github:focus-visible {
    color: var(--sl-orange);
  }

  .sl-side-list,
  .sl-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .sl-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--sl-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .sl-side-link:hover,
  .sl-side-link:focus-visible {
    background: var(--sl-subtle);
    color: var(--sl-orange);
    text-decoration: none;
  }

  .sl-side-link[aria-current="page"] {
    background: var(--sl-subtle);
    border-left-color: var(--sl-orange);
    color: var(--sl-orange);
    font-weight: 700;
    text-decoration: none;
  }

  .sl-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .sl-side-divider {
    border-top: 1px solid var(--sl-border);
    margin: 0.5rem 0;
  }

  .sl-side-group {
    display: block;
  }

  .sl-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--sl-grey);
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

  .sl-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .sl-side-group__summary:hover,
  .sl-side-group__summary:focus-visible {
    background: var(--sl-subtle);
    outline: none;
  }

  .sl-side-group :global(.sl-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .sl-side-group:not([open]) :global(.sl-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .sl-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .sl-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .sl-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .sl-breadcrumb__item {
    align-items: center;
    color: var(--sl-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .sl-breadcrumb__item + .sl-breadcrumb__item::before {
    color: var(--sl-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .sl-breadcrumb__link {
    color: var(--sl-ink);
    text-decoration: none;
  }

  .sl-breadcrumb__link:hover {
    color: var(--sl-orange);
    text-decoration: underline;
  }

  .sl-breadcrumb__item span[aria-current="page"] {
    color: var(--sl-ink);
    font-weight: 600;
  }

  /* ── Footer Sid Lee ── */
  .sl-footer {
    background: var(--sl-subtle);
    border-top: 1px solid var(--sl-border);
    margin-top: auto;
  }

  .sl-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .sl-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .sl-footer__link {
    color: var(--sl-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .sl-footer__link:hover {
    color: var(--sl-orange);
    text-decoration: underline;
  }

  .sl-footer__logo {
    display: block;
    width: auto;
    height: 28px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .sl-body {
      grid-template-columns: 1fr;
    }

    .sl-sidebar {
      display: none;
    }

    .sl-nav {
      display: none;
    }

    .sl-header__tools {
      display: none;
    }

    .sl-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .sl-nav__link,
    .sl-cta,
    .sl-search-btn,
    .sl-side-link,
    .sl-side-group :global(.sl-side-group__icon) {
      transition: none;
    }
  }
</style>

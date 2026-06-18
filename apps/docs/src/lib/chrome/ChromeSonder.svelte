<!--
  Chrome documentaire Sonder (sonder.com — l'hôtellerie design-forward, identité
  WARM MINIMAL). Forme fidèle à l'esthétique chaleureuse-minimale de Sonder :
  - Header : bandeau CRÈME CHAUD #f7f3ea (la signature Sonder), texte / nav quasi
    noir #1a1a1a, calme et élégant, fine hairline chaude #e6e0d6 en bas ; logo
    « sonder » (wordmark bas-de-casse, quasi noir, ~22px) à gauche ; nav
    horizontale au centre + loupe de recherche ; CTA pilule terracotta à droite
  - Onglet de nav actif : SOULIGNÉ terracotta #c4502e (l'accent Sonder)
  - Barre latérale gauche : item actif accent terracotta à gauche + fond tinté
    crème plus profond, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande quasi noire #1a1a1a, liens crème + ligne d'accent terracotta +
    wordmark « sonder » en knockout crème
  - Couleurs Sonder : crème chaud #f7f3ea (surface header — signature), quasi noir
    #1a1a1a (texte / nav / actif), terracotta #c4502e (accent / action / lien),
    gris chaud #5a5550 (secondaire), crème plus profond #efe7da (hover), hairline
    chaude #e6e0d6 ; radius doux (md 6px hospitalité, pilules 999px)
  - Wordmark officiel « sonder » référencé via <img src="/chrome/sonder/logo.svg">
  - On ne charge AUCUNE police propriétaire ; fallback grotesk système + serif.
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

<div class="son-shell">
  <!-- ── HEADER SONDER ── -->
  <div class="son-header-wrap">
    <header class="son-header" aria-label="Sonder">
      <div class="son-header__inner">
        <!-- Gauche : wordmark « sonder » (bas-de-casse, quasi noir) -->
        <div class="son-header__brand">
          <a href="/" class="son-header__brand-link" aria-label="Accueil : Sonder Design System">
            <img
              src="/chrome/sonder/logo.svg"
              alt="Sonder"
              class="son-logo"
              width="96"
              height="22"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="son-nav" aria-label="Navigation principale">
          <ul class="son-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="son-nav__item">
                <a
                  class="son-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Sonder : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="son-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA pilule -->
        <div class="son-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="son-header__tools-links">
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
          class="son-header__burger"
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

  <!-- ── BODY SONDER ── -->
  <div class="son-body">
    <!-- Sidebar -->
    <aside class="son-sidebar" aria-label="Navigation de la documentation">
      <nav class="son-side-nav" aria-label="Sommaire">
        <ul class="son-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="son-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="son-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="son-side-group" open={isGroupOpen(group.items)}>
                <summary class="son-side-group__summary">
                  <ChevronDown class="son-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="son-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="son-side-link son-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="son-side-divider" role="separator"></li>

          <li>
            <a
              class="son-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="son-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="son-side-group__summary">
                  <ChevronDown class="son-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="son-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="son-side-link son-side-link--sub"
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
              </details>
            </li>
          {/each}
        </ul>
      </nav>

      <!-- Pied de barre latérale : version + GitHub. -->
      <div class="son-sidebar-footer">
        <span class="son-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="son-sidebar-github"
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
    <div class="son-content">
      <nav class="son-breadcrumb" aria-label="Breadcrumb">
        <ol class="son-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="son-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="son-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER SONDER ── -->
  <footer class="son-footer" aria-label="Pied de page Sonder">
    <div class="son-footer__inner">
      <nav class="son-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="son-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/sonder/logo.svg"
        alt="Sonder"
        class="son-footer__logo"
        width="96"
        height="22"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Sonder (warm minimal hospitality) ── */
  .son-shell {
    --son-cream: #f7f3ea; /* crème chaud : surface header — signature Sonder */
    --son-cream-deep: #efe7da; /* crème plus profond : hover / fond tinté */
    --son-terracotta: #c4502e; /* terracotta : accent / action / lien */
    --son-terracotta-hover: #a8401f; /* terracotta assombri : hover CTA */
    --son-ink: #1a1a1a; /* quasi noir : texte primaire / nav / actif */
    --son-ink-inverse: #1a1a1a; /* surface inverse (ton footer sombre) */
    --son-grey: #5a5550; /* gris chaud secondaire */
    --son-grey-muted: #8c857d; /* gris chaud clair */
    --son-subtle: #efe7da; /* surface subtile / hover doux (crème profond) */
    --son-subtle-2: #e6ddcf; /* hover secondaire */
    --son-border: #e6e0d6; /* hairline chaude */
    --son-white: #fff;
    --son-sidebar-width: 17rem;
    --son-radius: 6px; /* contrôles arrondis doux (hospitalité) */
    --son-radius-pill: 999px; /* pilules / CTA */
    /* Typo Sonder : grotesk minimal ; aucune police propriétaire chargée. */
    --son-font-body: 'Inter', helvetica, arial, sans-serif;
    --son-font-display: Georgia, 'Times New Roman', serif;
    font-family: var(--son-font-body);
    background: var(--son-white);
    color: var(--son-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Sonder ── */
  .son-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .son-header {
    background: var(--son-cream);
    border-bottom: 1px solid var(--son-border);
  }

  .son-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .son-header__brand {
    flex: 0 0 auto;
  }

  .son-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .son-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Wordmark « sonder » (bas-de-casse quasi noir, ratio préservé, ~22px). */
  .son-logo {
    display: block;
    width: auto;
    height: 22px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .son-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .son-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré doux, hover crème/terracotta. */
  .son-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--son-radius);
    color: var(--son-ink);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .son-search-btn:hover,
  .son-search-btn:focus-visible {
    background: var(--son-cream-deep);
    border-color: var(--son-terracotta);
    color: var(--son-terracotta);
    outline: none;
  }

  .son-nav__item {
    flex: 0 0 auto;
  }

  .son-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--son-ink);
    display: inline-flex;
    font-family: var(--son-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .son-nav__link:hover,
  .son-nav__link:focus-visible {
    color: var(--son-terracotta);
    outline: none;
  }

  /* Onglet actif : souligné terracotta (l'accent Sonder). */
  .son-nav__link[aria-current="page"] {
    border-bottom-color: var(--son-terracotta);
    color: var(--son-ink);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .son-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .son-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .son-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .son-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--son-border);
  }

  /* Overrides switchers dans header Sonder (champs crème, bord hairline 1px). */
  .son-header__tools-links :global(.docs-header-control) {
    background: var(--son-white);
    border-color: var(--son-border);
    border-radius: var(--son-radius);
    color: var(--son-ink);
    font-family: inherit;
  }

  .son-header__tools-links :global(.docs-header-control:hover),
  .son-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--son-cream-deep);
    border-color: var(--son-terracotta);
    color: var(--son-terracotta);
    box-shadow: none;
  }

  /* CTA pilule terracotta (signature warm minimal Sonder). */
  .son-cta {
    align-items: center;
    background: var(--son-terracotta);
    border: 1px solid var(--son-terracotta);
    border-radius: var(--son-radius-pill);
    color: var(--son-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--son-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .son-cta:hover,
  .son-cta:focus-visible {
    background: var(--son-terracotta-hover);
    border-color: var(--son-terracotta-hover);
    color: var(--son-white);
    outline: none;
  }

  /* Burger mobile */
  .son-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--son-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Sonder ── */
  .son-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--son-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Sonder ── */
  .son-sidebar {
    background: var(--son-white);
    border-right: 1px solid var(--son-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .son-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .son-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--son-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .son-version-badge {
    background: var(--son-cream);
    border: 1px solid var(--son-border);
    border-radius: var(--son-radius);
    color: var(--son-terracotta);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .son-sidebar-github {
    align-items: center;
    color: var(--son-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .son-sidebar-github:hover,
  .son-sidebar-github:focus-visible {
    color: var(--son-terracotta);
  }

  .son-side-list,
  .son-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .son-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--son-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .son-side-link:hover,
  .son-side-link:focus-visible {
    background: var(--son-cream-deep);
    color: var(--son-terracotta);
    text-decoration: none;
  }

  .son-side-link[aria-current="page"] {
    background: var(--son-cream-deep);
    border-left-color: var(--son-terracotta);
    color: var(--son-terracotta);
    font-weight: 700;
    text-decoration: none;
  }

  .son-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .son-side-divider {
    border-top: 1px solid var(--son-border);
    margin: 0.5rem 0;
  }

  .son-side-group {
    display: block;
  }

  .son-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--son-grey);
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

  .son-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .son-side-group__summary:hover,
  .son-side-group__summary:focus-visible {
    background: var(--son-cream-deep);
    outline: none;
  }

  .son-side-group :global(.son-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .son-side-group:not([open]) :global(.son-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .son-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .son-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .son-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .son-breadcrumb__item {
    align-items: center;
    color: var(--son-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .son-breadcrumb__item + .son-breadcrumb__item::before {
    color: var(--son-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .son-breadcrumb__link {
    color: var(--son-ink);
    text-decoration: none;
  }

  .son-breadcrumb__link:hover {
    color: var(--son-terracotta);
    text-decoration: underline;
  }

  .son-breadcrumb__item span[aria-current="page"] {
    color: var(--son-ink);
    font-weight: 600;
  }

  /* ── Footer Sonder (bande quasi noire, knockout crème) ── */
  .son-footer {
    background: var(--son-ink-inverse);
    border-top: 3px solid var(--son-terracotta);
    margin-top: auto;
  }

  .son-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .son-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .son-footer__link {
    color: var(--son-cream);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .son-footer__link:hover {
    color: var(--son-terracotta);
    text-decoration: underline;
  }

  /* Wordmark footer : knockout crème sur fond sombre. */
  .son-footer__logo {
    display: block;
    width: auto;
    height: 22px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .son-body {
      grid-template-columns: 1fr;
    }

    .son-sidebar {
      display: none;
    }

    .son-nav {
      display: none;
    }

    .son-header__tools {
      display: none;
    }

    .son-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .son-nav__link,
    .son-cta,
    .son-search-btn,
    .son-side-link,
    .son-side-group :global(.son-side-group__icon) {
      transition: none;
    }
  }
</style>

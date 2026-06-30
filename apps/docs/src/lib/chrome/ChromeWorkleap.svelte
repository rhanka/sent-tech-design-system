<!--
  Chrome documentaire Workleap (workleap.com — le SaaS employee-experience montréalais).
  Forme fidèle à l'en-tête réel de workleap.com :
  - Header : bandeau CRÈME/BLANC, wordmark officiel Workleap (encre near-black) à gauche,
    nav horizontale, loupe de recherche compacte, CTA BLEU ÉLECTRIQUE (radius 8px) à droite
  - Onglet de nav actif : SOULIGNÉ bleu électrique (barre indicatrice basse)
  - Barre latérale gauche : item actif accent bleu à gauche + fond bleu tinté,
    sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande crème avec liens + wordmark Workleap
  - Couleurs mesurées (theme-workleap) : bleu électrique #2545FF (primaire),
    bleu hover #1a36cc, navy profond #0C1754 (inverse), encre #171417,
    crème #F9F8F6 (surface subtile), bord #c8c8c8, secondaire #5d6c7b, muted #758696
  - Wordmark officiel Workleap (vecteur capturé sur le navbar workleap.com,
    fill encre #171417) référencé via <img src="/chrome/workleap/logo.svg">
  - Typo : 'Inter' (corps + titres), chargée via Google Fonts dans <svelte:head>
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

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
  />
</svelte:head>

<div class="wl-shell">
  <!-- ── HEADER WORKLEAP ── -->
  <div class="wl-header-wrap">
    <header class="wl-header" aria-label="Workleap">
      <div class="wl-header__inner">
        <!-- Gauche : wordmark officiel Workleap -->
        <div class="wl-header__brand">
          <a href="/" class="wl-header__brand-link" aria-label="Accueil : Workleap Design System">
            <img
              src="/chrome/workleap/logo.svg"
              alt="Workleap"
              class="wl-logo"
              width="124"
              height="33"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="wl-nav" aria-label="Navigation principale">
          <ul class="wl-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="wl-nav__item">
                <a
                  class="wl-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Workleap : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="wl-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA bleu -->
        <div class="wl-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="wl-header__tools-links">
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
          class="wl-header__burger"
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

  <!-- ── BODY WORKLEAP ── -->
  <div class="wl-body">
    <!-- Sidebar -->
    <aside class="wl-sidebar" aria-label="Navigation de la documentation">
      <nav class="wl-side-nav" aria-label="Sommaire">
        <ul class="wl-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="wl-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="wl-side-divider" role="separator"></li>

          <li class="wl-side-heading">
            <a
              class="wl-side-link wl-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="wl-side-group" open={isGroupOpen(group.items)}>
                <summary class="wl-side-group__summary">
                  <ChevronDown class="wl-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="wl-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="wl-side-link wl-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="wl-side-divider" role="separator"></li>

          <li class="wl-side-heading">
            <a
              class="wl-side-link wl-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="wl-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="wl-side-group__summary">
                  <ChevronDown class="wl-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="wl-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="wl-side-link wl-side-link--sub"
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
      <div class="wl-sidebar-footer">
        <span class="wl-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="wl-sidebar-github"
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
    <div class="wl-content">
      <nav class="wl-breadcrumb" aria-label="Breadcrumb">
        <ol class="wl-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="wl-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="wl-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER WORKLEAP ── -->
  <footer class="wl-footer" aria-label="Pied de page Workleap">
    <div class="wl-footer__inner">
      <nav class="wl-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="wl-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/workleap/logo.svg"
        alt="Workleap"
        class="wl-footer__logo"
        width="124"
        height="33"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Workleap (mesurées sur theme-workleap) ── */
  .wl-shell {
    --wl-blue: #2545ff; /* bleu électrique primaire (CTA / lien / accent) */
    --wl-blue-hover: #1a36cc; /* bleu hover/active */
    --wl-blue-tint: #eaeeff; /* tint bleu (surfaces actives) */
    --wl-navy: #0c1754; /* navy profond / inverse */
    --wl-ink: #171417; /* encre near-black (texte primaire) */
    --wl-secondary: #5d6c7b; /* texte secondaire / bord fort */
    --wl-muted: #758696; /* texte muted */
    --wl-cream: #f9f8f6; /* crème (surface subtile) */
    --wl-grey-100: #ececec; /* gris faible (hover secondaire) */
    --wl-border: #c8c8c8; /* bord / divider */
    --wl-white: #fff;
    --wl-sidebar-width: 17rem;
    --wl-radius: 8px; /* contrôles / inputs / CTA */
    --wl-radius-sm: 4px; /* petites puces */
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--wl-white);
    color: var(--wl-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Workleap ── */
  .wl-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .wl-header {
    background: var(--wl-cream);
    border-bottom: 1px solid var(--wl-border);
  }

  .wl-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .wl-header__brand {
    flex: 0 0 auto;
  }

  .wl-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .wl-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Wordmark officiel Workleap (ratio préservé, hauteur ~28px comme l'en-tête réel). */
  .wl-logo {
    display: block;
    width: auto;
    height: 28px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .wl-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .wl-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré 8px, hover crème/bleu. */
  .wl-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--wl-radius);
    color: var(--wl-ink);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .wl-search-btn:hover,
  .wl-search-btn:focus-visible {
    background: var(--wl-blue-tint);
    border-color: var(--wl-blue);
    color: var(--wl-blue);
    outline: none;
  }

  .wl-nav__item {
    flex: 0 0 auto;
  }

  .wl-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--wl-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .wl-nav__link:hover,
  .wl-nav__link:focus-visible {
    color: var(--wl-blue);
    outline: none;
  }

  .wl-nav__link[aria-current="page"] {
    border-bottom-color: var(--wl-blue);
    color: var(--wl-blue);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .wl-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .wl-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Workleap (champs blancs, bord gris 1px, radius 8px). */
  .wl-header__tools-links :global(.docs-header-control) {
    background: var(--wl-white);
    border-color: var(--wl-border);
    border-radius: var(--wl-radius);
    color: var(--wl-ink);
    font-family: inherit;
  }

  .wl-header__tools-links :global(.docs-header-control:hover),
  .wl-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--wl-blue-tint);
    border-color: var(--wl-blue);
    color: var(--wl-blue);
    box-shadow: none;
  }

  /* CTA bleu électrique (radius 8px) : signature Workleap. */
  .wl-cta {
    align-items: center;
    background: var(--wl-blue);
    border: 1px solid var(--wl-blue);
    border-radius: var(--wl-radius);
    color: var(--wl-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.875rem;
    font-weight: 600;
    height: 2.5rem;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .wl-cta:hover,
  .wl-cta:focus-visible {
    background: var(--wl-blue-hover);
    border-color: var(--wl-blue-hover);
    color: var(--wl-white);
    outline: none;
  }

  /* Burger mobile */
  .wl-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--wl-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Workleap ── */
  .wl-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--wl-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Workleap ── */
  .wl-sidebar {
    background: var(--wl-white);
    border-right: 1px solid var(--wl-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .wl-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .wl-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--wl-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .wl-version-badge {
    background: var(--wl-blue-tint);
    border: 1px solid var(--wl-border);
    border-radius: var(--wl-radius-sm);
    color: var(--wl-blue);
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .wl-sidebar-github {
    align-items: center;
    color: var(--wl-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .wl-sidebar-github:hover,
  .wl-sidebar-github:focus-visible {
    color: var(--wl-blue);
  }

  .wl-side-list,
  .wl-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .wl-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--wl-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .wl-side-link:hover,
  .wl-side-link:focus-visible {
    background: var(--wl-cream);
    color: var(--wl-blue);
    text-decoration: none;
  }

  .wl-side-link[aria-current="page"] {
    background: var(--wl-blue-tint);
    border-left-color: var(--wl-blue);
    color: var(--wl-navy);
    font-weight: 600;
    text-decoration: none;
  }

  .wl-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .wl-side-divider {
    border-top: 1px solid var(--wl-border);
    margin: 0.5rem 0;
  }

  .wl-side-group {
    display: block;
  }

  .wl-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--wl-muted);
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

  .wl-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .wl-side-group__summary:hover,
  .wl-side-group__summary:focus-visible {
    background: var(--wl-cream);
    outline: none;
  }

  .wl-side-group :global(.wl-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .wl-side-group:not([open]) :global(.wl-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .wl-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .wl-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .wl-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .wl-breadcrumb__item {
    align-items: center;
    color: var(--wl-muted);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .wl-breadcrumb__item + .wl-breadcrumb__item::before {
    color: var(--wl-muted);
    content: "›";
    margin: 0 0.4rem;
  }

  .wl-breadcrumb__link {
    color: var(--wl-blue);
    text-decoration: none;
  }

  .wl-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .wl-breadcrumb__item span[aria-current="page"] {
    color: var(--wl-ink);
    font-weight: 600;
  }

  /* ── Footer Workleap ── */
  .wl-footer {
    background: var(--wl-cream);
    border-top: 1px solid var(--wl-border);
    margin-top: auto;
  }

  .wl-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .wl-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .wl-footer__link {
    color: var(--wl-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .wl-footer__link:hover {
    color: var(--wl-blue);
    text-decoration: underline;
  }

  .wl-footer__logo {
    display: block;
    width: auto;
    height: 26px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .wl-body {
      grid-template-columns: 1fr;
    }

    .wl-sidebar {
      display: none;
    }

    .wl-nav {
      display: none;
    }

    .wl-header__tools {
      display: none;
    }

    .wl-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .wl-nav__link,
    .wl-cta,
    .wl-search-btn,
    .wl-side-link,
    .wl-side-group :global(.wl-side-group__icon) {
      transition: none;
    }
  }
</style>

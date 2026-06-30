<!--
  Chrome documentaire Mistral AI (mistral.ai + chat.mistral.ai « Le Chat »).
  Forme fidèle à l'en-tête du rebrand 2025 (Sylvain Boyer Studio) : la scène
  crème « golden hour », l'encre quasi-noire, les coins NETS (radius 0) et la
  flamme « Mistral Block Gradient » en logo.
  - Header : bandeau WARM IVORY #fffaeb, logo OFFICIEL flamme (bandes
    jaune→ambre→orange→flamme→rouge) + wordmark « Mistral AI » à gauche, nav
    sobre au centre (poids 400, sans capitales — la taille porte la hiérarchie),
    bouton recherche flamme-orange à droite
  - Coins CARRÉS (radius 0) — signature Mistral ; onglet actif = SOULIGNÉ
    flamme-orange ; item latéral actif = liseré flamme + fond crème
  - Couleurs MESURÉES / documentées sur mistral.ai (voir theme-mistral/src) :
    warm ivory #fffaeb, crème #fff0c2, blanc #ffffff, encre #1f1f1f,
    teinte #3d3d3d, muted #6b6b6b, bordure #e4e4e7, Mistral Orange #fa520f,
    flamme #fb6424, block-orange #ff8105, ambre #ffa110, jaune #ffd900,
    block-gold #ffe295, rouge Mistral #e10500 ; focus = anneau flamme #fa520f
  - Logo OFFICIEL Mistral (flamme vectorielle, bandes de couleur) via
    <img src="/chrome/mistral/logo.svg">
  - Typo : familles Mistral indisponibles → repli 'Inter'/Arial système, poids
    400, aucune capitale ni interlettrage (aucune police réseau chargée)
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

<div class="mistral-shell">
  <!-- ── HEADER Mistral ── -->
  <div class="mistral-header-wrap">
    <header class="mistral-header" aria-label="Mistral AI">
      <div class="mistral-header__inner">
        <!-- Gauche : logo officiel flamme + wordmark -->
        <div class="mistral-header__brand">
          <a href="/" class="mistral-header__brand-link" aria-label="Accueil : Mistral AI Design System">
            <img
              src="/chrome/mistral/logo.svg"
              alt=""
              class="mistral-logo"
              width="29"
              height="26"
              aria-hidden="true"
            />
            <span class="mistral-wordmark">Mistral AI</span>
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="mistral-nav" aria-label="Navigation principale">
          <ul class="mistral-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="mistral-nav__item">
                <a
                  class="mistral-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </nav>

        <!-- Droite : outils + recherche -->
        <div class="mistral-header__tools">
          <button
            type="button"
            class="mistral-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="mistral-header__tools-links">
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
          class="mistral-header__burger"
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

  <!-- ── BODY Mistral ── -->
  <div class="mistral-body">
    <!-- Sidebar -->
    <aside class="mistral-sidebar" aria-label="Navigation de la documentation">
      <nav class="mistral-side-nav" aria-label="Sommaire">
        <ul class="mistral-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="mistral-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="mistral-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="mistral-side-group" open={isGroupOpen(group.items)}>
                <summary class="mistral-side-group__summary">
                  <ChevronDown class="mistral-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="mistral-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="mistral-side-link mistral-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="mistral-side-divider" role="separator"></li>

          <li>
            <a
              class="mistral-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="mistral-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="mistral-side-group__summary">
                  <ChevronDown class="mistral-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="mistral-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="mistral-side-link mistral-side-link--sub"
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
      <div class="mistral-sidebar-footer">
        <span class="mistral-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="mistral-sidebar-github"
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
    <div class="mistral-content">
      <nav class="mistral-breadcrumb" aria-label="Breadcrumb">
        <ol class="mistral-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="mistral-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="mistral-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Mistral ── -->
  <footer class="mistral-footer" aria-label="Pied de page Mistral AI">
    <div class="mistral-footer__inner">
      <nav class="mistral-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="mistral-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <div class="mistral-footer__brand">
        <img
          src="/chrome/mistral/logo.svg"
          alt=""
          class="mistral-footer__logo"
          width="26"
          height="24"
          aria-hidden="true"
        />
        <span class="mistral-footer__wordmark">Mistral AI</span>
      </div>
    </div>
  </footer>
</div>

<style>
  /* ── Variables Mistral ── */
  .mistral-shell {
    --mistral-primary: #fa520f; /* Mistral Orange — action / accent */
    --mistral-primary-hover: #e1450a; /* orange foncé interactif */
    --mistral-primary-light: #fff0c2; /* crème (item actif sidebar) */
    --mistral-ink: #1f1f1f; /* Mistral Black — encre / titres */
    --mistral-ink-2: #3d3d3d; /* teinte de noir — texte fort */
    --mistral-secondary: #6b6b6b; /* muted — texte secondaire */
    --mistral-flame: #fb6424; /* flamme */
    --mistral-amber: #ff8105; /* block-orange / ambre */
    --mistral-yellow: #ffd900; /* jaune vif (haut de la flamme) */
    --mistral-gold: #ffe295; /* block-gold (teinte claire flamme) */
    --mistral-flame-dark: #c2410c; /* flamme assombrie (badge version) */
    --mistral-warm: #fffaeb; /* warm ivory — scène crème */
    --mistral-subtle: #fff0c2; /* crème — surface subtile */
    --mistral-border: #ece1c9; /* hairline crème chaude (dérivée scène ivoire) */
    --mistral-border-strong: #dccfa8; /* bordure crème renforcée */
    --mistral-field-border: #e4e4e7; /* bordure de contrôle mesurée */
    --mistral-focus: #fa520f; /* anneau focus flamme */
    --mistral-white: #fff;
    --mistral-sidebar-width: 17rem;
    --mistral-radius: 0; /* signature Mistral : coins nets */
    font-family: 'Inter', Arial, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--mistral-warm);
    color: var(--mistral-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Mistral ── */
  .mistral-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .mistral-header {
    background: var(--mistral-warm);
    border-bottom: 1px solid var(--mistral-border);
  }

  .mistral-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .mistral-header__brand {
    flex: 0 0 auto;
  }

  .mistral-header__brand-link {
    align-items: center;
    display: inline-flex;
    gap: 0.6rem;
    text-decoration: none;
    transition: opacity 200ms ease;
  }

  .mistral-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Mistral (flamme, ratio préservé). */
  .mistral-logo {
    display: block;
    width: auto;
    height: 26px;
  }

  .mistral-wordmark {
    color: var(--mistral-ink);
    font-size: 1.15rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1;
    white-space: nowrap;
  }

  /* ── Nav horizontale (centre) ── */
  .mistral-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .mistral-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .mistral-nav__item {
    flex: 0 0 auto;
  }

  /* Mistral : poids 400, casse normale, aucun interlettrage — la taille
     porte la hiérarchie (signature de marque). */
  .mistral-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--mistral-ink-2);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 400;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 200ms ease, color 200ms ease;
    white-space: nowrap;
  }

  .mistral-nav__link:hover,
  .mistral-nav__link:focus-visible {
    color: var(--mistral-ink);
    outline: none;
  }

  .mistral-nav__link[aria-current="page"] {
    border-bottom-color: var(--mistral-primary);
    color: var(--mistral-ink);
    font-weight: 500;
  }

  /* ── Outils droite ── */
  .mistral-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .mistral-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Mistral. */
  .mistral-header__tools-links :global(.docs-header-control) {
    background: var(--mistral-white);
    border-color: var(--mistral-field-border);
    border-radius: var(--mistral-radius);
    color: var(--mistral-ink);
    font-family: inherit;
  }

  .mistral-header__tools-links :global(.docs-header-control:hover),
  .mistral-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--mistral-subtle);
    border-color: var(--mistral-primary);
    color: var(--mistral-ink);
    box-shadow: none;
  }

  /* Recherche Mistral : bouton loupe flamme-orange (action primaire). */
  .mistral-search__btn {
    align-items: center;
    background: var(--mistral-primary);
    border: 1px solid var(--mistral-primary);
    border-radius: var(--mistral-radius);
    color: var(--mistral-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 200ms ease, border-color 200ms ease;
  }

  .mistral-search__btn:hover,
  .mistral-search__btn:focus-visible {
    background: var(--mistral-primary-hover);
    border-color: var(--mistral-primary-hover);
    outline: 2px solid var(--mistral-focus);
    outline-offset: 2px;
  }

  /* Burger mobile */
  .mistral-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--mistral-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Mistral ── */
  .mistral-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--mistral-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Mistral ── */
  .mistral-sidebar {
    background: var(--mistral-warm);
    border-right: 1px solid var(--mistral-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .mistral-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .mistral-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--mistral-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .mistral-version-badge {
    background: var(--mistral-subtle);
    border: 1px solid var(--mistral-border-strong);
    border-radius: var(--mistral-radius);
    color: var(--mistral-flame-dark);
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .mistral-sidebar-github {
    align-items: center;
    color: var(--mistral-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 200ms ease;
  }

  .mistral-sidebar-github:hover,
  .mistral-sidebar-github:focus-visible {
    color: var(--mistral-primary);
  }

  .mistral-side-list,
  .mistral-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .mistral-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--mistral-ink-2);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 200ms ease, border-color 200ms ease, color 200ms ease;
  }

  .mistral-side-link:hover,
  .mistral-side-link:focus-visible {
    background: var(--mistral-subtle);
    color: var(--mistral-ink);
    text-decoration: none;
  }

  .mistral-side-link[aria-current="page"] {
    background: var(--mistral-primary-light);
    border-left-color: var(--mistral-primary);
    color: var(--mistral-ink);
    font-weight: 600;
    text-decoration: none;
  }

  .mistral-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .mistral-side-divider {
    border-top: 1px solid var(--mistral-border);
    margin: 0.5rem 0;
  }

  .mistral-side-group {
    display: block;
  }

  /* Mistral : libellés de section en casse normale, mutés (pas de capitales). */
  .mistral-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--mistral-secondary);
    cursor: pointer;
    display: flex;
    font-size: 0.78rem;
    font-weight: 600;
    gap: 0.35rem;
    letter-spacing: 0;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 1rem 0 calc(1rem - 3px);
    transition: background 200ms ease;
  }

  .mistral-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .mistral-side-group__summary:hover,
  .mistral-side-group__summary:focus-visible {
    background: var(--mistral-subtle);
    outline: none;
  }

  .mistral-side-group :global(.mistral-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 200ms ease;
  }

  .mistral-side-group:not([open]) :global(.mistral-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .mistral-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .mistral-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .mistral-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .mistral-breadcrumb__item {
    align-items: center;
    color: var(--mistral-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .mistral-breadcrumb__item + .mistral-breadcrumb__item::before {
    color: var(--mistral-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .mistral-breadcrumb__link {
    color: var(--mistral-primary);
    text-decoration: none;
  }

  .mistral-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .mistral-breadcrumb__item span[aria-current="page"] {
    color: var(--mistral-ink);
    font-weight: 600;
  }

  /* ── Footer Mistral ── */
  .mistral-footer {
    background: var(--mistral-subtle);
    border-top: 1px solid var(--mistral-border);
    margin-top: auto;
  }

  .mistral-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .mistral-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .mistral-footer__link {
    color: var(--mistral-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .mistral-footer__link:hover {
    color: var(--mistral-primary);
    text-decoration: underline;
  }

  .mistral-footer__brand {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    gap: 0.5rem;
  }

  .mistral-footer__logo {
    display: block;
    width: auto;
    height: 24px;
  }

  .mistral-footer__wordmark {
    color: var(--mistral-ink);
    font-size: 1rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1;
    white-space: nowrap;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .mistral-body {
      grid-template-columns: 1fr;
    }

    .mistral-sidebar {
      display: none;
    }

    .mistral-nav {
      display: none;
    }

    .mistral-header__tools {
      display: none;
    }

    .mistral-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .mistral-nav__link,
    .mistral-search__btn,
    .mistral-side-link,
    .mistral-side-group :global(.mistral-side-group__icon) {
      transition: none;
    }
  }
</style>

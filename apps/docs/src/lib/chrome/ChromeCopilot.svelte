<!--
  Chrome documentaire Microsoft Copilot (copilot.microsoft.com).
  Forme fidèle à l'en-tête produit Copilot, bâti sur Fluent 2 : clair, net,
  doucement arrondi, signé par le dégradé spectral de la marque.
  - Header : bandeau BLANC #ffffff (Fluent NeutralBackground1) coiffé d'un mince
    filet DÉGRADÉ signature Copilot (teal #199fd7 → violet #8a50d8 → rose #ee5091),
    lockup OFFICIEL à gauche (mark Copilot multicolore + wordmark « Copilot » en
    Segoe UI Variable encre), nav sobre en casse normale au centre, recherche
    bleu Fluent à droite
  - Coins DOUX (radius 4px — borderRadiusMedium Fluent) sur les contrôles ;
    onglet actif = SOULIGNÉ bleu Fluent (#0f6cbd)
  - Barre latérale : item actif liseré bleu Fluent + fond bleu très clair (#ebf3fc)
  - Couleurs MESURÉES (Fluent 2 / @fluentui/tokens) : blanc #ffffff, surfaces
    #fafafa/#f5f5f5, bordures #e0e0e0 (NeutralStroke2) / #d1d1d1 (NeutralStroke1),
    encre #242424 (NeutralForeground1), texte secondaire #424242, muted #616161,
    bleu marque #0f6cbd (brandWeb 80), bleu interactif #115ea3, dégradé signature
    teal #199fd7 / violet #8a50d8 / rose #ee5091
  - Logo OFFICIEL (vecteur) via <img src="/chrome/copilot/logo.svg"> — mark
    Copilot multicolore (asset de marque, source svgl.app id 140 « Microsoft Copilot »)
  - Typo : familles Microsoft propriétaires (Segoe UI Variable) indisponibles en
    réseau → on ne référence que leurs NOMS + repli système (aucune police chargée)
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

<div class="copilot-shell">
  <!-- ── HEADER COPILOT ── -->
  <div class="copilot-header-wrap">
    <!-- Filet dégradé signature Copilot (teal → violet → rose). -->
    <div class="copilot-accent" aria-hidden="true"></div>
    <header class="copilot-header" aria-label="Microsoft Copilot">
      <div class="copilot-header__inner">
        <!-- Gauche : lockup officiel mark Copilot + wordmark -->
        <div class="copilot-header__brand">
          <a href="/" class="copilot-header__brand-link" aria-label="Accueil : Microsoft Copilot Design System">
            <img
              src="/chrome/copilot/logo.svg"
              alt="Microsoft Copilot"
              class="copilot-logo"
              width="28"
              height="28"
            />
            <span class="copilot-wordmark">Copilot</span>
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="copilot-nav" aria-label="Navigation principale">
          <ul class="copilot-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="copilot-nav__item">
                <a
                  class="copilot-nav__link"
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
        <div class="copilot-header__tools">
          <button
            type="button"
            class="copilot-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="copilot-header__tools-links">
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
          class="copilot-header__burger"
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

  <!-- ── BODY COPILOT ── -->
  <div class="copilot-body">
    <!-- Sidebar -->
    <aside class="copilot-sidebar" aria-label="Navigation de la documentation">
      <nav class="copilot-side-nav" aria-label="Sommaire">
        <ul class="copilot-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="copilot-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="copilot-side-divider" role="separator"></li>

          <li class="copilot-side-heading">
            <a
              class="copilot-side-link copilot-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="copilot-side-group" open={isGroupOpen(group.items)}>
                <summary class="copilot-side-group__summary">
                  <ChevronDown class="copilot-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="copilot-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="copilot-side-link copilot-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="copilot-side-divider" role="separator"></li>

          <li class="copilot-side-heading">
            <a
              class="copilot-side-link copilot-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="copilot-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="copilot-side-group__summary">
                  <ChevronDown class="copilot-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="copilot-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="copilot-side-link copilot-side-link--sub"
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
      <div class="copilot-sidebar-footer">
        <span class="copilot-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="copilot-sidebar-github"
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
    <div class="copilot-content">
      <nav class="copilot-breadcrumb" aria-label="Breadcrumb">
        <ol class="copilot-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="copilot-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="copilot-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER COPILOT ── -->
  <footer class="copilot-footer" aria-label="Pied de page Microsoft Copilot">
    <div class="copilot-footer__inner">
      <nav class="copilot-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="copilot-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <div class="copilot-footer__brand">
        <img
          src="/chrome/copilot/logo.svg"
          alt="Microsoft Copilot"
          class="copilot-footer__logo"
          width="22"
          height="22"
        />
        <span class="copilot-footer__wordmark">Copilot</span>
      </div>
    </div>
  </footer>
</div>

<style>
  /* ── Variables Copilot (Fluent 2) ── */
  .copilot-shell {
    --copilot-brand: #0f6cbd; /* brandWeb[80] — colorBrandBackground (primary) */
    --copilot-brand-hover: #115ea3; /* brandWeb[70] — BrandBackgroundHover / link */
    --copilot-brand-pressed: #0c3b5e; /* brandWeb[40] — BrandBackgroundPressed */
    --copilot-brand-light: #cfe4fa; /* brandWeb[150] — light brand tint */
    --copilot-brand-lighter: #ebf3fc; /* brandWeb[160] — selected fill (sidebar actif) */
    --copilot-ink: #242424; /* NeutralForeground1 — texte primaire */
    --copilot-ink-2: #424242; /* NeutralForeground2 */
    --copilot-secondary: #616161; /* NeutralForeground3 — texte secondaire */
    --copilot-muted: #707070; /* NeutralForeground4 */
    --copilot-surface: #ffffff; /* NeutralBackground1 — blanc */
    --copilot-surface-2: #fafafa; /* NeutralBackground2 */
    --copilot-surface-3: #f5f5f5; /* NeutralBackground3 / hover fill */
    --copilot-border: #e0e0e0; /* NeutralStroke2 — bordure douce */
    --copilot-border-strong: #d1d1d1; /* NeutralStroke1 — bordure par défaut */
    --copilot-focus: #0f6cbd; /* anneau focus marque (visible) */
    /* Dégradé spectral signature Copilot. */
    --copilot-grad: linear-gradient(90deg, #199fd7 0%, #8a50d8 52%, #ee5091 100%);
    --copilot-sidebar-width: 17rem;
    --copilot-radius: 0.25rem; /* borderRadiusMedium (4px) */
    --copilot-radius-lg: 0.5rem; /* borderRadiusXLarge (8px) */
    font-family: 'Segoe UI Variable', 'Segoe UI Variable Text', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
    background: var(--copilot-surface);
    color: var(--copilot-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Copilot ── */
  .copilot-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  /* Filet dégradé signature en coiffe du header. */
  .copilot-accent {
    height: 3px;
    background: var(--copilot-grad);
  }

  .copilot-header {
    background: var(--copilot-surface);
    border-bottom: 1px solid var(--copilot-border);
  }

  .copilot-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4rem;
    padding: 0.625rem 1.5rem;
  }

  .copilot-header__brand {
    flex: 0 0 auto;
  }

  .copilot-header__brand-link {
    align-items: center;
    display: inline-flex;
    gap: 0.5rem;
    text-decoration: none;
    transition: opacity 200ms ease;
  }

  .copilot-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Mark officiel Copilot (ratio préservé). */
  .copilot-logo {
    display: block;
    width: 28px;
    height: 28px;
  }

  .copilot-wordmark {
    color: var(--copilot-ink);
    font-size: 1.125rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1;
  }

  /* ── Nav horizontale (centre) ── */
  .copilot-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .copilot-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .copilot-nav__item {
    flex: 0 0 auto;
  }

  .copilot-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--copilot-ink-2);
    display: inline-flex;
    font-size: 0.875rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.75rem;
    text-decoration: none;
    transition: border-color 200ms ease, color 200ms ease;
    white-space: nowrap;
  }

  .copilot-nav__link:hover,
  .copilot-nav__link:focus-visible {
    color: var(--copilot-brand);
    outline: none;
  }

  .copilot-nav__link[aria-current="page"] {
    border-bottom-color: var(--copilot-brand);
    color: var(--copilot-ink);
    font-weight: 600;
  }

  /* ── Outils droite ── */
  .copilot-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .copilot-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Copilot. */
  .copilot-header__tools-links :global(.docs-header-control) {
    background: var(--copilot-surface);
    border-color: var(--copilot-border-strong);
    border-radius: var(--copilot-radius);
    color: var(--copilot-ink);
    font-family: inherit;
  }

  .copilot-header__tools-links :global(.docs-header-control:hover),
  .copilot-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--copilot-brand-lighter);
    border-color: var(--copilot-brand);
    color: var(--copilot-brand);
    box-shadow: none;
  }

  /* Recherche Copilot : bouton loupe bleu Fluent arrondi. */
  .copilot-search__btn {
    align-items: center;
    background: var(--copilot-brand);
    border: 1px solid var(--copilot-brand);
    border-radius: var(--copilot-radius);
    color: var(--copilot-surface);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.25rem;
    height: 2.25rem;
    justify-content: center;
    padding: 0;
    transition: background 200ms ease, border-color 200ms ease;
  }

  .copilot-search__btn:hover {
    background: var(--copilot-brand-hover);
    border-color: var(--copilot-brand-hover);
  }

  .copilot-search__btn:focus-visible {
    outline: 2px solid var(--copilot-focus);
    outline-offset: 2px;
  }

  /* Burger mobile */
  .copilot-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--copilot-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Copilot ── */
  .copilot-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--copilot-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Copilot ── */
  .copilot-sidebar {
    background: var(--copilot-surface);
    border-right: 1px solid var(--copilot-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4rem);
    position: sticky;
    top: 4rem;
  }

  .copilot-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .copilot-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--copilot-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .copilot-version-badge {
    background: var(--copilot-surface-3);
    border: 1px solid var(--copilot-border);
    border-radius: var(--copilot-radius);
    color: var(--copilot-brand-hover);
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .copilot-sidebar-github {
    align-items: center;
    color: var(--copilot-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 200ms ease;
  }

  .copilot-sidebar-github:hover,
  .copilot-sidebar-github:focus-visible {
    color: var(--copilot-brand);
  }

  .copilot-side-list,
  .copilot-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .copilot-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--copilot-ink-2);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.5rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 200ms ease, border-color 200ms ease, color 200ms ease;
  }

  .copilot-side-link:hover,
  .copilot-side-link:focus-visible {
    background: var(--copilot-surface-3);
    color: var(--copilot-brand);
    text-decoration: none;
  }

  .copilot-side-link[aria-current="page"] {
    background: var(--copilot-brand-lighter);
    border-left-color: var(--copilot-brand);
    color: var(--copilot-brand-hover);
    font-weight: 600;
    text-decoration: none;
  }

  .copilot-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .copilot-side-divider {
    border-top: 1px solid var(--copilot-border);
    margin: 0.5rem 0;
  }

  .copilot-side-group {
    display: block;
  }

  .copilot-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--copilot-secondary);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 600;
    gap: 0.35rem;
    letter-spacing: 0.04em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 1rem 0 calc(1rem - 3px);
    text-transform: uppercase;
    transition: background 200ms ease;
  }

  .copilot-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .copilot-side-group__summary:hover,
  .copilot-side-group__summary:focus-visible {
    background: var(--copilot-surface-3);
    outline: none;
  }

  .copilot-side-group :global(.copilot-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 200ms ease;
  }

  .copilot-side-group:not([open]) :global(.copilot-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .copilot-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .copilot-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .copilot-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .copilot-breadcrumb__item {
    align-items: center;
    color: var(--copilot-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .copilot-breadcrumb__item + .copilot-breadcrumb__item::before {
    color: var(--copilot-secondary);
    content: "›";
    margin: 0 0.4rem;
  }

  .copilot-breadcrumb__link {
    color: var(--copilot-brand-hover);
    text-decoration: none;
  }

  .copilot-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .copilot-breadcrumb__item span[aria-current="page"] {
    color: var(--copilot-ink);
    font-weight: 600;
  }

  /* ── Footer Copilot ── */
  .copilot-footer {
    background: var(--copilot-surface-2);
    border-top: 1px solid var(--copilot-border);
    margin-top: auto;
  }

  .copilot-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .copilot-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .copilot-footer__link {
    color: var(--copilot-ink-2);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .copilot-footer__link:hover {
    color: var(--copilot-brand);
    text-decoration: underline;
  }

  .copilot-footer__brand {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    gap: 0.5rem;
  }

  .copilot-footer__logo {
    display: block;
    width: 22px;
    height: 22px;
  }

  .copilot-footer__wordmark {
    color: var(--copilot-ink);
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .copilot-body {
      grid-template-columns: 1fr;
    }

    .copilot-sidebar {
      display: none;
    }

    .copilot-nav {
      display: none;
    }

    .copilot-header__tools {
      display: none;
    }

    .copilot-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .copilot-nav__link,
    .copilot-search__btn,
    .copilot-side-link,
    .copilot-side-group :global(.copilot-side-group__icon) {
      transition: none;
    }
  }
</style>

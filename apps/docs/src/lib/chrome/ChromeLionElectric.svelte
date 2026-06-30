<!--
  Chrome documentaire Lion Electric (thelionelectric.com — le constructeur
  saint-jérômien de camions et autobus scolaires 100 % électriques).
  Forme fidèle à l'en-tête réel de thelionelectric.com :
  - Header : bandeau BLANC propre et industriel clean-tech, logo officiel LION
    (emblème éclair + wordmark électrique-bleu) à gauche, nav horizontale,
    loupe de recherche compacte + CTA BLEU ÉLECTRIQUE (pilule arrondie 10px) à droite
  - Onglet de nav actif : SOULIGNÉ bleu électrique (#4164ff)
  - Barre latérale gauche : item actif accent bleu électrique à gauche + fond
    bleu-gris pâle tinté, sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande claire avec liens + logo LION
  - Couleurs mesurées (elementor-kit-6) : bleu électrique #4164ff (accent / CTA),
    bleu profond dérivé #2541cc (hover/pressed), encre noire pure #000000,
    blanc #ffffff (canevas), bleu-gris pâle #ebf0f3 (surface tintée),
    acier #cedbe2 (bord), ciel #72c6ef ; radius bouton 10px
  - Logo officiel LION (recréation vectorielle fidèle, le site ne sert qu'un PNG)
    référencé via <img src="/chrome/lion-electric/logo.svg">
  - Typo : 'Roobert LE' (police géométrique propriétaire de la marque, mesurée sur
    --e-global-typography-*-font-family), repli Arial — nom de police seulement,
    aucun binaire chargé (Roobert LE n'est pas réseau-distribuable).
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

<div class="lion-shell">
  <!-- ── HEADER LION ── -->
  <div class="lion-header-wrap">
    <header class="lion-header" aria-label="Lion Electric">
      <div class="lion-header__inner">
        <!-- Gauche : logo officiel LION (emblème éclair + wordmark) -->
        <div class="lion-header__brand">
          <a href="/" class="lion-header__brand-link" aria-label="Accueil : Lion Electric Design System">
            <img
              src="/chrome/lion-electric/logo.svg"
              alt="Lion Electric"
              class="lion-logo"
              width="135"
              height="36"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="lion-nav" aria-label="Navigation principale">
          <ul class="lion-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="lion-nav__item">
                <a
                  class="lion-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche LION : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="lion-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA bleu électrique -->
        <div class="lion-header__tools">
          <div class="lion-header__tools-links">
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
          class="lion-header__burger"
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

  <!-- ── BODY LION ── -->
  <div class="lion-body">
    <!-- Sidebar -->
    <aside class="lion-sidebar" aria-label="Navigation de la documentation">
      <nav class="lion-side-nav" aria-label="Sommaire">
        <ul class="lion-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="lion-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="lion-side-divider" role="separator"></li>

          <li class="lion-side-heading">
            <a
              class="lion-side-link lion-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="lion-side-group" open={isGroupOpen(group.items)}>
                <summary class="lion-side-group__summary">
                  <ChevronDown class="lion-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="lion-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="lion-side-link lion-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="lion-side-divider" role="separator"></li>

          <li class="lion-side-heading">
            <a
              class="lion-side-link lion-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="lion-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="lion-side-group__summary">
                  <ChevronDown class="lion-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="lion-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="lion-side-link lion-side-link--sub"
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
      <div class="lion-sidebar-footer">
        <span class="lion-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="lion-sidebar-github"
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
    <div class="lion-content">
      <nav class="lion-breadcrumb" aria-label="Breadcrumb">
        <ol class="lion-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="lion-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="lion-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER LION ── -->
  <footer class="lion-footer" aria-label="Pied de page Lion Electric">
    <div class="lion-footer__inner">
      <nav class="lion-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="lion-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/lion-electric/logo.svg"
        alt="Lion Electric"
        class="lion-footer__logo"
        width="120"
        height="32"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables LION ── */
  .lion-shell {
    --lion-blue: #4164ff; /* bleu électrique primaire (--e-global-color-accent) */
    --lion-blue-deep: #2541cc; /* bleu profond dérivé (hover/pressed) */
    --lion-sky: #72c6ef; /* ciel vif (accent) */
    --lion-pale: #d4ebf6; /* ciel pâle tinté */
    --lion-steel: #cedbe2; /* acier (bord / surface alt) */
    --lion-surface-tint: #ebf0f3; /* bleu-gris pâle (--e-global-color-secondary) */
    --lion-ink: #000000; /* encre noire pure (--e-global-color-text) */
    --lion-grey: #4a5560; /* gris-bleu secondaire dérivé */
    --lion-white: #fff; /* canevas (--e-global-color-primary) */
    --lion-border: #cedbe2; /* bord acier */
    --lion-sidebar-width: 17rem;
    --lion-radius: 10px; /* radius bouton/carte mesuré (.elementor-button) */
    font-family: 'Roobert LE', Arial, Helvetica, sans-serif;
    background: var(--lion-white);
    color: var(--lion-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header LION ── */
  .lion-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .lion-header {
    background: var(--lion-white);
    border-bottom: 1px solid var(--lion-border);
  }

  .lion-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .lion-header__brand {
    flex: 0 0 auto;
  }

  .lion-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .lion-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel LION (ratio préservé, hauteur ~36px clean-tech). */
  .lion-logo {
    display: block;
    width: auto;
    height: 36px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .lion-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .lion-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré 10px, hover tinté bleu pâle. */
  .lion-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--lion-radius);
    color: var(--lion-ink);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .lion-search-btn:hover,
  .lion-search-btn:focus-visible {
    background: var(--lion-surface-tint);
    border-color: var(--lion-blue);
    color: var(--lion-blue);
    outline: none;
  }

  .lion-nav__item {
    flex: 0 0 auto;
  }

  .lion-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--lion-ink);
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

  .lion-nav__link:hover,
  .lion-nav__link:focus-visible {
    color: var(--lion-blue);
    outline: none;
  }

  .lion-nav__link[aria-current="page"] {
    border-bottom-color: var(--lion-blue);
    color: var(--lion-blue);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .lion-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .lion-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.625rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header LION (champs blancs, bord acier 1px, radius 10px). */
  .lion-header__tools-links :global(.docs-header-control) {
    background: var(--lion-white);
    border-color: var(--lion-border);
    border-radius: var(--lion-radius);
    color: var(--lion-ink);
    font-family: inherit;
  }

  .lion-header__tools-links :global(.docs-header-control:hover),
  .lion-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--lion-surface-tint);
    border-color: var(--lion-blue);
    color: var(--lion-blue);
    box-shadow: none;
  }

  /* CTA bleu électrique (radius 10px) : signature LION. */
  .lion-cta {
    align-items: center;
    background: var(--lion-blue);
    border: 1px solid var(--lion-blue);
    border-radius: var(--lion-radius);
    color: var(--lion-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    padding: 0 1.5rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    white-space: nowrap;
  }

  .lion-cta:hover,
  .lion-cta:focus-visible {
    background: var(--lion-blue-deep);
    border-color: var(--lion-blue-deep);
    color: var(--lion-white);
    outline: none;
  }

  /* Burger mobile */
  .lion-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--lion-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body LION ── */
  .lion-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--lion-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar LION ── */
  .lion-sidebar {
    background: var(--lion-white);
    border-right: 1px solid var(--lion-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .lion-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .lion-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--lion-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .lion-version-badge {
    background: var(--lion-surface-tint);
    border: 1px solid var(--lion-border);
    border-radius: var(--lion-radius);
    color: var(--lion-blue);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .lion-sidebar-github {
    align-items: center;
    color: var(--lion-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .lion-sidebar-github:hover,
  .lion-sidebar-github:focus-visible {
    color: var(--lion-blue);
  }

  .lion-side-list,
  .lion-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .lion-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--lion-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .lion-side-link:hover,
  .lion-side-link:focus-visible {
    background: var(--lion-surface-tint);
    color: var(--lion-blue);
    text-decoration: none;
  }

  .lion-side-link[aria-current="page"] {
    background: var(--lion-surface-tint);
    border-left-color: var(--lion-blue);
    color: var(--lion-blue-deep);
    font-weight: 700;
    text-decoration: none;
  }

  .lion-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .lion-side-divider {
    border-top: 1px solid var(--lion-border);
    margin: 0.5rem 0;
  }

  .lion-side-group {
    display: block;
  }

  .lion-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--lion-grey);
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

  .lion-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .lion-side-group__summary:hover,
  .lion-side-group__summary:focus-visible {
    background: var(--lion-surface-tint);
    outline: none;
  }

  .lion-side-group :global(.lion-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .lion-side-group:not([open]) :global(.lion-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .lion-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .lion-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .lion-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .lion-breadcrumb__item {
    align-items: center;
    color: var(--lion-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .lion-breadcrumb__item + .lion-breadcrumb__item::before {
    color: var(--lion-steel);
    content: "›";
    margin: 0 0.4rem;
  }

  .lion-breadcrumb__link {
    color: var(--lion-blue);
    text-decoration: none;
  }

  .lion-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .lion-breadcrumb__item span[aria-current="page"] {
    color: var(--lion-ink);
    font-weight: 600;
  }

  /* ── Footer LION ── */
  .lion-footer {
    background: var(--lion-surface-tint);
    border-top: 1px solid var(--lion-border);
    margin-top: auto;
  }

  .lion-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .lion-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .lion-footer__link {
    color: var(--lion-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .lion-footer__link:hover {
    color: var(--lion-blue);
    text-decoration: underline;
  }

  .lion-footer__logo {
    display: block;
    width: auto;
    height: 32px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .lion-body {
      grid-template-columns: 1fr;
    }

    .lion-sidebar {
      display: none;
    }

    .lion-nav {
      display: none;
    }

    .lion-header__tools {
      display: none;
    }

    .lion-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .lion-nav__link,
    .lion-cta,
    .lion-search-btn,
    .lion-side-link,
    .lion-side-group :global(.lion-side-group__icon) {
      transition: none;
    }
  }
</style>

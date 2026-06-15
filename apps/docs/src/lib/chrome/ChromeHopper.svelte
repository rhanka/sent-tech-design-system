<!--
  Chrome documentaire Hopper (hopper.com) — appli de voyage montréalaise.
  Forme fidèle à l'en-tête réel de hopper.com :
  - Header : bandeau BLANC épuré, logo officiel Hopper (lièvre bondissant
    + wordmark corail) à gauche, nav horizontale, loupe de recherche compacte
    + CTA corail (radius 8px, arrondi amical) à droite
  - Onglet de nav actif : SOULIGNÉ corail
  - Barre latérale gauche : item actif accent corail à gauche + fond tinté,
    sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande claire avec liens + logo Hopper
  - Couleurs mesurées : corail #f05754 (primaire), foncé #c13943 (hover),
    bleu interactif #1878ec (accent/lien), encre #111111, surfaces blanches,
    subtle #f5f5f5, inverse sombre #232323, bord #e5e5e5 ; radius 8px (arrondi amical)
  - Logo officiel Hopper (asset Wikipedia, lièvre + wordmark corail) référencé via
    <img src="/chrome/hopper/logo.svg">
  - Typo : Proxima Nova (propriétaire → repli 'Helvetica Neue', Arial). Pas de
    webfont libre équivalente : on conserve le repli Helvetica, fidèle au rendu.
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

<div class="hop-shell">
  <!-- ── HEADER HOPPER ── -->
  <div class="hop-header-wrap">
    <header class="hop-header" aria-label="Hopper">
      <div class="hop-header__inner">
        <!-- Gauche : logo officiel Hopper (lièvre + wordmark corail) -->
        <div class="hop-header__brand">
          <a href="/" class="hop-header__brand-link" aria-label="Accueil : Hopper Design System">
            <img
              src="/chrome/hopper/logo.svg"
              alt="Hopper"
              class="hop-logo"
              width="92"
              height="30"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="hop-nav" aria-label="Navigation principale">
          <ul class="hop-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="hop-nav__item">
                <a
                  class="hop-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Hopper : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="hop-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA corail -->
        <div class="hop-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="hop-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA corail arrondi (radius 8px) : signature Hopper -->
          <a class="hop-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="hop-header__burger"
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

  <!-- ── BODY HOPPER ── -->
  <div class="hop-body">
    <!-- Sidebar -->
    <aside class="hop-sidebar" aria-label="Navigation de la documentation">
      <nav class="hop-side-nav" aria-label="Sommaire">
        <ul class="hop-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="hop-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="hop-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="hop-side-group" open={isGroupOpen(group.items)}>
                <summary class="hop-side-group__summary">
                  <ChevronDown class="hop-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="hop-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="hop-side-link hop-side-link--sub"
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
      <div class="hop-sidebar-footer">
        <span class="hop-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="hop-sidebar-github"
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
    <div class="hop-content">
      <nav class="hop-breadcrumb" aria-label="Breadcrumb">
        <ol class="hop-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="hop-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="hop-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER HOPPER ── -->
  <footer class="hop-footer" aria-label="Pied de page Hopper">
    <div class="hop-footer__inner">
      <nav class="hop-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="hop-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/hopper/logo.svg"
        alt="Hopper"
        class="hop-footer__logo"
        width="92"
        height="30"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Hopper ── */
  .hop-shell {
    --hop-coral: #f05754; /* corail primaire */
    --hop-coral-dark: #c13943; /* corail foncé / hover */
    --hop-blue: #1878ec; /* bleu interactif / accent / lien */
    --hop-ink: #111111; /* encre */
    --hop-grey: #5c5c5c; /* gris texte secondaire */
    --hop-subtle: #f5f5f5; /* surface subtile */
    --hop-tint: #fdecec; /* corail tinté (surface secondaire) */
    --hop-inverse: #232323; /* inverse sombre */
    --hop-border: #e5e5e5; /* bord */
    --hop-white: #fff;
    --hop-sidebar-width: 17rem;
    --hop-radius: 8px; /* arrondi amical */
    font-family: 'Proxima Nova', 'Helvetica Neue', Arial, sans-serif;
    background: var(--hop-white);
    color: var(--hop-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Hopper ── */
  .hop-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .hop-header {
    background: var(--hop-white);
    border-bottom: 1px solid var(--hop-border);
  }

  .hop-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .hop-header__brand {
    flex: 0 0 auto;
  }

  .hop-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .hop-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Hopper (ratio préservé, hauteur ~30px comme l'en-tête réel). */
  .hop-logo {
    display: block;
    width: auto;
    height: 30px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .hop-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .hop-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : carré 8px, hover corail tinté. */
  .hop-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--hop-radius);
    color: var(--hop-ink);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .hop-search-btn:hover,
  .hop-search-btn:focus-visible {
    background: var(--hop-tint);
    border-color: var(--hop-coral);
    color: var(--hop-coral-dark);
    outline: none;
  }

  .hop-nav__item {
    flex: 0 0 auto;
  }

  .hop-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--hop-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .hop-nav__link:hover,
  .hop-nav__link:focus-visible {
    color: var(--hop-coral);
    outline: none;
  }

  .hop-nav__link[aria-current="page"] {
    border-bottom-color: var(--hop-coral);
    color: var(--hop-coral);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .hop-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .hop-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Hopper (champs clairs, bord gris 1px, radius 8px). */
  .hop-header__tools-links :global(.docs-header-control) {
    background: var(--hop-white);
    border-color: var(--hop-border);
    border-radius: var(--hop-radius);
    color: var(--hop-ink);
    font-family: inherit;
  }

  .hop-header__tools-links :global(.docs-header-control:hover),
  .hop-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--hop-tint);
    border-color: var(--hop-coral);
    color: var(--hop-coral-dark);
    box-shadow: none;
  }

  /* CTA corail arrondi (radius 8px) : signature Hopper. */
  .hop-cta {
    align-items: center;
    background: var(--hop-coral);
    border: 1px solid var(--hop-coral);
    border-radius: var(--hop-radius);
    color: var(--hop-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .hop-cta:hover,
  .hop-cta:focus-visible {
    background: var(--hop-coral-dark);
    border-color: var(--hop-coral-dark);
    color: var(--hop-white);
    outline: none;
  }

  /* Burger mobile */
  .hop-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--hop-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Hopper ── */
  .hop-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--hop-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Hopper ── */
  .hop-sidebar {
    background: var(--hop-white);
    border-right: 1px solid var(--hop-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .hop-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .hop-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--hop-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .hop-version-badge {
    background: var(--hop-tint);
    border: 1px solid var(--hop-border);
    border-radius: var(--hop-radius);
    color: var(--hop-coral-dark);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .hop-sidebar-github {
    align-items: center;
    color: var(--hop-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .hop-sidebar-github:hover,
  .hop-sidebar-github:focus-visible {
    color: var(--hop-coral);
  }

  .hop-side-list,
  .hop-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .hop-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--hop-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .hop-side-link:hover,
  .hop-side-link:focus-visible {
    background: var(--hop-subtle);
    color: var(--hop-coral);
    text-decoration: none;
  }

  .hop-side-link[aria-current="page"] {
    background: var(--hop-tint);
    border-left-color: var(--hop-coral);
    color: var(--hop-coral-dark);
    font-weight: 700;
    text-decoration: none;
  }

  .hop-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .hop-side-divider {
    border-top: 1px solid var(--hop-border);
    margin: 0.5rem 0;
  }

  .hop-side-group {
    display: block;
  }

  .hop-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--hop-grey);
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

  .hop-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .hop-side-group__summary:hover,
  .hop-side-group__summary:focus-visible {
    background: var(--hop-subtle);
    outline: none;
  }

  .hop-side-group :global(.hop-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .hop-side-group:not([open]) :global(.hop-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .hop-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .hop-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .hop-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .hop-breadcrumb__item {
    align-items: center;
    color: var(--hop-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .hop-breadcrumb__item + .hop-breadcrumb__item::before {
    color: var(--hop-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .hop-breadcrumb__link {
    color: var(--hop-blue);
    text-decoration: none;
  }

  .hop-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .hop-breadcrumb__item span[aria-current="page"] {
    color: var(--hop-ink);
    font-weight: 600;
  }

  /* ── Footer Hopper ── */
  .hop-footer {
    background: var(--hop-subtle);
    border-top: 1px solid var(--hop-border);
    margin-top: auto;
  }

  .hop-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .hop-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .hop-footer__link {
    color: var(--hop-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .hop-footer__link:hover {
    color: var(--hop-coral);
    text-decoration: underline;
  }

  .hop-footer__logo {
    display: block;
    width: auto;
    height: 28px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .hop-body {
      grid-template-columns: 1fr;
    }

    .hop-sidebar {
      display: none;
    }

    .hop-nav {
      display: none;
    }

    .hop-header__tools {
      display: none;
    }

    .hop-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .hop-nav__link,
    .hop-cta,
    .hop-search-btn,
    .hop-side-link,
    .hop-side-group :global(.hop-side-group__icon) {
      transition: none;
    }
  }
</style>

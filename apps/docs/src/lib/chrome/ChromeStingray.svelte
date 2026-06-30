<!--
  Chrome documentaire Stingray (stingray.com — l'entreprise montréalaise de
  musique & média-tech). Forme fidèle à l'esprit média-tech épuré de stingray.com :
  - Header : bandeau BLANC propre avec hairline fin (#e6e6e6), logo officiel
    Stingray (wordmark) à gauche ; nav horizontale au centre + loupe de
    recherche ; CTA pilule corail à droite
  - Onglet de nav actif : SOULIGNÉ corail #ee3e38 (l'accent expressif Stingray)
  - Loupe de recherche : icône corail #ee3e38
  - Barre latérale gauche : item actif accent corail à gauche + fond tinté corail
    pâle (#fdeeee), sous-items indentés
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande bleu nuit profond #1a2b3c, liens blancs, ligne d'accent corail
    #ee3e38, wordmark Stingray en blanc/knockout
  - Couleurs marque Stingray : corail #ee3e38 (marque / action / lien / actif),
    corail-foncé #c92f2a (hover), bleu nuit #1a2b3c (emphase / footer / encre
    corps), hairline #e6e6e6, teinte hover corail pâle #fdeeee, blanc #ffffff
  - Logo officiel Stingray (wordmark vectoriel) référencé via
    <img src="/chrome/stingray/logo.svg"> ; ~22px de haut
  - On ne charge AUCUNE police propriétaire ; fallbacks sans-serif système.
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

<div class="sti-shell">
  <!-- ── HEADER STINGRAY ── -->
  <div class="sti-header-wrap">
    <header class="sti-header" aria-label="Stingray">
      <div class="sti-header__inner">
        <!-- Gauche : logo officiel Stingray (wordmark) -->
        <div class="sti-header__brand">
          <a href="/" class="sti-header__brand-link" aria-label="Accueil : Stingray Design System">
            <img
              src="/chrome/stingray/logo.svg"
              alt="Stingray"
              class="sti-logo"
              width="120"
              height="22"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="sti-nav" aria-label="Navigation principale">
          <ul class="sti-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="sti-nav__item">
                <a
                  class="sti-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Stingray : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="sti-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA pilule -->
        <div class="sti-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="sti-header__tools-links">
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
          class="sti-header__burger"
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

  <!-- ── BODY STINGRAY ── -->
  <div class="sti-body">
    <!-- Sidebar -->
    <aside class="sti-sidebar" aria-label="Navigation de la documentation">
      <nav class="sti-side-nav" aria-label="Sommaire">
        <ul class="sti-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="sti-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="sti-side-divider" role="separator"></li>

          <li class="sti-side-heading">
            <a
              class="sti-side-link sti-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="sti-side-group" open={isGroupOpen(group.items)}>
                <summary class="sti-side-group__summary">
                  <ChevronDown class="sti-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="sti-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="sti-side-link sti-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="sti-side-divider" role="separator"></li>

          <li class="sti-side-heading">
            <a
              class="sti-side-link sti-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="sti-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="sti-side-group__summary">
                  <ChevronDown class="sti-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="sti-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="sti-side-link sti-side-link--sub"
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
      <div class="sti-sidebar-footer">
        <span class="sti-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="sti-sidebar-github"
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
    <div class="sti-content">
      <nav class="sti-breadcrumb" aria-label="Breadcrumb">
        <ol class="sti-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="sti-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="sti-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER STINGRAY ── -->
  <footer class="sti-footer" aria-label="Pied de page Stingray">
    <div class="sti-footer__inner">
      <nav class="sti-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="sti-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/stingray/logo.svg"
        alt="Stingray"
        class="sti-footer__logo"
        width="110"
        height="20"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Stingray (identité corail média-tech) ── */
  .sti-shell {
    --sti-coral: #ee3e38; /* corail : marque / action / lien / actif */
    --sti-coral-hover: #c92f2a; /* corail assombri : hover */
    --sti-navy: #1a2b3c; /* bleu nuit profond : emphase / footer */
    --sti-ink: #1a2b3c; /* encre : texte primaire (bleu nuit) */
    --sti-ink-inverse: #ffffff; /* surface inverse (texte sur footer) */
    --sti-grey: #5b6b7a; /* gris secondaire (dérivé du navy) */
    --sti-grey-muted: #8a97a3; /* gris clair */
    --sti-subtle: #fdeeee; /* teinte hover corail pâle */
    --sti-subtle-2: #f5f7f9; /* surface neutre douce */
    --sti-border: #e6e6e6; /* hairline */
    --sti-white: #fff;
    --sti-sidebar-width: 17rem;
    --sti-radius: 4px; /* contrôles arrondis doux */
    --sti-radius-pill: 999px; /* pilules / CTA */
    /* Typo : aucune police propriétaire chargée ; sans-serif système média-tech. */
    --sti-font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    --sti-font-display: var(--sti-font-body);
    font-family: var(--sti-font-body);
    background: var(--sti-white);
    color: var(--sti-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Stingray ── */
  .sti-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .sti-header {
    background: var(--sti-white);
    border-bottom: 1px solid var(--sti-border);
  }

  .sti-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .sti-header__brand {
    flex: 0 0 auto;
  }

  .sti-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .sti-header__brand-link:hover {
    opacity: 0.8;
  }

  /* Logo officiel Stingray (wordmark, ~22px de haut, ratio préservé). */
  .sti-logo {
    display: block;
    width: auto;
    height: 22px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .sti-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .sti-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : icône corail, hover teinté. */
  .sti-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--sti-radius);
    color: var(--sti-coral);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .sti-search-btn:hover,
  .sti-search-btn:focus-visible {
    background: var(--sti-subtle);
    border-color: var(--sti-coral);
    color: var(--sti-coral-hover);
    outline: none;
  }

  .sti-nav__item {
    flex: 0 0 auto;
  }

  .sti-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--sti-ink);
    display: inline-flex;
    font-family: var(--sti-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .sti-nav__link:hover,
  .sti-nav__link:focus-visible {
    color: var(--sti-coral);
    outline: none;
  }

  /* Onglet actif : souligné corail (l'indicateur expressif Stingray). */
  .sti-nav__link[aria-current="page"] {
    border-bottom-color: var(--sti-coral);
    color: var(--sti-ink);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .sti-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .sti-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .sti-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .sti-header__tools-links :global(> * + *) {
    border-left: 1px solid var(--sti-border);
  }

  /* Overrides switchers dans header Stingray (champs clairs, bord hairline 1px). */
  .sti-header__tools-links :global(.docs-header-control) {
    background: var(--sti-white);
    border-color: var(--sti-border);
    border-radius: var(--sti-radius);
    color: var(--sti-ink);
    font-family: inherit;
  }

  .sti-header__tools-links :global(.docs-header-control:hover),
  .sti-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--sti-subtle);
    border-color: var(--sti-coral);
    color: var(--sti-coral);
    box-shadow: none;
  }

  /* CTA pilule corail (signature média-tech Stingray). */
  .sti-cta {
    align-items: center;
    background: var(--sti-coral);
    border: 1px solid var(--sti-coral);
    border-radius: var(--sti-radius-pill);
    color: var(--sti-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--sti-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .sti-cta:hover,
  .sti-cta:focus-visible {
    background: var(--sti-coral-hover);
    border-color: var(--sti-coral-hover);
    color: var(--sti-white);
    outline: none;
  }

  /* Burger mobile */
  .sti-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--sti-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Stingray ── */
  .sti-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--sti-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Stingray ── */
  .sti-sidebar {
    background: var(--sti-white);
    border-right: 1px solid var(--sti-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .sti-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .sti-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--sti-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .sti-version-badge {
    background: var(--sti-subtle);
    border: 1px solid var(--sti-border);
    border-radius: var(--sti-radius);
    color: var(--sti-coral);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .sti-sidebar-github {
    align-items: center;
    color: var(--sti-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .sti-sidebar-github:hover,
  .sti-sidebar-github:focus-visible {
    color: var(--sti-coral);
  }

  .sti-side-list,
  .sti-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .sti-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--sti-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .sti-side-link:hover,
  .sti-side-link:focus-visible {
    background: var(--sti-subtle);
    color: var(--sti-coral);
    text-decoration: none;
  }

  .sti-side-link[aria-current="page"] {
    background: var(--sti-subtle);
    border-left-color: var(--sti-coral);
    color: var(--sti-coral);
    font-weight: 700;
    text-decoration: none;
  }

  .sti-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .sti-side-divider {
    border-top: 1px solid var(--sti-border);
    margin: 0.5rem 0;
  }

  .sti-side-group {
    display: block;
  }

  .sti-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--sti-grey);
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

  .sti-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .sti-side-group__summary:hover,
  .sti-side-group__summary:focus-visible {
    background: var(--sti-subtle);
    outline: none;
  }

  .sti-side-group :global(.sti-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .sti-side-group:not([open]) :global(.sti-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .sti-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .sti-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .sti-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .sti-breadcrumb__item {
    align-items: center;
    color: var(--sti-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .sti-breadcrumb__item + .sti-breadcrumb__item::before {
    color: var(--sti-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .sti-breadcrumb__link {
    color: var(--sti-ink);
    text-decoration: none;
  }

  .sti-breadcrumb__link:hover {
    color: var(--sti-coral);
    text-decoration: underline;
  }

  .sti-breadcrumb__item span[aria-current="page"] {
    color: var(--sti-ink);
    font-weight: 600;
  }

  /* ── Footer Stingray ── */
  .sti-footer {
    background: var(--sti-navy);
    border-top: 3px solid var(--sti-coral); /* ligne d'accent corail */
    margin-top: auto;
  }

  .sti-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .sti-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .sti-footer__link {
    color: var(--sti-ink-inverse);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .sti-footer__link:hover {
    color: var(--sti-coral);
    text-decoration: underline;
  }

  /* Wordmark Stingray en blanc/knockout sur le bleu nuit. */
  .sti-footer__logo {
    display: block;
    width: auto;
    height: 20px;
    flex: 0 0 auto;
    filter: brightness(0) invert(1);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .sti-body {
      grid-template-columns: 1fr;
    }

    .sti-sidebar {
      display: none;
    }

    .sti-nav {
      display: none;
    }

    .sti-header__tools {
      display: none;
    }

    .sti-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .sti-nav__link,
    .sti-cta,
    .sti-search-btn,
    .sti-side-link,
    .sti-side-group :global(.sti-side-group__icon) {
      transition: none;
    }
  }
</style>

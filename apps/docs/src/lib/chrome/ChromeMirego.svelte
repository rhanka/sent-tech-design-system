<!--
  Chrome documentaire Mirego (mirego.com — studio de produits numériques, Montréal).
  Forme fidèle à l'esthétique MINIMALE / ÉDITORIALE de mirego.com :
  - Header : barre crème #f7edde (surface signature), logo officiel Mirego (wordmark
    ENCRE #050307, vecteur extrait du <svg id="nav-logo"> servi par mirego.com) à
    gauche, nav horizontale sobre en encre, loupe de recherche + CTA encre plein à droite
  - Onglet de nav actif : SOULIGNÉ encre (l'indicateur minimal ::after de Mirego)
  - Barre latérale gauche : item actif = bord encre gauche + texte encre, hover crème
  - Fil d'Ariane au-dessus du contenu (liens encre, séparateur gris chaud)
  - Footer : bande crème avec liens + logo Mirego
  - Couleurs MESURÉES (cf. packages/theme-mirego) : encre #050307 (texte/action/marque),
    crème #f7edde (surface signature), blanc #fff (fond page), pervenche #b5a6ff (accent),
    gris chaud secondaire #5b5b5b, hairline #e0dfe0, bord chaud #c6beb2 ; radius doux
    (6px contrôles, 9.5px CTA, 500px pilules)
  - Typo : Almirego / Almirego Display (faces bespoke de Mirego) — fallback serif/grotesque,
    AUCUNE police réseau chargée (le site source ne sert pas de webfont publique réutilisable)
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

<div class="mir-shell">
  <!-- ── HEADER MIREGO ── -->
  <div class="mir-header-wrap">
    <header class="mir-header" aria-label="Mirego">
      <div class="mir-header__inner">
        <!-- Gauche : logo officiel Mirego (wordmark encre, vecteur du site) -->
        <div class="mir-header__brand">
          <a href="/" class="mir-header__brand-link" aria-label="Accueil : Mirego Design System">
            <img
              src="/chrome/mirego/logo.svg"
              alt="Mirego"
              class="mir-logo"
              width="122"
              height="24"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale sobre, encre -->
        <nav class="mir-nav" aria-label="Navigation principale">
          <ul class="mir-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="mir-nav__item">
                <a
                  class="mir-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </nav>

        <!-- Droite : recherche (loupe) + outils + CTA encre plein -->
        <div class="mir-header__tools">
          <!-- Recherche Mirego : bouton loupe compact (radius doux), branché sur la palette docs. -->
          <button
            type="button"
            class="mir-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="mir-header__tools-links">
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
          class="mir-header__burger"
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

  <!-- ── BODY MIREGO ── -->
  <div class="mir-body">
    <!-- Sidebar -->
    <aside class="mir-sidebar" aria-label="Navigation de la documentation">
      <nav class="mir-side-nav" aria-label="Sommaire">
        <ul class="mir-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="mir-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="mir-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="mir-side-group" open={isGroupOpen(group.items)}>
                <summary class="mir-side-group__summary">
                  <ChevronDown class="mir-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="mir-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="mir-side-link mir-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}

          <li class="mir-side-divider" role="separator"></li>

          <li>
            <a
              class="mir-side-link"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="mir-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="mir-side-group__summary">
                  <ChevronDown class="mir-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="mir-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="mir-side-link mir-side-link--sub"
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
      <div class="mir-sidebar-footer">
        <span class="mir-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="mir-sidebar-github"
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
    <div class="mir-content">
      <nav class="mir-breadcrumb" aria-label="Breadcrumb">
        <ol class="mir-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="mir-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="mir-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER MIREGO ── -->
  <footer class="mir-footer" aria-label="Pied de page Mirego">
    <div class="mir-footer__inner">
      <nav class="mir-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="mir-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/mirego/logo.svg"
        alt="Mirego"
        class="mir-footer__logo"
        width="110"
        height="22"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Mirego (encre sur crème, accent pervenche) ── */
  .mir-shell {
    --mir-ink: #050307; /* encre : texte, action, marque (mesuré body color) */
    --mir-cream: #f7edde; /* crème : surface signature (--primary-color) */
    --mir-white: #fff; /* blanc : fond de page (--page-background) */
    --mir-periwinkle: #b5a6ff; /* pervenche : accent décoratif (::selection) */
    --mir-grey: #5b5b5b; /* gris chaud secondaire */
    --mir-grey-soft: #948e85; /* gris chaud atténué */
    --mir-hairline: #e0dfe0; /* hairline fin 1px */
    --mir-border-warm: #c6beb2; /* bord chaud des cartes éditoriales */
    --mir-ink-soft: #211e25; /* encre légèrement levée (hover CTA) */
    --mir-sidebar-width: 17rem;
    --mir-radius: 6px; /* contrôles / petites surfaces (--border-radius) */
    --mir-radius-cta: 9.5px; /* CTA (--cta-border-radius) */
    --mir-radius-pill: 500px; /* pilules */
    font-family: Almirego, 'Almirego Fallback', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
    background: var(--mir-white);
    color: var(--mir-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Mirego (barre crème) ── */
  .mir-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .mir-header {
    background: var(--mir-cream);
    border-bottom: 1px solid var(--mir-hairline);
  }

  .mir-header__inner {
    align-items: center;
    display: flex;
    gap: 2rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.75rem;
  }

  .mir-header__brand {
    flex: 0 0 auto;
  }

  .mir-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 300ms cubic-bezier(0.215, 0.61, 0.355, 1);
  }

  .mir-header__brand-link:hover {
    opacity: 0.7;
  }

  /* Logo officiel Mirego (ratio préservé, hauteur ~24px comme l'en-tête réel). */
  .mir-logo {
    display: block;
    width: auto;
    height: 24px;
  }

  /* ── Nav horizontale (centre) : sobre, encre, indicateur souligné ── */
  .mir-nav {
    flex: 1 1 auto;
    min-width: 0;
    overflow-x: auto;
  }

  .mir-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    justify-content: center;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .mir-nav__item {
    flex: 0 0 auto;
  }

  .mir-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--mir-ink);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 400;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 300ms cubic-bezier(0.215, 0.61, 0.355, 1), color 300ms cubic-bezier(0.215, 0.61, 0.355, 1);
    white-space: nowrap;
  }

  .mir-nav__link:hover,
  .mir-nav__link:focus-visible {
    border-bottom-color: var(--mir-ink);
    color: var(--mir-ink);
    outline: none;
  }

  /* État actif = soulignement encre (l'indicateur ::after minimal de Mirego). */
  .mir-nav__link[aria-current="page"] {
    border-bottom-color: var(--mir-ink);
    color: var(--mir-ink);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .mir-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .mir-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Mirego (champs blancs, hairline chaud, radius doux). */
  .mir-header__tools-links :global(.docs-header-control) {
    background: var(--mir-white);
    border-color: var(--mir-border-warm);
    border-radius: var(--mir-radius);
    color: var(--mir-ink);
    font-family: inherit;
  }

  .mir-header__tools-links :global(.docs-header-control:hover),
  .mir-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--mir-white);
    border-color: var(--mir-ink);
    color: var(--mir-ink);
    box-shadow: none;
  }

  /* Recherche Mirego : bouton loupe compact (radius doux, hover encre). */
  .mir-search__btn {
    align-items: center;
    background: var(--mir-white);
    border: 1px solid var(--mir-border-warm);
    border-radius: var(--mir-radius);
    color: var(--mir-ink);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 300ms cubic-bezier(0.215, 0.61, 0.355, 1), border-color 300ms cubic-bezier(0.215, 0.61, 0.355, 1), color 300ms cubic-bezier(0.215, 0.61, 0.355, 1);
  }

  .mir-search__btn:hover,
  .mir-search__btn:focus-visible {
    background: var(--mir-cream);
    border-color: var(--mir-ink);
    color: var(--mir-ink);
    outline: none;
  }

  /* CTA encre plein (radius 9.5px) : signature Mirego. */
  .mir-cta {
    align-items: center;
    background: var(--mir-ink);
    border: 1px solid var(--mir-ink);
    border-radius: var(--mir-radius-cta);
    color: var(--mir-white);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: 'Almirego Display', 'Almirego Display Fallback', Almirego, Newsreader, Georgia, 'Times New Roman', serif;
    font-size: 0.9375rem;
    font-weight: 400;
    height: 2.5rem;
    letter-spacing: 0.02em;
    padding: 0 1.375rem;
    text-decoration: none;
    transition: background 300ms cubic-bezier(0.215, 0.61, 0.355, 1), border-color 300ms cubic-bezier(0.215, 0.61, 0.355, 1);
    white-space: nowrap;
  }

  .mir-cta:hover,
  .mir-cta:focus-visible {
    background: var(--mir-ink-soft);
    border-color: var(--mir-ink-soft);
    color: var(--mir-white);
    outline: none;
  }

  /* Burger mobile */
  .mir-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--mir-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Mirego ── */
  .mir-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--mir-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Mirego ── */
  .mir-sidebar {
    background: var(--mir-white);
    border-right: 1px solid var(--mir-hairline);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .mir-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .mir-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--mir-hairline);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .mir-version-badge {
    background: var(--mir-cream);
    border: 1px solid var(--mir-hairline);
    border-radius: var(--mir-radius);
    color: var(--mir-ink);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .mir-sidebar-github {
    align-items: center;
    color: var(--mir-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 400;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 300ms cubic-bezier(0.215, 0.61, 0.355, 1);
  }

  .mir-sidebar-github:hover,
  .mir-sidebar-github:focus-visible {
    color: var(--mir-grey);
    text-decoration: underline;
    text-decoration-thickness: 0.06em;
    text-underline-offset: 0.18em;
  }

  .mir-side-list,
  .mir-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .mir-side-link {
    align-items: center;
    border-left: 2px solid transparent;
    box-sizing: border-box;
    color: var(--mir-grey);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 2px);
    text-decoration: none;
    transition: background 300ms cubic-bezier(0.215, 0.61, 0.355, 1), border-color 300ms cubic-bezier(0.215, 0.61, 0.355, 1), color 300ms cubic-bezier(0.215, 0.61, 0.355, 1);
  }

  .mir-side-link:hover,
  .mir-side-link:focus-visible {
    background: var(--mir-cream);
    color: var(--mir-ink);
    text-decoration: none;
  }

  /* État actif = bord encre gauche + texte encre, hover crème. */
  .mir-side-link[aria-current="page"] {
    background: var(--mir-white);
    border-left-color: var(--mir-ink);
    color: var(--mir-ink);
    font-weight: 700;
    text-decoration: none;
  }

  .mir-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 2px);
  }

  .mir-side-divider {
    border-top: 1px solid var(--mir-hairline);
    margin: 0.5rem 0;
  }

  .mir-side-group {
    display: block;
  }

  .mir-side-group__summary {
    align-items: center;
    border-left: 2px solid transparent;
    color: var(--mir-grey-soft);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 700;
    gap: 0.35rem;
    letter-spacing: 0.06em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 1rem 0 calc(1rem - 2px);
    text-transform: uppercase;
    transition: background 300ms cubic-bezier(0.215, 0.61, 0.355, 1), color 300ms cubic-bezier(0.215, 0.61, 0.355, 1);
  }

  .mir-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .mir-side-group__summary:hover,
  .mir-side-group__summary:focus-visible {
    background: var(--mir-cream);
    color: var(--mir-ink);
    outline: none;
  }

  .mir-side-group :global(.mir-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 300ms cubic-bezier(0.215, 0.61, 0.355, 1);
  }

  .mir-side-group:not([open]) :global(.mir-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .mir-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .mir-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .mir-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .mir-breadcrumb__item {
    align-items: center;
    color: var(--mir-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .mir-breadcrumb__item + .mir-breadcrumb__item::before {
    color: var(--mir-grey-soft);
    content: "/";
    margin: 0 0.5rem;
  }

  .mir-breadcrumb__link {
    color: var(--mir-ink);
    text-decoration: none;
  }

  .mir-breadcrumb__link:hover {
    color: var(--mir-ink);
    text-decoration: underline;
    text-decoration-thickness: 0.06em;
    text-underline-offset: 0.18em;
  }

  .mir-breadcrumb__item span[aria-current="page"] {
    color: var(--mir-ink);
    font-weight: 700;
  }

  /* ── Footer Mirego (bande crème) ── */
  .mir-footer {
    background: var(--mir-cream);
    border-top: 1px solid var(--mir-hairline);
    margin-top: auto;
  }

  .mir-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.75rem;
  }

  .mir-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .mir-footer__link {
    color: var(--mir-ink);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .mir-footer__link:hover {
    color: var(--mir-ink);
    text-decoration: underline;
    text-decoration-thickness: 0.06em;
    text-underline-offset: 0.18em;
  }

  .mir-footer__logo {
    display: block;
    width: auto;
    height: 22px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .mir-body {
      grid-template-columns: 1fr;
    }

    .mir-sidebar {
      display: none;
    }

    .mir-nav {
      display: none;
    }

    .mir-header__tools {
      display: none;
    }

    .mir-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .mir-nav__link,
    .mir-cta,
    .mir-search__btn,
    .mir-side-link,
    .mir-side-group :global(.mir-side-group__icon) {
      transition: none;
    }
  }
</style>

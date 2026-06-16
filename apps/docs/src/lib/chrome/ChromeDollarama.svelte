<!--
  Chrome documentaire Dollarama (dollarama.com — le détaillant à valeur née au
  Québec, audacieux et amical). Forme calquée sur la structure du chrome Sid Lee
  mais re-stylée aux couleurs de marque Dollarama :
  - Header : bandeau vert de marque #006C46 sur toute la largeur, texte et nav en
    BLANC, ton amical et bold ; le cluster utilitaire + la nav vivent en blanc sur
    le vert ; hover = vert plus sombre #005437 ou soulignement blanc
  - Logo : wordmark officiel Dollarama (<img src="/chrome/dollarama/logo.svg">,
    ~26px de haut) posé sur une petite pastille blanche arrondie pour garantir la
    lisibilité sur le vert
  - Onglet de nav actif : barre/soulignement JAUNE #FFE71E (l'accent de marque)
  - Loupe de recherche : icône blanche, bouton compact branché sur la palette docs
  - Barre latérale gauche : item actif accent vert + fond tinté clair, sous-items
    indentés ; contenu de corps sur fond clair, texte encre #2F2F2F
  - Fil d'Ariane au-dessus du contenu
  - Footer : bande verte #006C46, liens blancs + logo, liseré d'accent jaune #FFE71E
  - Couleurs de marque : vert #006C46 (surface primaire), jaune #FFE71E (accent /
    indicateur actif), blanc (texte sur vert), encre #2F2F2F (zones de contenu)
  - Préfixe de classe CSS unique `dol-` partout.
  - Typo : grotesk système (corps / UI) ; aucune police propriétaire chargée.
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

<div class="dol-shell">
  <!-- ── HEADER DOLLARAMA ── -->
  <div class="dol-header-wrap">
    <header class="dol-header" aria-label="Dollarama">
      <div class="dol-header__inner">
        <!-- Gauche : logo officiel Dollarama sur pastille blanche pour la lisibilité -->
        <div class="dol-header__brand">
          <a href="/" class="dol-header__brand-link" aria-label="Accueil : Dollarama Design System">
            <img
              src="/chrome/dollarama/logo.svg"
              alt="Dollarama"
              class="dol-logo"
              width="124"
              height="26"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale + loupe de recherche -->
        <nav class="dol-nav" aria-label="Navigation principale">
          <ul class="dol-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="dol-nav__item">
                <a
                  class="dol-nav__link"
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>

          <!-- Loupe de recherche Dollarama : bouton compact (pas de champ), branché sur la palette docs. -->
          <button
            type="button"
            class="dol-search-btn"
            aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>

        <!-- Droite : barre utilitaire (switchers + comparateur) + CTA pilule -->
        <div class="dol-header__tools">
          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="dol-header__tools-links">
            {@render compareButton()}
            {@render frameworkSwitcher()}
            {@render themeSwitcher()}
            {@render localeSwitcher()}
          </div>

          <!-- CTA pilule jaune : accent de marque Dollarama. -->
          <a class="dol-cta" href="/#components">
            {locale.value === "fr" ? "Commencer" : "Get started"}
          </a>
        </div>

        <!-- Burger mobile -->
        <button
          type="button"
          class="dol-header__burger"
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

  <!-- ── BODY DOLLARAMA ── -->
  <div class="dol-body">
    <!-- Sidebar -->
    <aside class="dol-sidebar" aria-label="Navigation de la documentation">
      <nav class="dol-side-nav" aria-label="Sommaire">
        <ul class="dol-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="dol-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="dol-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="dol-side-group" open={isGroupOpen(group.items)}>
                <summary class="dol-side-group__summary">
                  <ChevronDown class="dol-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="dol-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="dol-side-link dol-side-link--sub"
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
      <div class="dol-sidebar-footer">
        <span class="dol-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="dol-sidebar-github"
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
    <div class="dol-content">
      <nav class="dol-breadcrumb" aria-label="Breadcrumb">
        <ol class="dol-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="dol-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="dol-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER DOLLARAMA ── -->
  <footer class="dol-footer" aria-label="Pied de page Dollarama">
    <div class="dol-footer__inner">
      <nav class="dol-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="dol-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/dollarama/logo.svg"
        alt="Dollarama"
        class="dol-footer__logo"
        width="124"
        height="26"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Dollarama (couleurs de marque) ── */
  .dol-shell {
    --dol-green: #006c46; /* vert de marque : surface primaire (header / footer) */
    --dol-green-hover: #005437; /* vert assombri : hover sur le bandeau */
    --dol-yellow: #ffe71e; /* jaune accent : indicateur actif / liseré */
    --dol-yellow-hover: #f2d900; /* jaune assombri : hover CTA */
    --dol-ink: #2f2f2f; /* encre : texte des zones de contenu */
    --dol-grey: #6b6b6b; /* gris secondaire (fil d'Ariane / groupes) */
    --dol-subtle: #f4f7f5; /* surface subtile / hover doux (teinte verte) */
    --dol-border: #e2e6e3; /* hairline clair */
    --dol-on-green: rgba(255, 255, 255, 0.82); /* texte/nav atténué sur vert */
    --dol-white: #fff;
    --dol-sidebar-width: 17rem;
    --dol-radius: 6px; /* contrôles arrondis amicaux */
    --dol-radius-pill: 999px; /* pilules / CTA */
    /* Typo Dollarama : grotesk système ; aucune police propriétaire chargée. */
    --dol-font-body: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-family: var(--dol-font-body);
    background: var(--dol-white);
    color: var(--dol-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Dollarama : bandeau vert pleine largeur ── */
  .dol-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
    background: var(--dol-green);
  }

  .dol-header {
    background: var(--dol-green);
    border-bottom: 3px solid var(--dol-yellow);
  }

  .dol-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4.5rem;
    padding: 0.75rem 1.5rem;
  }

  .dol-header__brand {
    flex: 0 0 auto;
  }

  /* Logo officiel Dollarama sur pastille blanche arrondie pour la lisibilité sur le vert. */
  .dol-header__brand-link {
    align-items: center;
    background: var(--dol-white);
    border-radius: var(--dol-radius);
    display: inline-flex;
    padding: 0.3rem 0.6rem;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .dol-header__brand-link:hover {
    opacity: 0.9;
  }

  .dol-logo {
    display: block;
    width: auto;
    height: 26px;
  }

  /* ── Nav horizontale (centre) + loupe ── */
  .dol-nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0.5rem;
    min-width: 0;
  }

  .dol-nav__list {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    min-width: 0;
    overflow-x: auto;
    padding: 0;
  }

  /* Loupe de recherche compacte (pas de champ) : icône blanche, hover vert plus sombre. */
  .dol-search-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--dol-radius);
    color: var(--dol-white);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    width: 2.5rem;
  }

  .dol-search-btn:hover,
  .dol-search-btn:focus-visible {
    background: var(--dol-green-hover);
    border-color: var(--dol-yellow);
    color: var(--dol-white);
    outline: none;
  }

  .dol-nav__item {
    flex: 0 0 auto;
  }

  .dol-nav__link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--dol-white);
    display: inline-flex;
    font-family: var(--dol-font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 3rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .dol-nav__link:hover,
  .dol-nav__link:focus-visible {
    background: var(--dol-green-hover);
    color: var(--dol-white);
    outline: none;
  }

  /* Onglet actif : soulignement jaune #FFE71E (l'accent de marque Dollarama). */
  .dol-nav__link[aria-current="page"] {
    border-bottom-color: var(--dol-yellow);
    color: var(--dol-white);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .dol-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .dol-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .dol-header__tools-links :global(> *) {
    padding: 0 0.625rem;
  }

  .dol-header__tools-links :global(> * + *) {
    border-left: 1px solid rgba(255, 255, 255, 0.25);
  }

  /* Overrides switchers dans header Dollarama (champs translucides blancs sur le vert). */
  .dol-header__tools-links :global(.docs-header-control) {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.35);
    border-radius: var(--dol-radius);
    color: var(--dol-white);
    font-family: inherit;
  }

  .dol-header__tools-links :global(.docs-header-control:hover),
  .dol-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--dol-green-hover);
    border-color: var(--dol-yellow);
    color: var(--dol-white);
    box-shadow: none;
  }

  /* CTA pilule jaune (accent bold amical Dollarama, encre sur jaune). */
  .dol-cta {
    align-items: center;
    background: var(--dol-yellow);
    border: 1px solid var(--dol-yellow);
    border-radius: var(--dol-radius-pill);
    color: var(--dol-ink);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--dol-font-body);
    font-size: 0.875rem;
    font-weight: 700;
    height: 2.5rem;
    letter-spacing: 0.01em;
    padding: 0 1.25rem;
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease;
    white-space: nowrap;
  }

  .dol-cta:hover,
  .dol-cta:focus-visible {
    background: var(--dol-yellow-hover);
    border-color: var(--dol-yellow-hover);
    color: var(--dol-ink);
    outline: none;
  }

  /* Burger mobile */
  .dol-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--dol-white);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Dollarama ── */
  .dol-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--dol-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Dollarama ── */
  .dol-sidebar {
    background: var(--dol-white);
    border-right: 1px solid var(--dol-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .dol-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem 0;
  }

  .dol-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--dol-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .dol-version-badge {
    background: var(--dol-subtle);
    border: 1px solid var(--dol-border);
    border-radius: var(--dol-radius);
    color: var(--dol-green);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    white-space: nowrap;
  }

  .dol-sidebar-github {
    align-items: center;
    color: var(--dol-ink);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 120ms ease;
  }

  .dol-sidebar-github:hover,
  .dol-sidebar-github:focus-visible {
    color: var(--dol-green);
  }

  .dol-side-list,
  .dol-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .dol-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    box-sizing: border-box;
    color: var(--dol-ink);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .dol-side-link:hover,
  .dol-side-link:focus-visible {
    background: var(--dol-subtle);
    color: var(--dol-green);
    text-decoration: none;
  }

  .dol-side-link[aria-current="page"] {
    background: var(--dol-subtle);
    border-left-color: var(--dol-green);
    color: var(--dol-green);
    font-weight: 700;
    text-decoration: none;
  }

  .dol-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: calc(2rem - 3px);
  }

  .dol-side-divider {
    border-top: 1px solid var(--dol-border);
    margin: 0.5rem 0;
  }

  .dol-side-group {
    display: block;
  }

  .dol-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--dol-grey);
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

  .dol-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .dol-side-group__summary:hover,
  .dol-side-group__summary:focus-visible {
    background: var(--dol-subtle);
    outline: none;
  }

  .dol-side-group :global(.dol-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .dol-side-group:not([open]) :global(.dol-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .dol-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .dol-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .dol-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .dol-breadcrumb__item {
    align-items: center;
    color: var(--dol-grey);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .dol-breadcrumb__item + .dol-breadcrumb__item::before {
    color: var(--dol-grey);
    content: "›";
    margin: 0 0.4rem;
  }

  .dol-breadcrumb__link {
    color: var(--dol-ink);
    text-decoration: none;
  }

  .dol-breadcrumb__link:hover {
    color: var(--dol-green);
    text-decoration: underline;
  }

  .dol-breadcrumb__item span[aria-current="page"] {
    color: var(--dol-ink);
    font-weight: 600;
  }

  /* ── Footer Dollarama : bande verte + liseré jaune ── */
  .dol-footer {
    background: var(--dol-green);
    border-top: 3px solid var(--dol-yellow);
    margin-top: auto;
  }

  .dol-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .dol-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .dol-footer__link {
    color: var(--dol-white);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .dol-footer__link:hover {
    color: var(--dol-yellow);
    text-decoration: underline;
  }

  .dol-footer__logo {
    display: block;
    width: auto;
    height: 26px;
    flex: 0 0 auto;
    background: var(--dol-white);
    border-radius: var(--dol-radius);
    padding: 0.3rem 0.6rem;
    box-sizing: content-box;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .dol-body {
      grid-template-columns: 1fr;
    }

    .dol-sidebar {
      display: none;
    }

    .dol-nav {
      display: none;
    }

    .dol-header__tools {
      display: none;
    }

    .dol-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .dol-nav__link,
    .dol-cta,
    .dol-search-btn,
    .dol-side-link,
    .dol-side-group :global(.dol-side-group__icon) {
      transition: none;
    }
  }
</style>

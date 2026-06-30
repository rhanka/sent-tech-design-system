<!--
  Chrome documentaire Google Gemini (gemini.google.com — assistant Gemini de Google).
  Forme fidèle à l'interface Gemini / Material : CLAIR, aéré, coins ARRONDIS.
  - Header : bandeau BLANC, fine hairline grise en bas (#dadce0), filet dégradé
    SIGNATURE Gemini (bleu → violet) tout en haut, logo OFFICIEL Gemini (sparkle
    quadrichromie + wordmark « Gemini ») à gauche, nav Google Sans au centre,
    recherche ronde Material à droite
  - Coins ARRONDIS (Material) ; item de nav actif = SOULIGNÉ bleu Google #1a73e8 ;
    item sidebar actif = PILULE bleu clair #e8f0fe + texte bleu (signature rail
    Gemini/Material)
  - Couleurs Google/Material : bleu 600 #1a73e8, bleu logo #4285f4, bleu 700 #1967d2,
    bleu 50 #e8f0fe, violet Gemini #9b72cb, encre #202124, gris 800 #3c4043,
    gris 700 #5f6368, gris 500 #9aa0a6, bordure #dadce0, surface alt #f8f9fa /
    #f1f3f4 ; dégradé signature #4285f4 → #9b72cb
  - Logo OFFICIEL Gemini 2025 (sparkle multicolore + wordmark) via
    <img src="/chrome/gemini/logo.svg"> (asset officiel, non redessiné)
  - Typo : 'Google Sans' / 'Google Sans Text' / Roboto en NOMS seulement (repli
    system-ui, aucune police réseau chargée)
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

<div class="gem-shell">
  <!-- ── HEADER Gemini ── -->
  <div class="gem-header-wrap">
    <header class="gem-header" aria-label="Google Gemini">
      <div class="gem-header__inner">
        <!-- Gauche : logo officiel Gemini -->
        <div class="gem-header__brand">
          <a href="/" class="gem-header__brand-link" aria-label="Accueil : Gemini Design System">
            <img
              src="/chrome/gemini/logo.svg"
              alt="Gemini"
              class="gem-logo"
              width="124"
              height="28"
            />
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="gem-nav" aria-label="Navigation principale">
          <ul class="gem-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="gem-nav__item">
                <a
                  class="gem-nav__link"
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
        <div class="gem-header__tools">
          <button
            type="button"
            class="gem-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="gem-header__tools-links">
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
          class="gem-header__burger"
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

  <!-- ── BODY Gemini ── -->
  <div class="gem-body">
    <!-- Sidebar -->
    <aside class="gem-sidebar" aria-label="Navigation de la documentation">
      <nav class="gem-side-nav" aria-label="Sommaire">
        <ul class="gem-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="gem-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="gem-side-divider" role="separator"></li>

          <li class="gem-side-heading">
            <a
              class="gem-side-link gem-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="gem-side-group" open={isGroupOpen(group.items)}>
                <summary class="gem-side-group__summary">
                  <ChevronDown class="gem-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="gem-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="gem-side-link gem-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="gem-side-divider" role="separator"></li>

          <li class="gem-side-heading">
            <a
              class="gem-side-link gem-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="gem-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="gem-side-group__summary">
                  <ChevronDown class="gem-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="gem-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="gem-side-link gem-side-link--sub"
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
      <div class="gem-sidebar-footer">
        <span class="gem-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="gem-sidebar-github"
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
    <div class="gem-content">
      <nav class="gem-breadcrumb" aria-label="Breadcrumb">
        <ol class="gem-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="gem-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="gem-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER Gemini ── -->
  <footer class="gem-footer" aria-label="Pied de page Gemini">
    <div class="gem-footer__inner">
      <nav class="gem-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="gem-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
      <img
        src="/chrome/gemini/logo.svg"
        alt="Gemini"
        class="gem-footer__logo"
        width="110"
        height="25"
      />
    </div>
  </footer>
</div>

<style>
  /* ── Variables Gemini / Material ── */
  .gem-shell {
    --gem-primary: #1a73e8; /* Google Blue 600 */
    --gem-primary-hover: #1967d2; /* Google Blue 700 */
    --gem-primary-bright: #4285f4; /* Google Blue logo / gradient start */
    --gem-primary-light: #e8f0fe; /* Google Blue 50 — pilule active */
    --gem-purple: #9b72cb; /* violet Gemini (fin de dégradé) */
    --gem-ink: #202124; /* Google Grey 900 — texte primaire */
    --gem-ink-2: #3c4043; /* Google Grey 800 */
    --gem-secondary: #5f6368; /* Google Grey 700 — texte secondaire */
    --gem-muted: #9aa0a6; /* Google Grey 500 */
    --gem-surface: #fff;
    --gem-surface-alt: #f8f9fa; /* Google Grey 50 */
    --gem-subtle: #f1f3f4; /* Google Grey 100 */
    --gem-border: #dadce0; /* Google Grey 300 */
    --gem-gradient: linear-gradient(90deg, #4285f4 0%, #9b72cb 100%); /* signature Gemini */
    --gem-radius: 8px; /* Material — contrôles */
    --gem-radius-lg: 12px; /* Material — cartes */
    --gem-sidebar-width: 17rem;
    font-family: 'Google Sans Text', 'Google Sans', Roboto, system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--gem-surface);
    color: var(--gem-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Gemini ── */
  .gem-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .gem-header {
    background: var(--gem-surface);
    border-bottom: 1px solid var(--gem-border);
    /* Filet dégradé signature Gemini en haut du header. */
    border-top: 3px solid transparent;
    border-image: var(--gem-gradient) 1;
  }

  .gem-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4rem;
    padding: 0.625rem 1.5rem;
  }

  .gem-header__brand {
    flex: 0 0 auto;
  }

  .gem-header__brand-link {
    align-items: center;
    display: inline-flex;
    text-decoration: none;
    transition: opacity 180ms ease;
  }

  .gem-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel Gemini (ratio préservé). */
  .gem-logo {
    display: block;
    width: auto;
    height: 28px;
  }

  /* ── Nav horizontale (centre) ── */
  .gem-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .gem-nav__list {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .gem-nav__item {
    flex: 0 0 auto;
  }

  .gem-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--gem-secondary);
    display: inline-flex;
    font-family: 'Google Sans', Roboto, sans-serif;
    font-size: 0.9375rem;
    font-weight: 500;
    gap: 0.3rem;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    text-decoration: none;
    transition: border-color 180ms ease, color 180ms ease;
    white-space: nowrap;
  }

  .gem-nav__link:hover,
  .gem-nav__link:focus-visible {
    color: var(--gem-ink);
    outline: none;
  }

  .gem-nav__link[aria-current="page"] {
    border-bottom-color: var(--gem-primary);
    color: var(--gem-primary);
    font-weight: 500;
  }

  /* ── Outils droite ── */
  .gem-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .gem-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header Gemini (Material : arrondis, hover bleu clair). */
  .gem-header__tools-links :global(.docs-header-control) {
    background: var(--gem-surface);
    border-color: var(--gem-border);
    border-radius: var(--gem-radius);
    color: var(--gem-ink);
    font-family: inherit;
  }

  .gem-header__tools-links :global(.docs-header-control:hover),
  .gem-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--gem-primary-light);
    border-color: var(--gem-primary);
    color: var(--gem-primary-hover);
    box-shadow: none;
  }

  /* Recherche Gemini : bouton loupe rond Material. */
  .gem-search__btn {
    align-items: center;
    background: var(--gem-subtle);
    border: 1px solid transparent;
    border-radius: 999px;
    color: var(--gem-secondary);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
  }

  .gem-search__btn:hover,
  .gem-search__btn:focus-visible {
    background: var(--gem-primary-light);
    border-color: var(--gem-primary);
    color: var(--gem-primary-hover);
    outline: none;
  }

  /* Burger mobile */
  .gem-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--gem-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body Gemini ── */
  .gem-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--gem-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar Gemini ── */
  .gem-sidebar {
    background: var(--gem-surface);
    border-right: 1px solid var(--gem-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4rem);
    position: sticky;
    top: 4rem;
  }

  .gem-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1rem 0.75rem;
  }

  .gem-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--gem-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .gem-version-badge {
    background: var(--gem-subtle);
    border: 1px solid var(--gem-border);
    border-radius: 999px;
    color: var(--gem-primary);
    font-size: 0.78rem;
    font-weight: 500;
    padding: 0.15rem 0.6rem;
    white-space: nowrap;
  }

  .gem-sidebar-github {
    align-items: center;
    color: var(--gem-secondary);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 180ms ease;
  }

  .gem-sidebar-github:hover,
  .gem-sidebar-github:focus-visible {
    color: var(--gem-primary);
  }

  .gem-side-list,
  .gem-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  /* Items sidebar : PILULE arrondie (signature rail Gemini/Material). */
  .gem-side-link {
    align-items: center;
    border-radius: 999px;
    box-sizing: border-box;
    color: var(--gem-ink-2);
    display: flex;
    font-size: 0.875rem;
    line-height: 1.35;
    margin: 0.0625rem 0;
    min-height: 2.5rem;
    padding: 0.5rem 1rem;
    text-decoration: none;
    transition: background 180ms ease, color 180ms ease;
  }

  .gem-side-link:hover,
  .gem-side-link:focus-visible {
    background: var(--gem-subtle);
    color: var(--gem-ink);
    text-decoration: none;
    outline: none;
  }

  .gem-side-link[aria-current="page"] {
    background: var(--gem-primary-light);
    color: var(--gem-primary-hover);
    font-weight: 500;
    text-decoration: none;
  }

  .gem-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2.25rem;
    padding-left: 1.75rem;
  }

  .gem-side-divider {
    border-top: 1px solid var(--gem-border);
    margin: 0.5rem 0.5rem;
  }

  .gem-side-group {
    display: block;
  }

  .gem-side-group__summary {
    align-items: center;
    border-radius: 999px;
    color: var(--gem-secondary);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 500;
    gap: 0.35rem;
    letter-spacing: 0.06em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 1rem;
    text-transform: uppercase;
    transition: background 180ms ease;
  }

  .gem-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .gem-side-group__summary:hover,
  .gem-side-group__summary:focus-visible {
    background: var(--gem-subtle);
    outline: none;
  }

  .gem-side-group :global(.gem-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 180ms ease;
  }

  .gem-side-group:not([open]) :global(.gem-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .gem-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .gem-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .gem-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .gem-breadcrumb__item {
    align-items: center;
    color: var(--gem-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .gem-breadcrumb__item + .gem-breadcrumb__item::before {
    color: var(--gem-muted);
    content: "›";
    margin: 0 0.4rem;
  }

  .gem-breadcrumb__link {
    color: var(--gem-primary);
    text-decoration: none;
  }

  .gem-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .gem-breadcrumb__item span[aria-current="page"] {
    color: var(--gem-ink);
    font-weight: 500;
  }

  /* ── Footer Gemini ── */
  .gem-footer {
    background: var(--gem-surface-alt);
    border-top: 1px solid var(--gem-border);
    margin-top: auto;
  }

  .gem-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .gem-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .gem-footer__link {
    color: var(--gem-secondary);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .gem-footer__link:hover {
    color: var(--gem-primary);
    text-decoration: underline;
  }

  .gem-footer__logo {
    display: block;
    width: auto;
    height: 25px;
    flex: 0 0 auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .gem-body {
      grid-template-columns: 1fr;
    }

    .gem-sidebar {
      display: none;
    }

    .gem-nav {
      display: none;
    }

    .gem-header__tools {
      display: none;
    }

    .gem-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .gem-nav__link,
    .gem-search__btn,
    .gem-side-link,
    .gem-side-group :global(.gem-side-group__icon) {
      transition: none;
    }
  }
</style>

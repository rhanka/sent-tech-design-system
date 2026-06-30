<!--
  Chrome documentaire Hugging Face (huggingface.co — « The AI community
  building the future »).
  Forme fidèle à l'en-tête du Hub : clair, amical, doucement arrondi.
  - Header : bandeau BLANC, lockup à gauche = visage emoji jaune OFFICIEL 🤗
    + wordmark « Hugging Face » en encre, nav sobre (casse normale) au centre,
    recherche arrondie à droite
  - Coins DOUX (radius 8px, rounded-lg) — signature HF ; onglet/nav actif =
    SOULIGNÉ JAUNE de marque (#ffd21e)
  - Barre latérale : item actif liseré jaune + fond jaune très clair
  - Couleurs MESURÉES (huggingface.co + huggingface.co/brand ; neutres = échelle
    Tailwind v4) : jaune marque #ffd21e, orange joue #ff9d0b, indigo interactif
    #4f39f6, encre #101828, texte secondaire #6a7282, bordure #d1d5dc,
    surface alt #f9fafb, fill subtil #f3f4f6, jaune très clair #fefce8
  - Logo OFFICIEL (vecteur, visage emoji jaune sans bordure) via
    <img src="/chrome/huggingface/logo.svg"> — asset huggingface.co/front
  - Typo : Source Sans Pro (police UI HF) — on ne référence que le NOM + repli
    système (aucune police réseau chargée)
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

<div class="hf-shell">
  <!-- ── HEADER HUGGING FACE ── -->
  <div class="hf-header-wrap">
    <header class="hf-header" aria-label="Hugging Face">
      <div class="hf-header__inner">
        <!-- Gauche : visage emoji jaune officiel + wordmark -->
        <div class="hf-header__brand">
          <a href="/" class="hf-header__brand-link" aria-label="Accueil : Hugging Face Design System">
            <img
              src="/chrome/huggingface/logo.svg"
              alt="Hugging Face"
              class="hf-logo"
              width="33"
              height="30"
            />
            <span class="hf-wordmark">Hugging Face</span>
          </a>
        </div>

        <!-- Centre : nav horizontale -->
        <nav class="hf-nav" aria-label="Navigation principale">
          <ul class="hf-nav__list">
            {#each topNavItems as item (item.href)}
              <li class="hf-nav__item">
                <a
                  class="hf-nav__link"
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
        <div class="hf-header__tools">
          <button
            type="button"
            class="hf-search__btn"
            aria-label={locale.value === "fr" ? "Rechercher" : "Search"}
            aria-haspopup="dialog"
            onclick={onSearchOpen}
          >
            <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
            <span class="hf-search__hint">{locale.value === "fr" ? "Rechercher" : "Search"}</span>
          </button>

          <!-- Switchers docs (framework / thème / langue) + comparateur -->
          <div class="hf-header__tools-links">
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
          class="hf-header__burger"
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

  <!-- ── BODY HUGGING FACE ── -->
  <div class="hf-body">
    <!-- Sidebar -->
    <aside class="hf-sidebar" aria-label="Navigation de la documentation">
      <nav class="hf-side-nav" aria-label="Sommaire">
        <ul class="hf-side-list">
          {#each foundationNavItems as item (item.href)}
            <li>
              <a
                class="hf-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="hf-side-divider" role="separator"></li>

          <li class="hf-side-heading">
            <a
              class="hf-side-link hf-side-link--heading"
              href="/components"
              aria-current={isActive("/components") ? "page" : undefined}
            >{locale.value === "fr" ? "Composants" : "Components"}</a>
          </li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="hf-side-group" open={isGroupOpen(group.items)}>
                <summary class="hf-side-group__summary">
                  <ChevronDown class="hf-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="hf-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="hf-side-link hf-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <li class="hf-side-divider" role="separator"></li>

          <li class="hf-side-heading">
            <a
              class="hf-side-link hf-side-link--heading"
              href="/views"
              aria-current={isActive("/views") ? "page" : undefined}
            >{locale.value === "fr" ? "Vues" : "Views"}</a>
          </li>

          {#each viewsGroups as group (group.label)}
            <li>
              <details class="hf-side-group" open={isViewGroupOpen(group.items)}>
                <summary class="hf-side-group__summary">
                  <ChevronDown class="hf-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="hf-side-sublist">
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="hf-side-link hf-side-link--sub"
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
      <div class="hf-sidebar-footer">
        <span class="hf-version-badge">&lt;/&gt; {DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a
            class="hf-sidebar-github"
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
    <div class="hf-content">
      <nav class="hf-breadcrumb" aria-label="Breadcrumb">
        <ol class="hf-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="hf-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="hf-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>

  <!-- ── FOOTER HUGGING FACE ── -->
  <footer class="hf-footer" aria-label="Pied de page Hugging Face">
    <div class="hf-footer__inner">
      <a href="/" class="hf-footer__brand" aria-label="Hugging Face">
        <img
          src="/chrome/huggingface/logo.svg"
          alt="Hugging Face"
          class="hf-footer__logo"
          width="29"
          height="26"
        />
        <span class="hf-footer__wordmark">Hugging Face</span>
      </a>
      <nav class="hf-footer__nav" aria-label="Liens du pied de page">
        {#each topNavItems as item (item.href)}
          <a class="hf-footer__link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
    </div>
  </footer>
</div>

<style>
  /* ── Variables Hugging Face ── */
  .hf-shell {
    --hf-yellow: #ffd21e; /* jaune marque (visage emoji) */
    --hf-yellow-hover: #e6bd1b; /* jaune marque foncé (hover) */
    --hf-yellow-soft: #fefce8; /* jaune très clair (fond actif) */
    --hf-orange: #ff9d0b; /* orange joue (accent) */
    --hf-indigo: #4f39f6; /* indigo interactif / liens / focus */
    --hf-indigo-hover: #432dd7; /* indigo foncé */
    --hf-ink: #101828; /* encre / titres (gray-900) */
    --hf-ink-2: #1e2939; /* gray-800 */
    --hf-secondary: #6a7282; /* texte secondaire (gray-500) */
    --hf-strong: #364153; /* texte fort (gray-700) */
    --hf-muted: #99a1af; /* placeholder / muted (gray-400) */
    --hf-surface: #ffffff; /* surface blanche */
    --hf-surface-alt: #f9fafb; /* gray-50 */
    --hf-subtle: #f3f4f6; /* gray-100 (fill hover) */
    --hf-border: #e5e7eb; /* gray-200 (bordure subtile) */
    --hf-border-strong: #d1d5dc; /* gray-300 (bordure par défaut) */
    --hf-focus: #4f39f6; /* anneau focus indigo */
    --hf-white: #fff;
    --hf-sidebar-width: 17rem;
    --hf-radius: 0.5rem; /* 8px — rounded-lg HF */
    --hf-radius-pill: 999px; /* pills HF */
    font-family: 'Source Sans Pro', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--hf-white);
    color: var(--hf-ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header HF ── */
  .hf-header-wrap {
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .hf-header {
    background: var(--hf-surface);
    border-bottom: 1px solid var(--hf-border);
  }

  .hf-header__inner {
    align-items: center;
    display: flex;
    gap: 1.5rem;
    margin: 0 auto;
    max-width: 82rem;
    min-height: 4rem;
    padding: 0.625rem 1.5rem;
  }

  .hf-header__brand {
    flex: 0 0 auto;
  }

  .hf-header__brand-link {
    align-items: center;
    display: inline-flex;
    gap: 0.5rem;
    text-decoration: none;
    transition: opacity 180ms ease;
  }

  .hf-header__brand-link:hover {
    opacity: 0.85;
  }

  /* Logo officiel HF (visage emoji jaune, ratio préservé). */
  .hf-logo {
    display: block;
    width: auto;
    height: 30px;
  }

  .hf-wordmark {
    color: var(--hf-ink);
    font-size: 1.0625rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1;
    white-space: nowrap;
  }

  /* ── Nav horizontale (centre) ── */
  .hf-nav {
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .hf-nav__list {
    align-items: center;
    display: flex;
    gap: 0.125rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .hf-nav__item {
    flex: 0 0 auto;
  }

  .hf-nav__link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: var(--hf-strong);
    display: inline-flex;
    font-size: 0.9375rem;
    font-weight: 600;
    gap: 0.3rem;
    min-height: 2.5rem;
    padding: 0 0.75rem;
    text-decoration: none;
    transition: border-color 180ms ease, color 180ms ease, background 180ms ease;
    white-space: nowrap;
  }

  .hf-nav__link:hover,
  .hf-nav__link:focus-visible {
    color: var(--hf-ink);
    outline: none;
  }

  .hf-nav__link[aria-current="page"] {
    border-bottom-color: var(--hf-yellow);
    color: var(--hf-ink);
    font-weight: 700;
  }

  /* ── Outils droite ── */
  .hf-header__tools {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
  }

  .hf-header__tools-links {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Overrides switchers dans header HF (controls arrondis, clairs). */
  .hf-header__tools-links :global(.docs-header-control) {
    background: var(--hf-surface);
    border-color: var(--hf-border-strong);
    border-radius: var(--hf-radius);
    color: var(--hf-ink);
    font-family: inherit;
  }

  .hf-header__tools-links :global(.docs-header-control:hover),
  .hf-header__tools-links :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--hf-subtle);
    border-color: var(--hf-indigo);
    color: var(--hf-ink);
    box-shadow: none;
  }

  /* Recherche HF : champ arrondi clair (rappel de l'input « Search models… »). */
  .hf-search__btn {
    align-items: center;
    background: var(--hf-surface-alt);
    border: 1px solid var(--hf-border-strong);
    border-radius: var(--hf-radius);
    color: var(--hf-secondary);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    gap: 0.5rem;
    height: 2.25rem;
    justify-content: center;
    padding: 0 0.875rem;
    transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
  }

  .hf-search__hint {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .hf-search__btn:hover {
    background: var(--hf-subtle);
    color: var(--hf-ink);
  }

  .hf-search__btn:focus-visible {
    border-color: var(--hf-indigo);
    outline: 3px solid color-mix(in srgb, var(--hf-focus) 35%, transparent);
    outline-offset: 1px;
  }

  /* Burger mobile */
  .hf-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--hf-ink);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body HF ── */
  .hf-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--hf-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 82rem;
    width: 100%;
  }

  /* ── Sidebar HF ── */
  .hf-sidebar {
    background: var(--hf-surface);
    border-right: 1px solid var(--hf-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-height: calc(100vh - 4rem);
    position: sticky;
    top: 4rem;
  }

  .hf-side-nav {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1rem 0.75rem;
  }

  .hf-sidebar-footer {
    align-items: center;
    border-top: 1px solid var(--hf-border);
    display: flex;
    flex: 0 0 auto;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .hf-version-badge {
    background: var(--hf-subtle);
    border: 1px solid var(--hf-border);
    border-radius: var(--hf-radius-pill);
    color: var(--hf-strong);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.15rem 0.6rem;
    white-space: nowrap;
  }

  .hf-sidebar-github {
    align-items: center;
    color: var(--hf-strong);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: 0.4rem;
    text-decoration: none;
    transition: color 180ms ease;
  }

  .hf-sidebar-github:hover,
  .hf-sidebar-github:focus-visible {
    color: var(--hf-indigo);
  }

  .hf-side-list,
  .hf-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .hf-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    border-radius: var(--hf-radius);
    box-sizing: border-box;
    color: var(--hf-strong);
    display: flex;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.35;
    min-height: 2.25rem;
    padding: 0.4rem 0.75rem 0.4rem calc(0.75rem - 3px);
    text-decoration: none;
    transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
  }

  .hf-side-link:hover,
  .hf-side-link:focus-visible {
    background: var(--hf-subtle);
    color: var(--hf-ink);
    text-decoration: none;
  }

  .hf-side-link[aria-current="page"] {
    background: var(--hf-yellow-soft);
    border-left-color: var(--hf-yellow);
    color: var(--hf-ink);
    font-weight: 700;
    text-decoration: none;
  }

  .hf-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2rem;
    padding-left: calc(1.75rem - 3px);
  }

  .hf-side-divider {
    border-top: 1px solid var(--hf-border);
    margin: 0.5rem 0.25rem;
  }

  .hf-side-group {
    display: block;
  }

  .hf-side-group__summary {
    align-items: center;
    border-radius: var(--hf-radius);
    color: var(--hf-secondary);
    cursor: pointer;
    display: flex;
    font-size: 0.72rem;
    font-weight: 700;
    gap: 0.35rem;
    letter-spacing: 0.06em;
    list-style: none;
    min-height: 2.25rem;
    padding: 0 0.75rem;
    text-transform: uppercase;
    transition: background 180ms ease;
  }

  .hf-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .hf-side-group__summary:hover,
  .hf-side-group__summary:focus-visible {
    background: var(--hf-subtle);
    outline: none;
  }

  .hf-side-group :global(.hf-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 180ms ease;
  }

  .hf-side-group:not([open]) :global(.hf-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu + fil d'Ariane ── */
  .hf-content {
    min-width: 0;
    padding: 1.5rem 2rem 4rem;
  }

  .hf-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .hf-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .hf-breadcrumb__item {
    align-items: center;
    color: var(--hf-secondary);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .hf-breadcrumb__item + .hf-breadcrumb__item::before {
    color: var(--hf-muted);
    content: "/";
    margin: 0 0.5rem;
  }

  .hf-breadcrumb__link {
    color: var(--hf-indigo);
    text-decoration: none;
  }

  .hf-breadcrumb__link:hover {
    text-decoration: underline;
  }

  .hf-breadcrumb__item span[aria-current="page"] {
    color: var(--hf-ink);
    font-weight: 600;
  }

  /* ── Footer HF ── */
  .hf-footer {
    background: var(--hf-surface-alt);
    border-top: 1px solid var(--hf-border);
    margin-top: auto;
  }

  .hf-footer__inner {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 82rem;
    padding: 1.5rem;
  }

  .hf-footer__brand {
    align-items: center;
    display: inline-flex;
    gap: 0.5rem;
    text-decoration: none;
  }

  .hf-footer__logo {
    display: block;
    width: auto;
    height: 26px;
    flex: 0 0 auto;
  }

  .hf-footer__wordmark {
    color: var(--hf-ink);
    font-size: 0.9375rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .hf-footer__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .hf-footer__link {
    color: var(--hf-strong);
    font-size: 0.875rem;
    text-decoration: none;
  }

  .hf-footer__link:hover {
    color: var(--hf-indigo);
    text-decoration: underline;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .hf-body {
      grid-template-columns: 1fr;
    }

    .hf-sidebar {
      display: none;
    }

    .hf-nav {
      display: none;
    }

    .hf-header__tools {
      display: none;
    }

    .hf-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .hf-nav__link,
    .hf-search__btn,
    .hf-side-link,
    .hf-side-group :global(.hf-side-group__icon) {
      transition: none;
    }
  }
</style>

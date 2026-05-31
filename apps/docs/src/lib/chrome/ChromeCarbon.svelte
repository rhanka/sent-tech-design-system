<!--
  Chrome documentaire Carbon Design System (IBM)
  Forme fidèle à carbondesignsystem.com :
  - Header : barre noire pleine largeur, logo+titre à gauche, icônes loupe+grille à droite
  - Barre latérale gauche : arbre vertical, sections repliables, item actif surbrillance grise + barre accent gauche, lien GitHub icône externe
  - Typo : IBM Plex Sans (Google Fonts, chargée via <svelte:head>)
  - SSR-safe : ce composant n'est rendu que côté client (activeThemeId !== 'sent-tech')
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { page } from "$app/state";
  import { ChevronDown, Github } from "@lucide/svelte";
  import {
    DOCS_FOUNDATION_NAV,
    DOCS_TOP_NAV,
    buildComponentNavGroups,
    type ComponentNavItem
  } from "$lib/docs-navigation";

  type Props = {
    children: Snippet;
    activeThemeId: string;
    isThemeOpen: boolean;
    onThemeToggle: () => void;
    themeSwitcher: Snippet;
    localeSwitcher: Snippet;
    compareButton: Snippet;
    mobileMenuOpen: boolean;
    onMobileMenuToggle: () => void;
  };

  let {
    children,
    isThemeOpen,
    onThemeToggle,
    themeSwitcher,
    localeSwitcher,
    compareButton,
    mobileMenuOpen,
    onMobileMenuToggle,
  }: Props = $props();

  const componentGroups = buildComponentNavGroups();

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

  let sidebarOpen = $state(true);
</script>

<!-- IBM Plex Sans chargée globalement dans app.html — pas de svelte:head redondant -->

<div class="cbn-shell">
  <!-- ── HEADER Carbon ────────────────────────────────────────────────── -->
  <header class="cbn-header" aria-label="Carbon Design System">
    <div class="cbn-header__leading">
      <a class="cbn-header__brand" href="/" aria-label="Carbon Design System accueil">
        <!--
          LOGO Carbon — placeholder SVG.
          Remplacer par <img src="/chrome/carbon/logo.svg" alt="" aria-hidden="true" height="20" />
          une fois le wordmark officiel Carbon/IBM fourni.
        -->
        <svg class="cbn-header__logo-icon" viewBox="0 0 18 24" width="18" height="24" aria-hidden="true" fill="white">
          <path d="M3 22 C3 14 9 10 9 4 C13 8 15 14 11 22 Z" opacity="0.9"/>
          <path d="M9 22 C9 16 13 12 12 6 C16 10 17 16 14 22 Z" opacity="0.65"/>
        </svg>
        <span class="cbn-header__brand-text">Carbon Design System</span>
      </a>
    </div>

    <!-- Nav principale masquée sur mobile -->
    <nav class="cbn-header__nav" aria-label="Navigation principale">
      {#each DOCS_TOP_NAV.slice(0, 4) as item (item.href)}
        <a
          class="cbn-header__nav-link"
          href={item.href}
          aria-current={isActive(item.href) ? "page" : undefined}
        >{item.label}</a>
      {/each}
    </nav>

    <div class="cbn-header__actions">
      {@render compareButton()}
      {@render themeSwitcher()}
      {@render localeSwitcher()}

      <!-- Icône recherche (placeholder fonctionnel : pointe vers GitHub) -->
      <button type="button" class="cbn-header__icon-btn" aria-label="Rechercher" title="Rechercher (placeholder)">
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <circle cx="8.5" cy="8.5" r="5.5"/>
          <line x1="13" y1="13" x2="18" y2="18"/>
        </svg>
      </button>

      <!-- Icône grille 3×3 (menu produits IBM — placeholder) -->
      <button type="button" class="cbn-header__icon-btn" aria-label="Menu applications IBM" title="Applications (placeholder)">
        <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true">
          <rect x="2" y="2" width="4" height="4" rx="0.5"/>
          <rect x="8" y="2" width="4" height="4" rx="0.5"/>
          <rect x="14" y="2" width="4" height="4" rx="0.5"/>
          <rect x="2" y="8" width="4" height="4" rx="0.5"/>
          <rect x="8" y="8" width="4" height="4" rx="0.5"/>
          <rect x="14" y="8" width="4" height="4" rx="0.5"/>
          <rect x="2" y="14" width="4" height="4" rx="0.5"/>
          <rect x="8" y="14" width="4" height="4" rx="0.5"/>
          <rect x="14" y="14" width="4" height="4" rx="0.5"/>
        </svg>
      </button>

      <!-- Burger mobile -->
      <button
        type="button"
        class="cbn-header__burger"
        onclick={onMobileMenuToggle}
        aria-expanded={mobileMenuOpen}
        aria-label="Menu principal"
      >
        <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          {#if mobileMenuOpen}
            <line x1="3" y1="3" x2="17" y2="17"/>
            <line x1="17" y1="3" x2="3" y2="17"/>
          {:else}
            <line x1="2" y1="5" x2="18" y2="5"/>
            <line x1="2" y1="10" x2="18" y2="10"/>
            <line x1="2" y1="15" x2="18" y2="15"/>
          {/if}
        </svg>
      </button>
    </div>
  </header>

  <!-- ── BODY : sidebar + contenu ─────────────────────────────────────── -->
  <div class="cbn-body">
    <!-- Sidebar Carbon -->
    <aside class="cbn-sidebar" class:cbn-sidebar--open={sidebarOpen} aria-label="Navigation latérale">
      <nav class="cbn-side-nav" aria-label="Documentation Carbon">
        <ul class="cbn-side-list">
          <!-- Section Docs -->
          {#each DOCS_FOUNDATION_NAV as item (item.href)}
            <li>
              <a
                class="cbn-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <!-- Séparateur -->
          <li class="cbn-side-divider" role="separator"></li>

          <!-- Groupes composants repliables -->
          {#each componentGroups as group (group.label)}
            <li>
              <details class="cbn-side-group" open={isGroupOpen(group.items)}>
                <summary class="cbn-side-group__summary">
                  <ChevronDown class="cbn-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="cbn-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="cbn-side-link cbn-side-link--sub"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >{item.label}</a>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/each}

          <!-- Séparateur + GitHub -->
          <li class="cbn-side-divider" role="separator"></li>
          <li>
            <a
              class="cbn-side-link cbn-side-link--external"
              href="https://github.com/rhanka/sent-tech-design-system"
              target="_blank"
              rel="noreferrer"
            >
              <Github size={14} strokeWidth={2} aria-hidden="true" />
              <span>GitHub</span>
              <!-- Icône lien externe -->
              <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" class="cbn-external-icon">
                <path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7"/>
                <path d="M8 1h3v3"/>
                <line x1="11" y1="1" x2="5" y2="7"/>
              </svg>
            </a>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Contenu principal -->
    <div class="cbn-content">
      {@render children()}
    </div>
  </div>
</div>

<style>
  /* ── Variables Carbon ── */
  .cbn-shell {
    --cbn-black: #161616;
    --cbn-gray-90: #262626;
    --cbn-gray-80: #393939;
    --cbn-gray-70: #525252;
    --cbn-gray-30: #c6c6c6;
    --cbn-gray-20: #e0e0e0;
    --cbn-gray-10: #f4f4f4;
    --cbn-blue-60: #0f62fe;
    --cbn-blue-70: #0043ce;
    --cbn-white: #ffffff;
    --cbn-hover-bg: #353535;
    --cbn-active-bg: #4c4c4c;
    --cbn-sidebar-width: 16rem;
    --cbn-header-height: 3rem;
    font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif;
    background: var(--cbn-gray-10);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header ── */
  .cbn-header {
    align-items: center;
    background: var(--cbn-black);
    color: var(--cbn-white);
    display: flex;
    gap: 0;
    height: var(--cbn-header-height);
    padding: 0;
    position: sticky;
    top: 0;
    width: 100%;
    z-index: 60;
  }

  .cbn-header__leading {
    flex: 0 0 var(--cbn-sidebar-width);
    min-width: 0;
  }

  .cbn-header__brand {
    align-items: center;
    color: var(--cbn-white);
    display: inline-flex;
    gap: 0.625rem;
    height: var(--cbn-header-height);
    padding: 0 1rem;
    text-decoration: none;
    white-space: nowrap;
    transition: background 120ms ease;
  }

  .cbn-header__brand:hover,
  .cbn-header__brand:focus-visible {
    background: var(--cbn-hover-bg);
    text-decoration: none;
  }

  .cbn-header__logo-icon {
    flex: 0 0 auto;
  }

  .cbn-header__brand-text {
    font-size: 0.875rem;
    font-weight: 400;
    letter-spacing: 0.01em;
  }

  .cbn-header__nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    height: 100%;
    overflow: hidden;
  }

  .cbn-header__nav-link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--cbn-gray-30);
    display: inline-flex;
    font-size: 0.875rem;
    height: 100%;
    padding: 0 1rem;
    text-decoration: none;
    transition: color 120ms ease, border-color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .cbn-header__nav-link:hover,
  .cbn-header__nav-link:focus-visible {
    background: var(--cbn-hover-bg);
    color: var(--cbn-white);
    text-decoration: none;
  }

  .cbn-header__nav-link[aria-current="page"] {
    border-bottom-color: var(--cbn-blue-60);
    color: var(--cbn-white);
  }

  .cbn-header__actions {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0;
    height: 100%;
    padding-right: 0.25rem;
  }

  /* Overrides pour les switchers thème/locale dans ce chrome */
  .cbn-header__actions :global(.docs-theme-wrapper),
  .cbn-header__actions :global(.docs-locale-wrapper) {
    height: 100%;
    display: flex;
    align-items: center;
  }

  .cbn-header__actions :global(.docs-header-control) {
    background: transparent;
    border: none;
    border-radius: 0;
    color: var(--cbn-gray-30);
    font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif;
    height: 100%;
    transition: background 120ms ease, color 120ms ease;
  }

  .cbn-header__actions :global(.docs-header-control:hover),
  .cbn-header__actions :global(.docs-header-control:focus-visible),
  .cbn-header__actions :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--cbn-hover-bg);
    border: none;
    box-shadow: none;
    color: var(--cbn-white);
    outline: none;
  }

  .cbn-header__actions :global(.docs-locale-menu) {
    background: var(--cbn-gray-90);
    border: none;
    border-radius: 0;
    box-shadow: 0 4px 16px rgb(0 0 0 / 0.5);
  }

  .cbn-header__actions :global(.docs-locale-item) {
    color: var(--cbn-gray-30);
  }

  .cbn-header__actions :global(.docs-locale-item:hover) {
    background: var(--cbn-gray-80);
    color: var(--cbn-white);
  }

  .cbn-header__actions :global(.docs-locale-item.active) {
    color: var(--cbn-white);
  }

  .cbn-header__icon-btn {
    align-items: center;
    background: transparent;
    border: none;
    color: var(--cbn-gray-30);
    cursor: pointer;
    display: inline-flex;
    height: var(--cbn-header-height);
    justify-content: center;
    padding: 0;
    transition: background 120ms ease, color 120ms ease;
    width: var(--cbn-header-height);
  }

  .cbn-header__icon-btn:hover,
  .cbn-header__icon-btn:focus-visible {
    background: var(--cbn-hover-bg);
    color: var(--cbn-white);
    outline: none;
  }

  .cbn-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--cbn-white);
    cursor: pointer;
    height: var(--cbn-header-height);
    justify-content: center;
    padding: 0;
    width: var(--cbn-header-height);
  }

  /* ── Body ── */
  .cbn-body {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  /* ── Sidebar Carbon ── */
  .cbn-sidebar {
    background: var(--cbn-gray-10);
    border-right: 1px solid var(--cbn-gray-20);
    flex: 0 0 var(--cbn-sidebar-width);
    min-width: 0;
    overflow-y: auto;
    max-height: calc(100vh - var(--cbn-header-height));
    position: sticky;
    top: var(--cbn-header-height);
  }

  .cbn-side-nav {
    padding: 1rem 0;
  }

  .cbn-side-list,
  .cbn-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cbn-side-link {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--cbn-gray-70);
    display: flex;
    font-size: 0.875rem;
    gap: 0.5rem;
    min-height: 2.5rem;
    padding: 0 1rem 0 calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .cbn-side-link:hover,
  .cbn-side-link:focus-visible {
    background: var(--cbn-gray-20);
    color: var(--cbn-black);
    text-decoration: none;
  }

  .cbn-side-link[aria-current="page"] {
    background: var(--cbn-gray-20);
    border-left-color: var(--cbn-blue-60);
    color: var(--cbn-black);
    font-weight: 600;
  }

  .cbn-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2rem;
    padding-left: calc(2rem - 3px);
  }

  .cbn-side-link--external {
    color: var(--cbn-gray-70);
    gap: 0.375rem;
  }

  .cbn-external-icon {
    margin-left: auto;
    opacity: 0.6;
  }

  .cbn-side-divider {
    border-top: 1px solid var(--cbn-gray-20);
    margin: 0.5rem 0;
  }

  .cbn-side-group {
    display: block;
  }

  .cbn-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--cbn-gray-70);
    cursor: pointer;
    display: flex;
    font-size: 0.875rem;
    font-weight: 600;
    gap: 0.4rem;
    list-style: none;
    min-height: 2.5rem;
    padding: 0 1rem 0 calc(1rem - 3px);
    text-transform: uppercase;
    letter-spacing: 0.02em;
    font-size: 0.75rem;
    transition: background 120ms ease, color 120ms ease;
  }

  .cbn-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .cbn-side-group__summary:hover,
  .cbn-side-group__summary:focus-visible {
    background: var(--cbn-gray-20);
    color: var(--cbn-black);
    outline: none;
  }

  .cbn-side-group :global(.cbn-side-group__icon) {
    flex: 0 0 auto;
    color: var(--cbn-gray-70);
    transition: transform 120ms ease;
  }

  .cbn-side-group:not([open]) :global(.cbn-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu ── */
  .cbn-content {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .cbn-header__nav {
      display: none;
    }

    .cbn-header__burger {
      display: inline-flex;
    }

    .cbn-header__leading {
      flex: 1;
    }

    .cbn-sidebar {
      display: none;
      flex: 0 0 100%;
      position: fixed;
      top: var(--cbn-header-height);
      left: 0;
      height: calc(100vh - var(--cbn-header-height));
      z-index: 50;
    }

    .cbn-sidebar--open {
      display: block;
    }

    .cbn-body {
      flex-direction: column;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .cbn-header__brand,
    .cbn-header__nav-link,
    .cbn-header__icon-btn,
    .cbn-side-link,
    .cbn-side-group :global(.cbn-side-group__icon) {
      transition: none;
    }
  }
</style>

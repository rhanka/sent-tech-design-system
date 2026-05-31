<!--
  Chrome documentaire Airbus Design System
  Placeholder propre — forme à affiner avec le kit de référence Codex (branche codex-airbus-full).
  Structure : header fond blanc (#fff), logo Airbus gauche (SVG placeholder), titre, actions droite.
  Sidebar : items simples, item actif surbrillance bleu Airbus + barre accent.
  Typo : Airbus utilise une typo propriétaire ; Arial/sans-serif en fallback.

  POINT DE REMPLACEMENT LOGO : /chrome/airbus/logo.svg
  (à remplacer par le SVG officiel Airbus une fois le kit livré par Codex)
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { page } from "$app/state";
  import { ChevronDown, Github } from "@lucide/svelte";
  import {
    DOCS_FOUNDATION_NAV,
    DOCS_TOP_NAV,
    buildComponentNavGroups,
    resolveBreadcrumb,
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
    themeSwitcher,
    localeSwitcher,
    compareButton,
    mobileMenuOpen,
    onMobileMenuToggle,
  }: Props = $props();

  const componentGroups = buildComponentNavGroups();
  const breadcrumbs = $derived(resolveBreadcrumb(page.url.pathname));

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

<div class="abus-shell">
  <!-- ── HEADER Airbus ── -->
  <header class="abus-header" aria-label="Airbus Design System">
    <div class="abus-header__inner">
      <div class="abus-header__leading">
        <a class="abus-header__brand" href="/" aria-label="Airbus Design System accueil">
          <!--
            LOGO Airbus — POINT DE REMPLACEMENT
            Remplacer par : <img src="/chrome/airbus/logo.svg" alt="" aria-hidden="true" height="32" />
            une fois le SVG officiel Airbus fourni par le kit Codex (branche codex-airbus-full).
          -->
          <span class="abus-logo-placeholder" aria-hidden="true">
            <svg viewBox="0 0 48 20" width="48" height="20" fill="none" aria-hidden="true">
              <!-- Silhouette avion Airbus stylisée -->
              <path d="M2 14 L14 4 L26 14 L22 14 L14 7 L6 14 Z" fill="#00205B"/>
              <path d="M8 14 L8 18 L11 16 Z" fill="#00205B"/>
              <path d="M17 14 L17 18 L20 16 Z" fill="#00205B"/>
            </svg>
          </span>
          <span class="abus-brand-text">
            <span class="abus-brand-name">AIRBUS</span>
            <span class="abus-brand-sub">Design System</span>
          </span>
        </a>
      </div>

      <nav class="abus-header__nav" aria-label="Navigation principale">
        {#each DOCS_TOP_NAV.slice(0, 5) as item (item.href)}
          <a
            class="abus-header__nav-link"
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
          >{item.label}</a>
        {/each}
      </nav>

      <div class="abus-header__actions">
        {@render compareButton()}
        {@render themeSwitcher()}
        {@render localeSwitcher()}
        <a
          class="abus-header__github"
          href="https://github.com/rhanka/sent-tech-design-system"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
        >
          <Github size={16} strokeWidth={2} aria-hidden="true" />
        </a>
        <!-- Burger mobile -->
        <button
          type="button"
          class="abus-header__burger"
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
    </div>
  </header>

  <!-- ── BODY Airbus ── -->
  <div class="abus-body">
    <!-- Sidebar -->
    <aside class="abus-sidebar" aria-label="Navigation de la documentation">
      <nav class="abus-side-nav" aria-label="Sommaire">
        <ul class="abus-side-list">
          {#each DOCS_FOUNDATION_NAV as item (item.href)}
            <li>
              <a
                class="abus-side-link"
                href={item.href}
                aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
              >{item.label}</a>
            </li>
          {/each}

          <li class="abus-side-divider" role="separator"></li>

          {#each componentGroups as group (group.label)}
            <li>
              <details class="abus-side-group" open={isGroupOpen(group.items)}>
                <summary class="abus-side-group__summary">
                  <ChevronDown class="abus-side-group__icon" size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul class="abus-side-sublist">
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="abus-side-link abus-side-link--sub"
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
    </aside>

    <!-- Contenu principal -->
    <div class="abus-content">
      <!-- Fil d'Ariane -->
      <nav class="abus-breadcrumb" aria-label="Fil d'Ariane">
        <ol class="abus-breadcrumb__list">
          {#each breadcrumbs as crumb, index (crumb.href)}
            <li class="abus-breadcrumb__item">
              {#if index === breadcrumbs.length - 1}
                <span aria-current="page">{crumb.label}</span>
              {:else}
                <a class="abus-breadcrumb__link" href={crumb.href}>{crumb.label}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>

      {@render children()}
    </div>
  </div>
</div>

<style>
  /* ── Variables Airbus ── */
  .abus-shell {
    --abus-navy: #00205B;
    --abus-blue: #1565C0;
    --abus-blue-light: #E3F2FD;
    --abus-blue-accent: #1E88E5;
    --abus-gray-100: #F7F9FB;
    --abus-gray-200: #ECEFF4;
    --abus-gray-500: #78909C;
    --abus-border: #D1D9E0;
    --abus-text: #1A2332;
    --abus-white: #ffffff;
    --abus-sidebar-width: 16.5rem;
    --abus-header-height: 4rem;
    font-family: 'Arial', 'Helvetica Neue', sans-serif; /* POINT DE REMPLACEMENT : typo propriétaire Airbus */
    background: var(--abus-gray-100);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Airbus ── */
  .abus-header {
    background: var(--abus-white);
    border-bottom: 2px solid var(--abus-navy);
    position: sticky;
    top: 0;
    z-index: 60;
  }

  .abus-header__inner {
    align-items: center;
    display: flex;
    gap: 1rem;
    height: var(--abus-header-height);
    margin: 0 auto;
    max-width: 90rem;
    padding: 0 1.5rem;
  }

  .abus-header__leading {
    flex: 0 0 auto;
  }

  .abus-header__brand {
    align-items: center;
    color: var(--abus-navy);
    display: inline-flex;
    gap: 0.75rem;
    text-decoration: none;
    transition: opacity 120ms ease;
  }

  .abus-header__brand:hover {
    opacity: 0.8;
    text-decoration: none;
  }

  .abus-logo-placeholder {
    align-items: center;
    display: inline-flex;
  }

  .abus-brand-text {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .abus-brand-name {
    color: var(--abus-navy);
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    line-height: 1;
  }

  .abus-brand-sub {
    color: var(--abus-gray-500);
    font-size: 0.72rem;
    font-weight: 400;
    letter-spacing: 0.02em;
  }

  .abus-header__nav {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: 0;
    height: 100%;
    overflow: hidden;
  }

  .abus-header__nav-link {
    align-items: center;
    border-bottom: 3px solid transparent;
    color: var(--abus-text);
    display: inline-flex;
    font-size: 0.875rem;
    font-weight: 500;
    height: 100%;
    padding: 0 1rem;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
    white-space: nowrap;
  }

  .abus-header__nav-link:hover,
  .abus-header__nav-link:focus-visible {
    background: var(--abus-gray-100);
    color: var(--abus-navy);
    text-decoration: none;
  }

  .abus-header__nav-link[aria-current="page"] {
    border-bottom-color: var(--abus-navy);
    color: var(--abus-navy);
    font-weight: 700;
  }

  .abus-header__actions {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.5rem;
  }

  /* Overrides switchers dans header Airbus */
  .abus-header__actions :global(.docs-header-control) {
    background: var(--abus-white);
    border-color: var(--abus-border);
    color: var(--abus-gray-500);
    font-family: inherit;
  }

  .abus-header__actions :global(.docs-header-control:hover),
  .abus-header__actions :global(.docs-header-control[aria-expanded="true"]) {
    background: var(--abus-gray-100);
    border-color: var(--abus-navy);
    color: var(--abus-navy);
    box-shadow: none;
  }

  .abus-header__github {
    align-items: center;
    background: transparent;
    border: 1px solid var(--abus-border);
    border-radius: 4px;
    color: var(--abus-gray-500);
    display: inline-flex;
    height: 2rem;
    justify-content: center;
    text-decoration: none;
    transition: border-color 120ms ease, color 120ms ease;
    width: 2rem;
  }

  .abus-header__github:hover {
    border-color: var(--abus-navy);
    color: var(--abus-navy);
  }

  .abus-header__burger {
    display: none;
    align-items: center;
    background: transparent;
    border: none;
    color: var(--abus-navy);
    cursor: pointer;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
  }

  /* ── Body ── */
  .abus-body {
    display: grid;
    flex: 1;
    grid-template-columns: var(--abus-sidebar-width) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 90rem;
    width: 100%;
  }

  /* ── Sidebar Airbus ── */
  .abus-sidebar {
    background: var(--abus-white);
    border-right: 1px solid var(--abus-border);
    min-width: 0;
  }

  .abus-side-nav {
    max-height: calc(100vh - var(--abus-header-height));
    overflow-y: auto;
    padding: 1.25rem 0;
    position: sticky;
    top: var(--abus-header-height);
  }

  .abus-side-list,
  .abus-side-sublist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .abus-side-link {
    border-left: 3px solid transparent;
    color: var(--abus-text);
    display: block;
    font-size: 0.875rem;
    min-height: 2.5rem;
    padding: 0.5rem 1rem 0.5rem calc(1rem - 3px);
    text-decoration: none;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    line-height: 1.4;
  }

  .abus-side-link:hover,
  .abus-side-link:focus-visible {
    background: var(--abus-gray-200);
    color: var(--abus-navy);
    text-decoration: none;
  }

  .abus-side-link[aria-current="page"] {
    background: var(--abus-blue-light);
    border-left-color: var(--abus-navy);
    color: var(--abus-navy);
    font-weight: 700;
  }

  .abus-side-link--sub {
    font-size: 0.8125rem;
    min-height: 2rem;
    padding-left: calc(2rem - 3px);
  }

  .abus-side-divider {
    border-top: 1px solid var(--abus-border);
    margin: 0.5rem 0;
  }

  .abus-side-group {
    display: block;
  }

  .abus-side-group__summary {
    align-items: center;
    border-left: 3px solid transparent;
    color: var(--abus-gray-500);
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

  .abus-side-group__summary::-webkit-details-marker {
    display: none;
  }

  .abus-side-group__summary:hover,
  .abus-side-group__summary:focus-visible {
    background: var(--abus-gray-200);
    outline: none;
  }

  .abus-side-group :global(.abus-side-group__icon) {
    flex: 0 0 auto;
    transition: transform 120ms ease;
  }

  .abus-side-group:not([open]) :global(.abus-side-group__icon) {
    transform: rotate(-90deg);
  }

  /* ── Contenu ── */
  .abus-content {
    min-width: 0;
    padding: 1.75rem 2.5rem 4rem;
  }

  .abus-breadcrumb {
    margin-bottom: 1.5rem;
  }

  .abus-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .abus-breadcrumb__item {
    align-items: center;
    color: var(--abus-gray-500);
    display: inline-flex;
    font-size: 0.875rem;
  }

  .abus-breadcrumb__item + .abus-breadcrumb__item::before {
    color: var(--abus-gray-500);
    content: "/";
    margin: 0 0.4rem;
  }

  .abus-breadcrumb__link {
    color: var(--abus-blue);
    text-decoration: underline;
  }

  .abus-breadcrumb__item span[aria-current="page"] {
    color: var(--abus-text);
    font-weight: 600;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .abus-body {
      grid-template-columns: 1fr;
    }

    .abus-sidebar {
      display: none;
    }

    .abus-header__nav {
      display: none;
    }

    .abus-header__burger {
      display: inline-flex;
      margin-left: auto;
    }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .abus-header__nav-link,
    .abus-side-link,
    .abus-side-group :global(.abus-side-group__icon) {
      transition: none;
    }
  }
</style>

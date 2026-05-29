<script lang="ts">
  import { page } from "$app/state";
  import "../app.css";
  import { ChevronDown, Github, Globe, Menu, Palette, X } from "@lucide/svelte";
  import { Header } from "@sentropic/design-system-svelte";
  import {
    sentTechTheme,
    compileTheme,
    type TenantTheme
  } from "@sentropic/design-system-themes";
  import { dsfrTheme } from "@sentropic/design-system-theme-dsfr";
  import { carbonTheme } from "@sentropic/design-system-theme-carbon";
  import {
    DOCS_FOUNDATION_NAV,
    DOCS_TOP_NAV,
    DOCS_UTILITY_NAV,
    DOCS_VERSION,
    buildComponentNavGroups,
    resolveBreadcrumb,
    type ComponentNavItem
  } from "$lib/docs-navigation";
  import { locale } from "$lib/locale.svelte";

  let { children } = $props();

  const componentGroups = buildComponentNavGroups();
  const breadcrumbs = $derived(resolveBreadcrumb(page.url.pathname));

  // Thèmes proposés : le DS Sentropic de référence + les 2 mappings tiers.
  // (forge/entropic sont des tenants de démo internes — exclus du sélecteur.)
  const THEMES: TenantTheme[] = [sentTechTheme, dsfrTheme, carbonTheme];
  const THEME_STORAGE_KEY = "st-docs-theme";
  // Balise <style> du thème de base, injectée en SSR pour le premier rendu.
  // (Construite dans le script pour éviter un littéral <style> dans le markup.)
  const baseThemeStyle = `<style data-st-base-theme>${compileTheme(sentTechTheme, { selector: ":root" })}</style>`;

  let activeThemeId = $state(sentTechTheme.id);
  const activeTheme = $derived(
    THEMES.find((theme) => theme.id === activeThemeId) ?? sentTechTheme
  );

  // Restaure le thème choisi (client uniquement ; SSR rend le thème par défaut).
  $effect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && THEMES.some((theme) => theme.id === saved)) {
      activeThemeId = saved;
    }
  });

  // Applique le thème actif sur :root via un <style> géré (réactif et fiable),
  // et persiste le choix.
  $effect(() => {
    const STYLE_ID = "st-docs-active-theme";
    let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = compileTheme(activeTheme, { selector: ":root" });
    document.documentElement.setAttribute("data-st-theme", activeThemeId);
    localStorage.setItem(THEME_STORAGE_KEY, activeThemeId);
  });

  let isOpen = $state(false);
  let isThemeOpen = $state(false);
  let isMobileMenuOpen = $state(false);

  function isActive(href: string): boolean {
    const pathname = page.url.pathname;
    const hash = page.url.hash;

    if (href === "/") {
      return pathname === "/";
    }

    if (href === "/#components") {
      return pathname.startsWith("/components") || (pathname === "/" && hash === "#components");
    }

    if (href.startsWith("/#")) {
      return pathname === "/" && hash === href.slice(1);
    }

    const route = href.split("#")[0];
    return pathname === route || (route !== "/" && pathname.startsWith(route));
  }

  function isComponentActive(item: ComponentNavItem): boolean {
    return page.url.pathname === `/components/${item.slug}`;
  }

  function isSidebarDocActive(href: string): boolean {
    if (href === "/") {
      return page.url.pathname === "/" && !page.url.hash;
    }

    if (href.startsWith("/#")) {
      return page.url.pathname === "/" && page.url.hash === href.slice(1);
    }

    return isActive(href);
  }

  function isGroupOpen(items: ComponentNavItem[]): boolean {
    return items.some((item) => isComponentActive(item));
  }
</script>

<svelte:window onclick={(e) => {
  const target = e.target as Element | null;
  if (isOpen && target && !target.closest(".docs-locale-wrapper")) {
    isOpen = false;
  }
  if (isThemeOpen && target && !target.closest(".docs-theme-wrapper")) {
    isThemeOpen = false;
  }
}} onkeydown={(e) => {
  if (e.key === "Escape") {
    isOpen = false;
    isThemeOpen = false;
    isMobileMenuOpen = false;
  }
}} />

<svelte:head>
  {@html baseThemeStyle}
</svelte:head>

{#snippet docsBrand()}
  <a class="docs-brand" href="/" aria-label="Sentropic Design System">
    <img class="docs-brand-mark" src="/SENT-logo-squared.svg" alt="" aria-hidden="true" />
    <span class="docs-brand-copy">
      <span class="docs-brand-name">Sentropic</span>
      <span class="docs-brand-product">Design System</span>
    </span>
  </a>
{/snippet}

{#snippet docsTopNav()}
  <nav class="docs-top-nav" aria-label="Documentation principale">
    {#each DOCS_TOP_NAV as item (item.href)}
      <a href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
        {item.label}
      </a>
    {/each}
  </nav>
{/snippet}

{#snippet docsUtilityNav()}
  <nav class="docs-utility-nav" aria-label="Liens utiles">
    <span class="docs-header-control docs-version">{DOCS_VERSION}</span>
    {#each DOCS_UTILITY_NAV as item (item.href)}
      <a
        class="docs-header-control docs-header-menuButton docs-header-iconLink"
        href={item.href}
        rel={item.external ? "noreferrer" : undefined}
        target={item.external ? "_blank" : undefined}
        aria-label={item.label}
      >
        {#if item.label === "GitHub"}
          <Github size={16} strokeWidth={2.1} aria-hidden="true" />
        {:else}
          <span>{item.label}</span>
        {/if}
      </a>
    {/each}

    <div class="docs-theme-wrapper">
      <button
        type="button"
        class="docs-header-control docs-header-menuButton docs-locale-trigger docs-theme-trigger"
        onclick={() => (isThemeOpen = !isThemeOpen)}
        aria-expanded={isThemeOpen}
        aria-haspopup="true"
        aria-label={locale.value === "fr" ? "Changer le thème" : "Change theme"}
      >
        <Palette size={14} aria-hidden="true" />
        <span>{activeTheme.label}</span>
        <ChevronDown size={12} class="docs-locale-trigger-chevron {isThemeOpen ? 'rotated' : ''}" aria-hidden="true" />
      </button>

      {#if isThemeOpen}
        <div class="docs-locale-menu" role="menu">
          {#each THEMES as theme (theme.id)}
            <button
              type="button"
              class="docs-locale-item"
              class:active={activeThemeId === theme.id}
              role="menuitem"
              onclick={() => { activeThemeId = theme.id; isThemeOpen = false; }}
            >
              <span class="locale-check">{#if activeThemeId === theme.id}✓{/if}</span>
              <span>{theme.label}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <div class="docs-locale-wrapper">
      <button
        type="button"
        class="docs-header-control docs-header-menuButton docs-locale-trigger"
        onclick={() => (isOpen = !isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={locale.value === "fr" ? "Changer la langue" : "Change language"}
      >
        <Globe size={14} class="docs-locale-trigger-icon" aria-hidden="true" />
        <span>{locale.value.toUpperCase()}</span>
        <ChevronDown size={12} class="docs-locale-trigger-chevron {isOpen ? 'rotated' : ''}" aria-hidden="true" />
      </button>

      {#if isOpen}
        <div class="docs-locale-menu" role="menu">
          <button
            type="button"
            class="docs-locale-item"
            class:active={locale.value === "fr"}
            role="menuitem"
            onclick={() => { locale.value = "fr"; isOpen = false; }}
          >
            <span class="locale-check">{#if locale.value === "fr"}✓{/if}</span>
            <span>Français</span>
          </button>
          <button
            type="button"
            class="docs-locale-item"
            class:active={locale.value === "en"}
            role="menuitem"
            onclick={() => { locale.value = "en"; isOpen = false; }}
          >
            <span class="locale-check">{#if locale.value === "en"}✓{/if}</span>
            <span>English</span>
          </button>
        </div>
      {/if}
    </div>
  </nav>

  <button
    type="button"
    class="docs-mobile-menu-trigger"
    onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    aria-expanded={isMobileMenuOpen}
    aria-label="Menu principal"
  >
    {#if isMobileMenuOpen}
      <X size={20} />
    {:else}
      <Menu size={20} />
    {/if}
  </button>
{/snippet}

<div class="docs-shell" data-st-theme={activeThemeId}>
    <!-- Barre du haut : composant Header complet et porté (logo + navigation + actions). -->
    <Header
      class="docs-header"
      label="En-tête de la documentation Sentropic"
      logo={docsBrand}
      navigation={docsTopNav}
      actions={docsUtilityNav}
    />

    {#if isMobileMenuOpen}
      <nav class="docs-mobile-nav" aria-label="Menu mobile">
        <div class="docs-mobile-nav-section">
          <span class="docs-mobile-nav-label">Navigation</span>
          {#each DOCS_TOP_NAV as item (item.href)}
            <a
              href={item.href}
              onclick={() => (isMobileMenuOpen = false)}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {#if item.label === "GitHub"}
                <Github size={15} strokeWidth={2.1} aria-hidden="true" />
              {/if}
              <span>{item.label}</span>
            </a>
          {/each}
        </div>
        <div class="docs-mobile-nav-section">
          <span class="docs-mobile-nav-label">Liens utiles</span>
          <span class="docs-header-control docs-version docs-mobile-version">{DOCS_VERSION}</span>
          {#each DOCS_UTILITY_NAV as item (item.href)}
            <a
              href={item.href}
              onclick={() => (isMobileMenuOpen = false)}
              rel={item.external ? "noreferrer" : undefined}
              target={item.external ? "_blank" : undefined}
            >
              {item.label}
            </a>
          {/each}
          
          <span class="docs-mobile-nav-label">{locale.value === "fr" ? "Thème" : "Theme"}</span>
          <div class="docs-mobile-locale-switcher docs-mobile-theme-switcher">
            {#each THEMES as theme (theme.id)}
              <button
                type="button"
                class="docs-mobile-locale-btn"
                class:active={activeThemeId === theme.id}
                onclick={() => { activeThemeId = theme.id; isMobileMenuOpen = false; }}
              >
                {theme.label}
              </button>
            {/each}
          </div>

          <div class="docs-mobile-locale-switcher">
            <button
              type="button"
              class="docs-mobile-locale-btn"
              class:active={locale.value === "fr"}
              onclick={() => { locale.value = "fr"; isMobileMenuOpen = false; }}
            >
              Français
            </button>
            <button
              type="button"
              class="docs-mobile-locale-btn"
              class:active={locale.value === "en"}
              onclick={() => { locale.value = "en"; isMobileMenuOpen = false; }}
            >
              English
            </button>
          </div>
        </div>
      </nav>
    {/if}


    <div class="docs-body">
      <aside class="docs-sidebar">
        <nav class="docs-side-nav" aria-label="Navigation de la documentation">
          <section class="docs-side-section" aria-labelledby="docs-foundations-heading">
            <h2 id="docs-foundations-heading">Documentation</h2>
            <ul>
              {#each DOCS_FOUNDATION_NAV as item (item.href)}
                <li>
                  <a
                    class="docs-side-link docs-side-link--docs"
                    href={item.href}
                    aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              {/each}
            </ul>
          </section>

          <section class="docs-side-section" aria-labelledby="docs-components-heading">
            <h2 id="docs-components-heading">Composants</h2>
            {#each componentGroups as group (group.label)}
              <details class="docs-side-group" open={isGroupOpen(group.items)}>
                <summary>
                  <ChevronDown class="docs-side-group-icon" size={16} strokeWidth={2.25} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul>
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="docs-side-link docs-side-link--component"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >
                        <span
                          class:docs-side-status--documented={item.status === "documented"}
                          class="docs-side-status"
                          aria-hidden="true"
                        ></span>
                        <span>{item.label}</span>
                      </a>
                    </li>
                  {/each}
                </ul>
              </details>
            {/each}
          </section>
        </nav>
      </aside>

      <div class="docs-content-area">
        <nav class="docs-breadcrumb" aria-label="Fil d'Ariane">
          <ol>
            {#each breadcrumbs as crumb, index (crumb.href)}
              <li>
                {#if index === breadcrumbs.length - 1}
                  <span aria-current="page">{crumb.label}</span>
                {:else}
                  <a href={crumb.href}>{crumb.label}</a>
                {/if}
              </li>
            {/each}
          </ol>
        </nav>

        <main class="docs-main" id="main-content">
          {@render children()}
        </main>
      </div>
    </div>

    <footer class="docs-footer">
      <span>Sentropic Design System</span>
      <a href="https://github.com/rhanka/sent-tech-design-system" rel="noreferrer" target="_blank">
        GitHub
      </a>
    </footer>
  </div>

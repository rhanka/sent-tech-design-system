<script lang="ts">
  import { page } from "$app/state";
  import "../app.css";
  import { ChevronDown, ExternalLink } from "@lucide/svelte";
  import { ThemeProvider } from "@sentropic/design-system-svelte";
  import { sentTechTheme } from "@sentropic/design-system-themes";
  import {
    DOCS_FOUNDATION_NAV,
    DOCS_TOP_NAV,
    DOCS_UTILITY_NAV,
    DOCS_VERSION,
    buildComponentNavGroups,
    resolveBreadcrumb,
    type ComponentNavItem
  } from "$lib/docs-navigation";

  let { children } = $props();

  const componentGroups = buildComponentNavGroups();
  const breadcrumbs = $derived(resolveBreadcrumb(page.url.pathname));

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
      return pathname === "/" && (hash === href.slice(1) || (!hash && href === "/#foundations"));
    }

    const route = href.split("#")[0];
    return pathname === route || (route !== "/" && pathname.startsWith(route));
  }

  function isComponentActive(item: ComponentNavItem): boolean {
    return page.url.pathname === `/components/${item.slug}`;
  }
</script>

<ThemeProvider theme={sentTechTheme}>
  <div class="docs-shell">
    <header class="docs-header">
      <a class="docs-brand" href="/" aria-label="Sent Tech Design System">
        <span class="docs-brand-mark" aria-hidden="true">ST</span>
        <span class="docs-brand-copy">
          <span class="docs-brand-name">SENT-tech</span>
          <span class="docs-brand-product">Design System</span>
        </span>
      </a>

      <nav class="docs-top-nav" aria-label="Documentation principale">
        {#each DOCS_TOP_NAV as item (item.href)}
          <a href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
            {item.label}
          </a>
        {/each}
      </nav>

      <nav class="docs-utility-nav" aria-label="Liens utiles">
        <span class="docs-version">{DOCS_VERSION}</span>
        {#each DOCS_UTILITY_NAV as item (item.href)}
          <a href={item.href} rel={item.external ? "noreferrer" : undefined} target={item.external ? "_blank" : undefined}>
            {item.label}
            {#if item.external}
              <ExternalLink class="docs-link-icon" size={14} strokeWidth={2.25} aria-hidden="true" />
            {/if}
          </a>
        {/each}
      </nav>
    </header>

    <div class="docs-body">
      <aside class="docs-sidebar">
        <nav class="docs-side-nav" aria-label="Navigation de la documentation">
          <section class="docs-side-section" aria-labelledby="docs-foundations-heading">
            <h2 id="docs-foundations-heading">Documentation</h2>
            <ul>
              {#each DOCS_FOUNDATION_NAV as item (item.href)}
                <li>
                  <a href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
                    {item.label}
                  </a>
                </li>
              {/each}
            </ul>
          </section>

          <section class="docs-side-section" aria-labelledby="docs-components-heading">
            <h2 id="docs-components-heading">Composants</h2>
            {#each componentGroups as group (group.label)}
              <details class="docs-side-group" open>
                <summary>
                  <ChevronDown class="docs-side-group-icon" size={16} strokeWidth={2.25} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul>
                  {#each group.items as item (item.label)}
                    <li>
                      <a href={item.href} aria-current={isComponentActive(item) ? "page" : undefined}>
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
      <a href="https://github.com/rhanka/sent-tech-design-system" rel="noreferrer" target="_blank">
        github.com/rhanka/sent-tech-design-system
      </a>
      <span>Sent Tech Design System</span>
    </footer>
  </div>
</ThemeProvider>

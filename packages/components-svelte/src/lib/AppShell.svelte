<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { SiteConfig } from "./site-config";

  export type AppShellVariant = "site" | "workspace";
  export type AppShellUtilityMode = "reserve" | "overlay" | "floating";
  export type AppShellUtilitySide = "left" | "right" | "bottom";
  export type AppShellPanelCollapse = "stack" | "accordion";

  export type AppShellProps = {
    variant?: AppShellVariant;
    config?: SiteConfig;
    topChrome?: Snippet;
    primaryRail?: Snippet;
    navigationPanel?: Snippet;
    main?: Snippet;
    contextPanel?: Snippet;
    utilityPanel?: Snippet;
    bottomPanel?: Snippet;
    children?: Snippet;
    mainId?: string;
    navigationLabel?: string;
    contextLabel?: string;
    utilityLabel?: string;
    utilityMode?: AppShellUtilityMode;
    utilitySide?: AppShellUtilitySide;
    /**
     * Below the 48rem breakpoint, `"stack"` (default) keeps today's behaviour —
     * panels stack full-width in document order, always expanded. `"accordion"`
     * degrades each present panel to a keyboard-accessible disclosure (collapsed
     * by default) instead of squeezing the main content. Desktop (>48rem)
     * rendering is IDENTICAL in both modes — side panels stay side-by-side
     * columns. Panel content is mounted once regardless of mode/breakpoint;
     * collapsing hides/sizes the region rather than destroying it, so stateful
     * widgets (maps, live panels…) mounted in a panel never remount.
     */
    panelCollapse?: AppShellPanelCollapse;
    /** Disclosure label for `primaryRail` when `panelCollapse="accordion"`. */
    primaryRailLabel?: string;
    /** Disclosure label for `navigationPanel` when `panelCollapse="accordion"`. Defaults to `navigationLabel`. */
    navigationPanelLabel?: string;
    /** Disclosure label for `contextPanel` when `panelCollapse="accordion"`. Defaults to `contextLabel`. */
    contextPanelLabel?: string;
    /** Disclosure label for `utilityPanel` when `panelCollapse="accordion"`. Defaults to `utilityLabel`. */
    utilityPanelLabel?: string;
    class?: string;
  };
</script>

<script lang="ts">
  // App-shell SVELTE : COMPOSE les vrais composants du design system — zéro contrôle
  // bricolé. Triggers = DS Button / IconButton ; menus = DS MenuPopover + Menu ;
  // identité = DS IdentityMenu ; barre = DS Header. Le look vient donc des tokens DS
  // (--st-component-control-*) → pixel-cohérent avec le header de référence, et les
  // menus sont ceux du DS (fonctionnels). Piloté par `siteConfig`.
  import Header from "./Header.svelte";
  import Button from "./Button.svelte";
  import IconButton from "./IconButton.svelte";
  import MenuPopover from "./MenuPopover.svelte";
  import Menu from "./Menu.svelte";
  import { Boxes, ChevronDown, Globe, Moon, Palette, Search as SearchIcon, Sun } from "@lucide/svelte";
  import IdentityButton from "./IdentityButton.svelte";

  let {
    variant,
    config,
    topChrome,
    primaryRail,
    navigationPanel,
    main,
    contextPanel,
    utilityPanel,
    bottomPanel,
    children,
    mainId = "main",
    navigationLabel = "Workspace navigation",
    contextLabel = "Context panel",
    utilityLabel = "Utility panel",
    utilityMode = "reserve",
    utilitySide = "right",
    panelCollapse = "stack",
    primaryRailLabel = "Primary rail",
    navigationPanelLabel,
    contextPanelLabel,
    utilityPanelLabel,
    class: className
  }: AppShellProps = $props();

  // Resolved disclosure labels: default to the existing aria-label props so a
  // consumer who already customized navigationLabel/contextLabel/utilityLabel
  // doesn't need to duplicate the translation for the accordion trigger text.
  const navigationPanelLabelResolved = $derived(navigationPanelLabel ?? navigationLabel);
  const contextPanelLabelResolved = $derived(contextPanelLabel ?? contextLabel);
  const utilityPanelLabelResolved = $derived(utilityPanelLabel ?? utilityLabel);

  // Uncontrolled per-panel disclosure state (v1) — each accordion panel starts
  // collapsed. Desktop rendering never reads these (CSS scopes the collapse to
  // `@media (max-width: 48rem)`), so they have zero effect above the breakpoint.
  let primaryRailPanelOpen = $state(false);
  let navigationPanelOpen = $state(false);
  let contextPanelOpen = $state(false);
  let utilityPanelOpen = $state(false);

  const mode = $derived(variant ?? (config ? "site" : "workspace"));
  const siteConfig = $derived(config ?? ({ brand: { name: "Sentropic" }, nav: [], theming: { themes: [], theme: "" } } as SiteConfig));
  const brand = $derived(siteConfig.brand ?? { name: "Sentropic" });
  const nav = $derived(Array.isArray(siteConfig.nav) ? siteConfig.nav : []);
  const t = $derived(siteConfig.theming ?? { themes: [], theme: "" });
  const siteClasses = $derived(["st-shell", className].filter(Boolean).join(" "));
  const workspaceClasses = $derived(["st-appShell", "st-appShell--workspace", className].filter(Boolean).join(" "));

  const isActive = (item: { href: string; active?: boolean }) =>
    item.active != null
      ? item.active
      : siteConfig.activePath != null &&
        (item.href === siteConfig.activePath || (item.href !== "/" && (siteConfig.activePath ?? "").startsWith(item.href)));

  const themeItems = $derived((t.themes ?? []).map((o) => ({ label: o.label, value: o.id })));
  const fwItems = $derived((siteConfig.frameworkSwitcher?.available ?? []).map((o) => ({ label: o.label, value: o.id })));
  const localeItems = $derived((siteConfig.locale?.available ?? []).map((o) => ({ label: o.label, value: o.code })));
  const fwLabel = $derived((siteConfig.frameworkSwitcher?.available ?? []).find((o) => o.id === siteConfig.frameworkSwitcher?.current)?.label ?? "");
  const themeLabel = $derived((t.themes ?? []).find((o) => o.id === t.theme)?.label ?? "");

  // Ancrage des menus (MenuPopover veut un HTMLElement) : on bind un span tight.
  let themeEl = $state<HTMLElement | null>(null);
  let fwEl = $state<HTMLElement | null>(null);
  let localeEl = $state<HTMLElement | null>(null);
  let themeOpen = $state(false);
  let fwOpen = $state(false);
  let localeOpen = $state(false);

  function cycleColorMode() {
    const cur = t.colorMode;
    t.onColorModeChange?.(cur === "light" ? "dark" : cur === "dark" ? "auto" : "light");
  }
</script>

{#snippet logo()}
  <a class="st-shell__brand" href={brand.href ?? "/"} aria-label={brand.label ?? [brand.name, brand.productName].filter(Boolean).join(" ")}>
    {#if brand.logoSrc}<img class="st-shell__brandMark" src={brand.logoSrc} alt="" aria-hidden="true" />{/if}
    <span class="st-shell__brandCopy">
      {#if brand.name}<span class="st-shell__brandName">{brand.name}</span>{/if}
      {#if brand.productName}<span class="st-shell__brandProduct">{brand.productName}</span>{/if}
    </span>
  </a>
{/snippet}

{#snippet navigation()}
  <nav class="st-shell__nav" aria-label={siteConfig.navLabel ?? "Navigation"}>
    {#each nav as item (item.href)}
      <a class="st-shell__navLink" href={item.href} aria-current={isActive(item) ? "page" : undefined}>{item.label}</a>
    {/each}
  </nav>
{/snippet}

{#snippet actions()}
  <div class="st-shell__actions">
    {#if siteConfig.search?.enabled}
      <Button variant="secondary" size="sm" class="st-shell__search" onclick={() => siteConfig.search?.onSearch?.("")}>
        <SearchIcon size={16} strokeWidth={2.1} aria-hidden="true" />
        <span>{siteConfig.search.placeholder ?? "Rechercher…"}</span>
        <kbd class="st-shell__kbd">/</kbd>
      </Button>
    {/if}

    {#if siteConfig.frameworkSwitcher?.enabled}
      <span class="st-shell__menuWrap" bind:this={fwEl}>
        <Button variant="secondary" size="sm" class="st-shell__switch" onclick={() => (fwOpen = !fwOpen)} aria-haspopup="menu" aria-expanded={fwOpen}>
          <Boxes size={14} aria-hidden="true" /><span>{fwLabel}</span><ChevronDown size={14} aria-hidden="true" />
        </Button>
      </span>
      <MenuPopover bind:open={fwOpen} trigger={fwEl} placement="bottom-end" label="Framework">
        <Menu label="Framework" items={fwItems} onselect={(v) => { siteConfig.frameworkSwitcher?.onChange?.(v); fwOpen = false; }} />
      </MenuPopover>
    {/if}

    {#if (t.themes ?? []).length}
      <span class="st-shell__menuWrap" bind:this={themeEl}>
        <Button variant="secondary" size="sm" class="st-shell__switch" onclick={() => (themeOpen = !themeOpen)} aria-haspopup="menu" aria-expanded={themeOpen}>
          <Palette size={14} aria-hidden="true" /><span>{themeLabel}</span><ChevronDown size={14} aria-hidden="true" />
        </Button>
      </span>
      <MenuPopover bind:open={themeOpen} trigger={themeEl} placement="bottom-end" label={t.themeLabel ?? "Thème"}>
        <Menu label={t.themeLabel ?? "Thème"} items={themeItems} onselect={(v) => { t.onThemeChange?.(v); themeOpen = false; }} />
      </MenuPopover>
    {/if}

    {#if t.colorMode}
      <IconButton size="sm" variant="ghost" aria-label="Mode couleur" onclick={cycleColorMode}>
        {#if t.colorMode === "dark"}<Moon size={16} aria-hidden="true" />{:else}<Sun size={16} aria-hidden="true" />{/if}
      </IconButton>
    {/if}

    {#if siteConfig.locale}
      <span class="st-shell__menuWrap" bind:this={localeEl}>
        <Button variant="secondary" size="sm" class="st-shell__switch" onclick={() => (localeOpen = !localeOpen)} aria-haspopup="menu" aria-expanded={localeOpen}>
          <Globe size={14} aria-hidden="true" /><span>{(siteConfig.locale.current ?? "").toUpperCase()}</span><ChevronDown size={14} aria-hidden="true" />
        </Button>
      </span>
      <MenuPopover bind:open={localeOpen} trigger={localeEl} placement="bottom-end" label={siteConfig.locale.label ?? "Langue"}>
        <Menu label={siteConfig.locale.label ?? "Langue"} items={localeItems} onselect={(v) => { siteConfig.locale?.onChange?.(v); localeOpen = false; }} />
      </MenuPopover>
    {/if}

    {#if siteConfig.identity}
      <IdentityButton
        mode="icon"
        authState={siteConfig.identity.state}
        user={siteConfig.identity.user ?? null}
        signInLabel={siteConfig.identity.label ?? "Se connecter"}
        onSignIn={() => siteConfig.identity?.onSignIn?.()}
        onSignOut={() => siteConfig.identity?.onSignOut?.()}
        menu={siteConfig.identity.menu ?? []}
      />
    {/if}
  </div>
{/snippet}

{#if mode === "workspace"}
  <div
    class={workspaceClasses}
    data-st-app-shell-variant="workspace"
    data-utility-mode={utilityMode}
    data-utility-side={utilitySide}
    data-panel-collapse={panelCollapse}
  >
    {#if topChrome}
      <div class="st-appShell__topChrome">
        {@render topChrome()}
      </div>
    {/if}
    <div class="st-appShell__body">
      {#if primaryRail}
        <aside class="st-appShell__primaryRail" aria-label="Primary rail">
          {#if panelCollapse === "accordion"}
            <button
              type="button"
              class="st-appShell__panelDisclosure"
              aria-expanded={primaryRailPanelOpen}
              aria-controls="st-appShell-primaryRail-region"
              id="st-appShell-primaryRail-trigger"
              onclick={() => (primaryRailPanelOpen = !primaryRailPanelOpen)}
            >
              <span class="st-appShell__panelDisclosureLabel">{primaryRailLabel}</span>
              <span class="st-appShell__panelDisclosureIcon" class:st-appShell__panelDisclosureIcon--expanded={primaryRailPanelOpen}>
                <ChevronDown size={16} aria-hidden="true" />
              </span>
            </button>
            <div
              class="st-appShell__panelRegion"
              class:st-appShell__panelRegion--collapsed={!primaryRailPanelOpen}
              id="st-appShell-primaryRail-region"
              role="region"
              aria-labelledby="st-appShell-primaryRail-trigger"
            >
              {@render primaryRail()}
            </div>
          {:else}
            {@render primaryRail()}
          {/if}
        </aside>
      {/if}
      {#if navigationPanel}
        <aside class="st-appShell__navigationPanel" aria-label={navigationLabel}>
          {#if panelCollapse === "accordion"}
            <button
              type="button"
              class="st-appShell__panelDisclosure"
              aria-expanded={navigationPanelOpen}
              aria-controls="st-appShell-navigationPanel-region"
              id="st-appShell-navigationPanel-trigger"
              onclick={() => (navigationPanelOpen = !navigationPanelOpen)}
            >
              <span class="st-appShell__panelDisclosureLabel">{navigationPanelLabelResolved}</span>
              <span class="st-appShell__panelDisclosureIcon" class:st-appShell__panelDisclosureIcon--expanded={navigationPanelOpen}>
                <ChevronDown size={16} aria-hidden="true" />
              </span>
            </button>
            <div
              class="st-appShell__panelRegion"
              class:st-appShell__panelRegion--collapsed={!navigationPanelOpen}
              id="st-appShell-navigationPanel-region"
              role="region"
              aria-labelledby="st-appShell-navigationPanel-trigger"
            >
              {@render navigationPanel()}
            </div>
          {:else}
            {@render navigationPanel()}
          {/if}
        </aside>
      {/if}
      <main class="st-appShell__main" id={mainId}>
        {#if main}
          {@render main()}
        {:else if children}
          {@render children()}
        {/if}
      </main>
      {#if contextPanel}
        <aside class="st-appShell__contextPanel" aria-label={contextLabel}>
          {#if panelCollapse === "accordion"}
            <button
              type="button"
              class="st-appShell__panelDisclosure"
              aria-expanded={contextPanelOpen}
              aria-controls="st-appShell-contextPanel-region"
              id="st-appShell-contextPanel-trigger"
              onclick={() => (contextPanelOpen = !contextPanelOpen)}
            >
              <span class="st-appShell__panelDisclosureLabel">{contextPanelLabelResolved}</span>
              <span class="st-appShell__panelDisclosureIcon" class:st-appShell__panelDisclosureIcon--expanded={contextPanelOpen}>
                <ChevronDown size={16} aria-hidden="true" />
              </span>
            </button>
            <div
              class="st-appShell__panelRegion"
              class:st-appShell__panelRegion--collapsed={!contextPanelOpen}
              id="st-appShell-contextPanel-region"
              role="region"
              aria-labelledby="st-appShell-contextPanel-trigger"
            >
              {@render contextPanel()}
            </div>
          {:else}
            {@render contextPanel()}
          {/if}
        </aside>
      {/if}
      {#if utilityPanel}
        <aside class="st-appShell__utilityPanel" aria-label={utilityLabel}>
          {#if panelCollapse === "accordion"}
            <button
              type="button"
              class="st-appShell__panelDisclosure"
              aria-expanded={utilityPanelOpen}
              aria-controls="st-appShell-utilityPanel-region"
              id="st-appShell-utilityPanel-trigger"
              onclick={() => (utilityPanelOpen = !utilityPanelOpen)}
            >
              <span class="st-appShell__panelDisclosureLabel">{utilityPanelLabelResolved}</span>
              <span class="st-appShell__panelDisclosureIcon" class:st-appShell__panelDisclosureIcon--expanded={utilityPanelOpen}>
                <ChevronDown size={16} aria-hidden="true" />
              </span>
            </button>
            <div
              class="st-appShell__panelRegion"
              class:st-appShell__panelRegion--collapsed={!utilityPanelOpen}
              id="st-appShell-utilityPanel-region"
              role="region"
              aria-labelledby="st-appShell-utilityPanel-trigger"
            >
              {@render utilityPanel()}
            </div>
          {:else}
            {@render utilityPanel()}
          {/if}
        </aside>
      {/if}
    </div>
    {#if bottomPanel}
      <section class="st-appShell__bottomPanel" aria-label="Workspace tools">
        {@render bottomPanel()}
      </section>
    {/if}
  </div>
{:else}
  <Header class={siteClasses} label={siteConfig.brand?.label ?? "Navigation"} logo={logo} navigation={navigation} actions={actions} />
{/if}

<style>
  /* Hauteur de barre alignée sur la référence docs (80px) : le Header DS lit
     `--st-component-header-height` (défaut 3.5rem) ; on le porte à 5rem + padding 1.5rem. */
  :global(.st-shell.st-header) { --st-component-header-height: 5rem; padding-inline: var(--st-spacing-6, 1.5rem); }
  /* Style UNIQUE « bouton de contrôle » token-driven, applique a TOUS les controles
     du header (search, switchers, mode couleur, login) — fini les 3 styles divergents
     (gris secondary / ghost transparent / foncé). Fond blanc (control-background),
     bordure subtle, texte secondaire, 12px/650, 36px ; hover = control-hoverBackground. */
  :global(.st-shell .st-button),
  :global(.st-shell .st-iconButton) {
    background: var(--st-component-control-background, var(--st-semantic-surface-default, #ffffff));
    border: 1px solid var(--st-component-control-border, var(--st-semantic-border-subtle, #e2e8f0));
    color: var(--st-semantic-text-secondary);
    font-weight: 650;
    font-size: 12px;
    height: 2.25rem;
    border-radius: var(--st-radius-md, 0.375rem);
  }
  :global(.st-shell .st-iconButton) { width: 2.25rem; padding: 0; }
  :global(.st-shell .st-button:hover),
  :global(.st-shell .st-iconButton:hover) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle, #f1f5f9));
  }
  :global(.st-shell .st-button svg),
  :global(.st-shell .st-iconButton svg) { flex-shrink: 0; }
  .st-shell__brand { align-items: center; color: var(--st-semantic-text-primary); display: inline-flex; flex: 0 0 auto; gap: var(--st-spacing-3, 0.75rem); text-decoration: none; }
  .st-shell__brandMark { width: 2rem; height: 2rem; }
  .st-shell__brandCopy { display: flex; flex-direction: column; gap: 0.08rem; line-height: 1; }
  .st-shell__brandName { font-weight: 760; font-size: 1rem; }
  .st-shell__brandProduct { font-weight: 650; font-size: 0.75rem; color: var(--st-semantic-text-secondary); }
  .st-shell__nav { display: flex; align-items: center; gap: var(--st-spacing-1, 0.25rem); }
  .st-shell__navLink { color: var(--st-semantic-text-secondary); text-decoration: none; font-size: 0.875rem; line-height: 1; padding: 0.38rem 0.75rem; border-radius: var(--st-radius-md, 0.375rem); }
  .st-shell__navLink[aria-current="page"] { color: var(--st-semantic-text-primary); font-weight: 650; }
  .st-shell__actions { display: flex; align-items: center; gap: var(--st-spacing-2, 0.5rem); }
  .st-shell__menuWrap { display: inline-flex; }
  .st-shell__kbd { border: 1px solid var(--st-semantic-border-subtle); border-radius: 0.25rem; font-size: 0.6875rem; padding: 0 0.3rem; color: var(--st-semantic-text-secondary); }

  .st-appShell {
    --st-appShell-rail-width: var(--st-component-appShell-railWidth, 4.5rem);
    --st-appShell-navigation-width: var(--st-component-appShell-navigationWidth, 20rem);
    --st-appShell-context-width: var(--st-component-appShell-contextWidth, 22rem);
    --st-appShell-utility-width: var(--st-component-appShell-utilityWidth, 24rem);
    background: var(--st-component-appShell-background, var(--st-semantic-surface-default));
    color: var(--st-semantic-text-primary);
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    min-block-size: 100%;
    position: relative;
  }

  .st-appShell__topChrome {
    border-block-end: 1px solid var(--st-component-appShell-border, var(--st-semantic-border-subtle));
    min-inline-size: 0;
    z-index: var(--st-component-appShell-top-zIndex, 30);
  }

  /* The shared styles.css styles `.st-appShell--workspace` as a 4/5-column grid
     with named areas (rail/nav/main/context/utility) sized for a flat DOM. This
     component nests the panels in `__body`, so span `__body` across every
     inherited column track (`1 / -1`, row 2) — the outer grid then only stacks
     top / body / bottom, and `__body` owns the horizontal layout.
     `__body` itself is a flex row (not a fixed 5-track grid): a panel that isn't
     rendered takes no space, so a dashboard providing only `main` gets no empty
     rail/nav/context columns and `main` keeps the full width. `order` still
     drives placement; `main` flexes to fill the remainder. */
  .st-appShell__body {
    grid-column: 1 / -1;
    grid-row: 2;
    display: flex;
    flex-flow: row nowrap;
    min-block-size: 0;
    min-inline-size: 0;
    position: relative;
  }

  /* Only the bottom-utility variant needs wrapping (its utility panel uses
     flex-basis:100% to drop onto its own row below). Other variants stay on a
     single row and shrink panels to fit, matching the old minmax() grid. */
  .st-appShell[data-utility-side="bottom"] .st-appShell__body {
    flex-wrap: wrap;
  }

  .st-appShell__primaryRail {
    inline-size: var(--st-appShell-rail-width);
    order: 10;
  }

  .st-appShell__navigationPanel {
    inline-size: var(--st-appShell-navigation-width);
    order: 20;
  }

  .st-appShell__contextPanel {
    inline-size: var(--st-appShell-context-width);
    order: 40;
  }

  .st-appShell__utilityPanel {
    inline-size: var(--st-appShell-utility-width);
    order: 50;
  }

  .st-appShell__main {
    order: 30;
  }

  .st-appShell__primaryRail,
  .st-appShell__navigationPanel,
  .st-appShell__contextPanel,
  .st-appShell__utilityPanel {
    flex: 0 1 auto;
    background: var(--st-component-appShell-panelSurface, var(--st-semantic-surface-raised));
    border-color: var(--st-component-appShell-border, var(--st-semantic-border-subtle));
    min-block-size: 0;
    min-inline-size: 0;
    overflow: hidden;
  }

  .st-appShell__primaryRail,
  .st-appShell__navigationPanel {
    border-inline-end-style: solid;
    border-inline-end-width: 1px;
  }

  .st-appShell__contextPanel,
  .st-appShell__utilityPanel {
    border-inline-start-style: solid;
    border-inline-start-width: 1px;
  }

  .st-appShell[data-utility-side="left"] .st-appShell__utilityPanel {
    border-inline-end-style: solid;
    border-inline-end-width: 1px;
    border-inline-start-width: 0;
    order: 25;
  }

  .st-appShell[data-utility-side="bottom"] .st-appShell__utilityPanel {
    border-block-start: 1px solid var(--st-component-appShell-border, var(--st-semantic-border-subtle));
    border-inline-start-width: 0;
    flex-basis: 100%;
    inline-size: auto;
    order: 60;
  }

  .st-appShell__main {
    flex: 1 1 0;
    min-block-size: 0;
    min-inline-size: 0;
    overflow: auto;
  }

  .st-appShell__bottomPanel {
    background: var(--st-component-appShell-panelSurface, var(--st-semantic-surface-raised));
    border-block-start: 1px solid var(--st-component-appShell-border, var(--st-semantic-border-subtle));
    min-block-size: 0;
  }

  .st-appShell[data-utility-mode="overlay"] .st-appShell__utilityPanel,
  .st-appShell[data-utility-mode="floating"] .st-appShell__utilityPanel {
    box-shadow: var(--st-component-appShell-utilityShadow, 0 18px 45px rgb(15 23 42 / 0.18));
    max-block-size: 100%;
    position: absolute;
    z-index: var(--st-component-appShell-utility-zIndex, 40);
  }

  .st-appShell[data-utility-mode="overlay"][data-utility-side="right"] .st-appShell__utilityPanel,
  .st-appShell[data-utility-mode="floating"][data-utility-side="right"] .st-appShell__utilityPanel {
    inset-block: 0;
    inset-inline-end: 0;
  }

  .st-appShell[data-utility-mode="overlay"][data-utility-side="left"] .st-appShell__utilityPanel,
  .st-appShell[data-utility-mode="floating"][data-utility-side="left"] .st-appShell__utilityPanel {
    inset-block: 0;
    inset-inline-start: 0;
  }

  .st-appShell[data-utility-mode="overlay"][data-utility-side="bottom"] .st-appShell__utilityPanel,
  .st-appShell[data-utility-mode="floating"][data-utility-side="bottom"] .st-appShell__utilityPanel {
    block-size: var(--st-component-appShell-utilityBottomHeight, min(40%, 20rem));
    inline-size: auto;
    inset-block-end: 0;
    inset-inline: 0;
  }

  .st-appShell[data-utility-mode="floating"] .st-appShell__utilityPanel {
    border: 1px solid var(--st-component-appShell-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-radius-lg, 0.75rem);
    margin: var(--st-spacing-4, 1rem);
  }

  /* Disclosure trigger for panelCollapse="accordion". Hidden by default (this
     rule has no `@media` guard, so it also hides the button on desktop where
     accordion mode is not active) — only shown by the max-width:48rem rule
     below, and only when `data-panel-collapse="accordion"`. This keeps desktop
     rendering byte-identical in both modes. */
  .st-appShell__panelDisclosure {
    align-items: center;
    background: transparent;
    border: 0;
    color: inherit;
    cursor: pointer;
    display: none;
    font: inherit;
    font-weight: 650;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: space-between;
    padding: var(--st-spacing-3, 0.75rem) var(--st-spacing-4, 1rem);
    text-align: start;
    width: 100%;
  }

  .st-appShell__panelDisclosure:focus-visible {
    outline: 2px solid var(--st-semantic-border-focus, var(--st-semantic-brand-default, #2563eb));
    outline-offset: -2px;
  }

  .st-appShell__panelDisclosureIcon {
    display: inline-flex;
    flex-shrink: 0;
    transition: transform var(--st-motion-duration-fast, 0.15s) ease;
  }

  .st-appShell__panelDisclosureIcon--expanded {
    transform: rotate(180deg);
  }

  /* The region stays mounted at all times — it is only ever resized/hidden via
     CSS below, never removed from the DOM, so panel content (maps, live
     widgets…) never remounts when a panel collapses or expands. */
  .st-appShell__panelRegion {
    min-block-size: 0;
    min-inline-size: 0;
  }

  @media (max-width: 48rem) {
    .st-appShell__body {
      flex-flow: column nowrap;
    }

    .st-appShell__primaryRail,
    .st-appShell__navigationPanel,
    .st-appShell__contextPanel,
    .st-appShell__utilityPanel {
      border-inline: 0;
      border-block-end: 1px solid var(--st-component-appShell-border, var(--st-semantic-border-subtle));
      inline-size: auto;
      max-block-size: min(60vh, 28rem);
    }

    /* Accordion mode: the panel's own max-block-size cap is superseded by the
       region's (below) so a collapsed panel can shrink to 0 and an expanded
       one keeps the same 60vh/28rem ceiling the stack mode always had. */
    .st-appShell[data-panel-collapse="accordion"] .st-appShell__primaryRail,
    .st-appShell[data-panel-collapse="accordion"] .st-appShell__navigationPanel,
    .st-appShell[data-panel-collapse="accordion"] .st-appShell__contextPanel,
    .st-appShell[data-panel-collapse="accordion"] .st-appShell__utilityPanel {
      max-block-size: none;
    }

    .st-appShell[data-panel-collapse="accordion"] .st-appShell__panelDisclosure {
      display: flex;
    }

    .st-appShell[data-panel-collapse="accordion"] .st-appShell__panelRegion {
      max-block-size: min(60vh, 28rem);
      overflow: auto;
    }

    .st-appShell[data-panel-collapse="accordion"] .st-appShell__panelRegion--collapsed {
      block-size: 0;
      max-block-size: 0;
      overflow: hidden;
      padding-block: 0;
      visibility: hidden;
    }
  }
</style>

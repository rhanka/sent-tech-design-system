<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { SiteConfig } from "./site-config";

  export type AppShellVariant = "site" | "workspace";
  export type AppShellUtilityMode = "reserve" | "overlay" | "floating";
  export type AppShellUtilitySide = "left" | "right" | "bottom";

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
    class: className
  }: AppShellProps = $props();

  const mode = $derived(variant ?? (config ? "site" : "workspace"));
  const siteConfig = $derived(config ?? ({ brand: { name: "Sentropic" }, nav: [] } as SiteConfig));
  const brand = $derived(siteConfig.brand ?? { name: "Sentropic" });
  const nav = $derived(Array.isArray(siteConfig.nav) ? siteConfig.nav : []);
  const t = $derived(siteConfig.theming ?? { themes: [], theme: "" });
  const siteClasses = $derived(["st-shell", className].filter(Boolean).join(" "));
  const workspaceClasses = $derived(["st-appShell", className].filter(Boolean).join(" "));

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
  >
    {#if topChrome}
      <div class="st-appShell__topChrome">
        {@render topChrome()}
      </div>
    {/if}
    <div class="st-appShell__body">
      {#if primaryRail}
        <aside class="st-appShell__primaryRail" aria-label="Primary rail">
          {@render primaryRail()}
        </aside>
      {/if}
      {#if navigationPanel}
        <aside class="st-appShell__navigationPanel" aria-label={navigationLabel}>
          {@render navigationPanel()}
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
          {@render contextPanel()}
        </aside>
      {/if}
      {#if utilityPanel}
        <aside class="st-appShell__utilityPanel" aria-label={utilityLabel}>
          {@render utilityPanel()}
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
  }

  .st-appShell__topChrome {
    border-block-end: 1px solid var(--st-component-appShell-border, var(--st-semantic-border-subtle));
    min-inline-size: 0;
    z-index: var(--st-component-appShell-top-zIndex, 30);
  }

  .st-appShell__body {
    display: grid;
    grid-template-columns:
      minmax(0, auto)
      minmax(0, auto)
      minmax(0, 1fr)
      minmax(0, auto)
      minmax(0, auto);
    min-block-size: 0;
    min-inline-size: 0;
  }

  .st-appShell__primaryRail {
    inline-size: var(--st-appShell-rail-width);
  }

  .st-appShell__navigationPanel {
    inline-size: var(--st-appShell-navigation-width);
  }

  .st-appShell__contextPanel {
    inline-size: var(--st-appShell-context-width);
  }

  .st-appShell__utilityPanel {
    inline-size: var(--st-appShell-utility-width);
  }

  .st-appShell__primaryRail,
  .st-appShell__navigationPanel,
  .st-appShell__contextPanel,
  .st-appShell__utilityPanel {
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

  .st-appShell__main {
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
    z-index: var(--st-component-appShell-utility-zIndex, 40);
  }

  @media (max-width: 48rem) {
    .st-appShell__body {
      display: flex;
      flex-direction: column;
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
  }
</style>

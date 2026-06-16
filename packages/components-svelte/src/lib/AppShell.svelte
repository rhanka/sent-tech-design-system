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
  import type { SiteConfig } from "./site-config";

  let { config }: { config: SiteConfig } = $props();

  const brand = $derived(config.brand ?? { name: "Sentropic" });
  const nav = $derived(Array.isArray(config.nav) ? config.nav : []);
  const t = $derived(config.theming ?? { themes: [], theme: "" });

  const isActive = (item: { href: string; active?: boolean }) =>
    item.active != null
      ? item.active
      : config.activePath != null &&
        (item.href === config.activePath || (item.href !== "/" && (config.activePath ?? "").startsWith(item.href)));

  const themeItems = $derived((t.themes ?? []).map((o) => ({ label: o.label, value: o.id })));
  const fwItems = $derived((config.frameworkSwitcher?.available ?? []).map((o) => ({ label: o.label, value: o.id })));
  const localeItems = $derived((config.locale?.available ?? []).map((o) => ({ label: o.label, value: o.code })));
  const fwLabel = $derived((config.frameworkSwitcher?.available ?? []).find((o) => o.id === config.frameworkSwitcher?.current)?.label ?? "");
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
  <nav class="st-shell__nav" aria-label={config.navLabel ?? "Navigation"}>
    {#each nav as item (item.href)}
      <a class="st-shell__navLink" href={item.href} aria-current={isActive(item) ? "page" : undefined}>{item.label}</a>
    {/each}
  </nav>
{/snippet}

{#snippet actions()}
  <div class="st-shell__actions">
    {#if config.search?.enabled}
      <Button variant="secondary" size="sm" class="st-shell__search" onclick={() => config.search?.onSearch?.("")}>
        <SearchIcon size={16} strokeWidth={2.1} aria-hidden="true" />
        <span>{config.search.placeholder ?? "Rechercher…"}</span>
        <kbd class="st-shell__kbd">/</kbd>
      </Button>
    {/if}

    {#if config.frameworkSwitcher?.enabled}
      <span class="st-shell__menuWrap" bind:this={fwEl}>
        <Button variant="secondary" size="sm" class="st-shell__switch" onclick={() => (fwOpen = !fwOpen)} aria-haspopup="menu" aria-expanded={fwOpen}>
          <Boxes size={14} aria-hidden="true" /><span>{fwLabel}</span><ChevronDown size={14} aria-hidden="true" />
        </Button>
      </span>
      <MenuPopover bind:open={fwOpen} trigger={fwEl} placement="bottom-end" label="Framework">
        <Menu label="Framework" items={fwItems} onselect={(v) => { config.frameworkSwitcher?.onChange?.(v); fwOpen = false; }} />
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

    {#if config.locale}
      <span class="st-shell__menuWrap" bind:this={localeEl}>
        <Button variant="secondary" size="sm" class="st-shell__switch" onclick={() => (localeOpen = !localeOpen)} aria-haspopup="menu" aria-expanded={localeOpen}>
          <Globe size={14} aria-hidden="true" /><span>{(config.locale.current ?? "").toUpperCase()}</span><ChevronDown size={14} aria-hidden="true" />
        </Button>
      </span>
      <MenuPopover bind:open={localeOpen} trigger={localeEl} placement="bottom-end" label={config.locale.label ?? "Langue"}>
        <Menu label={config.locale.label ?? "Langue"} items={localeItems} onselect={(v) => { config.locale?.onChange?.(v); localeOpen = false; }} />
      </MenuPopover>
    {/if}

    {#if config.identity}
      <IdentityButton
        mode="icon"
        authState={config.identity.state}
        user={config.identity.user ?? null}
        signInLabel={config.identity.label ?? "Se connecter"}
        onSignIn={() => config.identity?.onSignIn?.()}
        onSignOut={() => config.identity?.onSignOut?.()}
        menu={config.identity.menu ?? []}
      />
    {/if}
  </div>
{/snippet}

<Header class="st-shell" label={config.brand?.label ?? "Navigation"} logo={logo} navigation={navigation} actions={actions} />

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
</style>

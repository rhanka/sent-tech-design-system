<script lang="ts">
  import { tick } from "svelte";
  import { Input, Menu, Modal } from "@sentropic/design-system-svelte";
  import type { TenantTheme } from "@sentropic/design-system-themes";
  import { filterThemes } from "./theme-catalog";

  let { open = $bindable(false), themes, activeThemeId, locale, onselect }: {
    open?: boolean;
    themes: TenantTheme[];
    activeThemeId: string;
    locale: "fr" | "en";
    onselect: (id: string) => void;
  } = $props();

  let query = $state("");
  let host = $state<HTMLDivElement>();
  let previousFocus: HTMLElement | null = null;
  const filtered = $derived(filterThemes(themes, query));

  $effect(() => {
    if (!open) return;
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    query = "";
    // Run after the Modal's own initial focus (its close button).
    tick().then(() => tick()).then(() => {
      if (open) host?.querySelector("input")?.focus();
    });
  });

  function close() {
    open = false;
    tick().then(() => {
      if (previousFocus?.isConnected) previousFocus.focus();
      else document.querySelector<HTMLElement>(".docs-theme-trigger")?.focus();
    });
  }

  function select(id: string) {
    onselect(id);
    close();
  }

  function searchKeydown(event: KeyboardEvent) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const items = host?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
      (event.key === "ArrowDown" ? items?.[0] : items?.[items.length - 1])?.focus();
    } else if (event.key === "Enter" && filtered.length > 0) {
      event.preventDefault();
      select(filtered[0].id);
    }
  }
</script>

<Modal {open} title={locale === "fr" ? "Changer le thème" : "Change theme"}
  closeLabel={locale === "fr" ? "Fermer" : "Close"} onclose={close}>
  <div bind:this={host}>
    <Input type="search" bind:value={query}
      label={locale === "fr" ? "Rechercher un thème" : "Search themes"}
      onkeydown={searchKeydown} />
    <p role="status">{filtered.length} / {themes.length}</p>
    <div class="theme-results">
      <Menu label={locale === "fr" ? "Thèmes" : "Themes"} dense={true}
        items={filtered.map((theme) => ({ value: theme.id, label: theme.label,
          icon: activeThemeId === theme.id ? "✓" : " " }))}
        onselect={select} />
      {#if filtered.length === 0}
        <p>{locale === "fr" ? "Aucun thème trouvé" : "No themes found"}</p>
      {/if}
    </div>
  </div>
</Modal>

<style>
  .theme-results {
    max-height: 50vh;
    overflow-y: auto;
    margin-top: var(--st-spacing-2, 0.5rem);
  }
</style>

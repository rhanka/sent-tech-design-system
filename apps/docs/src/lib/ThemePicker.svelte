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

<Modal {open} class="theme-picker-modal" title={locale === "fr" ? "Changer le thème" : "Change theme"}
  closeLabel={locale === "fr" ? "Fermer" : "Close"} onclose={close}>
  <div class="theme-picker" bind:this={host}>
    <Input type="search" bind:value={query}
      label={locale === "fr" ? "Rechercher un thème" : "Search themes"}
      onkeydown={searchKeydown} />
    <p class="theme-picker__count" role="status">{filtered.length} / {themes.length}</p>
    <div class="theme-results">
      <Menu label={locale === "fr" ? "Thèmes" : "Themes"}
        items={filtered.map((theme) => ({ value: theme.id, label: theme.label,
          icon: activeThemeId === theme.id ? "✓" : " " }))}
        onselect={select} />
      {#if filtered.length === 0}
        <p class="theme-picker__empty">{locale === "fr" ? "Aucun thème trouvé" : "No themes found"}</p>
      {/if}
    </div>
  </div>
</Modal>

<style>
  /* ── La coquille ─────────────────────────────────────────────────────────
     `.st-modal` défile EN BLOC (`overflow: auto`). Pour un sélecteur filtrable
     c'est le mauvais découpage : le titre, le champ de recherche et le compteur
     doivent rester sous les yeux pendant qu'on parcourt la liste. On rend donc
     ce modal — et lui seul, via la classe passée en prop — souple en hauteur :
     en-tête figé, corps qui se rétrécit, comme `.st-drawer` le fait déjà dans
     le design system (`grid-template-rows: auto 1fr auto` + `overflow` sur le
     seul corps). La coquille ne défile plus du tout : c'est ce qui garantit
     qu'il n'y a qu'UN ascenseur, celui de `.theme-results`, au lieu de plafonner
     la liste à une fraction de `vh` choisie au jugé. */
  :global(.st-modal.theme-picker-modal) {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  :global(.st-modal.theme-picker-modal > .st-modal__header) {
    flex: 0 0 auto;
  }

  :global(.st-modal.theme-picker-modal > .st-modal__body) {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
  }

  /* ── La colonne : champ, compteur, liste, tous à la même largeur ─────────
     Sans ces deux plafonds, `Input` s'arrête à 28rem et `Menu` à 18rem dans un
     dialogue large de 36rem : la liste n'occupait que la moitié gauche. Ces
     valeurs par défaut sont justes pour un formulaire et pour un menu ancré à
     un bouton — pas pour la liste qui EST le contenu du dialogue. On les lève
     ici seulement, par les tokens prévus pour ça, sans toucher au défaut que
     partagent Menu, MenuPopover et OverflowMenu. */
  .theme-picker {
    --st-component-field-maxWidth: none;
    --st-component-menu-maxWidth: none;
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: var(--st-spacing-2, 0.5rem);
    min-height: 0;
  }

  .theme-picker__count {
    color: var(--st-semantic-text-secondary);
    font-size: 0.8125rem;
    margin: 0;
  }

  /* ── L'unique zone défilante ─────────────────────────────────────────────
     Le cadre appartient au conteneur qui défile, pas au contenu : sinon la
     bordure du menu défilerait avec ses items. */
  .theme-results {
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-small, 0.375rem);
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-gutter: stable;
  }

  /* `Menu` est ici une liste posée dans un dialogue, pas un menu flottant :
     il rend sa carte (fond, bordure, ombre) et surtout son propre ascenseur —
     `max-height: 80vh; overflow-y: auto` — qui se superposait à celui de
     `.theme-results`. On lui retire les deux, dans ce sous-arbre uniquement. */
  .theme-results :global(.st-menu) {
    background: transparent;
    border: 0;
    border-radius: inherit;
    box-shadow: none;
    max-height: none;
    overflow: visible;
  }

  .theme-picker__empty {
    color: var(--st-semantic-text-secondary);
    margin: 0;
    padding: var(--st-spacing-3, 0.75rem);
  }
</style>

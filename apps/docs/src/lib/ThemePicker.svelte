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
  // Sous ce nombre de résultats, la liste est plus courte que son plancher
  // (`min-height: 7rem` ≈ 3 lignes de 37 px) : elle garde alors sa hauteur de
  // contenu, pour que le dialogue se rétracte au lieu d'afficher un cadre vide.
  const SHORT_LIST = 3;

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
    <div class="theme-results" class:theme-results--short={filtered.length < SHORT_LIST}>
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
     seul corps). Aux hauteurs usuelles, seul `.theme-results` défile.

     La coquille garde pourtant `overflow-y: auto` : c'est l'ascenseur de
     SECOURS. Quand la hauteur manque (fenêtre basse, texte agrandi à 200 %),
     la liste s'arrête à son plancher au lieu de s'écraser, et c'est le modal
     qui défile pour que tout reste atteignable. Avec `overflow: hidden`, la
     liste tombait à 1 px à 220 px de haut, et le focus clavier sur des
     éléments invisibles.

     La classe est doublée exprès : `.st-modal.theme-picker-modal` pèse (0,2,0),
     exactement comme la règle scopée du Modal (`.st-modal.svelte-…`, qui pose
     `display: grid; overflow: auto`). À égalité, c'est l'ordre des feuilles CSS
     qui tranche, donc le découpage des chunks. À (0,3,0), cette règle gagne
     quel que soit cet ordre. */
  :global(.st-modal.theme-picker-modal.theme-picker-modal) {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
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

  /* Compteur et état vide restent en `text-primary`, comme le texte du modal
     dont ils héritaient avant. En `text-secondary`, le compteur de 13 px
     tombait sous 4,5:1 sur quatre thèmes clairs (Sid Lee 3,32, SSENSE 3,54,
     SAQ 3,59, La Vie en Rose 4,0). */
  .theme-picker__count {
    color: var(--st-semantic-text-primary);
    font-size: 0.8125rem;
    margin: 0;
  }

  /* ── L'unique zone défilante ─────────────────────────────────────────────
     Le cadre appartient au conteneur qui défile, pas au contenu : sinon la
     bordure du menu défilerait avec ses items.

     Le plancher `min-height: 7rem` (≈ 3 lignes, en rem pour suivre la taille
     du texte) empêche la liste d'absorber seule le manque de hauteur. Mesuré
     sur le site construit : c'est le plus haut plancher, au rem près, qui
     laisse un seul ascenseur à 320 px de haut (paysage mobile) ; le modal ne
     prend le relais qu'en dessous de 314 px. 8rem le ferait défiler dès 320 px,
     6rem ne garderait que 2,5 lignes. */
  .theme-results {
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-small, 0.375rem);
    flex: 1 1 auto;
    min-height: 7rem;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-gutter: stable;
  }

  /* Moins de trois résultats : la liste est plus courte que le plancher. Elle
     prend sa hauteur de contenu et ne rétrécit pas ; le dialogue se rétracte
     (232 px pour un résultat) au lieu de montrer un cadre à moitié vide. */
  .theme-results--short {
    flex: 0 0 auto;
    min-height: 0;
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
    color: var(--st-semantic-text-primary);
    margin: 0;
    padding: var(--st-spacing-3, 0.75rem);
  }
</style>

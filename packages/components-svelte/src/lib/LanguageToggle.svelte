<script lang="ts" module>
  export type LanguageToggleLocale = "fr" | "en";

  // Compteur module pour un id de <select> stable, déterministe et SSR-safe.
  let languageToggleIdCounter = 0;
  function nextLanguageToggleId(): number {
    return ++languageToggleIdCounter;
  }

  export interface LanguageToggleProps {
    /** Langue courante (contrôlé). */
    locale?: LanguageToggleLocale;
    /** Notifié au changement de langue. */
    onLocaleChange?: (locale: LanguageToggleLocale) => void;
    /** Libellé FR (i18n-agnostique : fourni par le parent). */
    frLabel?: string;
    /** Libellé EN (i18n-agnostique : fourni par le parent). */
    enLabel?: string;
    /** Libellé du sélecteur (associé via <label for> + aria-label). */
    label?: string;
    /** Id du <select> ; auto-généré et stable si non fourni. */
    selectId?: string;
    /**
     * Variante d'affichage :
     * - `select` (défaut) : le <select> de la source (header desktop).
     * - `accordion` : la liste de boutons du tiroir mobile.
     */
    variant?: "select" | "accordion";
    /** Titre de la section accordéon. */
    accordionLabel?: string;
    class?: string;
  }
</script>

<script lang="ts">
  import { untrack } from "svelte";
  import { ChevronDown } from "@lucide/svelte";

  let {
    locale = "fr",
    onLocaleChange,
    frLabel = "FR",
    enLabel = "EN",
    label = "Langue",
    selectId,
    variant = "select",
    accordionLabel = "Langue",
    class: className,
  }: LanguageToggleProps = $props();

  // Capturé une seule fois (untrack) : un id stable ne doit pas réagir.
  const resolvedSelectId = untrack(
    () => selectId ?? `st-languageToggle-${nextLanguageToggleId()}`,
  );

  let open = $state(false);

  const classes = () => ["st-languageToggle", className].filter(Boolean).join(" ");

  function emit(next: LanguageToggleLocale) {
    onLocaleChange?.(next);
  }

  function onSelectChange(event: Event) {
    const value = (event.currentTarget as HTMLSelectElement).value as LanguageToggleLocale;
    emit(value);
  }
</script>

{#if variant === "accordion"}
  <div class={classes()}>
    <button
      type="button"
      class="st-languageToggle__accordionTrigger"
      aria-expanded={open}
      onclick={() => (open = !open)}
    >
      <span>{accordionLabel}</span>
      <ChevronDown
        class={`st-languageToggle__chevron${open ? " st-languageToggle__chevron--open" : ""}`}
        size={16}
        aria-hidden="true"
      />
    </button>
    {#if open}
      <div class="st-languageToggle__accordionPanel">
        <button
          type="button"
          class="st-languageToggle__option"
          class:st-languageToggle__option--active={locale === "fr"}
          aria-current={locale === "fr" ? "true" : "false"}
          onclick={() => emit("fr")}
        >
          {frLabel}
        </button>
        <button
          type="button"
          class="st-languageToggle__option"
          class:st-languageToggle__option--active={locale === "en"}
          aria-current={locale === "en" ? "true" : "false"}
          onclick={() => emit("en")}
        >
          {enLabel}
        </button>
      </div>
    {/if}
  </div>
{:else}
  <label class="st-languageToggle__srLabel" for={resolvedSelectId}>{label}</label>
  <select
    id={resolvedSelectId}
    class={`st-languageToggle__select${className ? ` ${className}` : ""}`}
    value={locale}
    aria-label={label}
    onchange={onSelectChange}
  >
    <option value="fr">{frLabel}</option>
    <option value="en">{enLabel}</option>
  </select>
{/if}

<style>
  .st-languageToggle {
    width: 100%;
  }

  /* Label associé au <select>, masqué visuellement (a11y : <label for>). */
  .st-languageToggle__srLabel {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  /* Variante <select> — calque du <select> source (header desktop). */
  .st-languageToggle__select {
    background: var(--st-semantic-surface-default);
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-md, 0.375rem);
    color: var(--st-semantic-text-primary);
    cursor: pointer;
    font: inherit;
    font-family: var(--st-font-sans);
    font-size: 0.875rem;
    padding: var(--st-spacing-1, 0.25rem) var(--st-spacing-2, 0.5rem);
  }

  .st-languageToggle__select:focus-visible {
    border-color: var(--st-semantic-border-interactive);
    box-shadow: 0 0 0 2px var(--st-semantic-border-interactive);
    outline: none;
  }

  /* Variante accordéon — calque du tiroir mobile source. */
  .st-languageToggle__accordionTrigger {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: var(--st-radius-sm, 0.375rem);
    color: var(--st-semantic-text-primary);
    cursor: pointer;
    display: flex;
    font: inherit;
    font-family: var(--st-font-sans);
    font-size: 0.875rem;
    font-weight: 500;
    justify-content: space-between;
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
    width: 100%;
  }

  .st-languageToggle__accordionTrigger:hover {
    background: var(--st-semantic-surface-subtle);
  }

  .st-languageToggle__accordionTrigger:focus-visible {
    box-shadow: 0 0 0 2px var(--st-semantic-border-interactive);
    outline: none;
  }

  .st-languageToggle :global(.st-languageToggle__chevron) {
    color: var(--st-semantic-text-secondary);
    transition: transform var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-languageToggle :global(.st-languageToggle__chevron--open) {
    transform: rotate(180deg);
  }

  .st-languageToggle__accordionPanel {
    display: grid;
    gap: var(--st-spacing-1, 0.25rem);
    padding: var(--st-spacing-1, 0.25rem) var(--st-spacing-3, 0.75rem) var(--st-spacing-2, 0.5rem);
  }

  .st-languageToggle__option {
    background: transparent;
    border: 0;
    border-radius: var(--st-radius-sm, 0.375rem);
    color: var(--st-semantic-text-secondary);
    cursor: pointer;
    font: inherit;
    font-family: var(--st-font-sans);
    font-size: 0.875rem;
    font-weight: 500;
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
    text-align: left;
    width: 100%;
  }

  .st-languageToggle__option:hover {
    background: var(--st-semantic-surface-subtle);
    color: var(--st-semantic-text-primary);
  }

  .st-languageToggle__option--active {
    background: var(--st-semantic-surface-subtle);
    color: var(--st-semantic-text-primary);
  }

  .st-languageToggle__option:focus-visible {
    box-shadow: 0 0 0 2px var(--st-semantic-border-interactive);
    outline: none;
  }
</style>

<script lang="ts" module>
  import type { Snippet } from "svelte";

  export type FilterBarProps = {
    /** Aria-label du groupe de filtres, ex "Filtres actifs". */
    label: string;
    /** Callback "tout effacer" — le bouton n'est rendu que si ce callback est fourni. */
    onClearAll?: () => void;
    /** Libellé du bouton "tout effacer". Défaut "Tout effacer". */
    clearAllLabel?: string;
    children?: Snippet;
    class?: string;
  };
</script>

<script lang="ts">
  let {
    label,
    onClearAll,
    clearAllLabel = "Tout effacer",
    children,
    class: className
  }: FilterBarProps = $props();

  const classes = $derived(
    ["st-filterBar", className].filter(Boolean).join(" ")
  );
</script>

<div class={classes} role="group" aria-label={label}>
  <div class="st-filterBar__pills">
    {@render children?.()}
  </div>
  {#if onClearAll}
    <button
      type="button"
      class="st-filterBar__clearAll"
      onclick={onClearAll}
    >
      {clearAllLabel}
    </button>
  {/if}
</div>

<style>
  .st-filterBar {
    align-items: flex-start;
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-filterBar__pills {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem);
  }

  /* Bouton "tout effacer" — variant discret (ghost-like, texte seul) */
  .st-filterBar__clearAll {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: var(--st-radius-md, 0.375rem);
    color: var(--st-semantic-text-link, #2563eb);
    cursor: var(--st-cursor-interactive, pointer);
    display: inline-flex;
    font: inherit;
    font-size: 0.8125rem;
    gap: var(--st-spacing-1, 0.25rem);
    padding: 0.3125rem var(--st-spacing-2, 0.5rem);
    transition:
      background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    white-space: nowrap;
  }

  .st-filterBar__clearAll:hover {
    background: var(--st-semantic-surface-subtle, #f8fafc);
    color: var(--st-semantic-action-primaryHover, #1d4ed8);
  }

  .st-filterBar__clearAll:focus-visible {
    outline: 2px solid var(--st-semantic-border-interactive, #2563eb);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-filterBar__clearAll {
      transition: none;
    }
  }
</style>

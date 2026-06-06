<script lang="ts" module>
  export type SelectionChipTone = "neutral" | "success" | "warning" | "error" | "info";

  export type SelectionChipProps = {
    /** Libellé de la dimension sélectionnée. */
    label: string;
    /** Nombre d'éléments sélectionnés — affiché "(N)" si fourni et Number.isFinite. */
    count?: number;
    tone?: SelectionChipTone;
    /** Callback effacement — affiche le bouton ✕ si fourni. */
    onClear?: () => void;
    disabled?: boolean;
    class?: string;
  };
</script>

<script lang="ts">
  import { X } from "@lucide/svelte";

  let {
    label,
    count,
    tone = "neutral",
    onClear,
    disabled = false,
    class: className
  }: SelectionChipProps = $props();

  const classes = $derived(
    [
      "st-selectionChip",
      `st-selectionChip--${tone}`,
      disabled ? "st-selectionChip--disabled" : null,
      className
    ]
      .filter(Boolean)
      .join(" ")
  );

  const showCount = $derived(count !== undefined && Number.isFinite(count));

  function handleClear(e: MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    onClear?.();
  }
</script>

<span class={classes} aria-disabled={disabled ? "true" : undefined}>
  <span class="st-selectionChip__label">{label}</span>
  {#if showCount}
    <span class="st-selectionChip__count" aria-label="({count})"
      >({count})</span
    >
  {/if}
  {#if onClear}
    <button
      type="button"
      class="st-selectionChip__clear"
      aria-label="Effacer {label}"
      disabled={disabled}
      onclick={handleClear}
    >
      <X size={11} strokeWidth={2.5} aria-hidden="true" />
    </button>
  {/if}
</span>

<style>
  .st-selectionChip {
    align-items: center;
    border-radius: var(--st-radius-pill, 999px);
    display: inline-flex;
    font-size: 0.75rem;
    font-weight: 600;
    gap: var(--st-spacing-1, 0.25rem);
    line-height: 1;
    padding: 0.25rem var(--st-spacing-2, 0.5rem);
  }

  /* Tone: neutral */
  .st-selectionChip--neutral {
    background: var(--st-semantic-surface-subtle, #f8fafc);
    color: var(--st-semantic-text-secondary, #475569);
  }

  /* Tone: success */
  .st-selectionChip--success {
    background: color-mix(in srgb, var(--st-semantic-feedback-success, #16a34a) 14%, white);
    color: var(--st-semantic-feedback-success, #16a34a);
  }

  /* Tone: warning */
  .st-selectionChip--warning {
    background: color-mix(in srgb, var(--st-semantic-feedback-warning, #d97706) 14%, white);
    color: var(--st-semantic-feedback-warning, #d97706);
  }

  /* Tone: error */
  .st-selectionChip--error {
    background: color-mix(in srgb, var(--st-semantic-feedback-error, #dc2626) 14%, white);
    color: var(--st-semantic-feedback-error, #dc2626);
  }

  /* Tone: info */
  .st-selectionChip--info {
    background: color-mix(in srgb, var(--st-semantic-feedback-info, #2563eb) 14%, white);
    color: var(--st-semantic-feedback-info, #2563eb);
  }

  .st-selectionChip--disabled {
    cursor: var(--st-cursor-disabled, not-allowed);
    opacity: 0.55;
  }

  .st-selectionChip__count {
    color: inherit;
    opacity: 0.75;
  }

  .st-selectionChip__clear {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: 50%;
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 1em;
    height: 1.25em;
    justify-content: center;
    line-height: 1;
    margin-inline-start: 0.0625rem;
    padding: 0;
    transition: background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: 1.25em;
  }

  .st-selectionChip__clear:hover:not(:disabled) {
    background: var(--st-semantic-surface-subtle, #f1f5f9);
  }

  .st-selectionChip__clear:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 1px;
  }

  .st-selectionChip__clear:disabled {
    cursor: var(--st-cursor-disabled, not-allowed);
  }

  @media (prefers-reduced-motion: reduce) {
    .st-selectionChip__clear {
      transition: none;
    }
  }
</style>

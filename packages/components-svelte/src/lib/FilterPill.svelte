<script lang="ts" module>
  export type FilterPillTone = "neutral" | "success" | "warning" | "error" | "info";

  export type FilterPillProps = {
    /** Nom du champ/dimension affiché à gauche. */
    field: string;
    /** Résumé de la valeur sélectionnée, ex "France, Italie" ou "> 100". */
    value: string;
    /** Opérateur optionnel affiché entre field et value, ex "=", "in", "entre". */
    operator?: string;
    /** Pilule active (aria-pressed). Défaut true. */
    active?: boolean;
    /** Affiche le bouton ✕. Défaut true. */
    removable?: boolean;
    disabled?: boolean;
    tone?: FilterPillTone;
    onClick?: () => void;
    onRemove?: () => void;
    class?: string;
  };
</script>

<script lang="ts">
  import { X } from "@lucide/svelte";

  let {
    field,
    value,
    operator,
    active = true,
    removable = true,
    disabled = false,
    tone = "neutral",
    onClick,
    onRemove,
    class: className
  }: FilterPillProps = $props();

  let bodyEl: HTMLButtonElement | null = $state(null);

  const groupClasses = $derived(
    [
      "st-filterPill",
      `st-filterPill--${tone}`,
      active ? "st-filterPill--active" : null,
      disabled ? "st-filterPill--disabled" : null,
      className
    ]
      .filter(Boolean)
      .join(" ")
  );

  // Fix #5 : transfert de focus quand le corps-bouton focalisé devient disabled.
  $effect(() => {
    if (typeof document === "undefined") return;
    if (!disabled || !bodyEl) return;
    const container = bodyEl.closest(".st-filterPill");
    if (container && container.contains(document.activeElement)) {
      // Trouver le prochain élément focusable en dehors du composant, sinon body.
      const focusable = document.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      let transferred = false;
      for (const el of Array.from(focusable)) {
        if (!container.contains(el)) {
          el.focus();
          transferred = true;
          break;
        }
      }
      if (!transferred) {
        (document.body as HTMLElement).focus();
      }
    }
  });

  function handleClick() {
    if (disabled) return;
    onClick?.();
  }

  function handleRemove() {
    if (disabled) return;
    onRemove?.();
  }

  // Suppr/Backspace sur le corps-bouton → onRemove (si removable).
  // Enter/Space sont gérés nativement par <button> → pas de double-fire.
  function handleBodyKeydown(e: KeyboardEvent) {
    if (disabled) return;
    if ((e.key === "Delete" || e.key === "Backspace") && removable) {
      e.preventDefault();
      onRemove?.();
    }
  }
</script>

<!--
  Fix #1 : conteneur <span role="group"> NON focusable + deux <button> FRÈRES.
  Plus d'imbrication role="button" avec <button> enfant.
-->
<span class={groupClasses} role="group" aria-label={`Filtre ${field}`}>
  {#if onClick}
    <button
      bind:this={bodyEl}
      type="button"
      class="st-filterPill__body"
      aria-pressed={active}
      disabled={disabled || undefined}
      onclick={handleClick}
      onkeydown={handleBodyKeydown}
    >
      <span class="st-filterPill__field">{field}</span>
      {#if operator}
        <span class="st-filterPill__operator" aria-hidden="true">{operator}</span>
      {/if}
      <span class="st-filterPill__value">{value}</span>
    </button>
  {:else}
    <span class="st-filterPill__body st-filterPill__body--static">
      <span class="st-filterPill__field">{field}</span>
      {#if operator}
        <span class="st-filterPill__operator" aria-hidden="true">{operator}</span>
      {/if}
      <span class="st-filterPill__value">{value}</span>
    </span>
  {/if}
  {#if removable}
    <button
      type="button"
      class="st-filterPill__remove"
      aria-label={`Retirer le filtre ${field}`}
      disabled={disabled || undefined}
      onclick={handleRemove}
    >
      <X size={12} strokeWidth={2.5} aria-hidden="true" />
    </button>
  {/if}
</span>

<style>
  /* Conteneur groupe — pas focusable, pas de cursor global */
  .st-filterPill {
    align-items: center;
    border-radius: var(--st-radius-pill, 999px);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 500;
    gap: 0;
    line-height: 1;
    transition:
      background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    user-select: none;
  }

  /* ---------- Tone : neutral (défaut) ---------- */
  .st-filterPill--neutral {
    background: var(--st-semantic-surface-subtle, #f8fafc);
    color: var(--st-semantic-text-secondary, #475569);
    border: 1px solid var(--st-semantic-border-interactive, #cbd5e1);
  }

  /* ---------- Tone : success ---------- */
  .st-filterPill--success {
    background: color-mix(in srgb, var(--st-semantic-feedback-success, #16a34a) 12%, white);
    color: color-mix(in oklch, var(--st-semantic-feedback-success, #16a34a) 78%, black);
    border: 1px solid color-mix(in srgb, var(--st-semantic-feedback-success, #16a34a) 40%, white);
  }

  /* ---------- Tone : warning ---------- */
  .st-filterPill--warning {
    background: color-mix(in srgb, var(--st-semantic-feedback-warning, #d97706) 12%, white);
    color: color-mix(in oklch, var(--st-semantic-feedback-warning, #d97706) 78%, black);
    border: 1px solid color-mix(in srgb, var(--st-semantic-feedback-warning, #d97706) 40%, white);
  }

  /* ---------- Tone : error ---------- */
  .st-filterPill--error {
    background: color-mix(in srgb, var(--st-semantic-feedback-error, #dc2626) 12%, white);
    color: color-mix(in oklch, var(--st-semantic-feedback-error, #dc2626) 78%, black);
    border: 1px solid color-mix(in srgb, var(--st-semantic-feedback-error, #dc2626) 40%, white);
  }

  /* ---------- Tone : info ---------- */
  .st-filterPill--info {
    background: color-mix(in srgb, var(--st-semantic-feedback-info, #2563eb) 12%, white);
    color: color-mix(in oklch, var(--st-semantic-feedback-info, #2563eb) 78%, black);
    border: 1px solid color-mix(in srgb, var(--st-semantic-feedback-info, #2563eb) 40%, white);
  }

  /* ---------- État actif — Fix #3 (contraste) + Fix #4 (tone honoré) ----------
     L'état actif renforce le tone courant avec un fond SOLIDE opaque (no transparent)
     et un texte contrasté apparié. La spécificité (0,2,0) surclasse les règles tone
     (0,1,0) — tone est toujours honoré, actif l'intensifie.
  */
  .st-filterPill--neutral.st-filterPill--active {
    background: var(
      --st-component-filterPill-activeBackground,
      color-mix(in oklch, var(--st-semantic-action-primary, #2563eb) 12%, white)
    );
    color: var(
      --st-component-filterPill-activeText,
      color-mix(in oklch, var(--st-semantic-action-primary, #2563eb) 78%, black)
    );
    border-color: color-mix(in oklch, var(--st-semantic-action-primary, #2563eb) 50%, white);
  }

  .st-filterPill--success.st-filterPill--active {
    background: color-mix(in oklch, var(--st-semantic-feedback-success, #16a34a) 78%, black);
    color: white;
    border-color: color-mix(in oklch, var(--st-semantic-feedback-success, #16a34a) 78%, black);
  }

  .st-filterPill--warning.st-filterPill--active {
    background: color-mix(in oklch, var(--st-semantic-feedback-warning, #d97706) 78%, black);
    color: white;
    border-color: color-mix(in oklch, var(--st-semantic-feedback-warning, #d97706) 78%, black);
  }

  .st-filterPill--error.st-filterPill--active {
    background: color-mix(in oklch, var(--st-semantic-feedback-error, #dc2626) 78%, black);
    color: white;
    border-color: color-mix(in oklch, var(--st-semantic-feedback-error, #dc2626) 78%, black);
  }

  .st-filterPill--info.st-filterPill--active {
    background: color-mix(in oklch, var(--st-semantic-feedback-info, #2563eb) 78%, black);
    color: white;
    border-color: color-mix(in oklch, var(--st-semantic-feedback-info, #2563eb) 78%, black);
  }

  /* Fallback moteurs sans color-mix */
  @supports not (color: color-mix(in oklch, red, blue)) {
    .st-filterPill--neutral.st-filterPill--active {
      background: var(
        --st-component-filterPill-activeBackground,
        var(--st-semantic-surface-subtle, #eef2ff)
      );
      color: var(
        --st-component-filterPill-activeText,
        var(--st-semantic-action-primary, #1d4ed8)
      );
    }
    .st-filterPill--success.st-filterPill--active {
      background: var(--st-semantic-feedback-success, #16a34a);
      color: white;
    }
    .st-filterPill--warning.st-filterPill--active {
      background: var(--st-semantic-feedback-warning, #d97706);
      color: white;
    }
    .st-filterPill--error.st-filterPill--active {
      background: var(--st-semantic-feedback-error, #dc2626);
      color: white;
    }
    .st-filterPill--info.st-filterPill--active {
      background: var(--st-semantic-feedback-info, #2563eb);
      color: white;
    }
  }

  .st-filterPill--disabled {
    cursor: var(--st-cursor-disabled, not-allowed);
    opacity: 0.55;
  }

  /* Corps bouton / span statique */
  .st-filterPill__body {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: var(--st-radius-pill, 999px) 0 0 var(--st-radius-pill, 999px);
    color: inherit;
    cursor: var(--st-cursor-interactive, pointer);
    display: inline-flex;
    font: inherit;
    gap: var(--st-spacing-1, 0.25rem);
    line-height: 1;
    padding: 0.3125rem var(--st-spacing-1, 0.25rem) 0.3125rem var(--st-spacing-2, 0.5rem);
    transition:
      background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  /* Corps statique (sans onClick) : arrondi complet si pas de ✕ */
  .st-filterPill__body--static {
    cursor: default;
    padding: 0.3125rem var(--st-spacing-2, 0.5rem);
    border-radius: var(--st-radius-pill, 999px);
  }

  /* Quand le ✕ est présent, le statique garde arrondi à gauche seulement */
  .st-filterPill:has(.st-filterPill__remove) .st-filterPill__body--static {
    border-radius: var(--st-radius-pill, 999px) 0 0 var(--st-radius-pill, 999px);
    padding-right: var(--st-spacing-1, 0.25rem);
  }

  .st-filterPill__body:not(:disabled):hover {
    opacity: 0.88;
  }

  .st-filterPill__body:focus-visible {
    outline: 2px solid var(--st-semantic-border-interactive, var(--st-semantic-action-primary, #2563eb));
    outline-offset: 2px;
    border-radius: var(--st-radius-pill, 999px);
    z-index: 1;
    position: relative;
  }

  .st-filterPill__body:disabled {
    cursor: var(--st-cursor-disabled, not-allowed);
  }

  .st-filterPill__operator {
    color: var(--st-semantic-text-muted, #64748b);
    font-size: 0.75em;
    font-style: italic;
    margin-inline: 0.125rem;
  }

  .st-filterPill__value {
    max-width: 12rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .st-filterPill__remove {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: 0 var(--st-radius-pill, 999px) var(--st-radius-pill, 999px) 0;
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    height: 100%;
    justify-content: center;
    line-height: 1;
    padding: 0.3125rem var(--st-spacing-2, 0.5rem) 0.3125rem var(--st-spacing-1, 0.25rem);
    transition: background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    min-width: 1.75rem;
  }

  .st-filterPill__remove:hover:not(:disabled) {
    background: color-mix(in srgb, currentColor 12%, transparent);
  }

  .st-filterPill__remove:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 1px;
    border-radius: var(--st-radius-pill, 999px);
    z-index: 1;
    position: relative;
  }

  .st-filterPill__remove:disabled {
    cursor: var(--st-cursor-disabled, not-allowed);
  }

  @media (prefers-reduced-motion: reduce) {
    .st-filterPill,
    .st-filterPill__body,
    .st-filterPill__remove {
      transition: none;
    }
  }
</style>

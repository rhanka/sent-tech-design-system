<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type CheckboxProps = Omit<HTMLInputAttributes, "class" | "type"> & {
    label: string;
    helperText?: string;
    invalid?: boolean;
    class?: string;
  };

  let { label, helperText, invalid = false, class: className, ...rest }: CheckboxProps = $props();
  const classes = () => ["st-choice", "st-choice--checkbox", className].filter(Boolean).join(" ");
</script>

<label class={classes()}>
  <input {...rest} class="st-choice__input" type="checkbox" aria-invalid={invalid ? "true" : undefined} />
  <span class="st-choice__content">
    <span class="st-choice__label">{label}</span>
    {#if helperText}<span class="st-choice__help">{helperText}</span>{/if}
  </span>
</label>

<style>
  .st-choice {
    align-items: start;
    color: var(--st-component-field-labelText, var(--st-semantic-text-primary));
    cursor: var(--st-cursor-interactive, pointer);
    display: inline-grid;
    gap: 0.625rem;
    grid-template-columns: auto 1fr;
  }

  .st-choice__input {
    /* Natif stylé : couleur de coche thémée + taille + focus par stratégie
       d'anatomie + états. Aucun widget custom, a11y native préservée. */
    accent-color: var(--st-component-selection-checkedBackground, var(--st-semantic-action-primary));
    cursor: inherit;
    height: 1rem;
    margin: 0.125rem 0 0;
    width: 1rem;
  }

  /* Focus = stratégie d'anatomie partagée (outline DSFR / inset Carbon / ring base). */
  .st-choice__input:focus-visible {
    outline: var(--st-component-control-anatomy-focus-outline, none);
    outline-offset: var(--st-component-control-anatomy-focus-offset, 0);
    box-shadow: var(--st-component-control-anatomy-focus-boxShadow,
      0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive)));
  }

  .st-choice:hover .st-choice__input {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-choice__input[aria-invalid="true"] {
    accent-color: var(--st-component-control-invalidBorder, var(--st-semantic-feedback-error));
    outline-color: var(--st-component-control-invalidBorder, var(--st-semantic-feedback-error));
  }

  .st-choice__input:disabled {
    cursor: var(--st-cursor-disabled, not-allowed);
    opacity: 0.55;
  }

  .st-choice:has(.st-choice__input:disabled) {
    color: var(--st-component-control-disabledText, var(--st-semantic-text-muted));
    cursor: var(--st-cursor-disabled, not-allowed);
  }

  .st-choice__content {
    display: grid;
    gap: 0.25rem;
  }

  .st-choice__label {
    /* P-D: label typography per theme (base = 15px / normal / inherited colour).
       The checked control colour + focus stay on the native input above. */
    color: var(--st-component-selection-choiceLabelColor, inherit);
    font-size: var(--st-component-selection-choiceLabelFontSize, 0.9375rem);
    line-height: var(--st-component-selection-choiceLabelLineHeight, normal);
    letter-spacing: var(--st-component-selection-choiceLabelLetterSpacing, normal);
  }

  .st-choice__help {
    color: var(--st-component-field-helpText, var(--st-semantic-text-secondary));
    font-size: 0.8125rem;
  }
</style>

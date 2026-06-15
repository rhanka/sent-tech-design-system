<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  type CheckboxProps = Omit<HTMLInputAttributes, "class" | "type"> & {
    label: string;
    helperText?: string;
    /** Secondary muted description line under the label (e.g. a filter hint). */
    description?: string;
    /** Trailing slot pushed to the row end (e.g. a count Badge). */
    trailing?: Snippet;
    invalid?: boolean;
    class?: string;
  };

  let {
    label,
    helperText,
    description,
    trailing,
    invalid = false,
    class: className,
    ...rest
  }: CheckboxProps = $props();

  const uid = $props.id();
  const descriptionId = `${uid}-description`;
  // Merge our description id with any consumer-provided aria-describedby so we
  // never clobber an existing one.
  const describedBy = () => {
    if (!description) return rest["aria-describedby"];
    return [rest["aria-describedby"], descriptionId].filter(Boolean).join(" ");
  };
  const classes = () =>
    ["st-choice", "st-choice--checkbox", description ? "st-choice--described" : null, className]
      .filter(Boolean)
      .join(" ");
</script>

<label class={classes()}>
  <input
    {...rest}
    class="st-choice__input"
    type="checkbox"
    aria-invalid={invalid ? "true" : undefined}
    aria-describedby={describedBy()}
  />
  <span class="st-choice__content">
    <span class="st-choice__label">{label}</span>
    {#if description}<span class="st-choice__description" id={descriptionId}>{description}</span>{/if}
    {#if helperText}<span class="st-choice__help">{helperText}</span>{/if}
  </span>
  {#if trailing}<span class="st-choice__trailing">{@render trailing()}</span>{/if}
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

  /* SIGNAL filter row: input + content + trailing count, content fills, trailing
     pushed to the row end. Top-aligned so the box rides the first text line when a
     secondary description wraps below the label. */
  .st-choice:has(.st-choice__trailing) {
    align-items: start;
    grid-template-columns: auto 1fr auto;
    justify-content: space-between;
    width: 100%;
  }

  .st-choice__trailing {
    align-items: center;
    align-self: start;
    display: inline-flex;
    flex: 0 0 auto;
    justify-content: flex-end;
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

  /* Secondary muted description under the label (SIGNAL filter hint). */
  .st-choice__description {
    color: var(--st-semantic-text-secondary);
    font-size: 0.8125rem;
    line-height: 1.4;
  }
</style>

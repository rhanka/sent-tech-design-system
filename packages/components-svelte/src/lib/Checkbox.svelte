<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  type CheckboxProps = Omit<HTMLInputAttributes, "class" | "type"> & {
    label: string;
    helperText?: string;
    /** Secondary muted description line under the label (e.g. a filter hint). */
    description?: string;
    /** Presentation density: compact list row or >= 48px touch card. */
    variant?: "list" | "card";
    /** Trailing slot pushed to the row end (e.g. a count Badge). */
    trailing?: Snippet;
    invalid?: boolean;
    class?: string;
  };

  let {
    label,
    helperText,
    description,
    variant = "list",
    trailing,
    invalid = false,
    class: className,
    ...rest
  }: CheckboxProps = $props();

  const uid = $props.id();
  const descriptionId = `${uid}-description`;
  const helpId = `${uid}-help`;
  // Merge our description/help ids with any consumer-provided aria-describedby
  // so we never clobber an existing one.
  const describedBy = () => {
    const ids = [
      rest["aria-describedby"],
      description ? descriptionId : null,
      helperText ? helpId : null
    ].filter(Boolean);
    return ids.length > 0 ? ids.join(" ") : undefined;
  };
  const classes = () =>
    [
      "st-choice",
      "st-choice--checkbox",
      variant === "card" ? "st-choice--card" : null,
      description ? "st-choice--described" : null,
      className
    ]
      .filter(Boolean)
      .join(" ");
</script>

<label class={classes()} data-invalid={invalid ? "true" : undefined}>
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
    {#if helperText}<span class="st-choice__help" id={helpId}>{helperText}</span>{/if}
  </span>
  {#if trailing}<span class="st-choice__trailing">{@render trailing()}</span>{/if}
</label>

<style>
  .st-choice {
    align-items: start;
    color: var(--st-component-field-labelText, var(--st-semantic-text-primary, #1f2437));
    cursor: var(--st-cursor-interactive, pointer);
    display: inline-grid;
    gap: 0.625rem;
    grid-template-columns: auto 1fr;
    /* The row carries the label typography so `1lh` is one label line: the
       box and the trailing slot centre on that first line (see below). */
    font-size: var(--st-component-selection-choiceLabelFontSize, 0.9375rem);
    line-height: var(--st-component-selection-choiceLabelLineHeight, normal);
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
    /* One label line high, content centred: a count Badge sits on the same
       axis as the box and the label, even when it is taller than the line. */
    height: 1lh;
    justify-content: flex-end;
  }

  .st-choice__input {
    /* Natif stylé : couleur de coche thémée + taille + focus par stratégie
       d'anatomie + états. Aucun widget custom, a11y native préservée. */
    accent-color: var(--st-component-selection-checkedBackground, var(--st-semantic-action-primary, #01055e));
    cursor: inherit;
    font: inherit;
    height: 1rem;
    /* Vertical centring on the first label line, whatever the theme's label
       font size and line height: offset the 1rem box by half the difference
       between one label line (1lh) and its own height. Top alignment is kept
       so a wrapped description stays under the label. The first declaration
       is the fallback for engines without the lh unit. */
    margin: 0.125rem 0 0;
    margin: calc((1lh - 1rem) / 2) 0 0;
    width: 1rem;
  }

  /* Focus = stratégie d'anatomie partagée (outline DSFR / inset Carbon / ring base). */
  .st-choice__input:focus-visible {
    outline: var(--st-component-control-anatomy-focus-outline, none);
    outline-offset: var(--st-component-control-anatomy-focus-offset, 0);
    box-shadow: var(--st-component-control-anatomy-focus-boxShadow,
      0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive, #01055e)));
  }

  .st-choice:hover .st-choice__input {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle, #f3f4fb));
  }

  .st-choice__input[aria-invalid="true"] {
    accent-color: var(--st-component-control-invalidBorder, var(--st-semantic-feedback-error, #dc2626));
    outline-color: var(--st-component-control-invalidBorder, var(--st-semantic-feedback-error, #dc2626));
  }

  .st-choice__input:disabled {
    cursor: var(--st-cursor-disabled, not-allowed);
    opacity: 0.55;
  }

  .st-choice:has(.st-choice__input:disabled) {
    color: var(--st-component-control-disabledText, var(--st-semantic-text-muted, #6b7280));
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
    color: var(--st-component-field-helpText, var(--st-semantic-text-secondary, #444455));
    font-size: 0.8125rem;
    line-height: normal;
  }

  /* Secondary muted description under the label (SIGNAL filter hint). */
  .st-choice__description {
    color: var(--st-semantic-text-secondary, #444455);
    font-size: 0.8125rem;
    line-height: 1.4;
  }

  /* Survey / touch card density (>= 48px full-row hit target). */
  .st-choice--card {
    align-items: center;
    background: var(--st-component-card-background, var(--st-semantic-surface-default, #ffffff));
    border: var(--st-component-control-anatomy-shape-borderWidth, 1.5px)
      var(--st-component-control-anatomy-shape-borderStyle, solid)
      var(--st-component-card-border, var(--st-semantic-border-subtle, #d6d9ea));
    border-radius: var(--st-component-card-radius, var(--st-component-control-radius, 0.5rem));
    box-sizing: border-box;
    display: grid;
    gap: 0.75rem;
    min-height: 3rem;
    padding: 0.75rem 1rem;
    transition:
      background-color var(--st-motion-fast, 150ms) var(--st-motion-easing, ease),
      border-color var(--st-motion-fast, 150ms) var(--st-motion-easing, ease),
      box-shadow var(--st-motion-fast, 150ms) var(--st-motion-easing, ease);
    width: 100%;
  }

  .st-choice--card.st-choice--described {
    align-items: start;
  }

  .st-choice--card .st-choice__input {
    height: 1.25rem;
    margin: 0.0625rem 0 0;
    width: 1.25rem;
  }

  .st-choice--card:hover:not(:has(.st-choice__input:disabled)) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle, #f3f4fb));
    border-color: var(--st-component-control-hoverBorder, var(--st-semantic-border-strong, #01055e));
  }

  .st-choice--card:has(.st-choice__input:checked) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle, #f3f4fb));
    border-color: var(--st-component-selection-checkedBackground, var(--st-semantic-border-interactive, #01055e));
    box-shadow: 0 0 0 1px
      var(--st-component-selection-checkedBackground, var(--st-semantic-border-interactive, #01055e));
  }

  .st-choice--card:has(.st-choice__input:focus-visible) {
    outline: var(--st-component-control-anatomy-focus-outline, none);
    outline-offset: var(--st-component-control-anatomy-focus-offset, 0);
    box-shadow: var(--st-component-control-anatomy-focus-boxShadow,
      0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive, #01055e)));
  }

  .st-choice--card .st-choice__input:focus-visible {
    box-shadow: none;
    outline: none;
  }

  .st-choice--card[data-invalid="true"] {
    border-color: var(--st-component-control-invalidBorder, var(--st-semantic-feedback-error, #dc2626));
  }

  .st-choice--card:has(.st-choice__input:disabled) {
    background: var(--st-component-control-disabledBackground, var(--st-semantic-surface-subtle, #f3f4fb));
  }
</style>

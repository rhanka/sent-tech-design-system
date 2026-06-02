<script lang="ts">
  import type { HTMLTextareaAttributes } from "svelte/elements";

  type TextareaProps = Omit<HTMLTextareaAttributes, "class" | "value"> & {
    label?: string;
    helperText?: string;
    errorText?: string;
    invalid?: boolean;
    value?: string | null;
    class?: string;
  };

  let {
    label,
    helperText,
    errorText,
    invalid = false,
    value = $bindable(""),
    class: className,
    ...rest
  }: TextareaProps = $props();

  const fieldClasses = () => ["st-field", className].filter(Boolean).join(" ");
  const isInvalid = () => invalid || Boolean(errorText);
</script>

<div class={fieldClasses()}>
  <label class="st-field__control">
    {#if label}<span class="st-field__label">{label}</span>{/if}
    <textarea
      {...rest}
      bind:value
      class="st-textarea"
      aria-invalid={isInvalid() ? "true" : undefined}
    ></textarea>
  </label>
  {#if errorText}
    <span class="st-field__error">{errorText}</span>
  {:else if helperText}
    <span class="st-field__help">{helperText}</span>
  {/if}
</div>

<style>
  .st-field {
    color: var(--st-component-field-labelText, var(--st-semantic-text-primary));
    display: grid;
    gap: var(--st-component-field-gap, 0.5rem);
    max-width: var(--st-component-field-maxWidth, 28rem);
  }

  .st-field__control {
    display: grid;
    gap: var(--st-component-field-gap, 0.5rem);
  }

  .st-field__label {
    font-family: var(--st-component-field-labelTypography-family, inherit);
    font-size: var(--st-component-field-labelTypography-size, 0.875rem);
    font-weight: var(--st-component-field-labelTypography-weight, 600);
    line-height: var(--st-component-field-labelTypography-lineHeight, 1.4);
    letter-spacing: var(--st-component-field-labelTypography-letterSpacing, 0);
    text-transform: var(--st-component-field-labelTypography-textTransform, none);
  }

  .st-field__help,
  .st-field__error {
    font-size: 0.8125rem;
    line-height: 1.4;
  }

  .st-field__help {
    color: var(--st-component-field-helpText, var(--st-semantic-text-secondary));
  }

  .st-field__error {
    color: var(--st-component-field-errorText, var(--st-semantic-feedback-error));
  }

  /* Field style (anatomy v1.2.0) — same resolved field anatomy as Input:
     outline (base) = surface fill + 4 equal borders; filled-underline
     (DSFR/Carbon) = filled bg + bottom rule only. Multiline keeps its own
     vertical padding (block padding can't be 0 like a single-line control). */
  .st-textarea {
    background: var(--st-component-control-anatomy-field-fillBg, var(--st-component-control-background, var(--st-semantic-surface-default)));
    border-top: var(--st-component-control-anatomy-field-borderTop, var(--st-component-control-anatomy-shape-borderWidth, 1px) var(--st-component-control-anatomy-shape-borderStyle, solid) var(--st-component-control-border, var(--st-semantic-border-subtle)));
    border-right: var(--st-component-control-anatomy-field-borderRight, var(--st-component-control-anatomy-shape-borderWidth, 1px) var(--st-component-control-anatomy-shape-borderStyle, solid) var(--st-component-control-border, var(--st-semantic-border-subtle)));
    border-bottom: var(--st-component-control-anatomy-field-borderBottom, var(--st-component-control-anatomy-shape-borderWidth, 1px) var(--st-component-control-anatomy-shape-borderStyle, solid) var(--st-component-control-border, var(--st-semantic-border-subtle)));
    border-left: var(--st-component-control-anatomy-field-borderLeft, var(--st-component-control-anatomy-shape-borderWidth, 1px) var(--st-component-control-anatomy-shape-borderStyle, solid) var(--st-component-control-border, var(--st-semantic-border-subtle)));
    /* Per-corner radius + box-shadow underline (anatomy v1.3.0) — same field
       anatomy as Input: TOP corners = radiusTop (DSFR 4px), bottom = shape.radius;
       bottom rule via inset box-shadow. Fallbacks reproduce the prior uniform
       rounded box with no underline shadow → base Sent Tech unchanged. */
    border-top-left-radius: var(--st-component-control-anatomy-field-radiusTop, var(--st-component-control-anatomy-shape-radius, 0.375rem));
    border-top-right-radius: var(--st-component-control-anatomy-field-radiusTop, var(--st-component-control-anatomy-shape-radius, 0.375rem));
    border-bottom-right-radius: var(--st-component-control-anatomy-field-radiusBottom, var(--st-component-control-anatomy-shape-radius, 0.375rem));
    border-bottom-left-radius: var(--st-component-control-anatomy-field-radiusBottom, var(--st-component-control-anatomy-shape-radius, 0.375rem));
    box-shadow: var(--st-component-control-anatomy-field-underline, none);
    color: var(--st-component-control-text, var(--st-semantic-text-primary));
    font-family: var(--st-component-control-anatomy-typography-family, inherit);
    font-size: var(--st-component-control-anatomy-typography-size, inherit);
    font-weight: var(--st-component-control-anatomy-typography-weight, 400);
    line-height: var(--st-component-control-anatomy-typography-lineHeight, 1.5);
    letter-spacing: var(--st-component-control-anatomy-typography-letterSpacing, normal);
    min-height: 6rem;
    min-width: 0;
    padding: 0.625rem var(--st-component-control-anatomy-density-sm-paddingInline, 0.75rem);
    resize: vertical;
    transition:
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      box-shadow var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: 100%;
  }

  .st-textarea::placeholder {
    color: var(--st-component-control-placeholderText, var(--st-semantic-text-muted));
  }

  .st-textarea:hover:not(:disabled) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
    border-color: var(--st-component-control-hoverBorder, var(--st-semantic-border-strong));
  }

  .st-textarea:focus-visible {
    border-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline: var(--st-component-control-anatomy-focus-outline, none);
    outline-offset: var(--st-component-control-anatomy-focus-offset, 0);
    /* Composed field focus box-shadow (v1.3.0): keeps the resting underline. */
    box-shadow: var(--st-component-control-anatomy-field-focusShadow,
      var(--st-component-control-anatomy-focus-boxShadow,
        0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive))));
  }

  .st-textarea[aria-invalid="true"] {
    border-color: var(--st-component-control-invalidBorder, var(--st-semantic-feedback-error));
  }

  .st-textarea:disabled {
    background: var(--st-component-control-disabledBackground, var(--st-semantic-surface-subtle));
    color: var(--st-component-control-disabledText, var(--st-semantic-text-muted));
    cursor: not-allowed;
  }
</style>

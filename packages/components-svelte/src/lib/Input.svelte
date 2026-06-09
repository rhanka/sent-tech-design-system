<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type InputProps = Omit<HTMLInputAttributes, "class" | "size" | "value"> & {
    label?: string;
    helperText?: string;
    errorText?: string;
    invalid?: boolean;
    size?: "sm" | "md" | "lg";
    value?: string | number | null;
    class?: string;
  };

  let {
    label,
    helperText,
    errorText,
    invalid = false,
    size = "md",
    value = $bindable(""),
    class: className,
    ...rest
  }: InputProps = $props();

  const fieldClasses = () => ["st-field", className].filter(Boolean).join(" ");
  const controlClasses = () => ["st-control", `st-control--${size}`].join(" ");
  const isInvalid = () => invalid || Boolean(errorText);
</script>

<div class={fieldClasses()}>
  <label class="st-field__control">
    {#if label}<span class="st-field__label">{label}</span>{/if}
    <input
      {...rest}
      bind:value
      class={controlClasses()}
      aria-invalid={isInvalid() ? "true" : undefined}
    />
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

  .st-control {
    /* Field style (anatomy v1.2.0): the background fill + per-side borders come
       from the resolved `field` anatomy. outline (base) = surface.default fill +
       4 equal borders; filled-underline (DSFR/Carbon) = filled bg + bottom rule
       only (top/right/left = none). Fallbacks reproduce the prior boxed look. */
    background: var(--st-component-control-anatomy-field-fillBg, var(--st-component-control-background, var(--st-semantic-surface-default)));
    border-top: var(--st-component-control-anatomy-field-borderTop, var(--st-component-control-anatomy-shape-borderWidth, 1px) var(--st-component-control-anatomy-shape-borderStyle, solid) var(--st-component-control-border, var(--st-semantic-border-subtle)));
    border-right: var(--st-component-control-anatomy-field-borderRight, var(--st-component-control-anatomy-shape-borderWidth, 1px) var(--st-component-control-anatomy-shape-borderStyle, solid) var(--st-component-control-border, var(--st-semantic-border-subtle)));
    border-bottom: var(--st-component-control-anatomy-field-borderBottom, var(--st-component-control-anatomy-shape-borderWidth, 1px) var(--st-component-control-anatomy-shape-borderStyle, solid) var(--st-component-control-border, var(--st-semantic-border-subtle)));
    border-left: var(--st-component-control-anatomy-field-borderLeft, var(--st-component-control-anatomy-shape-borderWidth, 1px) var(--st-component-control-anatomy-shape-borderStyle, solid) var(--st-component-control-border, var(--st-semantic-border-subtle)));
    /* Per-corner radius (anatomy v1.3.0): the TOP corners read the field's
       `radiusTop` (DSFR « Champ de saisie » = 4px top, square bottom); the
       BOTTOM corners keep `shape.radius`. Fallback = shape.radius on all four
       corners → the base Sent Tech field stays a uniform rounded box. */
    border-top-left-radius: var(--st-component-control-anatomy-field-radiusTop, var(--st-component-control-anatomy-shape-radius, 0.375rem));
    border-top-right-radius: var(--st-component-control-anatomy-field-radiusTop, var(--st-component-control-anatomy-shape-radius, 0.375rem));
    border-bottom-right-radius: var(--st-component-control-anatomy-field-radiusBottom, var(--st-component-control-anatomy-shape-radius, 0.375rem));
    border-bottom-left-radius: var(--st-component-control-anatomy-field-radiusBottom, var(--st-component-control-anatomy-shape-radius, 0.375rem));
    /* Bottom rule as a box-shadow inset (anatomy v1.3.0, real DSFR/Carbon
       technique) instead of a border-bottom — keeps the box height honest.
       Fallback = none → the base boxed field draws its rule via the 4 borders. */
    box-shadow: var(--st-component-control-anatomy-field-underline, none);
    color: var(--st-component-control-text, var(--st-semantic-text-primary));
    font-family: var(--st-component-control-anatomy-typography-family, inherit);
    font-size: var(--st-component-control-anatomy-typography-size, inherit);
    font-weight: var(--st-component-control-anatomy-typography-weight, 400);
    line-height: var(--st-component-control-anatomy-typography-lineHeight, 1.5);
    letter-spacing: var(--st-component-control-anatomy-typography-letterSpacing, normal);
    min-width: 0;
    /* Inputs use the SM inline padding (denser than buttons) — base = 0.75rem. */
    padding: var(--st-component-control-anatomy-density-md-paddingBlock, 0)
      var(--st-component-control-anatomy-density-sm-paddingInline, 0.75rem);
    cursor: var(--st-cursor-text, text);
    transition:
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      box-shadow var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: 100%;
  }

  .st-control--sm {
    min-height: var(--st-component-control-anatomy-density-sm-controlHeight, var(--st-component-control-smHeight, 2rem));
    font-size: var(--st-component-control-smFontSize, 0.8125rem);
  }

  .st-control--md {
    min-height: var(--st-component-control-anatomy-density-md-controlHeight, var(--st-component-control-mdHeight, 2.5rem));
    font-size: var(--st-component-control-mdFontSize, 0.875rem);
  }

  .st-control--lg {
    min-height: var(--st-component-control-anatomy-density-lg-controlHeight, var(--st-component-control-lgHeight, 3rem));
    font-size: var(--st-component-control-lgFontSize, 1rem);
  }

  .st-control::placeholder {
    color: var(--st-component-control-placeholderText, var(--st-semantic-text-muted));
  }

  .st-control:hover:not(:disabled) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
    border-color: var(--st-component-control-hoverBorder, var(--st-semantic-border-strong));
  }

  /* Focus = shared mixin. Base/DSFR use outline; Carbon uses inset box-shadow.
     The border-color change is the field's own affordance and stays. The field
     focus box-shadow (anatomy v1.3.0) is COMPOSED so the resting underline is
     not dropped: DSFR (outline) keeps the underline, Carbon stacks ring +
     underline. Fallback = the plain focus ring (base boxed field). */
  .st-control:focus-visible {
    border-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline: var(--st-component-control-anatomy-focus-outline, none);
    outline-offset: var(--st-component-control-anatomy-focus-offset, 0);
    box-shadow: var(--st-component-control-anatomy-field-focusShadow,
      var(--st-component-control-anatomy-focus-boxShadow,
        0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive))));
  }

  .st-control[aria-invalid="true"] {
    border-color: var(--st-component-control-invalidBorder, var(--st-semantic-feedback-error));
  }

  .st-control:disabled {
    background: var(--st-component-control-disabledBackground, var(--st-semantic-surface-subtle));
    color: var(--st-component-control-disabledText, var(--st-semantic-text-muted));
    cursor: var(--st-cursor-disabled, not-allowed);
  }
</style>

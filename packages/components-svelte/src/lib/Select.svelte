<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLSelectAttributes } from "svelte/elements";

  type SelectProps = Omit<HTMLSelectAttributes, "class" | "size" | "value"> & {
    label?: string;
    helperText?: string;
    errorText?: string;
    invalid?: boolean;
    size?: "sm" | "md" | "lg";
    value?: string | string[] | number | null;
    class?: string;
    children?: Snippet;
  };

  let {
    label,
    helperText,
    errorText,
    invalid = false,
    size = "md",
    value = $bindable(""),
    class: className,
    children,
    ...rest
  }: SelectProps = $props();

  const fieldClasses = () => ["st-field", className].filter(Boolean).join(" ");
  const controlClasses = () => ["st-select", `st-select--${size}`].join(" ");
  const isInvalid = () => invalid || Boolean(errorText);
</script>

<div class={fieldClasses()}>
  <label class="st-field__control">
    {#if label}<span class="st-field__label">{label}</span>{/if}
    <select
      {...rest}
      bind:value
      class={controlClasses()}
      aria-invalid={isInvalid() ? "true" : undefined}
    >
      {@render children?.()}
    </select>
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

  /* Field box = resolved field anatomy (v1.2.0), same as Input. */
  .st-select {
    /* Native <select> rendering (anatomy v1.4.0, F5/F9). A native <select> with
       `appearance: auto` has its `line-height` FORCED to `normal` by the browser
       (the anatomy line-height below never lands); `appearance: none` lets it
       take effect — the real DSFR/Carbon selects use `appearance: none` + a
       drawn chevron, which is why they render 24px / 18px. Base = `auto` so the
       Sent Tech select keeps its NATIVE arrow + render (unchanged). When a theme
       opts into `none`, `selectChevron` redraws the arrow the UA dropped. */
    appearance: var(--st-component-control-anatomy-field-selectAppearance, auto);
    -webkit-appearance: var(--st-component-control-anatomy-field-selectAppearance, auto);
    background:
      var(--st-component-control-anatomy-field-selectChevron, none),
      var(--st-component-control-anatomy-field-fillBg, var(--st-component-control-background, var(--st-semantic-surface-default)));
    border-top: var(--st-component-control-anatomy-field-borderTop, var(--st-component-control-anatomy-shape-borderWidth, 1px) var(--st-component-control-anatomy-shape-borderStyle, solid) var(--st-component-control-border, var(--st-semantic-border-subtle)));
    border-right: var(--st-component-control-anatomy-field-borderRight, var(--st-component-control-anatomy-shape-borderWidth, 1px) var(--st-component-control-anatomy-shape-borderStyle, solid) var(--st-component-control-border, var(--st-semantic-border-subtle)));
    border-bottom: var(--st-component-control-anatomy-field-borderBottom, var(--st-component-control-anatomy-shape-borderWidth, 1px) var(--st-component-control-anatomy-shape-borderStyle, solid) var(--st-component-control-border, var(--st-semantic-border-subtle)));
    border-left: var(--st-component-control-anatomy-field-borderLeft, var(--st-component-control-anatomy-shape-borderWidth, 1px) var(--st-component-control-anatomy-shape-borderStyle, solid) var(--st-component-control-border, var(--st-semantic-border-subtle)));
    /* Per-corner radius + box-shadow underline (anatomy v1.3.0) — same field
       anatomy as Input. TOP corners = radiusTop (DSFR 4px), bottom = shape.radius;
       bottom rule via inset box-shadow. Fallbacks reproduce the prior uniform
       rounded box with no underline shadow → base Sent Tech unchanged. */
    border-top-left-radius: var(--st-component-control-anatomy-field-radiusTop, var(--st-component-control-anatomy-shape-radius, 0.375rem));
    border-top-right-radius: var(--st-component-control-anatomy-field-radiusTop, var(--st-component-control-anatomy-shape-radius, 0.375rem));
    border-bottom-right-radius: var(--st-component-control-anatomy-shape-radius, 0.375rem);
    border-bottom-left-radius: var(--st-component-control-anatomy-shape-radius, 0.375rem);
    box-shadow: var(--st-component-control-anatomy-field-underline, none);
    color: var(--st-component-control-text, var(--st-semantic-text-primary));
    font-family: var(--st-component-control-anatomy-typography-family, inherit);
    font-size: var(--st-component-control-anatomy-typography-size, inherit);
    font-weight: var(--st-component-control-anatomy-typography-weight, 400);
    /* Native <select> renders `line-height: normal` unless one is set explicitly;
       pose the anatomy line-height so DSFR/Carbon select matches the field roles
       (cluster 4). letter-spacing likewise (Carbon 0.16px). Additive — base keeps
       its 1.5 fallback so the Sent Tech select is unchanged. */
    line-height: var(--st-component-control-anatomy-typography-lineHeight, 1.5);
    letter-spacing: var(--st-component-control-anatomy-typography-letterSpacing, normal);
    min-width: 0;
    /* Padding follows the field density (additive; fallbacks reproduce the prior
       `0 2rem 0 0.75rem` literal so the base Sent Tech select is unchanged):
       vertical = md paddingBlock (base 0 → DSFR 8px), left = sm paddingInline
       (base 0.75rem → DSFR/Carbon 16px). The right side reserves the chevron
       gutter via selectPaddingRight (F9: base 2rem → DSFR 40px / Carbon 48px). */
    padding:
      var(--st-component-control-anatomy-density-md-paddingBlock, 0)
      var(--st-component-control-anatomy-field-selectPaddingRight, 2rem)
      var(--st-component-control-anatomy-density-md-paddingBlock, 0)
      var(--st-component-control-anatomy-density-sm-paddingInline, 0.75rem);
    width: 100%;
  }

  .st-select:hover {
    background:
      var(--st-component-control-anatomy-field-selectChevron, none),
      var(--st-component-control-hoverBackground, var(--st-component-control-anatomy-field-fillBg, var(--st-component-control-background, var(--st-semantic-surface-default))));
  }

  .st-select--sm {
    min-height: var(--st-component-control-smHeight, 2rem);
  }

  .st-select--md {
    min-height: var(--st-component-control-mdHeight, 2.5rem);
  }

  .st-select--lg {
    min-height: var(--st-component-control-lgHeight, 3rem);
  }

  .st-select:focus-visible {
    border-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline: var(--st-component-control-anatomy-focus-outline, none);
    outline-offset: var(--st-component-control-anatomy-focus-offset, 0);
    /* Composed field focus box-shadow (v1.3.0): keeps the resting underline. */
    box-shadow: var(--st-component-control-anatomy-field-focusShadow,
      var(--st-component-control-anatomy-focus-boxShadow,
        0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive))));
  }

  .st-select[aria-invalid="true"] {
    border-color: var(--st-component-control-invalidBorder, var(--st-semantic-feedback-error));
  }
</style>

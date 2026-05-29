<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type ButtonProps = Omit<HTMLButtonAttributes, "class" | "disabled" | "type"> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    class?: string;
    children?: Snippet;
  };

  let {
    variant = "primary",
    size = "md",
    disabled = false,
    type = "button",
    class: className,
    children,
    ...rest
  }: ButtonProps = $props();

  const classes = () =>
    ["st-button", `st-button--${variant}`, `st-button--${size}`, className]
      .filter(Boolean)
      .join(" ");
</script>

<button {...rest} class={classes()} {type} {disabled}>
  {@render children?.()}
</button>

<style>
  /* Anatomy-driven: shape / density / typography / focus all read the themed
     --st-component-button-anatomy-* tokens (rebuilt per theme via
     createComponent). Fallbacks mirror the Sent Tech base = no regression. */
  .st-button {
    border-width: var(--st-component-button-anatomy-shape-borderWidth, 1px);
    border-style: var(--st-component-button-anatomy-shape-borderStyle, solid);
    border-color: transparent;
    border-radius: var(--st-component-button-anatomy-shape-radius, 0.375rem);
    cursor: var(--st-cursor-interactive, pointer);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--st-component-button-anatomy-icon-gap, var(--st-spacing-2, 0.5rem));
    font-family: var(--st-component-button-anatomy-typography-family, inherit);
    font-weight: var(--st-component-button-anatomy-typography-weight, 600);
    line-height: var(--st-component-button-anatomy-typography-lineHeight, 1.2);
    letter-spacing: var(--st-component-button-anatomy-typography-letterSpacing, 0);
    text-transform: var(--st-component-button-anatomy-typography-textTransform, none);
    transition:
      background var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      box-shadow var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  /* Padding is 4-value (top right bottom left): the trailing side reads
     `paddingInlineEnd` so a theme can make the button asymmetric (Carbon's
     label-left primary button has a large right gutter) without a per-component
     escape. `paddingInlineEnd` falls back to `paddingInline` → symmetric for the
     base / DSFR (unchanged). */
  .st-button--sm {
    min-height: var(--st-component-button-anatomy-density-sm-controlHeight, 2rem);
    min-width: var(--st-component-button-anatomy-density-sm-minWidth, 2rem);
    padding: var(--st-component-button-anatomy-density-sm-paddingBlock, 0)
      var(--st-component-button-anatomy-density-sm-paddingInlineEnd, var(--st-component-button-anatomy-density-sm-paddingInline, 0.75rem))
      var(--st-component-button-anatomy-density-sm-paddingBlock, 0)
      var(--st-component-button-anatomy-density-sm-paddingInline, 0.75rem);
    font-size: var(--st-component-button-anatomy-density-sm-fontSize, 0.875rem);
  }

  .st-button--md {
    min-height: var(--st-component-button-anatomy-density-md-controlHeight, 2.5rem);
    min-width: var(--st-component-button-anatomy-density-md-minWidth, 2.5rem);
    padding: var(--st-component-button-anatomy-density-md-paddingBlock, 0)
      var(--st-component-button-anatomy-density-md-paddingInlineEnd, var(--st-component-button-anatomy-density-md-paddingInline, 1rem))
      var(--st-component-button-anatomy-density-md-paddingBlock, 0)
      var(--st-component-button-anatomy-density-md-paddingInline, 1rem);
    font-size: var(--st-component-button-anatomy-density-md-fontSize, var(--st-component-button-anatomy-typography-size, 0.9375rem));
  }

  .st-button--lg {
    min-height: var(--st-component-button-anatomy-density-lg-controlHeight, 3rem);
    min-width: var(--st-component-button-anatomy-density-lg-minWidth, 3rem);
    padding: var(--st-component-button-anatomy-density-lg-paddingBlock, 0)
      var(--st-component-button-anatomy-density-lg-paddingInlineEnd, var(--st-component-button-anatomy-density-lg-paddingInline, 1.25rem))
      var(--st-component-button-anatomy-density-lg-paddingBlock, 0)
      var(--st-component-button-anatomy-density-lg-paddingInline, 1.25rem);
    font-size: var(--st-component-button-anatomy-density-lg-fontSize, 1rem);
  }

  .st-button--primary {
    background: var(--st-component-button-primaryBackground, var(--st-semantic-action-primary));
    color: var(--st-component-button-primaryText, var(--st-semantic-action-primaryText));
  }

  .st-button--secondary {
    background: var(--st-component-button-secondaryBackground, var(--st-semantic-action-secondary));
    color: var(--st-component-button-secondaryText, var(--st-semantic-action-secondaryText));
    border-color: var(--st-semantic-border-subtle);
  }

  /* Anatomy v1.1.0: hover bg sourced from states.hover.bg (= primaryHover).
     Retires the D1/C1 escape. Secondary uses its own semantic hover surface. */
  .st-button--primary:not(:disabled):hover {
    background: var(--st-component-button-anatomy-states-hover-bg, var(--st-semantic-action-primary));
  }

  .st-button--secondary:not(:disabled):hover {
    background: var(--st-semantic-action-secondaryHover, var(--st-semantic-action-secondary));
  }

  .st-button--ghost {
    background: transparent;
    color: var(--st-semantic-text-link);
  }

  .st-button--danger {
    background: var(--st-semantic-action-danger);
    color: var(--st-semantic-text-inverse);
  }

  .st-button:disabled {
    cursor: var(--st-cursor-disabled, not-allowed);
    opacity: var(--st-component-button-anatomy-states-disabled-opacity, 0.55);
  }

  /* Shared focus mixin: apply BOTH channels; the strategy (resolved in
     createComponent) sets the live one and no-ops the other. */
  .st-button:focus-visible {
    outline: var(--st-component-button-anatomy-focus-outline, 2px solid var(--st-semantic-border-interactive));
    outline-offset: var(--st-component-button-anatomy-focus-offset, 2px);
    box-shadow: var(--st-component-button-anatomy-focus-boxShadow, none);
  }
</style>

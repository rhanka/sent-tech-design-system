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
    font-size: 0.875rem;
    font-weight: 600;
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
    background: var(--st-component-control-background, var(--st-semantic-surface-default));
    border: 1px solid var(--st-component-control-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-control-radius, 0.375rem);
    color: var(--st-component-control-text, var(--st-semantic-text-primary));
    font: inherit;
    min-width: 0;
    padding: 0 0.75rem;
    transition:
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      box-shadow var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: 100%;
  }

  .st-control--sm {
    min-height: var(--st-component-control-smHeight, 2rem);
  }

  .st-control--md {
    min-height: var(--st-component-control-mdHeight, 2.5rem);
  }

  .st-control--lg {
    min-height: var(--st-component-control-lgHeight, 3rem);
  }

  .st-control::placeholder {
    color: var(--st-component-control-placeholderText, var(--st-semantic-text-muted));
  }

  .st-control:hover:not(:disabled) {
    border-color: var(--st-component-control-hoverBorder, var(--st-semantic-border-strong));
  }

  .st-control:focus-visible {
    border-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    box-shadow: 0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline: none;
  }

  .st-control[aria-invalid="true"] {
    border-color: var(--st-component-control-invalidBorder, var(--st-semantic-feedback-error));
  }

  .st-control:disabled {
    background: var(--st-component-control-disabledBackground, var(--st-semantic-surface-subtle));
    color: var(--st-component-control-disabledText, var(--st-semantic-text-muted));
    cursor: not-allowed;
  }
</style>

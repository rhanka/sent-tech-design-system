<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import { Eye, EyeOff } from "@lucide/svelte";

  type PasswordInputProps = Omit<HTMLInputAttributes, "class" | "size" | "type" | "value"> & {
    label?: string;
    helperText?: string;
    errorText?: string;
    invalid?: boolean;
    size?: "sm" | "md" | "lg";
    value?: string;
    showLabel?: string;
    hideLabel?: string;
    visible?: boolean;
    class?: string;
  };

  let {
    label,
    helperText,
    errorText,
    invalid = false,
    size = "md",
    value = $bindable(""),
    showLabel = "Show password",
    hideLabel = "Hide password",
    visible = $bindable(false),
    disabled,
    class: className,
    ...rest
  }: PasswordInputProps = $props();

  const fieldClasses = () => ["st-field", className].filter(Boolean).join(" ");
  const groupClasses = () => ["st-passwordInput", `st-passwordInput--${size}`].join(" ");
  const isInvalid = () => invalid || Boolean(errorText);

  function toggle() {
    visible = !visible;
  }
</script>

<div class={fieldClasses()}>
  <label class="st-field__control">
    {#if label}<span class="st-field__label">{label}</span>{/if}
    <span class={groupClasses()}>
      <input
        {...rest}
        type={visible ? "text" : "password"}
        class="st-passwordInput__control"
        bind:value
        {disabled}
        aria-invalid={isInvalid() ? "true" : undefined}
        autocomplete="current-password"
      />
      <button
        type="button"
        class="st-passwordInput__toggle"
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible ? "true" : "false"}
        {disabled}
        onclick={toggle}
      >
        {#if visible}
          <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
        {:else}
          <Eye size={16} strokeWidth={2} aria-hidden="true" />
        {/if}
      </button>
    </span>
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
  .st-passwordInput {
    align-items: center;
    background: var(--st-component-control-anatomy-field-fillBg, var(--st-component-control-background, var(--st-semantic-surface-default)));
    border-top: var(--st-component-control-anatomy-field-borderTop, var(--st-component-control-anatomy-shape-borderWidth, 1px) var(--st-component-control-anatomy-shape-borderStyle, solid) var(--st-component-control-border, var(--st-semantic-border-subtle)));
    border-right: var(--st-component-control-anatomy-field-borderRight, var(--st-component-control-anatomy-shape-borderWidth, 1px) var(--st-component-control-anatomy-shape-borderStyle, solid) var(--st-component-control-border, var(--st-semantic-border-subtle)));
    border-bottom: var(--st-component-control-anatomy-field-borderBottom, var(--st-component-control-anatomy-shape-borderWidth, 1px) var(--st-component-control-anatomy-shape-borderStyle, solid) var(--st-component-control-border, var(--st-semantic-border-subtle)));
    border-left: var(--st-component-control-anatomy-field-borderLeft, var(--st-component-control-anatomy-shape-borderWidth, 1px) var(--st-component-control-anatomy-shape-borderStyle, solid) var(--st-component-control-border, var(--st-semantic-border-subtle)));
    border-radius: var(--st-component-control-anatomy-shape-radius, 0.375rem);
    color: var(--st-component-control-text, var(--st-semantic-text-primary));
    display: inline-flex;
    transition:
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      box-shadow var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: 100%;
  }

  .st-passwordInput--sm {
    min-height: var(--st-component-control-smHeight, 2rem);
    font-size: var(--st-component-control-smFontSize, 0.8125rem);
  }

  .st-passwordInput--md {
    min-height: var(--st-component-control-mdHeight, 2.5rem);
    font-size: var(--st-component-control-mdFontSize, 0.875rem);
  }

  .st-passwordInput--lg {
    min-height: var(--st-component-control-lgHeight, 3rem);
    font-size: var(--st-component-control-lgFontSize, 1rem);
  }

  .st-passwordInput:hover:not(:has(input:disabled)) {
    border-color: var(--st-component-control-hoverBorder, var(--st-semantic-border-strong));
  }

  .st-passwordInput:focus-within {
    border-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline: var(--st-component-control-anatomy-focus-outline, none);
    outline-offset: var(--st-component-control-anatomy-focus-offset, 0);
    box-shadow: var(--st-component-control-anatomy-focus-boxShadow,
      0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive)));
  }

  .st-passwordInput:has([aria-invalid="true"]) {
    border-color: var(--st-component-control-invalidBorder, var(--st-semantic-feedback-error));
  }

  .st-passwordInput__control {
    background: transparent;
    border: 0;
    color: inherit;
    flex: 1 1 auto;
    font: inherit;
    min-width: 0;
    padding: 0 0.75rem;
    width: 100%;
  }

  .st-passwordInput__control:focus {
    outline: none;
  }

  .st-passwordInput__control::placeholder {
    color: var(--st-component-control-placeholderText, var(--st-semantic-text-muted));
  }

  .st-passwordInput__control:disabled {
    color: var(--st-component-control-disabledText, var(--st-semantic-text-muted));
    cursor: not-allowed;
  }

  .st-passwordInput__toggle {
    align-items: center;
    background: transparent;
    border: 0;
    color: var(--st-semantic-text-secondary);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    font: inherit;
    height: 100%;
    justify-content: center;
    padding: 0 0.625rem;
    transition: background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-passwordInput__toggle:hover:not(:disabled) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-passwordInput__toggle:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: -2px;
  }

  .st-passwordInput__toggle:disabled {
    cursor: not-allowed;
  }
</style>

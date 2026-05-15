<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type NumberInputProps = Omit<HTMLInputAttributes, "class" | "size" | "type" | "value"> & {
    label?: string;
    helperText?: string;
    errorText?: string;
    invalid?: boolean;
    size?: "sm" | "md" | "lg";
    value?: number | null;
    min?: number;
    max?: number;
    step?: number;
    incrementLabel?: string;
    decrementLabel?: string;
    class?: string;
  };

  let {
    label,
    helperText,
    errorText,
    invalid = false,
    size = "md",
    value = $bindable(null),
    min,
    max,
    step = 1,
    incrementLabel = "Increment value",
    decrementLabel = "Decrement value",
    disabled,
    class: className,
    ...rest
  }: NumberInputProps = $props();

  const fieldClasses = () => ["st-field", className].filter(Boolean).join(" ");
  const groupClasses = () => ["st-numberInput", `st-numberInput--${size}`].join(" ");
  const isInvalid = () => invalid || Boolean(errorText);

  const isAtMin = () => value !== null && value !== undefined && min !== undefined && value <= min;
  const isAtMax = () => value !== null && value !== undefined && max !== undefined && value >= max;

  const clamp = (n: number) => {
    if (min !== undefined && n < min) return min;
    if (max !== undefined && n > max) return max;
    return n;
  };

  function increment() {
    const base = value ?? min ?? 0;
    value = clamp(base + step);
  }

  function decrement() {
    const base = value ?? max ?? 0;
    value = clamp(base - step);
  }

  function onInput(event: Event) {
    const raw = (event.currentTarget as HTMLInputElement).value;
    if (raw === "") {
      value = null;
      return;
    }
    const parsed = Number(raw);
    value = Number.isFinite(parsed) ? parsed : value;
  }
</script>

<div class={fieldClasses()}>
  <label class="st-field__control">
    {#if label}<span class="st-field__label">{label}</span>{/if}
    <span class={groupClasses()}>
      <input
        {...rest}
        type="number"
        class="st-numberInput__control"
        value={value ?? ""}
        {min}
        {max}
        {step}
        {disabled}
        aria-invalid={isInvalid() ? "true" : undefined}
        oninput={onInput}
      />
      <span class="st-numberInput__buttons">
        <button
          type="button"
          class="st-numberInput__button"
          aria-label={decrementLabel}
          disabled={disabled || isAtMin()}
          onclick={decrement}
        >
          <span aria-hidden="true">−</span>
        </button>
        <button
          type="button"
          class="st-numberInput__button"
          aria-label={incrementLabel}
          disabled={disabled || isAtMax()}
          onclick={increment}
        >
          <span aria-hidden="true">+</span>
        </button>
      </span>
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

  .st-numberInput {
    align-items: stretch;
    background: var(--st-component-control-background, var(--st-semantic-surface-default));
    border: 1px solid var(--st-component-control-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-control-radius, 0.375rem);
    color: var(--st-component-control-text, var(--st-semantic-text-primary));
    display: inline-flex;
    overflow: hidden;
    transition:
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      box-shadow var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: 100%;
  }

  .st-numberInput--sm {
    min-height: var(--st-component-control-smHeight, 2rem);
  }

  .st-numberInput--md {
    min-height: var(--st-component-control-mdHeight, 2.5rem);
  }

  .st-numberInput--lg {
    min-height: var(--st-component-control-lgHeight, 3rem);
  }

  .st-numberInput:hover:not(:has(input:disabled)) {
    border-color: var(--st-component-control-hoverBorder, var(--st-semantic-border-strong));
  }

  .st-numberInput:focus-within {
    border-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    box-shadow: 0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
  }

  .st-numberInput:has([aria-invalid="true"]) {
    border-color: var(--st-component-control-invalidBorder, var(--st-semantic-feedback-error));
  }

  .st-numberInput__control {
    background: transparent;
    border: 0;
    color: inherit;
    flex: 1 1 auto;
    font: inherit;
    min-width: 0;
    padding: 0 0.75rem;
    text-align: right;
    width: 100%;
  }

  .st-numberInput__control:focus {
    outline: none;
  }

  .st-numberInput__control::-webkit-inner-spin-button,
  .st-numberInput__control::-webkit-outer-spin-button {
    appearance: none;
    margin: 0;
  }

  .st-numberInput__control[type="number"] {
    -moz-appearance: textfield;
  }

  .st-numberInput__control:disabled {
    color: var(--st-component-control-disabledText, var(--st-semantic-text-muted));
    cursor: not-allowed;
  }

  .st-numberInput__buttons {
    border-left: 1px solid var(--st-component-control-border, var(--st-semantic-border-subtle));
    display: inline-flex;
    flex: 0 0 auto;
  }

  .st-numberInput__button {
    align-items: center;
    background: transparent;
    border: 0;
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 1.125rem;
    justify-content: center;
    line-height: 1;
    min-width: 2.25rem;
    padding: 0 0.5rem;
    transition: background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-numberInput__button + .st-numberInput__button {
    border-left: 1px solid var(--st-component-control-border, var(--st-semantic-border-subtle));
  }

  .st-numberInput__button:hover:not(:disabled) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-numberInput__button:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: -2px;
  }

  .st-numberInput__button:disabled {
    color: var(--st-component-control-disabledText, var(--st-semantic-text-muted));
    cursor: not-allowed;
  }
</style>

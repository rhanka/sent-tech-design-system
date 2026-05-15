<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type SliderProps = Omit<
    HTMLInputAttributes,
    "class" | "size" | "type" | "value" | "onchange"
  > & {
    label?: string;
    helperText?: string;
    errorText?: string;
    invalid?: boolean;
    size?: "sm" | "md" | "lg";
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    showValue?: boolean;
    valueFormatter?: (value: number) => string;
    class?: string;
    onchange?: (value: number) => void;
  };

  let {
    label,
    helperText,
    errorText,
    invalid = false,
    size = "md",
    value = $bindable(0),
    min = 0,
    max = 100,
    step = 1,
    showValue = true,
    valueFormatter,
    disabled,
    class: className,
    onchange,
    ...rest
  }: SliderProps = $props();

  const fieldClasses = () => ["st-field", className].filter(Boolean).join(" ");
  const groupClasses = () => ["st-slider", `st-slider--${size}`].join(" ");
  const isInvalid = () => invalid || Boolean(errorText);

  const safeValue = $derived.by(() => {
    if (typeof value !== "number" || Number.isNaN(value)) return min;
    if (value < min) return min;
    if (value > max) return max;
    return value;
  });

  const percent = $derived.by(() => {
    if (max === min) return 0;
    return ((safeValue - min) / (max - min)) * 100;
  });

  const formatted = $derived(valueFormatter ? valueFormatter(safeValue) : String(safeValue));

  function onInput(event: Event) {
    const next = Number((event.currentTarget as HTMLInputElement).value);
    if (Number.isFinite(next)) {
      value = next;
      onchange?.(next);
    }
  }
</script>

<div class={fieldClasses()}>
  <div class="st-slider__header">
    {#if label}<span class="st-field__label">{label}</span>{/if}
    {#if showValue}
      <output class="st-slider__value" aria-live="polite">{formatted}</output>
    {/if}
  </div>
  <span class={groupClasses()}>
    <span class="st-slider__bounds" aria-hidden="true">{min}</span>
    <span class="st-slider__track">
      <span class="st-slider__fill" style={`--st-slider-fill: ${percent}%`}></span>
      <span
        class="st-slider__thumb"
        style={`left: ${percent}%`}
        aria-hidden="true"
      >
        {#if showValue}
          <span class="st-slider__tooltip">{formatted}</span>
        {/if}
      </span>
      <input
        {...rest}
        type="range"
        class="st-slider__input"
        aria-label={label}
        aria-invalid={isInvalid() ? "true" : undefined}
        value={safeValue}
        {min}
        {max}
        {step}
        {disabled}
        oninput={onInput}
      />
    </span>
    <span class="st-slider__bounds" aria-hidden="true">{max}</span>
  </span>
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

  .st-slider__header {
    align-items: baseline;
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
  }

  .st-slider__value {
    color: var(--st-semantic-text-secondary);
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
  }

  .st-slider {
    align-items: center;
    display: flex;
    gap: 0.75rem;
    width: 100%;
  }

  .st-slider__bounds {
    color: var(--st-semantic-text-muted);
    flex: 0 0 auto;
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
  }

  .st-slider__track {
    background: var(--st-component-control-border, var(--st-semantic-border-subtle));
    border-radius: 999px;
    flex: 1 1 auto;
    height: 0.25rem;
    position: relative;
  }

  .st-slider--sm .st-slider__track {
    height: 0.1875rem;
  }

  .st-slider--lg .st-slider__track {
    height: 0.375rem;
  }

  .st-slider__fill {
    background: var(--st-semantic-action-primary);
    border-radius: 999px;
    display: block;
    height: 100%;
    width: var(--st-slider-fill, 0%);
  }

  .st-slider__thumb {
    background: var(--st-semantic-action-primary);
    border-radius: 50%;
    height: 1rem;
    pointer-events: none;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 1rem;
  }

  .st-slider--sm .st-slider__thumb {
    height: 0.75rem;
    width: 0.75rem;
  }

  .st-slider--lg .st-slider__thumb {
    height: 1.25rem;
    width: 1.25rem;
  }

  .st-slider__tooltip {
    background: var(--st-semantic-text-primary);
    border-radius: var(--st-component-control-radius, 0.375rem);
    bottom: calc(100% + 0.375rem);
    color: var(--st-semantic-surface-default);
    font-size: 0.6875rem;
    font-weight: 600;
    left: 50%;
    line-height: 1;
    opacity: 0;
    padding: 0.25rem 0.375rem;
    pointer-events: none;
    position: absolute;
    transform: translateX(-50%);
    transition: opacity var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    white-space: nowrap;
  }

  .st-slider:hover .st-slider__tooltip,
  .st-slider:focus-within .st-slider__tooltip {
    opacity: 1;
  }

  .st-slider__input {
    appearance: none;
    background: transparent;
    height: 100%;
    inset: 0;
    margin: 0;
    padding: 0;
    position: absolute;
    width: 100%;
  }

  .st-slider__input:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: 4px;
  }

  .st-slider__input::-webkit-slider-thumb {
    appearance: none;
    background: transparent;
    border: 0;
    cursor: pointer;
    height: 1.5rem;
    width: 1.5rem;
  }

  .st-slider__input::-moz-range-thumb {
    background: transparent;
    border: 0;
    cursor: pointer;
    height: 1.5rem;
    width: 1.5rem;
  }

  .st-slider__input:disabled {
    cursor: not-allowed;
  }

  .st-slider:has(.st-slider__input:disabled) .st-slider__fill,
  .st-slider:has(.st-slider__input:disabled) .st-slider__thumb {
    background: var(--st-semantic-text-muted);
  }

  .st-slider:has([aria-invalid="true"]) .st-slider__fill,
  .st-slider:has([aria-invalid="true"]) .st-slider__thumb {
    background: var(--st-semantic-feedback-error);
  }
</style>

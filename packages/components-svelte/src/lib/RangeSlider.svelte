<script lang="ts" module>
  export type RangeSliderSize = "sm" | "md" | "lg";

  export type RangeSliderProps = {
    /** Valeur contrôlée [poignée basse, poignée haute]. Non-contrôlé si absent. */
    value?: [number, number];
    /** Valeur initiale en mode non-contrôlé. Défaut [min, max]. */
    defaultValue?: [number, number];
    min?: number;
    max?: number;
    step?: number;
    size?: RangeSliderSize;
    disabled?: boolean;
    label?: string;
    helperText?: string;
    errorText?: string;
    invalid?: boolean;
    showValue?: boolean;
    valueFormatter?: (value: number) => string;
    /** aria-label de la poignée basse. Défaut "Valeur minimale". */
    ariaLabelMin?: string;
    /** aria-label de la poignée haute. Défaut "Valeur maximale". */
    ariaLabelMax?: string;
    class?: string;
    onChange?: (value: [number, number]) => void;
  };
</script>

<script lang="ts">
  import { untrack } from "svelte";

  let {
    value,
    defaultValue,
    min = 0,
    max = 100,
    step = 1,
    size = "md",
    disabled = false,
    label,
    helperText,
    errorText,
    invalid = false,
    showValue = true,
    valueFormatter,
    ariaLabelMin = "Valeur minimale",
    ariaLabelMax = "Valeur maximale",
    class: className,
    onChange,
  }: RangeSliderProps = $props();

  // ── État interne (mode non-contrôlé) ──────────────────────────────────────
  function clampStep(n: number): number {
    if (!Number.isFinite(n)) return min;
    let v = Math.min(Math.max(n, min), max);
    if (Number.isFinite(step) && step > 0) {
      v = min + Math.round((v - min) / step) * step;
      v = Math.min(Math.max(v, min), max);
    }
    return v;
  }

  function normalizePair(pair: [number, number]): [number, number] {
    let lo = clampStep(pair[0]);
    let hi = clampStep(pair[1]);
    if (lo > hi) {
      // ne se croisent pas : on rabat sur la valeur la plus contraignante
      const mid = lo;
      lo = Math.min(mid, hi);
      hi = Math.max(mid, hi);
    }
    return [lo, hi];
  }

  let internal = $state<[number, number]>(
    untrack(() => normalizePair(defaultValue ?? [min, max]))
  );

  const isControlled = $derived(Array.isArray(value));

  const current = $derived.by<[number, number]>(() => {
    const source = isControlled ? (value as [number, number]) : internal;
    return normalizePair(source ?? [min, max]);
  });

  const lowValue = $derived(current[0]);
  const highValue = $derived(current[1]);

  const lowPercent = $derived(max === min ? 0 : ((lowValue - min) / (max - min)) * 100);
  const highPercent = $derived(max === min ? 0 : ((highValue - min) / (max - min)) * 100);

  const lowLabel = $derived(valueFormatter ? valueFormatter(lowValue) : String(lowValue));
  const highLabel = $derived(valueFormatter ? valueFormatter(highValue) : String(highValue));

  const fieldClasses = () => ["st-field", className].filter(Boolean).join(" ");
  const groupClasses = () =>
    ["st-rangeSlider", `st-rangeSlider--${size}`, disabled ? "st-rangeSlider--disabled" : null]
      .filter(Boolean)
      .join(" ");
  const isInvalid = () => invalid || Boolean(errorText);

  function commit(next: [number, number]) {
    const normalized = normalizePair(next);
    if (!isControlled) internal = normalized;
    onChange?.(normalized);
  }

  function setLow(raw: number) {
    if (disabled) return;
    const clamped = clampStep(raw);
    // la poignée basse ne dépasse pas la haute
    const lo = Math.min(clamped, highValue);
    commit([lo, highValue]);
  }

  function setHigh(raw: number) {
    if (disabled) return;
    const clamped = clampStep(raw);
    // la poignée haute ne passe pas sous la basse
    const hi = Math.max(clamped, lowValue);
    commit([lowValue, hi]);
  }

  function keyDelta(event: KeyboardEvent, value: number): number | null {
    const big = (Number.isFinite(step) && step > 0 ? step : 1) * 10;
    const small = Number.isFinite(step) && step > 0 ? step : 1;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        return value + small;
      case "ArrowLeft":
      case "ArrowDown":
        return value - small;
      case "PageUp":
        return value + big;
      case "PageDown":
        return value - big;
      case "Home":
        return min;
      case "End":
        return max;
      default:
        return null;
    }
  }

  function onLowKeydown(event: KeyboardEvent) {
    if (disabled) return;
    const next = keyDelta(event, lowValue);
    if (next === null) return;
    event.preventDefault();
    setLow(next);
  }

  function onHighKeydown(event: KeyboardEvent) {
    if (disabled) return;
    const next = keyDelta(event, highValue);
    if (next === null) return;
    event.preventDefault();
    setHigh(next);
  }
</script>

<div class={fieldClasses()}>
  <div class="st-rangeSlider__header">
    {#if label}<span class="st-field__label">{label}</span>{/if}
    {#if showValue}
      <output class="st-rangeSlider__value" aria-live="polite">{lowLabel} – {highLabel}</output>
    {/if}
  </div>
  <span class={groupClasses()}>
    <span class="st-rangeSlider__bounds" aria-hidden="true">{min}</span>
    <span class="st-rangeSlider__track" aria-invalid={isInvalid() ? "true" : undefined}>
      <span
        class="st-rangeSlider__fill"
        style={`left: ${lowPercent}%; width: ${Math.max(0, highPercent - lowPercent)}%`}
      ></span>
      <span
        class="st-rangeSlider__thumb st-rangeSlider__thumb--low"
        style={`left: ${lowPercent}%`}
        role="slider"
        tabindex={disabled ? -1 : 0}
        aria-label={ariaLabelMin}
        aria-valuemin={min}
        aria-valuemax={highValue}
        aria-valuenow={lowValue}
        aria-valuetext={lowLabel}
        aria-disabled={disabled ? "true" : undefined}
        onkeydown={onLowKeydown}
      >
        {#if showValue}<span class="st-rangeSlider__tooltip">{lowLabel}</span>{/if}
      </span>
      <span
        class="st-rangeSlider__thumb st-rangeSlider__thumb--high"
        style={`left: ${highPercent}%`}
        role="slider"
        tabindex={disabled ? -1 : 0}
        aria-label={ariaLabelMax}
        aria-valuemin={lowValue}
        aria-valuemax={max}
        aria-valuenow={highValue}
        aria-valuetext={highLabel}
        aria-disabled={disabled ? "true" : undefined}
        onkeydown={onHighKeydown}
      >
        {#if showValue}<span class="st-rangeSlider__tooltip">{highLabel}</span>{/if}
      </span>
    </span>
    <span class="st-rangeSlider__bounds" aria-hidden="true">{max}</span>
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

  .st-rangeSlider__header {
    align-items: baseline;
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
  }

  .st-rangeSlider__value {
    color: var(--st-semantic-text-secondary);
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
  }

  .st-rangeSlider {
    align-items: center;
    display: flex;
    gap: 0.75rem;
    width: 100%;
  }

  .st-rangeSlider__bounds {
    color: var(--st-semantic-text-muted);
    flex: 0 0 auto;
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
  }

  .st-rangeSlider__track {
    background: var(--st-component-control-border, var(--st-semantic-border-subtle));
    border-radius: 999px;
    flex: 1 1 auto;
    height: 0.25rem;
    position: relative;
  }

  .st-rangeSlider--sm .st-rangeSlider__track {
    height: 0.1875rem;
  }

  .st-rangeSlider--lg .st-rangeSlider__track {
    height: 0.375rem;
  }

  .st-rangeSlider__fill {
    background: var(--st-semantic-action-primary);
    border-radius: 999px;
    display: block;
    height: 100%;
    position: absolute;
    top: 0;
  }

  .st-rangeSlider__thumb {
    background: var(--st-semantic-action-primary);
    border-radius: 50%;
    box-sizing: border-box;
    cursor: pointer;
    height: 1rem;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 1rem;
  }

  .st-rangeSlider--sm .st-rangeSlider__thumb {
    height: 0.75rem;
    width: 0.75rem;
  }

  .st-rangeSlider--lg .st-rangeSlider__thumb {
    height: 1.25rem;
    width: 1.25rem;
  }

  .st-rangeSlider__thumb:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: 4px;
  }

  .st-rangeSlider__tooltip {
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

  .st-rangeSlider__thumb:hover .st-rangeSlider__tooltip,
  .st-rangeSlider__thumb:focus-visible .st-rangeSlider__tooltip {
    opacity: 1;
  }

  .st-rangeSlider--disabled .st-rangeSlider__thumb,
  .st-rangeSlider--disabled .st-rangeSlider__fill {
    background: var(--st-semantic-text-muted);
  }

  .st-rangeSlider--disabled .st-rangeSlider__thumb {
    cursor: not-allowed;
  }

  .st-rangeSlider__track[aria-invalid="true"] .st-rangeSlider__fill,
  .st-rangeSlider__track[aria-invalid="true"] .st-rangeSlider__thumb {
    background: var(--st-semantic-feedback-error);
  }

  @media (prefers-reduced-motion: reduce) {
    .st-rangeSlider__tooltip {
      transition: none;
    }
  }
</style>

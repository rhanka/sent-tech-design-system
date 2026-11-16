import { useCallback, useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import type { ComponentChildren, TargetedKeyboardEvent } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type RangeSliderSize = "sm" | "md" | "lg";

export type RangeSliderProps = {
  /** Controlled pair [low handle, high handle]. Uncontrolled when absent. */
  value?: MaybeSignal<[number, number]>;
  /** Initial value in uncontrolled mode. Defaults to [min, max]. */
  defaultValue?: [number, number];
  min?: number;
  max?: number;
  step?: number;
  size?: RangeSliderSize;
  disabled?: boolean;
  label?: ComponentChildren;
  helperText?: ComponentChildren;
  errorText?: ComponentChildren;
  invalid?: MaybeSignal<boolean>;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  /** Accessible name of the low handle. Defaults to "Valeur minimale". */
  ariaLabelMin?: string;
  /** Accessible name of the high handle. Defaults to "Valeur maximale". */
  ariaLabelMax?: string;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
  onChange?: (value: [number, number]) => void;
};

export function RangeSlider({
  value: valueInput,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  size = "md",
  disabled = false,
  label,
  helperText,
  errorText,
  invalid: invalidInput = false,
  showValue = true,
  valueFormatter,
  ariaLabelMin = "Valeur minimale",
  ariaLabelMax = "Valeur maximale",
  className,
  onChange,
}: RangeSliderProps) {
  const value = useValue(valueInput);
  const invalid = useValue(invalidInput);
  const clampStep = useCallback(
    (n: number): number => {
      if (!Number.isFinite(n)) return min;
      let v = Math.min(Math.max(n, min), max);
      if (Number.isFinite(step) && step > 0) {
        v = min + Math.round((v - min) / step) * step;
        v = Math.min(Math.max(v, min), max);
      }
      return v;
    },
    [min, max, step]
  );

  const normalizePair = useCallback(
    (pair: [number, number]): [number, number] => {
      let lo = clampStep(pair[0]);
      let hi = clampStep(pair[1]);
      if (lo > hi) {
        const mid = lo;
        lo = Math.min(mid, hi);
        hi = Math.max(mid, hi);
      }
      return [lo, hi];
    },
    [clampStep]
  );

  const isControlled = valueInput !== undefined;
  const [internal, setInternal] = useState<[number, number]>(() =>
    normalizePair(defaultValue ?? [min, max])
  );

  const current = normalizePair(
    (isControlled ? (value as [number, number]) : internal) ?? [min, max]
  );
  const lowValue = current[0];
  const highValue = current[1];

  const lowPercent = max === min ? 0 : ((lowValue - min) / (max - min)) * 100;
  const highPercent = max === min ? 0 : ((highValue - min) / (max - min)) * 100;

  const lowLabel = valueFormatter ? valueFormatter(lowValue) : String(lowValue);
  const highLabel = valueFormatter ? valueFormatter(highValue) : String(highValue);
  const isInvalid = invalid || Boolean(errorText);

  function commit(next: [number, number]) {
    const normalized = normalizePair(next);
    if (!isControlled) setInternal(normalized);
    onChange?.(normalized);
  }

  function setLow(raw: number) {
    if (disabled) return;
    const lo = Math.min(clampStep(raw), highValue);
    commit([lo, highValue]);
  }

  function setHigh(raw: number) {
    if (disabled) return;
    const hi = Math.max(clampStep(raw), lowValue);
    commit([lowValue, hi]);
  }

  function keyDelta(event: TargetedKeyboardEvent<HTMLSpanElement>, val: number): number | null {
    const big = (Number.isFinite(step) && step > 0 ? step : 1) * 10;
    const small = Number.isFinite(step) && step > 0 ? step : 1;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        return val + small;
      case "ArrowLeft":
      case "ArrowDown":
        return val - small;
      case "PageUp":
        return val + big;
      case "PageDown":
        return val - big;
      case "Home":
        return min;
      case "End":
        return max;
      default:
        return null;
    }
  }

  function onLowKeyDown(event: TargetedKeyboardEvent<HTMLSpanElement>) {
    if (disabled) return;
    const next = keyDelta(event, lowValue);
    if (next === null) return;
    event.preventDefault();
    setLow(next);
  }

  function onHighKeyDown(event: TargetedKeyboardEvent<HTMLSpanElement>) {
    if (disabled) return;
    const next = keyDelta(event, highValue);
    if (next === null) return;
    event.preventDefault();
    setHigh(next);
  }

  return (
    <div className={classNames("st-field", className)}>
      <div className="st-rangeSlider__header">
        {label ? <span className="st-field__label">{label}</span> : null}
        {showValue ? (
          <output className="st-rangeSlider__value" aria-live="polite">
            {lowLabel} – {highLabel}
          </output>
        ) : null}
      </div>
      <span
        className={classNames(
          "st-rangeSlider",
          `st-rangeSlider--${size}`,
          disabled && "st-rangeSlider--disabled"
        )}
      >
        <span className="st-rangeSlider__bounds" aria-hidden="true">
          {min}
        </span>
        <span className="st-rangeSlider__track" aria-invalid={isInvalid ? "true" : undefined}>
          <span
            className="st-rangeSlider__fill"
            style={{ left: `${lowPercent}%`, width: `${Math.max(0, highPercent - lowPercent)}%` }}
          />
          <span
            className="st-rangeSlider__thumb st-rangeSlider__thumb--low"
            style={{ left: `${lowPercent}%` }}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-label={ariaLabelMin}
            aria-valuemin={min}
            aria-valuemax={highValue}
            aria-valuenow={lowValue}
            aria-valuetext={lowLabel}
            aria-disabled={disabled || undefined}
            onKeyDown={onLowKeyDown}
          >
            {showValue ? <span className="st-rangeSlider__tooltip">{lowLabel}</span> : null}
          </span>
          <span
            className="st-rangeSlider__thumb st-rangeSlider__thumb--high"
            style={{ left: `${highPercent}%` }}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-label={ariaLabelMax}
            aria-valuemin={lowValue}
            aria-valuemax={max}
            aria-valuenow={highValue}
            aria-valuetext={highLabel}
            aria-disabled={disabled || undefined}
            onKeyDown={onHighKeyDown}
          >
            {showValue ? <span className="st-rangeSlider__tooltip">{highLabel}</span> : null}
          </span>
        </span>
        <span className="st-rangeSlider__bounds" aria-hidden="true">
          {max}
        </span>
      </span>
      {errorText ? (
        <span className="st-field__error">{errorText}</span>
      ) : helperText ? (
        <span className="st-field__help">{helperText}</span>
      ) : null}
    </div>
  );
}

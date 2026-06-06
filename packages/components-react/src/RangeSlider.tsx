import * as React from "react";
import { classNames } from "./classNames.js";

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
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  invalid?: boolean;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  /** aria-label de la poignée basse. Défaut "Valeur minimale". */
  ariaLabelMin?: string;
  /** aria-label de la poignée haute. Défaut "Valeur maximale". */
  ariaLabelMax?: string;
  className?: string;
  onChange?: (value: [number, number]) => void;
};

export function RangeSlider({
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
  className,
  onChange,
}: RangeSliderProps) {
  const clampStep = React.useCallback(
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

  const normalizePair = React.useCallback(
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

  const isControlled = Array.isArray(value);
  const [internal, setInternal] = React.useState<[number, number]>(() =>
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

  function keyDelta(event: React.KeyboardEvent, val: number): number | null {
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

  function onLowKeyDown(event: React.KeyboardEvent<HTMLSpanElement>) {
    if (disabled) return;
    const next = keyDelta(event, lowValue);
    if (next === null) return;
    event.preventDefault();
    setLow(next);
  }

  function onHighKeyDown(event: React.KeyboardEvent<HTMLSpanElement>) {
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

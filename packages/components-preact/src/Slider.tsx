import type { InputHTMLAttributes } from "preact";
import { useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import { textChange } from "./runtime.js";
import type { ComponentChildren, TargetedEvent } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type SliderProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "onChange"> & {
  label?: ComponentChildren;
  size?: "sm" | "md" | "lg";
  helperText?: ComponentChildren;
  errorText?: ComponentChildren;
  invalid?: MaybeSignal<boolean>;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  onChange?: (value: number) => void;
};

export function Slider({
  label,
  size = "md",
  value: valueInput,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  helperText,
  errorText,
  invalid: invalidInput = false,
  showValue = true,
  valueFormatter,
  disabled,
  className,
  onChange,
  ...rest
}: SliderProps) {
  const value = useValue(valueInput);
  const invalid = useValue(invalidInput);
  const numMin = Number(min);
  const numMax = Number(max);
  const initial = Number(value ?? defaultValue ?? numMin);
  const [current, setCurrent] = useState(Number.isFinite(initial) ? initial : numMin);
  const controlled = valueInput !== undefined;
  const raw = controlled ? Number(value) : current;
  const safe = !Number.isFinite(raw) ? numMin : raw < numMin ? numMin : raw > numMax ? numMax : raw;
  const percent = numMax === numMin ? 0 : ((safe - numMin) / (numMax - numMin)) * 100;
  const formatted = valueFormatter ? valueFormatter(safe) : String(safe);
  const isInvalid = invalid || Boolean(errorText);
  const labelText = typeof label === "string" ? label : undefined;

  function handleChange(event: TargetedEvent<HTMLInputElement>) {
    const next = Number(event.currentTarget.value);
    if (Number.isFinite(next)) {
      if (!controlled) setCurrent(next);
      onChange?.(next);
    }
  }

  return (
    <div className={classNames("st-field", className)}>
      <div className="st-slider__header">
        {label ? <span className="st-field__label">{label}</span> : null}
        {showValue ? <output className="st-slider__value" aria-live="polite">{formatted}</output> : null}
      </div>
      <span className={classNames("st-slider", `st-slider--${size}`)}>
        <span className="st-slider__bounds" aria-hidden="true">{numMin}</span>
        <span className="st-slider__track">
          <span className="st-slider__fill" style={{ ["--st-slider-fill" as string]: `${percent}%` }} />
          <span className="st-slider__thumb" style={{ left: `${percent}%` }} aria-hidden="true">
            {showValue ? <span className="st-slider__tooltip">{formatted}</span> : null}
          </span>
          <input
            {...rest}
            {...textChange<HTMLInputElement>(handleChange)}
            className="st-slider__input"
            type="range"
            aria-label={labelText}
            aria-invalid={isInvalid ? "true" : undefined}
            value={safe}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
          />
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

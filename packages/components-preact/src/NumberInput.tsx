import type { InputHTMLAttributes } from "preact";
import { useId, useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import { textChange } from "./runtime.js";
import type { ComponentChildren, TargetedEvent } from "./runtime.js";
import { useValue } from "./signals.js";

export type NumberInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
  label?: ComponentChildren;
  helperText?: ComponentChildren;
  errorText?: ComponentChildren;
  size?: "sm" | "md" | "lg";
  incrementLabel?: string;
  decrementLabel?: string;
};

export function NumberInput({
  label,
  helperText,
  errorText,
  size = "md",
  className,
  incrementLabel = "Increment value",
  decrementLabel = "Decrement value",
  min,
  max,
  step = 1,
  value: valueInput,
  defaultValue,
  disabled,
  onChange,
  ...rest
}: NumberInputProps) {
  const numMin = min !== undefined && min !== "" ? Number(min) : undefined;
  const numMax = max !== undefined && max !== "" ? Number(max) : undefined;
  const numStep = step !== undefined && step !== "" ? Number(step) : 1;
  const value = useValue(valueInput);
  const initial = value ?? defaultValue;
  const [current, setCurrent] = useState<number | null>(
    initial !== undefined && initial !== null && initial !== "" ? Number(initial) : null,
  );
  const controlled = valueInput !== undefined;
  const numValue = controlled
    ? value === null || (value as unknown) === "" ? null : Number(value)
    : current;

  const clamp = (n: number) => {
    if (numMin !== undefined && n < numMin) return numMin;
    if (numMax !== undefined && n > numMax) return numMax;
    return n;
  }
  const isAtMin = numValue !== null && numMin !== undefined && numValue <= numMin;
  const isAtMax = numValue !== null && numMax !== undefined && numValue >= numMax;

  const setValue = (next: number | null) => {
    if (!controlled) setCurrent(next);
  }
  function handleChange(event: TargetedEvent<HTMLInputElement>) {
    const raw = event.currentTarget.value;
    setValue(raw === "" ? null : Number.isFinite(Number(raw)) ? Number(raw) : numValue);
    onChange?.(event);
  }
  const increment = () => setValue(clamp((numValue ?? numMin ?? 0) + numStep));
  const decrement = () => setValue(clamp((numValue ?? numMax ?? 0) - numStep));
  const reactId = useId();
  const inputId = `st-field-${reactId}`;
  const isInvalid = Boolean(errorText);

  return (
    <div className={classNames("st-field", className)}>
      <label className="st-field__control" htmlFor={inputId}>
        {label ? <span className="st-field__label">{label}</span> : null}
        <span className={classNames("st-numberInput", `st-numberInput--${size}`)}>
          <input
            {...rest}
            {...textChange<HTMLInputElement>(handleChange)}
            id={inputId}
            className="st-numberInput__control"
            type="number"
            value={numValue ?? ""}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            aria-invalid={isInvalid ? "true" : undefined}
          />
          <span className="st-numberInput__buttons">
            <button type="button" className="st-numberInput__button" aria-label={decrementLabel} disabled={disabled || isAtMin} onClick={decrement}>
              <span aria-hidden="true">−</span>
            </button>
            <button type="button" className="st-numberInput__button" aria-label={incrementLabel} disabled={disabled || isAtMax} onClick={increment}>
              <span aria-hidden="true">+</span>
            </button>
          </span>
        </span>
      </label>
      {errorText ? (
        <span className="st-field__error">{errorText}</span>
      ) : helperText ? (
        <span className="st-field__help">{helperText}</span>
      ) : null}
    </div>
  );
}

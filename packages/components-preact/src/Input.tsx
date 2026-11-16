import type { InputHTMLAttributes } from "preact";
import { useId } from "preact/hooks";
import { classNames } from "./classNames.js";
import { forwardRef, textChange } from "./runtime.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type InputSize = "sm" | "md" | "lg";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: ComponentChildren;
  helperText?: ComponentChildren;
  errorText?: ComponentChildren;
  invalid?: MaybeSignal<boolean>;
  size?: InputSize;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      errorText,
      invalid: invalidInput = false,
      size = "md",
      className,
      id,
      "aria-invalid": ariaInvalid,
      onChange: onChangeProp,
      ...rest
    },
    ref,
  ) => {
    const generatedId = useId();
    const invalid = useValue(invalidInput);
    const inputId = id ?? `st-input-${generatedId}`;
    const isInvalid = invalid || Boolean(errorText);

    return (
      <div className={classNames("st-field", className)}>
        <label className="st-field__control" htmlFor={inputId}>
          {label ? <span className="st-field__label">{label}</span> : null}
          <input
            {...rest}
            {...(onChangeProp ? textChange<HTMLInputElement>(onChangeProp) : {})}
            ref={ref}
            id={inputId}
            className={classNames("st-control", `st-control--${size}`)}
            aria-invalid={isInvalid ? "true" : ariaInvalid}
          />
        </label>
        {errorText ? (
          <span className="st-field__error">{errorText}</span>
        ) : helperText ? (
          <span className="st-field__help">{helperText}</span>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

import type { InputHTMLAttributes } from "preact";
import { useId } from "preact/hooks";
import { classNames } from "./classNames.js";
import { forwardRef } from "./runtime.js";
import type { ComponentChildren } from "./runtime.js";

export type InputSize = "sm" | "md" | "lg";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: ComponentChildren;
  helperText?: ComponentChildren;
  errorText?: ComponentChildren;
  invalid?: boolean;
  size?: InputSize;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      errorText,
      invalid = false,
      size = "md",
      className,
      id,
      "aria-invalid": ariaInvalid,
      ...rest
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? `st-input-${generatedId}`;
    const isInvalid = invalid || Boolean(errorText);

    return (
      <div className={classNames("st-field", className)}>
        <label className="st-field__control" htmlFor={inputId}>
          {label ? <span className="st-field__label">{label}</span> : null}
          <input
            {...rest}
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

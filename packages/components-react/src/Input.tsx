import React from "react";
import { classNames } from "./classNames.js";

export type InputSize = "sm" | "md" | "lg";

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  invalid?: boolean;
  size?: InputSize;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
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
    const reactId = React.useId();
    const inputId = id ?? `st-input-${reactId}`;
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

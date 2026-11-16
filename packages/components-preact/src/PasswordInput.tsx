import { Eye, EyeOff } from "lucide-preact";
import type { InputHTMLAttributes } from "preact";
import { useId, useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import { textChange } from "./runtime.js";
import type { ComponentChildren } from "./runtime.js";

export type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
  label?: ComponentChildren;
  helperText?: ComponentChildren;
  errorText?: ComponentChildren;
  size?: "sm" | "md" | "lg";
  showLabel?: string;
  hideLabel?: string;
};

export function PasswordInput({ label, helperText, errorText, size = "md", showLabel = "Show password", hideLabel = "Hide password", className, onChange: onChangeProp, onInput: onInputProp, ...rest }: PasswordInputProps) {
  const [shown, setShown] = useState(false);
  const reactId = useId();
  const inputId = `st-field-${reactId}`;
  const isInvalid = Boolean(errorText);
  return (
    <div className={classNames("st-field", className)}>
      <label className="st-field__control" htmlFor={inputId}>
        {label ? <span className="st-field__label">{label}</span> : null}
        <span className={classNames("st-passwordInput", `st-passwordInput--${size}`)}>
          <input {...rest} {...(onChangeProp ? textChange<HTMLInputElement>(onChangeProp, onInputProp) : onInputProp ? { onInput: onInputProp } : {})} id={inputId} className="st-passwordInput__control" type={shown ? "text" : "password"} aria-invalid={isInvalid ? "true" : undefined} />
          <button type="button" className="st-passwordInput__toggle" aria-label={shown ? hideLabel : showLabel} aria-pressed={shown ? "true" : "false"} onClick={() => setShown((next) => !next)}>
            {shown ? <EyeOff size={16} strokeWidth={2} aria-hidden="true" /> : <Eye size={16} strokeWidth={2} aria-hidden="true" />}
          </button>
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

import type { TextareaHTMLAttributes } from "preact";
import { useId } from "preact/hooks";
import { classNames } from "./classNames.js";
import { textChange } from "./runtime.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ComponentChildren;
  helperText?: ComponentChildren;
  errorText?: ComponentChildren;
  invalid?: MaybeSignal<boolean>;
};

export function Textarea({ label, helperText, errorText, invalid: invalidInput, className, onChange: onChangeProp, ...rest }: TextareaProps) {
  const invalid = useValue(invalidInput);
  const reactId = useId();
  const inputId = `st-field-${reactId}`;
  const isInvalid = invalid || Boolean(errorText);
  return (
    <div className={classNames("st-field", className)}>
      <label className="st-field__control" htmlFor={inputId}>
        {label ? <span className="st-field__label">{label}</span> : null}
        <textarea {...rest} {...(onChangeProp ? textChange<HTMLTextAreaElement>(onChangeProp) : {})} id={inputId} className="st-textarea st-control" aria-invalid={isInvalid ? "true" : undefined} />
      </label>
      {errorText ? (
        <span className="st-field__error">{errorText}</span>
      ) : helperText ? (
        <span className="st-field__help">{helperText}</span>
      ) : null}
    </div>
  );
}

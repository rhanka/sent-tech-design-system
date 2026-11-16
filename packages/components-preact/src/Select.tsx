import type { SelectHTMLAttributes } from "preact";
import { useId } from "preact/hooks";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

type OptionItem = { value: string; label: ComponentChildren; disabled?: boolean }

function renderOptions(options?: Array<OptionItem | { id?: string; value?: string; label?: ComponentChildren }>) {
  return options?.map((item, index) => {
    const value = (item as OptionItem).value ?? (item as { id?: string }).id ?? String(index);
    const label = (item as OptionItem).label ?? value;
    const disabled = "disabled" in item ? Boolean((item as { disabled?: boolean }).disabled) : false;
    return (
      <option key={value} value={value} disabled={disabled}>
        {label as ComponentChildren}
      </option>
    );
  });
}

function useFieldId(id?: string, prefix = "st-field"): string {
  const reactId = useId();
  return id ?? `${prefix}-${reactId}`;
}

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  label?: ComponentChildren;
  helperText?: ComponentChildren;
  errorText?: ComponentChildren;
  invalid?: MaybeSignal<boolean>;
  size?: "sm" | "md" | "lg";
  options?: OptionItem[];
};

export function Select({ label, helperText, errorText, invalid: invalidInput, size = "md", options, className, children, ...rest }: SelectProps) {
  const invalid = useValue(invalidInput);
  // Like the shared field helper in `components-react`, the control id is
  // always generated: a consumer `id` in `...rest` is overridden below.
  const inputId = useFieldId();
  const isInvalid = invalid || Boolean(errorText);
  return (
    <div className={classNames("st-field", className)}>
      <label className="st-field__control" htmlFor={inputId}>
        {label ? <span className="st-field__label">{label}</span> : null}
        <select {...rest} id={inputId} className={classNames("st-select", `st-select--${size}`)} aria-invalid={isInvalid ? "true" : undefined}>
          {children ?? renderOptions(options)}
        </select>
      </label>
      {errorText ? (
        <span className="st-field__error">{errorText}</span>
      ) : helperText ? (
        <span className="st-field__help">{helperText}</span>
      ) : null}
    </div>
  );
}

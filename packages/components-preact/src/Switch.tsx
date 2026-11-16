import type { InputHTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ComponentChildren;
  helperText?: ComponentChildren;
};

export function Switch({ label, helperText, className, ...rest }: SwitchProps) {
  const checked = useValue(rest.checked);
  const defaultChecked = useValue(rest.defaultChecked);
  const raw = checked ?? defaultChecked;
  return (
    <label className={classNames("st-switch", className)}>
      <input {...rest} className="st-switch__input" type="checkbox" role="switch" aria-checked={raw == null ? undefined : raw ? "true" : "false"} />
      <span className="st-switch__track"><span className="st-switch__thumb" /></span>
      <span className="st-switch__content">
        <span className="st-switch__label">{label}</span>
        {helperText ? <span className="st-switch__help">{helperText}</span> : null}
      </span>
    </label>
  );
}

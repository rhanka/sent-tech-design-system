import type { InputHTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";

export type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  label: ComponentChildren;
  labelOn?: string;
  labelOff?: string;
  helperText?: ComponentChildren;
  size?: "sm" | "md";
};

export function Toggle({ label, labelOn = "On", labelOff = "Off", helperText, size = "md", className, ...rest }: ToggleProps) {
  const checked = useValue(rest.checked);
  const isChecked = (checked ?? rest.defaultChecked ?? false) ? true : false;
  return (
    <label className={classNames("st-toggle", `st-toggle--${size}`, className)}>
      <span className="st-toggle__label">{label}</span>
      <span className="st-toggle__row">
        <input {...rest} className="st-toggle__input" type="checkbox" role="switch" aria-checked={isChecked ? "true" : "false"} />
        <span className="st-toggle__track" aria-hidden="true"><span className="st-toggle__thumb" /></span>
        <span className="st-toggle__state" aria-hidden="true">{isChecked ? labelOn : labelOff}</span>
      </span>
      {helperText ? <span className="st-toggle__help">{helperText}</span> : null}
    </label>
  );
}

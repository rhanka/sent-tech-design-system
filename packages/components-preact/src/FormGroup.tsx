import type { FieldsetHTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";

export type FormGroupProps = FieldsetHTMLAttributes<HTMLFieldSetElement> & {
  legend: ComponentChildren;
  helperText?: ComponentChildren;
};

export function FormGroup({ legend, helperText, children, className, ...rest }: FormGroupProps) {
  return (
    <fieldset {...rest} className={classNames("st-form-group st-formGroup", className)}>
      {legend ? <legend className="st-form-group__legend st-formGroup__legend">{legend}</legend> : null}
      <div className="st-form-group__body st-formGroup__body">{children}</div>
      {helperText ? <p className="st-form-group__help st-formGroup__help">{helperText}</p> : null}
    </fieldset>
  );
}

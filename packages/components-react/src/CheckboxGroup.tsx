import React from "react";
import { classNames } from "./classNames.js";
import { Checkbox } from "./Checkbox.js";

export interface CheckboxGroupOption {
  label: string;
  value: string;
  disabled?: boolean;
  helperText?: string;
}

export type CheckboxGroupProps = Omit<
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "className" | "onChange"
> & {
  legend: string;
  /** Valeurs cochées (liste contrôlée). */
  value?: string[];
  onChange?: (value: string[]) => void;
  orientation?: "vertical" | "horizontal";
  /** Nom partagé par les cases (utile pour la soumission de formulaire). */
  name?: string;
  options?: CheckboxGroupOption[];
  /** Description optionnelle affichée sous la légende. */
  helperText?: string;
  /** Désactive le groupe entier. */
  disabled?: boolean;
  className?: string;
};

export const CheckboxGroup = React.forwardRef<HTMLFieldSetElement, CheckboxGroupProps>(
  (
    {
      legend,
      value = [],
      onChange,
      orientation = "vertical",
      name,
      options = [],
      helperText,
      disabled = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const classes = classNames("st-checkboxGroup", `st-checkboxGroup--${orientation}`, className);

    function toggle(optionValue: string, checked: boolean) {
      const next = checked ? [...value, optionValue] : value.filter((v) => v !== optionValue);
      onChange?.(next);
    }

    return (
      <fieldset {...rest} ref={ref} className={classes} disabled={disabled}>
        <legend className="st-checkboxGroup__legend">{legend}</legend>
        {helperText ? <p className="st-checkboxGroup__help">{helperText}</p> : null}
        <div className="st-checkboxGroup__options">
          {options.map((option) => (
            <Checkbox
              key={option.value}
              label={option.label}
              helperText={option.helperText}
              name={name}
              value={option.value}
              checked={value.includes(option.value)}
              disabled={option.disabled}
              onChange={(event) => toggle(option.value, event.currentTarget.checked)}
            />
          ))}
          {children}
        </div>
      </fieldset>
    );
  },
);

CheckboxGroup.displayName = "CheckboxGroup";

import React from "react";
import { classNames } from "./classNames.js";
import { Radio } from "./Radio.js";

export interface RadioGroupOption {
  label: string;
  value: string;
  disabled?: boolean;
  helperText?: string;
}

export type RadioGroupProps = Omit<
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "className" | "onChange"
> & {
  legend: string;
  /** Valeur sélectionnée (contrôlée). */
  value?: string;
  onChange?: (value: string) => void;
  orientation?: "vertical" | "horizontal";
  /** Nom partagé garantissant l'exclusivité radio. Requis. */
  name: string;
  options?: RadioGroupOption[];
  helperText?: string;
  /** Désactive le groupe entier. */
  disabled?: boolean;
  className?: string;
};

export const RadioGroup = React.forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  (
    {
      legend,
      value,
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
    const classes = classNames("st-radioGroup", `st-radioGroup--${orientation}`, className);

    function select(optionValue: string) {
      if (optionValue === value) return;
      onChange?.(optionValue);
    }

    return (
      <fieldset {...rest} ref={ref} className={classes} disabled={disabled}>
        <legend className="st-radioGroup__legend">{legend}</legend>
        {helperText ? <p className="st-radioGroup__help">{helperText}</p> : null}
        <div className="st-radioGroup__options">
          {options.map((option) => (
            <Radio
              key={option.value}
              label={option.label}
              helperText={option.helperText}
              name={name}
              value={option.value}
              checked={value === option.value}
              disabled={option.disabled}
              onChange={() => select(option.value)}
            />
          ))}
          {children}
        </div>
      </fieldset>
    );
  },
);

RadioGroup.displayName = "RadioGroup";

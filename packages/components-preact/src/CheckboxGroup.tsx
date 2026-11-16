import type { FieldsetHTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { Checkbox } from "./Checkbox.js";
import { forwardRef } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export interface CheckboxGroupOption {
  label: string;
  value: string;
  disabled?: boolean;
  helperText?: string;
}

export type CheckboxGroupProps = Omit<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "className" | "onChange"
> & {
  legend: string;
  /** Checked values (controlled list). */
  value?: MaybeSignal<string[]>;
  onChange?: (value: string[]) => void;
  orientation?: "vertical" | "horizontal";
  /** Shared name for the boxes (useful for form submission). */
  name?: string;
  options?: CheckboxGroupOption[];
  /** Optional description shown under the legend. */
  helperText?: string;
  /** Disables the whole group. */
  disabled?: MaybeSignal<boolean>;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
}

export const CheckboxGroup = forwardRef<HTMLFieldSetElement, CheckboxGroupProps>(
  (
    {
      legend,
      value: valueInput = [],
      onChange,
      orientation = "vertical",
      name,
      options = [],
      helperText,
      disabled: disabledInput = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const value = useValue(valueInput);
    const disabled = useValue(disabledInput) ?? false;
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

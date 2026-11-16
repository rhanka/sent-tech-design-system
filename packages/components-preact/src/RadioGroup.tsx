import type { FieldsetHTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { Radio } from "./Radio.js";
import { forwardRef } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export interface RadioGroupOption {
  label: string;
  value: string;
  disabled?: boolean;
  helperText?: string;
}

export type RadioGroupProps = Omit<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "className" | "onChange"
> & {
  legend: string;
  /** Selected value (controlled). */
  value?: MaybeSignal<string>;
  onChange?: (value: string) => void;
  orientation?: "vertical" | "horizontal";
  /** Shared name guaranteeing radio exclusivity. Required. */
  name: string;
  options?: RadioGroupOption[];
  helperText?: string;
  /** Disables the whole group. */
  disabled?: MaybeSignal<boolean>;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
}

export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  (
    {
      legend,
      value: valueInput,
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

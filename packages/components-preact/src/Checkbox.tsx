import type { InputHTMLAttributes } from "preact";
import { useId } from "preact/hooks";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type ChoiceProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ComponentChildren;
  helperText?: ComponentChildren;
  /** Secondary muted description line under the label (e.g. a filter hint). */
  description?: ComponentChildren;
  /** Trailing slot pushed to the row end (e.g. a count Badge). */
  trailing?: ComponentChildren;
  /** Plain value, or a signal in the Preact build (read at the edge). */
  invalid?: MaybeSignal<boolean>;
};

export type CheckboxProps = ChoiceProps;

function Choice({ type, label, helperText, description, trailing, invalid: invalidInput = false, className, ...rest }: ChoiceProps & { type: "checkbox" | "radio" }) {
  const reactId = useId();
  const invalid = useValue(invalidInput);
  const descriptionId = `${reactId}-description`;
  // Merge our description id with any consumer-provided aria-describedby so we
  // never clobber an existing one. A signal holding `undefined` counts as
  // absent, so it is unwrapped before the merge.
  const describedByProp = useValue(rest["aria-describedby"] as MaybeSignal<string | undefined>);
  const describedBy = description
    ? [describedByProp, descriptionId].filter(Boolean).join(" ")
    : describedByProp;
  return (
    <label
      className={classNames(
        "st-choice",
        `st-choice--${type}`,
        description ? "st-choice--described" : null,
        className,
      )}
    >
      <input
        {...rest}
        className="st-choice__input"
        type={type}
        aria-invalid={invalid ? "true" : undefined}
        aria-describedby={describedBy}
      />
      <span className="st-choice__content">
        <span className="st-choice__label">{label}</span>
        {description ? <span className="st-choice__description" id={descriptionId}>{description}</span> : null}
        {helperText ? <span className="st-choice__help">{helperText}</span> : null}
      </span>
      {trailing ? <span className="st-choice__trailing">{trailing}</span> : null}
    </label>
  );
}

export function Checkbox(props: ChoiceProps) {
  return <Choice {...props} type="checkbox" />;
}

import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type LanguageOption = { value: string; label: ComponentChildren };

export type LanguageSelectorProps = Omit<HTMLAttributes<HTMLDivElement>, "className" | "onChange"> & {
  options: LanguageOption[];
  /** Plain value, or a signal in the Preact build (read at the edge). */
  value?: MaybeSignal<string>;
  onChange?: (value: string) => void;
  /** Plain value, or a signal in the Preact build (read at the edge). */
  open?: MaybeSignal<boolean>;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export function LanguageSelector({
  options,
  value: valueInput,
  onChange,
  open: openInput = false,
  className,
  ...rest
}: LanguageSelectorProps) {
  const value = useValue(valueInput);
  const open = useValue(openInput);
  const current = options.find((option) => option.value === value) ?? options[0];
  return (
    <div {...rest} className={classNames("st-languageSelector", className)}>
      <button type="button" className="st-languageSelector__trigger">
        <span className="st-languageSelector__current">{current?.label}</span>
      </button>
      {open ? (
        <ul className="st-languageSelector__menu">
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className={classNames(
                  "st-languageSelector__option",
                  option.value === value && "st-languageSelector__option--active",
                )}
                onClick={() => onChange?.(option.value)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

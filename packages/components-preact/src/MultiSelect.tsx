import { ChevronDown, X } from "lucide-preact";
import type { HTMLAttributes } from "preact";
import { useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import { text, useControlled } from "./internal.js";
import { textInput } from "./runtime.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export interface MultiSelectOption {
  value: string;
  label: ComponentChildren;
  disabled?: boolean;
}

export type MultiSelectProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  label?: ComponentChildren;
  helperText?: ComponentChildren;
  errorText?: ComponentChildren;
  invalid?: MaybeSignal<boolean>;
  options: MultiSelectOption[];
  /** Plain value, or a signal in the Preact build (read at the edge). */
  value?: MaybeSignal<string[]>;
  values?: MaybeSignal<string[]>;
  /** Svelte-canonical alias for the selected values. */
  selected?: MaybeSignal<string[]>;
  size?: "sm" | "md" | "lg";
  /** Plain value, or a signal in the Preact build (read at the edge). */
  open?: MaybeSignal<boolean>;
  locale?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsLabel?: string;
  toggleLabel?: string;
  removeLabel?: string;
  listLabel?: string;
  disabled?: MaybeSignal<boolean>;
  onChange?: (values: string[]) => void;
};

export function MultiSelect({
  label,
  helperText,
  errorText,
  invalid: invalidInput = false,
  options,
  value: valueInput,
  values: valuesInput,
  selected: selectedAliasInput,
  size = "md",
  open: openInput,
  locale = "fr-FR",
  placeholder,
  searchPlaceholder,
  noResultsLabel,
  toggleLabel,
  removeLabel,
  listLabel,
  disabled: disabledInput = false,
  onChange,
  className,
  ...rest
}: MultiSelectProps) {
  const isFr = (locale ?? "fr-FR").toLowerCase().startsWith("fr");
  const resolvedPlaceholder = placeholder ?? (isFr ? "Sélectionner des éléments" : "Select items");
  const resolvedSearchPlaceholder = searchPlaceholder ?? (isFr ? "Filtrer" : "Filter");
  const resolvedNoResultsLabel = noResultsLabel ?? (isFr ? "Aucun résultat" : "No results");
  const resolvedToggleLabel = toggleLabel ?? (isFr ? "Afficher les options" : "Toggle options");
  const resolvedRemoveLabel = removeLabel ?? (isFr ? "Supprimer" : "Remove");
  const [open, setOpen] = useControlled(useValue(openInput), false);
  const invalid = useValue(invalidInput);
  const disabled = useValue(disabledInput) ?? false;
  const initialSelected = useValue(valueInput) ?? useValue(valuesInput) ?? useValue(selectedAliasInput);
  const [selectedValues, setSelectedValues] = useControlled(initialSelected, initialSelected ?? [], onChange);
  const [query, setQuery] = useState("");
  const selected = new Set(selectedValues);
  const selectedOptions = selectedValues
    .map((entry) => options.find((option) => option.value === entry))
    .filter((option): option is MultiSelectOption => Boolean(option));
  const isInvalid = invalid || Boolean(errorText);
  const filtered = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => text(option.label).toLowerCase().includes(q));
  })();
  const toggleOption = (option: MultiSelectOption) => {
    if (option.disabled) return;
    const next = selected.has(option.value)
      ? selectedValues.filter((entry) => entry !== option.value)
      : [...selectedValues, option.value];
    setSelectedValues(next);
  }
  const removeOption = (optionValue: string) => {
    setSelectedValues(selectedValues.filter((entry) => entry !== optionValue));
  }

  return (
    <div
      {...rest}
      className={classNames("st-field", className)}
      role="group"
      aria-label={text(label) || undefined}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          setOpen(false);
        }
      }}
    >
      {label ? <span className="st-field__label">{label}</span> : null}
      {selectedOptions.length > 0 ? (
        <span className="st-multiSelect__tags">
          {selectedOptions.map((option) => (
            <span key={option.value} className="st-multiSelect__tag">
              <span className="st-multiSelect__tagLabel">{option.label}</span>
              <button
                type="button"
                className="st-multiSelect__tagRemove"
                aria-label={`${resolvedRemoveLabel} ${text(option.label)}`}
                disabled={disabled}
                onClick={() => removeOption(option.value)}
              >
                <X size={14} strokeWidth={2.25} aria-hidden="true" />
              </button>
            </span>
          ))}
        </span>
      ) : null}
      <span className={classNames("st-multiSelect", `st-multiSelect--${size}`)} data-invalid={isInvalid ? "true" : undefined}>
        <button
          type="button"
          className="st-multiSelect__trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          onClick={() => setOpen(!open)}
        >
          {selectedOptions.length === 0 ? (
            <span className="st-multiSelect__placeholder">{resolvedPlaceholder}</span>
          ) : (
            <span className="st-multiSelect__count">{selectedOptions.length} {isFr ? "sélectionné(s)" : "selected"}</span>
          )}
          <span className="st-multiSelect__caret" aria-hidden="true">
            <ChevronDown className={classNames("st-multiSelect__caretIcon", open && "st-multiSelect__caretIcon--open")} size={18} strokeWidth={2.25} aria-hidden="true" />
          </span>
          <span className="st-visually-hidden">{resolvedToggleLabel}</span>
        </button>
      </span>
      {open ? (
        <div className="st-multiSelect__panel">
          <input
            type="search"
            className="st-multiSelect__search"
            placeholder={resolvedSearchPlaceholder}
            value={query}
            aria-label={resolvedSearchPlaceholder}
            {...textInput<HTMLInputElement>(setQuery)}
          />
          <div className="st-multiSelect__list" role="listbox" aria-label={text(listLabel) || text(label) || "Options"} aria-multiselectable="true">
            {filtered.length === 0 ? (
              <div className="st-multiSelect__empty">{resolvedNoResultsLabel}</div>
            ) : (
              filtered.map((option) => {
                const isSelected = selected.has(option.value);
                return (
                  <button
                    key={option.value}
                    className="st-multiSelect__option"
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled ? "true" : undefined}
                    disabled={option.disabled}
                    onClick={() => toggleOption(option)}
                  >
                    <span className="st-multiSelect__check" aria-hidden="true">{isSelected ? "✓" : null}</span>
                    <span>{option.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
      {errorText ? (
        <span className="st-field__error">{errorText}</span>
      ) : helperText ? (
        <span className="st-field__help">{helperText}</span>
      ) : null}
    </div>
  );
}

import { ChevronDown, X } from "lucide-preact";
import type { HTMLAttributes } from "preact";
import { useId, useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import { moveIndex, text, useControlled } from "./internal.js";
import { textInput } from "./runtime.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export interface ComboboxOption {
  value: string;
  label: ComponentChildren;
  disabled?: boolean;
}

export type ComboboxProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  label?: ComponentChildren;
  helperText?: ComponentChildren;
  errorText?: ComponentChildren;
  invalid?: MaybeSignal<boolean>;
  options: ComboboxOption[];
  /** Plain value, or a signal in the Preact build (read at the edge). */
  value?: MaybeSignal<string>;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  disabled?: MaybeSignal<boolean>;
  /** Plain value, or a signal in the Preact build (read at the edge). */
  open?: MaybeSignal<boolean>;
  allowCustomValue?: MaybeSignal<boolean>;
  noResultsLabel?: ComponentChildren;
  /** Accessible name for the options listbox. Defaults to `label`. */
  listLabel?: string;
  clearLabel?: string;
  toggleLabel?: string;
  onChange?: (value: string) => void;
  onSelect?: (value: string) => void;
};

export function Combobox({
  label,
  helperText,
  errorText,
  invalid: invalidInput = false,
  options,
  value: valueInput,
  size = "md",
  placeholder = "Select or type",
  disabled: disabledInput = false,
  open: openInput,
  allowCustomValue: allowCustomValueInput = true,
  noResultsLabel = "No results",
  listLabel,
  clearLabel = "Clear selection",
  toggleLabel = "Toggle options",
  onChange,
  onSelect,
  className,
  ...rest
}: ComboboxProps) {
  const reactId = useId();
  const inputId = `st-combobox-input-${reactId}`;
  const listId = `st-combobox-list-${reactId}`;
  const value = useValue(valueInput);
  const invalid = useValue(invalidInput);
  const disabled = useValue(disabledInput) ?? false;
  const allowCustomValue = useValue(allowCustomValueInput) ?? true;
  const initial = text(options.find((option) => option.value === value)?.label ?? value ?? "");
  const [inputValue, setInputValue] = useState<string>(initial);
  const [open, setOpen] = useControlled(useValue(openInput), false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const filtered = options.filter((option) => {
    const query = inputValue.trim().toLowerCase();
    return !query || text(option.label).toLowerCase().includes(query);
  });
  const selected = options.find((option) => option.value === value);
  const isInvalid = invalid || Boolean(errorText);
  const selectOption = (option: ComboboxOption) => {
    if (option.disabled) return;
    setInputValue(text(option.label));
    setOpen(false);
    setActiveIndex(-1);
    onSelect?.(option.value);
    onChange?.(option.value);
  }
  const displayValue = selected?.label ? text(selected.label) : inputValue;
  // Structure mirrors the Svelte reference: a `st-field` grid wrapping a
  // `st-field__control` label that stacks the field label above the bordered
  // `st-combobox` box (input + clear/toggle). The popover list and help/error
  // text are siblings of the control inside `st-field`.
  return (
    <div {...rest} className={classNames("st-field", className)}>
      <label className="st-field__control" htmlFor={inputId}>
        {label ? <span className="st-field__label">{label}</span> : null}
        <span className={classNames("st-combobox", `st-combobox--${size}`)}>
          <input
            id={inputId}
            className="st-combobox__control"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls={listId}
            aria-invalid={isInvalid ? "true" : undefined}
            aria-activedescendant={activeIndex >= 0 && filtered[activeIndex] ? `${listId}-${filtered[activeIndex].value}` : undefined}
            placeholder={placeholder}
            disabled={disabled}
            value={displayValue}
            onFocus={() => !disabled && setOpen(true)}
            {...textInput<HTMLInputElement>((next) => {
              setInputValue(next);
              setOpen(true);
              setActiveIndex(-1);
              if (allowCustomValue) onChange?.(next);
            })}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setOpen(true);
                setActiveIndex((index) => moveIndex(index, filtered.length, 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setOpen(true);
                setActiveIndex((index) => moveIndex(index < 0 ? filtered.length : index, filtered.length, -1));
              } else if (event.key === "Enter" && open && activeIndex >= 0 && filtered[activeIndex]) {
                event.preventDefault();
                selectOption(filtered[activeIndex]);
              } else if (event.key === "Escape" && open) {
                event.preventDefault();
                setOpen(false);
                setActiveIndex(-1);
              }
            }}
          />
          {displayValue ? (
            <button
              type="button"
              className="st-combobox__clear"
              aria-label={clearLabel}
              disabled={disabled}
              onClick={() => {
                setInputValue("");
                setActiveIndex(-1);
                onChange?.("");
              }}
            >
              <X size={16} strokeWidth={2.25} aria-hidden="true" />
            </button>
          ) : null}
          <button
            type="button"
            className="st-combobox__toggle"
            aria-label={toggleLabel}
            aria-expanded={open}
            disabled={disabled}
            onClick={() => setOpen(!open)}
          >
            <ChevronDown className={classNames("st-combobox__toggleIcon", open && "st-combobox__toggleIcon--open")} size={18} strokeWidth={2.25} aria-hidden="true" />
          </button>
        </span>
      </label>
      {open ? (
        <div id={listId} className="st-combobox__list" role="listbox" aria-label={listLabel ?? text(label) ?? "Options"}>
          {filtered.length ? (
            filtered.map((option, index) => (
              <button
                key={option.value}
                id={`${listId}-${option.value}`}
                type="button"
                className={classNames("st-combobox__option", index === activeIndex && "st-combobox__option--active")}
                role="option"
                aria-selected={displayValue === text(option.label)}
                aria-disabled={option.disabled ? "true" : undefined}
                disabled={option.disabled}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectOption(option);
                }}
              >
                {option.label}
              </button>
            ))
          ) : (
            <div className="st-combobox__empty" role="option" aria-disabled="true" aria-selected="false">{noResultsLabel}</div>
          )}
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

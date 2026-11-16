import { Search as SearchIcon, X } from "lucide-preact";
import type { InputHTMLAttributes } from "preact";
import { useId } from "preact/hooks";
import { classNames } from "./classNames.js";
import { textChange } from "./runtime.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type SearchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
  label?: ComponentChildren;
  size?: "sm" | "md" | "lg";
  clearLabel?: string;
  onClear?: () => void;
  /** Lift the field max-width cap so it fills a narrow drawer/rail (width 100%). */
  fluid?: boolean;
};

export function Search({ label, size = "md", clearLabel = "Clear search", onClear, fluid = false, className, onChange: onChangeProp, onInput: onInputProp, ...rest }: SearchProps) {
  const reactId = useId();
  const resolvedId = useValue(rest.id as MaybeSignal<string | undefined>);
  const inputId = resolvedId ?? `st-search-${reactId}`;
  return (
    <div className={classNames("st-search", `st-search--${size}`, fluid ? "st-search--fluid" : null, className)}>
      {label ? <label className="st-field__label" htmlFor={inputId}>{label}</label> : null}
      <span className="st-search__icon" aria-hidden="true"><SearchIcon size={16} strokeWidth={2} aria-hidden="true" /></span>
      <input {...rest} {...(onChangeProp ? textChange<HTMLInputElement>(onChangeProp, onInputProp) : onInputProp ? { onInput: onInputProp } : {})} id={inputId} className="st-search__control st-search__input" type="search" />
      {onClear ? <button type="button" className="st-search__clear" aria-label={clearLabel} onClick={onClear}><X size={16} strokeWidth={2} aria-hidden="true" /></button> : null}
    </div>
  );
}

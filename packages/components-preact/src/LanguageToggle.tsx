import { ChevronDown } from "lucide-preact";
import { useId, useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type LanguageToggleLocale = "fr" | "en";

export type LanguageToggleProps = {
  locale?: MaybeSignal<LanguageToggleLocale>;
  onLocaleChange?: (locale: LanguageToggleLocale) => void;
  frLabel?: ComponentChildren;
  enLabel?: ComponentChildren;
  /** Libellé du sélecteur (associé via <label htmlFor> + aria-label). */
  label?: string;
  /** Id du <select> ; auto-généré et stable si non fourni. */
  selectId?: string;
  variant?: "select" | "accordion";
  accordionLabel?: ComponentChildren;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export function LanguageToggle({
  locale: localeInput = "fr",
  onLocaleChange,
  frLabel = "FR",
  enLabel = "EN",
  label = "Langue",
  selectId,
  variant = "select",
  accordionLabel = "Langue",
  className,
}: LanguageToggleProps) {
  const locale = useValue(localeInput);
  const [open, setOpen] = useState(false);
  const reactId = useId();
  const resolvedSelectId = selectId ?? `st-languageToggle-${reactId}`;
  if (variant === "accordion") {
    return (
      <div className={classNames("st-languageToggle", className)}>
        <button
          type="button"
          className="st-languageToggle__accordionTrigger"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span>{accordionLabel}</span>
          <ChevronDown
            className={classNames("st-languageToggle__chevron", open && "st-languageToggle__chevron--open")}
            size={16}
            aria-hidden="true"
          />
        </button>
        {open ? (
          <div className="st-languageToggle__accordionPanel">
            <button
              type="button"
              className={classNames("st-languageToggle__option", locale === "fr" && "st-languageToggle__option--active")}
              aria-current={locale === "fr"}
              onClick={() => onLocaleChange?.("fr")}
            >
              {frLabel}
            </button>
            <button
              type="button"
              className={classNames("st-languageToggle__option", locale === "en" && "st-languageToggle__option--active")}
              aria-current={locale === "en"}
              onClick={() => onLocaleChange?.("en")}
            >
              {enLabel}
            </button>
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <>
      <label className="st-visually-hidden st-languageToggle__srLabel" htmlFor={resolvedSelectId}>
        {label}
      </label>
      <select
        id={resolvedSelectId}
        className={classNames("st-languageToggle__select", className)}
        value={locale}
        aria-label={label}
        onChange={(e) => onLocaleChange?.(e.currentTarget.value as LanguageToggleLocale)}
      >
        <option value="fr">{frLabel}</option>
        <option value="en">{enLabel}</option>
      </select>
    </>
  );
}

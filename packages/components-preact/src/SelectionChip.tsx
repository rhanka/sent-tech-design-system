import { X } from "lucide-preact";
import { classNames } from "./classNames.js";
// Side-effect: installs the options.vnode SVG presentation-attribute
// normalisation in runtime.ts. This module renders SVG (lucide icons) but
// otherwise references runtime only via `import type`, which TypeScript
// erases — without this import a bundler applying `sideEffects` barrel
// optimisation (or a direct deep import) would never evaluate runtime.js.
import "./runtime.js";
import type { TargetedMouseEvent } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type SelectionChipTone = "neutral" | "success" | "warning" | "error" | "info";

export type SelectionChipProps = {
  /** Libellé de la dimension sélectionnée. */
  label: string;
  /** Nombre d'éléments sélectionnés — affiché "(N)" si fourni et Number.isFinite. */
  count?: number;
  tone?: SelectionChipTone;
  /** Callback effacement — affiche le bouton ✕ si fourni. */
  onClear?: () => void;
  /** Plain value, or a signal in the Preact build (read at the edge). */
  disabled?: MaybeSignal<boolean>;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export function SelectionChip({ label, count, tone = "neutral", onClear, disabled: disabledInput = false, className }: SelectionChipProps) {
  const disabled = useValue(disabledInput);
  const showCount = count !== undefined && Number.isFinite(count);

  function handleClear(e: TargetedMouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    if (disabled) return;
    onClear?.();
  }

  return (
    <span
      className={classNames("st-selectionChip", `st-selectionChip--${tone}`, disabled && "st-selectionChip--disabled", className)}
      aria-disabled={disabled ? "true" : undefined}
    >
      <span className="st-selectionChip__label">{label}</span>
      {showCount ? (
        <span className="st-selectionChip__count" aria-label={`(${count})`}>({count})</span>
      ) : null}
      {onClear ? (
        <button
          type="button"
          className="st-selectionChip__clear"
          aria-label={`Effacer ${label}`}
          disabled={disabled}
          onClick={handleClear}
        >
          <X size={11} strokeWidth={2.5} aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
}

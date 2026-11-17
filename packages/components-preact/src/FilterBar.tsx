import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";
import type { MaybeSignal } from "./signals.js";

export type FilterBarProps = {
  /** Aria-label du groupe de filtres, ex "Filtres actifs". */
  label: string;
  /** Callback "tout effacer" — le bouton n'est rendu que si ce callback est fourni. */
  onClearAll?: () => void;
  /** Libellé du bouton "tout effacer". Défaut "Tout effacer". */
  clearAllLabel?: string;
  children?: ComponentChildren;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export function FilterBar({ label, onClearAll, clearAllLabel = "Tout effacer", children, className }: FilterBarProps) {
  return (
    <div className={classNames("st-filterBar", className)} role="group" aria-label={label}>
      <div className="st-filterBar__pills">{children}</div>
      {onClearAll ? (
        <button type="button" className="st-filterBar__clearAll" onClick={onClearAll}>
          {clearAllLabel}
        </button>
      ) : null}
    </div>
  );
}

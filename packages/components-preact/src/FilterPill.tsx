import { X } from "lucide-preact";
import { useEffect, useRef } from "preact/hooks";
import { classNames } from "./classNames.js";
import type { TargetedKeyboardEvent } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type FilterPillTone = "neutral" | "success" | "warning" | "error" | "info";

export type FilterPillProps = {
  /** Nom du champ/dimension affiché à gauche. */
  field: string;
  /** Résumé de la valeur sélectionnée, ex "France, Italie" ou "> 100". */
  value: string;
  /** Opérateur optionnel affiché entre field et value, ex "=", "in", "entre". */
  operator?: string;
  /** Pilule active (aria-pressed). Défaut true. */
  active?: MaybeSignal<boolean>;
  /** Affiche le bouton ✕. Défaut true. */
  removable?: MaybeSignal<boolean>;
  disabled?: MaybeSignal<boolean>;
  tone?: FilterPillTone;
  onClick?: () => void;
  onRemove?: () => void;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export function FilterPill({
  field,
  value,
  operator,
  active: activeInput = true,
  removable: removableInput = true,
  disabled: disabledInput = false,
  tone = "neutral",
  onClick,
  onRemove,
  className,
}: FilterPillProps) {
  const active = useValue(activeInput);
  const removable = useValue(removableInput);
  const disabled = useValue(disabledInput);
  const bodyRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  // Fix #5 : transfert de focus quand le corps-bouton focalisé devient disabled.
  const prevDisabled = useRef(disabled);
  useEffect(() => {
    if (!prevDisabled.current && disabled) {
      const container = containerRef.current;
      if (container && container.contains(document.activeElement)) {
        const focusable = document.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])",
        );
        let transferred = false;
        for (const el of Array.from(focusable)) {
          if (!container.contains(el)) {
            el.focus();
            transferred = true;
            break;
          }
        }
        if (!transferred) (document.body as HTMLElement).focus();
      }
    }
    prevDisabled.current = disabled;
  }, [disabled]);

  function handleClick() {
    if (disabled) return;
    onClick?.();
  }

  function handleRemove() {
    if (disabled) return;
    onRemove?.();
  }

  // Suppr/Backspace sur le corps-bouton → onRemove (si removable).
  function handleBodyKeydown(event: TargetedKeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if ((event.key === "Delete" || event.key === "Backspace") && removable) {
      event.preventDefault();
      onRemove?.();
    }
  }

  const groupClass = classNames(
    "st-filterPill",
    `st-filterPill--${tone}`,
    active ? "st-filterPill--active" : undefined,
    disabled ? "st-filterPill--disabled" : undefined,
    className,
  );

  return (
    <span ref={containerRef} className={groupClass} role="group" aria-label={`Filtre ${field}`}>
      {onClick ? (
        <button
          ref={bodyRef}
          type="button"
          className="st-filterPill__body"
          aria-pressed={active}
          disabled={disabled || undefined}
          onClick={handleClick}
          onKeyDown={handleBodyKeydown}
        >
          <span className="st-filterPill__field">{field}</span>
          {operator ? <span className="st-filterPill__operator" aria-hidden="true">{operator}</span> : null}
          <span className="st-filterPill__value">{value}</span>
        </button>
      ) : (
        <span className="st-filterPill__body st-filterPill__body--static">
          <span className="st-filterPill__field">{field}</span>
          {operator ? <span className="st-filterPill__operator" aria-hidden="true">{operator}</span> : null}
          <span className="st-filterPill__value">{value}</span>
        </span>
      )}
      {removable ? (
        <button
          type="button"
          className="st-filterPill__remove"
          aria-label={`Retirer le filtre ${field}`}
          disabled={disabled || undefined}
          onClick={handleRemove}
        >
          <X size={12} strokeWidth={2.5} aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
}

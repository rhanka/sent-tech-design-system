import type { HTMLAttributes } from "preact";
import { useRef } from "preact/hooks";
import { classNames } from "./classNames.js";
import { useControlled } from "./internal.js";
import type { TargetedKeyboardEvent, TargetedMouseEvent } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type RatingSize = "sm" | "md" | "lg";

export type RatingProps = Omit<HTMLAttributes<HTMLDivElement>, "className" | "onChange"> & {
  /** Note courante (0..max). Pas de 1, ou 0.5 si `allowHalf`. */
  value?: MaybeSignal<number>;
  /** Nombre d'étoiles. */
  max?: number;
  /** Appelé avec la nouvelle note au clic ou au clavier. */
  onChange?: (value: number) => void;
  /** Affichage seul : ni clic ni clavier n'émettent. */
  readonly?: boolean;
  /** Autorise les demi-étoiles (sélection au demi-point). */
  allowHalf?: boolean;
  size?: RatingSize;
  /** Attribut name (utile dans un formulaire / pour la sémantique radio). */
  name?: string;
  /** Étiquette accessible du groupe. */
  label?: string;
  className?: MaybeSignal<string>;
};
function StarIcon({ size, fill }: { size: number; fill: "currentColor" | "none" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function StarHalfIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2v15.77z" fill="currentColor" />
      <path d="M12 2v15.77l6.18 3.25L17 14.14 22 9.27l-6.91-1.01L12 2z" />
    </svg>
  );
}
export function Rating({
  value: valueInput,
  max = 5,
  onChange,
  readonly = false,
  allowHalf = false,
  size = "md",
  name,
  label,
  className,
  ...rest
}: RatingProps) {
  const value = useValue(valueInput);
  const [current, setCurrent] = useControlled(value, value ?? 0, onChange);
  const iconSize = size === "sm" ? 16 : size === "lg" ? 28 : 22;
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  // L'étoile « focusable » (tabindex 0) suit la valeur ; à 0 c'est la première.
  // En mode entier, focusedStar est toujours >= 1 (pas de radio "0").
  const focusedStar = current > 0 ? Math.ceil(current) : 1;

  // Refs des boutons radio pour déplacer le focus programmatiquement (mode entier).
  const radioRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const valueText = `${current} / ${max}`;

  function fill(star: number): "full" | "half" | "empty" {
    if (current >= star) return "full";
    if (allowHalf && current >= star - 0.5) return "half";
    return "empty";
  }
  function commit(next: number) {
    if (readonly) return;
    setCurrent(Math.max(0, Math.min(max, next)));
  }
  function onStarClick(event: TargetedMouseEvent<HTMLButtonElement>, star: number) {
    if (readonly) return;
    let next = star;
    if (allowHalf) {
      const rect = event.currentTarget.getBoundingClientRect();
      const isLeftHalf = event.clientX - rect.left < rect.width / 2;
      next = isLeftHalf ? star - 0.5 : star;
    }
    // Re-cliquer la valeur déjà sélectionnée remet à zéro.
    if (next === current) {
      commit(0);
      return;
    }
    commit(next);
  }
  function onRadioKeyDown(event: TargetedKeyboardEvent<HTMLButtonElement>) {
    if (readonly) return;
    const step = 1;
    let handled = true;
    let next: number | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = Math.min(max, current + step);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        // En mode entier, ne pas descendre sous 1 (pas de radio "0").
        next = Math.max(1, current - step);
        break;
      case "Home":
        // Home → première étoile (1), pas 0 (aucun radio "0" n'existe).
        next = 1;
        break;
      case "End":
        next = max;
        break;
      default:
        handled = false;
    }
    if (handled) {
      event.preventDefault();
      if (next !== null) {
        commit(next);
        // Déplacer le focus DOM vers le radio cible.
        const targetEl = radioRefs.current[next > 0 ? Math.ceil(next) : 1];
        if (targetEl) targetEl.focus();
      }
    }
  }
  function onSliderKeyDown(event: TargetedKeyboardEvent<HTMLDivElement>) {
    if (readonly) return;
    const step = 0.5;
    let handled = true;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        commit(Math.min(max, current + step));
        break;
      case "ArrowLeft":
      case "ArrowDown":
        commit(Math.max(0, current - step));
        break;
      case "Home":
        commit(0);
        break;
      case "End":
        commit(max);
        break;
      default:
        handled = false;
    }
    if (handled) event.preventDefault();
  }

  // Readonly : rendu non interactif avec role="img" et aria-label global.
  if (readonly) {
    return (
      <div
        {...rest}
        className={classNames("st-rating", `st-rating--${size}`, "st-rating--readonly", className)}
        role="img"
        aria-label={label ? `${label} : ${valueText}` : valueText}
      >
        {stars.map((star) => {
          const state = fill(star);
          return (
            <span
              key={star}
              className={classNames(
                "st-rating__star",
                state === "full" && "st-rating__star--full",
                state === "half" && "st-rating__star--half",
              )}
              aria-hidden="true"
            >
              {state === "half" ? (
                <StarHalfIcon size={iconSize} />
              ) : (
                <StarIcon size={iconSize} fill={state === "full" ? "currentColor" : "none"} />
              )}
            </span>
          );
        })}
      </div>
    );
  }

  // allowHalf : slider ARIA — valeurs fractionnaires (0.5 step).
  if (allowHalf) {
    return (
      <div
        {...rest}
        className={classNames("st-rating", `st-rating--${size}`, className)}
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={current}
        aria-valuetext={valueText}
        tabIndex={0}
        onKeyDown={onSliderKeyDown}
      >
        {stars.map((star) => {
          const state = fill(star);
          return (
            <span
              key={star}
              className={classNames(
                "st-rating__star",
                state === "full" && "st-rating__star--full",
                state === "half" && "st-rating__star--half",
              )}
              aria-hidden="true"
              onClick={(event) => onStarClick(event as unknown as TargetedMouseEvent<HTMLButtonElement>, star)}
            >
              {state === "half" ? (
                <StarHalfIcon size={iconSize} />
              ) : (
                <StarIcon size={iconSize} fill={state === "full" ? "currentColor" : "none"} />
              )}
            </span>
          );
        })}
      </div>
    );
  }

  // Mode entier : radiogroup / radio. aria-checked=true uniquement sur l'étoile == value.
  return (
    <div
      {...rest}
      className={classNames("st-rating", `st-rating--${size}`, className)}
      role="radiogroup"
      aria-label={label}
    >
      {stars.map((star) => {
        const state = fill(star);
        return (
          <button
            key={star}
            ref={(el) => { radioRefs.current[star] = el; }}
            type="button"
            className={classNames(
              "st-rating__star",
              state === "full" && "st-rating__star--full",
              state === "half" && "st-rating__star--half",
            )}
            role="radio"
            name={name}
            aria-checked={current === star ? "true" : "false"}
            aria-label={`${star} / ${max}`}
            tabIndex={star === focusedStar ? 0 : -1}
            onClick={(event) => onStarClick(event, star)}
            onKeyDown={onRadioKeyDown}
          >
            <StarIcon size={iconSize} fill={state === "full" ? "currentColor" : "none"} />
          </button>
        );
      })}
    </div>
  );
}

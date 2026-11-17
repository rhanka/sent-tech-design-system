import type { HTMLAttributes } from "preact";
import { useRef } from "preact/hooks";
import { classNames } from "./classNames.js";
import type { TargetedKeyboardEvent } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type SlideIndicatorVariant = "dots" | "bars";

export type SlideIndicatorProps = Omit<HTMLAttributes<HTMLDivElement>, "className" | "onChange"> & {
  /** Nombre total de diapositives. */
  count: number;
  /** Index de la diapositive courante (0-based). */
  current?: MaybeSignal<number>;
  /** Appelé avec l'index ciblé au clic ou au clavier. */
  onChange?: (index: number) => void;
  size?: "sm" | "md" | "lg";
  variant?: SlideIndicatorVariant;
  /** Préfixe d'étiquette accessible de chaque point ("Diapositive 1"...). */
  label?: string;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export function SlideIndicator({
  count,
  current: currentInput = 0,
  onChange,
  size = "md",
  variant = "dots",
  label = "Diapositive",
  className,
  ...rest
}: SlideIndicatorProps) {
  const current = useValue(currentInput);
  const items = Array.from({ length: Math.max(0, count) }, (_, i) => i);
  // Refs des boutons pour déplacer le focus programmatiquement lors de la navigation clavier.
  const buttonRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  function select(index: number) {
    if (index < 0 || index >= count || index === current) return;
    onChange?.(index);
  }
  function onKeyDown(event: TargetedKeyboardEvent<HTMLButtonElement>, index: number) {
    let target = index;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        target = Math.min(count - 1, index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        target = Math.max(0, index - 1);
        break;
      case "Home":
        target = 0;
        break;
      case "End":
        target = count - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    // Déplacer le focus DOM vers le bouton cible (roving tabindex correct).
    const targetEl = buttonRefs.current[target];
    if (targetEl) targetEl.focus();
    select(target);
  }
  return (
    <div
      {...rest}
      className={classNames(
        "st-slideIndicator",
        `st-slideIndicator--${size}`,
        `st-slideIndicator--${variant}`,
        className,
      )}
      role="group"
      aria-label={label}
    >
      {items.map((index) => (
        <button
          key={index}
          ref={(el) => {
            buttonRefs.current[index] = el;
          }}
          type="button"
          className={classNames("st-slideIndicator__dot", index === current && "st-slideIndicator__dot--current")}
          aria-current={index === current ? "true" : undefined}
          aria-label={`${label} ${index + 1}`}
          tabIndex={index === current ? 0 : -1}
          onClick={() => select(index)}
          onKeyDown={(event) => onKeyDown(event, index)}
        />
      ))}
    </div>
  );
}

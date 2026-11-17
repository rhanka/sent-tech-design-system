import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { MaybeSignal } from "./signals.js";

export type ColorSwatchShape = "square" | "circle" | "pill";

export type ColorSwatchProps = Omit<HTMLAttributes<HTMLSpanElement>, "className" | "color"> & {
  /** Couleur (hex/rgb/oklch/var(--token)) rendue via background inline — voulu. */
  color: string;
  /** Côté de la pastille en px (défaut 24). */
  size?: number;
  /** Forme de la pastille (défaut "square"). */
  shape?: ColorSwatchShape;
  /** Libellé optionnel affiché à côté de la pastille. */
  label?: string;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

/**
 * ColorSwatch — affiche UNE couleur arbitraire sous forme de pastille. Seule la
 * couleur passée en prop est inline ; le reste du style est token-only.
 */
export function ColorSwatch({
  color,
  size = 24,
  shape = "square",
  label,
  className,
  ...rest
}: ColorSwatchProps) {
  const safeSize = Math.max(Number(size) || 0, 1);
  const accessibleLabel = label ?? color;

  return (
    <span {...rest} className={classNames("st-colorSwatch", `st-colorSwatch--${shape}`, className)}>
      <span
        className="st-colorSwatch__chip"
        style={{ background: color, width: `${safeSize}px`, height: `${safeSize}px` }}
        role="img"
        aria-label={accessibleLabel}
      />
      {label ? <span className="st-colorSwatch__label">{label}</span> : null}
    </span>
  );
}

import React from "react";
import { classNames } from "./classNames.js";

export type StatusDotTone = "neutral" | "info" | "success" | "warning" | "error";

export type StatusDotProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "className" | "color"> & {
  /** Ton sémantique, mappé sur --st-semantic-feedback-*. Ignoré si `color` est fourni. */
  tone?: StatusDotTone;
  /** Couleur arbitraire (hex, rgb(), var(--token)…), rendue en background inline. Prime sur `tone`. */
  color?: string;
  /** Diamètre du point en px (défaut 8). */
  size?: number;
  /** Halo animé pour un état « live ». Désactivé sous prefers-reduced-motion. */
  pulse?: boolean;
  /** Si fourni, rend le point + ce texte inline (un StatusIndicator). */
  label?: string;
  className?: string;
};

/**
 * StatusDot — pastille de statut. Par défaut un point coloré via `tone` (mappé sur
 * --st-semantic-feedback-*) ; `color` accepte une couleur arbitraire rendue en
 * `background-color` inline (même logique que ColorSwatch) et prime sur `tone`.
 * Avec `label`, rend point + texte = un « StatusIndicator ». Style token-only.
 *
 * a11y : sans label le point est décoratif → `role="img"` + `aria-label` (le tone,
 * ou la couleur). Avec label, le texte porte l'info → le point passe `aria-hidden`.
 */
export function StatusDot({
  tone = "neutral",
  color,
  size = 8,
  pulse = false,
  label,
  className,
  ...rest
}: StatusDotProps) {
  const safeSize = Math.max(Number(size) || 0, 1);
  const accessibleLabel = label ?? color ?? tone;

  const dotStyle: React.CSSProperties = {
    width: `${safeSize}px`,
    height: `${safeSize}px`,
    ...(color ? { backgroundColor: color } : null),
  };
  const dotClasses = classNames(
    "st-statusDot__dot",
    color ? null : `st-statusDot__dot--${tone}`,
    pulse ? "st-statusDot__dot--pulse" : null,
  );

  return (
    <span {...rest} className={classNames("st-statusDot", className)}>
      {label ? (
        <>
          <span className={dotClasses} style={dotStyle} aria-hidden="true" />
          <span className="st-statusDot__label">{label}</span>
        </>
      ) : (
        <span className={dotClasses} style={dotStyle} role="img" aria-label={accessibleLabel} />
      )}
    </span>
  );
}

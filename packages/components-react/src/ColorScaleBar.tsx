import React from "react";
import { classNames } from "./classNames.js";

export type ColorScaleBarOrientation = "horizontal" | "vertical";

export type ColorScaleBarProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  /** Stops du gradient (≥2). Rendus via linear-gradient inline — voulu. */
  colors: string[];
  /** Orientation de la barre (défaut "horizontal"). */
  orientation?: ColorScaleBarOrientation;
  /** Longueur de la barre en px. */
  length?: number;
  /** Épaisseur de la barre en px. */
  thickness?: number;
  /** Libellé d'extrémité bas/gauche. */
  min?: string;
  /** Libellé d'extrémité haut/droite. */
  max?: string;
  /** Libellé accessible. */
  label?: string;
  className?: string;
};

/**
 * ColorScaleBar — échelle de couleur continue (gradient) à partir de stops
 * arbitraires. Seul le gradient est inline ; le reste du style est token-only.
 */
export function ColorScaleBar({
  colors = [],
  orientation = "horizontal",
  length,
  thickness,
  min,
  max,
  label,
  className,
  ...rest
}: ColorScaleBarProps) {
  const isVertical = orientation === "vertical";

  const stops = colors.length >= 2 ? colors : colors.length === 1 ? [colors[0], colors[0]] : [];

  const direction = isVertical ? "to top" : "to right";
  const gradient = stops.length ? `linear-gradient(${direction}, ${stops.join(", ")})` : "none";

  const safeLength = length !== undefined ? Math.max(Number(length) || 0, 1) : undefined;
  const safeThickness = thickness !== undefined ? Math.max(Number(thickness) || 0, 1) : undefined;

  const barStyle: React.CSSProperties = { background: gradient };
  if (isVertical) {
    if (safeLength !== undefined) barStyle.height = `${safeLength}px`;
    if (safeThickness !== undefined) barStyle.width = `${safeThickness}px`;
  } else {
    if (safeLength !== undefined) barStyle.width = `${safeLength}px`;
    if (safeThickness !== undefined) barStyle.height = `${safeThickness}px`;
  }

  const hasEndLabels = min !== undefined || max !== undefined;

  return (
    <div {...rest} className={classNames("st-colorScaleBar", `st-colorScaleBar--${orientation}`, className)}>
      {label ? <span className="st-colorScaleBar__label">{label}</span> : null}
      <div className="st-colorScaleBar__track">
        {hasEndLabels ? (
          <span className="st-colorScaleBar__end st-colorScaleBar__end--max">{max ?? ""}</span>
        ) : null}
        <div className="st-colorScaleBar__bar" style={barStyle} role="img" aria-label={label} />
        {hasEndLabels ? (
          <span className="st-colorScaleBar__end st-colorScaleBar__end--min">{min ?? ""}</span>
        ) : null}
      </div>
    </div>
  );
}

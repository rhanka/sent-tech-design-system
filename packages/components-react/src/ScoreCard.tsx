import React from "react";
import { classNames } from "./classNames.js";

export type ScoreCardType = "value" | "complexity";
export type ScoreCardSize = "sm" | "md" | "lg";

export type ScoreCardProps = Omit<React.HTMLAttributes<HTMLElement>, "className"> & {
  /** Titre de la métrique notée. */
  title: string;
  /** Score numérique affiché (formaté à une décimale). */
  score: number;
  /** Nombre de symboles pleins (0..max). */
  stars: number;
  /** Nombre total de symboles. */
  max?: number;
  /**
   * Nature de la note :
   * - `value` (défaut) : étoiles, accent succès.
   * - `complexity` : croix, accent avertissement.
   */
  type?: ScoreCardType;
  /** Libellé d'unité du score (défaut « points »). */
  unit?: string;
  size?: ScoreCardSize;
  className?: string;
};

const STAR_PATH =
  "m7 1.5 1.7 3.45 3.8.55-2.75 2.68.65 3.79L7 10.18 3.6 11.96l.65-3.79L1.5 5.5l3.8-.55L7 1.5Z";
const CROSS_PATH = "M3.5 3.5l7 7M10.5 3.5l-7 7";

export function ScoreCard({
  title,
  score,
  stars,
  max = 5,
  type = "value",
  unit = "points",
  size = "md",
  className,
  ...rest
}: ScoreCardProps) {
  const filled = Math.max(0, Math.min(max, Math.round(stars)));
  const symbols = Array.from({ length: max }, (_, i) => i < filled);
  const ariaLabel = `${title}, ${score.toFixed(1)} ${unit}, ${filled} sur ${max}`;

  return (
    <article
      {...rest}
      className={classNames(
        "st-scoreCard",
        `st-scoreCard--${size}`,
        `st-scoreCard--${type}`,
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <h3 className="st-scoreCard__title">{title}</h3>
      <div className="st-scoreCard__row">
        <div className="st-scoreCard__symbols" aria-hidden="true">
          {symbols.map((on, i) => (
            <svg
              key={i}
              className={classNames(
                "st-scoreCard__symbol",
                on ? "st-scoreCard__symbol--on" : "st-scoreCard__symbol--off",
              )}
              width="20"
              height="20"
              viewBox="0 0 14 14"
              focusable="false"
            >
              {type === "value" ? (
                <path
                  d={STAR_PATH}
                  fill={on ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d={CROSS_PATH}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              )}
            </svg>
          ))}
        </div>
        <span className="st-scoreCard__score">
          {score.toFixed(1)} {unit}
        </span>
      </div>
    </article>
  );
}

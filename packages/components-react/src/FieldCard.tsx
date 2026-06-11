import React from "react";
import { classNames } from "./classNames.js";

export type FieldCardVariant = "plain" | "bordered" | "accent";
export type FieldCardTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type FieldCardProps = Omit<React.HTMLAttributes<HTMLElement>, "className"> & {
  /** Titre de la carte / du groupe de champs. */
  label: string;
  /**
   * Variante visuelle :
   * - `plain` : cadre simple, titre discret.
   * - `bordered` (défaut) : titre séparé par un filet sous l'en-tête.
   * - `accent` : liseré catégoriel à gauche (conteneur à angles nets, jamais arrondi).
   */
  variant?: FieldCardVariant;
  /** Couleur catégorielle pour la variante `accent`. */
  tone?: FieldCardTone;
  /** Nombre de commentaires ; affiche une pastille à côté du titre si > 0 ou si `onOpenComments`. */
  commentCount?: number;
  /** Ouvre le fil de commentaires ; rend la pastille interactive. */
  onOpenComments?: () => void;
  className?: string;
  /** Corps de la carte. */
  children?: React.ReactNode;
};

export function FieldCard({
  label,
  variant = "bordered",
  tone,
  commentCount = 0,
  onOpenComments,
  className,
  children,
  ...rest
}: FieldCardProps) {
  const showBadge = commentCount > 0 || !!onOpenComments;

  return (
    <section
      {...rest}
      className={classNames(
        "st-fieldCard",
        `st-fieldCard--${variant}`,
        variant === "accent" && tone && `st-fieldCard--${tone}`,
        className,
      )}
    >
      <header className="st-fieldCard__header">
        <h3 className="st-fieldCard__label">{label}</h3>
        {showBadge ? (
          onOpenComments ? (
            <button
              type="button"
              className="st-fieldCard__comments"
              aria-label={`Commentaires (${commentCount})`}
              onClick={() => onOpenComments?.()}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path
                  d="M2.5 4.25A1.25 1.25 0 0 1 3.75 3h8.5A1.25 1.25 0 0 1 13.5 4.25v5A1.25 1.25 0 0 1 12.25 10.5H6.5L3.5 13v-2.5h-.75A.25.25 0 0 1 2.5 10.25v-6Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {commentCount > 0 ? (
                <span className="st-fieldCard__commentCount">{commentCount}</span>
              ) : null}
            </button>
          ) : (
            <span className="st-fieldCard__comments st-fieldCard__comments--static">
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path
                  d="M2.5 4.25A1.25 1.25 0 0 1 3.75 3h8.5A1.25 1.25 0 0 1 13.5 4.25v5A1.25 1.25 0 0 1 12.25 10.5H6.5L3.5 13v-2.5h-.75A.25.25 0 0 1 2.5 10.25v-6Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="st-fieldCard__commentCount">{commentCount}</span>
            </span>
          )
        ) : null}
      </header>
      <div className="st-fieldCard__body">{children}</div>
    </section>
  );
}

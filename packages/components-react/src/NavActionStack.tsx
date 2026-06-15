import React from "react";
import { classNames } from "./classNames.js";
import { Button } from "./Button.js";
import { Divider } from "./Divider.js";

/** Hiérarchie ENCODÉE DANS LE TYPE : une seule action `primary` est légitime
 * dans une pile. `secondary` = action secondaire ; `ghost` = action discrète.
 * La couleur sémantique (danger) n'est PAS un `kind` — elle vit dans
 * `dangerZone`, rendue à part. Le mauvais chemin (4 « primaires » arc-en-ciel)
 * devient ainsi impossible à exprimer proprement. */
export type NavActionKind = "primary" | "secondary" | "ghost";

export type NavAction = {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  kind?: NavActionKind;
  disabled?: boolean;
};

/** Action destructrice, isolée sous un séparateur + un overline « Zone
 * sensible ». Toujours en ton danger, jamais alignée avec les actions
 * normales. Pas de `kind` : c'est une zone, pas une catégorie de couleur. */
export type NavActionDangerZone = {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
};

export type NavActionStackOrientation = "vertical" | "horizontal";

export type NavActionStackProps = {
  actions?: NavAction[];
  dangerZone?: NavActionDangerZone;
  /** Libellé de l'overline de la zone sensible. Défaut « Zone sensible ». */
  dangerLabel?: string;
  orientation?: NavActionStackOrientation;
  /** Étiquette a11y du groupe d'actions. */
  label?: string;
  className?: string;
};

// kind → variant Button : primary→primary, secondary→secondary, ghost→ghost.
const variantFor = (kind: NavActionKind): "primary" | "secondary" | "ghost" => kind;

/**
 * NavActionStack — empile des actions en ENCODANT la hiérarchie dans le type.
 * Au plus UN `kind:"primary"` (les suivants sont dégradés en secondary +
 * console.warn). La couleur « danger » n'est pas détournée en catégorie : la
 * `dangerZone` est rendue séparément, sous un Divider + un overline, en ton
 * danger pleine largeur. Réutilise le Button du DS. Style token-only.
 */
export function NavActionStack({
  actions = [],
  dangerZone,
  dangerLabel = "Zone sensible",
  orientation = "vertical",
  label = "Actions",
  className,
}: NavActionStackProps) {
  // La règle (un seul primary) appliquée AU RUNTIME en miroir du type : on garde
  // le premier `primary`, on dégrade les suivants en `secondary` et on prévient.
  let primarySeen = false;
  const normalizedActions = actions.map((action) => {
    const kind: NavActionKind = action.kind ?? "secondary";
    if (kind === "primary") {
      if (primarySeen) {
        console.warn(
          `[NavActionStack] Plusieurs actions « primary » fournies — « ${action.label} » dégradée en « secondary ». Une pile n'a qu'une action primaire.`,
        );
        return { ...action, kind: "secondary" as NavActionKind };
      }
      primarySeen = true;
    }
    return { ...action, kind };
  });

  return (
    <div
      className={classNames(
        "st-navActionStack",
        `st-navActionStack--${orientation}`,
        className,
      )}
      role="group"
      aria-label={label}
    >
      <div className="st-navActionStack__actions">
        {normalizedActions.map((action) =>
          action.href && !action.disabled ? (
            // Action-lien : porte les classes Button (réutilisation du style, pas
            // de réimplémentation de la logique bouton).
            <a
              key={action.label}
              className={`st-button st-button--${variantFor(action.kind)} st-button--md st-navActionStack__item`}
              href={action.href}
              onClick={action.onClick}
            >
              {action.icon}
              {action.label}
            </a>
          ) : (
            <Button
              key={action.label}
              variant={variantFor(action.kind)}
              disabled={action.disabled}
              onClick={action.onClick}
              className="st-navActionStack__item"
            >
              {action.icon}
              {action.label}
            </Button>
          ),
        )}
      </div>

      {dangerZone ? (
        // Zone sensible : SÉPARÉE des actions normales par un Divider, coiffée d'un
        // overline token-only, rendue en ton danger pleine largeur.
        <div className="st-navActionStack__danger" role="group" aria-label={dangerLabel}>
          <Divider />
          <span className="st-navActionStack__dangerLabel">{dangerLabel}</span>
          {dangerZone.href ? (
            <a
              className="st-button st-button--danger st-button--md st-navActionStack__item st-navActionStack__dangerAction"
              href={dangerZone.href}
              onClick={dangerZone.onClick}
            >
              {dangerZone.icon}
              {dangerZone.label}
            </a>
          ) : (
            <Button
              variant="danger"
              onClick={dangerZone.onClick}
              className="st-navActionStack__item st-navActionStack__dangerAction"
            >
              {dangerZone.icon}
              {dangerZone.label}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}

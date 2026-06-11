import React from "react";
import { classNames } from "./classNames.js";

export type ConfigItemSourceLevel = "code" | "admin" | "user";

export type ConfigItem = {
  id: string;
  name: string;
  key?: string;
  description?: string | null;
  /** Provenance : `code`/`admin` = système (verrouillé), `user` = personnalisé. */
  sourceLevel: ConfigItemSourceLevel;
  /** Identifiant du parent si l'item est une copie d'un défaut système. */
  parentId?: string | null;
  version?: number;
};

export type ConfigItemCardProps = Omit<React.HTMLAttributes<HTMLElement>, "className"> & {
  /** L'item de configuration décrit par la carte. */
  item: ConfigItem;
  /** Vrai si une copie de cet item système existe déjà : masque l'action Copier. */
  hasCopy?: boolean;
  /** Action Copier (items système uniquement). */
  onCopy?: (id: string) => void;
  /** Action Éditer (items copiés ou créés par l'utilisateur). */
  onEdit?: (id: string) => void;
  /** Action Réinitialiser (items copiés uniquement). */
  onReset?: (id: string) => void;
  /** Action Supprimer (items créés par l'utilisateur uniquement). */
  onDelete?: (id: string) => void;
  /** Désactive toutes les actions. */
  disabled?: boolean;
  className?: string;
  /** Contenu supplémentaire sous la carte (formulaire d'édition, détails…). */
  children?: React.ReactNode;
};

export function ConfigItemCard({
  item,
  hasCopy = false,
  onCopy,
  onEdit,
  onReset,
  onDelete,
  disabled = false,
  className,
  children,
  ...rest
}: ConfigItemCardProps) {
  const isSystem = item.sourceLevel === "code" || item.sourceLevel === "admin";
  const isCopied = item.sourceLevel === "user" && !!item.parentId;
  const isUserCreated = item.sourceLevel === "user" && !item.parentId;

  const showCopy = isSystem && !hasCopy && !!onCopy;
  const showEdit = (isCopied || isUserCreated) && !!onEdit;
  const showReset = isCopied && !!onReset;
  const showDelete = isUserCreated && !!onDelete;

  return (
    <article
      {...rest}
      className={classNames("st-configItemCard", className)}
      data-testid={`config-item-card-${item.key ?? item.id}`}
    >
      <div className="st-configItemCard__header">
        <span className="st-configItemCard__name">{item.name}</span>
        {isSystem ? (
          <span className="st-configItemCard__badge st-configItemCard__badge--system">
            <svg
              className="st-configItemCard__badgeIcon"
              width="12"
              height="12"
              viewBox="0 0 14 14"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M4 6V4.5a3 3 0 0 1 6 0V6M3.5 6h7A1.5 1.5 0 0 1 12 7.5v3A1.5 1.5 0 0 1 10.5 12h-7A1.5 1.5 0 0 1 2 10.5v-3A1.5 1.5 0 0 1 3.5 6Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Système
          </span>
        ) : isCopied ? (
          <span className="st-configItemCard__badge st-configItemCard__badge--custom">
            Personnalisé
          </span>
        ) : null}
      </div>

      {item.key ? <div className="st-configItemCard__key">{item.key}</div> : null}

      {item.description ? (
        <p className="st-configItemCard__description">{item.description}</p>
      ) : null}

      {showCopy || showEdit || showReset || showDelete ? (
        <div className="st-configItemCard__actions">
          {showCopy ? (
            <button
              type="button"
              className="st-configItemCard__action"
              title="Copier"
              aria-label="Copier"
              disabled={disabled}
              onClick={() => onCopy?.(item.id)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path
                  d="M5.5 5.5V3.75A1.25 1.25 0 0 1 6.75 2.5h5.5A1.25 1.25 0 0 1 13.5 3.75v5.5a1.25 1.25 0 0 1-1.25 1.25H10.5M3.75 5.5h5.5A1.25 1.25 0 0 1 10.5 6.75v5.5a1.25 1.25 0 0 1-1.25 1.25h-5.5A1.25 1.25 0 0 1 2.5 12.25v-5.5A1.25 1.25 0 0 1 3.75 5.5Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : null}
          {showEdit ? (
            <button
              type="button"
              className="st-configItemCard__action"
              title="Éditer"
              aria-label="Éditer"
              disabled={disabled}
              onClick={() => onEdit?.(item.id)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path
                  d="m10.5 2.5 3 3L6 13l-3.5.5L3 10l7.5-7.5Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : null}
          {showReset ? (
            <button
              type="button"
              className="st-configItemCard__action st-configItemCard__action--warning"
              title="Réinitialiser"
              aria-label="Réinitialiser"
              disabled={disabled}
              onClick={() => onReset?.(item.id)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path
                  d="M3 8a5 5 0 1 1 1.5 3.5M3 8V5M3 8h3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : null}
          {showDelete ? (
            <button
              type="button"
              className="st-configItemCard__action st-configItemCard__action--danger"
              title="Supprimer"
              aria-label="Supprimer"
              disabled={disabled}
              onClick={() => onDelete?.(item.id)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path
                  d="M3 4.5h10M6 4.5V3.25A.75.75 0 0 1 6.75 2.5h2.5a.75.75 0 0 1 .75.75V4.5M4.25 4.5l.5 8A1 1 0 0 0 5.75 13.5h4.5a1 1 0 0 0 1-.99l.5-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : null}
        </div>
      ) : null}

      {children}
    </article>
  );
}

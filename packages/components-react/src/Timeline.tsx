import React from "react";
import { classNames } from "./classNames.js";

export type TimelineTone = "neutral" | "info" | "success" | "warning" | "danger";

export type TimelineOrientation = "vertical" | "horizontal";

export type TimelineItem = {
  /** Titre de l'événement. */
  title: string;
  /** Métadonnée optionnelle (date, heure, libellé court). */
  meta?: string;
  /** Description optionnelle de l'événement. */
  description?: string;
  /** Ton de la pastille (mappé sur les tokens de statut DS, défaut "neutral"). */
  tone?: TimelineTone;
};

export type TimelineProps = Omit<React.HTMLAttributes<HTMLOListElement>, "className"> & {
  items: TimelineItem[];
  orientation?: TimelineOrientation;
  className?: string;
};

/**
 * Timeline — liste d'événements datés reliés par une ligne de connexion (façon
 * Ant Design / MUI Timeline). Sémantique <ol>/<li>, pastilles aria-hidden, style
 * token-only. Distinct de TimelineChart (dataviz à échelle temporelle).
 */
export function Timeline({ items, orientation = "vertical", className, ...rest }: TimelineProps) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <ol {...rest} className={classNames("st-timeline", `st-timeline--${orientation}`, className)}>
      {safeItems.map((item, i) => (
        <li
          key={i}
          className={classNames("st-timeline__item", `st-timeline__item--${item.tone ?? "neutral"}`)}
        >
          <span className="st-timeline__rail" aria-hidden="true">
            <span className="st-timeline__dot" />
            <span className="st-timeline__line" />
          </span>
          <div className="st-timeline__content">
            {item.meta ? <span className="st-timeline__meta">{item.meta}</span> : null}
            <span className="st-timeline__title">{item.title}</span>
            {item.description ? (
              <span className="st-timeline__description">{item.description}</span>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

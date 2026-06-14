import React from "react";
import { classNames } from "./classNames.js";

export type EventFeedPanelSeverity = "info" | "success" | "warning" | "error" | (string & {});

export type EventFeedPanelEvent = {
  /** Horodatage en millisecondes epoch (ou tout nombre croissant). */
  at: number;
  /** Catégorie libre de l'événement (« deploy », « alert »…). */
  type: string;
  /** Sévérité : pilote la couleur/pastille (sémantique feedback). */
  severity: EventFeedPanelSeverity;
  /** Message principal affiché. */
  message: string;
};

export type EventFeedPanelProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: EventFeedPanelEvent[];
  label?: string;
  maxHeight?: number;
  height?: number;
  className?: string;
};

const KNOWN_SEVERITIES = ["info", "success", "warning", "error"];

function severityTone(severity: string): string {
  return KNOWN_SEVERITIES.includes(severity) ? severity : "neutral";
}

function formatTime(at: number): string {
  if (!Number.isFinite(at)) return "";
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) return String(at);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function EventFeedPanel({ data, label, maxHeight, height, className, ...rest }: EventFeedPanelProps) {
  const items = data
    .filter((d) => d && Number.isFinite(d.at) && typeof d.message === "string")
    .map((d, index) => ({
      index,
      datum: d,
      tone: severityTone(String(d.severity)),
      time: formatTime(d.at),
    }))
    .sort((a, b) => b.datum.at - a.datum.at);

  const resolvedMaxHeight = maxHeight ?? height;
  const scrollStyle =
    typeof resolvedMaxHeight === "number" && Number.isFinite(resolvedMaxHeight)
      ? { maxHeight: `${resolvedMaxHeight}px` }
      : undefined;

  return (
    <div {...rest} className={classNames("st-eventFeedPanel", className)}>
      {label ? (
        <p className="st-eventFeedPanel__label" id="st-eventFeedPanel-label">
          {label}
        </p>
      ) : null}
      <ul className="st-eventFeedPanel__list" role="feed" aria-label={label} aria-busy="false" style={scrollStyle}>
        {items.map((item) => (
          <li
            key={item.index}
            className={classNames("st-eventFeedPanel__item", `st-eventFeedPanel__item--${item.tone}`)}
            role="article"
            aria-label={`${item.datum.type} — ${item.datum.message}`}
          >
            <span
              className={classNames("st-eventFeedPanel__badge", `st-eventFeedPanel__badge--${item.tone}`)}
              aria-hidden="true"
            />
            <div className="st-eventFeedPanel__body">
              <div className="st-eventFeedPanel__meta">
                <span className="st-eventFeedPanel__type">{item.datum.type}</span>
                <time className="st-eventFeedPanel__time">{item.time}</time>
              </div>
              <p className="st-eventFeedPanel__message">{item.datum.message}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

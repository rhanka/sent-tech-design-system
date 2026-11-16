import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-preact";
import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";
export type AutosaveLabels = {
  idle?: string;
  saving?: string;
  saved?: string;
  error?: string;
};
export type AutosaveProps = Omit<HTMLAttributes<HTMLDivElement>, "className"> & {
  status?: AutosaveStatus;
  /** Horodatage de la dernière sauvegarde réussie. */
  lastSaved?: string | Date;
  /** Affiche un bouton « Réessayer » sur le statut `error`. */
  onRetry?: () => void;
  /** Surcharge des libellés par statut. */
  labels?: AutosaveLabels;
  /** Étiquette du bouton de relance. */
  retryLabel?: string;
  locale?: string;
  className?: string;
};
export function Autosave({
  status = "idle",
  lastSaved,
  onRetry,
  labels,
  retryLabel,
  locale = "fr-FR",
  className,
  ...rest
}: AutosaveProps) {
  const isFr = (locale ?? "fr-FR").toLowerCase().startsWith("fr");
  const DEFAULT_LABELS: Required<AutosaveLabels> = isFr
    ? {
        idle: "Modifications enregistrées",
        saving: "Enregistrement…",
        saved: "Enregistré",
        error: "Échec de l'enregistrement",
      }
    : {
        idle: "All changes saved",
        saving: "Saving…",
        saved: "Saved",
        error: "Failed to save",
      };
  const resolvedRetryLabel = retryLabel ?? (isFr ? "Réessayer" : "Retry");
  const statusLabel = labels?.[status] ?? DEFAULT_LABELS[status];
  const role = status === "error" ? "alert" : "status";

  // Heure relative de la dernière sauvegarde (rendu uniquement sur idle/saved).
  const relativeTime = (() => {
    if (!lastSaved) return "";
    const date = lastSaved instanceof Date ? lastSaved : new Date(lastSaved);
    if (Number.isNaN(date.getTime())) return "";
    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    if (Math.abs(diffSec) < 60) return rtf.format(-diffSec, "second");
    const diffMin = Math.round(diffSec / 60);
    if (Math.abs(diffMin) < 60) return rtf.format(-diffMin, "minute");
    const diffHour = Math.round(diffMin / 60);
    if (Math.abs(diffHour) < 24) return rtf.format(-diffHour, "hour");
    const diffDay = Math.round(diffHour / 24);
    return rtf.format(-diffDay, "day");
  })();
  const showRelative = (status === "saved" || status === "idle") && relativeTime !== "";

  return (
    <div
      {...rest}
      className={classNames("st-autosave", `st-autosave--${status}`, className)}
      role={role}
      aria-live="polite"
    >
      <span className="st-autosave__icon" aria-hidden="true">
        {status === "saving" ? (
          <span className="st-autosave__spinner">
            <LoaderCircle size={16} strokeWidth={2} aria-hidden="true" />
          </span>
        ) : status === "saved" ? (
          <CircleCheck size={16} strokeWidth={2} aria-hidden="true" />
        ) : status === "error" ? (
          <CircleAlert size={16} strokeWidth={2} aria-hidden="true" />
        ) : null}
      </span>
      <span className="st-autosave__label">{statusLabel}</span>
      {showRelative ? <span className="st-autosave__time">{relativeTime}</span> : null}
      {status === "error" && onRetry ? (
        <button type="button" className="st-autosave__retry" onClick={() => onRetry?.()}>
          {resolvedRetryLabel}
        </button>
      ) : null}
    </div>
  );
}

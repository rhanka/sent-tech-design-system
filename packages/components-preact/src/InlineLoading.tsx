import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-preact";
import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type InlineLoadingProps = HTMLAttributes<HTMLDivElement> & {
  label?: ComponentChildren;
  status?: MaybeSignal<"active" | "inactive" | "success" | "error">;
  locale?: string;
};
export function InlineLoading({ label, status: statusInput = "active", locale = "fr-FR", className, "aria-label": ariaLabel, ...rest }: InlineLoadingProps) {
  const status = useValue(statusInput);
  // Canon Svelte : le libellé visible n'est rendu que s'il est fourni ; sinon
  // seul un aria-label de repli assure l'accessibilité (pas de texte visible).
  const isFr = (locale ?? "fr-FR").toLowerCase().startsWith("fr");
  const INLINE_LOADING_FALLBACK_LABELS = {
    active: isFr ? "Chargement" : "Loading",
    success: isFr ? "Terminé" : "Completed",
    error: isFr ? "Erreur" : "Error",
    inactive: isFr ? "Inactif" : "Inactive",
  } as const;
  const accessibleLabel = ariaLabel ?? (label ? undefined : INLINE_LOADING_FALLBACK_LABELS[status]);
  return (
    <div
      {...rest}
      className={classNames("st-inlineLoading", `st-inlineLoading--${status}`, className)}
      role={status === "error" ? "alert" : "status"}
      aria-label={accessibleLabel}
      aria-live="polite"
    >
      <span className="st-inlineLoading__icon" aria-hidden="true">
        {status === "active" ? (
          <span className="st-inlineLoading__spinner">
            <LoaderCircle size={16} strokeWidth={2} aria-hidden="true" />
          </span>
        ) : status === "success" ? (
          <CircleCheck size={16} strokeWidth={2} aria-hidden="true" />
        ) : status === "error" ? (
          <CircleAlert size={16} strokeWidth={2} aria-hidden="true" />
        ) : null}
      </span>
      {label ? <span className="st-inlineLoading__label">{label}</span> : null}
    </div>
  );
}

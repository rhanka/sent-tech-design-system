import { defineComponent, h } from "vue";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-vue-next";
import { classNames } from "./classNames.js";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

export type AutosaveLabels = {
  idle?: string;
  saving?: string;
  saved?: string;
  error?: string;
};

// In addition to the Vue-native `@retry` emit, an `onRetry` callback prop
// (parity with React/Svelte) is accepted and fired on the retry button.
export type AutosaveProps = {
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
  class?: string;
};

function LoaderCircleIcon(size: number) {
  return h(LoaderCircle, { size, strokeWidth: 2, "aria-hidden": "true" });
}

function CircleCheckIcon(size: number) {
  return h(CircleCheck, { size, strokeWidth: 2, "aria-hidden": "true" });
}

function CircleAlertIcon(size: number) {
  return h(CircleAlert, { size, strokeWidth: 2, "aria-hidden": "true" });
}

export const Autosave = defineComponent({
  name: "Autosave",
  props: {
    status: { type: String as () => AutosaveStatus, default: "idle" },
    lastSaved: { type: [String, Date] as unknown as () => string | Date, default: undefined },
    onRetry: { type: Function as unknown as () => () => void, default: undefined },
    labels: { type: Object as () => AutosaveLabels, default: undefined },
    retryLabel: { type: String, default: undefined },
    locale: { type: String, default: "fr-FR" },
    class: { type: String, default: undefined },
  },
  emits: ["retry"],
  setup(props, { emit, attrs }) {
    return () => {
      const status = props.status;
      const locale = props.locale;
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
      const resolvedRetryLabel = props.retryLabel ?? (isFr ? "Réessayer" : "Retry");
      const statusLabel = props.labels?.[status] ?? DEFAULT_LABELS[status];
      const role = status === "error" ? "alert" : "status";

      // Heure relative de la dernière sauvegarde (rendu uniquement sur idle/saved).
      const relativeTime = (() => {
        if (!props.lastSaved) return "";
        const date =
          props.lastSaved instanceof Date ? props.lastSaved : new Date(props.lastSaved);
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
      const showRelative =
        (status === "saved" || status === "idle") && relativeTime !== "";

      const icon =
        status === "saving"
          ? h("span", { class: "st-autosave__spinner" }, [LoaderCircleIcon(16)])
          : status === "saved"
            ? CircleCheckIcon(16)
            : status === "error"
              ? CircleAlertIcon(16)
              : null;

      const triggerRetry = () => {
        emit("retry");
        props.onRetry?.();
      };

      return h(
        "div",
        {
          ...attrs,
          class: classNames("st-autosave", `st-autosave--${status}`, props.class),
          role,
          "aria-live": "polite",
        },
        [
          h("span", { class: "st-autosave__icon", "aria-hidden": "true" }, [icon]),
          h("span", { class: "st-autosave__label" }, statusLabel),
          showRelative
            ? h("span", { class: "st-autosave__time" }, relativeTime)
            : null,
          status === "error" && props.onRetry
            ? h(
                "button",
                {
                  type: "button",
                  class: "st-autosave__retry",
                  onClick: triggerRetry,
                },
                resolvedRetryLabel,
              )
            : null,
        ],
      );
    };
  },
});

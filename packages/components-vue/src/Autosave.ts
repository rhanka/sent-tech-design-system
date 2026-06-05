import { defineComponent, h } from "vue";
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
  return h(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    [h("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" })],
  );
}

function CircleCheckIcon(size: number) {
  return h(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    [
      h("circle", { cx: "12", cy: "12", r: "10" }),
      h("path", { d: "m9 12 2 2 4-4" }),
    ],
  );
}

function CircleAlertIcon(size: number) {
  return h(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    [
      h("circle", { cx: "12", cy: "12", r: "10" }),
      h("line", { x1: "12", x2: "12", y1: "8", y2: "12" }),
      h("line", { x1: "12", x2: "12.01", y1: "16", y2: "16" }),
    ],
  );
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

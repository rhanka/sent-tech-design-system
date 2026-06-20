import { defineComponent, h } from "vue";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-vue-next";
import { classNames } from "./classNames.js";

export type InlineLoadingStatus = "active" | "inactive" | "success" | "error";

export type InlineLoadingProps = {
  label?: unknown;
  status?: InlineLoadingStatus;
  locale?: string;
  class?: string;
};

export const InlineLoading = defineComponent({
  name: "InlineLoading",
  props: {
    label: { type: [String, Object] as unknown as () => unknown, default: undefined },
    status: {
      type: String as () => InlineLoadingStatus,
      default: "active",
    },
    locale: { type: String, default: "fr-FR" },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      // Canon Svelte : le libellé visible n'est rendu que s'il est fourni ;
      // sinon un aria-label de repli porte l'accessibilité (aucun texte anglais
      // visible sur une page localisée).
      const isFr = (props.locale ?? "fr-FR").toLowerCase().startsWith("fr");
      const FALLBACK_LABELS: Record<InlineLoadingStatus, string> = {
        active: isFr ? "Chargement" : "Loading",
        success: isFr ? "Terminé" : "Completed",
        error: isFr ? "Erreur" : "Error",
        inactive: isFr ? "Inactif" : "Inactive",
      };
      const ariaLabel =
        (attrs["aria-label"] as string | undefined) ??
        (props.label ? undefined : FALLBACK_LABELS[props.status]);
      return h(
        "div",
        {
          ...attrs,
          class: classNames(
            "st-inlineLoading",
            `st-inlineLoading--${props.status}`,
            props.class,
          ),
          role: props.status === "error" ? "alert" : "status",
          "aria-label": ariaLabel,
          "aria-live": "polite",
        },
        [
          h(
            "span",
            { class: "st-inlineLoading__icon", "aria-hidden": "true" },
            [
              props.status === "active"
                ? h("span", { class: "st-inlineLoading__spinner" }, [
                    h(LoaderCircle, { size: 16, strokeWidth: 2, "aria-hidden": "true" }),
                  ])
                : props.status === "success"
                  ? h(CircleCheck, { size: 16, strokeWidth: 2, "aria-hidden": "true" })
                  : props.status === "error"
                    ? h(CircleAlert, { size: 16, strokeWidth: 2, "aria-hidden": "true" })
                    : null,
            ],
          ),
          props.label
            ? h(
                "span",
                { class: "st-inlineLoading__label" },
                props.label as string,
              )
            : null,
        ],
      );
    };
  },
});

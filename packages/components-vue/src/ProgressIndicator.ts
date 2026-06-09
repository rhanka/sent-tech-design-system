import { defineComponent, h } from "vue";
import { Check, X } from "lucide-vue-next";
import { classNames } from "./classNames.js";

export type ProgressIndicatorStatus =
  | "complete"
  | "current"
  | "upcoming"
  | "disabled"
  | "invalid"
  | "incomplete";

export interface ProgressIndicatorItem {
  id?: string;
  /** Svelte-canonical alias for the React/Vue `id`. */
  value?: string;
  label: unknown;
  description?: unknown;
  status?: ProgressIndicatorStatus;
}

export type ProgressIndicatorOrientation = "horizontal" | "vertical";

export type ProgressIndicatorProps = {
  items: ProgressIndicatorItem[];
  orientation?: ProgressIndicatorOrientation;
  /** Svelte-canonical alias: `vertical` sets `orientation="vertical"`. */
  vertical?: boolean;
  label?: string;
  class?: string;
};

export const ProgressIndicator = defineComponent({
  name: "ProgressIndicator",
  props: {
    items: { type: Array as () => ProgressIndicatorItem[], required: true },
    orientation: {
      type: String as () => ProgressIndicatorOrientation,
      default: "horizontal",
    },
    vertical: { type: Boolean, default: false },
    label: { type: String, default: "Progress" },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const resolvedOrientation = props.vertical ? "vertical" : props.orientation;
      return h(
        "ol",
        {
          ...attrs,
          "aria-label": props.label,
          class: classNames(
            "st-progressIndicator",
            `st-progressIndicator--${resolvedOrientation}`,
            props.class,
          ),
        },
        props.items.map((item, index) => {
          const status = item.status ?? "upcoming";
          const isLast = index === props.items.length - 1;
          return h(
            "li",
            {
              key: item.id ?? item.value ?? index,
              class: classNames(
                "st-progressIndicator__step",
                `st-progressIndicator__step--${status}`,
              ),
              "aria-current": status === "current" ? "step" : undefined,
            },
            [
              h("span", { class: "st-progressIndicator__indicator" }, [
                h(
                  "span",
                  { class: "st-progressIndicator__circle" },
                  status === "complete"
                    ? h(Check, { size: 14, strokeWidth: 2, "aria-hidden": "true" })
                    : status === "invalid"
                      ? h(X, { size: 14, strokeWidth: 2, "aria-hidden": "true" })
                      : status === "current"
                        ? h("span", { class: "st-progressIndicator__dot" })
                        : h("span", { class: "st-progressIndicator__index" }, String(index + 1)),
                ),
                !isLast ? h("span", { class: "st-progressIndicator__connector" }) : null,
              ]),
              h("span", { class: "st-progressIndicator__text" }, [
                h(
                  "span",
                  { class: "st-progressIndicator__label" },
                  item.label as string,
                ),
                item.description
                  ? h(
                      "span",
                      { class: "st-progressIndicator__description" },
                      item.description as string,
                    )
                  : null,
              ]),
            ],
          );
        }),
      );
    };
  },
});

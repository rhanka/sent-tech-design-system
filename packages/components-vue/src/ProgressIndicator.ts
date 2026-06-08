import { defineComponent, h } from "vue";
import { Check, X } from "lucide-vue-next";
import { classNames } from "./classNames.js";

export type ProgressIndicatorStatus =
  | "complete"
  | "current"
  | "disabled"
  | "invalid"
  | "incomplete";

export interface ProgressIndicatorItem {
  id?: string;
  label: unknown;
  description?: unknown;
  status?: ProgressIndicatorStatus;
}

export type ProgressIndicatorOrientation = "horizontal" | "vertical";

export type ProgressIndicatorProps = {
  items: ProgressIndicatorItem[];
  orientation?: ProgressIndicatorOrientation;
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
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () =>
      h(
        "ol",
        {
          ...attrs,
          class: classNames(
            "st-progressIndicator",
            `st-progressIndicator--${props.orientation}`,
            props.class,
          ),
        },
        props.items.map((item, index) =>
          h(
            "li",
            {
              key: item.id ?? index,
              class: classNames(
                "st-progressIndicator__step",
                `st-progressIndicator__step--${item.status ?? "incomplete"}`,
              ),
            },
            [
              h(
                "span",
                { class: "st-progressIndicator__indicator" },
                item.status === "complete"
                  ? h(Check, { size: 14, strokeWidth: 2, "aria-hidden": "true" })
                  : item.status === "invalid"
                    ? h(X, { size: 14, strokeWidth: 2, "aria-hidden": "true" })
                    : String(index + 1),
              ),
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
          ),
        ),
      );
  },
});

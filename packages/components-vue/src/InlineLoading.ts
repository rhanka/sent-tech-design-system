import { defineComponent, h } from "vue";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-vue-next";
import { classNames } from "./classNames.js";

export type InlineLoadingStatus = "active" | "inactive" | "success" | "error";

export type InlineLoadingProps = {
  label?: unknown;
  status?: InlineLoadingStatus;
  class?: string;
};

export const InlineLoading = defineComponent({
  name: "InlineLoading",
  props: {
    label: { type: [String, Object] as unknown as () => unknown, default: "Loading" },
    status: {
      type: String as () => InlineLoadingStatus,
      default: "active",
    },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () =>
      h(
        "div",
        {
          ...attrs,
          class: classNames(
            "st-inlineLoading",
            `st-inlineLoading--${props.status}`,
            props.class,
          ),
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
          h(
            "span",
            { class: "st-inlineLoading__label" },
            props.label as string,
          ),
        ],
      );
  },
});

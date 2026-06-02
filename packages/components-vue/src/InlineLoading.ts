import { defineComponent, h } from "vue";
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
          h("span", {
            class: "st-inlineLoading__spinner",
            "aria-hidden": "true",
          }),
          h(
            "span",
            { class: "st-inlineLoading__label" },
            props.label as string,
          ),
        ],
      );
  },
});

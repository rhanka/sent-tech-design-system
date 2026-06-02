import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type LoadingStateVariant = "spinner" | "skeleton";

export type LoadingStateProps = {
  label?: unknown;
  title?: unknown;
  variant?: LoadingStateVariant;
  class?: string;
};

export const LoadingState = defineComponent({
  name: "LoadingState",
  props: {
    label: { type: [String, Object] as unknown as () => unknown, default: undefined },
    title: { type: [String, Object] as unknown as () => unknown, default: undefined },
    variant: {
      type: String as () => LoadingStateVariant,
      default: "spinner",
    },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () =>
      h(
        "section",
        {
          ...attrs,
          class: classNames(
            "st-loading",
            `st-loading--${props.variant}`,
            props.class,
          ),
          "aria-live": "polite",
        },
        [
          h("span", {
            class: "st-loading__spinner",
            "aria-hidden": "true",
          }),
          h(
            "span",
            { class: "st-loading__label" },
            (props.label ?? props.title ?? "Loading") as string,
          ),
        ],
      );
  },
});

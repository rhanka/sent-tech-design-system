import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type HighlightTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";

export type HighlightProps = {
  tone?: HighlightTone;
  title?: unknown;
  class?: string;
};

export const Highlight = defineComponent({
  name: "Highlight",
  props: {
    tone: {
      type: String as () => HighlightTone,
      default: "neutral",
    },
    title: { type: [String, Object] as unknown as () => unknown, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "aside",
        {
          ...attrs,
          class: classNames(
            "st-highlight",
            `st-highlight--${props.tone}`,
            props.class,
          ),
        },
        [
          props.title
            ? h("h3", { class: "st-highlight__title" }, props.title as string)
            : null,
          h("div", { class: "st-highlight__body" }, slots.default?.()),
        ],
      );
  },
});

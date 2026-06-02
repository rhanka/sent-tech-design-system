import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type TagTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";
export type TagSize = "sm" | "md";

export type TagProps = {
  tone?: TagTone;
  size?: TagSize;
  disabled?: boolean;
  class?: string;
};

export const Tag = defineComponent({
  name: "Tag",
  props: {
    tone: { type: String as () => TagTone, default: "neutral" },
    size: { type: String as () => TagSize, default: "md" },
    disabled: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  emits: ["dismiss"],
  setup(props, { slots, emit, attrs }) {
    return () =>
      h(
        "span",
        {
          ...attrs,
          class: classNames(
            "st-tag",
            `st-tag--${props.tone}`,
            `st-tag--${props.size}`,
            props.disabled && "st-tag--disabled",
            props.class,
          ),
        },
        [
          h("span", { class: "st-tag__label" }, slots.default?.()),
        ],
      );
  },
});

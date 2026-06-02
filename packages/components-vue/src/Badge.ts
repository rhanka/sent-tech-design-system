import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type BadgeTone = "neutral" | "success" | "warning" | "error" | "info";

export type BadgeProps = {
  tone?: BadgeTone;
  class?: string;
};

export const Badge = defineComponent({
  name: "Badge",
  props: {
    tone: { type: String as () => BadgeTone, default: "neutral" },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "span",
        {
          ...attrs,
          class: classNames("st-badge", `st-badge--${props.tone}`, props.class),
        },
        slots.default?.(),
      );
  },
});

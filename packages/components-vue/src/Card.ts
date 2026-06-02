import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type CardProps = {
  interactive?: boolean;
  class?: string;
};

export const Card = defineComponent({
  name: "Card",
  props: {
    interactive: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "section",
        {
          ...attrs,
          class: classNames(
            "st-card",
            props.interactive && "st-card--interactive",
            props.class,
          ),
        },
        slots.default?.(),
      );
  },
});

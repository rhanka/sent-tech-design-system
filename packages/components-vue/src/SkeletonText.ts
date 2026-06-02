import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type SkeletonTextProps = {
  lines?: number;
  label?: string;
  class?: string;
};

export const SkeletonText = defineComponent({
  name: "SkeletonText",
  props: {
    lines: { type: Number, default: 3 },
    label: { type: String, default: "Loading" },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () =>
      h(
        "div",
        {
          ...attrs,
          class: classNames("st-skeleton", props.class),
          "aria-label": props.label,
        },
        [
          h(
            "span",
            { class: "st-visually-hidden" },
            props.label,
          ),
          ...Array.from({ length: props.lines ?? 3 }, (_, index) =>
            h("span", {
              key: index,
              class: classNames(
                "st-skeleton__line",
                index === 0 && "st-skeleton__line--heading",
              ),
            }),
          ),
        ],
      );
  },
});

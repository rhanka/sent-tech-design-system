import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type AspectRatioProps = {
  ratio?: number | string;
  class?: string;
};

export const AspectRatio = defineComponent({
  name: "AspectRatio",
  props: {
    ratio: { type: [Number, String] as unknown as () => number | string, default: "16 / 9" },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const aspectRatio = typeof props.ratio === "number" ? String(props.ratio) : props.ratio;
      return h(
        "div",
        {
          ...attrs,
          class: classNames("st-aspectRatio", props.class),
          style: { aspectRatio, ...(attrs.style as object | undefined) },
        },
        slots.default?.(),
      );
    };
  },
});

import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";
import { Flex } from "./Flex.js";
import type { FlexAlign, FlexJustify } from "./Flex.js";

export type StackProps = {
  /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
  gap?: number;
  align?: FlexAlign;
  justify?: FlexJustify;
  as?: string;
  class?: string;
};

export const Stack = defineComponent({
  name: "Stack",
  props: {
    gap: { type: Number, default: undefined },
    align: { type: String as () => FlexAlign, default: undefined },
    justify: { type: String as () => FlexJustify, default: undefined },
    as: { type: String, default: "div" },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        Flex,
        {
          ...attrs,
          as: props.as,
          gap: props.gap,
          align: props.align,
          justify: props.justify,
          direction: "column",
          class: classNames("st-stack", props.class),
        },
        slots.default ? { default: () => slots.default?.() } : undefined,
      );
  },
});

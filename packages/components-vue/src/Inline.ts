import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";
import { Flex } from "./Flex.js";
import type { FlexAlign, FlexJustify } from "./Flex.js";

export type InlineProps = {
  /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
  gap?: number;
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: boolean;
  as?: string;
  class?: string;
};

export const Inline = defineComponent({
  name: "Inline",
  props: {
    gap: { type: Number, default: undefined },
    align: { type: String as () => FlexAlign, default: undefined },
    justify: { type: String as () => FlexJustify, default: undefined },
    wrap: { type: Boolean, default: true },
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
          wrap: props.wrap,
          direction: "row",
          class: classNames("st-inline", props.class),
        },
        slots.default ? { default: () => slots.default?.() } : undefined,
      );
  },
});

import { defineComponent, h } from "vue";
import type { CSSProperties } from "vue";
import { classNames } from "./classNames.js";
import { spacingToken, alignValue, justifyValue } from "./Flex.js";
import type { FlexAlign, FlexJustify } from "./Flex.js";

export type RowProps = {
  /** Spacing scale step (0..12) used for the column gutter. */
  gutter?: number;
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: boolean;
  as?: string;
  class?: string;
};

export const Row = defineComponent({
  name: "Row",
  props: {
    gutter: { type: Number, default: 4 },
    align: { type: String as () => FlexAlign, default: undefined },
    justify: { type: String as () => FlexJustify, default: undefined },
    wrap: { type: Boolean, default: true },
    as: { type: String, default: "div" },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const gap = spacingToken(props.gutter) ?? "0";
      const style = {
        flexWrap: props.wrap ? "wrap" : "nowrap",
        alignItems: alignValue(props.align),
        justifyContent: justifyValue(props.justify),
        gap,
        "--st-row-gutter": gap,
        ...(attrs.style as CSSProperties | undefined),
      } as CSSProperties;
      return h(
        props.as,
        {
          ...attrs,
          class: classNames("st-row", props.class),
          style,
        },
        slots.default?.(),
      );
    };
  },
});

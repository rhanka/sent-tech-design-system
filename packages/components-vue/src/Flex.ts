import { defineComponent, h } from "vue";
import type { CSSProperties } from "vue";
import { classNames } from "./classNames.js";

export type FlexDirection = "row" | "column" | "row-reverse" | "column-reverse";
export type FlexAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type FlexJustify = "start" | "center" | "end" | "between" | "around" | "evenly";

export type FlexProps = {
  direction?: FlexDirection;
  /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
  gap?: number;
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: boolean;
  inline?: boolean;
  as?: string;
  class?: string;
};

import { spacingToken } from './spacing.js';
export { spacingToken } from './spacing.js';

const ALIGN: Record<FlexAlign, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
};

const JUSTIFY: Record<FlexJustify, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

export function alignValue(align: FlexAlign | undefined): string | undefined {
  return align ? ALIGN[align] : undefined;
}

export function justifyValue(justify: FlexJustify | undefined): string | undefined {
  return justify ? JUSTIFY[justify] : undefined;
}

export const Flex = defineComponent({
  name: "Flex",
  props: {
    direction: { type: String as () => FlexDirection, default: "row" },
    gap: { type: Number, default: undefined },
    align: { type: String as () => FlexAlign, default: undefined },
    justify: { type: String as () => FlexJustify, default: undefined },
    wrap: { type: Boolean, default: false },
    inline: { type: Boolean, default: false },
    as: { type: String, default: "div" },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const style: CSSProperties = {
        display: props.inline ? "inline-flex" : "flex",
        flexDirection: props.direction,
        flexWrap: props.wrap ? "wrap" : "nowrap",
        alignItems: alignValue(props.align),
        justifyContent: justifyValue(props.justify),
        gap: spacingToken(props.gap),
        ...(attrs.style as CSSProperties | undefined),
      };
      return h(
        props.as,
        {
          ...attrs,
          class: classNames("st-flex", props.class),
          style,
        },
        slots.default?.(),
      );
    };
  },
});

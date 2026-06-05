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

/** rem fallbacks for the Sent Tech spacing scale (steps 5/7/9/10/11 are
    interpolated since no token exists, but the var() is still preferred). */
const SPACING_FALLBACK: Record<number, string> = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  11: "2.75rem",
  12: "3rem",
};

/** Resolve a spacing step to a `var(--st-spacing-N, fallback)` expression. */
export function spacingToken(step: number | undefined): string | undefined {
  if (step == null) return undefined;
  const clamped = Math.max(0, Math.min(12, Math.round(step)));
  if (clamped === 0) return "0";
  return `var(--st-spacing-${clamped}, ${SPACING_FALLBACK[clamped]})`;
}

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

import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type HiddenBreakpoint = "sm" | "md" | "lg" | "xl";

export type HiddenProps = {
  /** Hide when viewport is narrower than this breakpoint. */
  below?: HiddenBreakpoint;
  /** Hide when viewport is at or wider than this breakpoint. */
  above?: HiddenBreakpoint;
  as?: string;
  class?: string;
};

export const Hidden = defineComponent({
  name: "Hidden",
  props: {
    below: { type: String as () => HiddenBreakpoint, default: undefined },
    above: { type: String as () => HiddenBreakpoint, default: undefined },
    as: { type: String, default: "div" },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        props.as,
        {
          ...attrs,
          class: classNames(
            "st-hidden",
            props.below && `st-hidden--below-${props.below}`,
            props.above && `st-hidden--above-${props.above}`,
            props.class,
          ),
        },
        slots.default?.(),
      );
  },
});

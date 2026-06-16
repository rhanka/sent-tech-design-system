import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type BadgeTone = "neutral" | "success" | "warning" | "error" | "info";

/**
 * Badge shape — `"pill"` (default) is the base render (radius pill, width grows
 * with content). `"circle"` renders an equal-sided round bubble (tabular-nums) —
 * best for ≤2-digit counts; 3+ digit content degrades gracefully to a
 * rounded-rect (never clipped). Additive: with `shape` unset the badge renders
 * byte-identically to before.
 */
export type BadgeShape = "pill" | "circle";

/**
 * Density — `"md"` (default) is the base render. `"sm"` shrinks the font-size
 * (the rail-bubble scale). Additive: with `size` unset the badge renders
 * byte-identically to before.
 */
export type BadgeSize = "sm" | "md";

export type BadgeProps = {
  tone?: BadgeTone;
  shape?: BadgeShape;
  size?: BadgeSize;
  class?: string;
};

export const Badge = defineComponent({
  name: "Badge",
  props: {
    tone: { type: String as () => BadgeTone, default: "neutral" },
    shape: { type: String as () => BadgeShape, default: "pill" },
    size: { type: String as () => BadgeSize, default: "md" },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "span",
        {
          ...attrs,
          class: classNames(
            "st-badge",
            `st-badge--${props.tone}`,
            `st-badge--${props.shape}`,
            `st-badge--${props.size}`,
            props.class,
          ),
        },
        slots.default?.(),
      );
  },
});

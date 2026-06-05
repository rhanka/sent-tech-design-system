import { defineComponent, h } from "vue";
import type { CSSProperties } from "vue";
import { classNames } from "./classNames.js";
import { spacingToken } from "./Flex.js";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerVariant = "solid" | "dashed";

export type DividerProps = {
  orientation?: DividerOrientation;
  /** Spacing scale step (0..12) applied as margin around the divider. */
  spacing?: number;
  /** Optional label centered on a horizontal divider line. */
  label?: string;
  variant?: DividerVariant;
  class?: string;
};

export const Divider = defineComponent({
  name: "Divider",
  props: {
    orientation: { type: String as () => DividerOrientation, default: "horizontal" },
    spacing: { type: Number, default: undefined },
    label: { type: String, default: undefined },
    variant: { type: String as () => DividerVariant, default: "solid" },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const isVertical = props.orientation === "vertical";
      const hasLabel = !isVertical && props.label != null && props.label !== "";
      const margin = spacingToken(props.spacing);

      const classes = classNames(
        "st-divider",
        `st-divider--${props.orientation}`,
        `st-divider--${props.variant}`,
        hasLabel && "st-divider--labeled",
        props.class,
      );

      if (hasLabel) {
        return h(
          "div",
          {
            ...attrs,
            class: classes,
            role: "separator",
            "aria-orientation": "horizontal",
            style: { marginBlock: margin, ...(attrs.style as CSSProperties | undefined) },
          },
          [
            h("span", { class: "st-divider__line", "aria-hidden": "true" }),
            h("span", { class: "st-divider__label" }, props.label),
            h("span", { class: "st-divider__line", "aria-hidden": "true" }),
          ],
        );
      }

      return h("div", {
        ...attrs,
        class: classes,
        role: "separator",
        "aria-orientation": props.orientation,
        style: {
          marginBlock: isVertical ? undefined : margin,
          marginInline: isVertical ? margin : undefined,
          ...(attrs.style as CSSProperties | undefined),
        },
      });
    };
  },
});

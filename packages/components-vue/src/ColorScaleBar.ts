import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type ColorScaleBarOrientation = "horizontal" | "vertical";

export type ColorScaleBarProps = {
  colors: string[];
  orientation?: ColorScaleBarOrientation;
  length?: number;
  thickness?: number;
  min?: string;
  max?: string;
  label?: string;
  class?: string;
};

/**
 * ColorScaleBar — échelle de couleur continue (gradient) à partir de stops
 * arbitraires. Seul le gradient est inline ; le reste du style est token-only.
 */
export const ColorScaleBar = defineComponent({
  name: "ColorScaleBar",
  props: {
    colors: { type: Array as () => string[], default: () => [] },
    orientation: { type: String as () => ColorScaleBarOrientation, default: "horizontal" },
    length: { type: Number, default: undefined },
    thickness: { type: Number, default: undefined },
    min: { type: String, default: undefined },
    max: { type: String, default: undefined },
    label: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const orientation = props.orientation ?? "horizontal";
      const isVertical = orientation === "vertical";
      const colors = props.colors ?? [];

      const stops = colors.length >= 2 ? colors : colors.length === 1 ? [colors[0], colors[0]] : [];

      const direction = isVertical ? "to top" : "to right";
      const gradient = stops.length ? `linear-gradient(${direction}, ${stops.join(", ")})` : "none";

      const safeLength =
        props.length !== undefined ? Math.max(Number(props.length) || 0, 1) : undefined;
      const safeThickness =
        props.thickness !== undefined ? Math.max(Number(props.thickness) || 0, 1) : undefined;

      const barStyle: Record<string, string> = { background: gradient };
      if (isVertical) {
        if (safeLength !== undefined) barStyle.height = `${safeLength}px`;
        if (safeThickness !== undefined) barStyle.width = `${safeThickness}px`;
      } else {
        if (safeLength !== undefined) barStyle.width = `${safeLength}px`;
        if (safeThickness !== undefined) barStyle.height = `${safeThickness}px`;
      }

      const hasEndLabels = props.min !== undefined || props.max !== undefined;

      const trackChildren: (ReturnType<typeof h> | null)[] = [];
      if (hasEndLabels) {
        trackChildren.push(
          h("span", { class: "st-colorScaleBar__end st-colorScaleBar__end--max" }, props.max ?? ""),
        );
      }
      trackChildren.push(
        h("div", {
          class: "st-colorScaleBar__bar",
          style: barStyle,
          role: "img",
          "aria-label": props.label,
        }),
      );
      if (hasEndLabels) {
        trackChildren.push(
          h("span", { class: "st-colorScaleBar__end st-colorScaleBar__end--min" }, props.min ?? ""),
        );
      }

      const children: (ReturnType<typeof h> | null)[] = [];
      if (props.label) {
        children.push(h("span", { class: "st-colorScaleBar__label" }, props.label));
      }
      children.push(h("div", { class: "st-colorScaleBar__track" }, trackChildren));

      return h(
        "div",
        {
          ...attrs,
          class: classNames("st-colorScaleBar", `st-colorScaleBar--${orientation}`, props.class),
        },
        children,
      );
    };
  },
});

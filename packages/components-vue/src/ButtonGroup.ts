import { defineComponent, h } from "vue";
import type { CSSProperties } from "vue";
import { classNames } from "./classNames.js";

export type ButtonGroupOrientation = "horizontal" | "vertical";
export type ButtonGroupSize = "sm" | "md" | "lg";

export type ButtonGroupProps = {
  orientation?: ButtonGroupOrientation;
  /** Look segmenté joint (boutons collés, coins arrondis seulement aux extrémités). */
  attached?: boolean;
  /** Espacement entre boutons (échelle spacing), ignoré quand `attached`. */
  gap?: number;
  /** Taille indicative (transmise via data-attr pour styliser les enfants si besoin). */
  size?: ButtonGroupSize;
  /** Étiquette a11y du groupe. */
  label?: string;
  class?: string;
};

export const ButtonGroup = defineComponent({
  name: "ButtonGroup",
  props: {
    orientation: {
      type: String as () => ButtonGroupOrientation,
      default: "horizontal",
    },
    attached: { type: Boolean, default: false },
    gap: { type: Number, default: undefined },
    size: { type: String as () => ButtonGroupSize, default: "md" },
    label: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const classes = classNames(
        "st-buttonGroup",
        `st-buttonGroup--${props.orientation}`,
        props.attached && "st-buttonGroup--attached",
        props.class,
      );
      const gapValue =
        props.attached || props.gap == null
          ? undefined
          : `var(--st-spacing-${props.gap}, ${props.gap * 0.25}rem)`;
      const style: CSSProperties | undefined =
        gapValue != null
          ? { ...(attrs.style as CSSProperties | undefined), gap: gapValue }
          : (attrs.style as CSSProperties | undefined);
      return h(
        "div",
        {
          ...attrs,
          class: classes,
          role: "group",
          "aria-label": props.label,
          "data-size": props.size,
          style,
        },
        slots.default?.(),
      );
    };
  },
});

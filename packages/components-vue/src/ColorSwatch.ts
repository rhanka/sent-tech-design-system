import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type ColorSwatchShape = "square" | "circle" | "pill";

export type ColorSwatchProps = {
  color: string;
  size?: number;
  shape?: ColorSwatchShape;
  label?: string;
  class?: string;
};

/**
 * ColorSwatch — affiche UNE couleur arbitraire sous forme de pastille. Seule la
 * couleur passée en prop est inline ; le reste du style est token-only.
 */
export const ColorSwatch = defineComponent({
  name: "ColorSwatch",
  props: {
    color: { type: String, required: true },
    size: { type: Number, default: 24 },
    shape: { type: String as () => ColorSwatchShape, default: "square" },
    label: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const shape = props.shape ?? "square";
      const safeSize = Math.max(Number(props.size ?? 24) || 0, 1);
      const accessibleLabel = props.label ?? props.color;

      const children: (ReturnType<typeof h> | null)[] = [
        h("span", {
          class: "st-colorSwatch__chip",
          style: { background: props.color, width: `${safeSize}px`, height: `${safeSize}px` },
          role: "img",
          "aria-label": accessibleLabel,
        }),
      ];

      if (props.label) {
        children.push(h("span", { class: "st-colorSwatch__label" }, props.label));
      }

      return h(
        "span",
        { ...attrs, class: classNames("st-colorSwatch", `st-colorSwatch--${shape}`, props.class) },
        children,
      );
    };
  },
});

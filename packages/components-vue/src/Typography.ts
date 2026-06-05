import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type TypographyVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "body"
  | "body-sm"
  | "caption"
  | "overline";

export type TypographyWeight = "regular" | "medium" | "semibold" | "bold";
export type TypographyTone = "primary" | "secondary" | "muted" | "inverse" | "link";
export type TypographyAlign = "start" | "center" | "end" | "justify";

/** Balise HTML par défaut pour chaque variante. */
const VARIANT_TAG: Record<TypographyVariant, string> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  body: "p",
  "body-sm": "p",
  caption: "span",
  overline: "span",
};

export type TypographyProps = {
  variant?: TypographyVariant;
  /** Surcharge la balise déduite de la variante. */
  as?: string;
  weight?: TypographyWeight;
  tone?: TypographyTone;
  align?: TypographyAlign;
  /** Tronque sur une ligne avec ellipsis. */
  truncate?: boolean;
  class?: string;
};

export const Typography = defineComponent({
  name: "Typography",
  props: {
    variant: { type: String as () => TypographyVariant, default: "body" },
    as: { type: String, default: undefined },
    weight: { type: String as () => TypographyWeight, default: undefined },
    tone: { type: String as () => TypographyTone, default: undefined },
    align: { type: String as () => TypographyAlign, default: undefined },
    truncate: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const Tag = props.as ?? VARIANT_TAG[props.variant];
      const classes = classNames(
        "st-typography",
        `st-typography--${props.variant}`,
        props.weight && `st-typography--weight-${props.weight}`,
        props.tone && `st-typography--tone-${props.tone}`,
        props.align && `st-typography--align-${props.align}`,
        props.truncate && "st-typography--truncate",
        props.class,
      );
      return h(Tag, { ...attrs, class: classes }, slots.default?.());
    };
  },
});

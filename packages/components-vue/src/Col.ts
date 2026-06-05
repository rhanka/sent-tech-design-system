import { defineComponent, h } from "vue";
import type { CSSProperties } from "vue";
import { classNames } from "./classNames.js";

export type ColSpan = number | "auto";

export type ColProps = {
  /** Number of 12-grid columns to span, or "auto" to size to content. */
  span?: ColSpan;
  /** Columns to offset (0..11) via margin-inline-start. */
  offset?: number;
  /** Responsive overrides applied at and above the breakpoint. */
  sm?: ColSpan;
  md?: ColSpan;
  lg?: ColSpan;
  as?: string;
  class?: string;
};

/** Width expression for a given span. Accounts for the shared row gutter so a
    full 12 columns still fit on one line (gap-based layout). */
export function spanBasis(span: ColSpan | undefined): string | undefined {
  if (span == null) return undefined;
  if (span === "auto") return "auto";
  const clamped = Math.max(1, Math.min(12, Math.round(span)));
  const ratio = clamped / 12;
  // Subtract this column's share of the inter-column gutters.
  return `calc(${ratio * 100}% - var(--st-row-gutter, 0px) * ${(12 - clamped) / 12})`;
}

export function offsetMargin(offset: number | undefined): string | undefined {
  if (!offset) return undefined;
  const clamped = Math.max(0, Math.min(11, Math.round(offset)));
  if (clamped === 0) return undefined;
  const ratio = clamped / 12;
  return `calc(${ratio * 100}% + var(--st-row-gutter, 0px) * ${ratio})`;
}

export const Col = defineComponent({
  name: "Col",
  props: {
    span: {
      type: [Number, String] as unknown as () => ColSpan,
      default: "auto",
    },
    offset: { type: Number, default: 0 },
    sm: { type: [Number, String] as unknown as () => ColSpan, default: undefined },
    md: { type: [Number, String] as unknown as () => ColSpan, default: undefined },
    lg: { type: [Number, String] as unknown as () => ColSpan, default: undefined },
    as: { type: String, default: "div" },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const isAuto = props.span === "auto";
      const basis = spanBasis(props.span);
      const style = {
        flexBasis: basis,
        maxInlineSize: isAuto ? undefined : basis,
        flexGrow: isAuto ? 1 : 0,
        marginInlineStart: offsetMargin(props.offset),
        "--st-col-sm": spanBasis(props.sm),
        "--st-col-md": spanBasis(props.md),
        "--st-col-lg": spanBasis(props.lg),
        ...(attrs.style as CSSProperties | undefined),
      } as CSSProperties;
      return h(
        props.as,
        {
          ...attrs,
          class: classNames(
            "st-col",
            isAuto && "st-col--auto",
            props.sm != null && "st-col--has-sm",
            props.md != null && "st-col--has-md",
            props.lg != null && "st-col--has-lg",
            props.class,
          ),
          style,
        },
        slots.default?.(),
      );
    };
  },
});

import React from "react";
import { classNames } from "./classNames.js";

export type ColSpan = number | "auto";

export type ColProps = Omit<React.HTMLAttributes<HTMLElement>, "className"> & {
  /** Number of 12-grid columns to span, or "auto" to size to content. */
  span?: ColSpan;
  /** Columns to offset (0..11) via margin-inline-start. */
  offset?: number;
  /** Responsive overrides applied at and above the breakpoint. */
  sm?: ColSpan;
  md?: ColSpan;
  lg?: ColSpan;
  as?: string;
  className?: string;
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

export const Col = React.forwardRef<HTMLElement, ColProps>(
  ({ span = "auto", offset = 0, sm, md, lg, as = "div", className, style, children, ...rest }, ref) => {
    const Tag = as as React.ElementType;
    const isAuto = span === "auto";
    const basis = spanBasis(span);
    const mergedStyle = {
      flexBasis: basis,
      maxInlineSize: isAuto ? undefined : basis,
      flexGrow: isAuto ? 1 : 0,
      marginInlineStart: offsetMargin(offset),
      "--st-col-sm": spanBasis(sm),
      "--st-col-md": spanBasis(md),
      "--st-col-lg": spanBasis(lg),
      ...style,
    } as React.CSSProperties;
    return (
      <Tag
        {...rest}
        ref={ref}
        className={classNames(
          "st-col",
          isAuto && "st-col--auto",
          sm != null && "st-col--has-sm",
          md != null && "st-col--has-md",
          lg != null && "st-col--has-lg",
          className,
        )}
        style={mergedStyle}
      >
        {children}
      </Tag>
    );
  },
);

Col.displayName = "Col";

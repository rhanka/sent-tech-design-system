import React from "react";
import { classNames } from "./classNames.js";

export type FlexDirection = "row" | "column" | "row-reverse" | "column-reverse";
export type FlexAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type FlexJustify = "start" | "center" | "end" | "between" | "around" | "evenly";

export type FlexProps = Omit<React.HTMLAttributes<HTMLElement>, "className"> & {
  direction?: FlexDirection;
  /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
  gap?: number;
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: boolean;
  inline?: boolean;
  as?: string;
  className?: string;
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

export const Flex = React.forwardRef<HTMLElement, FlexProps>(
  (
    {
      direction = "row",
      gap,
      align,
      justify,
      wrap = false,
      inline = false,
      as = "div",
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const Tag = as as React.ElementType;
    const mergedStyle: React.CSSProperties = {
      display: inline ? "inline-flex" : "flex",
      flexDirection: direction,
      flexWrap: wrap ? "wrap" : "nowrap",
      alignItems: alignValue(align),
      justifyContent: justifyValue(justify),
      gap: spacingToken(gap),
      ...style,
    };
    return (
      <Tag {...rest} ref={ref} className={classNames("st-flex", className)} style={mergedStyle}>
        {children}
      </Tag>
    );
  },
);

Flex.displayName = "Flex";

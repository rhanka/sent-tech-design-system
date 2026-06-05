import React from "react";
import { classNames } from "./classNames.js";
import { spacingToken, alignValue, justifyValue } from "./Flex.js";
import type { FlexAlign, FlexJustify } from "./Flex.js";

export type RowProps = Omit<React.HTMLAttributes<HTMLElement>, "className"> & {
  /** Spacing scale step (0..12) used for the column gutter. */
  gutter?: number;
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: boolean;
  as?: string;
  className?: string;
};

export const Row = React.forwardRef<HTMLElement, RowProps>(
  ({ gutter = 4, align, justify, wrap = true, as = "div", className, style, children, ...rest }, ref) => {
    const Tag = as as React.ElementType;
    const gap = spacingToken(gutter) ?? "0";
    const mergedStyle = {
      flexWrap: wrap ? "wrap" : "nowrap",
      alignItems: alignValue(align),
      justifyContent: justifyValue(justify),
      gap,
      "--st-row-gutter": gap,
      ...style,
    } as React.CSSProperties;
    return (
      <Tag {...rest} ref={ref} className={classNames("st-row", className)} style={mergedStyle}>
        {children}
      </Tag>
    );
  },
);

Row.displayName = "Row";

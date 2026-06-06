import React from "react";
import { classNames } from "./classNames.js";
import { spacingToken } from "./Flex.js";

export type GridProps = Omit<React.HTMLAttributes<HTMLElement>, "className"> & {
  /** Number of equal columns: `repeat(columns, minmax(0, 1fr))`. */
  columns?: number;
  /**
   * Responsive auto mode: `repeat(auto-fill, minmax(minItemWidth, 1fr))`.
   * Takes priority over `columns` when provided.
   */
  minItemWidth?: string;
  /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
  gap?: number;
  as?: string;
  className?: string;
};

/** Resolve the `grid-template-columns` value. `minItemWidth` (responsive
    auto-fill) wins over a fixed column count. */
export function gridTemplateColumns(
  columns: number | undefined,
  minItemWidth: string | undefined,
): string | undefined {
  if (minItemWidth != null && minItemWidth !== "") {
    return `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`;
  }
  if (columns != null) {
    const clamped = Math.max(1, Math.round(columns));
    return `repeat(${clamped}, minmax(0, 1fr))`;
  }
  return undefined;
}

export const Grid = React.forwardRef<HTMLElement, GridProps>(
  ({ columns, minItemWidth, gap, as = "div", className, style, children, ...rest }, ref) => {
    const Tag = as as React.ElementType;
    const mergedStyle: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns: gridTemplateColumns(columns, minItemWidth),
      gap: spacingToken(gap),
      ...style,
    };
    return (
      <Tag {...rest} ref={ref} className={classNames("st-grid", className)} style={mergedStyle}>
        {children}
      </Tag>
    );
  },
);

Grid.displayName = "Grid";

import type { CSSProperties, HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { spacingToken } from "./Flex.js";
import { mergeStyle } from "./internal.js";
import { forwardRef } from "./runtime.js";
import type { MaybeSignal } from "./signals.js";

export type GridProps = Omit<HTMLAttributes<HTMLElement>, "className"> & {
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
  className?: MaybeSignal<string>;
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

export const Grid = forwardRef<HTMLElement, GridProps>(
  ({ columns, minItemWidth, gap, as = "div", className, style, children, ...rest }, ref) => {
    const Tag: any = as;
    const mergedStyle = mergeStyle(
      {
        display: "grid",
        gridTemplateColumns: gridTemplateColumns(columns, minItemWidth),
        gap: spacingToken(gap),
      } as CSSProperties,
      style,
    );
    return (
      <Tag {...rest} ref={ref} className={classNames("st-grid", className)} style={mergedStyle as CSSProperties | undefined}>
        {children}
      </Tag>
    );
  },
);

Grid.displayName = "Grid";

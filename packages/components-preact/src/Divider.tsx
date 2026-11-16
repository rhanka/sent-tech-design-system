import type { CSSProperties, HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { spacingToken } from "./Flex.js";
import { forwardRef } from "./runtime.js";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerVariant = "solid" | "dashed";

export type DividerProps = Omit<HTMLAttributes<HTMLDivElement>, "className"> & {
  orientation?: DividerOrientation;
  /** Spacing scale step (0..12) applied as margin around the divider. */
  spacing?: number;
  /** Optional label centered on a horizontal divider line. */
  label?: string;
  variant?: DividerVariant;
  className?: string;
};

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ orientation = "horizontal", spacing, label, variant = "solid", className, style, ...rest }, ref) => {
    const isVertical = orientation === "vertical";
    const hasLabel = !isVertical && label != null && label !== "";
    const margin = spacingToken(spacing);

    const classes = classNames(
      "st-divider",
      `st-divider--${orientation}`,
      `st-divider--${variant}`,
      hasLabel && "st-divider--labeled",
      className,
    );

    if (hasLabel) {
      return (
        <div
          {...rest}
          ref={ref}
          className={classes}
          role="separator"
          aria-orientation="horizontal"
          style={{ marginBlock: margin, ...(style as CSSProperties | undefined) }}
        >
          <span className="st-divider__line" aria-hidden="true" />
          <span className="st-divider__label">{label}</span>
          <span className="st-divider__line" aria-hidden="true" />
        </div>
      );
    }

    return (
      <div
        {...rest}
        ref={ref}
        className={classes}
        role="separator"
        aria-orientation={orientation}
        style={
          {
            marginBlock: isVertical ? undefined : margin,
            marginInline: isVertical ? margin : undefined,
            ...(style as CSSProperties | undefined),
          } as CSSProperties
        }
      />
    );
  },
);

Divider.displayName = "Divider";

import React from "react";
import { classNames } from "./classNames.js";

export type BadgeTone = "neutral" | "success" | "warning" | "error" | "info";

/**
 * Badge shape — `"pill"` (default) is the current render (radius 999px, width
 * grows with content). `"circle"` renders an equal-sided round bubble
 * (`min-width === min-height`, equal inline/block padding, tabular-nums) — best
 * for ≤2-digit counts. 3+ digit content degrades GRACEFULLY to a rounded-rect
 * (never clipped). Additive: with `shape` unset the badge renders
 * byte-identically to before.
 */
export type BadgeShape = "pill" | "circle";

/**
 * Density — `"md"` (default) is the current render. `"sm"` shrinks the
 * font-size (the rail-bubble scale). Additive: with `size` unset the badge
 * renders byte-identically to before.
 */
export type BadgeSize = "sm" | "md";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  shape?: BadgeShape;
  size?: BadgeSize;
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ tone = "neutral", shape = "pill", size = "md", className, children, ...rest }, ref) => (
    <span
      {...rest}
      ref={ref}
      className={classNames(
        "st-badge",
        `st-badge--${tone}`,
        `st-badge--${shape}`,
        `st-badge--${size}`,
        className,
      )}
    >
      {children}
    </span>
  ),
);

Badge.displayName = "Badge";

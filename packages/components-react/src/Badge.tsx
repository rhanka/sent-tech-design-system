import React from "react";
import { classNames } from "./classNames.js";

export type BadgeTone = "neutral" | "success" | "warning" | "error" | "info";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ tone = "neutral", className, children, ...rest }, ref) => (
    <span {...rest} ref={ref} className={classNames("st-badge", `st-badge--${tone}`, className)}>
      {children}
    </span>
  ),
);

Badge.displayName = "Badge";

import React from "react";
import { classNames } from "./classNames.js";

export type HiddenBreakpoint = "sm" | "md" | "lg" | "xl";

export type HiddenProps = Omit<React.HTMLAttributes<HTMLElement>, "className"> & {
  /** Hide when viewport is narrower than this breakpoint. */
  below?: HiddenBreakpoint;
  /** Hide when viewport is at or wider than this breakpoint. */
  above?: HiddenBreakpoint;
  as?: string;
  className?: string;
};

export const Hidden = React.forwardRef<HTMLElement, HiddenProps>(
  ({ below, above, as = "div", className, children, ...rest }, ref) => {
    const Tag = as as React.ElementType;
    return (
      <Tag
        {...rest}
        ref={ref}
        className={classNames(
          "st-hidden",
          below && `st-hidden--below-${below}`,
          above && `st-hidden--above-${above}`,
          className,
        )}
      >
        {children}
      </Tag>
    );
  },
);

Hidden.displayName = "Hidden";

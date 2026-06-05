import React from "react";
import { classNames } from "./classNames.js";

export type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

export type ContainerProps = Omit<React.HTMLAttributes<HTMLElement>, "className"> & {
  size?: ContainerSize;
  /** Apply horizontal padding using the spacing scale. */
  padding?: boolean;
  as?: string;
  className?: string;
};

export const Container = React.forwardRef<HTMLElement, ContainerProps>(
  ({ size = "lg", padding = true, as = "div", className, children, ...rest }, ref) => {
    const Tag = as as React.ElementType;
    return (
      <Tag
        {...rest}
        ref={ref}
        className={classNames(
          "st-container",
          `st-container--${size}`,
          padding && "st-container--padded",
          className,
        )}
      >
        {children}
      </Tag>
    );
  },
);

Container.displayName = "Container";

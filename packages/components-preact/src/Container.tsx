import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { forwardRef } from "./runtime.js";

export type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

export type ContainerProps = Omit<HTMLAttributes<HTMLElement>, "className"> & {
  size?: ContainerSize;
  /** Apply horizontal padding using the spacing scale. */
  padding?: boolean;
  as?: string;
  className?: string;
};

export const Container = forwardRef<HTMLElement, ContainerProps>(
  ({ size = "lg", padding = true, as = "div", className, children, ...rest }, ref) => {
    const Tag: any = as;
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

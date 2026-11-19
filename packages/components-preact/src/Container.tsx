import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { forwardRef } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

export type ContainerProps = Omit<HTMLAttributes<HTMLElement>, "className"> & {
  size?: ContainerSize;
  /** Apply horizontal padding using the spacing scale. */
  padding?: MaybeSignal<boolean>;
  as?: string;
  className?: MaybeSignal<string>;
};

export const Container = forwardRef<HTMLElement, ContainerProps>(
  ({ size = "lg", padding = true, as = "div", className, children, ...rest }, ref) => {
    const Tag: any = as;
    const hasPadding = useValue(padding);
    return (
      <Tag
        {...rest}
        ref={ref}
        className={classNames(
          "st-container",
          `st-container--${size}`,
          hasPadding && "st-container--padded",
          className,
        )}
      >
        {children}
      </Tag>
    );
  },
);

Container.displayName = "Container";

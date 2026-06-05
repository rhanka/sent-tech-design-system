import React from "react";
import { classNames } from "./classNames.js";
import { Flex } from "./Flex.js";
import type { FlexAlign, FlexJustify } from "./Flex.js";

export type StackProps = Omit<React.HTMLAttributes<HTMLElement>, "className"> & {
  /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
  gap?: number;
  align?: FlexAlign;
  justify?: FlexJustify;
  as?: string;
  className?: string;
};

export const Stack = React.forwardRef<HTMLElement, StackProps>(
  ({ gap, align, justify, as = "div", className, children, ...rest }, ref) => (
    <Flex
      {...rest}
      ref={ref}
      as={as}
      gap={gap}
      align={align}
      justify={justify}
      direction="column"
      className={classNames("st-stack", className)}
    >
      {children}
    </Flex>
  ),
);

Stack.displayName = "Stack";

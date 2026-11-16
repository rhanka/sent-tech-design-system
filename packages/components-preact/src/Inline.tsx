import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { Flex } from "./Flex.js";
import type { FlexAlign, FlexJustify } from "./Flex.js";
import { forwardRef } from "./runtime.js";

export type InlineProps = Omit<HTMLAttributes<HTMLElement>, "className"> & {
  /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
  gap?: number;
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: boolean;
  as?: string;
  className?: string;
};

export const Inline = forwardRef<HTMLElement, InlineProps>(
  ({ gap, align, justify, wrap = true, as = "div", className, children, ...rest }, ref) => (
    <Flex
      {...rest}
      ref={ref}
      as={as}
      gap={gap}
      align={align}
      justify={justify}
      wrap={wrap}
      direction="row"
      className={classNames("st-inline", className)}
    >
      {children}
    </Flex>
  ),
);

Inline.displayName = "Inline";

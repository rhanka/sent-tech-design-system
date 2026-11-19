import type { CSSProperties, HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { alignValue, justifyValue, spacingToken } from "./Flex.js";
import type { FlexAlign, FlexJustify } from "./Flex.js";
import { mergeStyle } from "./internal.js";
import { forwardRef } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type RowProps = Omit<HTMLAttributes<HTMLElement>, "className"> & {
  /** Spacing scale step (0..12) used for the column gutter. */
  gutter?: number;
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: MaybeSignal<boolean>;
  as?: string;
  className?: MaybeSignal<string>;
};

export const Row = forwardRef<HTMLElement, RowProps>(
  ({ gutter = 4, align, justify, wrap = true, as = "div", className, style, children, ...rest }, ref) => {
    const Tag: any = as;
    const isWrap = useValue(wrap);
    const gap = spacingToken(gutter) ?? "0";
    const mergedStyle = mergeStyle(
      {
        flexWrap: isWrap ? "wrap" : "nowrap",
        alignItems: alignValue(align),
        justifyContent: justifyValue(justify),
        gap,
        "--st-row-gutter": gap,
      } as unknown as CSSProperties,
      style,
    );
    return (
      <Tag {...rest} ref={ref} className={classNames("st-row", className)} style={mergedStyle as CSSProperties | undefined}>
        {children}
      </Tag>
    );
  },
);

Row.displayName = "Row";

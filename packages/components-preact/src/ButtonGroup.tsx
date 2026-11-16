import type { CSSProperties, HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { forwardRef } from "./runtime.js";

export type ButtonGroupOrientation = "horizontal" | "vertical";
export type ButtonGroupSize = "sm" | "md" | "lg";

export type ButtonGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "className"> & {
  orientation?: ButtonGroupOrientation;
  /** Look segmenté joint (boutons collés, coins arrondis seulement aux extrémités). */
  attached?: boolean;
  /** Espacement entre boutons (échelle spacing), ignoré quand `attached`. */
  gap?: number;
  /** Taille indicative (transmise via data-attr pour styliser les enfants si besoin). */
  size?: ButtonGroupSize;
  /** Étiquette a11y du groupe. */
  label?: string;
  className?: string;
};

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    { orientation = "horizontal", attached = false, gap, size = "md", label, className, style, children, ...rest },
    ref,
  ) => {
    const classes = classNames(
      "st-buttonGroup",
      `st-buttonGroup--${orientation}`,
      attached && "st-buttonGroup--attached",
      className,
    );
    const gapValue = attached || gap == null ? undefined : `var(--st-spacing-${gap}, ${gap * 0.25}rem)`;
    const mergedStyle = (gapValue != null ? { ...(style as CSSProperties | undefined), gap: gapValue } : style) as CSSProperties | undefined;
    return (
      <div
        {...rest}
        ref={ref}
        className={classes}
        role="group"
        aria-label={label}
        data-size={size}
        style={mergedStyle}
      >
        {children}
      </div>
    );
  },
);

ButtonGroup.displayName = "ButtonGroup";

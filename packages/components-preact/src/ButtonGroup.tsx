import type { CSSProperties, HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { mergeStyle } from "./internal.js";
import { forwardRef } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type ButtonGroupOrientation = "horizontal" | "vertical";
export type ButtonGroupSize = "sm" | "md" | "lg";

export type ButtonGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "className"> & {
  orientation?: ButtonGroupOrientation;
  /** Look segmenté joint (boutons collés, coins arrondis seulement aux extrémités). */
  attached?: MaybeSignal<boolean>;
  /** Espacement entre boutons (échelle spacing), ignoré quand `attached`. */
  gap?: number;
  /** Taille indicative (transmise via data-attr pour styliser les enfants si besoin). */
  size?: ButtonGroupSize;
  /** Étiquette a11y du groupe. */
  label?: string;
  className?: MaybeSignal<string>;
};

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    { orientation = "horizontal", attached = false, gap, size = "md", label, className, style, children, ...rest },
    ref,
  ) => {
    const isAttached = useValue(attached);
    const classes = classNames(
      "st-buttonGroup",
      `st-buttonGroup--${orientation}`,
      isAttached && "st-buttonGroup--attached",
      className,
    );
    const gapValue = isAttached || gap == null ? undefined : `var(--st-spacing-${gap}, ${gap * 0.25}rem)`;
    const normalized = mergeStyle(undefined, style);
    const mergedStyle =
      gapValue != null
        ? typeof normalized === "string"
          ? (`${normalized}${normalized.endsWith(";") ? "" : ";"}gap:${gapValue};` as unknown as CSSProperties)
          : ({ ...(normalized as CSSProperties | undefined), gap: gapValue } as CSSProperties)
        : (normalized as CSSProperties | undefined);
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

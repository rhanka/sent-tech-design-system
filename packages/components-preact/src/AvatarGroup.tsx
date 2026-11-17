import type { CSSProperties, HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { mergeStyle } from "./internal.js";
import { forwardRef } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";
import type { AvatarSize } from "./Avatar.js";

export type AvatarGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "className"> & {
  /** Nombre maximum d'avatars visibles. Au-delà, un jeton « +N » est affiché. */
  max?: MaybeSignal<number>;
  /** Taille appliquée au jeton de débordement (doit refléter les Avatar). */
  size?: AvatarSize;
  /** Nombre total réel d'éléments (sert à calculer le « +N » si > max). */
  total?: MaybeSignal<number>;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ max: maxInput, size = "md", total: totalInput, className, style, children, ...rest }, ref) => {
    const max = useValue(maxInput);
    const total = useValue(totalInput);
    const overflow = max != null && total != null && total > max ? total - max : 0;
    const classes = classNames("st-avatarGroup", `st-avatarGroup--${size}`, className);
    const mergedStyle = mergeStyle({ "--st-avatar-group-max": max ?? "" } as CSSProperties, style) as
      | CSSProperties
      | undefined;
    return (
      <div {...rest} ref={ref} className={classes} style={mergedStyle}>
        {children}
        {overflow > 0 ? (
          <span className="st-avatarGroup__overflow" aria-label={`+${overflow}`}>
            +{overflow}
          </span>
        ) : null}
      </div>
    );
  },
);

AvatarGroup.displayName = "AvatarGroup";

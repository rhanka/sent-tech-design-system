import React from "react";
import { classNames } from "./classNames.js";
import type { AvatarSize } from "./Avatar.js";

export type AvatarGroupProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  /** Nombre maximum d'avatars visibles. Au-delà, un jeton « +N » est affiché. */
  max?: number;
  /** Taille appliquée au jeton de débordement (doit refléter les Avatar). */
  size?: AvatarSize;
  /** Nombre total réel d'éléments (sert à calculer le « +N » si > max). */
  total?: number;
  className?: string;
};

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ max, size = "md", total, className, style, children, ...rest }, ref) => {
    const overflow = max != null && total != null && total > max ? total - max : 0;
    const classes = classNames("st-avatarGroup", `st-avatarGroup--${size}`, className);
    const mergedStyle = {
      ...style,
      ...({ "--st-avatar-group-max": max ?? "" } as React.CSSProperties),
    };
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

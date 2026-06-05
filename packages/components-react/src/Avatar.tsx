import React from "react";
import { classNames } from "./classNames.js";
import { deriveInitials } from "./catalog.js";

export type AvatarSize = "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "square";
export type AvatarTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type AvatarProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "className"> & {
  /** Nom complet, utilisé pour dériver les initiales et l'étiquette a11y. */
  name: string;
  /** URL de la photo. Si absente, on rend un cercle d'initiales. */
  src?: string;
  /** Texte alternatif de l'image. Par défaut = `name`. */
  alt?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  /** Catégorie de couleur pour le fond des initiales. */
  tone?: AvatarTone;
  className?: string;
};

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ name, src, alt, size = "md", shape = "circle", tone = "category1", className, ...rest }, ref) => {
    const initials = deriveInitials(name);
    const classes = classNames(
      "st-avatar",
      `st-avatar--${size}`,
      `st-avatar--${shape}`,
      src ? "st-avatar--image" : `st-avatar--${tone}`,
      className,
    );
    return (
      <span {...rest} ref={ref} className={classes} role="img" aria-label={alt ?? name}>
        {src ? (
          <img className="st-avatar__image" src={src} alt={alt ?? name} />
        ) : (
          <span className="st-avatar__initials" aria-hidden="true">
            {initials}
          </span>
        )}
      </span>
    );
  },
);

Avatar.displayName = "Avatar";

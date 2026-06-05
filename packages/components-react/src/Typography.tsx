import React from "react";
import { classNames } from "./classNames.js";

export type TypographyVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "body"
  | "body-sm"
  | "caption"
  | "overline";

export type TypographyWeight = "regular" | "medium" | "semibold" | "bold";
export type TypographyTone = "primary" | "secondary" | "muted" | "inverse" | "link";
export type TypographyAlign = "start" | "center" | "end" | "justify";

/** Balise HTML par défaut pour chaque variante. */
const VARIANT_TAG: Record<TypographyVariant, string> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  body: "p",
  "body-sm": "p",
  caption: "span",
  overline: "span",
};

export type TypographyProps = Omit<React.HTMLAttributes<HTMLElement>, "className"> & {
  variant?: TypographyVariant;
  /** Surcharge la balise déduite de la variante. */
  as?: React.ElementType;
  weight?: TypographyWeight;
  tone?: TypographyTone;
  align?: TypographyAlign;
  /** Tronque sur une ligne avec ellipsis. */
  truncate?: boolean;
  className?: string;
};

export function Typography({
  variant = "body",
  as,
  weight,
  tone,
  align,
  truncate = false,
  className,
  children,
  ...rest
}: TypographyProps) {
  const Tag = (as ?? VARIANT_TAG[variant]) as React.ElementType;
  const classes = classNames(
    "st-typography",
    `st-typography--${variant}`,
    weight && `st-typography--weight-${weight}`,
    tone && `st-typography--tone-${tone}`,
    align && `st-typography--align-${align}`,
    truncate && "st-typography--truncate",
    className,
  );
  return (
    <Tag {...rest} className={classes}>
      {children}
    </Tag>
  );
}

Typography.displayName = "Typography";

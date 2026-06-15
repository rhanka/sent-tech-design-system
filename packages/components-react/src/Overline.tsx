import React from "react";
import { classNames } from "./classNames.js";

/** Balise rendue. `span`/`div` = inline/bloc neutre ; `h2`/`h3` quand l'overline
 * sert d'en-tête de région (sémantique de titre). */
export type OverlineAs = "span" | "div" | "h2" | "h3";

export type OverlineProps = Omit<React.HTMLAttributes<HTMLElement>, "className"> & {
  /** Balise : `span` (défaut) inline, `div` bloc, `h2`/`h3` pour un en-tête de région. */
  as?: OverlineAs;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Overline — étiquette de section discrète en small-caps (les « DOCUMENTATION »,
 * « COMMUNITIES », « SIGNAUX » des maquettes). Rôle : libellé de groupe muted
 * au-dessus d'un bloc. Style token-only : chaque token `--st-component-overline-*`
 * retombe sur un littéral, donc un thème qui n'émet rien rend à l'identique.
 */
export function Overline({ as = "span", className, children, ...rest }: OverlineProps) {
  return React.createElement(
    as,
    { ...rest, className: classNames("st-overline", className) },
    children,
  );
}

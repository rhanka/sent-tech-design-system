import React from "react";
import { classNames } from "./classNames.js";

export type CardProps = React.HTMLAttributes<HTMLElement> & {
  interactive?: boolean;
};

export const Card = React.forwardRef<HTMLElement, CardProps>(
  ({ interactive = false, className, children, ...rest }, ref) => (
    <section
      {...rest}
      ref={ref}
      className={classNames("st-card", interactive && "st-card--interactive", className)}
    >
      {children}
    </section>
  ),
);

Card.displayName = "Card";

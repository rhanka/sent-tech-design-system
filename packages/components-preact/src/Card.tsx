import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { forwardRef } from "./runtime.js";

export type CardProps = HTMLAttributes<HTMLElement> & {
  interactive?: boolean;
};

export const Card = forwardRef<HTMLElement, CardProps>(
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

import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { forwardRef } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type CardProps = HTMLAttributes<HTMLElement> & {
  interactive?: MaybeSignal<boolean>;
};

export const Card = forwardRef<HTMLElement, CardProps>(
  ({ interactive = false, className, children, ...rest }, ref) => {
    const isInteractive = useValue(interactive);
    return (
      <section
        {...rest}
        ref={ref}
        className={classNames("st-card", isInteractive && "st-card--interactive", className)}
      >
        {children}
      </section>
    );
  },
);

Card.displayName = "Card";

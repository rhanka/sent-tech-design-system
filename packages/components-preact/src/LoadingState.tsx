import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";

export type LoadingStateProps = HTMLAttributes<HTMLElement> & {
  label?: ComponentChildren;
  title?: ComponentChildren;
  variant?: "spinner" | "skeleton";
};
export function LoadingState({ label = "Loading", title, variant = "spinner", className, ...rest }: LoadingStateProps) {
  return (
    <section {...rest} className={classNames("st-loading", `st-loading--${variant}`, className)} aria-live="polite">
      <span className="st-loading__spinner" aria-hidden="true" />
      <span className="st-loading__label">{label ?? title}</span>
    </section>
  );
}

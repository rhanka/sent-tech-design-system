import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";

export type EmptyStateProps = HTMLAttributes<HTMLElement> & {
  title: ComponentChildren;
  message?: ComponentChildren;
  action?: ComponentChildren;
};
export function EmptyState({ title, message, action, children, className, ...rest }: EmptyStateProps) {
  return (
    <section {...rest} className={classNames("st-empty-state st-emptyState", className)}>
      <div className="st-empty-state__content">
        <h2 className="st-empty-state__title st-emptyState__title">{title}</h2>
        {message ? <p className="st-empty-state__message st-emptyState__message">{message}</p> : null}
        {children}
        {action ? <div className="st-empty-state__action">{action}</div> : null}
      </div>
    </section>
  );
}

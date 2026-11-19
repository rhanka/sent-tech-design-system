import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";

export type ContextPanelProps = HTMLAttributes<HTMLElement> & {
  title?: ComponentChildren;
  subtitle?: ComponentChildren;
  label?: string;
  actions?: ComponentChildren;
  footer?: ComponentChildren;
};

export function ContextPanel({ title, subtitle, label, actions, footer, className, children, ...rest }: ContextPanelProps) {
  return (
    <aside {...rest} className={classNames("st-contextPanel", className)} aria-label={label ?? (typeof title === "string" ? title : "Context panel")}>
      {(title || subtitle || actions) ? <header className="st-contextPanel__header"><div className="st-contextPanel__heading">{title ? <h2 className="st-contextPanel__title">{title}</h2> : null}{subtitle ? <p className="st-contextPanel__subtitle">{subtitle}</p> : null}</div>{actions ? <div className="st-contextPanel__actions">{actions}</div> : null}</header> : null}
      <div className="st-contextPanel__body">{children}</div>
      {footer ? <footer className="st-contextPanel__footer">{footer}</footer> : null}
    </aside>
  );
}

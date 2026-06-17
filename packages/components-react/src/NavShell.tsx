import React from "react";
import { Drawer } from "./Drawer.js";
import { classNames } from "./classNames.js";

export type NavShellVariant = "rail" | "drawer";
export type NavShellSide = "left" | "right" | "bottom";

export type NavShellProps = React.HTMLAttributes<HTMLElement> & {
  variant?: NavShellVariant;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  back?: boolean;
  backLabel?: string;
  onBack?: () => void;
  label?: string;
  search?: React.ReactNode;
  footer?: React.ReactNode;
  open?: boolean;
  side?: NavShellSide;
};

export function NavShell({ variant = "rail", title, subtitle, back = false, backLabel = "Back", onBack, label, search, footer, open = false, side = "left", className, children, ...rest }: NavShellProps) {
  const content = (
    <>
      {(back || title || subtitle) ? (
        <header className="st-navShell__header">
          {back ? <button type="button" className="st-navShell__back" aria-label={backLabel} onClick={onBack}><span aria-hidden="true">←</span></button> : null}
          {(title || subtitle) ? <div className="st-navShell__heading">{title ? <p className="st-navShell__title">{title}</p> : null}{subtitle ? <p className="st-navShell__subtitle">{subtitle}</p> : null}</div> : null}
        </header>
      ) : null}
      {search ? <div className="st-navShell__search">{search}</div> : null}
      <div className="st-navShell__body">{children}</div>
    </>
  );

  if (variant === "drawer") {
    return <Drawer open={open} title={String(title ?? label ?? "Navigation")} placement={side} footer={footer} className={classNames("st-navShell st-navShell--drawer", className)}>{content}</Drawer>;
  }

  return (
    <aside {...rest} className={classNames("st-navShell st-navShell--rail", className)} aria-label={label ?? (typeof title === "string" ? title : undefined)}>
      {content}
      {footer ? <footer className="st-navShell__footer">{footer}</footer> : null}
    </aside>
  );
}

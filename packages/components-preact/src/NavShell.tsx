import type { HTMLAttributes } from "preact";
import { Drawer } from "./Drawer.js";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type NavShellVariant = "rail" | "drawer";
export type NavShellSide = "left" | "right" | "bottom";

export type NavShellProps = Omit<HTMLAttributes<HTMLElement>, "className"> & {
  variant?: NavShellVariant;
  title?: ComponentChildren;
  subtitle?: ComponentChildren;
  back?: boolean;
  backLabel?: string;
  onBack?: () => void;
  label?: string;
  search?: ComponentChildren;
  footer?: ComponentChildren;
  open?: MaybeSignal<boolean>;
  side?: NavShellSide;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export function NavShell({ variant = "rail", title, subtitle, back = false, backLabel = "Back", onBack, label, search, footer, open: openInput = false, side = "left", className, children, ...rest }: NavShellProps) {
  const open = useValue(openInput);
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

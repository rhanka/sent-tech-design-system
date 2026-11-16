import type { HTMLAttributes } from "preact";
import { useEffect } from "preact/hooks";
import { classNames } from "./classNames.js";
import { text } from "./internal.js";
import type { ComponentChildren } from "./runtime.js";

type Tone = "neutral" | "info" | "success" | "warning" | "error";

export type ToastItem = {
  id: string;
  tone?: Exclude<Tone, "neutral">;
  title: ComponentChildren;
  message?: ComponentChildren;
  actions?: ComponentChildren;
};
export type ToastProps = Omit<HTMLAttributes<HTMLElement>, "ref"> & {
  tone?: Exclude<Tone, "neutral">;
  title: ComponentChildren;
  message?: ComponentChildren;
  actions?: ComponentChildren;
  onClose?: () => void;
  items?: ToastItem[];
  autoDismiss?: boolean;
  duration?: number;
  onDismiss?: (id: string) => void;
  locale?: string;
  closeLabel?: ComponentChildren;
  dismissLabel?: (title: ComponentChildren) => string;
};
export function Toast({ tone = "info", title, message, actions, onClose, items, autoDismiss = false, duration = 5000, onDismiss, locale = "fr-FR", closeLabel, dismissLabel, children, className, ...rest }: ToastProps) {
  const isFr = locale.toLowerCase().startsWith("fr");
  const resolvedCloseLabel = closeLabel ?? (isFr ? "Fermer" : "Close");
  const resolvedDismissLabel = dismissLabel ?? ((t) => isFr ? `Fermer ${text(t)}` : `Dismiss ${text(t)}`);
  useEffect(() => {
    if (!autoDismiss || !items?.length || !onDismiss) return;
    const timeout = window.setTimeout(() => onDismiss(items[0].id), duration);
    return () => window.clearTimeout(timeout);
  }, [autoDismiss, duration, items, onDismiss]);

  const roleFor = (t: string) => (t === "error" ? "alert" : "status");

  if (items?.length) {
    return (
      <div {...rest} className={classNames("st-toastQueue", className)}>
        {items.map((item) => (
          <section key={item.id} className={classNames("st-toast", `st-toast--${item.tone ?? "info"}`)} role={roleFor(item.tone ?? "info")}>
            <div className="st-toast__content">
              <h2 className="st-toast__title">{item.title}</h2>
              {item.message ? <p className="st-toast__message">{item.message}</p> : null}
            </div>
            {item.actions ? <div className="st-toast__actions">{item.actions}</div> : null}
            {onDismiss ? (
              <button type="button" onClick={() => onDismiss(item.id)} aria-label={resolvedDismissLabel(item.title)}>
                {resolvedCloseLabel}
              </button>
            ) : null}
          </section>
        ))}
      </div>
    );
  }

  return (
    <section {...rest} className={classNames("st-toast", `st-toast--${tone}`, className)} role={roleFor(tone)}>
      <div className="st-toast__content">
        <h2 className="st-toast__title">{title}</h2>
        {message ? <p className="st-toast__message">{message}</p> : children}
      </div>
      {actions ? <div className="st-toast__actions">{actions}</div> : null}
      {onClose ? <button type="button" onClick={onClose}>{resolvedCloseLabel}</button> : null}
    </section>
  );
}

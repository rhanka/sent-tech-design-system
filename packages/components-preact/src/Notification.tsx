import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { forwardRef } from "./runtime.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type NotificationProps = Omit<HTMLAttributes<HTMLElement>, "className" | "title"> & {
  tone?: "info" | "success" | "warning" | "error";
  title: string;
  message?: string;
  dismissible?: MaybeSignal<boolean>;
  dismissLabel?: string;
  locale?: string;
  onDismiss?: () => void;
  className?: MaybeSignal<string>;
  actions?: ComponentChildren;
  children?: ComponentChildren;
};

export const Notification = forwardRef<HTMLElement, NotificationProps>(
  (
    {
      tone = "info",
      title,
      message,
      dismissible = false,
      dismissLabel,
      locale = "fr-FR",
      onDismiss,
      className,
      actions,
      children,
      ...rest
    },
    ref,
  ) => {
    const isFr = (locale ?? "fr-FR").toLowerCase().startsWith("fr");
    const resolvedDismissLabel = dismissLabel ?? (isFr ? "Fermer" : "Dismiss");
    const isDismissible = useValue(dismissible);
    const canDismiss = isDismissible && typeof onDismiss === "function";
    const role = tone === "error" ? "alert" : "status";

    return (
      <section
        {...rest}
        ref={ref}
        className={classNames("st-notification", `st-notification--${tone}`, className)}
        role={role}
      >
        <div className="st-notification__content">
          <h2 className="st-notification__title">{title}</h2>
          {message ? <p className="st-notification__message">{message}</p> : null}
          {children}
        </div>
        <div className="st-notification__meta">
          {actions ? <div className="st-notification__actions">{actions}</div> : null}
          {canDismiss ? (
            <button
              type="button"
              className="st-notification__close"
              aria-label={resolvedDismissLabel}
              title={resolvedDismissLabel}
              onClick={() => onDismiss?.()}
            >
              ×
            </button>
          ) : null}
        </div>
      </section>
    );
  },
);

Notification.displayName = "Notification";

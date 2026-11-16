import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";

type Tone = "neutral" | "info" | "success" | "warning" | "error";

export type AlertProps = HTMLAttributes<HTMLElement> & {
  tone?: Exclude<Tone, "neutral">;
  title: ComponentChildren;
  message?: ComponentChildren;
  actions?: ComponentChildren;
};

export function Alert({ tone = "info", title, message, actions, children, className, ...rest }: AlertProps) {
  return (
    <section {...rest} className={classNames("st-alert", `st-alert--${tone}`, className)} role={tone === "warning" || tone === "error" ? "alert" : "status"}>
      <div className="st-alert__content">
        <h2 className="st-alert__title">{title}</h2>
        {message ? <p className="st-alert__message">{message}</p> : null}
        {children}
      </div>
      {actions ? <div className="st-alert__actions">{actions}</div> : null}
    </section>
  );
}

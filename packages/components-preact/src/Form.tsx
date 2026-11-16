import type { FormHTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type FormProps = FormHTMLAttributes<HTMLFormElement> & {
  status?: MaybeSignal<"idle" | "submitting" | "submitted" | "error">;
  message?: ComponentChildren;
};

export function Form({ status: statusInput = "idle", message, children, className, ...rest }: FormProps) {
  const status = useValue(statusInput) ?? "idle";
  return (
    <form {...rest} className={classNames("st-form", className)}>
      <div className="st-form__body">{children}</div>
      {message ? <p className={classNames("st-form__message", `st-form__message--${status === "submitted" ? "success" : status === "error" ? "error" : "help"}`)}>{message}</p> : null}
    </form>
  );
}

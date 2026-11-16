import type { FormHTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";

export type FormProps = FormHTMLAttributes<HTMLFormElement> & {
  status?: "idle" | "submitting" | "submitted" | "error";
  message?: ComponentChildren;
};

export function Form({ status = "idle", message, children, className, ...rest }: FormProps) {
  return (
    <form {...rest} className={classNames("st-form", className)}>
      <div className="st-form__body">{children}</div>
      {message ? <p className={classNames("st-form__message", `st-form__message--${status === "submitted" ? "success" : status === "error" ? "error" : "help"}`)}>{message}</p> : null}
    </form>
  );
}

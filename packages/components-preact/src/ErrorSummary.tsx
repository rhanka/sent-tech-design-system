import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";

/** A single field error: `href` points to the offending control, `text` is the message. */
export type ErrorSummaryItem = { href: string; text: string };
export type ErrorSummaryProps = HTMLAttributes<HTMLElement> & {
  heading?: string;
  errors?: ErrorSummaryItem[];
};
/**
 * ErrorSummary — GCDS « Error summary »: an aggregated list of a form's errors,
 * each entry linking to the field that needs attention.
 */
export function ErrorSummary({ heading = "There was a problem", errors = [], className, children, ...rest }: ErrorSummaryProps) {
  return (
    <section {...rest} className={classNames("st-error-summary", className)} role="alert" tabIndex={-1}>
      <h2 className="st-error-summary__heading">{heading}</h2>
      {errors.length > 0 ? (
        <ul className="st-error-summary__list">
          {errors.map((error) => (
            <li className="st-error-summary__item" key={error.href}>
              <a className="st-error-summary__link" href={error.href}>{error.text}</a>
            </li>
          ))}
        </ul>
      ) : null}
      {children}
    </section>
  );
}

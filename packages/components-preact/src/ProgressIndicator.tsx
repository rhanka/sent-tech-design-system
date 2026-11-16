import { Check, X } from "lucide-preact";
import type { OlHTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";

export type ProgressIndicatorStatus =
  | "complete"
  | "current"
  | "upcoming"
  | "disabled"
  | "invalid"
  | "incomplete";
export interface ProgressIndicatorItem {
  id?: string;
  /** Svelte-canonical alias for the React/Vue `id`. */
  value?: string;
  label: ComponentChildren;
  description?: ComponentChildren;
  status?: ProgressIndicatorStatus;
}
export type ProgressIndicatorProps = OlHTMLAttributes<HTMLOListElement> & {
  items: ProgressIndicatorItem[];
  orientation?: "horizontal" | "vertical";
  /** Svelte-canonical alias: `vertical` sets `orientation="vertical"`. */
  vertical?: boolean;
  /** Accessible name (parity with the Svelte `label`). */
  label?: string;
};
export function ProgressIndicator({ items, orientation = "horizontal", vertical, label = "Progress", className, ...rest }: ProgressIndicatorProps) {
  const resolvedOrientation = vertical ? "vertical" : orientation;
  return (
    <ol {...rest} aria-label={label} className={classNames("st-progressIndicator", `st-progressIndicator--${resolvedOrientation}`, className)}>
      {items.map((item, index) => {
        const status = item.status ?? "upcoming";
        const isLast = index === items.length - 1;
        return (
          <li
            key={item.id ?? item.value ?? index}
            className={classNames("st-progressIndicator__step", `st-progressIndicator__step--${status}`)}
            aria-current={status === "current" ? "step" : undefined}
          >
            <span className="st-progressIndicator__indicator">
              <span className="st-progressIndicator__circle">
                {status === "complete" ? (
                  <Check size={14} strokeWidth={2} aria-hidden="true" />
                ) : status === "invalid" ? (
                  <X size={14} strokeWidth={2} aria-hidden="true" />
                ) : status === "current" ? (
                  <span className="st-progressIndicator__dot" />
                ) : (
                  <span className="st-progressIndicator__index">{index + 1}</span>
                )}
              </span>
              {!isLast ? <span className="st-progressIndicator__connector" /> : null}
            </span>
            <span className="st-progressIndicator__text">
              <span className="st-progressIndicator__label">{item.label}</span>
              {item.description ? <span className="st-progressIndicator__description">{item.description}</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

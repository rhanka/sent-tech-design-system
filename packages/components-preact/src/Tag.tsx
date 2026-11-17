import type { HTMLAttributes } from "preact";
import { X } from "lucide-preact";
import { classNames } from "./classNames.js";
// Side-effect: installs the options.vnode SVG presentation-attribute
// normalisation in runtime.ts. This module renders SVG (lucide icons) but
// otherwise references runtime only via `import type`, which TypeScript
// erases — without this import a bundler applying `sideEffects` barrel
// optimisation (or a direct deep import) would never evaluate runtime.js.
import "./runtime.js";
import type { TargetedMouseEvent } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type TagProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "info" | "success" | "warning" | "error";
  size?: "sm" | "md";
  /** Plain value, or a signal in the Preact build (read at the edge). */
  disabled?: MaybeSignal<boolean>;
  /** Plain value, or a signal in the Preact build (read at the edge). */
  dismissible?: MaybeSignal<boolean>;
  dismissLabel?: string;
  onDismiss?: (event: TargetedMouseEvent<Element>) => void;
};

export function Tag({
  tone = "neutral",
  size = "md",
  disabled: disabledInput = false,
  dismissible: dismissibleInput = false,
  dismissLabel = "Dismiss",
  onDismiss,
  className,
  children,
  ...rest
}: TagProps) {
  const disabled = useValue(disabledInput);
  const dismissible = useValue(dismissibleInput);
  // Parity with the Svelte reference: the X affordance is driven by
  // `dismissible` (the docs node specs pass it without an `onDismiss`), and the
  // handler is suppressed while disabled.
  const showDismiss = dismissible || typeof onDismiss === "function";
  const handleDismiss = (event: TargetedMouseEvent<Element>) => {
    if (disabled) return;
    onDismiss?.(event);
  };
  return (
    <span {...rest} className={classNames("st-tag", `st-tag--${tone}`, `st-tag--${size}`, disabled && "st-tag--disabled", className)} aria-disabled={disabled ? "true" : undefined}>
      <span className="st-tag__label">{children}</span>
      {showDismiss ? <button type="button" className="st-tag__dismiss" aria-label={dismissLabel} disabled={disabled} onClick={handleDismiss}><X size={14} strokeWidth={2} aria-hidden="true" /></button> : null}
    </span>
  );
}

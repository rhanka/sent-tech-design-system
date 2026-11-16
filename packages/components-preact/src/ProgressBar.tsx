import type { CSSProperties, HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";

type Tone = "neutral" | "info" | "success" | "warning" | "error";
type Size = "sm" | "md" | "lg";

export type ProgressBarProps = HTMLAttributes<HTMLDivElement> & {
  label?: ComponentChildren;
  helperText?: ComponentChildren;
  value?: number;
  max?: number;
  tone?: Tone;
  size?: Size;
  indeterminate?: boolean;
  showValue?: boolean;
  valueText?: string;
};
export function ProgressBar({ label, helperText, value = 0, max = 100, tone = "neutral", size = "md", indeterminate = false, showValue = false, valueText, className, ...rest }: ProgressBarProps) {
  const clamped = max <= 0 ? 0 : Math.min(Math.max(value, 0), max);
  const percent = indeterminate ? 0 : (clamped / max) * 100;
  const displayValue = valueText ? valueText : indeterminate ? "" : `${Math.round(percent)}%`;
  const showValueSpan = showValue && !indeterminate;
  return (
    <div {...rest} className={classNames("st-progressBar", className)}>
      {label || showValueSpan ? (
        <div className="st-progressBar__header">
          {label ? <span className="st-progressBar__label">{label}</span> : null}
          {showValueSpan ? (
            <span className="st-progressBar__value" aria-hidden="true">{displayValue}</span>
          ) : null}
        </div>
      ) : null}
      <div
        className={classNames("st-progressBar__track", `st-progressBar__track--${size}`, `st-progressBar__track--${tone}`, indeterminate && "st-progressBar__track--indeterminate")}
        role="progressbar"
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : max}
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-valuetext={indeterminate ? undefined : displayValue}
        aria-label={typeof label === "string" ? label : undefined}
      >
        <div className="st-progressBar__fill" style={{ "--st-progressBar-pct": `${percent}%` } as unknown as CSSProperties} />
      </div>
      {helperText ? <span className="st-progressBar__help">{helperText}</span> : null}
    </div>
  );
}

import { Check, Copy } from "lucide-preact";
import type { ButtonHTMLAttributes } from "preact";
import { useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";

type Size = "sm" | "md" | "lg";

export type CopyButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> & {
  text?: string;
  value?: string;
  locale?: string;
  label?: ComponentChildren;
  copiedLabel?: ComponentChildren;
  size?: Size;
};
export function CopyButton({ text: copyText, value, locale = "fr-FR", label, copiedLabel, size = "md", className, onClick, ...rest }: CopyButtonProps) {
  const isFr = (locale ?? "fr-FR").toLowerCase().startsWith("fr");
  const resolvedLabel = label ?? (isFr ? "Copier" : "Copy");
  const resolvedCopiedLabel = copiedLabel ?? (isFr ? "Copié" : "Copied");
  const [copied, setCopied] = useState(false);
  return (
    <button
      {...rest}
      type="button"
      className={classNames("st-copyButton", `st-copyButton--${size}`, copied && "st-copyButton--copied", className)}
      onClick={(event) => {
        setCopied(true);
        void navigator.clipboard?.writeText(value ?? copyText ?? "");
        onClick?.(event);
      }}
    >
      <span className="st-copyButton__icon" aria-hidden="true">
        {copied ? <Check size={14} strokeWidth={2} aria-hidden="true" /> : <Copy size={14} strokeWidth={2} aria-hidden="true" />}
      </span>
      <span className="st-copyButton__label">{copied ? resolvedCopiedLabel : resolvedLabel}</span>
    </button>
  );
}

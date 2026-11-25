import { ChevronDownCircle } from "lucide-preact";
import type { ButtonHTMLAttributes, CSSProperties } from "preact";
import { classNames } from "./classNames.js";
import { mergeStyle } from "./internal.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

type Size = "sm" | "md" | "lg";

export type MenuTriggerButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  open?: MaybeSignal<boolean>;
  expanded?: MaybeSignal<boolean>;
  size?: Size;
  variant?: "ghost" | "secondary";
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export function MenuTriggerButton({
  open: openInput,
  expanded: expandedInput,
  size = "md",
  variant = "ghost",
  type = "button",
  className,
  style,
  children,
  ...rest
}: MenuTriggerButtonProps) {
  const open = useValue(openInput);
  const expanded = useValue(expandedInput);
  const isOpen = open ?? expanded ?? false;
  const mergedStyle = mergeStyle(undefined, style);
  return (
    <button
      {...rest}
      type={type}
      className={classNames("st-iconButton", `st-iconButton--${size}`, `st-iconButton--${variant}`, className)}
      style={mergedStyle as CSSProperties | undefined}
      aria-haspopup="menu"
      aria-expanded={isOpen}
    >
      {children ?? <ChevronDownCircle size={18} strokeWidth={2} aria-hidden="true" />}
    </button>
  );
}

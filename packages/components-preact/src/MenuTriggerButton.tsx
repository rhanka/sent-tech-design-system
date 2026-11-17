import { ChevronDownCircle } from "lucide-preact";
import type { ButtonHTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

type Size = "sm" | "md" | "lg";

export type MenuTriggerButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  open?: MaybeSignal<boolean>;
  expanded?: MaybeSignal<boolean>;
  size?: Size;
  variant?: "ghost" | "secondary";
};

export function MenuTriggerButton({
  open: openInput,
  expanded: expandedInput,
  size = "md",
  variant = "ghost",
  type = "button",
  className,
  children,
  ...rest
}: MenuTriggerButtonProps) {
  const open = useValue(openInput);
  const expanded = useValue(expandedInput);
  const isOpen = open ?? expanded ?? false;
  return (
    <button
      {...rest}
      type={type}
      className={classNames("st-iconButton", `st-iconButton--${size}`, `st-iconButton--${variant}`, className)}
      aria-haspopup="menu"
      aria-expanded={isOpen}
    >
      {children ?? <ChevronDownCircle size={18} strokeWidth={2} aria-hidden="true" />}
    </button>
  );
}

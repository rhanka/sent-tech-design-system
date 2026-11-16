import type { ButtonHTMLAttributes } from "preact";
import { classNames } from "./classNames.js";

type Size = "sm" | "md" | "lg";

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: Size;
  variant?: "secondary" | "danger" | "ghost";
};
export function IconButton({ size = "md", variant = "ghost", type = "button", className, children, ...rest }: IconButtonProps) {
  return (
    <button {...rest} type={type} className={classNames("st-iconButton", `st-iconButton--${size}`, `st-iconButton--${variant}`, className)}>
      {children}
    </button>
  );
}

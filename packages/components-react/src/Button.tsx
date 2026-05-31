import React from "react";
import { classNames } from "./classNames.js";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: "button" | "submit" | "reset";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", type = "button", className, children, ...rest }, ref) => (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={classNames("st-button", `st-button--${variant}`, `st-button--${size}`, className)}
    >
      {children}
    </button>
  ),
);

Button.displayName = "Button";

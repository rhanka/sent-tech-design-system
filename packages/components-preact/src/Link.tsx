import type { AnchorHTMLAttributes } from "preact";
import { classNames } from "./classNames.js";

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Style du lien ; API canonique (alignée sur le canon Svelte). */
  variant?: "inline" | "standalone" | "muted";
  /** @deprecated Raccourci pour variant="standalone". Utilisez `variant`. */
  standalone?: boolean;
  /** @deprecated Raccourci pour variant="muted". Utilisez `variant`. */
  muted?: boolean;
  disabled?: boolean;
  /** Lien externe : pose target="_blank" rel="noreferrer" (sauf target/rel explicites). */
  external?: boolean;
};
export function Link({
  variant = "inline",
  muted = false,
  standalone = false,
  disabled = false,
  external = false,
  href,
  target,
  rel,
  className,
  children,
  onClick,
  ...rest
}: LinkProps) {
  // `variant` est canonique ; les booléens standalone/muted sont des raccourcis
  // dépréciés. `variant` explicite l'emporte.
  const effectiveVariant =
    variant !== "inline" ? variant : standalone ? "standalone" : muted ? "muted" : "inline";
  const resolvedTarget = target ?? (external ? "_blank" : undefined);
  const resolvedRel = rel ?? (external ? "noreferrer" : undefined);
  return (
    <a
      {...rest}
      className={classNames(
        "st-link",
        `st-link--${effectiveVariant}`,
        disabled && "st-link--disabled",
        className,
      )}
      href={disabled ? undefined : href}
      target={resolvedTarget}
      rel={resolvedRel}
      aria-disabled={disabled || undefined}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}

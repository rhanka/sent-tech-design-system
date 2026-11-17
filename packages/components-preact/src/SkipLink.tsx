import type { AnchorHTMLAttributes } from "preact";
import { classNames } from "./classNames.js";

export type SkipLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href?: string;
};

export function SkipLink({ href = "#main", className, children = "Skip to content", ...rest }: SkipLinkProps) {
  return (
    <a {...rest} href={href} className={classNames("st-skipLink", className)}>
      {children}
    </a>
  );
}

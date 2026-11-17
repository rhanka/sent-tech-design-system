import type { AnchorHTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { MaybeSignal } from "./signals.js";

export type SkipLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className"> & {
  href?: string;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export function SkipLink({ href = "#main", className, children = "Skip to content", ...rest }: SkipLinkProps) {
  return (
    <a {...rest} href={href} className={classNames("st-skipLink", className)}>
      {children}
    </a>
  );
}

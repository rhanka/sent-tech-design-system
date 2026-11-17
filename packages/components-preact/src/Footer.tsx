import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";
import type { MaybeSignal } from "./signals.js";

export type FooterProps = Omit<HTMLAttributes<HTMLElement>, "className"> & {
  brand?: ComponentChildren;
  columns?: Array<{ title?: ComponentChildren; links: Array<{ label: ComponentChildren; href: string }> }>;
  links?: Array<{ label: ComponentChildren; href: string }>;
  legalLinks?: Array<{ label: ComponentChildren; href: string }>;
  copyright?: ComponentChildren;
  legalNavLabel?: string;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export function Footer({ brand, columns, links, legalLinks, copyright, legalNavLabel = "Legal links", className, ...rest }: FooterProps) {
  const groups = columns ?? (links ? [{ links }] : []);
  const hasTop = brand || groups.length > 0;
  const hasBottom = copyright || (legalLinks && legalLinks.length > 0);
  return (
    <footer {...rest} className={classNames("st-footer", className)}>
      {hasTop ? (
        <div className="st-footer__top">
          {brand ? <div className="st-footer__brand">{brand}</div> : null}
          <div className="st-footer__columns">
            {groups.map((group, index) => (
              <nav key={index}>
                {group.title ? <h2>{group.title}</h2> : null}
                {group.links.map((link) => (
                  <a key={link.href} href={link.href}>
                    {link.label}
                  </a>
                ))}
              </nav>
            ))}
          </div>
        </div>
      ) : null}
      {hasBottom ? (
        <div className="st-footer__bottom">
          {copyright ? <span className="st-footer__copyright">{copyright}</span> : null}
          {legalLinks && legalLinks.length > 0 ? (
            <nav className="st-footer__legal" aria-label={legalNavLabel}>
              {legalLinks.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      ) : null}
    </footer>
  );
}

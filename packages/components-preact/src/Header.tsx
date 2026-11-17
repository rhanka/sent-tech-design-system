import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type HeaderAccount = { name?: string; email?: string; avatarUrl?: string };

export function deriveInitials(name?: string): string {
  return (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export type HeaderProps = Omit<HTMLAttributes<HTMLElement>, "className"> & {
  brand?: ComponentChildren;
  title?: ComponentChildren;
  navigation?: Array<{ label: ComponentChildren; href: string }>;
  navItems?: Array<{ label: ComponentChildren; href: string }>;
  account?: HeaderAccount;
  sticky?: MaybeSignal<boolean>;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export function Header({ brand, title, navigation, navItems, account, sticky: stickyInput = false, className, ...rest }: HeaderProps) {
  const sticky = useValue(stickyInput);
  const links = navigation ?? navItems ?? [];
  return (
    <header {...rest} className={classNames("st-header", sticky && "st-header--sticky", className)}>
      <div className="st-header__leading">
        {brand ? <a className="st-header__logo" href="/">{brand}</a> : null}
        {title ? <span className="st-header__title">{title}</span> : null}
      </div>
      <nav className="st-header__navigation">
        {links.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      {account ? (
        <div className="st-header__account">
          <span className="st-header__avatar st-header__avatar--initials">{deriveInitials(account.name)}</span>
          <span className="st-header__account-name">{account.name}</span>
          {account.email ? <span className="st-header__account-email">{account.email}</span> : null}
        </div>
      ) : null}
    </header>
  );
}

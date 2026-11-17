import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";

export interface SideNavItem {
  label: ComponentChildren;
  href: string;
  active?: boolean;
  children?: SideNavItem[];
}

export type SideNavProps = HTMLAttributes<HTMLElement> & {
  items: SideNavItem[];
  label?: string;
};

export function SideNav({ items, label = "Navigation", className, ...rest }: SideNavProps) {
  return (
    <nav {...rest} className={classNames("st-sidenav st-sideNav", className)} aria-label={label}>
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={classNames(
            "st-sidenav__link st-sideNav__link",
            item.active && "st-sidenav__link--active st-sideNav__link--active",
          )}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

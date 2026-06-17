import React from "react";
import { classNames } from "./classNames.js";

export interface NavRailItem {
  id: string;
  label: React.ReactNode;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
}

export type NavRailProps = React.HTMLAttributes<HTMLElement> & {
  items?: NavRailItem[];
  label?: string;
  activeItemId?: string;
  onItemSelect?: (id: string) => void;
  footer?: React.ReactNode;
};

export function NavRail({ items = [], label = "Primary navigation", activeItemId, onItemSelect, footer, className, children, ...rest }: NavRailProps) {
  return (
    <nav {...rest} className={classNames("st-navRail", className)} aria-label={label}>
      <div className="st-navRail__items">
        {items.map((item) => {
          const active = item.active === true || item.id === activeItemId;
          const content = <>{item.icon ? <span className="st-navRail__icon">{item.icon}</span> : null}<span className="st-navRail__label">{item.label}</span>{item.badge != null ? <span className="st-navRail__badge">{item.badge}</span> : null}</>;
          return item.href && !item.disabled ? (
            <a key={item.id} className={classNames("st-navRail__item", active && "st-navRail__item--active")} href={item.href} aria-current={active ? "page" : undefined} onClick={() => onItemSelect?.(item.id)}>{content}</a>
          ) : (
            <button key={item.id} className={classNames("st-navRail__item", active && "st-navRail__item--active")} type="button" disabled={item.disabled} aria-current={active ? "page" : undefined} onClick={() => !item.disabled && onItemSelect?.(item.id)}>{content}</button>
          );
        })}
        {children}
      </div>
      {footer ? <footer className="st-navRail__footer">{footer}</footer> : null}
    </nav>
  );
}

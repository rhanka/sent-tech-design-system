import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export interface NavRailItem {
  id: string;
  label: ComponentChildren;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  badge?: ComponentChildren;
  icon?: ComponentChildren;
}

export type NavRailProps = Omit<HTMLAttributes<HTMLElement>, "className"> & {
  items?: NavRailItem[];
  label?: string;
  activeItemId?: MaybeSignal<string>;
  onItemSelect?: (id: string) => void;
  footer?: ComponentChildren;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export function NavRail({ items = [], label = "Primary navigation", activeItemId: activeItemIdInput, onItemSelect, footer, className, children, ...rest }: NavRailProps) {
  const activeItemId = useValue(activeItemIdInput);
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

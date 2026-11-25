import type { CSSProperties, HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { mergeStyle } from "./internal.js";
import type { ComponentChildren } from "./runtime.js";

export interface BreadcrumbItem {
  label: ComponentChildren;
  href?: string;
  current?: boolean;
}

export type BreadcrumbProps = HTMLAttributes<HTMLElement> & {
  items: BreadcrumbItem[];
  label?: string;
};

export function Breadcrumb({ items, label = "Breadcrumb", className, style, ...rest }: BreadcrumbProps) {
  return (
    <nav {...rest} className={classNames("st-breadcrumb", className)} style={mergeStyle(undefined, style) as CSSProperties | undefined} aria-label={label}>
      <ol>
        {items.map((item, index) => (
          <li key={index}>
            {item.href && !item.current ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span aria-current={item.current ? "page" : undefined}>{item.label}</span>
            )}
            {index < items.length - 1 ? <span className="st-breadcrumb__separator">/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

import type { CSSProperties, HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { forwardRef } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export interface TableOfContentsItem {
  id: string;
  label: string;
  level?: number;
}

export type TableOfContentsProps = Omit<HTMLAttributes<HTMLElement>, "className" | "items"> & {
  title?: string;
  items: TableOfContentsItem[];
  /** Plain value, or a signal in the Preact build (read at the edge). */
  activeId?: MaybeSignal<string>;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

const normalizeItemId = (value: string) => value.replace(/^#/, "");

export const TableOfContents = forwardRef<HTMLElement, TableOfContentsProps>(
  ({ title, items, activeId: activeIdInput = "", className, ...rest }, ref) => {
    const activeId = useValue(activeIdInput);
    const normalizedActive = normalizeItemId(activeId);
    const normalizedItems = items.map((item) => ({
      ...item,
      id: normalizeItemId(item.id),
      level: Math.max(item.level ?? 1, 1),
    }));

    return (
      <nav
        {...rest}
        ref={ref}
        className={classNames("st-tableOfContents", className)}
        aria-label={title ?? "Table des matières"}
      >
        {title ? <p className="st-tableOfContents__title">{title}</p> : null}
        <ol className="st-tableOfContents__list">
          {normalizedItems.map((item) => {
            const isActive = item.id === normalizedActive;
            return (
              <li
                key={item.id}
                className="st-tableOfContents__item"
                style={{ "--st-tableOfContents-level": item.level - 1 } as CSSProperties}
              >
                <a
                  className="st-tableOfContents__link"
                  href={`#${item.id}`}
                  aria-current={isActive ? "location" : undefined}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  },
);

TableOfContents.displayName = "TableOfContents";

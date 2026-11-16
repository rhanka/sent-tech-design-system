import { ChevronDown } from "lucide-preact";
import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { idFrom, useControlled } from "./internal.js";
import type { ComponentChildren } from "./runtime.js";

export type AccordionItem = { id?: string; title: ComponentChildren; content: ComponentChildren; disabled?: boolean };
export type AccordionProps = HTMLAttributes<HTMLDivElement> & {
  items: AccordionItem[];
  openIds?: string[];
  defaultOpenIds?: string[];
  allowMultiple?: boolean;
  /** Svelte-canonical alias for `defaultOpenIds` (initially open item ids). */
  open?: string[];
  /** Svelte-canonical alias for `allowMultiple`. */
  multiple?: boolean;
  align?: "start" | "end";
  size?: "sm" | "md" | "lg";
  onChange?: (openIds: string[]) => void;
};

function node(value: ComponentChildren | (() => ComponentChildren)): ComponentChildren {
  return typeof value === "function" ? (value as () => ComponentChildren)() : value;
}

export function Accordion({ items, openIds, defaultOpenIds, open: openAlias, allowMultiple, multiple, align = "end", size = "md", onChange, className, ...rest }: AccordionProps) {
  const initialOpen = defaultOpenIds ?? openAlias ?? [];
  const resolvedAllowMultiple = allowMultiple ?? multiple ?? false;
  const [open, setOpen] = useControlled(openIds, initialOpen, onChange);
  const toggle = (id: string) => {
    const next = open.includes(id) ? open.filter((value) => value !== id) : resolvedAllowMultiple ? [...open, id] : [id];
    setOpen(next);
  };

  return (
    <div {...rest} className={classNames("st-accordion", `st-accordion--${size}`, `st-accordion--align-${align}`, className)}>
      {items.map((item, index) => {
        const itemId = idFrom(item, index, "accordion");
        const isOpen = open.includes(itemId);
        const triggerId = `st-accordion-trigger-${itemId}`;
        const panelId = `st-accordion-panel-${itemId}`;
        const titleNode = <span className="st-accordion__title">{item.title}</span>;
        const iconNode = (
          <span className="st-accordion__icon" aria-hidden="true">
            <ChevronDown size={18} strokeWidth={2.25} aria-hidden="true" />
          </span>
        );
        return (
          <div key={itemId} className={classNames("st-accordion__item", isOpen && "st-accordion__item--open")}>
            <h3 className="st-accordion__heading">
              <button
                id={triggerId}
                type="button"
                className="st-accordion__trigger"
                disabled={item.disabled}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(itemId)}
              >
                {align === "start" ? (
                  <>
                    {iconNode}
                    {titleNode}
                  </>
                ) : (
                  <>
                    {titleNode}
                    {iconNode}
                  </>
                )}
              </button>
            </h3>
            {isOpen ? (
              <div className="st-accordion__panel" id={panelId} role="region" aria-labelledby={triggerId}>
                {node(item.content)}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

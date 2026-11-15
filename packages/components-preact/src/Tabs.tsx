import type { HTMLAttributes } from "preact";
import { useId, useRef } from "preact/hooks";
import { classNames } from "./classNames.js";
import { idFrom, moveIndex, useControlled } from "./internal.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export interface TabItem {
  id?: string;
  value?: string;
  label: ComponentChildren;
  content?: ComponentChildren;
  disabled?: boolean;
}
// `onchange` (Svelte-canonical, lowercase) is accepted as an alias of `onChange`.
export type TabsProps = HTMLAttributes<HTMLElement> & {
  items: TabItem[];
  /** Plain value, or a signal in the Preact build (read at the edge). */
  activeValue?: MaybeSignal<string | undefined>;
  activeId?: string;
  label?: string;
  onChange?: (value: string) => void;
  onchange?: (value: string) => void;
};

export function Tabs({ items, activeValue, activeId, label = "Tabs", onChange, onchange, className, ...rest }: TabsProps) {
  const handleChange = onChange ?? onchange;
  const generatedId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const first = items.find((item) => !item.disabled) ?? items[0];
  const [current, setCurrent] = useControlled(useValue(activeValue) ?? activeId, idFrom(first ?? {}, 0, "tab"), handleChange);
  const itemIds = items.map((item, index) => idFrom(item, index, "tab"));
  const activeIndex = Math.max(0, itemIds.indexOf(current));
  const active = items[activeIndex] ?? first;
  const activateIndex = (index: number) => {
    const item = items[index];
    if (!item || item.disabled) return;
    setCurrent(itemIds[index]);
    tabRefs.current[index]?.focus();
  };
  const moveTab = (index: number, delta: number) => {
    const enabled = items.map((item, itemIndex) => ({ item, itemIndex })).filter(({ item }) => !item.disabled);
    const enabledIndex = enabled.findIndex(({ itemIndex }) => itemIndex === index);
    const next = enabled[moveIndex(enabledIndex, enabled.length, delta)];
    if (next) activateIndex(next.itemIndex);
  };

  return (
    <section {...rest} className={classNames("st-tabs", className)}>
      <div className="st-tabs__list" role="tablist" aria-label={label}>
        {items.map((item, index) => {
          const itemId = idFrom(item, index, "tab");
          const tabId = `st-tabs-${generatedId}-tab-${itemId}`;
          const panelId = `st-tabs-${generatedId}-panel-${itemId}`;
          return (
            <button
              key={itemId}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              id={tabId}
              type="button"
              role="tab"
              className={classNames("st-tabs__tab", itemId === current && "st-tabs__tab--active")}
              aria-selected={itemId === current}
              aria-controls={panelId}
              tabIndex={itemId === current ? 0 : -1}
              disabled={item.disabled}
              onClick={() => activateIndex(index)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  moveTab(index, 1);
                } else if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  moveTab(index, -1);
                } else if (event.key === "Home") {
                  event.preventDefault();
                  const firstEnabled = items.findIndex((candidate) => !candidate.disabled);
                  activateIndex(firstEnabled >= 0 ? firstEnabled : 0);
                } else if (event.key === "End") {
                  event.preventDefault();
                  const lastEnabled =
                    items
                      .map((candidate, candidateIndex) => ({ candidate, candidateIndex }))
                      .filter(({ candidate }) => !candidate.disabled)
                      .at(-1)?.candidateIndex ?? items.length - 1;
                  activateIndex(lastEnabled);
                }
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div
        id={`st-tabs-${generatedId}-panel-${itemIds[activeIndex]}`}
        className="st-tabs__panel"
        role="tabpanel"
        aria-labelledby={`st-tabs-${generatedId}-tab-${itemIds[activeIndex]}`}
      >
        {active?.content}
      </div>
    </section>
  );
}

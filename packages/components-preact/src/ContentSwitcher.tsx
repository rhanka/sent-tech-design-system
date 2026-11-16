import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { idFrom } from "./internal.js";
import type { ComponentChildren } from "./runtime.js";
import type { MaybeSignal } from "./signals.js";

export type ContentSwitcherItem = { id?: string; value?: string; label: ComponentChildren; disabled?: boolean }

// `onchange` (Svelte-canonical, lowercase) is accepted as an alias of `onChange`.
export type ContentSwitcherProps = HTMLAttributes<HTMLDivElement> & {
  items: ContentSwitcherItem[];
  value?: string;
  activeId?: string;
  onChange?: (value: string) => void;
  onchange?: (value: string) => void;
  size?: "sm" | "md" | "lg";
};

export function ContentSwitcher({ items, value, activeId, onChange, onchange, size = "md", className, ...rest }: ContentSwitcherProps) {
  const handleChange = onChange ?? onchange;
  const current = value ?? activeId ?? idFrom(items[0] ?? {}, 0, "content");
  return (
    <div {...rest} className={classNames("st-contentSwitcher", `st-contentSwitcher--${size}`, className)} role="group">
      {items.map((item, index) => {
        const itemId = idFrom(item, index, "content");
        return (
          <button
            key={itemId}
            type="button"
            className={classNames("st-contentSwitcher__option st-contentSwitcher__button", itemId === current && "st-contentSwitcher__option--selected")}
            disabled={item.disabled}
            aria-pressed={itemId === current}
            onClick={() => handleChange?.(itemId)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

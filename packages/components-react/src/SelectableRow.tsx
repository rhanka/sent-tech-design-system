import React from "react";
import { classNames } from "./classNames.js";

export type SelectableRowProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onSelect"
> & {
  /** Selected state (controlled). */
  selected?: boolean;
  /** Notified on every toggle with the new selected state. */
  onSelect?: (selected: boolean) => void;
  /** Non-interactive when true. */
  disabled?: boolean;
  /** Optional stable value, surfaced as `data-value` for the consumer. */
  value?: string;
  /** Leading content (icon / avatar). */
  leading?: React.ReactNode;
  /** Trailing content (meta / icon). */
  trailing?: React.ReactNode;
  /** Main content. */
  children?: React.ReactNode;
  className?: string;
};

/**
 * Compact, full-width selectable list/rail row. The selected state is truly
 * themed (a tinted surface + accented text + a fine 2px flush accent bar) —
 * deliberately NOT the off-theme "boudin box" it replaces. role="option" +
 * aria-selected, keyboard-activatable (Enter / Space), inert when disabled.
 */
export const SelectableRow = React.forwardRef<HTMLDivElement, SelectableRowProps>(
  (
    {
      selected = false,
      onSelect,
      disabled = false,
      value,
      leading,
      trailing,
      children,
      className,
      ...rest
    },
    ref,
  ) => {
    function toggle() {
      if (disabled) return;
      onSelect?.(!selected);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    }

    return (
      <div
        {...rest}
        ref={ref}
        className={classNames(
          "st-selectableRow",
          selected && "st-selectableRow--selected",
          disabled && "st-selectableRow--disabled",
          className,
        )}
        role="option"
        aria-selected={selected}
        aria-disabled={disabled ? "true" : undefined}
        data-value={value}
        tabIndex={disabled ? -1 : 0}
        onClick={toggle}
        onKeyDown={handleKeyDown}
      >
        {leading != null ? (
          <span className="st-selectableRow__leading">{leading}</span>
        ) : null}
        <span className="st-selectableRow__content">{children}</span>
        {trailing != null ? (
          <span className="st-selectableRow__trailing">{trailing}</span>
        ) : null}
      </div>
    );
  },
);

SelectableRow.displayName = "SelectableRow";

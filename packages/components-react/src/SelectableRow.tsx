import React from "react";
import { classNames } from "./classNames.js";

/**
 * Shared context between {@link SelectableList} and its {@link SelectableRow}
 * children. The list owns selection + the roving tabindex and exposes the
 * getters/callbacks the rows read to derive their own `role` / `tabindex` /
 * `aria-selected`. When a row is used STANDALONE (no provider) the context is
 * null and the row falls back to its own `role` / `tabindex` / selection state.
 */
export type SelectableListContextValue = {
  /** True when the list manages selection/roving for its rows. */
  readonly managed: true;
  /** listbox role for the wrapper → rows are "option". */
  readonly itemRole: "option";
  /** Register a row element; returns an unregister callback. disabled is forwarded so the list can skip it during keyboard navigation. */
  register: (el: HTMLElement, value: string | undefined, disabled?: boolean) => () => void;
  /** Is the row with this element currently selected? */
  isSelected: (el: HTMLElement) => boolean;
  /** Should the row with this element be the roving-tabindex stop (tabindex 0)? */
  isTabStop: (el: HTMLElement) => boolean;
  /** Row was activated (click / Space / Enter). The list toggles selection. */
  activate: (el: HTMLElement) => void;
  /** Row received focus → becomes the roving tab stop. */
  focusRow: (el: HTMLElement) => void;
  /** Arrow / Home / End navigation from a row. */
  navigate: (el: HTMLElement, key: string) => void;
};

export const SelectableListContext =
  React.createContext<SelectableListContextValue | null>(null);

/**
 * Changing version context, bumped by the list on every selection / focus /
 * registry change. Rows read it during render so they re-render and recompute
 * their derived attributes. Kept SEPARATE from {@link SelectableListContext} so
 * the actions context stays identity-stable (a row's registration effect must
 * not re-run — and re-register — in a loop).
 */
export const SelectableListVersionContext = React.createContext(0);

export type SelectableRowProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onSelect"
> & {
  /**
   * Selected state. Honoured when the row is used STANDALONE; inside a
   * {@link SelectableList} the list is the source of truth and drives the
   * selected styling, so this prop is ignored for managed rows.
   */
  selected?: boolean;
  /** Notified on every toggle with the new selected state (standalone rows). */
  onSelect?: (selected: boolean) => void;
  /** Non-interactive when true. */
  disabled?: boolean;
  /** Stable value, surfaced as `data-value` and used by the list for `value`. */
  value?: string;
  /**
   * ARIA role for the standalone row. Defaults to "button" for standalone use —
   * "option" is only valid inside a listbox and would be invalid without one.
   * Inside a SelectableList the role is always forced to "option".
   */
  role?: string;
  /**
   * Opt-in left accent bar on the selected state. Off by default so the
   * selected item is a calm tinted surface + accented text (two signals only).
   */
  accentBar?: boolean;
  /** Leading content (icon / avatar). */
  leading?: React.ReactNode;
  /** Trailing content (meta / icon). */
  trailing?: React.ReactNode;
  /** Main content. */
  children?: React.ReactNode;
  /**
   * Optional secondary line (the "legend") rendered MUTED and smaller UNDER
   * `children`. When present the content column stacks vertically (a
   * `--hasCaption` modifier); when absent the row stays single-line and
   * byte-identical. The caption joins the row's accessible name by default (the
   * SR reads "label, caption"); wrap it `aria-hidden` if it is purely
   * decorative. MUST NOT contain interactive controls — a row is a single tab
   * stop.
   */
  caption?: React.ReactNode;
  className?: string;
};

/**
 * Compact, full-width selectable list/rail row. By DEFAULT the selected state
 * is two calm signals — a tinted surface + accented text — deliberately NOT the
 * off-theme "boudin box" it replaces, and NOT a reflow-causing font-weight
 * bump. The fine left accent bar is OPT-IN via the `accentBar` prop. Focus is an
 * EXTERNAL offset outline. role="option" + aria-selected, keyboard-activatable
 * (Enter / Space), inert when disabled. Inside a {@link SelectableList} the list
 * (via context) owns selection and the roving tabindex.
 */
export const SelectableRow = React.forwardRef<HTMLDivElement, SelectableRowProps>(
  (
    {
      selected = false,
      onSelect,
      disabled = false,
      value,
      role = "button",
      accentBar = false,
      leading,
      trailing,
      children,
      caption,
      className,
      ...rest
    },
    ref,
  ) => {
    const list = React.useContext(SelectableListContext);
    // Subscribe to the list's version so this row re-renders (and recomputes
    // role / tabindex / aria-selected) on every selection / focus / registry
    // change. The value itself is unused — reading the context is the subscription.
    React.useContext(SelectableListVersionContext);
    const innerRef = React.useRef<HTMLDivElement | null>(null);

    // Merge the forwarded ref with our own so the list can register the element.
    const setRef = React.useCallback(
      (el: HTMLDivElement | null) => {
        innerRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      },
      [ref],
    );

    // Register with the parent list (if any) so it can order rows for arrow nav
    // and compute the roving tab stop. Disabled rows are registered too so the
    // list can skip them during navigation; the list owns the skip logic.
    React.useEffect(() => {
      const el = innerRef.current;
      if (!list || !el) return;
      return list.register(el, value, disabled);
    }, [list, value, disabled]);

    // A11y edge-case: quand cette row passe à disabled=true ET qu'elle détient
    // le focus DOM, transférer le focus vers la prochaine row enabled via navigate().
    React.useEffect(() => {
      if (!disabled || !list) return;
      const el = innerRef.current;
      if (!el || !el.contains(document.activeElement ?? null)) return;
      list.navigate(el, "ArrowDown");
    }, [disabled, list]);

    // Subscribe to list re-renders so managed rows recompute selected/tabstop.
    // The list bumps this version on every selection / focus change.
    const el = innerRef.current;
    const isSelected = list && el ? list.isSelected(el) : selected;
    const effectiveRole = list ? list.itemRole : role;
    const tabIndex = disabled ? -1 : list && el ? (list.isTabStop(el) ? 0 : -1) : 0;

    function activate() {
      if (disabled) return;
      const node = innerRef.current;
      if (list && node) {
        list.activate(node);
        return;
      }
      onSelect?.(!selected);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate();
        return;
      }
      // Roving navigation is owned by the list; forward the relevant keys.
      const node = innerRef.current;
      if (
        list &&
        node &&
        (e.key === "ArrowDown" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight" ||
          e.key === "Home" ||
          e.key === "End")
      ) {
        e.preventDefault();
        list.navigate(node, e.key);
      }
    }

    function handleFocus() {
      if (disabled) return;
      const node = innerRef.current;
      if (list && node) list.focusRow(node);
    }

    return (
      <div
        {...rest}
        ref={setRef}
        className={classNames(
          "st-selectableRow",
          isSelected && "st-selectableRow--selected",
          disabled && "st-selectableRow--disabled",
          accentBar && "st-selectableRow--accentBar",
          caption != null && "st-selectableRow--hasCaption",
          className,
        )}
        role={effectiveRole}
        aria-selected={effectiveRole === "option" ? isSelected : undefined}
        aria-pressed={effectiveRole === "button" ? isSelected : undefined}
        aria-disabled={disabled ? "true" : undefined}
        data-value={value}
        tabIndex={tabIndex}
        onClick={activate}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
      >
        {leading != null ? (
          <span className="st-selectableRow__leading">{leading}</span>
        ) : null}
        {caption != null ? (
          // Caption present: the content column stacks the primary label over a
          // muted second line. Both lines truncate independently (each
          // min-width:0 + ellipsis) so a long caption never pushes the row width.
          <span className="st-selectableRow__content st-selectableRow__content--stacked">
            <span className="st-selectableRow__label">{children}</span>
            <span className="st-selectableRow__caption">{caption}</span>
          </span>
        ) : (
          <span className="st-selectableRow__content">{children}</span>
        )}
        {trailing != null ? (
          <span className="st-selectableRow__trailing">{trailing}</span>
        ) : null}
      </div>
    );
  },
);

SelectableRow.displayName = "SelectableRow";

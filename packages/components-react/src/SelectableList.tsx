import React from "react";
import { classNames } from "./classNames.js";
import {
  SelectableListContext,
  SelectableListVersionContext,
  type SelectableListContextValue,
} from "./SelectableRow.js";

export type SelectableListProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> & {
  /** Accessible name for the listbox (required for SR users). */
  label?: string;
  /** References the id of an external visible label (alternative to `label`). */
  labelledby?: string;
  /**
   * Allow more than one selected row. Adds aria-multiselectable and toggles
   * each row independently. Defaults to false (single-select).
   */
  multiple?: boolean;
  /**
   * Selected value(s). Controlled when provided. For single-select pass a
   * string (or null); for multiple pass a string[]. When omitted the list is
   * uncontrolled and keeps its own internal selection.
   */
  value?: string | string[] | null;
  /**
   * Fired with the new selection on every change. Receives a string|null for
   * single-select and a string[] for multiple. Required for the controlled
   * pattern; also fires for uncontrolled lists.
   */
  onChange?: (value: string | string[] | null) => void;
  children?: React.ReactNode;
  className?: string;
};

type Entry = { el: HTMLElement; value: string | undefined };

function toSet(v: string | string[] | null | undefined): Set<string> {
  if (v == null) return new Set();
  return new Set(Array.isArray(v) ? v : [v]);
}

function sortByDom(list: Entry[]): Entry[] {
  return [...list].sort((a, b) => {
    const pos = a.el.compareDocumentPosition(b.el);
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });
}

/**
 * Accessible listbox that owns selection + a roving tabindex for its
 * {@link SelectableRow} children. Arrow / Home / End move focus (roving),
 * Space / Enter / click toggle the focused row. Single-select by default;
 * `multiple` toggles rows independently. Controlled via `value`/`onChange`,
 * otherwise it keeps its own internal selection. Pilots each child row through
 * a STABLE React context (so a row's registration effect never re-runs in a
 * loop) plus a `version` counter the rows read to recompute role / tabindex /
 * aria-selected on every selection / focus / registry change.
 */
export function SelectableList({
  label,
  labelledby,
  multiple = false,
  value,
  onChange,
  children,
  className,
  ...rest
}: SelectableListProps) {
  // Controlled when the consumer passes `value` (including null).
  const controlled = value !== undefined;

  // --- Mutable state lives in refs (read by the STABLE context methods); a
  //     `version` counter drives re-renders so rows recompute their derived
  //     attributes. This keeps the context object identity-stable, which is what
  //     prevents the rows' registration effect from re-running in a loop. ------
  const entriesRef = React.useRef<Entry[]>([]);
  const tabStopRef = React.useRef<HTMLElement | null>(null);
  const internalRef = React.useRef<Set<string>>(new Set());

  // `version` is provided to rows so they re-render on every selection / focus /
  // registry change (the actions context stays identity-stable).
  const [version, force] = React.useReducer((n: number) => n + 1, 0);
  const bump = React.useCallback(() => force(), []);

  // Latest controlled inputs, read by stable callbacks without stale closures.
  const controlledRef = React.useRef(controlled);
  controlledRef.current = controlled;
  const valueRef = React.useRef(value);
  valueRef.current = value;
  const multipleRef = React.useRef(multiple);
  multipleRef.current = multiple;
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  function currentSelection(): Set<string> {
    return controlledRef.current ? toSet(valueRef.current) : internalRef.current;
  }

  // Default roving stop = first registered (DOM-ordered) row when none focused.
  function effectiveTabStop(): HTMLElement | null {
    return tabStopRef.current ?? entriesRef.current[0]?.el ?? null;
  }

  function valueOf(el: HTMLElement): string | undefined {
    return entriesRef.current.find((e) => e.el === el)?.value;
  }

  // Stable context methods — created ONCE so the context object never changes
  // identity. They read mutable state from refs and bump the version to re-render.
  const context = React.useMemo<SelectableListContextValue>(() => {
    const register = (el: HTMLElement, rowValue: string | undefined): (() => void) => {
      entriesRef.current = sortByDom([
        ...entriesRef.current.filter((e) => e.el !== el),
        { el, value: rowValue },
      ]);
      bump();
      return () => {
        entriesRef.current = entriesRef.current.filter((e) => e.el !== el);
        if (tabStopRef.current === el) tabStopRef.current = null;
        bump();
      };
    };

    const isSelected = (el: HTMLElement): boolean => {
      const v = valueOf(el);
      return v !== undefined && currentSelection().has(v);
    };

    const isTabStop = (el: HTMLElement): boolean => el === effectiveTabStop();

    const emit = (next: Set<string>) => {
      if (!controlledRef.current) internalRef.current = next;
      if (multipleRef.current) onChangeRef.current?.([...next]);
      else onChangeRef.current?.(next.size ? [...next][0] : null);
      bump();
    };

    const activate = (el: HTMLElement) => {
      const v = valueOf(el);
      if (v === undefined) return;
      const current = currentSelection();
      let next: Set<string>;
      if (multipleRef.current) {
        next = new Set(current);
        if (next.has(v)) next.delete(v);
        else next.add(v);
      } else {
        // Single-select toggles off when re-activating the selected row.
        next = current.has(v) && current.size === 1 ? new Set() : new Set([v]);
      }
      emit(next);
    };

    const focusRow = (el: HTMLElement) => {
      tabStopRef.current = el;
      bump();
    };

    const navigate = (el: HTMLElement, key: string) => {
      const list = entriesRef.current;
      if (list.length === 0) return;
      const idx = list.findIndex((e) => e.el === el);
      if (idx === -1) return;
      let targetIdx = idx;
      if (key === "ArrowDown" || key === "ArrowRight") targetIdx = idx + 1;
      else if (key === "ArrowUp" || key === "ArrowLeft") targetIdx = idx - 1;
      else if (key === "Home") targetIdx = 0;
      else if (key === "End") targetIdx = list.length - 1;
      // Clamp (no wrap) so Home/End and arrows stay within bounds.
      targetIdx = Math.max(0, Math.min(list.length - 1, targetIdx));
      const target = list[targetIdx]?.el;
      if (target) {
        tabStopRef.current = target;
        target.focus();
        bump();
      }
    };

    return {
      managed: true,
      itemRole: "option",
      register,
      isSelected,
      isTabStop,
      activate,
      focusRow,
      navigate,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bump]);

  return (
    <div
      {...rest}
      className={classNames("st-selectableList", className)}
      role="listbox"
      aria-label={labelledby ? undefined : label}
      aria-labelledby={labelledby}
      aria-multiselectable={multiple ? "true" : undefined}
    >
      <SelectableListContext.Provider value={context}>
        <SelectableListVersionContext.Provider value={version}>
          {children}
        </SelectableListVersionContext.Provider>
      </SelectableListContext.Provider>
    </div>
  );
}

SelectableList.displayName = "SelectableList";

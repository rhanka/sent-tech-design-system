import { ChevronDown } from "lucide-preact";
import type { HTMLAttributes } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import { moveIndex, text, useControlled, useEscape } from "./internal.js";
import { Portal } from "./Portal.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export interface DropdownOption {
  value: string;
  label: ComponentChildren;
  disabled?: boolean;
}

// `onselect` (Svelte-canonical, lowercase) is accepted as an alias of `onSelect`.
export type DropdownProps = Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> & {
  label?: ComponentChildren;
  options: DropdownOption[];
  /** Plain value, or a signal in the Preact build (read at the edge). */
  value?: MaybeSignal<string>;
  /** Plain value, or a signal in the Preact build (read at the edge). */
  open?: MaybeSignal<boolean>;
  locale?: string;
  placeholder?: ComponentChildren;
  onSelect?: (value: string) => void;
  onselect?: (value: string) => void;
};

export function Dropdown({ label, options, value: valueInput, open: openInput, locale = "fr-FR", placeholder, onSelect, onselect, className, ...rest }: DropdownProps) {
  const isFr = (locale ?? "fr-FR").toLowerCase().startsWith("fr");
  const resolvedLabel = label ?? (isFr ? "Sélectionner" : "Select");
  const resolvedPlaceholder = placeholder ?? (isFr ? "Sélectionner" : "Select");
  const handleSelect = onSelect ?? onselect;
  const hostRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [open, setOpen] = useControlled(useValue(openInput), false);
  const value = useValue(valueInput);
  const [current, setCurrent] = useControlled(value, value ?? "");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [listPos, setListPos] = useState({ top: 0, left: 0, width: 0 });
  const updateListPos = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const top = rect.bottom + 4;
    // Bail out when the position is unchanged so an effect re-run (useControlled
    // returns a fresh setter each render) can't drive an infinite render loop.
    setListPos((prev) =>
      prev.top === top && prev.left === rect.left && prev.width === rect.width
        ? prev
        : { top, left: rect.left, width: rect.width },
    );
  }, []);
  const selected = options.find((option) => option.value === current);
  const focusOption = (index: number) => {
    setActiveIndex(index);
  }
  useEffect(() => {
    if (open && activeIndex >= 0) itemRefs.current[activeIndex]?.focus();
  }, [activeIndex, open]);
  const selectOption = (option: DropdownOption) => {
    if (option.disabled) return;
    setCurrent(option.value);
    setOpen(false);
    setActiveIndex(-1);
    handleSelect?.(option.value);
  }
  useEffect(() => {
    if (!open) return;
    updateListPos();
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && !hostRef.current?.contains(target) && !listRef.current?.contains(target)) setOpen(false);
    }
    const onScroll = () => updateListPos();
    const onResize = () => updateListPos();
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    }
    // `setOpen`/`updateListPos` are intentionally omitted: `useControlled`
    // returns a fresh setter each render, and depending on it re-ran this effect
    // every render → setListPos → re-render → hang. We only re-bind on open toggles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  useEscape(open, () => setOpen(false));
  return (
    <div {...rest} ref={hostRef} className={classNames("st-dropdown", className)}>
      <button
        type="button"
        className="st-dropdown__button"
        aria-haspopup="listbox"
        ref={buttonRef}
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          if (!open) requestAnimationFrame(updateListPos);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            focusOption(0);
          }
        }}
      >
        <span className="st-dropdown__label">{resolvedLabel}</span>: <span className="st-dropdown__value">{selected?.label ?? resolvedPlaceholder}</span>
        <ChevronDown className={classNames("st-dropdown__icon", open && "st-dropdown__icon--open")} size={18} strokeWidth={2.25} aria-hidden="true" />
      </button>
      {open ? (
        <Portal>
        <div
          ref={listRef}
          className="st-dropdown__list"
          role="listbox"
          aria-label={text(resolvedLabel)}
          style={{ top: listPos.top, left: listPos.left, minWidth: listPos.width }}
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              type="button"
              role="option"
              className="st-dropdown__option"
              disabled={option.disabled}
              aria-disabled={option.disabled ? "true" : undefined}
              aria-selected={option.value === current}
              onClick={() => selectOption(option)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  focusOption(moveIndex(index, options.length, 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  focusOption(moveIndex(index, options.length, -1));
                } else if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  selectOption(option);
                } else if (event.key === "Escape") {
                  event.preventDefault();
                  setOpen(false);
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
        </Portal>
      ) : null}
    </div>
  );
}

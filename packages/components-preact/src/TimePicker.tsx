import { Clock } from "lucide-preact";
import type { HTMLAttributes } from "preact";
import { useId, useMemo, useRef, useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import { useControlled, useOutsideMouseDown } from "./internal.js";
import type { ComponentChildren, TargetedKeyboardEvent } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type TimePickerFormat = "24" | "12";

export type TimePickerProps = Omit<HTMLAttributes<HTMLDivElement>, "className" | "onChange"> & {
  /** Current time as "HH:mm" (24h, always). Empty = unset. */
  value?: MaybeSignal<string>;
  /** Called with "HH:mm" on selection. */
  onChange?: (value: string) => void;
  /** Step (in minutes) between generated slots. */
  step?: number;
  /** Minimum bound "HH:mm" (inclusive). */
  min?: string;
  /** Maximum bound "HH:mm" (inclusive). */
  max?: string;
  /** 24h display (default) or 12h (AM/PM). The emitted value stays "HH:mm". */
  format?: TimePickerFormat;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  label?: string;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
  id?: string;
};

function timeToMinutes(hhmm: string | undefined): number | null {
  if (!hhmm) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function timeFromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function TimePicker({
  value: valueInput,
  onChange,
  step = 15,
  min,
  max,
  format = "24",
  size = "md",
  disabled = false,
  label,
  className,
  id,
  ...rest
}: TimePickerProps) {
  const reactId = useId();
  const fieldId = id ?? `st-timepicker-${reactId}`;
  const listId = `${fieldId}-list`;
  const hostRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const value = useValue(valueInput);
  const [current, setCurrent] = useControlled(value, value ?? "", onChange);
  /** Index of the highlighted option in the listbox (-1 = none). */
  const [activeIndex, setActiveIndex] = useState(-1);

  function display(hhmm: string): string {
    if (format === "24") return hhmm;
    const total = timeToMinutes(hhmm);
    if (total === null) return hhmm;
    const h24 = Math.floor(total / 60);
    const m = total % 60;
    const period = h24 < 12 ? "AM" : "PM";
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
  }

  const slots = useMemo<string[]>(() => {
    const safeStep = step > 0 ? step : 15;
    const lower = timeToMinutes(min) ?? 0;
    const upper = timeToMinutes(max) ?? 23 * 60 + 59;
    const result: string[] = [];
    for (let t = lower; t <= upper; t += safeStep) {
      result.push(timeFromMinutes(t));
    }
    return result;
  }, [step, min, max]);

  const displayValue = current ? display(current) : "";

  /** Id of the active option, consumed by aria-activedescendant. */
  const activeDescendant = open && activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined;

  function scrollActiveIntoView(idx: number) {
    const list = listRef.current;
    if (!list || idx < 0) return;
    const optEl = list.querySelector<HTMLElement>(`#${listId}-opt-${idx}`);
    if (optEl && typeof optEl.scrollIntoView === "function") {
      optEl.scrollIntoView({ block: "nearest" });
    }
  }

  function openList() {
    if (disabled) return;
    const idx = current ? slots.indexOf(current) : -1;
    const initIdx = idx >= 0 ? idx : 0;
    setActiveIndex(initIdx);
    setOpen(true);
    // Focus stays on the input (aria-activedescendant pattern).
    // Scroll after render.
    setTimeout(() => scrollActiveIntoView(initIdx), 0);
  }

  function closeList(returnFocus = true) {
    setOpen(false);
    setActiveIndex(-1);
    if (returnFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }

  function toggleOpen() {
    if (disabled) return;
    if (open) closeList(true);
    else openList();
  }

  function pick(slot: string) {
    setCurrent(slot);
    closeList(true);
  }

  useOutsideMouseDown(open, hostRef, () => closeList(false));

  function onInputKeyDown(event: TargetedKeyboardEvent<HTMLInputElement>) {
    if (disabled) return;
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        if (!open) {
          openList();
        } else {
          const next = Math.min(activeIndex + 1, slots.length - 1);
          setActiveIndex(next);
          scrollActiveIntoView(next);
        }
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        if (!open) {
          openList();
        } else {
          const next = Math.max(activeIndex - 1, 0);
          setActiveIndex(next);
          scrollActiveIntoView(next);
        }
        break;
      }
      case "Home": {
        event.preventDefault();
        if (!open) {
          openList();
        } else {
          setActiveIndex(0);
          scrollActiveIntoView(0);
        }
        break;
      }
      case "End": {
        event.preventDefault();
        if (!open) {
          openList();
        } else {
          const last = slots.length - 1;
          setActiveIndex(last);
          scrollActiveIntoView(last);
        }
        break;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        if (!open) {
          openList();
        } else if (activeIndex >= 0 && activeIndex < slots.length) {
          pick(slots[activeIndex]);
        }
        break;
      }
      case "Escape": {
        if (open) {
          event.preventDefault();
          closeList(true);
        }
        break;
      }
    }
  }

  return (
    <div className={classNames("st-field", className)} ref={hostRef} {...rest}>
      <div className="st-field__control">
        {label ? (
          <label className="st-field__label" htmlFor={fieldId}>
            {label}
          </label>
        ) : null}
        <span className={classNames("st-timepicker", `st-timepicker--${size}`)}>
          <input
            ref={inputRef}
            id={fieldId}
            type="text"
            readOnly
            className="st-timepicker__control"
            value={displayValue}
            placeholder={format === "24" ? "HH:mm" : "hh:mm AM"}
            disabled={disabled}
            role="combobox"
            aria-haspopup="listbox"
            aria-controls={listId}
            aria-expanded={open ? "true" : "false"}
            aria-activedescendant={activeDescendant}
            aria-autocomplete="none"
            onClick={toggleOpen}
            onKeyDown={onInputKeyDown}
          />
          <button
            type="button"
            className="st-timepicker__trigger"
            aria-label="Ouvrir la liste des horaires"
            aria-haspopup="listbox"
            aria-expanded={open ? "true" : "false"}
            tabIndex={-1}
            disabled={disabled}
            onClick={toggleOpen}
          >
            <Clock size={16} aria-hidden="true" />
          </button>
        </span>
      </div>
      {open ? (
        <ul
          ref={listRef}
          id={listId}
          className="st-timepicker__list"
          role="listbox"
          aria-label={label ?? "Horaires"}
          tabIndex={-1}
        >
          {slots.map((slot, i) => (
            <li key={slot} role="presentation">
              <div
                id={`${listId}-opt-${i}`}
                className={classNames(
                  "st-timepicker__option",
                  slot === current && "st-timepicker__option--selected",
                  i === activeIndex && "st-timepicker__option--active",
                )}
                role="option"
                aria-selected={slot === current ? "true" : "false"}
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(slot)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                {display(slot)}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

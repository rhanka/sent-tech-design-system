import { ChevronLeft, ChevronRight } from "lucide-preact";
import type { HTMLAttributes } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import { useControlled } from "./internal.js";
import type { ComponentChildren, TargetedKeyboardEvent } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

// --- Calendar --------------------------------------------------------------
/**
 * In single mode: `string | null` ("YYYY-MM-DD").
 * In range mode (`range`): tuple `[start, end]` where each bound is
 * "YYYY-MM-DD" or null.
 */
export type CalendarValue = string | null | [string | null, string | null];

export type CalendarProps = Omit<HTMLAttributes<HTMLDivElement>, "className" | "onChange"> & {
  /** Selected date ("YYYY-MM-DD") or tuple [start,end] when `range`. */
  value?: MaybeSignal<CalendarValue>;
  /** Called with the new date (or the tuple in range mode). */
  onChange?: (value: CalendarValue) => void;
  /** Minimum bound "YYYY-MM-DD" (inclusive). */
  min?: string;
  /** Maximum bound "YYYY-MM-DD" (inclusive). */
  max?: string;
  /** Selection of a range of two dates. */
  range?: MaybeSignal<boolean>;
  /** First day of the week: 0 = Sunday, 1 = Monday. */
  weekStartsOn?: 0 | 1;
  locale?: string;
  /** Displayed month ("YYYY-MM"), controllable from the outside. */
  month?: MaybeSignal<string>;
  /**
   * Called with the new displayed month ("YYYY-MM") when it changes through an
   * internal navigation (previous/next buttons, keyboard crossing a month,
   * PageUp/PageDown). Never emitted when the parent changes the `month` prop
   * (no loop).
   */
  onMonthChange?: (month: string) => void;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
};

function calStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function calParseISO(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(d.getTime()) ? null : calStartOfDay(d);
}

function calIsSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function Calendar({
  value: valueInput,
  onChange,
  min,
  max,
  range: rangeInput = false,
  weekStartsOn = 1,
  locale = "fr-FR",
  month: monthInput,
  onMonthChange,
  className,
  previousMonthLabel,
  nextMonthLabel,
  ...rest
}: CalendarProps) {
  const value = useValue(valueInput);
  const month = useValue(monthInput);
  const range = useValue(rangeInput) ?? false;
  const [activeValue, setCurrent] = useControlled<CalendarValue>(value, value ?? null, onChange);

  const isFr = (locale ?? "fr-FR").toLowerCase().startsWith("fr");
  const resolvedPrevLabel = previousMonthLabel ?? (isFr ? "Mois précédent" : "Previous month");
  const resolvedNextLabel = nextMonthLabel ?? (isFr ? "Mois suivant" : "Next month");

  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }),
    [locale],
  );
  const weekdayFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "short" }), [locale]);
  const cellFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }),
    [locale],
  );

  const single = range ? null : calParseISO(activeValue as string | null);
  const rangeStart = range && Array.isArray(activeValue) ? calParseISO(activeValue[0]) : null;
  const rangeEnd = range && Array.isArray(activeValue) ? calParseISO(activeValue[1]) : null;

  function pickInitialMonth(): Date {
    const parsed = calParseISO(month ? `${month}-01` : undefined);
    if (parsed) return parsed;
    if (!range && single) return single;
    if (range && rangeStart) return rangeStart;
    return calStartOfDay(new Date());
  }
  const initial = useRef(pickInitialMonth());
  const [viewYear, setViewYear] = useState(initial.current.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.current.getMonth());

  // Resynchronise the displayed month when the `month` prop changes.
  useEffect(() => {
    const parsed = calParseISO(month ? `${month}-01` : undefined);
    if (parsed) {
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
  }, [month]);

  const today = useMemo(() => calStartOfDay(new Date()), []);

  const weekdayLabels = useMemo(() => {
    // 2024-01-07 is a Sunday: enumerate then rotate per weekStartsOn.
    const sample = new Date(Date.UTC(2024, 0, 7));
    const labels: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sample);
      d.setUTCDate(sample.getUTCDate() + i);
      labels.push(weekdayFormatter.format(d));
    }
    return [...labels.slice(weekStartsOn), ...labels.slice(0, weekStartsOn)];
  }, [weekdayFormatter, weekStartsOn]);

  const grid = useMemo<Array<{ date: Date; inMonth: boolean }>>(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const firstDayIdx = first.getDay();
    const offset = (firstDayIdx - weekStartsOn + 7) % 7;
    const start = new Date(viewYear, viewMonth, 1 - offset);
    const cells: Array<{ date: Date; inMonth: boolean }> = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push({ date: calStartOfDay(d), inMonth: d.getMonth() === viewMonth });
    }
    return cells;
  }, [viewYear, viewMonth, weekStartsOn]);

  const minDate = useMemo(() => calParseISO(min), [min]);
  const maxDate = useMemo(() => calParseISO(max), [max]);

  function isOutOfBounds(date: Date): boolean {
    const d = calStartOfDay(date).getTime();
    if (minDate && d < minDate.getTime()) return true;
    if (maxDate && d > maxDate.getTime()) return true;
    return false;
  }
  function isSelected(date: Date): boolean {
    if (!range) return calIsSameDay(single, date);
    return calIsSameDay(rangeStart, date) || calIsSameDay(rangeEnd, date);
  }
  function isInRange(date: Date): boolean {
    if (!range || !rangeStart || !rangeEnd) return false;
    const d = calStartOfDay(date).getTime();
    return d > rangeStart.getTime() && d < rangeEnd.getTime();
  }

  // --- Roving tabindex: active date in the grid -------------------------
  // INVARIANT: focusDate is always in the displayed month AND non-disabled.
  function calClampToMonth(preferred: Date, y: number, m: number): Date | null {
    if (
      preferred.getFullYear() === y &&
      preferred.getMonth() === m &&
      !isOutOfBounds(preferred)
    ) {
      return preferred;
    }
    // Look for the selected day in this month first.
    const sel = !range ? single : rangeStart;
    if (sel && sel.getFullYear() === y && sel.getMonth() === m && !isOutOfBounds(sel)) {
      return sel;
    }
    const lastDay = new Date(y, m + 1, 0).getDate();
    for (let dd = 1; dd <= lastDay; dd++) {
      const candidate = calStartOfDay(new Date(y, m, dd));
      if (!isOutOfBounds(candidate)) return candidate;
    }
    return null;
  }

  function calInitialFocusDate(): Date {
    const sel = !range ? single : rangeStart;
    if (sel && sel.getFullYear() === viewYear && sel.getMonth() === viewMonth && !isOutOfBounds(sel)) {
      return sel;
    }
    const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();
    for (let dd = 1; dd <= lastDay; dd++) {
      const candidate = calStartOfDay(new Date(viewYear, viewMonth, dd));
      if (!isOutOfBounds(candidate)) return candidate;
    }
    return calStartOfDay(new Date(viewYear, viewMonth, 1));
  }

  const [focusDate, setFocusDate] = useState<Date>(calInitialFocusDate);
  const gridRef = useRef<HTMLDivElement>(null);

  // Resynchronise focusDate when viewYear/viewMonth change.
  // Uses refs to avoid circular dependencies in the effect.
  const isOutOfBoundsRef = useRef(isOutOfBounds);
  isOutOfBoundsRef.current = isOutOfBounds;
  const calClampToMonthRef = useRef(calClampToMonth);
  calClampToMonthRef.current = calClampToMonth;

  useEffect(() => {
    setFocusDate((prev) => {
      const clamped = calClampToMonthRef.current(prev, viewYear, viewMonth);
      return clamped ?? prev;
    });
  }, [viewYear, viewMonth]);

  function focusActiveCell() {
    const gridEl = gridRef.current;
    if (!gridEl) return;
    const iso = calToISO(focusDate);
    const btn = gridEl.querySelector<HTMLElement>(`[data-date="${iso}"]`);
    btn?.focus();
  }

  function monthId(year: number, m: number): string {
    return `${year}-${String(m + 1).padStart(2, "0")}`;
  }

  function moveFocus(deltaDays: number) {
    const next = calStartOfDay(new Date(focusDate));
    next.setDate(next.getDate() + deltaDays);
    let nextYear = viewYear;
    let nextMonth = viewMonth;
    if (next.getFullYear() !== viewYear || next.getMonth() !== viewMonth) {
      nextYear = next.getFullYear();
      nextMonth = next.getMonth();
      onMonthChange?.(monthId(nextYear, nextMonth));
      if (nextMonth > viewMonth || nextYear > viewYear) {
        // Next month
        if (viewMonth === 11) {
          setViewMonth(0);
          setViewYear((y) => y + 1);
        } else {
          setViewMonth((m) => m + 1);
        }
      } else {
        // Previous month
        if (viewMonth === 0) {
          setViewMonth(11);
          setViewYear((y) => y - 1);
        } else {
          setViewMonth((m) => m - 1);
        }
      }
    }
    setFocusDate(next);
    setTimeout(focusActiveCell, 0);
  }

  function previousMonth() {
    const targetMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const targetYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    setViewMonth(targetMonth);
    setViewYear(targetYear);
    onMonthChange?.(monthId(targetYear, targetMonth));
    // focusDate will be re-clamped by the viewYear/viewMonth effect
  }

  function nextMonth() {
    const targetMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const targetYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    setViewMonth(targetMonth);
    setViewYear(targetYear);
    onMonthChange?.(monthId(targetYear, targetMonth));
  }

  function pickDate(date: Date) {
    if (isOutOfBounds(date)) return;
    const picked = calStartOfDay(date);
    const iso = calToISO(picked);
    if (!range) {
      setCurrent(iso);
      return;
    }
    // Range mode: (re)start when there is no start, when the range is already
    // complete, or when the date is before the current start.
    if (!rangeStart || (rangeStart && rangeEnd) || picked.getTime() < rangeStart.getTime()) {
      setCurrent([iso, null]);
      return;
    }
    setCurrent([calToISO(rangeStart), iso]);
  }

  function onKeyDown(event: TargetedKeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        moveFocus(-1);
        break;
      case "ArrowRight":
        event.preventDefault();
        moveFocus(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveFocus(-7);
        break;
      case "ArrowDown":
        event.preventDefault();
        moveFocus(7);
        break;
      case "Home": {
        event.preventDefault();
        const dayOfWeek = focusDate.getDay();
        const offset = (dayOfWeek - weekStartsOn + 7) % 7;
        moveFocus(-offset);
        break;
      }
      case "End": {
        event.preventDefault();
        const dayOfWeek = focusDate.getDay();
        const offset = 6 - ((dayOfWeek - weekStartsOn + 7) % 7);
        moveFocus(offset);
        break;
      }
      case "PageUp": {
        event.preventDefault();
        const puDay = focusDate.getDate();
        const puTargetMonth = viewMonth === 0 ? 11 : viewMonth - 1;
        const puTargetYear = viewMonth === 0 ? viewYear - 1 : viewYear;
        const puLastDay = new Date(puTargetYear, puTargetMonth + 1, 0).getDate();
        const puNext = calStartOfDay(new Date(puTargetYear, puTargetMonth, Math.min(puDay, puLastDay)));
        setFocusDate(puNext);
        previousMonth();
        setTimeout(focusActiveCell, 0);
        break;
      }
      case "PageDown": {
        event.preventDefault();
        const pdDay = focusDate.getDate();
        const pdTargetMonth = viewMonth === 11 ? 0 : viewMonth + 1;
        const pdTargetYear = viewMonth === 11 ? viewYear + 1 : viewYear;
        const pdLastDay = new Date(pdTargetYear, pdTargetMonth + 1, 0).getDate();
        const pdNext = calStartOfDay(new Date(pdTargetYear, pdTargetMonth, Math.min(pdDay, pdLastDay)));
        setFocusDate(pdNext);
        nextMonth();
        setTimeout(focusActiveCell, 0);
        break;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        if (!isOutOfBounds(focusDate)) pickDate(focusDate);
        break;
      }
    }
  }

  const monthLabel = monthFormatter.format(new Date(viewYear, viewMonth, 1));

  return (
    <div className={classNames("st-calendar", className)} {...rest}>
      <div className="st-calendar__nav">
        <button type="button" className="st-calendar__navBtn" aria-label={resolvedPrevLabel} onClick={previousMonth}>
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <span className="st-calendar__monthLabel" aria-live="polite">
          {monthLabel}
        </span>
        <button type="button" className="st-calendar__navBtn" aria-label={resolvedNextLabel} onClick={nextMonth}>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
      <div
        ref={gridRef}
        className="st-calendar__grid"
        role="grid"
        aria-label={monthLabel}
        onKeyDown={onKeyDown}
      >
        <div className="st-calendar__weekdays" role="row">
          {weekdayLabels.map((wd, i) => (
            <span key={`${wd}-${i}`} className="st-calendar__weekday" role="columnheader">
              {wd}
            </span>
          ))}
        </div>
        <div className="st-calendar__days">
          {Array.from({ length: 6 }, (_, rowIdx) => (
            <div key={rowIdx} className="st-calendar__week" role="row">
              {grid.slice(rowIdx * 7, rowIdx * 7 + 7).map((cell, colIdx) => {
                const oob = isOutOfBounds(cell.date);
                const selected = isSelected(cell.date);
                const inRange = isInRange(cell.date);
                const isToday = calIsSameDay(cell.date, today);
                const isActive = calIsSameDay(cell.date, focusDate);
                return (
                  <button
                    key={rowIdx * 7 + colIdx}
                    type="button"
                    className={classNames(
                      "st-calendar__day",
                      !cell.inMonth && "st-calendar__day--outside",
                      selected && "st-calendar__day--selected",
                      inRange && "st-calendar__day--inRange",
                      isToday && "st-calendar__day--today",
                    )}
                    role="gridcell"
                    aria-label={cellFormatter.format(cell.date)}
                    aria-selected={selected ? "true" : "false"}
                    aria-current={isToday ? "date" : undefined}
                    aria-disabled={oob ? "true" : undefined}
                    disabled={oob}
                    tabIndex={isActive && !oob ? 0 : -1}
                    data-date={calToISO(cell.date)}
                    onClick={() => {
                      setFocusDate(calStartOfDay(cell.date));
                      pickDate(cell.date);
                    }}
                  >
                    {cell.date.getDate()}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import type { HTMLAttributes } from "preact";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import { text, useControlled, useOutsideMouseDown } from "./internal.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type DatePickerRange = { start: Date | null; end: Date | null }
export type DatePickerValue = Date | DatePickerRange | null;

export type DatePickerProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> & {
  label?: ComponentChildren;
  helperText?: ComponentChildren;
  errorText?: ComponentChildren;
  invalid?: MaybeSignal<boolean>;
  disabled?: boolean;
  mode?: "single" | "range";
  /** Controlled value (`Date | {start,end} | null`). */
  value?: MaybeSignal<DatePickerValue>;
  /** Uncontrolled initial value when `value` is omitted. */
  defaultValue?: DatePickerValue;
  /** Emitted on every selection with the canonical value payload. */
  onChange?: (value: DatePickerValue) => void;
  min?: Date;
  max?: Date;
  locale?: string;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  id?: string;
  openLabel?: string;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
  todayLabel?: string;
};

function dpStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dpIsSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dpIsRange(value: DatePickerValue): value is DatePickerRange {
  return value !== null && typeof value === "object" && !(value instanceof Date) && "start" in value;
}

function dpFirstDayOfWeek(locale: string): number {
  try {
    // @ts-expect-error: weekInfo is recent and not in all TS lib versions.
    const info = new Intl.Locale(locale).weekInfo;
    if (info && typeof info.firstDay === "number") {
      return info.firstDay === 7 ? 0 : info.firstDay;
    }
  } catch {
    // Ignore — fall back below.
  }
  return locale.toLowerCase().startsWith("en-us") ? 0 : 1;
}

export function DatePicker({
  label,
  helperText,
  errorText,
  invalid: invalidInput = false,
  disabled = false,
  mode = "single",
  value: valueInput,
  defaultValue,
  onChange,
  min,
  max,
  locale = "fr-FR",
  placeholder,
  size = "md",
  id,
  openLabel,
  previousMonthLabel,
  nextMonthLabel,
  todayLabel,
  className,
  ...rest
}: DatePickerProps) {
  const reactId = useId();
  const fieldId = id ?? `st-datepicker-${reactId}`;
  const invalid = useValue(invalidInput);
  const isFr = (locale ?? "fr-FR").toLowerCase().startsWith("fr");

  const resolvedOpenLabel = openLabel ?? (isFr ? "Ouvrir le calendrier" : "Open calendar");
  const resolvedPrevLabel = previousMonthLabel ?? (isFr ? "Mois précédent" : "Previous month");
  const resolvedNextLabel = nextMonthLabel ?? (isFr ? "Mois suivant" : "Next month");
  const resolvedTodayLabel = todayLabel ?? (isFr ? "Aujourd'hui" : "Today");
  const resolvedPlaceholder =
    placeholder ??
    (isFr
      ? mode === "range"
        ? "jj/mm/aaaa - jj/mm/aaaa"
        : "jj/mm/aaaa"
      : mode === "range"
        ? "mm/dd/yyyy - mm/dd/yyyy"
        : "mm/dd/yyyy");

  const emptyValue: DatePickerValue = mode === "range" ? { start: null, end: null } : null;
  const value = useValue(valueInput);
  const [current, setCurrent] = useControlled<DatePickerValue>(value, defaultValue ?? emptyValue, onChange);
  const [open, setOpen] = useState(false);

  const hostRef = useRef<HTMLDivElement>(null);
  useOutsideMouseDown(open, hostRef, useCallback(() => setOpen(false), []));

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" }),
    [locale],
  );
  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }),
    [locale],
  );
  const weekdayFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "short" }), [locale]);
  const cellFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }),
    [locale],
  );

  const pickInitialMonth = useCallback((): Date => {
    if (mode === "single" && current instanceof Date) return dpStartOfDay(current);
    if (dpIsRange(current) && current.start) return dpStartOfDay(current.start);
    return dpStartOfDay(new Date());
  }, [mode, current]);

  const [view, setView] = useState<{ year: number; month: number }>(() => {
    const initial = pickInitialMonth();
    return { year: initial.getFullYear(), month: initial.getMonth() }
  });

  // Re-sync the visible month when the calendar reopens.
  useEffect(() => {
    if (!open) return;
    const initial = pickInitialMonth();
    setView({ year: initial.getFullYear(), month: initial.getMonth() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const weekStart = dpFirstDayOfWeek(locale);

  const weekdayLabels = useMemo(() => {
    const sample = new Date(Date.UTC(2024, 0, 7)); // a Sunday
    const labels: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sample);
      d.setUTCDate(sample.getUTCDate() + i);
      labels.push(weekdayFormatter.format(d));
    }
    return [...labels.slice(weekStart), ...labels.slice(0, weekStart)];
  }, [weekdayFormatter, weekStart]);

  const grid = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const offset = (first.getDay() - weekStart + 7) % 7;
    const start = new Date(view.year, view.month, 1 - offset);
    const cells: Array<{ date: Date; inMonth: boolean }> = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push({ date: dpStartOfDay(d), inMonth: d.getMonth() === view.month });
    }
    return cells;
  }, [view.year, view.month, weekStart]);

  const isOutOfBounds = (date: Date): boolean => {
    const d = dpStartOfDay(date).getTime();
    if (min && d < dpStartOfDay(min).getTime()) return true;
    if (max && d > dpStartOfDay(max).getTime()) return true;
    return false;
  }

  const isSelected = (date: Date): boolean => {
    if (mode === "single") return current instanceof Date && dpIsSameDay(current, date);
    if (dpIsRange(current)) return dpIsSameDay(current.start, date) || dpIsSameDay(current.end, date);
    return false;
  }

  const isInRange = (date: Date): boolean => {
    if (mode !== "range" || !dpIsRange(current)) return false;
    const { start, end } = current;
    if (!start || !end) return false;
    const d = dpStartOfDay(date).getTime();
    return d > dpStartOfDay(start).getTime() && d < dpStartOfDay(end).getTime();
  }

  const previousMonth = () =>
    setView((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 }));
  const nextMonth = () =>
    setView((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 }));

  const pickDate = (date: Date) => {
    if (isOutOfBounds(date)) return;
    const picked = dpStartOfDay(date);
    if (mode === "single") {
      setCurrent(picked);
      setOpen(false);
      return;
    }
    const range = dpIsRange(current) ? current : { start: null, end: null }
    if (!range.start || (range.start && range.end)) {
      setCurrent({ start: picked, end: null });
      return;
    }
    if (picked.getTime() < dpStartOfDay(range.start).getTime()) {
      setCurrent({ start: picked, end: null });
      return;
    }
    setCurrent({ start: range.start, end: picked });
    setOpen(false);
  }

  const formattedValue = (): string => {
    if (mode === "single") return current instanceof Date ? dateFormatter.format(current) : "";
    if (dpIsRange(current)) {
      const s = current.start ? dateFormatter.format(current.start) : "";
      const e = current.end ? dateFormatter.format(current.end) : "";
      if (!s && !e) return "";
      return `${s} - ${e}`;
    }
    return "";
  }

  const isInvalid = invalid || Boolean(errorText);
  const monthLabel = monthFormatter.format(new Date(view.year, view.month, 1));
  const toggleOpen = () => {
    if (disabled) return;
    setOpen((o) => !o);
  }

  return (
    <div {...rest} ref={hostRef} className={classNames("st-field", className)}>
      <label className="st-field__control" htmlFor={fieldId}>
        {label ? <span className="st-field__label">{label}</span> : null}
        <span className={classNames("st-datepicker", `st-datepicker--${size}`)}>
          <input
            id={fieldId}
            type="text"
            readOnly
            className="st-datepicker__control"
            value={formattedValue()}
            placeholder={resolvedPlaceholder}
            disabled={disabled}
            aria-invalid={isInvalid ? "true" : undefined}
            onClick={toggleOpen}
          />
          <button
            type="button"
            className="st-datepicker__trigger"
            aria-label={resolvedOpenLabel}
            aria-haspopup="dialog"
            aria-expanded={open ? "true" : "false"}
            disabled={disabled}
            onClick={toggleOpen}
          >
            <span aria-hidden="true">📅</span>
          </button>
        </span>
      </label>
      {open ? (
        <div
          className="st-datepicker__panel"
          role="dialog"
          tabIndex={-1}
          aria-label={text(label) || resolvedOpenLabel}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
            }
          }}
        >
          <div className="st-datepicker__nav">
            <button type="button" className="st-datepicker__navBtn" aria-label={resolvedPrevLabel} onClick={previousMonth}>
              <span aria-hidden="true">‹</span>
            </button>
            <span className="st-datepicker__monthLabel" aria-live="polite">
              {monthLabel}
            </span>
            <button type="button" className="st-datepicker__navBtn" aria-label={resolvedNextLabel} onClick={nextMonth}>
              <span aria-hidden="true">›</span>
            </button>
          </div>
          <div className="st-datepicker__grid" role="grid">
            <div className="st-datepicker__weekdays" role="row">
              {weekdayLabels.map((wd, i) => (
                <span key={`${wd}-${i}`} className="st-datepicker__weekday" role="columnheader">
                  {wd}
                </span>
              ))}
            </div>
            <div className="st-datepicker__days">
              {grid.map((cell, i) => {
                const oob = isOutOfBounds(cell.date);
                const selected = isSelected(cell.date);
                const inRange = isInRange(cell.date);
                return (
                  <button
                    key={i}
                    type="button"
                    className={classNames(
                      "st-datepicker__day",
                      !cell.inMonth && "st-datepicker__day--outside",
                      selected && "st-datepicker__day--selected",
                      inRange && "st-datepicker__day--inRange",
                    )}
                    aria-label={cellFormatter.format(cell.date)}
                    aria-pressed={selected ? "true" : "false"}
                    aria-disabled={oob ? "true" : undefined}
                    disabled={oob}
                    onClick={() => pickDate(cell.date)}
                  >
                    {cell.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="st-datepicker__footer">
            <button
              type="button"
              className="st-datepicker__todayBtn"
              onClick={() => pickDate(new Date())}
              disabled={isOutOfBounds(new Date())}
            >
              {resolvedTodayLabel}
            </button>
          </div>
        </div>
      ) : null}
      {errorText ? (
        <span className="st-field__error">{errorText}</span>
      ) : helperText ? (
        <span className="st-field__help">{helperText}</span>
      ) : null}
    </div>
  );
}

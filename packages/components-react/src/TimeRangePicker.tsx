import React from "react";
import { Clock, ChevronDown } from "lucide-react";
import { classNames } from "./classNames.js";
import { MenuPopover, ContentSwitcher, Calendar, TimePicker, type CalendarValue, type TimePickerFormat } from "./catalog.js";
import { SelectableList } from "./SelectableList.js";
import { SelectableRow } from "./SelectableRow.js";
import { Input } from "./Input.js";
import { Button } from "./Button.js";
import {
  DEFAULT_TIME_RANGE_PRESETS,
  parsePresetMs,
  resolveRelative,
  splitAbsolute,
  composeAbsolute,
  formatTriggerLabel as defaultFormatTriggerLabel,
  formatPresetLabel as defaultFormatPresetLabel,
  type TimeRange,
  type TimeRangeMode,
  type TimeRangePreset
} from "./timeRange.js";

// TimeRangePicker — composes EXISTING DS primitives (MenuPopover,
// ContentSwitcher, SelectableList/SelectableRow, Calendar, TimePicker, Input,
// Button); no new low-level control is introduced. The trigger is bespoke
// (there is no generic "field trigger button" primitive). The React
// MenuPopover primitive is a plain, always-mounted display shell — unlike the
// Svelte MenuPopover it does NOT own its open/close lifecycle (no
// Escape/outside-click handling of its own) and does NOT trap or return
// focus. This component therefore owns open state itself and is rendered
// conditionally (`{open && <MenuPopover>...}`) so no `[role="dialog"]` node
// exists while closed; Escape, outside-pointerdown, Tab-trap and focus-return
// to the trigger are all implemented here, mirroring TimeRangePicker.svelte's
// own focus-trap addition (Modal.svelte's trapFocus pattern) but going one
// step further to also cover Escape/outside-click since the React primitive
// doesn't provide them.

export type TimeRangePickerProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> & {
  /** Controlled value. Omit to let the component manage its own state. */
  value?: TimeRange;
  /** Uncontrolled initial value. Defaults to a resolved "30m" relative range. */
  defaultValue?: TimeRange;
  /** Fired with the resolved value on every preset click or Apply. */
  onChange?: (value: TimeRange) => void;
  presets?: TimeRangePreset[];
  min?: number;
  max?: number;
  locale?: string;
  timeFormat?: TimePickerFormat;
  timeStep?: number;
  calendarMonths?: 1 | 2;
  disabled?: boolean;
  label?: string;
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  align?: "start" | "end" | "center";
  size?: "sm" | "md" | "lg";
  formatRange?: (value: TimeRange, locale: string) => string;
  formatPresetLabel?: (token: string, locale: string) => string;
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

function isFrLocale(locale: string | undefined): boolean {
  return (locale ?? "fr-FR").toLowerCase().startsWith("fr");
}

function computeDefaultValue(defaultValue: TimeRange | undefined, min?: number, max?: number): TimeRange {
  if (defaultValue) return defaultValue;
  const now = Date.now();
  const resolved = resolveRelative("30m", now, { min, max });
  return resolved ?? { mode: "relative", relative: "30m", from: now - 30 * 60_000, to: now };
}

function monthOf(iso: string, offsetMonths: number): string {
  const [y, m] = iso.split("-").map(Number);
  const d = new Date(y, m - 1 + offsetMonths, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function parseDateTimeText(text: string): { date: string; time: string } | null {
  const match = /^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}:\d{2})$/.exec(text.trim());
  if (!match) return null;
  return { date: match[1], time: match[2] };
}

type Draft = { fromDate: string; fromTime: string; toDate: string; toTime: string; fromText: string; toText: string };

function draftFromValue(value: TimeRange): Draft {
  const split = splitAbsolute(value.from, value.to);
  return {
    fromDate: split.fromDate,
    fromTime: split.fromTime,
    toDate: split.toDate,
    toTime: split.toTime,
    fromText: `${split.fromDate} ${split.fromTime}`,
    toText: `${split.toDate} ${split.toTime}`
  };
}

const emptyDraft: Draft = { fromDate: "", fromTime: "", toDate: "", toTime: "", fromText: "", toText: "" };

/**
 * New-Relic-style time range selector. Trigger button showing the current
 * range opens a popover with two tabs — Relative (preset list, click
 * resolves + emits + closes immediately) and Custom (absolute range editor,
 * STAGED behind Apply — nothing emits until Apply; Cancel/Esc/outside-click
 * discard without emitting). LAYOUT: no left rail inside the popover
 * (proscribed DS anti-pattern) — a top ContentSwitcher over a single stacked
 * column.
 */
export function TimeRangePicker({
  value,
  defaultValue,
  onChange,
  presets = DEFAULT_TIME_RANGE_PRESETS,
  min,
  max,
  locale = "fr-FR",
  timeFormat = "24",
  timeStep = 15,
  calendarMonths = 2,
  disabled = false,
  label,
  placement = "bottom-start",
  align,
  size = "md",
  className,
  formatRange,
  formatPresetLabel: formatPresetLabelProp,
  ...rest
}: TimeRangePickerProps) {
  const isFr = isFrLocale(locale);
  const reactId = React.useId();
  const fieldLabelId = `st-timerangepicker-label-${reactId}`;
  const triggerTextId = `st-timerangepicker-text-${reactId}`;

  // Controlled/uncontrolled: mirrors DatePicker's pattern — `value` is the
  // source of truth when the consumer supplies it; otherwise an internal
  // state variable (seeded once, lazily) takes over.
  const [internalValue, setInternalValue] = React.useState<TimeRange>(() =>
    computeDefaultValue(defaultValue, min, max)
  );
  const isControlled = value !== undefined;
  const current = isControlled ? (value as TimeRange) : internalValue;

  function commit(next: TimeRange) {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  }

  const triggerLabel = formatRange ? formatRange(current, locale) : defaultFormatTriggerLabel(current, locale);

  function resolvePresetLabel(token: string): string {
    return formatPresetLabelProp ? formatPresetLabelProp(token, locale) : defaultFormatPresetLabel(token, locale);
  }

  /** Resolves ONE preset entry (string or {token,durationMs}) against `now`. */
  function resolvePresetEntry(preset: TimeRangePreset, now: number): TimeRange | null {
    const token = typeof preset === "string" ? preset : preset.token;
    const durationMs = typeof preset === "string" ? parsePresetMs(token) : (preset.durationMs ?? parsePresetMs(token));
    if (durationMs == null) return null;
    let to = now;
    let from = now - durationMs;
    if (max != null) to = Math.min(to, max);
    if (min != null) from = Math.max(from, min);
    if (from > to) return null;
    return { mode: "relative", relative: token, from, to };
  }

  const resolvedPresets = presets.map((p) => {
    const now = Date.now();
    const token = typeof p === "string" ? p : p.token;
    const customLabel = typeof p === "string" ? undefined : p.label;
    const rowLabel = customLabel ?? resolvePresetLabel(token);
    const resolved = resolvePresetEntry(p, now);
    return { token, label: rowLabel, disabled: resolved === null };
  });

  const selectedPresetValue: string | null = current.mode === "relative" ? (current.relative ?? null) : null;

  function onPresetSelect(next: string | string[] | null) {
    // SelectableList is single-select here, so `next` is always a string or
    // null in practice; the wider union is only SelectableList's shared
    // onChange contract (it also serves `multiple` lists).
    const nextToken = Array.isArray(next) ? (next[0] ?? null) : next;
    // SelectableList (single-select) toggles OFF when re-activating the row
    // that is already selected, emitting null. Re-clicking the currently
    // active preset is exactly that case here (we seed selection from
    // `current`), and it must still resolve+close (refresh "now") rather than
    // no-op — recover the token from the current value.
    const token = nextToken ?? (current.mode === "relative" ? current.relative : undefined);
    if (!token) return;
    const preset = presets.find((p) => (typeof p === "string" ? p : p.token) === token) ?? token;
    const resolved = resolvePresetEntry(preset, Date.now());
    if (!resolved) return;
    commit(resolved);
    setOpen(false);
  }

  // --- Panel open state + focus management ----------------------------------
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<TimeRangeMode>("relative");
  const [leftMonth, setLeftMonth] = React.useState("");
  const [rightMonth, setRightMonth] = React.useState("");
  const [draft, setDraft] = React.useState<Draft>(emptyDraft);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  function focusFirstInPanel() {
    const root = panelRef.current;
    if (!root) return;
    const focusable = root.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (focusable ?? root).focus();
  }

  // Open transition: seed the tab + draft from the current value, capture the
  // element to restore focus to, then move focus into the panel. Close
  // transition: restore focus to whatever had it before opening (the trigger,
  // in the overwhelming majority of cases). This effect intentionally depends
  // ONLY on `open` — `current` is read from the render that flipped `open` to
  // true, so a controlled `value` change while the panel stays open does NOT
  // clobber in-progress edits (mirrors the Svelte version's `untrack`).
  React.useEffect(() => {
    if (open) {
      setActiveTab(current.mode);
      setDraft(draftFromValue(current));
      const split = splitAbsolute(current.from, current.to);
      setLeftMonth(monthOf(split.fromDate, 0));
      setRightMonth(monthOf(split.fromDate, 1));
      previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      focusFirstInPanel();
    } else {
      const el = previousFocusRef.current;
      previousFocusRef.current = null;
      el?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Escape closes without emitting; Tab is trapped inside the panel while
  // open. WINDOW-scoped (mirrors Modal.svelte's own trapFocus wiring), not an
  // onKeyDown handler on a specific div.
  React.useEffect(() => {
    if (!open) return;
    function onWindowKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const root = panelRef.current;
      if (!root) return;
      const focusable = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (!root.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onWindowKeyDown);
    return () => window.removeEventListener("keydown", onWindowKeyDown);
  }, [open]);

  // An outside pointerdown (anywhere outside the whole widget — trigger
  // included) closes the panel without emitting.
  React.useEffect(() => {
    if (!open) return;
    function onWindowPointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (target && rootRef.current && !rootRef.current.contains(target)) setOpen(false);
    }
    window.addEventListener("pointerdown", onWindowPointerDown);
    return () => window.removeEventListener("pointerdown", onWindowPointerDown);
  }, [open]);

  function toggle() {
    if (disabled) return;
    setOpen((o) => !o);
  }

  function onCalendarChange(next: CalendarValue) {
    if (!Array.isArray(next)) return;
    const [startIso, endIso] = next;
    setDraft((prev) => {
      const fromDate = startIso ?? "";
      const toDate = endIso ?? "";
      return {
        ...prev,
        fromDate,
        toDate,
        fromText: fromDate ? `${fromDate} ${prev.fromTime || "00:00"}` : "",
        toText: toDate ? `${toDate} ${prev.toTime || "00:00"}` : ""
      };
    });
  }

  const calendarValue: CalendarValue = [draft.fromDate || null, draft.toDate || null];
  const calendarMinIso = min != null ? splitAbsolute(min, min).fromDate : undefined;
  const calendarMaxIso = max != null ? splitAbsolute(max, max).fromDate : undefined;

  function onFromTimeChange(v: string) {
    setDraft((prev) => ({ ...prev, fromTime: v, fromText: prev.fromDate ? `${prev.fromDate} ${v}` : prev.fromText }));
  }
  function onToTimeChange(v: string) {
    setDraft((prev) => ({ ...prev, toTime: v, toText: prev.toDate ? `${prev.toDate} ${v}` : prev.toText }));
  }

  function commitTypedFrom() {
    setDraft((prev) => {
      const parsed = parseDateTimeText(prev.fromText);
      if (!parsed) return prev;
      return { ...prev, fromDate: parsed.date, fromTime: parsed.time };
    });
  }
  function commitTypedTo() {
    setDraft((prev) => {
      const parsed = parseDateTimeText(prev.toText);
      if (!parsed) return prev;
      return { ...prev, toDate: parsed.date, toTime: parsed.time };
    });
  }
  function onFromTextKeydown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitTypedFrom();
    }
  }
  function onToTextKeydown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitTypedTo();
    }
  }

  const composedDraft = composeAbsolute({
    fromDate: draft.fromDate,
    fromTime: draft.fromTime,
    toDate: draft.toDate,
    toTime: draft.toTime
  });
  const draftValid = composedDraft !== null;
  const draftIncomplete = !draft.fromDate || !draft.fromTime || !draft.toDate || !draft.toTime;
  const draftError: string | null = draftValid
    ? null
    : draftIncomplete
      ? isFr
        ? "Renseignez une date et une heure pour le début et la fin."
        : "Provide a date and time for both the start and the end."
      : isFr
        ? "La date de début doit précéder la date de fin."
        : "The start date must be before the end date.";

  function onApply() {
    if (!composedDraft) return;
    commit({ mode: "absolute", from: composedDraft.from, to: composedDraft.to });
    setOpen(false);
  }
  function onCancel() {
    setOpen(false);
  }

  // --- Labels (fr/en) --------------------------------------------------------
  const panelLabel = label ?? (isFr ? "Sélecteur de plage temporelle" : "Time range selector");
  const relativeTabLabel = isFr ? "Relatif" : "Relative";
  const customTabLabel = isFr ? "Personnalisé" : "Custom";
  const relativeListLabel = isFr ? "Plages relatives" : "Relative ranges";
  const fromLabel = isFr ? "Début" : "From";
  const toLabel = isFr ? "Fin" : "To";
  const applyLabel = isFr ? "Appliquer" : "Apply";
  const cancelLabel = isFr ? "Annuler" : "Cancel";
  const dateTimePlaceholder = "AAAA-MM-JJ HH:mm";

  const tabItems = [
    { value: "relative", label: relativeTabLabel },
    { value: "absolute", label: customTabLabel }
  ];

  function onTabChange(next: string) {
    setActiveTab(next === "absolute" ? "absolute" : "relative");
  }

  const rootClasses = classNames("st-timeRangePicker", `st-timeRangePicker--${size}`, className);
  const alignClass = align === "end" ? "st-menuPopover--alignEnd" : align === "center" ? "st-menuPopover--alignCenter" : undefined;

  return (
    <div {...rest} ref={rootRef} className={rootClasses}>
      {label ? (
        <span className="st-timeRangePicker__label" id={fieldLabelId}>
          {label}
        </span>
      ) : null}
      <button
        ref={triggerRef}
        type="button"
        className="st-timeRangePicker__trigger"
        aria-haspopup="dialog"
        aria-expanded={open ? "true" : "false"}
        aria-labelledby={label ? `${fieldLabelId} ${triggerTextId}` : undefined}
        disabled={disabled}
        onClick={toggle}
      >
        <Clock size={16} aria-hidden="true" />
        <span className="st-timeRangePicker__triggerLabel" id={triggerTextId}>
          {triggerLabel}
        </span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      {open ? (
        <MenuPopover
          label={panelLabel}
          placement={placement}
          className={classNames("st-timeRangePicker__popover", alignClass)}
        >
          <div ref={panelRef} className="st-timeRangePicker__panel" tabIndex={-1}>
            {/* `onchange` (lowercase): ContentSwitcherProps intersects React.HTMLAttributes<HTMLDivElement>,
                which already declares a native `onChange`; passing the Svelte-canonical
                lowercase alias avoids the resulting (string)=>void & ChangeEventHandler
                intersection type clash. */}
            <ContentSwitcher items={tabItems} value={activeTab} onchange={onTabChange} size="sm" aria-label={panelLabel} />

            {activeTab === "relative" ? (
              <SelectableList label={relativeListLabel} value={selectedPresetValue} onChange={onPresetSelect}>
                {resolvedPresets.map((preset) => (
                  <SelectableRow key={preset.token} value={preset.token} disabled={preset.disabled}>
                    {preset.label}
                  </SelectableRow>
                ))}
              </SelectableList>
            ) : (
              <div className="st-timeRangePicker__custom">
                <div className="st-timeRangePicker__calendars">
                  <Calendar
                    range
                    value={calendarValue}
                    onChange={onCalendarChange}
                    min={calendarMinIso}
                    max={calendarMaxIso}
                    locale={locale}
                    month={leftMonth}
                  />
                  {calendarMonths === 2 ? (
                    <Calendar
                      range
                      value={calendarValue}
                      onChange={onCalendarChange}
                      min={calendarMinIso}
                      max={calendarMaxIso}
                      locale={locale}
                      month={rightMonth}
                    />
                  ) : null}
                </div>

                <div className="st-timeRangePicker__bounds">
                  <div className="st-timeRangePicker__bound">
                    <Input
                      label={fromLabel}
                      value={draft.fromText}
                      onChange={(event) => setDraft((prev) => ({ ...prev, fromText: event.target.value }))}
                      placeholder={dateTimePlaceholder}
                      size={size}
                      onBlur={commitTypedFrom}
                      onKeyDown={onFromTextKeydown}
                    />
                    <TimePicker value={draft.fromTime} onChange={onFromTimeChange} step={timeStep} format={timeFormat} size={size} />
                  </div>
                  <div className="st-timeRangePicker__bound">
                    <Input
                      label={toLabel}
                      value={draft.toText}
                      onChange={(event) => setDraft((prev) => ({ ...prev, toText: event.target.value }))}
                      placeholder={dateTimePlaceholder}
                      size={size}
                      onBlur={commitTypedTo}
                      onKeyDown={onToTextKeydown}
                    />
                    <TimePicker value={draft.toTime} onChange={onToTimeChange} step={timeStep} format={timeFormat} size={size} />
                  </div>
                </div>

                {draftError ? (
                  <p className="st-timeRangePicker__error" role="alert">
                    {draftError}
                  </p>
                ) : null}

                <div className="st-timeRangePicker__actions">
                  <Button type="button" variant="ghost" size={size} onClick={onCancel}>
                    {cancelLabel}
                  </Button>
                  <Button type="button" variant="primary" size={size} disabled={!draftValid} onClick={onApply}>
                    {applyLabel}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </MenuPopover>
      ) : null}
    </div>
  );
}

TimeRangePicker.displayName = "TimeRangePicker";

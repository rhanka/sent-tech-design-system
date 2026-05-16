<script lang="ts" module>
  export type DatePickerRange = {
    start: Date | null;
    end: Date | null;
  };
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type DatePickerProps = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    label?: string;
    helperText?: string;
    errorText?: string;
    invalid?: boolean;
    disabled?: boolean;
    mode?: "single" | "range";
    /**
     * Bound value. In `mode="single"` (default) this is `Date | null`. In
     * `mode="range"` this is `DatePickerRange`. The runtime checks `mode` at
     * read/write time so misuse is non-fatal.
     */
    value?: Date | DatePickerRange | null;
    min?: Date;
    max?: Date;
    locale?: string;
    placeholder?: string;
    size?: "sm" | "md" | "lg";
    class?: string;
    id?: string;
    openLabel?: string;
    previousMonthLabel?: string;
    nextMonthLabel?: string;
    todayLabel?: string;
  };

  let {
    label,
    helperText,
    errorText,
    invalid = false,
    disabled = false,
    mode = "single",
    value = $bindable(),
    min,
    max,
    locale = "fr-FR",
    placeholder,
    size = "md",
    class: className,
    id,
    openLabel,
    previousMonthLabel,
    nextMonthLabel,
    todayLabel,
    ...rest
  }: DatePickerProps = $props();

  // Normalize value defaults based on mode (only set if undefined to keep $bindable contract clean).
  // Use a one-shot $effect.pre to satisfy Svelte's state-reactivity warnings around prop reads at init.
  $effect.pre(() => {
    if (value !== undefined) return;
    value = mode === "range" ? { start: null, end: null } : null;
  });

  const isFr = $derived((locale ?? "fr-FR").toLowerCase().startsWith("fr"));

  const resolvedOpenLabel = $derived(openLabel ?? (isFr ? "Ouvrir le calendrier" : "Open calendar"));
  const resolvedPrevLabel = $derived(
    previousMonthLabel ?? (isFr ? "Mois précédent" : "Previous month")
  );
  const resolvedNextLabel = $derived(
    nextMonthLabel ?? (isFr ? "Mois suivant" : "Next month")
  );
  const resolvedTodayLabel = $derived(todayLabel ?? (isFr ? "Aujourd'hui" : "Today"));
  const resolvedPlaceholder = $derived(
    placeholder ?? (isFr ? (mode === "range" ? "jj/mm/aaaa - jj/mm/aaaa" : "jj/mm/aaaa") : mode === "range" ? "mm/dd/yyyy - mm/dd/yyyy" : "mm/dd/yyyy")
  );

  const fieldId = $derived(id ?? `st-datepicker-${Math.random().toString(36).slice(2, 9)}`);

  let open = $state(false);

  const dateFormatter = $derived(
    new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" })
  );
  const monthFormatter = $derived(
    new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" })
  );
  const weekdayFormatter = $derived(new Intl.DateTimeFormat(locale, { weekday: "short" }));
  const cellFormatter = $derived(
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" })
  );

  function startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function pickInitialMonth(): Date {
    if (mode === "single" && value instanceof Date) {
      return startOfDay(value);
    }
    if (mode === "range" && value && typeof value === "object" && "start" in value && value.start) {
      return startOfDay(value.start);
    }
    return startOfDay(new Date());
  }

  let viewYear = $state(pickInitialMonth().getFullYear());
  let viewMonth = $state(pickInitialMonth().getMonth());

  // Re-sync the visible month when the calendar reopens.
  $effect(() => {
    if (open) {
      const initial = pickInitialMonth();
      viewYear = initial.getFullYear();
      viewMonth = initial.getMonth();
    }
  });

  // Locale-aware "first day of week" inference (Mon vs Sun) based on Intl.Locale weekInfo when available.
  function firstDayOfWeek(loc: string): number {
    try {
      // @ts-expect-error: weekInfo is recent and not in all TS lib versions.
      const info = new Intl.Locale(loc).weekInfo;
      if (info && typeof info.firstDay === "number") {
        // Intl uses 1=Mon..7=Sun; JS Date.getDay uses 0=Sun..6=Sat.
        return info.firstDay === 7 ? 0 : info.firstDay;
      }
    } catch {
      // Ignore — fall back below.
    }
    // Fallback: French and most EU locales = Monday.
    return loc.toLowerCase().startsWith("en-us") ? 0 : 1;
  }

  const weekStart = $derived(firstDayOfWeek(locale));

  const weekdayLabels = $derived.by(() => {
    // Build 7 weekday labels rotated to start at weekStart.
    // Use a known week (2024-01-07 is a Sunday) to enumerate Sun..Sat then rotate.
    const sample = new Date(Date.UTC(2024, 0, 7));
    const labels: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sample);
      d.setUTCDate(sample.getUTCDate() + i);
      labels.push(weekdayFormatter.format(d));
    }
    return [...labels.slice(weekStart), ...labels.slice(0, weekStart)];
  });

  type Cell = { date: Date; inMonth: boolean };

  const grid = $derived.by<Cell[]>(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const firstDayIdx = first.getDay();
    const offset = (firstDayIdx - weekStart + 7) % 7;
    const start = new Date(viewYear, viewMonth, 1 - offset);
    const cells: Cell[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push({ date: startOfDay(d), inMonth: d.getMonth() === viewMonth });
    }
    return cells;
  });

  function isOutOfBounds(date: Date): boolean {
    const d = startOfDay(date).getTime();
    if (min && d < startOfDay(min).getTime()) return true;
    if (max && d > startOfDay(max).getTime()) return true;
    return false;
  }

  function isSelected(date: Date): boolean {
    if (mode === "single") {
      return value instanceof Date && isSameDay(value, date);
    }
    if (mode === "range" && value && typeof value === "object" && "start" in value) {
      return isSameDay(value.start, date) || isSameDay(value.end, date);
    }
    return false;
  }

  function isInRange(date: Date): boolean {
    if (mode !== "range") return false;
    if (!value || typeof value !== "object" || !("start" in value)) return false;
    const { start, end } = value;
    if (!start || !end) return false;
    const d = startOfDay(date).getTime();
    return d > startOfDay(start).getTime() && d < startOfDay(end).getTime();
  }

  function previousMonth() {
    if (viewMonth === 0) {
      viewMonth = 11;
      viewYear -= 1;
    } else {
      viewMonth -= 1;
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      viewMonth = 0;
      viewYear += 1;
    } else {
      viewMonth += 1;
    }
  }

  function pickDate(date: Date) {
    if (isOutOfBounds(date)) return;
    const picked = startOfDay(date);
    if (mode === "single") {
      value = picked;
      open = false;
      return;
    }
    // range mode
    const current =
      value && typeof value === "object" && "start" in value
        ? value
        : { start: null, end: null };
    if (!current.start || (current.start && current.end)) {
      // Start a new range.
      value = { start: picked, end: null };
      return;
    }
    if (picked.getTime() < startOfDay(current.start).getTime()) {
      // Reset to a new start when the picked date is before the current start.
      value = { start: picked, end: null };
      return;
    }
    value = { start: current.start, end: picked };
    open = false;
  }

  function pickToday() {
    pickDate(new Date());
  }

  function formattedValue(): string {
    if (mode === "single") {
      return value instanceof Date ? dateFormatter.format(value) : "";
    }
    if (value && typeof value === "object" && "start" in value) {
      const s = value.start ? dateFormatter.format(value.start) : "";
      const e = value.end ? dateFormatter.format(value.end) : "";
      if (!s && !e) return "";
      return `${s} - ${e}`;
    }
    return "";
  }

  const fieldClasses = () => ["st-field", className].filter(Boolean).join(" ");
  const groupClasses = () => ["st-datepicker", `st-datepicker--${size}`].join(" ");
  const isInvalid = () => invalid || Boolean(errorText);

  // Outside-click closes the popover.
  let hostEl = $state<HTMLDivElement | null>(null);

  function onDocumentMouseDown(event: MouseEvent) {
    if (!open) return;
    const target = event.target as Node | null;
    if (hostEl && target && !hostEl.contains(target)) {
      open = false;
    }
  }

  $effect(() => {
    if (typeof document === "undefined") return;
    document.addEventListener("mousedown", onDocumentMouseDown);
    return () => document.removeEventListener("mousedown", onDocumentMouseDown);
  });

  function toggleOpen() {
    if (disabled) return;
    open = !open;
  }

  function onPanelKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      open = false;
    }
  }

  const monthLabel = $derived(
    monthFormatter.format(new Date(viewYear, viewMonth, 1))
  );
</script>

<div class={fieldClasses()} bind:this={hostEl} {...rest}>
  <label class="st-field__control" for={fieldId}>
    {#if label}<span class="st-field__label">{label}</span>{/if}
    <span class={groupClasses()}>
      <input
        id={fieldId}
        type="text"
        readonly
        class="st-datepicker__control"
        value={formattedValue()}
        placeholder={resolvedPlaceholder}
        {disabled}
        aria-invalid={isInvalid() ? "true" : undefined}
        onclick={toggleOpen}
      />
      <button
        type="button"
        class="st-datepicker__trigger"
        aria-label={resolvedOpenLabel}
        aria-haspopup="dialog"
        aria-expanded={open ? "true" : "false"}
        {disabled}
        onclick={toggleOpen}
      >
        <span aria-hidden="true">📅</span>
      </button>
    </span>
  </label>
  {#if open}
    <div
      class="st-datepicker__panel"
      role="dialog"
      tabindex="-1"
      aria-label={label ?? resolvedOpenLabel}
      onkeydown={onPanelKeyDown}
    >
      <div class="st-datepicker__nav">
        <button
          type="button"
          class="st-datepicker__navBtn"
          aria-label={resolvedPrevLabel}
          onclick={previousMonth}
        >
          <span aria-hidden="true">‹</span>
        </button>
        <span class="st-datepicker__monthLabel" aria-live="polite">{monthLabel}</span>
        <button
          type="button"
          class="st-datepicker__navBtn"
          aria-label={resolvedNextLabel}
          onclick={nextMonth}
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
      <div class="st-datepicker__grid" role="grid">
        <div class="st-datepicker__weekdays" role="row">
          {#each weekdayLabels as wd (wd)}
            <span class="st-datepicker__weekday" role="columnheader">{wd}</span>
          {/each}
        </div>
        <div class="st-datepicker__days">
          {#each grid as cell, i (i)}
            {@const oob = isOutOfBounds(cell.date)}
            {@const selected = isSelected(cell.date)}
            {@const inRange = isInRange(cell.date)}
            <button
              type="button"
              class="st-datepicker__day"
              class:st-datepicker__day--outside={!cell.inMonth}
              class:st-datepicker__day--selected={selected}
              class:st-datepicker__day--inRange={inRange}
              aria-label={cellFormatter.format(cell.date)}
              aria-pressed={selected ? "true" : "false"}
              aria-disabled={oob ? "true" : undefined}
              disabled={oob}
              onclick={() => pickDate(cell.date)}
            >
              {cell.date.getDate()}
            </button>
          {/each}
        </div>
      </div>
      <div class="st-datepicker__footer">
        <button
          type="button"
          class="st-datepicker__todayBtn"
          onclick={pickToday}
          disabled={isOutOfBounds(new Date())}
        >
          {resolvedTodayLabel}
        </button>
      </div>
    </div>
  {/if}
  {#if errorText}
    <span class="st-field__error">{errorText}</span>
  {:else if helperText}
    <span class="st-field__help">{helperText}</span>
  {/if}
</div>

<style>
  .st-field {
    color: var(--st-component-field-labelText, var(--st-semantic-text-primary));
    display: grid;
    gap: var(--st-component-field-gap, 0.5rem);
    max-width: var(--st-component-field-maxWidth, 28rem);
    position: relative;
  }

  .st-field__control {
    display: grid;
    gap: var(--st-component-field-gap, 0.5rem);
  }

  .st-field__label {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .st-field__help,
  .st-field__error {
    font-size: 0.8125rem;
    line-height: 1.4;
  }

  .st-field__help {
    color: var(--st-component-field-helpText, var(--st-semantic-text-secondary));
  }

  .st-field__error {
    color: var(--st-component-field-errorText, var(--st-semantic-feedback-error));
  }

  .st-datepicker {
    align-items: stretch;
    background: var(--st-component-control-background, var(--st-semantic-surface-default));
    border: 1px solid var(--st-component-control-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-control-radius, 0.375rem);
    color: var(--st-component-control-text, var(--st-semantic-text-primary));
    display: inline-flex;
    overflow: hidden;
    transition:
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      box-shadow var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: 100%;
  }

  .st-datepicker--sm {
    min-height: var(--st-component-control-smHeight, 2rem);
  }

  .st-datepicker--md {
    min-height: var(--st-component-control-mdHeight, 2.5rem);
  }

  .st-datepicker--lg {
    min-height: var(--st-component-control-lgHeight, 3rem);
  }

  .st-datepicker:hover:not(:has(input:disabled)) {
    border-color: var(--st-component-control-hoverBorder, var(--st-semantic-border-strong));
  }

  .st-datepicker:focus-within {
    border-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    box-shadow: 0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
  }

  .st-datepicker:has([aria-invalid="true"]) {
    border-color: var(--st-component-control-invalidBorder, var(--st-semantic-feedback-error));
  }

  .st-datepicker__control {
    background: transparent;
    border: 0;
    color: inherit;
    cursor: pointer;
    flex: 1 1 auto;
    font: inherit;
    min-width: 0;
    padding: 0 0.75rem;
    width: 100%;
  }

  .st-datepicker__control:focus {
    outline: none;
  }

  .st-datepicker__control::placeholder {
    color: var(--st-component-control-placeholderText, var(--st-semantic-text-muted));
  }

  .st-datepicker__control:disabled {
    color: var(--st-component-control-disabledText, var(--st-semantic-text-muted));
    cursor: not-allowed;
  }

  .st-datepicker__trigger {
    align-items: center;
    background: transparent;
    border: 0;
    border-left: 1px solid var(--st-component-control-border, var(--st-semantic-border-subtle));
    color: var(--st-semantic-text-secondary);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    font: inherit;
    justify-content: center;
    min-width: 2.25rem;
    padding: 0 0.5rem;
    transition: background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-datepicker__trigger:hover:not(:disabled) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-datepicker__trigger:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: -2px;
  }

  .st-datepicker__trigger:disabled {
    cursor: not-allowed;
  }

  .st-datepicker__panel {
    background: var(--st-component-popover-background, var(--st-semantic-surface-raised));
    border: 1px solid var(--st-component-popover-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-popover-radius, 0.5rem);
    box-shadow: var(--st-component-popover-shadow, 0 18px 45px rgb(15 23 42 / 0.18));
    color: var(--st-component-popover-text, var(--st-semantic-text-primary));
    display: grid;
    gap: var(--st-spacing-3, 0.75rem);
    left: 0;
    margin-top: var(--st-spacing-1, 0.25rem);
    min-width: 18rem;
    padding: var(--st-spacing-3, 0.75rem);
    position: absolute;
    top: 100%;
    z-index: var(--st-component-popover-zIndex, 80);
  }

  .st-datepicker__nav {
    align-items: center;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-datepicker__navBtn {
    background: transparent;
    border: 0;
    border-radius: var(--st-component-control-radius, 0.375rem);
    color: inherit;
    cursor: pointer;
    font: inherit;
    font-size: 1.125rem;
    line-height: 1;
    padding: 0.25rem 0.5rem;
  }

  .st-datepicker__navBtn:hover:not(:disabled) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-datepicker__navBtn:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: 2px;
  }

  .st-datepicker__monthLabel {
    font-weight: 600;
    text-align: center;
    text-transform: capitalize;
  }

  .st-datepicker__grid {
    display: grid;
    gap: var(--st-spacing-1, 0.25rem);
  }

  .st-datepicker__weekdays,
  .st-datepicker__days {
    display: grid;
    grid-template-columns: repeat(7, minmax(2rem, 1fr));
    gap: 2px;
  }

  .st-datepicker__weekday {
    color: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0;
    text-align: center;
    text-transform: capitalize;
  }

  .st-datepicker__day {
    aspect-ratio: 1 / 1;
    background: transparent;
    border: 0;
    border-radius: var(--st-component-control-radius, 0.375rem);
    color: inherit;
    cursor: pointer;
    font: inherit;
    font-size: 0.875rem;
    line-height: 1;
    min-width: 0;
    padding: 0;
    text-align: center;
  }

  .st-datepicker__day:hover:not(:disabled) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-datepicker__day:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: -2px;
  }

  .st-datepicker__day--outside {
    color: var(--st-semantic-text-muted);
  }

  .st-datepicker__day--inRange {
    background: var(
      --st-component-dropdown-optionHoverBackground,
      var(--st-semantic-surface-subtle)
    );
  }

  .st-datepicker__day--selected {
    background: var(--st-component-dropdown-selectedBackground, var(--st-semantic-action-primary));
    color: var(--st-component-dropdown-selectedText, var(--st-semantic-action-primaryText));
  }

  .st-datepicker__day:disabled {
    color: var(--st-semantic-text-muted);
    cursor: not-allowed;
    opacity: 0.5;
  }

  .st-datepicker__footer {
    display: flex;
    justify-content: flex-end;
  }

  .st-datepicker__todayBtn {
    background: transparent;
    border: 1px solid var(--st-component-control-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-control-radius, 0.375rem);
    color: inherit;
    cursor: pointer;
    font: inherit;
    font-size: 0.8125rem;
    padding: 0.25rem 0.75rem;
  }

  .st-datepicker__todayBtn:hover:not(:disabled) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-datepicker__todayBtn:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: 2px;
  }

  .st-datepicker__todayBtn:disabled {
    color: var(--st-semantic-text-muted);
    cursor: not-allowed;
  }
</style>

<script module lang="ts">
  // TimeRangePicker — value contract. Kept identical to timeRange.ts's types
  // (re-exported here so consumers can `import type { TimeRange } from
  // "@sentropic/design-system-svelte"` from the component's own module block,
  // matching the Svelte convention used across the library).
  export type TimeRangeMode = "relative" | "absolute";
  export type TimeRange = {
    mode: TimeRangeMode;
    relative?: string;
    from: number;
    to: number;
  };
  export type TimeRangePreset =
    | string
    | { token: string; label?: string; durationMs?: number };
</script>

<script lang="ts">
  // Composes EXISTING DS primitives — no new low-level control is introduced.
  // Trigger is bespoke (there is no generic "field trigger button" primitive);
  // everything else (popover placement/outside-click/Escape, tabs, list,
  // calendar, time-of-day, text input, buttons) is delegated. MenuPopover does
  // NOT trap focus or return it to the trigger on close (see its own docs), so
  // both are added here (mirrors Modal.svelte's trapFocus pattern).
  import { tick, untrack } from "svelte";
  import { Clock, ChevronDown } from "@lucide/svelte";
  import MenuPopover from "./MenuPopover.svelte";
  import ContentSwitcher from "./ContentSwitcher.svelte";
  import SelectableList from "./SelectableList.svelte";
  import SelectableRow from "./SelectableRow.svelte";
  import Calendar from "./Calendar.svelte";
  import type { CalendarValue } from "./Calendar.svelte";
  import TimePicker from "./TimePicker.svelte";
  import Input from "./Input.svelte";
  import Button from "./Button.svelte";
  import {
    DEFAULT_TIME_RANGE_PRESETS,
    parsePresetMs,
    resolveRelative,
    splitAbsolute,
    composeAbsolute,
    formatTriggerLabel as defaultFormatTriggerLabel,
    formatPresetLabel as defaultFormatPresetLabel
  } from "./timeRange";

  type TimeRangePickerProps = {
    value?: TimeRange;
    defaultValue?: TimeRange;
    onChange?: (value: TimeRange) => void;
    presets?: TimeRangePreset[];
    min?: number;
    max?: number;
    locale?: string;
    timeFormat?: "24" | "12";
    timeStep?: number;
    calendarMonths?: 1 | 2;
    disabled?: boolean;
    label?: string;
    placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
    align?: "start" | "end" | "center";
    size?: "sm" | "md" | "lg";
    class?: string;
    formatRange?: (value: TimeRange, locale: string) => string;
    formatPresetLabel?: (token: string, locale: string) => string;
  };

  let {
    value = $bindable(),
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
    class: className,
    formatRange,
    formatPresetLabel: formatPresetLabelProp
  }: TimeRangePickerProps = $props();

  const isFr = $derived((locale ?? "fr-FR").toLowerCase().startsWith("fr"));

  function computeDefaultValue(): TimeRange {
    if (defaultValue) return defaultValue;
    const now = Date.now();
    const resolved = resolveRelative("30m", now, { min, max });
    return resolved ?? { mode: "relative", relative: "30m", from: now - 30 * 60_000, to: now };
  }

  // Controlled/uncontrolled: mirrors DatePicker.svelte — `value` is the single
  // source of truth; when the consumer never sets it, seed it once so the rest
  // of the component can just read `value` directly.
  $effect.pre(() => {
    if (value !== undefined) return;
    value = computeDefaultValue();
  });

  // Guards the (unreachable in practice, but type-safe) first-paint window
  // before the $effect.pre above has committed.
  const current = $derived<TimeRange>(value ?? computeDefaultValue());

  const triggerLabel = $derived(
    formatRange ? formatRange(current, locale) : defaultFormatTriggerLabel(current, locale)
  );

  function resolvePresetLabel(token: string): string {
    return formatPresetLabelProp
      ? formatPresetLabelProp(token, locale)
      : defaultFormatPresetLabel(token, locale);
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

  type NormalizedPreset = { token: string; label: string; disabled: boolean };

  const resolvedPresets = $derived.by<NormalizedPreset[]>(() => {
    const now = Date.now();
    return presets.map((p) => {
      const token = typeof p === "string" ? p : p.token;
      const customLabel = typeof p === "string" ? undefined : p.label;
      const label = customLabel ?? resolvePresetLabel(token);
      const resolved = resolvePresetEntry(p, now);
      return { token, label, disabled: resolved === null };
    });
  });

  const selectedPresetValue = $derived<string | null>(
    current.mode === "relative" ? (current.relative ?? null) : null
  );

  function commit(next: TimeRange) {
    value = next;
    onChange?.(next);
  }

  function onPresetSelect(next: string | string[] | null) {
    // SelectableList is single-select here, so `next` is always a string or
    // null in practice; the wider union is only SelectableList's shared
    // onchange contract (it also serves `multiple` lists).
    const nextToken = Array.isArray(next) ? (next[0] ?? null) : next;
    // SelectableList (single-select) toggles OFF when re-activating the row
    // that is already selected, emitting null. Re-clicking the currently
    // active preset is exactly that case here (we seed `value` as the
    // controlled selection), and it must still resolve+close (refresh "now")
    // rather than no-op — recover the token from the current value.
    const token = nextToken ?? (current.mode === "relative" ? current.relative : undefined);
    if (!token) return;
    const preset = presets.find((p) => (typeof p === "string" ? p : p.token) === token) ?? token;
    const resolved = resolvePresetEntry(preset, Date.now());
    if (!resolved) return;
    commit(resolved);
    panelOpen = false;
  }

  // --- Panel open state + focus management ----------------------------------
  let panelOpen = $state(false);
  let triggerEl = $state<HTMLButtonElement | null>(null);
  let panelWrapperEl = $state<HTMLDivElement | null>(null);
  let activeTab = $state<TimeRangeMode>("relative");

  function monthOf(iso: string, offsetMonths: number): string {
    const [y, m] = iso.split("-").map(Number);
    const d = new Date(y, (m - 1) + offsetMonths, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  let leftMonth = $state<string>("");
  let rightMonth = $state<string>("");

  type Draft = { fromDate: string; fromTime: string; toDate: string; toTime: string; fromText: string; toText: string };

  let draft = $state<Draft>({ fromDate: "", fromTime: "", toDate: "", toTime: "", fromText: "", toText: "" });

  function seedDraft() {
    const split = splitAbsolute(current.from, current.to);
    draft = {
      fromDate: split.fromDate,
      fromTime: split.fromTime,
      toDate: split.toDate,
      toTime: split.toTime,
      fromText: `${split.fromDate} ${split.fromTime}`,
      toText: `${split.toDate} ${split.toTime}`
    };
    leftMonth = monthOf(split.fromDate, 0);
    rightMonth = monthOf(split.fromDate, 1);
  }

  let previousFocus: HTMLElement | null = null;

  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  function focusFirstInPanel() {
    if (!panelWrapperEl) return;
    const focusable = panelWrapperEl.querySelector<HTMLElement>(focusableSelector);
    (focusable ?? panelWrapperEl).focus();
  }

  function trapFocus(event: KeyboardEvent) {
    if (!panelWrapperEl || event.key !== "Tab") return;
    const focusable = Array.from(panelWrapperEl.querySelectorAll<HTMLElement>(focusableSelector));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    const active = document.activeElement;
    if (!panelWrapperEl.contains(active)) {
      event.preventDefault();
      first.focus();
      return;
    }
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // Open transition: seed the tab + draft from the current value, capture the
  // element to restore focus to, then move focus into the panel. Close
  // transition: restore focus to whatever had it before opening (the trigger,
  // in the overwhelming majority of cases). Reads other than `panelOpen` are
  // untracked so a controlled `value` change while the panel stays open does
  // NOT clobber in-progress edits.
  $effect(() => {
    if (panelOpen) {
      untrack(() => {
        activeTab = current.mode;
        seedDraft();
        previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      });
      tick().then(focusFirstInPanel);
    } else {
      const el = previousFocus;
      previousFocus = null;
      if (el) tick().then(() => el.focus());
    }
  });

  function toggle() {
    if (disabled) return;
    panelOpen = !panelOpen;
  }

  // Tab-trap is WINDOW-scoped (mirrors Modal.svelte's own trapFocus wiring) —
  // not an onkeydown handler on a specific div — so it never needs its own
  // ARIA role/tabindex to satisfy the a11y linter for keyboard handlers.
  function onWindowKeydown(event: KeyboardEvent) {
    if (!panelOpen) return;
    trapFocus(event);
  }

  function onCalendarChange(next: CalendarValue) {
    if (!Array.isArray(next)) return;
    const [startIso, endIso] = next;
    draft.fromDate = startIso ?? "";
    draft.toDate = endIso ?? "";
    draft.fromText = draft.fromDate ? `${draft.fromDate} ${draft.fromTime || "00:00"}` : "";
    draft.toText = draft.toDate ? `${draft.toDate} ${draft.toTime || "00:00"}` : "";
  }

  const calendarValue = $derived<CalendarValue>([draft.fromDate || null, draft.toDate || null]);
  const calendarMinIso = $derived(min != null ? splitAbsolute(min, min).fromDate : undefined);
  const calendarMaxIso = $derived(max != null ? splitAbsolute(max, max).fromDate : undefined);

  function onFromTimeChange(v: string) {
    draft.fromTime = v;
    if (draft.fromDate) draft.fromText = `${draft.fromDate} ${v}`;
  }
  function onToTimeChange(v: string) {
    draft.toTime = v;
    if (draft.toDate) draft.toText = `${draft.toDate} ${v}`;
  }

  function parseDateTimeText(text: string): { date: string; time: string } | null {
    const match = /^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}:\d{2})$/.exec(text.trim());
    if (!match) return null;
    return { date: match[1], time: match[2] };
  }

  function commitTypedFrom() {
    const parsed = parseDateTimeText(draft.fromText);
    if (!parsed) return;
    draft.fromDate = parsed.date;
    draft.fromTime = parsed.time;
  }
  function commitTypedTo() {
    const parsed = parseDateTimeText(draft.toText);
    if (!parsed) return;
    draft.toDate = parsed.date;
    draft.toTime = parsed.time;
  }
  function onFromTextKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitTypedFrom();
    }
  }
  function onToTextKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitTypedTo();
    }
  }

  const composedDraft = $derived(
    composeAbsolute({
      fromDate: draft.fromDate,
      fromTime: draft.fromTime,
      toDate: draft.toDate,
      toTime: draft.toTime
    })
  );
  const draftValid = $derived(composedDraft !== null);
  const draftIncomplete = $derived(!draft.fromDate || !draft.fromTime || !draft.toDate || !draft.toTime);
  const draftError = $derived.by<string | null>(() => {
    if (draftValid) return null;
    if (draftIncomplete) {
      return isFr
        ? "Renseignez une date et une heure pour le début et la fin."
        : "Provide a date and time for both the start and the end.";
    }
    return isFr
      ? "La date de début doit précéder la date de fin."
      : "The start date must be before the end date.";
  });

  function onApply() {
    if (!composedDraft) return;
    commit({ mode: "absolute", from: composedDraft.from, to: composedDraft.to });
    panelOpen = false;
  }
  function onCancel() {
    panelOpen = false;
  }

  // --- Labels (fr/en) --------------------------------------------------------
  const panelLabel = $derived(label ?? (isFr ? "Sélecteur de plage temporelle" : "Time range selector"));
  const relativeTabLabel = $derived(isFr ? "Relatif" : "Relative");
  const customTabLabel = $derived(isFr ? "Personnalisé" : "Custom");
  const relativeListLabel = $derived(isFr ? "Plages relatives" : "Relative ranges");
  const fromLabel = $derived(isFr ? "Début" : "From");
  const toLabel = $derived(isFr ? "Fin" : "To");
  const applyLabel = $derived(isFr ? "Appliquer" : "Apply");
  const cancelLabel = $derived(isFr ? "Annuler" : "Cancel");
  const dateTimePlaceholder = "AAAA-MM-JJ HH:mm";

  const tabItems = $derived([
    { value: "relative", label: relativeTabLabel },
    { value: "absolute", label: customTabLabel }
  ]);

  function onTabChange(next: string) {
    activeTab = next === "absolute" ? "absolute" : "relative";
  }

  const rootClasses = $derived(
    ["st-timeRangePicker", `st-timeRangePicker--${size}`, className].filter(Boolean).join(" ")
  );

  const uid = Math.random().toString(36).slice(2, 9);
  const fieldLabelId = `st-timerangepicker-label-${uid}`;
  const triggerTextId = `st-timerangepicker-text-${uid}`;
</script>

<svelte:window onkeydown={onWindowKeydown} />

<div class={rootClasses}>
  {#if label}
    <span class="st-timeRangePicker__label" id={fieldLabelId}>{label}</span>
  {/if}
  <button
    bind:this={triggerEl}
    type="button"
    class="st-timeRangePicker__trigger"
    aria-haspopup="dialog"
    aria-expanded={panelOpen ? "true" : "false"}
    aria-labelledby={label ? `${fieldLabelId} ${triggerTextId}` : undefined}
    {disabled}
    onclick={toggle}
  >
    <Clock size={16} aria-hidden="true" />
    <span class="st-timeRangePicker__triggerLabel" id={triggerTextId}>{triggerLabel}</span>
    <ChevronDown size={16} aria-hidden="true" />
  </button>

  <MenuPopover bind:open={panelOpen} trigger={triggerEl} {placement} {align} label={panelLabel} class="st-timeRangePicker__popover">
    <div
      class="st-timeRangePicker__panel"
      bind:this={panelWrapperEl}
    >
      <ContentSwitcher items={tabItems} value={activeTab} onchange={onTabChange} size="sm" label={panelLabel} />

      {#if activeTab === "relative"}
        <SelectableList label={relativeListLabel} value={selectedPresetValue} onchange={onPresetSelect}>
          {#each resolvedPresets as preset (preset.token)}
            <SelectableRow value={preset.token} disabled={preset.disabled}>{preset.label}</SelectableRow>
          {/each}
        </SelectableList>
      {:else}
        <div class="st-timeRangePicker__custom">
          <div class="st-timeRangePicker__calendars">
            <Calendar
              range
              value={calendarValue}
              onChange={onCalendarChange}
              min={calendarMinIso}
              max={calendarMaxIso}
              {locale}
              month={leftMonth}
            />
            {#if calendarMonths === 2}
              <Calendar
                range
                value={calendarValue}
                onChange={onCalendarChange}
                min={calendarMinIso}
                max={calendarMaxIso}
                {locale}
                month={rightMonth}
              />
            {/if}
          </div>

          <div class="st-timeRangePicker__bounds">
            <div class="st-timeRangePicker__bound">
              <Input
                label={fromLabel}
                bind:value={draft.fromText}
                placeholder={dateTimePlaceholder}
                {size}
                onblur={commitTypedFrom}
                onkeydown={onFromTextKeydown}
              />
              <TimePicker value={draft.fromTime} onChange={onFromTimeChange} step={timeStep} format={timeFormat} {size} />
            </div>
            <div class="st-timeRangePicker__bound">
              <Input
                label={toLabel}
                bind:value={draft.toText}
                placeholder={dateTimePlaceholder}
                {size}
                onblur={commitTypedTo}
                onkeydown={onToTextKeydown}
              />
              <TimePicker value={draft.toTime} onChange={onToTimeChange} step={timeStep} format={timeFormat} {size} />
            </div>
          </div>

          {#if draftError}
            <p class="st-timeRangePicker__error" role="alert">{draftError}</p>
          {/if}

          <div class="st-timeRangePicker__actions">
            <Button type="button" variant="ghost" {size} onclick={onCancel}>{cancelLabel}</Button>
            <Button type="button" variant="primary" {size} disabled={!draftValid} onclick={onApply}>{applyLabel}</Button>
          </div>
        </div>
      {/if}
    </div>
  </MenuPopover>
</div>

<style>
  .st-timeRangePicker {
    display: inline-flex;
    flex-direction: column;
    gap: var(--st-component-field-gap, 0.5rem);
    position: relative;
  }

  .st-timeRangePicker__label {
    color: var(--st-component-field-labelText, var(--st-semantic-text-primary));
    font-size: var(--st-component-field-labelTypography-size, 0.875rem);
    font-weight: var(--st-component-field-labelTypography-weight, 600);
  }

  .st-timeRangePicker__trigger {
    align-items: center;
    background: var(--st-component-control-background, var(--st-semantic-surface-default));
    border: var(--st-component-control-anatomy-shape-borderWidth, 1px)
      var(--st-component-control-anatomy-shape-borderStyle, solid)
      var(--st-component-control-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-control-anatomy-shape-radius, 0.375rem);
    color: var(--st-component-control-text, var(--st-semantic-text-primary));
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    gap: var(--st-spacing-2, 0.5rem);
    transition:
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      box-shadow var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-timeRangePicker--sm .st-timeRangePicker__trigger {
    min-height: var(--st-component-control-smHeight, 2rem);
    padding: 0 0.625rem;
    font-size: 0.8125rem;
  }

  .st-timeRangePicker--md .st-timeRangePicker__trigger {
    min-height: var(--st-component-control-mdHeight, 2.5rem);
    padding: 0 0.75rem;
    font-size: 0.875rem;
  }

  .st-timeRangePicker--lg .st-timeRangePicker__trigger {
    min-height: var(--st-component-control-lgHeight, 3rem);
    padding: 0 0.875rem;
    font-size: 1rem;
  }

  .st-timeRangePicker__trigger:hover:not(:disabled) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
    border-color: var(--st-component-control-hoverBorder, var(--st-semantic-border-strong));
  }

  .st-timeRangePicker__trigger:focus-visible {
    border-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline: var(--st-component-control-anatomy-focus-outline, none);
    outline-offset: var(--st-component-control-anatomy-focus-offset, 0);
    box-shadow: var(--st-component-control-anatomy-focus-boxShadow,
      0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive)));
  }

  .st-timeRangePicker__trigger:disabled {
    color: var(--st-component-control-disabledText, var(--st-semantic-text-muted));
    cursor: not-allowed;
    opacity: 0.65;
  }

  .st-timeRangePicker__triggerLabel {
    max-width: 20rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Panel content — a single stacked column under the tab switcher. NO left
     rail (proscribed DS anti-pattern): tabs on top, one column beneath. */
  .st-timeRangePicker__panel {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-3, 0.75rem);
    min-width: 20rem;
    padding: var(--st-spacing-3, 0.75rem);
  }

  .st-timeRangePicker__panel:focus {
    outline: none;
  }

  .st-timeRangePicker__custom {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-3, 0.75rem);
  }

  .st-timeRangePicker__calendars {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-3, 0.75rem);
  }

  .st-timeRangePicker__calendars :global(.st-calendar) {
    flex: 1 1 16rem;
    min-width: 16rem;
  }

  .st-timeRangePicker__bounds {
    display: grid;
    gap: var(--st-spacing-3, 0.75rem);
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  }

  .st-timeRangePicker__bound {
    display: grid;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-timeRangePicker__error {
    color: var(--st-component-field-errorText, var(--st-semantic-feedback-error));
    font-size: 0.8125rem;
    line-height: 1.4;
    margin: 0;
  }

  .st-timeRangePicker__actions {
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: flex-end;
  }
</style>

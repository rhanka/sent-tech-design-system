import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { Button } from "./Button.js";
import { Calendar } from "./Calendar.js";
import { ContentSwitcher } from "./ContentSwitcher.js";
import { SelectableList } from "./SelectableList.js";
import { SelectableRow } from "./SelectableRow.js";
import { TimePicker } from "./TimePicker.js";
import { classNames } from "./classNames.js";
import {
  DEFAULT_TIME_RANGE_PRESETS,
  composeAbsolute,
  formatPresetLabel,
  formatTriggerLabel,
  parsePresetMs,
  resolveRelative,
  splitAbsolute,
  type AbsoluteDraft,
  type TimeRange,
  type TimeRangeMode,
  type TimeRangePreset,
} from "./timeRange.js";

export type TimeRangePickerSize = "sm" | "md" | "lg";
export type TimeRangePickerPlacement =
  | "bottom-start"
  | "bottom-end"
  | "top-start"
  | "top-end";
export type TimeRangePickerAlign = "start" | "end" | "center";

export type TimeRangePickerProps = {
  value?: TimeRange;
  defaultValue?: TimeRange;
  presets?: TimeRangePreset[];
  min?: number;
  max?: number;
  locale?: string;
  timeFormat?: "24" | "12";
  timeStep?: number;
  calendarMonths?: 1 | 2;
  disabled?: boolean;
  label?: string;
  placement?: TimeRangePickerPlacement;
  align?: TimeRangePickerAlign;
  size?: TimeRangePickerSize;
  class?: string;
};

type ResolvedPreset = {
  token: string;
  label: string;
  disabled: boolean;
};

/** Normalize a preset (string token or object form) to `{token, label?, durationMs?}`. */
function presetToken(preset: TimeRangePreset): string {
  return typeof preset === "string" ? preset : preset.token;
}
function presetDurationMs(preset: TimeRangePreset): number | null {
  if (typeof preset !== "string" && preset.durationMs !== undefined) return preset.durationMs;
  return parsePresetMs(presetToken(preset));
}

@Component({
  selector: "st-time-range-picker",
  standalone: true,
  imports: [Button, Calendar, ContentSwitcher, SelectableList, SelectableRow, TimePicker],
  styles: [":host { display: contents; }"],
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <button
        type="button"
        class="st-timeRangePicker__trigger"
        [class.st-timeRangePicker__trigger--open]="open"
        [disabled]="disabled ?? false"
        [attr.aria-haspopup]="'dialog'"
        [attr.aria-expanded]="open"
        [attr.aria-label]="label ?? null"
        (click)="toggle()"
      >
        <span class="st-timeRangePicker__triggerLabel">{{ triggerLabel }}</span>
      </button>

      @if (open) {
        <div
          class="st-timeRangePicker__popover"
          [class]="popoverClass"
          role="dialog"
          [attr.aria-label]="label ?? 'Time range'"
        >
          <st-content-switcher
            class="st-timeRangePicker__tabs"
            [items]="tabItems"
            [value]="activeTab"
            [onchange]="onTabChange"
          ></st-content-switcher>

          @if (activeTab === 'relative') {
            <st-selectable-list
              class="st-timeRangePicker__presets"
              [value]="selectedRelativeToken"
              [label]="label ?? 'Time range'"
            >
              @for (preset of resolvedPresets; track preset.token) {
                <st-selectable-row
                  [value]="preset.token"
                  [selected]="preset.token === selectedRelativeToken"
                  [disabled]="preset.disabled"
                  [onSelect]="makePresetSelect(preset)"
                >
                  {{ preset.label }}
                </st-selectable-row>
              }
            </st-selectable-list>
          } @else {
            <div class="st-timeRangePicker__custom">
              <div class="st-timeRangePicker__bounds">
                <div class="st-timeRangePicker__bound">
                  <st-time-picker
                    [label]="fromLabel"
                    [value]="fromTimeValue"
                    [step]="timeStep ?? 15"
                    [format]="timeFormat ?? '24'"
                    [onChange]="onFromTimeChange"
                  ></st-time-picker>
                </div>
                <div class="st-timeRangePicker__bound">
                  <st-time-picker
                    [label]="toLabel"
                    [value]="toTimeValue"
                    [step]="timeStep ?? 15"
                    [format]="timeFormat ?? '24'"
                    [onChange]="onToTimeChange"
                  ></st-time-picker>
                </div>
              </div>

              <st-calendar
                class="st-timeRangePicker__calendar"
                [range]="true"
                [value]="calendarValue"
                [min]="minDay ?? undefined"
                [max]="maxDay ?? undefined"
                [locale]="locale ?? 'fr-FR'"
                [onChange]="onCalendarChange"
              ></st-calendar>

              @if (errorText) {
                <p class="st-timeRangePicker__error" role="alert">{{ errorText }}</p>
              }

              <div class="st-timeRangePicker__actions">
                <st-button variant="ghost" (click)="cancel()">{{ cancelLabel }}</st-button>
                <st-button variant="primary" [disabled]="!canApply" (click)="apply()">{{
                  applyLabel
                }}</st-button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class TimeRangePicker {
  static readonly stComponentName = "TimeRangePicker";
  readonly componentName = "TimeRangePicker";

  @NgInput() value?: TimeRange;
  @NgInput() defaultValue?: TimeRange;
  @NgInput() presets?: TimeRangePreset[];
  @NgInput() min?: number;
  @NgInput() max?: number;
  @NgInput() locale?: string;
  @NgInput() timeFormat?: "24" | "12";
  @NgInput() timeStep?: number;
  @NgInput() calendarMonths?: 1 | 2;
  @NgInput() disabled?: boolean;
  @NgInput() label?: string;
  @NgInput() placement?: TimeRangePickerPlacement;
  @NgInput() align?: TimeRangePickerAlign;
  @NgInput() size?: TimeRangePickerSize;
  @NgInput("class") classInput?: string;
  @NgInput() formatRange?: (value: TimeRange, locale: string) => string;
  @NgInput() formatPresetLabel?: (token: string, locale: string) => string;

  @Output() valueChange = new EventEmitter<TimeRange>();
  @Output() change = new EventEmitter<TimeRange>();

  open = false;
  activeTab: TimeRangeMode = "relative";
  draft: AbsoluteDraft = { fromTime: "00:00", toTime: "23:59" };

  /** Uncontrolled fallback, seeded on first read from `defaultValue`. */
  private internalValue?: TimeRange;

  private get resolvedLocale(): string {
    return this.locale ?? "fr-FR";
  }

  private get isFr(): boolean {
    return this.resolvedLocale.toLowerCase().startsWith("fr");
  }

  /** The committed range: controlled `value` wins, else internal/uncontrolled. */
  get currentValue(): TimeRange {
    if (this.value) return this.value;
    if (!this.internalValue) {
      this.internalValue = this.defaultValue ?? this.resolveToken("30m");
    }
    return this.internalValue;
  }

  get hostClass(): string {
    return classNames(
      "st-timeRangePicker",
      `st-timeRangePicker--${this.size ?? "md"}`,
      this.classInput,
    );
  }

  get popoverClass(): string {
    return classNames(
      "st-timeRangePicker__popover",
      `st-timeRangePicker__popover--${this.placement ?? "bottom-start"}`,
      this.align ? `st-timeRangePicker__popover--align-${this.align}` : null,
    );
  }

  get triggerLabel(): string {
    const v = this.currentValue;
    if (this.formatRange) return this.formatRange(v, this.resolvedLocale);
    return formatTriggerLabel(v, this.resolvedLocale);
  }

  get tabItems(): Array<{ value: string; label: string }> {
    return [
      { value: "relative", label: this.isFr ? "Relatif" : "Relative" },
      { value: "custom", label: this.isFr ? "Personnalisé" : "Custom" },
    ];
  }

  get fromLabel(): string {
    return this.isFr ? "Début" : "From";
  }
  get toLabel(): string {
    return this.isFr ? "Fin" : "To";
  }
  get applyLabel(): string {
    return this.isFr ? "Appliquer" : "Apply";
  }
  get cancelLabel(): string {
    return this.isFr ? "Annuler" : "Cancel";
  }

  get selectedRelativeToken(): string | null {
    const v = this.currentValue;
    return v.mode === "relative" ? (v.relative ?? null) : null;
  }

  /** Presets resolved to labels + a disabled flag when they'd fall below `min`. */
  get resolvedPresets(): ResolvedPreset[] {
    const list = this.presets ?? DEFAULT_TIME_RANGE_PRESETS;
    const now = Date.now();
    return list.map((preset) => {
      const token = presetToken(preset);
      const duration = presetDurationMs(preset);
      const custom = typeof preset === "string" ? undefined : preset.label;
      const label =
        custom ??
        (this.formatPresetLabel
          ? this.formatPresetLabel(token, this.resolvedLocale)
          : formatPresetLabel(token, this.resolvedLocale));
      const disabled =
        duration !== null && this.min !== undefined && now - duration < this.min;
      return { token, label, disabled };
    });
  }

  /** `AbsoluteDraft` times are optional; the TimePicker input requires a string. */
  get fromTimeValue(): string {
    return this.draft.fromTime ?? "00:00";
  }
  get toTimeValue(): string {
    return this.draft.toTime ?? "23:59";
  }

  get calendarValue(): [string | null, string | null] {
    return [this.draft.fromDate ?? null, this.draft.toDate ?? null];
  }

  get minDay(): string | null {
    return this.min === undefined ? null : splitAbsolute(this.min, this.min).fromDate;
  }
  get maxDay(): string | null {
    return this.max === undefined ? null : splitAbsolute(this.max, this.max).fromDate;
  }

  /** Null when the draft is valid; otherwise the user-facing reason. */
  get errorText(): string | null {
    if (!this.draft.fromDate || !this.draft.toDate) {
      return this.isFr ? "Sélectionnez une date de début et de fin." : "Select a start and end date.";
    }
    if (!composeAbsolute(this.draft)) {
      return this.isFr
        ? "La date de fin doit suivre la date de début."
        : "End must be after start.";
    }
    return null;
  }

  get canApply(): boolean {
    return this.errorText === null;
  }

  // ── interaction ─────────────────────────────────────────────────────────

  toggle(): void {
    if (this.disabled) return;
    this.open ? this.close() : this.openPanel();
  }

  openPanel(): void {
    const v = this.currentValue;
    this.activeTab = v.mode;
    // Seed the custom draft from the concretely resolved current window, even in
    // relative mode, so switching to Custom starts from what the user sees.
    this.draft = splitAbsolute(v.from, v.to);
    this.open = true;
  }

  close(): void {
    this.open = false;
  }

  /** Cancel discards the draft and emits nothing. */
  cancel(): void {
    this.close();
  }

  onTabChange = (tab: string): void => {
    this.activeTab = tab === "custom" ? "absolute" : "relative";
  };

  onFromTimeChange = (time: string): void => {
    this.draft = { ...this.draft, fromTime: time };
  };

  onToTimeChange = (time: string): void => {
    this.draft = { ...this.draft, toTime: time };
  };

  onCalendarChange = (next: unknown): void => {
    if (!Array.isArray(next)) return;
    const [start, end] = next as [string | null, string | null];
    this.draft = { ...this.draft, fromDate: start ?? undefined, toDate: end ?? undefined };
  };

  makePresetSelect(preset: ResolvedPreset): () => void {
    return () => this.selectPreset(preset.token);
  }

  /** Relative presets resolve, emit and close immediately. */
  selectPreset(token: string): void {
    const resolved = this.resolveToken(token);
    this.commit(resolved);
    this.close();
  }

  /** Absolute mode is staged: nothing emits until Apply. */
  apply(): void {
    const composed = composeAbsolute(this.draft);
    if (!composed) return;
    const from = this.min !== undefined ? Math.max(composed.from, this.min) : composed.from;
    const to = this.max !== undefined ? Math.min(composed.to, this.max) : composed.to;
    this.commit({ mode: "absolute", from, to });
    this.close();
  }

  private resolveToken(token: string): TimeRange {
    const list = this.presets ?? DEFAULT_TIME_RANGE_PRESETS;
    const match = list.find((p) => presetToken(p) === token);
    const override = match ? presetDurationMs(match) : null;
    const parsed = parsePresetMs(token);
    if (override !== null && override !== parsed) {
      const to = this.max !== undefined ? Math.min(Date.now(), this.max) : Date.now();
      const rawFrom = to - override;
      const from = this.min !== undefined ? Math.max(rawFrom, this.min) : rawFrom;
      return { mode: "relative", relative: token, from, to };
    }
    const resolved = resolveRelative(token, Date.now(), { min: this.min, max: this.max });
    if (resolved) return resolved;
    // Unknown/unresolvable token: degrade to an empty window rather than throwing.
    const now = Date.now();
    return { mode: "relative", relative: token, from: now, to: now };
  }

  private commit(next: TimeRange): void {
    if (!this.value) this.internalValue = next;
    this.valueChange.emit(next);
    this.change.emit(next);
  }
}

import {
  Component,
  ElementRef,
  EventEmitter,
  Input as NgInput,
  Output,
  ViewChild,
  type OnChanges,
  type OnInit,
} from "@angular/core";

import { classNames } from "./classNames.js";

/**
 * En mode simple : `string | null` ("YYYY-MM-DD").
 * En mode plage (`range`) : tuple `[start, end]` où chaque borne est
 * "YYYY-MM-DD" ou null.
 */
export type CalendarValue = string | null | [string | null, string | null];

interface CalendarCell {
  date: Date;
  inMonth: boolean;
}

// In addition to the Vue-native `@change` emit, an `onChange` callback prop
// (parity with React/Svelte) is accepted and fired on selection.
export type CalendarProps = {
  /** Date sélectionnée ("YYYY-MM-DD") ou tuple [start,end] si `range`. */
  value?: CalendarValue;
  /** Appelé avec la nouvelle date (ou le tuple en mode plage). */
  onChange?: (value: CalendarValue) => void;
  /** Borne minimale "YYYY-MM-DD" (inclusive). */
  min?: string;
  /** Borne maximale "YYYY-MM-DD" (inclusive). */
  max?: string;
  /** Sélection d'une plage de deux dates. */
  range?: boolean;
  /** Premier jour de la semaine : 0 = dimanche, 1 = lundi. */
  weekStartsOn?: 0 | 1;
  locale?: string;
  /** Mois affiché ("YYYY-MM"), contrôlable de l'extérieur. */
  month?: string;
  class?: string;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
};

@Component({
  selector: "st-calendar",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-calendar__nav">
        <button
          type="button"
          class="st-calendar__navBtn"
          [attr.aria-label]="resolvedPrevLabel"
          (click)="previousMonth()"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <span class="st-calendar__monthLabel" aria-live="polite">{{ monthLabel }}</span>
        <button
          type="button"
          class="st-calendar__navBtn"
          [attr.aria-label]="resolvedNextLabel"
          (click)="nextMonth()"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </div>
      <div
        class="st-calendar__grid"
        role="grid"
        [attr.aria-label]="monthLabel"
        (keydown)="onKeyDown($event)"
        #gridEl
      >
        <div class="st-calendar__weekdays" role="row">
          @for (wd of weekdayLabels; track $index) {
            <span class="st-calendar__weekday" role="columnheader">{{ wd }}</span>
          }
        </div>
        <div class="st-calendar__days">
          @for (week of weeks; track $index) {
            <div class="st-calendar__week" role="row">
              @for (cell of week; track cell.date.getTime()) {
                <button
                  type="button"
                  [class]="dayClass(cell)"
                  role="gridcell"
                  [attr.aria-label]="dayLabel(cell)"
                  [attr.aria-selected]="isSelected(cell.date) ? 'true' : 'false'"
                  [attr.aria-current]="isToday(cell.date) ? 'date' : null"
                  [attr.aria-disabled]="isOutOfBounds(cell.date) ? 'true' : null"
                  [disabled]="isOutOfBounds(cell.date)"
                  [attr.tabindex]="dayTabIndex(cell)"
                  [attr.data-date]="toISO(cell.date)"
                  (click)="onDayClick(cell)"
                >{{ cell.date.getDate() }}</button>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class Calendar implements OnInit, OnChanges {
  static readonly stComponentName = "Calendar";
  readonly componentName = "Calendar";
  @NgInput() value: CalendarValue = null;
  @NgInput() onChange?: (value: CalendarValue) => void;
  @NgInput() min?: string;
  @NgInput() max?: string;
  @NgInput() range?: boolean;
  @NgInput() weekStartsOn?: 0 | 1;
  @NgInput() locale?: string;
  @NgInput() month?: string;
  @NgInput("class") classInput?: string;
  @NgInput() previousMonthLabel?: string;
  @NgInput() nextMonthLabel?: string;

  @Output() readonly valueChange = new EventEmitter<CalendarValue>();

  @ViewChild("gridEl") gridEl?: ElementRef<HTMLElement>;

  private viewYear = new Date().getFullYear();
  private viewMonth = new Date().getMonth();
  private focusDate: Date = this.startOfDay(new Date());
  private readonly today = this.startOfDay(new Date());

  ngOnInit(): void {
    const initial = this.pickInitialMonth();
    this.viewYear = initial.getFullYear();
    this.viewMonth = initial.getMonth();
    this.focusDate = this.initialFocusDate();
  }

  ngOnChanges(): void {
    const parsed = this.parseISO(this.month ? `${this.month}-01` : undefined);
    if (parsed) {
      this.viewYear = parsed.getFullYear();
      this.viewMonth = parsed.getMonth();
    }
    const clamped = this.clampToMonth(this.focusDate, this.viewYear, this.viewMonth);
    if (clamped) this.focusDate = clamped;
  }

  // --- Helpers de dates ----------------------------------------------------
  private startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  toISO(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  private parseISO(iso: string | null | undefined): Date | null {
    if (!iso) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!match) return null;
    const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(d.getTime()) ? null : this.startOfDay(d);
  }

  private isSameDay(a: Date | null, b: Date | null): boolean {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  // --- Configuration résolue ----------------------------------------------
  private get resolvedLocale(): string {
    return this.locale ?? "fr-FR";
  }

  private get resolvedWeekStartsOn(): 0 | 1 {
    return this.weekStartsOn ?? 1;
  }

  private get isFr(): boolean {
    return this.resolvedLocale.toLowerCase().startsWith("fr");
  }

  get resolvedPrevLabel(): string {
    return this.previousMonthLabel ?? (this.isFr ? "Mois précédent" : "Previous month");
  }

  get resolvedNextLabel(): string {
    return this.nextMonthLabel ?? (this.isFr ? "Mois suivant" : "Next month");
  }

  private get monthFormatter(): Intl.DateTimeFormat {
    return new Intl.DateTimeFormat(this.resolvedLocale, { month: "long", year: "numeric" });
  }

  private get weekdayFormatter(): Intl.DateTimeFormat {
    return new Intl.DateTimeFormat(this.resolvedLocale, { weekday: "short" });
  }

  private get cellFormatter(): Intl.DateTimeFormat {
    return new Intl.DateTimeFormat(this.resolvedLocale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // --- Valeurs normalisées -------------------------------------------------
  private get singleDate(): Date | null {
    return this.range ? null : this.parseISO(this.value as string | null);
  }

  private get rangeStartDate(): Date | null {
    return this.range && Array.isArray(this.value) ? this.parseISO(this.value[0]) : null;
  }

  private get rangeEndDate(): Date | null {
    return this.range && Array.isArray(this.value) ? this.parseISO(this.value[1]) : null;
  }

  private get minDate(): Date | null {
    return this.parseISO(this.min);
  }

  private get maxDate(): Date | null {
    return this.parseISO(this.max);
  }

  private pickInitialMonth(): Date {
    const parsed = this.parseISO(this.month ? `${this.month}-01` : undefined);
    if (parsed) return parsed;
    if (!this.range && this.singleDate) return this.singleDate;
    if (this.range && this.rangeStartDate) return this.rangeStartDate;
    return this.startOfDay(new Date());
  }

  private initialFocusDate(): Date {
    const sel = !this.range ? this.singleDate : this.rangeStartDate;
    if (
      sel &&
      sel.getFullYear() === this.viewYear &&
      sel.getMonth() === this.viewMonth &&
      !this.isOutOfBounds(sel)
    ) {
      return sel;
    }
    const lastDay = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    for (let d = 1; d <= lastDay; d++) {
      const candidate = this.startOfDay(new Date(this.viewYear, this.viewMonth, d));
      if (!this.isOutOfBounds(candidate)) return candidate;
    }
    return this.startOfDay(new Date(this.viewYear, this.viewMonth, 1));
  }

  private clampToMonth(preferred: Date, year: number, month: number): Date | null {
    if (
      preferred.getFullYear() === year &&
      preferred.getMonth() === month &&
      !this.isOutOfBounds(preferred)
    ) {
      return preferred;
    }
    const sel = !this.range ? this.singleDate : this.rangeStartDate;
    if (sel && sel.getFullYear() === year && sel.getMonth() === month && !this.isOutOfBounds(sel)) {
      return sel;
    }
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= lastDay; d++) {
      const candidate = this.startOfDay(new Date(year, month, d));
      if (!this.isOutOfBounds(candidate)) return candidate;
    }
    return null;
  }

  // --- Données de grille ---------------------------------------------------
  get weekdayLabels(): string[] {
    const sample = new Date(Date.UTC(2024, 0, 7)); // dimanche
    const labels: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sample);
      d.setUTCDate(sample.getUTCDate() + i);
      labels.push(this.weekdayFormatter.format(d));
    }
    const ws = this.resolvedWeekStartsOn;
    return [...labels.slice(ws), ...labels.slice(0, ws)];
  }

  private get cells(): CalendarCell[] {
    const ws = this.resolvedWeekStartsOn;
    const first = new Date(this.viewYear, this.viewMonth, 1);
    const firstDayIdx = first.getDay();
    const offset = (firstDayIdx - ws + 7) % 7;
    const start = new Date(this.viewYear, this.viewMonth, 1 - offset);
    const cells: CalendarCell[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push({ date: this.startOfDay(d), inMonth: d.getMonth() === this.viewMonth });
    }
    return cells;
  }

  get weeks(): CalendarCell[][] {
    const cells = this.cells;
    const weeks: CalendarCell[][] = [];
    for (let i = 0; i < 6; i++) {
      weeks.push(cells.slice(i * 7, i * 7 + 7));
    }
    return weeks;
  }

  get monthLabel(): string {
    return this.monthFormatter.format(new Date(this.viewYear, this.viewMonth, 1));
  }

  get hostClass(): string {
    return classNames("st-calendar", this.classInput);
  }

  // --- États par cellule ---------------------------------------------------
  isOutOfBounds(date: Date): boolean {
    const d = this.startOfDay(date).getTime();
    const minDate = this.minDate;
    const maxDate = this.maxDate;
    if (minDate && d < minDate.getTime()) return true;
    if (maxDate && d > maxDate.getTime()) return true;
    return false;
  }

  isSelected(date: Date): boolean {
    if (!this.range) return this.isSameDay(this.singleDate, date);
    return this.isSameDay(this.rangeStartDate, date) || this.isSameDay(this.rangeEndDate, date);
  }

  isInRange(date: Date): boolean {
    const start = this.rangeStartDate;
    const end = this.rangeEndDate;
    if (!this.range || !start || !end) return false;
    const d = this.startOfDay(date).getTime();
    return d > start.getTime() && d < end.getTime();
  }

  isToday(date: Date): boolean {
    return this.isSameDay(date, this.today);
  }

  private isActive(date: Date): boolean {
    return this.isSameDay(date, this.focusDate);
  }

  dayClass(cell: CalendarCell): string {
    return classNames(
      "st-calendar__day",
      !cell.inMonth && "st-calendar__day--outside",
      this.isSelected(cell.date) && "st-calendar__day--selected",
      this.isInRange(cell.date) && "st-calendar__day--inRange",
      this.isToday(cell.date) && "st-calendar__day--today",
    );
  }

  dayLabel(cell: CalendarCell): string {
    return this.cellFormatter.format(cell.date);
  }

  dayTabIndex(cell: CalendarCell): number {
    return this.isActive(cell.date) && !this.isOutOfBounds(cell.date) ? 0 : -1;
  }

  // --- Navigation ----------------------------------------------------------
  previousMonth(): void {
    const targetMonth = this.viewMonth === 0 ? 11 : this.viewMonth - 1;
    const targetYear = this.viewMonth === 0 ? this.viewYear - 1 : this.viewYear;
    this.viewMonth = targetMonth;
    this.viewYear = targetYear;
    const clamped = this.clampToMonth(this.focusDate, targetYear, targetMonth);
    if (clamped) this.focusDate = clamped;
  }

  nextMonth(): void {
    const targetMonth = this.viewMonth === 11 ? 0 : this.viewMonth + 1;
    const targetYear = this.viewMonth === 11 ? this.viewYear + 1 : this.viewYear;
    this.viewMonth = targetMonth;
    this.viewYear = targetYear;
    const clamped = this.clampToMonth(this.focusDate, targetYear, targetMonth);
    if (clamped) this.focusDate = clamped;
  }

  private pickDate(date: Date): void {
    if (this.isOutOfBounds(date)) return;
    const picked = this.startOfDay(date);
    const iso = this.toISO(picked);

    if (!this.range) {
      this.value = iso;
      this.onChange?.(iso);
      this.valueChange.emit(iso);
      return;
    }

    const start = this.rangeStartDate;
    const end = this.rangeEndDate;
    if (!start || (start && end) || picked.getTime() < start.getTime()) {
      const next: CalendarValue = [iso, null];
      this.value = next;
      this.onChange?.(next);
      this.valueChange.emit(next);
      return;
    }
    const next: CalendarValue = [this.toISO(start), iso];
    this.value = next;
    this.onChange?.(next);
    this.valueChange.emit(next);
  }

  onDayClick(cell: CalendarCell): void {
    this.focusDate = this.startOfDay(cell.date);
    this.pickDate(cell.date);
  }

  private focusActiveCell(): void {
    const host = this.gridEl?.nativeElement;
    if (!host) return;
    const iso = this.toISO(this.focusDate);
    const btn = host.querySelector<HTMLElement>(`[data-date="${iso}"]`);
    btn?.focus();
  }

  private moveFocus(deltaDays: number): void {
    const next = new Date(this.focusDate);
    next.setDate(next.getDate() + deltaDays);
    if (next.getFullYear() !== this.viewYear || next.getMonth() !== this.viewMonth) {
      this.viewYear = next.getFullYear();
      this.viewMonth = next.getMonth();
    }
    this.focusDate = this.startOfDay(next);
    setTimeout(() => this.focusActiveCell(), 0);
  }

  onKeyDown(event: KeyboardEvent): void {
    const ws = this.resolvedWeekStartsOn;
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        this.moveFocus(-1);
        break;
      case "ArrowRight":
        event.preventDefault();
        this.moveFocus(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        this.moveFocus(-7);
        break;
      case "ArrowDown":
        event.preventDefault();
        this.moveFocus(7);
        break;
      case "Home": {
        event.preventDefault();
        const dayOfWeek = this.focusDate.getDay();
        const offset = (dayOfWeek - ws + 7) % 7;
        this.moveFocus(-offset);
        break;
      }
      case "End": {
        event.preventDefault();
        const dayOfWeek = this.focusDate.getDay();
        const offset = 6 - ((dayOfWeek - ws + 7) % 7);
        this.moveFocus(offset);
        break;
      }
      case "PageUp": {
        event.preventDefault();
        const day = this.focusDate.getDate();
        const targetMonth = this.viewMonth === 0 ? 11 : this.viewMonth - 1;
        const targetYear = this.viewMonth === 0 ? this.viewYear - 1 : this.viewYear;
        const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
        this.focusDate = this.startOfDay(new Date(targetYear, targetMonth, Math.min(day, lastDay)));
        this.previousMonth();
        setTimeout(() => this.focusActiveCell(), 0);
        break;
      }
      case "PageDown": {
        event.preventDefault();
        const day = this.focusDate.getDate();
        const targetMonth = this.viewMonth === 11 ? 0 : this.viewMonth + 1;
        const targetYear = this.viewMonth === 11 ? this.viewYear + 1 : this.viewYear;
        const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
        this.focusDate = this.startOfDay(new Date(targetYear, targetMonth, Math.min(day, lastDay)));
        this.nextMonth();
        setTimeout(() => this.focusActiveCell(), 0);
        break;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        if (!this.isOutOfBounds(this.focusDate)) this.pickDate(this.focusDate);
        break;
      }
    }
  }
}

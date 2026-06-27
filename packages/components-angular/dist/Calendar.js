import { Component, ElementRef, EventEmitter, Input as NgInput, Output, ViewChild, } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Calendar {
    static stComponentName = "Calendar";
    componentName = "Calendar";
    value = null;
    onChange;
    min;
    max;
    range;
    weekStartsOn;
    locale;
    month;
    classInput;
    previousMonthLabel;
    nextMonthLabel;
    valueChange = new EventEmitter();
    gridEl;
    viewYear = new Date().getFullYear();
    viewMonth = new Date().getMonth();
    focusDate = this.startOfDay(new Date());
    today = this.startOfDay(new Date());
    ngOnInit() {
        const initial = this.pickInitialMonth();
        this.viewYear = initial.getFullYear();
        this.viewMonth = initial.getMonth();
        this.focusDate = this.initialFocusDate();
    }
    ngOnChanges() {
        const parsed = this.parseISO(this.month ? `${this.month}-01` : undefined);
        if (parsed) {
            this.viewYear = parsed.getFullYear();
            this.viewMonth = parsed.getMonth();
        }
        const clamped = this.clampToMonth(this.focusDate, this.viewYear, this.viewMonth);
        if (clamped)
            this.focusDate = clamped;
    }
    // --- Helpers de dates ----------------------------------------------------
    startOfDay(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    }
    toISO(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }
    parseISO(iso) {
        if (!iso)
            return null;
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
        if (!match)
            return null;
        const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        return Number.isNaN(d.getTime()) ? null : this.startOfDay(d);
    }
    isSameDay(a, b) {
        if (!a || !b)
            return false;
        return (a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate());
    }
    // --- Configuration résolue ----------------------------------------------
    get resolvedLocale() {
        return this.locale ?? "fr-FR";
    }
    get resolvedWeekStartsOn() {
        return this.weekStartsOn ?? 1;
    }
    get isFr() {
        return this.resolvedLocale.toLowerCase().startsWith("fr");
    }
    get resolvedPrevLabel() {
        return this.previousMonthLabel ?? (this.isFr ? "Mois précédent" : "Previous month");
    }
    get resolvedNextLabel() {
        return this.nextMonthLabel ?? (this.isFr ? "Mois suivant" : "Next month");
    }
    get monthFormatter() {
        return new Intl.DateTimeFormat(this.resolvedLocale, { month: "long", year: "numeric" });
    }
    get weekdayFormatter() {
        return new Intl.DateTimeFormat(this.resolvedLocale, { weekday: "short" });
    }
    get cellFormatter() {
        return new Intl.DateTimeFormat(this.resolvedLocale, {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    }
    // --- Valeurs normalisées -------------------------------------------------
    get singleDate() {
        return this.range ? null : this.parseISO(this.value);
    }
    get rangeStartDate() {
        return this.range && Array.isArray(this.value) ? this.parseISO(this.value[0]) : null;
    }
    get rangeEndDate() {
        return this.range && Array.isArray(this.value) ? this.parseISO(this.value[1]) : null;
    }
    get minDate() {
        return this.parseISO(this.min);
    }
    get maxDate() {
        return this.parseISO(this.max);
    }
    pickInitialMonth() {
        const parsed = this.parseISO(this.month ? `${this.month}-01` : undefined);
        if (parsed)
            return parsed;
        if (!this.range && this.singleDate)
            return this.singleDate;
        if (this.range && this.rangeStartDate)
            return this.rangeStartDate;
        return this.startOfDay(new Date());
    }
    initialFocusDate() {
        const sel = !this.range ? this.singleDate : this.rangeStartDate;
        if (sel &&
            sel.getFullYear() === this.viewYear &&
            sel.getMonth() === this.viewMonth &&
            !this.isOutOfBounds(sel)) {
            return sel;
        }
        const lastDay = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
        for (let d = 1; d <= lastDay; d++) {
            const candidate = this.startOfDay(new Date(this.viewYear, this.viewMonth, d));
            if (!this.isOutOfBounds(candidate))
                return candidate;
        }
        return this.startOfDay(new Date(this.viewYear, this.viewMonth, 1));
    }
    clampToMonth(preferred, year, month) {
        if (preferred.getFullYear() === year &&
            preferred.getMonth() === month &&
            !this.isOutOfBounds(preferred)) {
            return preferred;
        }
        const sel = !this.range ? this.singleDate : this.rangeStartDate;
        if (sel && sel.getFullYear() === year && sel.getMonth() === month && !this.isOutOfBounds(sel)) {
            return sel;
        }
        const lastDay = new Date(year, month + 1, 0).getDate();
        for (let d = 1; d <= lastDay; d++) {
            const candidate = this.startOfDay(new Date(year, month, d));
            if (!this.isOutOfBounds(candidate))
                return candidate;
        }
        return null;
    }
    // --- Données de grille ---------------------------------------------------
    get weekdayLabels() {
        const sample = new Date(Date.UTC(2024, 0, 7)); // dimanche
        const labels = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(sample);
            d.setUTCDate(sample.getUTCDate() + i);
            labels.push(this.weekdayFormatter.format(d));
        }
        const ws = this.resolvedWeekStartsOn;
        return [...labels.slice(ws), ...labels.slice(0, ws)];
    }
    get cells() {
        const ws = this.resolvedWeekStartsOn;
        const first = new Date(this.viewYear, this.viewMonth, 1);
        const firstDayIdx = first.getDay();
        const offset = (firstDayIdx - ws + 7) % 7;
        const start = new Date(this.viewYear, this.viewMonth, 1 - offset);
        const cells = [];
        for (let i = 0; i < 42; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            cells.push({ date: this.startOfDay(d), inMonth: d.getMonth() === this.viewMonth });
        }
        return cells;
    }
    get weeks() {
        const cells = this.cells;
        const weeks = [];
        for (let i = 0; i < 6; i++) {
            weeks.push(cells.slice(i * 7, i * 7 + 7));
        }
        return weeks;
    }
    get monthLabel() {
        return this.monthFormatter.format(new Date(this.viewYear, this.viewMonth, 1));
    }
    get hostClass() {
        return classNames("st-calendar", this.classInput);
    }
    // --- États par cellule ---------------------------------------------------
    isOutOfBounds(date) {
        const d = this.startOfDay(date).getTime();
        const minDate = this.minDate;
        const maxDate = this.maxDate;
        if (minDate && d < minDate.getTime())
            return true;
        if (maxDate && d > maxDate.getTime())
            return true;
        return false;
    }
    isSelected(date) {
        if (!this.range)
            return this.isSameDay(this.singleDate, date);
        return this.isSameDay(this.rangeStartDate, date) || this.isSameDay(this.rangeEndDate, date);
    }
    isInRange(date) {
        const start = this.rangeStartDate;
        const end = this.rangeEndDate;
        if (!this.range || !start || !end)
            return false;
        const d = this.startOfDay(date).getTime();
        return d > start.getTime() && d < end.getTime();
    }
    isToday(date) {
        return this.isSameDay(date, this.today);
    }
    isActive(date) {
        return this.isSameDay(date, this.focusDate);
    }
    dayClass(cell) {
        return classNames("st-calendar__day", !cell.inMonth && "st-calendar__day--outside", this.isSelected(cell.date) && "st-calendar__day--selected", this.isInRange(cell.date) && "st-calendar__day--inRange", this.isToday(cell.date) && "st-calendar__day--today");
    }
    dayLabel(cell) {
        return this.cellFormatter.format(cell.date);
    }
    dayTabIndex(cell) {
        return this.isActive(cell.date) && !this.isOutOfBounds(cell.date) ? 0 : -1;
    }
    // --- Navigation ----------------------------------------------------------
    previousMonth() {
        const targetMonth = this.viewMonth === 0 ? 11 : this.viewMonth - 1;
        const targetYear = this.viewMonth === 0 ? this.viewYear - 1 : this.viewYear;
        this.viewMonth = targetMonth;
        this.viewYear = targetYear;
        const clamped = this.clampToMonth(this.focusDate, targetYear, targetMonth);
        if (clamped)
            this.focusDate = clamped;
    }
    nextMonth() {
        const targetMonth = this.viewMonth === 11 ? 0 : this.viewMonth + 1;
        const targetYear = this.viewMonth === 11 ? this.viewYear + 1 : this.viewYear;
        this.viewMonth = targetMonth;
        this.viewYear = targetYear;
        const clamped = this.clampToMonth(this.focusDate, targetYear, targetMonth);
        if (clamped)
            this.focusDate = clamped;
    }
    pickDate(date) {
        if (this.isOutOfBounds(date))
            return;
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
            const next = [iso, null];
            this.value = next;
            this.onChange?.(next);
            this.valueChange.emit(next);
            return;
        }
        const next = [this.toISO(start), iso];
        this.value = next;
        this.onChange?.(next);
        this.valueChange.emit(next);
    }
    onDayClick(cell) {
        this.focusDate = this.startOfDay(cell.date);
        this.pickDate(cell.date);
    }
    focusActiveCell() {
        const host = this.gridEl?.nativeElement;
        if (!host)
            return;
        const iso = this.toISO(this.focusDate);
        const btn = host.querySelector(`[data-date="${iso}"]`);
        btn?.focus();
    }
    moveFocus(deltaDays) {
        const next = new Date(this.focusDate);
        next.setDate(next.getDate() + deltaDays);
        if (next.getFullYear() !== this.viewYear || next.getMonth() !== this.viewMonth) {
            this.viewYear = next.getFullYear();
            this.viewMonth = next.getMonth();
        }
        this.focusDate = this.startOfDay(next);
        setTimeout(() => this.focusActiveCell(), 0);
    }
    onKeyDown(event) {
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
                if (!this.isOutOfBounds(this.focusDate))
                    this.pickDate(this.focusDate);
                break;
            }
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Calendar, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Calendar, isStandalone: true, selector: "st-calendar", inputs: { value: "value", onChange: "onChange", min: "min", max: "max", range: "range", weekStartsOn: "weekStartsOn", locale: "locale", month: "month", classInput: ["class", "classInput"], previousMonthLabel: "previousMonthLabel", nextMonthLabel: "nextMonthLabel" }, outputs: { valueChange: "valueChange" }, viewQueries: [{ propertyName: "gridEl", first: true, predicate: ["gridEl"], descendants: true }], usesOnChanges: true, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Calendar, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { value: [{
                type: NgInput
            }], onChange: [{
                type: NgInput
            }], min: [{
                type: NgInput
            }], max: [{
                type: NgInput
            }], range: [{
                type: NgInput
            }], weekStartsOn: [{
                type: NgInput
            }], locale: [{
                type: NgInput
            }], month: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], previousMonthLabel: [{
                type: NgInput
            }], nextMonthLabel: [{
                type: NgInput
            }], valueChange: [{
                type: Output
            }], gridEl: [{
                type: ViewChild,
                args: ["gridEl"]
            }] } });
//# sourceMappingURL=Calendar.js.map
import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
let _dpCounter = 0;
export class DatePicker {
    static stComponentName = "DatePicker";
    componentName = "DatePicker";
    fieldId;
    constructor() {
        _dpCounter++;
        this.fieldId = "st-datepicker-" + _dpCounter;
        const initial = this.pickInitialMonth();
        this.viewYear = initial.getFullYear();
        this.viewMonth = initial.getMonth();
    }
    label;
    helperText;
    errorText;
    invalid;
    disabled;
    mode = "single";
    value;
    min;
    max;
    locale = "fr-FR";
    placeholder;
    size = "md";
    id;
    openLabel;
    previousMonthLabel;
    nextMonthLabel;
    todayLabel;
    classInput;
    modelValueChange = new EventEmitter();
    open = false;
    viewYear;
    viewMonth;
    get isFr() {
        return (this.locale ?? "fr-FR").toLowerCase().startsWith("fr");
    }
    get resolvedOpenLabel() {
        return this.openLabel ?? (this.isFr ? "Ouvrir le calendrier" : "Open calendar");
    }
    get resolvedPrevLabel() {
        return this.previousMonthLabel ?? (this.isFr ? "Mois précédent" : "Previous month");
    }
    get resolvedNextLabel() {
        return this.nextMonthLabel ?? (this.isFr ? "Mois suivant" : "Next month");
    }
    get resolvedTodayLabel() {
        return this.todayLabel ?? (this.isFr ? "Aujourd'hui" : "Today");
    }
    get resolvedPlaceholder() {
        if (this.placeholder)
            return this.placeholder;
        if (this.isFr) {
            return this.mode === "range" ? "jj/mm/aaaa - jj/mm/aaaa" : "jj/mm/aaaa";
        }
        return this.mode === "range" ? "mm/dd/yyyy - mm/dd/yyyy" : "mm/dd/yyyy";
    }
    get isInvalid() {
        return Boolean(this.invalid) || Boolean(this.errorText);
    }
    get hostClass() {
        return classNames("st-field", this.classInput);
    }
    get groupClass() {
        return classNames("st-datepicker", `st-datepicker--${this.size}`);
    }
    get dateFormatter() {
        return new Intl.DateTimeFormat(this.locale, { day: "2-digit", month: "2-digit", year: "numeric" });
    }
    get monthFormatter() {
        return new Intl.DateTimeFormat(this.locale, { month: "long", year: "numeric" });
    }
    get weekdayFormatter() {
        return new Intl.DateTimeFormat(this.locale, { weekday: "short" });
    }
    get cellFormatter() {
        return new Intl.DateTimeFormat(this.locale, { day: "numeric", month: "long", year: "numeric" });
    }
    startOfDay(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    }
    isSameDay(a, b) {
        if (!a || !b)
            return false;
        return (a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate());
    }
    pickInitialMonth() {
        if (this.mode === "single" && this.value instanceof Date) {
            return this.startOfDay(this.value);
        }
        if (this.mode === "range" &&
            this.value &&
            typeof this.value === "object" &&
            "start" in this.value &&
            this.value.start) {
            return this.startOfDay(this.value.start);
        }
        return this.startOfDay(new Date());
    }
    firstDayOfWeek(loc) {
        try {
            // @ts-expect-error: weekInfo is recent and not in all TS lib versions.
            const info = new Intl.Locale(loc).weekInfo;
            if (info && typeof info.firstDay === "number") {
                return info.firstDay === 7 ? 0 : info.firstDay;
            }
        }
        catch {
            // Ignore — fall back below.
        }
        return loc.toLowerCase().startsWith("en-us") ? 0 : 1;
    }
    get weekStart() {
        return this.firstDayOfWeek(this.locale);
    }
    get weekdayLabels() {
        const sample = new Date(Date.UTC(2024, 0, 7));
        const labels = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(sample);
            d.setUTCDate(sample.getUTCDate() + i);
            labels.push(this.weekdayFormatter.format(d));
        }
        const ws = this.weekStart;
        return [...labels.slice(ws), ...labels.slice(0, ws)];
    }
    get grid() {
        const first = new Date(this.viewYear, this.viewMonth, 1);
        const firstDayIdx = first.getDay();
        const offset = (firstDayIdx - this.weekStart + 7) % 7;
        const start = new Date(this.viewYear, this.viewMonth, 1 - offset);
        const cells = [];
        for (let i = 0; i < 42; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            cells.push({ date: this.startOfDay(d), inMonth: d.getMonth() === this.viewMonth });
        }
        return cells;
    }
    get monthLabel() {
        return this.monthFormatter.format(new Date(this.viewYear, this.viewMonth, 1));
    }
    get formattedValue() {
        if (this.mode === "single") {
            return this.value instanceof Date ? this.dateFormatter.format(this.value) : "";
        }
        if (this.value && typeof this.value === "object" && "start" in this.value) {
            const s = this.value.start ? this.dateFormatter.format(this.value.start) : "";
            const e = this.value.end ? this.dateFormatter.format(this.value.end) : "";
            if (!s && !e)
                return "";
            return `${s} - ${e}`;
        }
        return "";
    }
    today() {
        return new Date();
    }
    cellLabel(date) {
        return this.cellFormatter.format(date);
    }
    isOutOfBounds(date) {
        const d = this.startOfDay(date).getTime();
        if (this.min && d < this.startOfDay(this.min).getTime())
            return true;
        if (this.max && d > this.startOfDay(this.max).getTime())
            return true;
        return false;
    }
    isSelected(date) {
        if (this.mode === "single") {
            return this.value instanceof Date && this.isSameDay(this.value, date);
        }
        if (this.mode === "range" && this.value && typeof this.value === "object" && "start" in this.value) {
            return this.isSameDay(this.value.start, date) || this.isSameDay(this.value.end, date);
        }
        return false;
    }
    isInRange(date) {
        if (this.mode !== "range")
            return false;
        if (!this.value || typeof this.value !== "object" || !("start" in this.value))
            return false;
        const { start, end } = this.value;
        if (!start || !end)
            return false;
        const d = this.startOfDay(date).getTime();
        return d > this.startOfDay(start).getTime() && d < this.startOfDay(end).getTime();
    }
    dayClass(cell) {
        return classNames("st-datepicker__day", !cell.inMonth ? "st-datepicker__day--outside" : undefined, this.isSelected(cell.date) ? "st-datepicker__day--selected" : undefined, this.isInRange(cell.date) ? "st-datepicker__day--inRange" : undefined);
    }
    toggleOpen() {
        if (this.disabled)
            return;
        this.open = !this.open;
        if (this.open) {
            const initial = this.pickInitialMonth();
            this.viewYear = initial.getFullYear();
            this.viewMonth = initial.getMonth();
        }
    }
    onPanelKeyDown(event) {
        if (event.key === "Escape" && this.open) {
            event.preventDefault();
            this.open = false;
        }
    }
    previousMonth() {
        if (this.viewMonth === 0) {
            this.viewMonth = 11;
            this.viewYear -= 1;
        }
        else {
            this.viewMonth -= 1;
        }
    }
    nextMonth() {
        if (this.viewMonth === 11) {
            this.viewMonth = 0;
            this.viewYear += 1;
        }
        else {
            this.viewMonth += 1;
        }
    }
    pickDate(date) {
        if (this.isOutOfBounds(date))
            return;
        const picked = this.startOfDay(date);
        if (this.mode === "single") {
            this.value = picked;
            this.modelValueChange.emit(this.value);
            this.open = false;
            return;
        }
        const current = this.value && typeof this.value === "object" && "start" in this.value
            ? this.value
            : { start: null, end: null };
        if (!current.start || (current.start && current.end)) {
            this.value = { start: picked, end: null };
            this.modelValueChange.emit(this.value);
            return;
        }
        if (picked.getTime() < this.startOfDay(current.start).getTime()) {
            this.value = { start: picked, end: null };
            this.modelValueChange.emit(this.value);
            return;
        }
        this.value = { start: current.start, end: picked };
        this.modelValueChange.emit(this.value);
        this.open = false;
    }
    pickToday() {
        this.pickDate(new Date());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DatePicker, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: DatePicker, isStandalone: true, selector: "st-date-picker", inputs: { label: "label", helperText: "helperText", errorText: "errorText", invalid: "invalid", disabled: "disabled", mode: "mode", value: "value", min: "min", max: "max", locale: "locale", placeholder: "placeholder", size: "size", id: "id", openLabel: "openLabel", previousMonthLabel: "previousMonthLabel", nextMonthLabel: "nextMonthLabel", todayLabel: "todayLabel", classInput: ["class", "classInput"] }, outputs: { modelValueChange: "modelValueChange" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <label class="st-field__control" [attr.for]="fieldId">
          @if (label) {
            <span class="st-field__label">{{ label }}</span>
          }
          <span [class]="groupClass">
            <input
              [id]="fieldId"
              type="text"
              readonly
              class="st-datepicker__control"
              [value]="formattedValue"
              [placeholder]="resolvedPlaceholder"
              [disabled]="disabled ?? false"
              [attr.aria-invalid]="isInvalid ? 'true' : null"
              (click)="toggleOpen()"
            />
            <button
              type="button"
              class="st-datepicker__trigger"
              [attr.aria-label]="resolvedOpenLabel"
              aria-haspopup="dialog"
              [attr.aria-expanded]="open ? 'true' : 'false'"
              [disabled]="disabled ?? false"
              (click)="toggleOpen()"
            >
              <span aria-hidden="true">📅</span>
            </button>
          </span>
        </label>
        @if (open) {
          <div
            class="st-datepicker__panel"
            role="dialog"
            tabindex="-1"
            [attr.aria-label]="label ?? resolvedOpenLabel"
            (keydown)="onPanelKeyDown($event)"
          >
            <div class="st-datepicker__nav">
              <button
                type="button"
                class="st-datepicker__navBtn"
                [attr.aria-label]="resolvedPrevLabel"
                (click)="previousMonth()"
              >
                <span aria-hidden="true">‹</span>
              </button>
              <span class="st-datepicker__monthLabel" aria-live="polite">{{ monthLabel }}</span>
              <button
                type="button"
                class="st-datepicker__navBtn"
                [attr.aria-label]="resolvedNextLabel"
                (click)="nextMonth()"
              >
                <span aria-hidden="true">›</span>
              </button>
            </div>
            <div class="st-datepicker__grid" role="grid">
              <div class="st-datepicker__weekdays" role="row">
                @for (wd of weekdayLabels; track wd) {
                  <span class="st-datepicker__weekday" role="columnheader">{{ wd }}</span>
                }
              </div>
              <div class="st-datepicker__days">
                @for (cell of grid; track $index) {
                  <button
                    type="button"
                    [class]="dayClass(cell)"
                    [attr.aria-label]="cellLabel(cell.date)"
                    [attr.aria-pressed]="isSelected(cell.date) ? 'true' : 'false'"
                    [attr.aria-disabled]="isOutOfBounds(cell.date) ? 'true' : null"
                    [disabled]="isOutOfBounds(cell.date)"
                    (click)="pickDate(cell.date)"
                  >
                    {{ cell.date.getDate() }}
                  </button>
                }
              </div>
            </div>
            <div class="st-datepicker__footer">
              <button
                type="button"
                class="st-datepicker__todayBtn"
                [disabled]="isOutOfBounds(today())"
                (click)="pickToday()"
              >
                {{ resolvedTodayLabel }}
              </button>
            </div>
          </div>
        }
      @if (errorText) {
        <span class="st-field__error">{{ errorText }}</span>
      } @else if (helperText) {
        <span class="st-field__help">{{ helperText }}</span>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DatePicker, decorators: [{
            type: Component,
            args: [{
                    selector: "st-date-picker",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <label class="st-field__control" [attr.for]="fieldId">
          @if (label) {
            <span class="st-field__label">{{ label }}</span>
          }
          <span [class]="groupClass">
            <input
              [id]="fieldId"
              type="text"
              readonly
              class="st-datepicker__control"
              [value]="formattedValue"
              [placeholder]="resolvedPlaceholder"
              [disabled]="disabled ?? false"
              [attr.aria-invalid]="isInvalid ? 'true' : null"
              (click)="toggleOpen()"
            />
            <button
              type="button"
              class="st-datepicker__trigger"
              [attr.aria-label]="resolvedOpenLabel"
              aria-haspopup="dialog"
              [attr.aria-expanded]="open ? 'true' : 'false'"
              [disabled]="disabled ?? false"
              (click)="toggleOpen()"
            >
              <span aria-hidden="true">📅</span>
            </button>
          </span>
        </label>
        @if (open) {
          <div
            class="st-datepicker__panel"
            role="dialog"
            tabindex="-1"
            [attr.aria-label]="label ?? resolvedOpenLabel"
            (keydown)="onPanelKeyDown($event)"
          >
            <div class="st-datepicker__nav">
              <button
                type="button"
                class="st-datepicker__navBtn"
                [attr.aria-label]="resolvedPrevLabel"
                (click)="previousMonth()"
              >
                <span aria-hidden="true">‹</span>
              </button>
              <span class="st-datepicker__monthLabel" aria-live="polite">{{ monthLabel }}</span>
              <button
                type="button"
                class="st-datepicker__navBtn"
                [attr.aria-label]="resolvedNextLabel"
                (click)="nextMonth()"
              >
                <span aria-hidden="true">›</span>
              </button>
            </div>
            <div class="st-datepicker__grid" role="grid">
              <div class="st-datepicker__weekdays" role="row">
                @for (wd of weekdayLabels; track wd) {
                  <span class="st-datepicker__weekday" role="columnheader">{{ wd }}</span>
                }
              </div>
              <div class="st-datepicker__days">
                @for (cell of grid; track $index) {
                  <button
                    type="button"
                    [class]="dayClass(cell)"
                    [attr.aria-label]="cellLabel(cell.date)"
                    [attr.aria-pressed]="isSelected(cell.date) ? 'true' : 'false'"
                    [attr.aria-disabled]="isOutOfBounds(cell.date) ? 'true' : null"
                    [disabled]="isOutOfBounds(cell.date)"
                    (click)="pickDate(cell.date)"
                  >
                    {{ cell.date.getDate() }}
                  </button>
                }
              </div>
            </div>
            <div class="st-datepicker__footer">
              <button
                type="button"
                class="st-datepicker__todayBtn"
                [disabled]="isOutOfBounds(today())"
                (click)="pickToday()"
              >
                {{ resolvedTodayLabel }}
              </button>
            </div>
          </div>
        }
      @if (errorText) {
        <span class="st-field__error">{{ errorText }}</span>
      } @else if (helperText) {
        <span class="st-field__help">{{ helperText }}</span>
      }
    </div>
  `,
                }]
        }], ctorParameters: () => [], propDecorators: { label: [{
                type: NgInput
            }], helperText: [{
                type: NgInput
            }], errorText: [{
                type: NgInput
            }], invalid: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], mode: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], min: [{
                type: NgInput
            }], max: [{
                type: NgInput
            }], locale: [{
                type: NgInput
            }], placeholder: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], id: [{
                type: NgInput
            }], openLabel: [{
                type: NgInput
            }], previousMonthLabel: [{
                type: NgInput
            }], nextMonthLabel: [{
                type: NgInput
            }], todayLabel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], modelValueChange: [{
                type: Output
            }] } });
//# sourceMappingURL=DatePicker.js.map
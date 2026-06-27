import { Component, ElementRef, EventEmitter, HostListener, Input as NgInput, Output, } from "@angular/core";
import * as i0 from "@angular/core";
let _tpCounter = 0;
export class TimePicker {
    host;
    static stComponentName = "TimePicker";
    componentName = "TimePicker";
    fieldId;
    listId;
    constructor(host) {
        this.host = host;
        _tpCounter++;
        this.fieldId = "st-timepicker-" + _tpCounter;
        this.listId = this.fieldId + "-list";
    }
    value = "";
    modelValue;
    onChange;
    step = 15;
    min;
    max;
    format = "24";
    size = "md";
    disabled = false;
    label;
    id;
    modelValueChange = new EventEmitter();
    open = false;
    activeIndex = -1;
    get currentValue() {
        return this.modelValue ?? this.value ?? "";
    }
    get groupClasses() {
        return `st-timepicker st-timepicker--${this.size}`;
    }
    get placeholderText() {
        return this.format === "24" ? "HH:mm" : "hh:mm AM";
    }
    get displayValue() {
        return this.currentValue ? this.display(this.currentValue) : "";
    }
    get activeDescendant() {
        return this.open && this.activeIndex >= 0
            ? `${this.listId}-opt-${this.activeIndex}`
            : null;
    }
    get slots() {
        const safeStep = this.step > 0 ? this.step : 15;
        const lower = this.toMinutes(this.min) ?? 0;
        const upper = this.toMinutes(this.max) ?? 23 * 60 + 59;
        const result = [];
        for (let t = lower; t <= upper; t += safeStep) {
            result.push(this.fromMinutes(t));
        }
        return result;
    }
    toMinutes(hhmm) {
        if (!hhmm)
            return null;
        const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
        if (!match)
            return null;
        const h = Number(match[1]);
        const m = Number(match[2]);
        if (h < 0 || h > 23 || m < 0 || m > 59)
            return null;
        return h * 60 + m;
    }
    fromMinutes(total) {
        const h = Math.floor(total / 60);
        const m = total % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    display(hhmm) {
        if (this.format === "24")
            return hhmm;
        const total = this.toMinutes(hhmm);
        if (total === null)
            return hhmm;
        const h24 = Math.floor(total / 60);
        const m = total % 60;
        const period = h24 < 12 ? "AM" : "PM";
        let h12 = h24 % 12;
        if (h12 === 0)
            h12 = 12;
        return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
    }
    openList() {
        if (this.disabled)
            return;
        this.open = true;
        const idx = this.currentValue ? this.slots.indexOf(this.currentValue) : -1;
        this.activeIndex = idx >= 0 ? idx : 0;
    }
    closeList(returnFocus = true) {
        this.open = false;
        this.activeIndex = -1;
        if (returnFocus)
            this.focusInput();
    }
    toggleOpen() {
        if (this.disabled)
            return;
        if (this.open)
            this.closeList(true);
        else
            this.openList();
    }
    pick(slot) {
        this.value = slot;
        this.modelValue = slot;
        this.modelValueChange.emit(slot);
        this.onChange?.(slot);
        this.closeList(true);
    }
    focusInput() {
        const input = this.host.nativeElement.querySelector(`#${this.fieldId}`);
        input?.focus();
    }
    scrollActiveIntoView() {
        if (this.activeIndex < 0)
            return;
        const optEl = this.host.nativeElement.querySelector(`#${this.listId}-opt-${this.activeIndex}`);
        if (optEl && typeof optEl.scrollIntoView === "function") {
            optEl.scrollIntoView({ block: "nearest" });
        }
    }
    onInputKeyDown(event) {
        if (this.disabled)
            return;
        const last = this.slots.length - 1;
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                if (!this.open)
                    this.openList();
                else {
                    this.activeIndex = Math.min(this.activeIndex + 1, last);
                    this.scrollActiveIntoView();
                }
                break;
            case "ArrowUp":
                event.preventDefault();
                if (!this.open)
                    this.openList();
                else {
                    this.activeIndex = Math.max(this.activeIndex - 1, 0);
                    this.scrollActiveIntoView();
                }
                break;
            case "Home":
                event.preventDefault();
                if (!this.open)
                    this.openList();
                else {
                    this.activeIndex = 0;
                    this.scrollActiveIntoView();
                }
                break;
            case "End":
                event.preventDefault();
                if (!this.open)
                    this.openList();
                else {
                    this.activeIndex = last;
                    this.scrollActiveIntoView();
                }
                break;
            case "Enter":
            case " ":
                event.preventDefault();
                if (!this.open)
                    this.openList();
                else if (this.activeIndex >= 0 && this.activeIndex <= last) {
                    this.pick(this.slots[this.activeIndex]);
                }
                break;
            case "Escape":
                if (this.open) {
                    event.preventDefault();
                    this.closeList(true);
                }
                break;
        }
    }
    onListKeyDown(event) {
        const last = this.slots.length - 1;
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                this.activeIndex = Math.min(this.activeIndex + 1, last);
                this.scrollActiveIntoView();
                break;
            case "ArrowUp":
                event.preventDefault();
                this.activeIndex = Math.max(this.activeIndex - 1, 0);
                this.scrollActiveIntoView();
                break;
            case "Home":
                event.preventDefault();
                this.activeIndex = 0;
                this.scrollActiveIntoView();
                break;
            case "End":
                event.preventDefault();
                this.activeIndex = last;
                this.scrollActiveIntoView();
                break;
            case "Enter":
            case " ":
                event.preventDefault();
                if (this.activeIndex >= 0 && this.activeIndex <= last) {
                    this.pick(this.slots[this.activeIndex]);
                }
                break;
            case "Escape":
                event.preventDefault();
                this.closeList(true);
                break;
        }
    }
    onDocumentMouseDown(event) {
        if (!this.open)
            return;
        const target = event.target;
        if (target && !this.host.nativeElement.contains(target)) {
            this.closeList(false);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TimePicker, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: TimePicker, isStandalone: true, selector: "st-time-picker", inputs: { value: "value", modelValue: "modelValue", onChange: "onChange", step: "step", min: "min", max: "max", format: "format", size: "size", disabled: "disabled", label: "label", id: "id" }, outputs: { modelValueChange: "modelValueChange" }, host: { listeners: { "document:mousedown": "onDocumentMouseDown($event)" } }, ngImport: i0, template: `
    <div class="st-field" [attr.data-st-component]="componentName">
      <div class="st-field__control">
        @if (label) {
          <label class="st-field__label" [attr.for]="fieldId">{{ label }}</label>
        }
        <span [class]="groupClasses">
          <input
            #inputEl
            [id]="fieldId"
            type="text"
            readonly
            class="st-timepicker__control"
            [value]="displayValue"
            [attr.placeholder]="placeholderText"
            [disabled]="disabled"
            role="combobox"
            aria-haspopup="listbox"
            [attr.aria-controls]="listId"
            [attr.aria-expanded]="open ? 'true' : 'false'"
            [attr.aria-activedescendant]="activeDescendant"
            aria-autocomplete="none"
            (click)="toggleOpen()"
            (keydown)="onInputKeyDown($event)"
          />
          <button
            type="button"
            class="st-timepicker__trigger"
            aria-label="Ouvrir la liste des horaires"
            aria-haspopup="listbox"
            [attr.aria-expanded]="open ? 'true' : 'false'"
            tabindex="-1"
            [disabled]="disabled"
            (click)="toggleOpen()"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M12 6v6l4 2" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </button>
        </span>
      </div>
      @if (open) {
        <ul
          #listEl
          [id]="listId"
          class="st-timepicker__list"
          role="listbox"
          [attr.aria-label]="label ?? 'Horaires'"
          tabindex="-1"
          (keydown)="onListKeyDown($event)"
        >
          @for (slot of slots; track slot; let i = $index) {
            <li role="presentation">
              <div
                [id]="listId + '-opt-' + i"
                class="st-timepicker__option"
                [class.st-timepicker__option--selected]="slot === currentValue"
                [class.st-timepicker__option--active]="i === activeIndex"
                role="option"
                [attr.aria-selected]="slot === currentValue ? 'true' : 'false'"
                tabindex="-1"
                (mousedown)="$event.preventDefault()"
                (click)="pick(slot)"
                (mouseenter)="activeIndex = i"
              >{{ display(slot) }}</div>
            </li>
          }
        </ul>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TimePicker, decorators: [{
            type: Component,
            args: [{
                    selector: "st-time-picker",
                    standalone: true,
                    template: `
    <div class="st-field" [attr.data-st-component]="componentName">
      <div class="st-field__control">
        @if (label) {
          <label class="st-field__label" [attr.for]="fieldId">{{ label }}</label>
        }
        <span [class]="groupClasses">
          <input
            #inputEl
            [id]="fieldId"
            type="text"
            readonly
            class="st-timepicker__control"
            [value]="displayValue"
            [attr.placeholder]="placeholderText"
            [disabled]="disabled"
            role="combobox"
            aria-haspopup="listbox"
            [attr.aria-controls]="listId"
            [attr.aria-expanded]="open ? 'true' : 'false'"
            [attr.aria-activedescendant]="activeDescendant"
            aria-autocomplete="none"
            (click)="toggleOpen()"
            (keydown)="onInputKeyDown($event)"
          />
          <button
            type="button"
            class="st-timepicker__trigger"
            aria-label="Ouvrir la liste des horaires"
            aria-haspopup="listbox"
            [attr.aria-expanded]="open ? 'true' : 'false'"
            tabindex="-1"
            [disabled]="disabled"
            (click)="toggleOpen()"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M12 6v6l4 2" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </button>
        </span>
      </div>
      @if (open) {
        <ul
          #listEl
          [id]="listId"
          class="st-timepicker__list"
          role="listbox"
          [attr.aria-label]="label ?? 'Horaires'"
          tabindex="-1"
          (keydown)="onListKeyDown($event)"
        >
          @for (slot of slots; track slot; let i = $index) {
            <li role="presentation">
              <div
                [id]="listId + '-opt-' + i"
                class="st-timepicker__option"
                [class.st-timepicker__option--selected]="slot === currentValue"
                [class.st-timepicker__option--active]="i === activeIndex"
                role="option"
                [attr.aria-selected]="slot === currentValue ? 'true' : 'false'"
                tabindex="-1"
                (mousedown)="$event.preventDefault()"
                (click)="pick(slot)"
                (mouseenter)="activeIndex = i"
              >{{ display(slot) }}</div>
            </li>
          }
        </ul>
      }
    </div>
  `,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }], propDecorators: { value: [{
                type: NgInput
            }], modelValue: [{
                type: NgInput
            }], onChange: [{
                type: NgInput
            }], step: [{
                type: NgInput
            }], min: [{
                type: NgInput
            }], max: [{
                type: NgInput
            }], format: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], id: [{
                type: NgInput
            }], modelValueChange: [{
                type: Output
            }], onDocumentMouseDown: [{
                type: HostListener,
                args: ["document:mousedown", ["$event"]]
            }] } });
//# sourceMappingURL=TimePicker.js.map
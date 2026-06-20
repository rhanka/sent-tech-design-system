import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type DatePickerSize = "sm" | "md" | "lg";

export type DatePickerRange = { start: Date | null; end: Date | null };

export type DatePickerValue = Date | DatePickerRange | null;

export type DatePickerProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  invalid?: boolean;
  disabled?: boolean;
  mode?: "single" | "range";
  modelValue?: DatePickerValue;
  value?: string;
  min?: string;
  max?: string;
  locale?: string;
  placeholder?: string;
  size?: DatePickerSize;
  id?: string;
  openLabel?: string;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
  todayLabel?: string;
  class?: string;
};

let _dpCounter = 0;

@Component({
  selector: "st-date-picker",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label) {
        <label class="st-field__label" [attr.for]="fieldId">{{ label }}</label>
      }
      <input
        type="date"
        class="st-datePicker"
        [id]="fieldId"
        [value]="currentValue"
        [attr.min]="min ?? null"
        [attr.max]="max ?? null"
        [disabled]="disabled ?? false"
        (input)="onInput($event)"
      />
      @if (errorText && invalid) {
        <span class="st-field__error">{{ errorText }}</span>
      }
    </div>
  `,
})
export class DatePicker {
  static readonly stComponentName = "DatePicker";
  readonly componentName = "DatePicker";
  readonly fieldId: string;

  constructor() {
    _dpCounter++;
    this.fieldId = "st-date-picker-" + _dpCounter;
  }

  @NgInput() label?: unknown;
  @NgInput() helperText?: unknown;
  @NgInput() errorText?: unknown;
  @NgInput() invalid?: boolean;
  @NgInput() disabled?: boolean;
  @NgInput() mode?: "single" | "range";
  @NgInput() modelValue?: DatePickerValue;
  @NgInput() value?: string;
  @NgInput() min?: string;
  @NgInput() max?: string;
  @NgInput() locale?: string;
  @NgInput() placeholder?: string;
  @NgInput() size?: DatePickerSize;
  @NgInput() id?: string;
  @NgInput() openLabel?: string;
  @NgInput() previousMonthLabel?: string;
  @NgInput() nextMonthLabel?: string;
  @NgInput() todayLabel?: string;
  @NgInput("class") classInput?: string;

  @Output() readonly modelValueChange = new EventEmitter<string>();

  get currentValue(): string {
    if (typeof this.value === "string") return this.value;
    return "";
  }

  get hostClass(): string {
    return classNames(
      "st-field",
      this.size ? `st-field--${this.size}` : undefined,
      this.invalid ? "st-field--invalid" : undefined,
      this.classInput,
    );
  }

  onInput(e: Event): void {
    this.modelValueChange.emit((e.target as HTMLInputElement).value);
  }
}

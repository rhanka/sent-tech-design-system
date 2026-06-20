import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type TimePickerFormat = "24" | "12";

export type TimePickerSize = "sm" | "md" | "lg";

export type TimePickerProps = {
  value?: string;
  modelValue?: string;
  onChange?: (value: string) => void;
  step?: number;
  min?: string;
  max?: string;
  format?: TimePickerFormat;
  size?: TimePickerSize;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  invalid?: boolean;
  errorText?: string;
  class?: string;
  id?: string;
};

let _tpCounter = 0;

@Component({
  selector: "st-time-picker",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label) {
        <label class="st-field__label" [attr.for]="fieldId">{{ label }}</label>
      }
      <input
        type="time"
        class="st-timePicker"
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
export class TimePicker {
  static readonly stComponentName = "TimePicker";
  readonly componentName = "TimePicker";
  readonly fieldId: string;

  constructor() {
    _tpCounter++;
    this.fieldId = "st-time-picker-" + _tpCounter;
  }

  @NgInput() value?: string;
  @NgInput() modelValue?: string;
  @NgInput() onChange?: (value: string) => void;
  @NgInput() step?: number;
  @NgInput() min?: string;
  @NgInput() max?: string;
  @NgInput() format?: TimePickerFormat;
  @NgInput() size?: TimePickerSize;
  @NgInput() disabled?: boolean;
  @NgInput() label?: string;
  @NgInput() placeholder?: string;
  @NgInput() invalid?: boolean;
  @NgInput() errorText?: string;
  @NgInput("class") classInput?: string;
  @NgInput() id?: string;

  @Output() readonly modelValueChange = new EventEmitter<string>();

  get currentValue(): string {
    return this.modelValue ?? this.value ?? "";
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
    const val = (e.target as HTMLInputElement).value;
    this.modelValueChange.emit(val);
    this.onChange?.(val);
  }
}

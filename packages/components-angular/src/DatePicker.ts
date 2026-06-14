import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type DatePickerSize = "sm" | "md" | "lg";

// Range value shape mirrors the Svelte canonical contract: both bounds are
// `Date | null` (`null` = not yet picked).
export type DatePickerRange = { start: Date | null; end: Date | null };

// Canonical value type, identical to the Svelte DatePicker.
export type DatePickerValue = Date | DatePickerRange | null;

export type DatePickerProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  invalid?: boolean;
  disabled?: boolean;
  mode?: "single" | "range";
  /** `v-model` value (`Date | {start,end} | null`). */
  modelValue?: DatePickerValue;
  min?: Date;
  max?: Date;
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

@Component({
  selector: "st-date-picker",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class DatePicker {
  static readonly stComponentName = "DatePicker";
  readonly componentName = "DatePicker";
  @NgInput() label?: unknown;
  @NgInput() helperText?: unknown;
  @NgInput() errorText?: unknown;
  @NgInput() invalid?: boolean;
  @NgInput() disabled?: boolean;
  @NgInput() mode?: "single" | "range";
  @NgInput() modelValue?: DatePickerValue;
  @NgInput() min?: Date;
  @NgInput() max?: Date;
  @NgInput() locale?: string;
  @NgInput() placeholder?: string;
  @NgInput() size?: DatePickerSize;
  @NgInput() id?: string;
  @NgInput() openLabel?: string;
  @NgInput() previousMonthLabel?: string;
  @NgInput() nextMonthLabel?: string;
  @NgInput() todayLabel?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-datePicker", this.classInput].filter(Boolean).join(" ");
  }
}

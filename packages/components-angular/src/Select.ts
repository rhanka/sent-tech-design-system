import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type SelectSize = "sm" | "md" | "lg";

export type SelectOption = {
  value: string;
  label: unknown;
  disabled?: boolean;
};

export type SelectProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  invalid?: boolean;
  size?: SelectSize;
  options?: SelectOption[];
  modelValue?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  class?: string;
};

let _counter = 0;

@Component({
  selector: "st-select",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label) {
        <label class="st-field__label" [attr.for]="selectId">{{ label }}</label>
      }
      <select
        class="st-select"
        [id]="selectId"
        [value]="currentValue"
        [disabled]="disabled ?? false"
        (change)="onChange($event)"
      >
        @if (placeholder) {
          <option value="" disabled selected>{{ placeholder }}</option>
        }
        @for (opt of options ?? []; track opt.value) {
          <option [value]="opt.value" [disabled]="opt.disabled ?? false">{{ opt.label }}</option>
        }
      </select>
      @if (helperText && !invalid) {
        <span class="st-field__helper">{{ helperText }}</span>
      }
      @if (errorText && invalid) {
        <span class="st-field__error">{{ errorText }}</span>
      }
    </div>
  `,
})
export class Select {
  static readonly stComponentName = "Select";
  readonly componentName = "Select";
  readonly selectId: string;

  constructor() {
    _counter++;
    this.selectId = "st-select-" + _counter;
  }

  @NgInput() label?: unknown;
  @NgInput() helperText?: unknown;
  @NgInput() errorText?: unknown;
  @NgInput() invalid?: boolean;
  @NgInput() size?: SelectSize;
  @NgInput() options?: SelectOption[];
  @NgInput() modelValue?: string;
  @NgInput() value?: string;
  @NgInput() placeholder?: string;
  @NgInput() disabled?: boolean;
  @NgInput("class") classInput?: string;

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

  onChange(e: Event): void {
    this.modelValueChange.emit((e.target as HTMLSelectElement).value);
  }
}

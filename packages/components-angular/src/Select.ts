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
      <label class="st-field__control">
        @if (label) {
          <span class="st-field__label">{{ label }}</span>
        }
        <select
          [class]="controlClass"
          [id]="selectId"
          [value]="currentValue"
          [disabled]="disabled ?? false"
          [attr.aria-invalid]="isInvalid ? 'true' : null"
          (change)="onChange($event)"
        >
          @if (placeholder) {
            <option value="" disabled selected>{{ placeholder }}</option>
          }
          @for (opt of options ?? []; track opt.value) {
            <option [value]="opt.value" [disabled]="opt.disabled ?? false">{{ opt.label }}</option>
          }
          <ng-content></ng-content>
        </select>
      </label>
      @if (errorText) {
        <span class="st-field__error">{{ errorText }}</span>
      } @else if (helperText) {
        <span class="st-field__help">{{ helperText }}</span>
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

  get isInvalid(): boolean {
    return Boolean(this.invalid) || Boolean(this.errorText);
  }

  get hostClass(): string {
    return classNames("st-field", this.classInput);
  }

  get controlClass(): string {
    return classNames("st-select", `st-select--${this.size ?? "md"}`);
  }

  onChange(e: Event): void {
    this.modelValueChange.emit((e.target as HTMLSelectElement).value);
  }
}

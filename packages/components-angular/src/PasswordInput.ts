import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type PasswordInputSize = "sm" | "md" | "lg";

export type PasswordInputProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  size?: PasswordInputSize;
  modelValue?: string;
  disabled?: boolean;
  placeholder?: string;
  showLabel?: string;
  hideLabel?: string;
  class?: string;
};

let _counter = 0;
function nextId(): string {
  return `st-passwordInput-${++_counter}`;
}

@Component({
  selector: "st-password-input",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <label class="st-field__control" [attr.for]="inputId">
        @if (label) {
          <span class="st-field__label">{{ label }}</span>
        }
        <span [class]="controlWrapClass">
          <input
            [id]="inputId"
            class="st-passwordInput__control"
            [type]="inputType"
            [value]="currentValue"
            [placeholder]="placeholder ?? ''"
            [disabled]="disabled ?? false"
            [attr.aria-invalid]="isInvalid ? 'true' : null"
            (input)="onInput($event)"
            (change)="change.emit($event)"
          />
          <button
            type="button"
            class="st-passwordInput__toggle"
            [attr.aria-label]="showPassword ? (hideLabel ?? 'Hide password') : (showLabel ?? 'Show password')"
            [attr.aria-pressed]="showPassword ? 'true' : 'false'"
            (click)="toggleVisibility()"
          >
            @if (showPassword) {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            } @else {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            }
          </button>
        </span>
      </label>
      @if (errorText) {
        <span class="st-field__error">{{ errorText }}</span>
      }
      @if (!errorText && helperText) {
        <span class="st-field__help">{{ helperText }}</span>
      }
    </div>
  `,
})
export class PasswordInput {
  static readonly stComponentName = "PasswordInput";
  readonly componentName = "PasswordInput";
  private readonly autoId = nextId();

  showPassword = false;

  @NgInput() label?: unknown;
  @NgInput() helperText?: unknown;
  @NgInput() errorText?: unknown;
  @NgInput() size?: PasswordInputSize;
  @NgInput() modelValue?: string;
  @NgInput() value?: string;
  @NgInput() disabled?: boolean;
  @NgInput() placeholder?: string;
  @NgInput() showLabel?: string;
  @NgInput() hideLabel?: string;
  @NgInput("class") classInput?: string;

  @Output() readonly modelValueChange = new EventEmitter<string>();
  @Output("update:modelValue") readonly updateModelValue = new EventEmitter<string>();
  @Output() readonly input = new EventEmitter<Event>();
  @Output() readonly change = new EventEmitter<Event>();

  get inputId(): string {
    return this.autoId;
  }

  get inputType(): string {
    return this.showPassword ? "text" : "password";
  }

  get currentValue(): string {
    return this.modelValue ?? this.value ?? "";
  }

  get isInvalid(): boolean {
    return Boolean(this.errorText);
  }

  get controlWrapClass(): string {
    return classNames("st-passwordInput", `st-passwordInput--${this.size ?? "md"}`);
  }

  get hostClass(): string {
    return classNames("st-field", this.classInput);
  }

  toggleVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.modelValueChange.emit(val);
    this.updateModelValue.emit(val);
    this.input.emit(event);
  }
}

import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type InputSize = "sm" | "md" | "lg";

export type InputProps = {
  label?: string;
  helperText?: string;
  errorText?: string;
  invalid?: boolean;
  size?: InputSize;
  id?: string;
  class?: string;
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
};

let _counter = 0;
function nextId(): string {
  return `st-input-${++_counter}`;
}

@Component({
  selector: "st-input",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <label class="st-field__control" [attr.for]="inputId">
        @if (label) {
          <span class="st-field__label">{{ label }}</span>
        }
        <input
          [id]="inputId"
          [class]="controlClass"
          [type]="type"
          [value]="currentValue"
          [placeholder]="placeholder ?? ''"
          [disabled]="disabled ?? false"
          [attr.readonly]="readonly ? '' : null"
          [attr.required]="required ? '' : null"
          [attr.name]="name"
          [attr.aria-invalid]="isInvalid ? 'true' : null"
          (input)="onInput($event)"
          (change)="change.emit($event)"
        />
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
export class Input {
  static readonly stComponentName = "Input";
  readonly componentName = "Input";
  private readonly autoId = nextId();

  @NgInput() label?: string;
  @NgInput() helperText?: string;
  @NgInput() errorText?: string;
  @NgInput() invalid?: boolean;
  @NgInput() size?: InputSize;
  @NgInput() id?: string;
  @NgInput() modelValue?: string;
  @NgInput() value?: string;
  @NgInput() placeholder?: string;
  @NgInput() disabled?: boolean;
  @NgInput() readonly?: boolean;
  @NgInput() required?: boolean;
  @NgInput() name?: string;
  @NgInput() type = "text";
  @NgInput("class") classInput?: string;

  @Output() readonly modelValueChange = new EventEmitter<string>();
  @Output("update:modelValue") readonly updateModelValue = new EventEmitter<string>();
  @Output() readonly input = new EventEmitter<Event>();
  @Output() readonly change = new EventEmitter<Event>();

  get inputId(): string {
    return this.id ?? this.autoId;
  }

  get currentValue(): string {
    return this.modelValue ?? this.value ?? "";
  }

  get isInvalid(): boolean {
    return this.invalid ?? Boolean(this.errorText);
  }

  get controlClass(): string {
    return classNames("st-control", `st-control--${this.size ?? "md"}`);
  }

  get hostClass(): string {
    return classNames("st-field", this.classInput);
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.modelValueChange.emit(val);
    this.updateModelValue.emit(val);
    this.input.emit(event);
  }
}

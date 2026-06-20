import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type TextareaProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  invalid?: boolean;
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  rows?: number;
  class?: string;
};

let _counter = 0;
function nextId(): string {
  return `st-textarea-${++_counter}`;
}

@Component({
  selector: "st-textarea",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <label class="st-field__control" [attr.for]="inputId">
        @if (label) {
          <span class="st-field__label">{{ label }}</span>
        }
        <textarea
          [id]="inputId"
          class="st-textarea st-control"
          [value]="currentValue"
          [placeholder]="placeholder ?? ''"
          [disabled]="disabled ?? false"
          [attr.readonly]="readonly ? '' : null"
          [attr.rows]="rows"
          [attr.aria-invalid]="isInvalid ? 'true' : null"
          (input)="onInput($event)"
          (change)="change.emit($event)"
        ></textarea>
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
export class Textarea {
  static readonly stComponentName = "Textarea";
  readonly componentName = "Textarea";
  private readonly autoId = nextId();

  @NgInput() label?: unknown;
  @NgInput() helperText?: unknown;
  @NgInput() errorText?: unknown;
  @NgInput() invalid?: boolean;
  @NgInput() modelValue?: string;
  @NgInput() value?: string;
  @NgInput() placeholder?: string;
  @NgInput() disabled?: boolean;
  @NgInput() readonly?: boolean;
  @NgInput() rows?: number;
  @NgInput("class") classInput?: string;

  @Output() readonly modelValueChange = new EventEmitter<string>();
  @Output("update:modelValue") readonly updateModelValue = new EventEmitter<string>();
  @Output() readonly input = new EventEmitter<Event>();
  @Output() readonly change = new EventEmitter<Event>();

  get inputId(): string {
    return this.autoId;
  }

  get currentValue(): string {
    return this.modelValue ?? this.value ?? "";
  }

  get isInvalid(): boolean {
    return this.invalid ?? Boolean(this.errorText);
  }

  get hostClass(): string {
    return classNames("st-field", this.classInput);
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.modelValueChange.emit(val);
    this.updateModelValue.emit(val);
    this.input.emit(event);
  }
}

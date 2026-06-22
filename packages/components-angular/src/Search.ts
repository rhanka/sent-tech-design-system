import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type SearchSize = "sm" | "md" | "lg";

export type SearchProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  invalid?: boolean;
  size?: SearchSize;
  modelValue?: string;
  /** Svelte/React-canonical alias for `modelValue`. */
  value?: string;
  placeholder?: string;
  clearLabel?: string;
  /** Lift the field max-width cap so it fills a narrow drawer/rail (width 100%). */
  fluid?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  autocomplete?: string;
  required?: boolean;
  readonly?: boolean;
  inputmode?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  class?: string;
};

let counter = 0;
function nextId(): string {
  counter += 1;
  return `st-search-${counter}`;
}

@Component({
  selector: "st-search",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <label class="st-field__control">
        @if (label) {
          <span class="st-field__label">{{ label }}</span>
        }
        <span [class]="groupClass">
          <span class="st-search__icon" aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </span>
          <input
            [id]="inputId"
            class="st-search__control"
            type="search"
            [value]="currentValue"
            [placeholder]="placeholder"
            [disabled]="disabled"
            [attr.name]="name"
            [attr.autocomplete]="autocomplete"
            [attr.required]="required ? '' : null"
            [attr.readonly]="readOnly ? '' : null"
            [attr.inputmode]="inputMode"
            [attr.aria-label]="ariaLabel"
            [attr.aria-describedby]="ariaDescribedBy"
            [attr.aria-invalid]="isInvalid ? 'true' : null"
            (input)="handleInput($event)"
            (change)="change.emit($event)"
          />
          @if (currentValue) {
            <button
              type="button"
              class="st-search__clear"
              [attr.aria-label]="clearLabelText"
              [disabled]="disabled"
              (click)="handleClear()"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12"></path>
              </svg>
            </button>
          }
        </span>
      </label>
      @if (errorText) {
        <span class="st-field__error">{{ errorText }}</span>
      } @else if (helperText) {
        <span class="st-field__help">{{ helperText }}</span>
      }
    </div>
  `,
})
export class Search {
  static readonly stComponentName = "Search";
  readonly componentName = "Search";
  private readonly autoId = nextId();

  @NgInput() label?: unknown;
  @NgInput() helperText?: unknown;
  @NgInput() errorText?: unknown;
  @NgInput() invalid?: boolean;
  @NgInput() size?: SearchSize;
  @NgInput() modelValue?: string;
  @NgInput() value?: string;
  @NgInput() placeholder?: string;
  @NgInput() clearLabel?: string;
  @NgInput() fluid?: boolean;
  @NgInput() disabled?: boolean;
  @NgInput() id?: string;
  @NgInput() name?: string;
  @NgInput() autocomplete?: string;
  @NgInput() required?: boolean;
  @NgInput("readonly") readOnly?: boolean;
  @NgInput("inputmode") inputMode?: string;
  @NgInput("aria-label") ariaLabel?: string;
  @NgInput("aria-describedby") ariaDescribedBy?: string;
  @NgInput("class") classInput?: string;

  @Output() readonly modelValueChange = new EventEmitter<string>();
  @Output("update:modelValue") readonly updateModelValue = new EventEmitter<string>();
  @Output() readonly input = new EventEmitter<Event>();
  @Output() readonly change = new EventEmitter<Event>();
  @Output() readonly clear = new EventEmitter<void>();

  get inputId(): string {
    return this.id ?? this.autoId;
  }

  get currentValue(): string {
    return this.modelValue ?? this.value ?? "";
  }

  get clearLabelText(): string {
    return this.clearLabel || "Clear search";
  }

  get isInvalid(): boolean {
    return Boolean(this.invalid) || Boolean(this.errorText);
  }

  get hostClass(): string {
    return classNames(
      "st-field",
      this.fluid ? "st-search--fluid" : undefined,
      this.classInput,
    );
  }

  get groupClass(): string {
    return classNames("st-search", `st-search--${this.size ?? "md"}`);
  }

  handleInput(event: Event): void {
    const target = event.target as { value?: unknown } | null;
    const next = typeof target?.value === "string" ? target.value : "";
    this.emitModelValue(next);
    this.input.emit(event);
  }

  handleClear(): void {
    this.emitModelValue("");
    this.clear.emit();
  }

  private emitModelValue(next: string): void {
    this.modelValueChange.emit(next);
    this.updateModelValue.emit(next);
  }
}

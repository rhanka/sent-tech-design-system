import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type ComboboxOption = {
  value: string;
  label: unknown;
  disabled?: boolean;
};

export type ComboboxSize = "sm" | "md" | "lg";

export type ComboboxProps = {
  label?: unknown;
  helperText?: string;
  errorText?: string;
  invalid?: boolean;
  options: ComboboxOption[];
  value?: string;
  modelValue?: string;
  size?: ComboboxSize;
  placeholder?: string;
  disabled?: boolean;
  open?: boolean;
  allowCustomValue?: boolean;
  noResultsLabel?: unknown;
  listLabel?: string;
  clearLabel?: string;
  toggleLabel?: string;
  class?: string;
};

let _counter = 0;

@Component({
  selector: "st-combobox",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <label class="st-field__control" [attr.for]="inputId">
        @if (label) {
          <span class="st-field__label">{{ label }}</span>
        }
        <span [class]="boxClass">
          <input
            [id]="inputId"
            class="st-combobox__control"
            role="combobox"
            aria-autocomplete="list"
            [attr.aria-expanded]="isOpen"
            [attr.aria-controls]="listId"
            [attr.aria-invalid]="isInvalid ? 'true' : null"
            [value]="displayValue"
            [placeholder]="placeholder ?? 'Select or type'"
            [disabled]="disabled ?? false"
            (input)="onSearch($event)"
            (focus)="onFocus()"
            (blur)="onBlur()"
          />
          @if (displayValue) {
            <button
              type="button"
              class="st-combobox__clear"
              [attr.aria-label]="clearLabel ?? 'Clear selection'"
              [disabled]="disabled ?? false"
              (mousedown)="onClear($event)"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.25"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              ><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
            </button>
          }
          <button
            type="button"
            class="st-combobox__toggle"
            [attr.aria-label]="toggleLabel ?? 'Toggle options'"
            [attr.aria-expanded]="isOpen"
            [disabled]="disabled ?? false"
            (mousedown)="onToggle($event)"
          >
            <svg
              [class]="toggleIconClass"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.25"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            ><path d="m6 9 6 6 6-6"></path></svg>
          </button>
        </span>
      </label>
      @if (isOpen) {
        <div [id]="listId" class="st-combobox__list" role="listbox" [attr.aria-label]="listLabel ?? labelText ?? 'Options'">
          @if (filteredOptions.length) {
            @for (opt of filteredOptions; track opt.value) {
              <button
                type="button"
                [id]="listId + '-' + opt.value"
                class="st-combobox__option"
                role="option"
                [attr.aria-selected]="displayValue === optLabel(opt)"
                [attr.aria-disabled]="opt.disabled ? 'true' : null"
                [disabled]="opt.disabled ?? false"
                (mousedown)="select(opt, $event)"
              >{{ opt.label }}</button>
            }
          } @else {
            <div class="st-combobox__empty" role="option" aria-disabled="true" aria-selected="false">{{ noResultsLabel ?? 'No results' }}</div>
          }
        </div>
      }
      @if (errorText) {
        <span class="st-field__error">{{ errorText }}</span>
      } @else if (helperText) {
        <span class="st-field__help">{{ helperText }}</span>
      }
    </div>
  `,
})
export class Combobox {
  static readonly stComponentName = "Combobox";
  readonly componentName = "Combobox";
  readonly inputId: string;
  readonly listId: string;

  isOpen = false;
  search = "";
  private searchTouched = false;

  constructor() {
    _counter++;
    this.inputId = "st-combobox-input-" + _counter;
    this.listId = "st-combobox-list-" + _counter;
  }

  @NgInput() label?: unknown;
  @NgInput() helperText?: string;
  @NgInput() errorText?: string;
  @NgInput() invalid?: boolean;
  @NgInput() options: ComboboxOption[] = [];
  @NgInput() value?: string;
  @NgInput() modelValue?: string;
  @NgInput() size?: ComboboxSize;
  @NgInput() placeholder?: string;
  @NgInput() disabled?: boolean;
  @NgInput() open?: boolean;
  @NgInput() allowCustomValue?: boolean;
  @NgInput() noResultsLabel?: unknown;
  @NgInput() listLabel?: string;
  @NgInput() clearLabel?: string;
  @NgInput() toggleLabel?: string;
  @NgInput("class") classInput?: string;

  @Output() readonly valueChange = new EventEmitter<string>();

  get hostClass(): string {
    return classNames("st-field", this.classInput);
  }

  get boxClass(): string {
    return classNames("st-combobox", `st-combobox--${this.size ?? "md"}`);
  }

  get toggleIconClass(): string {
    return classNames("st-combobox__toggleIcon", this.isOpen ? "st-combobox__toggleIcon--open" : undefined);
  }

  get isInvalid(): boolean {
    return Boolean(this.invalid) || Boolean(this.errorText);
  }

  get labelText(): string | undefined {
    return this.label === undefined || this.label === null ? undefined : String(this.label);
  }

  get selectedOption(): ComboboxOption | undefined {
    const v = this.value ?? this.modelValue;
    return (this.options ?? []).find((o) => o.value === v);
  }

  get displayValue(): string {
    if (this.searchTouched) return this.search;
    const selected = this.selectedOption;
    if (selected) return this.optLabel(selected);
    return this.search;
  }

  get filteredOptions(): ComboboxOption[] {
    const query = this.displayValue.trim().toLowerCase();
    return (this.options ?? []).filter((o) => !query || this.optLabel(o).toLowerCase().includes(query));
  }

  optLabel(opt: ComboboxOption): string {
    return opt.label === undefined || opt.label === null ? "" : String(opt.label);
  }

  onFocus(): void {
    if (!this.disabled) this.isOpen = true;
  }

  onSearch(e: Event): void {
    this.search = (e.target as HTMLInputElement).value;
    this.searchTouched = true;
    this.isOpen = true;
  }

  onBlur(): void {
    setTimeout(() => {
      this.isOpen = false;
    }, 150);
  }

  onToggle(e: Event): void {
    e.preventDefault();
    this.isOpen = !this.isOpen;
  }

  onClear(e: Event): void {
    e.preventDefault();
    this.search = "";
    this.searchTouched = true;
    this.valueChange.emit("");
  }

  select(opt: ComboboxOption, e: Event): void {
    e.preventDefault();
    if (opt.disabled) return;
    this.search = this.optLabel(opt);
    this.searchTouched = true;
    this.valueChange.emit(opt.value);
    this.isOpen = false;
  }
}

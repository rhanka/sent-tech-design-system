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
  class?: string;
};

@Component({
  selector: "st-combobox",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-field">
        @if (label) {
          <label>{{ label }}</label>
        }
        <input
          type="text"
          class="st-combobox__input"
          [value]="search"
          [placeholder]="placeholder ?? ''"
          [disabled]="disabled ?? false"
          (input)="onSearch($event)"
          (focus)="isOpen = true"
          (blur)="onBlur()"
        />
        @if (isOpen) {
          <ul class="st-combobox__listbox">
            @for (opt of filteredOptions; track opt.value) {
              <li class="st-combobox__option" (mousedown)="select(opt)">{{ opt.label }}</li>
            }
          </ul>
        }
      </div>
    </div>
  `,
})
export class Combobox {
  static readonly stComponentName = "Combobox";
  readonly componentName = "Combobox";

  isOpen = false;
  search = "";

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
  @NgInput("class") classInput?: string;

  @Output() readonly valueChange = new EventEmitter<string>();

  get hostClass(): string {
    return classNames("st-combobox", this.classInput);
  }

  get filteredOptions(): ComboboxOption[] {
    return (this.options ?? []).filter((o) =>
      String(o.label).toLowerCase().includes(this.search.toLowerCase()),
    );
  }

  onSearch(e: Event): void {
    this.search = (e.target as HTMLInputElement).value;
    this.isOpen = true;
  }

  onBlur(): void {
    setTimeout(() => {
      this.isOpen = false;
    }, 150);
  }

  select(opt: ComboboxOption): void {
    this.search = String(opt.label);
    this.valueChange.emit(opt.value);
    this.isOpen = false;
  }
}

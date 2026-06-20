import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type MultiSelectOption = {
  value: string;
  label: unknown;
  disabled?: boolean;
  group?: string;
};

export type MultiSelectSize = "sm" | "md" | "lg";

export type MultiSelectProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  invalid?: boolean;
  options: MultiSelectOption[];
  value?: string[];
  values?: string[];
  selected?: string[];
  size?: MultiSelectSize;
  open?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsLabel?: string;
  toggleLabel?: string;
  removeLabel?: string;
  listLabel?: string;
  disabled?: boolean;
  class?: string;
};

@Component({
  selector: "st-multi-select",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label) {
        <label class="st-field__label">{{ label }}</label>
      }
      <div
        class="st-multiSelect__trigger"
        (click)="!disabled && toggleOpen()"
      >
        {{ selectedLabel }}
      </div>
      @if (isOpen) {
        <div class="st-multiSelect__dropdown">
          <ul class="st-multiSelect__list">
            @for (opt of options ?? []; track opt.value) {
              <li
                class="st-multiSelect__option"
                [class.st-multiSelect__option--selected]="isSelected(opt.value)"
                (click)="toggle(opt.value)"
              >
                <input
                  type="checkbox"
                  [checked]="isSelected(opt.value)"
                  [disabled]="opt.disabled ?? false"
                  tabindex="-1"
                />
                {{ opt.label }}
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `,
})
export class MultiSelect {
  static readonly stComponentName = "MultiSelect";
  readonly componentName = "MultiSelect";

  isOpen = false;

  @NgInput() label?: unknown;
  @NgInput() helperText?: unknown;
  @NgInput() errorText?: unknown;
  @NgInput() invalid?: boolean;
  @NgInput() options: MultiSelectOption[] = [];
  @NgInput() value: string[] = [];
  @NgInput() values?: string[];
  @NgInput() selected?: string[];
  @NgInput() size?: MultiSelectSize;
  @NgInput() open?: boolean;
  @NgInput() placeholder?: string;
  @NgInput() searchPlaceholder?: string;
  @NgInput() noResultsLabel?: string;
  @NgInput() toggleLabel?: string;
  @NgInput() removeLabel?: string;
  @NgInput() listLabel?: string;
  @NgInput() disabled?: boolean;
  @NgInput("class") classInput?: string;

  @Output() readonly valueChange = new EventEmitter<string[]>();

  get hostClass(): string {
    return classNames("st-multiSelect", this.classInput);
  }

  get currentValue(): string[] {
    return this.value ?? this.values ?? this.selected ?? [];
  }

  get selectedLabel(): string {
    return this.currentValue.length
      ? this.currentValue.join(", ")
      : (this.placeholder ?? "—");
  }

  isSelected(v: string): boolean {
    return this.currentValue.includes(v);
  }

  toggleOpen(): void {
    this.isOpen = !this.isOpen;
  }

  toggle(v: string): void {
    const next = this.isSelected(v)
      ? this.currentValue.filter((x) => x !== v)
      : [...this.currentValue, v];
    this.valueChange.emit(next);
  }
}

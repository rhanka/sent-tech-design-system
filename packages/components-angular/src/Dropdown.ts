import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type DropdownOption = {
  value: string;
  label: unknown;
  disabled?: boolean;
};

export type DropdownProps = {
  label?: string;
  options: DropdownOption[];
  value?: string;
  open?: boolean;
  placeholder?: string;
  locale?: string;
  onSelect?: (value: string) => void;
  class?: string;
};

@Component({
  selector: "st-dropdown",
  standalone: true,
  template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
    >
      <button
        type="button"
        class="st-dropdown__button"
        aria-haspopup="listbox"
        [attr.aria-expanded]="isOpen"
        (click)="toggleOpen()"
      >
        <span class="st-dropdown__label">{{ label }}</span>: <span class="st-dropdown__value">{{ selectedLabel }}</span>
        <svg
          [class]="iconClass"
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
      @if (isOpen) {
        <div
          class="st-dropdown__list"
          role="listbox"
          [attr.aria-label]="label"
        >
          @for (option of options; track option.value) {
            <button
              type="button"
              role="option"
              class="st-dropdown__option"
              [disabled]="option.disabled"
              [attr.aria-disabled]="option.disabled ? 'true' : null"
              [attr.aria-selected]="option.value === (value ?? localValue)"
              (click)="selectOption(option)"
            >{{ option.label }}</button>
          }
        </div>
      }
    </div>
  `,
})
export class Dropdown {
  static readonly stComponentName = "Dropdown";
  readonly componentName = "Dropdown";

  @NgInput() label?: string;
  @NgInput() options: DropdownOption[] = [];
  @NgInput() value?: string;
  @NgInput() open?: boolean;
  @NgInput() placeholder?: string;
  @NgInput() locale?: string;
  @NgInput() onSelect?: (value: string) => void;
  @NgInput("class") classInput?: string;

  @Output() readonly select = new EventEmitter<string>();

  localOpen = false;
  localValue = "";

  get isOpen(): boolean {
    return this.open ?? this.localOpen;
  }

  toggleOpen(): void {
    if (this.open === undefined) this.localOpen = !this.localOpen;
  }

  get resolvedPlaceholder(): string {
    const isFr = (this.locale ?? "fr-FR").toLowerCase().startsWith("fr");
    return this.placeholder ?? (isFr ? "Sélectionner" : "Select");
  }

  get selectedLabel(): string {
    const val = this.value ?? this.localValue;
    const opt = this.options.find((o) => o.value === val);
    return opt ? String(opt.label) : this.resolvedPlaceholder;
  }

  get iconClass(): string {
    return classNames("st-dropdown__icon", this.isOpen ? "st-dropdown__icon--open" : undefined);
  }

  get hostClass(): string {
    return classNames("st-dropdown", this.classInput);
  }

  selectOption(option: DropdownOption): void {
    if (option.disabled) return;
    this.localValue = option.value;
    if (this.open === undefined) this.localOpen = false;
    this.select.emit(option.value);
    this.onSelect?.(option.value);
  }
}

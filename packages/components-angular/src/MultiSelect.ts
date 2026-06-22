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
  selected?: string[];
  value?: string[];
  values?: string[];
  size?: MultiSelectSize;
  locale?: string;
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
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="group"
      [attr.aria-label]="label"
      (keydown)="onContainerKeyDown($event)"
    >
      @if (label) {
        <span class="st-field__label">{{ label }}</span>
      }
      @if (selectedOptions.length > 0) {
        <span class="st-multiSelect__tags">
          @for (option of selectedOptions; track option.value) {
            <span class="st-multiSelect__tag">
              <span class="st-multiSelect__tagLabel">{{ option.label }}</span>
              <button
                type="button"
                class="st-multiSelect__tagRemove"
                [attr.aria-label]="resolvedRemoveLabel + ' ' + option.label"
                [disabled]="disabled ?? false"
                (click)="removeOption(option.value)"
              >&#x2715;</button>
            </span>
          }
        </span>
      }
      <span class="{{ groupClass }}" [attr.data-invalid]="isInvalid ? 'true' : null">
        <button
          type="button"
          class="st-multiSelect__trigger"
          aria-haspopup="listbox"
          [attr.aria-expanded]="isOpen ? 'true' : 'false'"
          [disabled]="disabled ?? false"
          (click)="toggleOpen()"
        >
          @if (selectedOptions.length === 0) {
            <span class="st-multiSelect__placeholder">{{ resolvedPlaceholder }}</span>
          } @else {
            <span class="st-multiSelect__count">{{ selectedOptions.length }} {{ isFr ? "sélectionné(s)" : "selected" }}</span>
          }
          <span class="st-multiSelect__caret" aria-hidden="true">
            <span
              class="st-multiSelect__caretIcon"
              [class.st-multiSelect__caretIcon--open]="isOpen"
            >&#x25BE;</span>
          </span>
          <span class="st-visually-hidden">{{ resolvedToggleLabel }}</span>
        </button>
      </span>
      @if (isOpen) {
        <div class="st-multiSelect__panel">
          <input
            type="search"
            class="st-multiSelect__search"
            [placeholder]="resolvedSearchPlaceholder"
            [value]="query"
            [attr.aria-label]="resolvedSearchPlaceholder"
            (input)="query = $any($event.target).value"
          />
          <div
            class="st-multiSelect__list"
            role="listbox"
            [attr.aria-label]="listLabel ?? label ?? 'Options'"
            aria-multiselectable="true"
          >
            @if (filtered.length === 0) {
              <div class="st-multiSelect__empty">{{ resolvedNoResultsLabel }}</div>
            } @else {
              @for (option of filtered; track option.value) {
                <button
                  class="st-multiSelect__option"
                  type="button"
                  role="option"
                  [attr.aria-selected]="isSelected(option.value) ? 'true' : 'false'"
                  [attr.aria-disabled]="option.disabled ? 'true' : null"
                  [disabled]="option.disabled ?? false"
                  (click)="toggleOption(option)"
                >
                  <span class="st-multiSelect__check" aria-hidden="true">
                    @if (isSelected(option.value)) { ✓ }
                  </span>
                  <span>{{ option.label }}</span>
                </button>
              }
            }
          </div>
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
export class MultiSelect {
  static readonly stComponentName = "MultiSelect";
  readonly componentName = "MultiSelect";

  isOpen = false;
  query = "";

  @NgInput() label?: unknown;
  @NgInput() helperText?: unknown;
  @NgInput() errorText?: unknown;
  @NgInput() invalid = false;
  @NgInput() options: MultiSelectOption[] = [];
  @NgInput() selected?: string[];
  @NgInput() value?: string[];
  @NgInput() values?: string[];
  @NgInput() size: MultiSelectSize = "md";
  @NgInput() locale = "fr-FR";
  @NgInput() placeholder?: string;
  @NgInput() searchPlaceholder?: string;
  @NgInput() noResultsLabel?: string;
  @NgInput() toggleLabel?: string;
  @NgInput() removeLabel?: string;
  @NgInput() listLabel?: string;
  @NgInput() disabled = false;
  @NgInput("class") classInput?: string;

  @Output() readonly selectedChange = new EventEmitter<string[]>();
  @Output("change") readonly change = new EventEmitter<string[]>();

  get isFr(): boolean {
    return this.locale.toLowerCase().startsWith("fr");
  }

  get resolvedPlaceholder(): string {
    return this.placeholder ?? (this.isFr ? "Sélectionner des éléments" : "Select items");
  }

  get resolvedSearchPlaceholder(): string {
    return this.searchPlaceholder ?? (this.isFr ? "Filtrer" : "Filter");
  }

  get resolvedNoResultsLabel(): string {
    return this.noResultsLabel ?? (this.isFr ? "Aucun résultat" : "No results");
  }

  get resolvedToggleLabel(): string {
    return this.toggleLabel ?? (this.isFr ? "Afficher les options" : "Toggle options");
  }

  get resolvedRemoveLabel(): string {
    return this.removeLabel ?? (this.isFr ? "Supprimer" : "Remove");
  }

  get isInvalid(): boolean {
    return this.invalid || Boolean(this.errorText);
  }

  get hostClass(): string {
    return classNames("st-field", this.classInput);
  }

  get groupClass(): string {
    return classNames("st-multiSelect", `st-multiSelect--${this.size}`);
  }

  get currentValue(): string[] {
    return this.selected ?? this.value ?? this.values ?? [];
  }

  get filtered(): MultiSelectOption[] {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.options ?? [];
    return (this.options ?? []).filter((opt) =>
      String(opt.label).toLowerCase().includes(q),
    );
  }

  get selectedOptions(): MultiSelectOption[] {
    return this.currentValue
      .map((value) => (this.options ?? []).find((opt) => opt.value === value))
      .filter((opt): opt is MultiSelectOption => Boolean(opt));
  }

  isSelected(v: string): boolean {
    return this.currentValue.includes(v);
  }

  toggleOpen(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
  }

  toggleOption(option: MultiSelectOption): void {
    if (option.disabled) return;
    const next = this.isSelected(option.value)
      ? this.currentValue.filter((v) => v !== option.value)
      : [...this.currentValue, option.value];
    this.selectedChange.emit(next);
    this.change.emit(next);
  }

  removeOption(value: string): void {
    const next = this.currentValue.filter((v) => v !== value);
    this.selectedChange.emit(next);
    this.change.emit(next);
  }

  onContainerKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape" && this.isOpen) {
      event.preventDefault();
      this.isOpen = false;
    }
  }
}

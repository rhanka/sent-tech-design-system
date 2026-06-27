import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class MultiSelect {
    static stComponentName = "MultiSelect";
    componentName = "MultiSelect";
    isOpen = false;
    query = "";
    label;
    helperText;
    errorText;
    invalid = false;
    options = [];
    selected;
    value;
    values;
    size = "md";
    locale = "fr-FR";
    placeholder;
    searchPlaceholder;
    noResultsLabel;
    toggleLabel;
    removeLabel;
    listLabel;
    disabled = false;
    classInput;
    selectedChange = new EventEmitter();
    change = new EventEmitter();
    get isFr() {
        return this.locale.toLowerCase().startsWith("fr");
    }
    get resolvedPlaceholder() {
        return this.placeholder ?? (this.isFr ? "Sélectionner des éléments" : "Select items");
    }
    get resolvedSearchPlaceholder() {
        return this.searchPlaceholder ?? (this.isFr ? "Filtrer" : "Filter");
    }
    get resolvedNoResultsLabel() {
        return this.noResultsLabel ?? (this.isFr ? "Aucun résultat" : "No results");
    }
    get resolvedToggleLabel() {
        return this.toggleLabel ?? (this.isFr ? "Afficher les options" : "Toggle options");
    }
    get resolvedRemoveLabel() {
        return this.removeLabel ?? (this.isFr ? "Supprimer" : "Remove");
    }
    get isInvalid() {
        return this.invalid || Boolean(this.errorText);
    }
    get hostClass() {
        return classNames("st-field", this.classInput);
    }
    get groupClass() {
        return classNames("st-multiSelect", `st-multiSelect--${this.size}`);
    }
    get currentValue() {
        return this.selected ?? this.value ?? this.values ?? [];
    }
    get filtered() {
        const q = this.query.trim().toLowerCase();
        if (!q)
            return this.options ?? [];
        return (this.options ?? []).filter((opt) => String(opt.label).toLowerCase().includes(q));
    }
    get selectedOptions() {
        return this.currentValue
            .map((value) => (this.options ?? []).find((opt) => opt.value === value))
            .filter((opt) => Boolean(opt));
    }
    isSelected(v) {
        return this.currentValue.includes(v);
    }
    toggleOpen() {
        if (this.disabled)
            return;
        this.isOpen = !this.isOpen;
    }
    toggleOption(option) {
        if (option.disabled)
            return;
        const next = this.isSelected(option.value)
            ? this.currentValue.filter((v) => v !== option.value)
            : [...this.currentValue, option.value];
        this.selectedChange.emit(next);
        this.change.emit(next);
    }
    removeOption(value) {
        const next = this.currentValue.filter((v) => v !== value);
        this.selectedChange.emit(next);
        this.change.emit(next);
    }
    onContainerKeyDown(event) {
        if (event.key === "Escape" && this.isOpen) {
            event.preventDefault();
            this.isOpen = false;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MultiSelect, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: MultiSelect, isStandalone: true, selector: "st-multi-select", inputs: { label: "label", helperText: "helperText", errorText: "errorText", invalid: "invalid", options: "options", selected: "selected", value: "value", values: "values", size: "size", locale: "locale", placeholder: "placeholder", searchPlaceholder: "searchPlaceholder", noResultsLabel: "noResultsLabel", toggleLabel: "toggleLabel", removeLabel: "removeLabel", listLabel: "listLabel", disabled: "disabled", classInput: ["class", "classInput"] }, outputs: { selectedChange: "selectedChange", change: "change" }, ngImport: i0, template: `
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
              ><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button>
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
            <svg
              class="st-multiSelect__caretIcon"
              [class.st-multiSelect__caretIcon--open]="isOpen"
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MultiSelect, decorators: [{
            type: Component,
            args: [{
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
              ><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button>
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
            <svg
              class="st-multiSelect__caretIcon"
              [class.st-multiSelect__caretIcon--open]="isOpen"
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
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], helperText: [{
                type: NgInput
            }], errorText: [{
                type: NgInput
            }], invalid: [{
                type: NgInput
            }], options: [{
                type: NgInput
            }], selected: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], values: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], locale: [{
                type: NgInput
            }], placeholder: [{
                type: NgInput
            }], searchPlaceholder: [{
                type: NgInput
            }], noResultsLabel: [{
                type: NgInput
            }], toggleLabel: [{
                type: NgInput
            }], removeLabel: [{
                type: NgInput
            }], listLabel: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], selectedChange: [{
                type: Output
            }], change: [{
                type: Output,
                args: ["change"]
            }] } });
//# sourceMappingURL=MultiSelect.js.map
import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
let _counter = 0;
export class Combobox {
    static stComponentName = "Combobox";
    componentName = "Combobox";
    inputId;
    listId;
    isOpen = false;
    search = "";
    searchTouched = false;
    constructor() {
        _counter++;
        this.inputId = "st-combobox-input-" + _counter;
        this.listId = "st-combobox-list-" + _counter;
    }
    label;
    helperText;
    errorText;
    invalid;
    options = [];
    value;
    modelValue;
    size;
    placeholder;
    disabled;
    open;
    allowCustomValue;
    noResultsLabel;
    listLabel;
    clearLabel;
    toggleLabel;
    classInput;
    valueChange = new EventEmitter();
    get hostClass() {
        return classNames("st-field", this.classInput);
    }
    get boxClass() {
        return classNames("st-combobox", `st-combobox--${this.size ?? "md"}`);
    }
    get toggleIconClass() {
        return classNames("st-combobox__toggleIcon", this.isOpen ? "st-combobox__toggleIcon--open" : undefined);
    }
    get isInvalid() {
        return Boolean(this.invalid) || Boolean(this.errorText);
    }
    get labelText() {
        return this.label === undefined || this.label === null ? undefined : String(this.label);
    }
    get selectedOption() {
        const v = this.value ?? this.modelValue;
        return (this.options ?? []).find((o) => o.value === v);
    }
    get displayValue() {
        if (this.searchTouched)
            return this.search;
        const selected = this.selectedOption;
        if (selected)
            return this.optLabel(selected);
        return this.search;
    }
    get filteredOptions() {
        const query = this.displayValue.trim().toLowerCase();
        return (this.options ?? []).filter((o) => !query || this.optLabel(o).toLowerCase().includes(query));
    }
    optLabel(opt) {
        return opt.label === undefined || opt.label === null ? "" : String(opt.label);
    }
    onFocus() {
        if (!this.disabled)
            this.isOpen = true;
    }
    onSearch(e) {
        this.search = e.target.value;
        this.searchTouched = true;
        this.isOpen = true;
    }
    onBlur() {
        setTimeout(() => {
            this.isOpen = false;
        }, 150);
    }
    onToggle(e) {
        e.preventDefault();
        this.isOpen = !this.isOpen;
    }
    onClear(e) {
        e.preventDefault();
        this.search = "";
        this.searchTouched = true;
        this.valueChange.emit("");
    }
    select(opt, e) {
        e.preventDefault();
        if (opt.disabled)
            return;
        this.search = this.optLabel(opt);
        this.searchTouched = true;
        this.valueChange.emit(opt.value);
        this.isOpen = false;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Combobox, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Combobox, isStandalone: true, selector: "st-combobox", inputs: { label: "label", helperText: "helperText", errorText: "errorText", invalid: "invalid", options: "options", value: "value", modelValue: "modelValue", size: "size", placeholder: "placeholder", disabled: "disabled", open: "open", allowCustomValue: "allowCustomValue", noResultsLabel: "noResultsLabel", listLabel: "listLabel", clearLabel: "clearLabel", toggleLabel: "toggleLabel", classInput: ["class", "classInput"] }, outputs: { valueChange: "valueChange" }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Combobox, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], ctorParameters: () => [], propDecorators: { label: [{
                type: NgInput
            }], helperText: [{
                type: NgInput
            }], errorText: [{
                type: NgInput
            }], invalid: [{
                type: NgInput
            }], options: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], modelValue: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], placeholder: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], allowCustomValue: [{
                type: NgInput
            }], noResultsLabel: [{
                type: NgInput
            }], listLabel: [{
                type: NgInput
            }], clearLabel: [{
                type: NgInput
            }], toggleLabel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], valueChange: [{
                type: Output
            }] } });
//# sourceMappingURL=Combobox.js.map
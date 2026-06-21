import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class MultiSelect {
    static stComponentName = "MultiSelect";
    componentName = "MultiSelect";
    isOpen = false;
    label;
    helperText;
    errorText;
    invalid;
    options = [];
    value = [];
    values;
    selected;
    size;
    open;
    placeholder;
    searchPlaceholder;
    noResultsLabel;
    toggleLabel;
    removeLabel;
    listLabel;
    disabled;
    classInput;
    valueChange = new EventEmitter();
    get hostClass() {
        return classNames("st-multiSelect", this.classInput);
    }
    get currentValue() {
        return this.value ?? this.values ?? this.selected ?? [];
    }
    get selectedLabel() {
        return this.currentValue.length
            ? this.currentValue.join(", ")
            : (this.placeholder ?? "—");
    }
    isSelected(v) {
        return this.currentValue.includes(v);
    }
    toggleOpen() {
        this.isOpen = !this.isOpen;
    }
    toggle(v) {
        const next = this.isSelected(v)
            ? this.currentValue.filter((x) => x !== v)
            : [...this.currentValue, v];
        this.valueChange.emit(next);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MultiSelect, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: MultiSelect, isStandalone: true, selector: "st-multi-select", inputs: { label: "label", helperText: "helperText", errorText: "errorText", invalid: "invalid", options: "options", value: "value", values: "values", selected: "selected", size: "size", open: "open", placeholder: "placeholder", searchPlaceholder: "searchPlaceholder", noResultsLabel: "noResultsLabel", toggleLabel: "toggleLabel", removeLabel: "removeLabel", listLabel: "listLabel", disabled: "disabled", classInput: ["class", "classInput"] }, outputs: { valueChange: "valueChange" }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MultiSelect, decorators: [{
            type: Component,
            args: [{
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
            }], value: [{
                type: NgInput
            }], values: [{
                type: NgInput
            }], selected: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], open: [{
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
            }], valueChange: [{
                type: Output
            }] } });
//# sourceMappingURL=MultiSelect.js.map
import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Combobox {
    static stComponentName = "Combobox";
    componentName = "Combobox";
    isOpen = false;
    search = "";
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
    classInput;
    valueChange = new EventEmitter();
    get hostClass() {
        return classNames("st-combobox", this.classInput);
    }
    get filteredOptions() {
        return (this.options ?? []).filter((o) => String(o.label).toLowerCase().includes(this.search.toLowerCase()));
    }
    onSearch(e) {
        this.search = e.target.value;
        this.isOpen = true;
    }
    onBlur() {
        setTimeout(() => {
            this.isOpen = false;
        }, 150);
    }
    select(opt) {
        this.search = String(opt.label);
        this.valueChange.emit(opt.value);
        this.isOpen = false;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Combobox, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Combobox, isStandalone: true, selector: "st-combobox", inputs: { label: "label", helperText: "helperText", errorText: "errorText", invalid: "invalid", options: "options", value: "value", modelValue: "modelValue", size: "size", placeholder: "placeholder", disabled: "disabled", open: "open", allowCustomValue: "allowCustomValue", noResultsLabel: "noResultsLabel", listLabel: "listLabel", classInput: ["class", "classInput"] }, outputs: { valueChange: "valueChange" }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Combobox, decorators: [{
            type: Component,
            args: [{
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
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], valueChange: [{
                type: Output
            }] } });
//# sourceMappingURL=Combobox.js.map
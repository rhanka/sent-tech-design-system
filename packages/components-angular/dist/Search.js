import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
let counter = 0;
function nextId() {
    counter += 1;
    return `st-search-${counter}`;
}
export class Search {
    static stComponentName = "Search";
    componentName = "Search";
    autoId = nextId();
    label;
    size;
    modelValue;
    value;
    placeholder;
    clearLabel;
    fluid;
    disabled;
    id;
    name;
    autocomplete;
    required;
    readOnly;
    inputMode;
    ariaLabel;
    ariaDescribedBy;
    classInput;
    modelValueChange = new EventEmitter();
    updateModelValue = new EventEmitter();
    input = new EventEmitter();
    change = new EventEmitter();
    clear = new EventEmitter();
    get inputId() {
        return this.id ?? this.autoId;
    }
    get currentValue() {
        return this.modelValue ?? this.value ?? "";
    }
    get clearLabelText() {
        return this.clearLabel || "Clear search";
    }
    get hostClass() {
        return classNames("st-search", `st-search--${this.size ?? "md"}`, this.fluid ? "st-search--fluid" : undefined, this.classInput);
    }
    handleInput(event) {
        const target = event.target;
        const next = typeof target?.value === "string" ? target.value : "";
        this.emitModelValue(next);
        this.input.emit(event);
    }
    handleClear() {
        this.emitModelValue("");
        this.clear.emit();
    }
    emitModelValue(next) {
        this.modelValueChange.emit(next);
        this.updateModelValue.emit(next);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Search, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Search, isStandalone: true, selector: "st-search", inputs: { label: "label", size: "size", modelValue: "modelValue", value: "value", placeholder: "placeholder", clearLabel: "clearLabel", fluid: "fluid", disabled: "disabled", id: "id", name: "name", autocomplete: "autocomplete", required: "required", readOnly: ["readonly", "readOnly"], inputMode: ["inputmode", "inputMode"], ariaLabel: ["aria-label", "ariaLabel"], ariaDescribedBy: ["aria-describedby", "ariaDescribedBy"], classInput: ["class", "classInput"] }, outputs: { modelValueChange: "modelValueChange", updateModelValue: "update:modelValue", input: "input", change: "change", clear: "clear" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label) {
        <label class="st-field__label" [attr.for]="inputId">{{ label }}</label>
      }
      <span class="st-search__icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"></circle>
          <path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
        </svg>
      </span>
      <input
        [id]="inputId"
        class="st-search__control st-search__input"
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
          </svg>
        </button>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Search, decorators: [{
            type: Component,
            args: [{
                    selector: "st-search",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label) {
        <label class="st-field__label" [attr.for]="inputId">{{ label }}</label>
      }
      <span class="st-search__icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"></circle>
          <path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
        </svg>
      </span>
      <input
        [id]="inputId"
        class="st-search__control st-search__input"
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
          </svg>
        </button>
      }
    </div>
  `,
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], modelValue: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], placeholder: [{
                type: NgInput
            }], clearLabel: [{
                type: NgInput
            }], fluid: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], id: [{
                type: NgInput
            }], name: [{
                type: NgInput
            }], autocomplete: [{
                type: NgInput
            }], required: [{
                type: NgInput
            }], readOnly: [{
                type: NgInput,
                args: ["readonly"]
            }], inputMode: [{
                type: NgInput,
                args: ["inputmode"]
            }], ariaLabel: [{
                type: NgInput,
                args: ["aria-label"]
            }], ariaDescribedBy: [{
                type: NgInput,
                args: ["aria-describedby"]
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], modelValueChange: [{
                type: Output
            }], updateModelValue: [{
                type: Output,
                args: ["update:modelValue"]
            }], input: [{
                type: Output
            }], change: [{
                type: Output
            }], clear: [{
                type: Output
            }] } });
//# sourceMappingURL=Search.js.map
import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Dropdown {
    static stComponentName = "Dropdown";
    componentName = "Dropdown";
    label;
    options = [];
    value;
    open;
    placeholder;
    locale;
    onSelect;
    classInput;
    select = new EventEmitter();
    localOpen = false;
    localValue = "";
    get resolvedPlaceholder() {
        const isFr = (this.locale ?? "fr-FR").toLowerCase().startsWith("fr");
        return this.placeholder ?? (isFr ? "Sélectionner" : "Select");
    }
    get selectedLabel() {
        const val = this.value ?? this.localValue;
        const opt = this.options.find((o) => o.value === val);
        return opt ? String(opt.label) : this.resolvedPlaceholder;
    }
    get hostClass() {
        return classNames("st-dropdown", this.classInput);
    }
    selectOption(option) {
        if (option.disabled)
            return;
        this.localValue = option.value;
        this.localOpen = false;
        this.select.emit(option.value);
        this.onSelect?.(option.value);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Dropdown, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Dropdown, isStandalone: true, selector: "st-dropdown", inputs: { label: "label", options: "options", value: "value", open: "open", placeholder: "placeholder", locale: "locale", onSelect: "onSelect", classInput: ["class", "classInput"] }, outputs: { select: "select" }, ngImport: i0, template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
    >
      <button
        type="button"
        class="st-dropdown__button"
        aria-haspopup="listbox"
        [attr.aria-expanded]="localOpen"
        (click)="localOpen = !localOpen"
      >
        <span class="st-dropdown__label">{{ label ?? 'Select' }}</span>
        : <span class="st-dropdown__value">{{ selectedLabel }}</span>
      </button>
      @if (localOpen) {
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Dropdown, decorators: [{
            type: Component,
            args: [{
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
        [attr.aria-expanded]="localOpen"
        (click)="localOpen = !localOpen"
      >
        <span class="st-dropdown__label">{{ label ?? 'Select' }}</span>
        : <span class="st-dropdown__value">{{ selectedLabel }}</span>
      </button>
      @if (localOpen) {
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
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], options: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], placeholder: [{
                type: NgInput
            }], locale: [{
                type: NgInput
            }], onSelect: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], select: [{
                type: Output
            }] } });
//# sourceMappingURL=Dropdown.js.map
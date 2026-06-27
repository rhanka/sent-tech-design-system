import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class RadioGroup {
    static stComponentName = "RadioGroup";
    componentName = "RadioGroup";
    label;
    legend;
    value;
    onChange;
    orientation;
    name;
    options;
    helperText;
    disabled;
    classInput;
    valueChange = new EventEmitter();
    get hostClass() {
        return classNames("st-radioGroup", `st-radioGroup--${this.orientation ?? "vertical"}`, this.classInput);
    }
    onChangeHandler(v) {
        this.valueChange.emit(v);
        this.onChange?.(v);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: RadioGroup, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: RadioGroup, isStandalone: true, selector: "st-radio-group", inputs: { label: "label", legend: "legend", value: "value", onChange: "onChange", orientation: "orientation", name: "name", options: "options", helperText: "helperText", disabled: "disabled", classInput: ["class", "classInput"] }, outputs: { valueChange: "valueChange" }, ngImport: i0, template: `
    <fieldset [attr.data-st-component]="componentName" [class]="hostClass" [disabled]="disabled ?? false">
      @if (legend ?? label) {
        <legend class="st-radioGroup__legend">{{ legend ?? label }}</legend>
      }
      @if (helperText) {
        <p class="st-radioGroup__help">{{ helperText }}</p>
      }
      <div class="st-radioGroup__options">
        @for (opt of options ?? []; track opt.value) {
          <label class="st-choice st-choice--radio">
            <input
              class="st-choice__input"
              type="radio"
              [name]="name"
              [value]="opt.value"
              [checked]="opt.value === value"
              [disabled]="opt.disabled ?? false"
              (change)="onChangeHandler(opt.value)"
            />
            <span class="st-choice__content">
              <span class="st-choice__label">{{ opt.label }}</span>
              @if (opt.helperText) {
                <span class="st-choice__help">{{ opt.helperText }}</span>
              }
            </span>
          </label>
        }
      </div>
    </fieldset>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: RadioGroup, decorators: [{
            type: Component,
            args: [{
                    selector: "st-radio-group",
                    standalone: true,
                    template: `
    <fieldset [attr.data-st-component]="componentName" [class]="hostClass" [disabled]="disabled ?? false">
      @if (legend ?? label) {
        <legend class="st-radioGroup__legend">{{ legend ?? label }}</legend>
      }
      @if (helperText) {
        <p class="st-radioGroup__help">{{ helperText }}</p>
      }
      <div class="st-radioGroup__options">
        @for (opt of options ?? []; track opt.value) {
          <label class="st-choice st-choice--radio">
            <input
              class="st-choice__input"
              type="radio"
              [name]="name"
              [value]="opt.value"
              [checked]="opt.value === value"
              [disabled]="opt.disabled ?? false"
              (change)="onChangeHandler(opt.value)"
            />
            <span class="st-choice__content">
              <span class="st-choice__label">{{ opt.label }}</span>
              @if (opt.helperText) {
                <span class="st-choice__help">{{ opt.helperText }}</span>
              }
            </span>
          </label>
        }
      </div>
    </fieldset>
  `,
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], legend: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], onChange: [{
                type: NgInput
            }], orientation: [{
                type: NgInput
            }], name: [{
                type: NgInput
            }], options: [{
                type: NgInput
            }], helperText: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], valueChange: [{
                type: Output
            }] } });
//# sourceMappingURL=RadioGroup.js.map
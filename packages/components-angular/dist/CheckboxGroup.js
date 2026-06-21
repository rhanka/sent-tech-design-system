import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class CheckboxGroup {
    static stComponentName = "CheckboxGroup";
    componentName = "CheckboxGroup";
    label;
    legend;
    value = [];
    onChange;
    orientation;
    name;
    options;
    helperText;
    disabled;
    classInput;
    valueChange = new EventEmitter();
    get hostClass() {
        return classNames("st-checkboxGroup", this.orientation ? `st-checkboxGroup--${this.orientation}` : undefined, this.classInput);
    }
    isChecked(v) {
        return (this.value ?? []).includes(v);
    }
    toggle(v, e) {
        const checked = e.target.checked;
        const next = checked
            ? [...(this.value ?? []), v]
            : (this.value ?? []).filter((x) => x !== v);
        this.valueChange.emit(next);
        this.onChange?.(next);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: CheckboxGroup, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: CheckboxGroup, isStandalone: true, selector: "st-checkbox-group", inputs: { label: "label", legend: "legend", value: "value", onChange: "onChange", orientation: "orientation", name: "name", options: "options", helperText: "helperText", disabled: "disabled", classInput: ["class", "classInput"] }, outputs: { valueChange: "valueChange" }, ngImport: i0, template: `
    <fieldset [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label ?? legend) {
        <legend class="st-checkboxGroup__legend">{{ label ?? legend }}</legend>
      }
      <div class="st-checkboxGroup__list">
        @for (opt of options ?? []; track opt.value) {
          <label class="st-checkboxGroup__option">
            <input
              type="checkbox"
              class="st-checkbox__control"
              [value]="opt.value"
              [checked]="isChecked(opt.value)"
              [disabled]="opt.disabled ?? false"
              (change)="toggle(opt.value, $event)"
            />
            <span>{{ opt.label }}</span>
          </label>
        }
      </div>
    </fieldset>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: CheckboxGroup, decorators: [{
            type: Component,
            args: [{
                    selector: "st-checkbox-group",
                    standalone: true,
                    template: `
    <fieldset [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label ?? legend) {
        <legend class="st-checkboxGroup__legend">{{ label ?? legend }}</legend>
      }
      <div class="st-checkboxGroup__list">
        @for (opt of options ?? []; track opt.value) {
          <label class="st-checkboxGroup__option">
            <input
              type="checkbox"
              class="st-checkbox__control"
              [value]="opt.value"
              [checked]="isChecked(opt.value)"
              [disabled]="opt.disabled ?? false"
              (change)="toggle(opt.value, $event)"
            />
            <span>{{ opt.label }}</span>
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
//# sourceMappingURL=CheckboxGroup.js.map
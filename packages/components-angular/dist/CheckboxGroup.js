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
    get resolvedLegend() {
        return this.legend ?? this.label;
    }
    get hostClass() {
        return classNames("st-checkboxGroup", `st-checkboxGroup--${this.orientation ?? "vertical"}`, this.classInput);
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
    <fieldset [attr.data-st-component]="componentName" [class]="hostClass" [disabled]="disabled ?? false">
      @if (resolvedLegend) {
        <legend class="st-checkboxGroup__legend">{{ resolvedLegend }}</legend>
      }
      @if (helperText) {
        <p class="st-checkboxGroup__help">{{ helperText }}</p>
      }
      <div class="st-checkboxGroup__options">
        @for (opt of options ?? []; track opt.value) {
          <label class="st-choice st-choice--checkbox">
            <input
              class="st-choice__input"
              type="checkbox"
              [attr.name]="name"
              [value]="opt.value"
              [checked]="isChecked(opt.value)"
              [disabled]="opt.disabled ?? false"
              (change)="toggle(opt.value, $event)"
            />
            <span class="st-choice__content">
              <span class="st-choice__label">{{ opt.label }}</span>
              @if (opt.helperText) {
                <span class="st-choice__help">{{ opt.helperText }}</span>
              }
            </span>
          </label>
        }
        <ng-content></ng-content>
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
    <fieldset [attr.data-st-component]="componentName" [class]="hostClass" [disabled]="disabled ?? false">
      @if (resolvedLegend) {
        <legend class="st-checkboxGroup__legend">{{ resolvedLegend }}</legend>
      }
      @if (helperText) {
        <p class="st-checkboxGroup__help">{{ helperText }}</p>
      }
      <div class="st-checkboxGroup__options">
        @for (opt of options ?? []; track opt.value) {
          <label class="st-choice st-choice--checkbox">
            <input
              class="st-choice__input"
              type="checkbox"
              [attr.name]="name"
              [value]="opt.value"
              [checked]="isChecked(opt.value)"
              [disabled]="opt.disabled ?? false"
              (change)="toggle(opt.value, $event)"
            />
            <span class="st-choice__content">
              <span class="st-choice__label">{{ opt.label }}</span>
              @if (opt.helperText) {
                <span class="st-choice__help">{{ opt.helperText }}</span>
              }
            </span>
          </label>
        }
        <ng-content></ng-content>
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
import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class FormGroup {
    static stComponentName = "FormGroup";
    componentName = "FormGroup";
    legend;
    helperText;
    classInput;
    get hostClass() {
        return classNames("st-formGroup", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: FormGroup, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: FormGroup, isStandalone: true, selector: "st-form-group", inputs: { legend: "legend", helperText: "helperText", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <fieldset [attr.data-st-component]="componentName" [class]="hostClass">
      @if (legend) { <legend class="st-formGroup__legend">{{ legend }}</legend> }
      <ng-content></ng-content>
      @if (helperText) { <p class="st-formGroup__helper">{{ helperText }}</p> }
    </fieldset>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: FormGroup, decorators: [{
            type: Component,
            args: [{
                    selector: "st-form-group",
                    standalone: true,
                    template: `
    <fieldset [attr.data-st-component]="componentName" [class]="hostClass">
      @if (legend) { <legend class="st-formGroup__legend">{{ legend }}</legend> }
      <ng-content></ng-content>
      @if (helperText) { <p class="st-formGroup__helper">{{ helperText }}</p> }
    </fieldset>
  `,
                }]
        }], propDecorators: { legend: [{
                type: NgInput
            }], helperText: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=FormGroup.js.map
import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { Radio } from "./Radio.js";
import * as i0 from "@angular/core";
export class RadioGroup {
    static stComponentName = "RadioGroup";
    componentName = "RadioGroup";
    legend;
    value;
    onChange;
    orientation;
    name;
    options;
    helperText;
    disabled;
    classInput;
    get hostClass() {
        return ["st-radioGroup", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: RadioGroup, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: RadioGroup, isStandalone: true, selector: "st-radio-group", inputs: { legend: "legend", value: "value", onChange: "onChange", orientation: "orientation", name: "name", options: "options", helperText: "helperText", disabled: "disabled", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: RadioGroup, decorators: [{
            type: Component,
            args: [{
                    selector: "st-radio-group",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { legend: [{
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
            }] } });
//# sourceMappingURL=RadioGroup.js.map
import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Calendar {
    static stComponentName = "Calendar";
    componentName = "Calendar";
    value;
    onChange;
    min;
    max;
    range;
    weekStartsOn;
    locale;
    month;
    classInput;
    previousMonthLabel;
    nextMonthLabel;
    get hostClass() {
        return ["st-calendar", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Calendar, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Calendar, isStandalone: true, selector: "st-calendar", inputs: { value: "value", onChange: "onChange", min: "min", max: "max", range: "range", weekStartsOn: "weekStartsOn", locale: "locale", month: "month", classInput: ["class", "classInput"], previousMonthLabel: "previousMonthLabel", nextMonthLabel: "nextMonthLabel" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Calendar, decorators: [{
            type: Component,
            args: [{
                    selector: "st-calendar",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { value: [{
                type: NgInput
            }], onChange: [{
                type: NgInput
            }], min: [{
                type: NgInput
            }], max: [{
                type: NgInput
            }], range: [{
                type: NgInput
            }], weekStartsOn: [{
                type: NgInput
            }], locale: [{
                type: NgInput
            }], month: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], previousMonthLabel: [{
                type: NgInput
            }], nextMonthLabel: [{
                type: NgInput
            }] } });
//# sourceMappingURL=Calendar.js.map
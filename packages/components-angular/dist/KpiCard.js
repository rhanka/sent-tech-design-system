import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { Sparkline } from "./Sparkline.js";
import { cellDecorationClass, cellDecorationLabel, renderCellDecorationIcon, } from "./cellDecoration.js";
import * as i0 from "@angular/core";
export class KpiCard {
    static stComponentName = "KpiCard";
    componentName = "KpiCard";
    value;
    label;
    delta;
    deltaFormat;
    trend;
    format;
    unit;
    currency;
    locale;
    sparkline;
    size;
    tone;
    decoration;
    classInput;
    get hostClass() {
        return ["st-kpiCard", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: KpiCard, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: KpiCard, isStandalone: true, selector: "st-kpi-card", inputs: { value: "value", label: "label", delta: "delta", deltaFormat: "deltaFormat", trend: "trend", format: "format", unit: "unit", currency: "currency", locale: "locale", sparkline: "sparkline", size: "size", tone: "tone", decoration: "decoration", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: KpiCard, decorators: [{
            type: Component,
            args: [{
                    selector: "st-kpi-card",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { value: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], delta: [{
                type: NgInput
            }], deltaFormat: [{
                type: NgInput
            }], trend: [{
                type: NgInput
            }], format: [{
                type: NgInput
            }], unit: [{
                type: NgInput
            }], currency: [{
                type: NgInput
            }], locale: [{
                type: NgInput
            }], sparkline: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], tone: [{
                type: NgInput
            }], decoration: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=KpiCard.js.map
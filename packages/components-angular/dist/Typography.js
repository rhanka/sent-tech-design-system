import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Typography {
    static stComponentName = "Typography";
    componentName = "Typography";
    variant;
    as;
    weight;
    tone;
    align;
    truncate;
    classInput;
    get hostClass() {
        return classNames("st-typography", this.variant && `st-typography--${this.variant}`, this.weight && `st-typography--weight-${this.weight}`, this.tone && `st-typography--tone-${this.tone}`, this.align && `st-typography--align-${this.align}`, this.truncate && "st-typography--truncate", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Typography, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Typography, isStandalone: true, selector: "st-typography", inputs: { variant: "variant", as: "as", weight: "weight", tone: "tone", align: "align", truncate: "truncate", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Typography, decorators: [{
            type: Component,
            args: [{
                    selector: "st-typography",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { variant: [{
                type: NgInput
            }], as: [{
                type: NgInput
            }], weight: [{
                type: NgInput
            }], tone: [{
                type: NgInput
            }], align: [{
                type: NgInput
            }], truncate: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Typography.js.map
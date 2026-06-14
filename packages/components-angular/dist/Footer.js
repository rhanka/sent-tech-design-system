import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Footer {
    static stComponentName = "Footer";
    componentName = "Footer";
    brand;
    columns;
    links;
    copyright;
    classInput;
    get hostClass() {
        return ["st-footer", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Footer, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Footer, isStandalone: true, selector: "st-footer", inputs: { brand: "brand", columns: "columns", links: "links", copyright: "copyright", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Footer, decorators: [{
            type: Component,
            args: [{
                    selector: "st-footer",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { brand: [{
                type: NgInput
            }], columns: [{
                type: NgInput
            }], links: [{
                type: NgInput
            }], copyright: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Footer.js.map
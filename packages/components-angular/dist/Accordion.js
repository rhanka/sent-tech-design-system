import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Accordion {
    static stComponentName = "Accordion";
    componentName = "Accordion";
    items;
    openIds;
    defaultOpenIds;
    allowMultiple;
    open;
    multiple;
    align;
    size;
    classInput;
    get hostClass() {
        return ["st-accordion", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Accordion, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Accordion, isStandalone: true, selector: "st-accordion", inputs: { items: "items", openIds: "openIds", defaultOpenIds: "defaultOpenIds", allowMultiple: "allowMultiple", open: "open", multiple: "multiple", align: "align", size: "size", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Accordion, decorators: [{
            type: Component,
            args: [{
                    selector: "st-accordion",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { items: [{
                type: NgInput
            }], openIds: [{
                type: NgInput
            }], defaultOpenIds: [{
                type: NgInput
            }], allowMultiple: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], multiple: [{
                type: NgInput
            }], align: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Accordion.js.map
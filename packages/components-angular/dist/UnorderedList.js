import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class UnorderedList {
    static stComponentName = "UnorderedList";
    componentName = "UnorderedList";
    items;
    classInput;
    get hostClass() {
        return ["st-unorderedList", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: UnorderedList, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: UnorderedList, isStandalone: true, selector: "st-unordered-list", inputs: { items: "items", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: UnorderedList, decorators: [{
            type: Component,
            args: [{
                    selector: "st-unordered-list",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { items: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=UnorderedList.js.map
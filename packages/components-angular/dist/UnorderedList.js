import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class UnorderedList {
    static stComponentName = "UnorderedList";
    componentName = "UnorderedList";
    items;
    classInput;
    get hostClass() {
        return classNames("st-unorderedList", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: UnorderedList, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: UnorderedList, isStandalone: true, selector: "st-unordered-list", inputs: { items: "items", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <ul [attr.data-st-component]="componentName" [class]="hostClass">
      @for (item of items; track $index) {
        <li class="st-unorderedList__item">{{ item }}</li>
      }
      <ng-content></ng-content>
    </ul>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: UnorderedList, decorators: [{
            type: Component,
            args: [{
                    selector: "st-unordered-list",
                    standalone: true,
                    template: `
    <ul [attr.data-st-component]="componentName" [class]="hostClass">
      @for (item of items; track $index) {
        <li class="st-unorderedList__item">{{ item }}</li>
      }
      <ng-content></ng-content>
    </ul>
  `,
                }]
        }], propDecorators: { items: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=UnorderedList.js.map
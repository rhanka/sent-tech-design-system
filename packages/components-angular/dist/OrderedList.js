import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class OrderedList {
    static stComponentName = "OrderedList";
    componentName = "OrderedList";
    items;
    classInput;
    get hostClass() {
        return classNames("st-orderedList", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: OrderedList, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: OrderedList, isStandalone: true, selector: "st-ordered-list", inputs: { items: "items", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <ol [attr.data-st-component]="componentName" [class]="hostClass">
      @for (item of items; track $index) {
        <li class="st-orderedList__item">{{ item }}</li>
      }
      <ng-content></ng-content>
    </ol>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: OrderedList, decorators: [{
            type: Component,
            args: [{
                    selector: "st-ordered-list",
                    standalone: true,
                    template: `
    <ol [attr.data-st-component]="componentName" [class]="hostClass">
      @for (item of items; track $index) {
        <li class="st-orderedList__item">{{ item }}</li>
      }
      <ng-content></ng-content>
    </ol>
  `,
                }]
        }], propDecorators: { items: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=OrderedList.js.map
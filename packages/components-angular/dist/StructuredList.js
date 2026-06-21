import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class StructuredList {
    static stComponentName = "StructuredList";
    componentName = "StructuredList";
    items;
    bordered;
    classInput;
    get hostClass() {
        return classNames("st-structuredList", this.bordered && "st-structuredList--bordered", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StructuredList, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: StructuredList, isStandalone: true, selector: "st-structured-list", inputs: { items: "items", bordered: "bordered", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <dl [attr.data-st-component]="componentName" [class]="hostClass">
      @for (item of items; track $index) {
        <div class="st-structuredList__row">
          @if (item.term ?? item.label) {
            <dt class="st-structuredList__term">{{ item.term ?? item.label }}</dt>
          }
          <dd class="st-structuredList__description">{{ item.description ?? item.value }}</dd>
        </div>
      }
      <ng-content></ng-content>
    </dl>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StructuredList, decorators: [{
            type: Component,
            args: [{
                    selector: "st-structured-list",
                    standalone: true,
                    template: `
    <dl [attr.data-st-component]="componentName" [class]="hostClass">
      @for (item of items; track $index) {
        <div class="st-structuredList__row">
          @if (item.term ?? item.label) {
            <dt class="st-structuredList__term">{{ item.term ?? item.label }}</dt>
          }
          <dd class="st-structuredList__description">{{ item.description ?? item.value }}</dd>
        </div>
      }
      <ng-content></ng-content>
    </dl>
  `,
                }]
        }], propDecorators: { items: [{
                type: NgInput
            }], bordered: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=StructuredList.js.map
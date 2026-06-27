import { Component, Input as NgInput } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class OrderedList {
    static stComponentName = "OrderedList";
    componentName = "OrderedList";
    items = [];
    nested = false;
    classInput;
    normalize(item) {
        if (typeof item === "string")
            return { content: item };
        return item;
    }
    get hostClass() {
        return classNames("st-orderedList", this.nested && "st-orderedList--nested", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: OrderedList, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: OrderedList, isStandalone: true, selector: "st-ordered-list", inputs: { items: "items", nested: "nested", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <ol [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-container
        [ngTemplateOutlet]="listTpl"
        [ngTemplateOutletContext]="{ $implicit: items }"
      ></ng-container>
      <ng-content></ng-content>
    </ol>

    <ng-template #listTpl let-list>
      @for (raw of list; track $index) {
        @let item = normalize(raw);
        <li class="st-orderedList__item">
          {{ item.content }}
          @if (item.children && item.children.length > 0) {
            <ol class="st-orderedList st-orderedList--nested">
              <ng-container
                [ngTemplateOutlet]="listTpl"
                [ngTemplateOutletContext]="{ $implicit: item.children }"
              ></ng-container>
            </ol>
          }
        </li>
      }
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: OrderedList, decorators: [{
            type: Component,
            args: [{
                    selector: "st-ordered-list",
                    standalone: true,
                    imports: [NgTemplateOutlet],
                    template: `
    <ol [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-container
        [ngTemplateOutlet]="listTpl"
        [ngTemplateOutletContext]="{ $implicit: items }"
      ></ng-container>
      <ng-content></ng-content>
    </ol>

    <ng-template #listTpl let-list>
      @for (raw of list; track $index) {
        @let item = normalize(raw);
        <li class="st-orderedList__item">
          {{ item.content }}
          @if (item.children && item.children.length > 0) {
            <ol class="st-orderedList st-orderedList--nested">
              <ng-container
                [ngTemplateOutlet]="listTpl"
                [ngTemplateOutletContext]="{ $implicit: item.children }"
              ></ng-container>
            </ol>
          }
        </li>
      }
    </ng-template>
  `,
                }]
        }], propDecorators: { items: [{
                type: NgInput
            }], nested: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=OrderedList.js.map
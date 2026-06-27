import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Breadcrumb {
    static stComponentName = "Breadcrumb";
    componentName = "Breadcrumb";
    items;
    label;
    classInput;
    get hostClass() {
        return classNames("st-breadcrumb", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Breadcrumb, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Breadcrumb, isStandalone: true, selector: "st-breadcrumb", inputs: { items: "items", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <nav
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.aria-label]="label ?? 'Breadcrumb'"
    >
      <ol>
        @for (item of items; track $index) {
          <li>
            @if (item.href && !item.current) {
              <a [href]="item.href">{{ item.label }}</a>
            } @else {
              <span [attr.aria-current]="item.current ? 'page' : null">{{ item.label }}</span>
            }
            @if ($index < items.length - 1) {
              <span class="st-breadcrumb__separator" aria-hidden="true">/</span>
            }
          </li>
        }
      </ol>
      <ng-content></ng-content>
    </nav>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Breadcrumb, decorators: [{
            type: Component,
            args: [{
                    selector: "st-breadcrumb",
                    standalone: true,
                    template: `
    <nav
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.aria-label]="label ?? 'Breadcrumb'"
    >
      <ol>
        @for (item of items; track $index) {
          <li>
            @if (item.href && !item.current) {
              <a [href]="item.href">{{ item.label }}</a>
            } @else {
              <span [attr.aria-current]="item.current ? 'page' : null">{{ item.label }}</span>
            }
            @if ($index < items.length - 1) {
              <span class="st-breadcrumb__separator" aria-hidden="true">/</span>
            }
          </li>
        }
      </ol>
      <ng-content></ng-content>
    </nav>
  `,
                }]
        }], propDecorators: { items: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Breadcrumb.js.map
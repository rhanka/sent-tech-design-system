import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class SideNav {
    static stComponentName = "SideNav";
    componentName = "SideNav";
    items;
    label;
    classInput;
    linkClass(item) {
        return classNames("st-sidenav__link st-sideNav__link", item.active && "st-sidenav__link--active st-sideNav__link--active");
    }
    get hostClass() {
        return classNames("st-sidenav st-sideNav", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SideNav, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: SideNav, isStandalone: true, selector: "st-side-nav", inputs: { items: "items", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <nav
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.aria-label]="label ?? 'Navigation'"
    >
      @for (item of items; track item.href) {
        <a
          [href]="item.href"
          [class]="linkClass(item)"
          [attr.aria-current]="item.active ? 'page' : null"
        >{{ item.label }}</a>
      }
    </nav>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SideNav, decorators: [{
            type: Component,
            args: [{
                    selector: "st-side-nav",
                    standalone: true,
                    template: `
    <nav
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.aria-label]="label ?? 'Navigation'"
    >
      @for (item of items; track item.href) {
        <a
          [href]="item.href"
          [class]="linkClass(item)"
          [attr.aria-current]="item.active ? 'page' : null"
        >{{ item.label }}</a>
      }
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
//# sourceMappingURL=SideNav.js.map
import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Drawer {
    static stComponentName = "Drawer";
    componentName = "Drawer";
    open;
    title;
    description;
    placement;
    classInput;
    get hostClass() {
        return classNames("st-drawer", `st-drawer--${this.placement ?? "right"}`, this.open ? "st-drawer--open" : null, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Drawer, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Drawer, isStandalone: true, selector: "st-drawer", inputs: { open: "open", title: "title", description: "description", placement: "placement", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div class="st-drawer__backdrop" [attr.hidden]="open ? null : ''" role="presentation">
      <aside
        [attr.data-st-component]="componentName"
        role="dialog"
        [attr.aria-modal]="open ? 'true' : null"
        [attr.aria-label]="title"
        [class]="hostClass"
      >
        <header class="st-drawer__header" [attr.hidden]="title || description ? null : ''">
          <div>
            <h2 class="st-drawer__title">{{ title }}</h2>
            <p class="st-drawer__description" [attr.hidden]="description ? null : ''">{{ description }}</p>
          </div>
        </header>
        <div class="st-drawer__body">
          <ng-content></ng-content>
        </div>
      </aside>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Drawer, decorators: [{
            type: Component,
            args: [{
                    selector: "st-drawer",
                    standalone: true,
                    template: `
    <div class="st-drawer__backdrop" [attr.hidden]="open ? null : ''" role="presentation">
      <aside
        [attr.data-st-component]="componentName"
        role="dialog"
        [attr.aria-modal]="open ? 'true' : null"
        [attr.aria-label]="title"
        [class]="hostClass"
      >
        <header class="st-drawer__header" [attr.hidden]="title || description ? null : ''">
          <div>
            <h2 class="st-drawer__title">{{ title }}</h2>
            <p class="st-drawer__description" [attr.hidden]="description ? null : ''">{{ description }}</p>
          </div>
        </header>
        <div class="st-drawer__body">
          <ng-content></ng-content>
        </div>
      </aside>
    </div>
  `,
                }]
        }], propDecorators: { open: [{
                type: NgInput
            }], title: [{
                type: NgInput
            }], description: [{
                type: NgInput
            }], placement: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Drawer.js.map
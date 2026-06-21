import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class NavSection {
    static stComponentName = "NavSection";
    componentName = "NavSection";
    label;
    count;
    collapsible;
    open;
    as;
    classInput;
    get hostClass() {
        return classNames("st-navSection", this.collapsible ? "st-navSection--collapsible" : "st-navSection--static", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavSection, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: NavSection, isStandalone: true, selector: "st-nav-section", inputs: { label: "label", count: "count", collapsible: "collapsible", open: "open", as: "as", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <section [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-navSection__header">
        <span class="st-navSection__label">{{ label }}</span>
        @if (count !== undefined) {
          <span class="st-navSection__count">{{ count }}</span>
        }
      </div>
      <div class="st-navSection__content">
        <ng-content></ng-content>
      </div>
    </section>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavSection, decorators: [{
            type: Component,
            args: [{
                    selector: "st-nav-section",
                    standalone: true,
                    template: `
    <section [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-navSection__header">
        <span class="st-navSection__label">{{ label }}</span>
        @if (count !== undefined) {
          <span class="st-navSection__count">{{ count }}</span>
        }
      </div>
      <div class="st-navSection__content">
        <ng-content></ng-content>
      </div>
    </section>
  `,
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], count: [{
                type: NgInput
            }], collapsible: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], as: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=NavSection.js.map
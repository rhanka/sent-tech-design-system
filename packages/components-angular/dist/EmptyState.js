import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class EmptyState {
    static stComponentName = "EmptyState";
    componentName = "EmptyState";
    title;
    message;
    action;
    classInput;
    get hostClass() {
        return classNames("st-empty-state", "st-emptyState", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: EmptyState, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: EmptyState, isStandalone: true, selector: "st-empty-state", inputs: { title: "title", message: "message", action: "action", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <section [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-empty-state__content">
        <h2 class="st-empty-state__title st-emptyState__title">{{ title }}</h2>
        @if (message) { <p class="st-empty-state__message st-emptyState__message">{{ message }}</p> }
        <ng-content></ng-content>
        @if (action) { <div class="st-empty-state__action">{{ action }}</div> }
      </div>
    </section>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: EmptyState, decorators: [{
            type: Component,
            args: [{
                    selector: "st-empty-state",
                    standalone: true,
                    template: `
    <section [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-empty-state__content">
        <h2 class="st-empty-state__title st-emptyState__title">{{ title }}</h2>
        @if (message) { <p class="st-empty-state__message st-emptyState__message">{{ message }}</p> }
        <ng-content></ng-content>
        @if (action) { <div class="st-empty-state__action">{{ action }}</div> }
      </div>
    </section>
  `,
                }]
        }], propDecorators: { title: [{
                type: NgInput
            }], message: [{
                type: NgInput
            }], action: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=EmptyState.js.map
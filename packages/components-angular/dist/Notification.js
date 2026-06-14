import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Notification {
    static stComponentName = "Notification";
    componentName = "Notification";
    tone;
    title;
    message;
    dismissible;
    dismissLabel;
    classInput;
    get hostClass() {
        return ["st-notification", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Notification, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Notification, isStandalone: true, selector: "st-notification", inputs: { tone: "tone", title: "title", message: "message", dismissible: "dismissible", dismissLabel: "dismissLabel", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Notification, decorators: [{
            type: Component,
            args: [{
                    selector: "st-notification",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { tone: [{
                type: NgInput
            }], title: [{
                type: NgInput
            }], message: [{
                type: NgInput
            }], dismissible: [{
                type: NgInput
            }], dismissLabel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Notification.js.map
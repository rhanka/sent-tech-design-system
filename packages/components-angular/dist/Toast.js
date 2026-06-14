import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Toast {
    static stComponentName = "Toast";
    componentName = "Toast";
    tone;
    title;
    message;
    items;
    autoDismiss;
    duration;
    classInput;
    get hostClass() {
        return ["st-toast", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Toast, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Toast, isStandalone: true, selector: "st-toast", inputs: { tone: "tone", title: "title", message: "message", items: "items", autoDismiss: "autoDismiss", duration: "duration", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Toast, decorators: [{
            type: Component,
            args: [{
                    selector: "st-toast",
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
            }], items: [{
                type: NgInput
            }], autoDismiss: [{
                type: NgInput
            }], duration: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Toast.js.map
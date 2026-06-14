import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class CopyButton {
    static stComponentName = "CopyButton";
    componentName = "CopyButton";
    text;
    value;
    label;
    copiedLabel;
    size;
    classInput;
    get hostClass() {
        return ["st-copyButton", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: CopyButton, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: CopyButton, isStandalone: true, selector: "st-copy-button", inputs: { text: "text", value: "value", label: "label", copiedLabel: "copiedLabel", size: "size", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: CopyButton, decorators: [{
            type: Component,
            args: [{
                    selector: "st-copy-button",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { text: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], copiedLabel: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=CopyButton.js.map
import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class FileUploader {
    static stComponentName = "FileUploader";
    componentName = "FileUploader";
    label;
    helperText;
    errorText;
    invalid;
    accept;
    multiple;
    disabled;
    items;
    triggerLabel;
    dropzoneLabel;
    removeLabel;
    classInput;
    get hostClass() {
        return ["st-fileUploader", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: FileUploader, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: FileUploader, isStandalone: true, selector: "st-file-uploader", inputs: { label: "label", helperText: "helperText", errorText: "errorText", invalid: "invalid", accept: "accept", multiple: "multiple", disabled: "disabled", items: "items", triggerLabel: "triggerLabel", dropzoneLabel: "dropzoneLabel", removeLabel: "removeLabel", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: FileUploader, decorators: [{
            type: Component,
            args: [{
                    selector: "st-file-uploader",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], helperText: [{
                type: NgInput
            }], errorText: [{
                type: NgInput
            }], invalid: [{
                type: NgInput
            }], accept: [{
                type: NgInput
            }], multiple: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], items: [{
                type: NgInput
            }], triggerLabel: [{
                type: NgInput
            }], dropzoneLabel: [{
                type: NgInput
            }], removeLabel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=FileUploader.js.map
import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Transcription {
    static stComponentName = "Transcription";
    componentName = "Transcription";
    title;
    segments;
    text;
    classInput;
    open;
    showTimestamps;
    get hostClass() {
        return ["st-transcription", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Transcription, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Transcription, isStandalone: true, selector: "st-transcription", inputs: { title: "title", segments: "segments", text: "text", classInput: ["class", "classInput"], open: "open", showTimestamps: "showTimestamps" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Transcription, decorators: [{
            type: Component,
            args: [{
                    selector: "st-transcription",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { title: [{
                type: NgInput
            }], segments: [{
                type: NgInput
            }], text: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], open: [{
                type: NgInput
            }], showTimestamps: [{
                type: NgInput
            }] } });
//# sourceMappingURL=Transcription.js.map
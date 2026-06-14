import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class StreamingMessage {
    static stComponentName = "StreamingMessage";
    componentName = "StreamingMessage";
    text;
    events;
    mode;
    classInput;
    get hostClass() {
        return ["st-streamingMessage", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StreamingMessage, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: StreamingMessage, isStandalone: true, selector: "st-streaming-message", inputs: { text: "text", events: "events", mode: "mode", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StreamingMessage, decorators: [{
            type: Component,
            args: [{
                    selector: "st-streaming-message",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { text: [{
                type: NgInput
            }], events: [{
                type: NgInput
            }], mode: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=StreamingMessage.js.map
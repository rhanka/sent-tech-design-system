import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { ChatMessage } from "./ChatMessage.js";
import * as i0 from "@angular/core";
export class ChatThread {
    static stComponentName = "ChatThread";
    componentName = "ChatThread";
    messages;
    emptyLabel;
    classInput;
    get hostClass() {
        return ["st-chatThread", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ChatThread, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: ChatThread, isStandalone: true, selector: "st-chat-thread", inputs: { messages: "messages", emptyLabel: "emptyLabel", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ChatThread, decorators: [{
            type: Component,
            args: [{
                    selector: "st-chat-thread",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { messages: [{
                type: NgInput
            }], emptyLabel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ChatThread.js.map
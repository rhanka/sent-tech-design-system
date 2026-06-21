import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class MessageStatusBadge {
    static stComponentName = "MessageStatusBadge";
    componentName = "MessageStatusBadge";
    status;
    tone;
    labels;
    label;
    classInput;
    get hostClass() {
        return classNames("st-messageStatusBadge", this.status ? `st-messageStatusBadge--${this.status}` : undefined, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MessageStatusBadge, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: MessageStatusBadge, isStandalone: true, selector: "st-message-status-badge", inputs: { status: "status", tone: "tone", labels: "labels", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <span class="st-messageStatusBadge" [class]="hostClass">{{ label }}</span>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MessageStatusBadge, decorators: [{
            type: Component,
            args: [{
                    selector: "st-message-status-badge",
                    standalone: true,
                    template: `
    <span class="st-messageStatusBadge" [class]="hostClass">{{ label }}</span>
  `,
                }]
        }], propDecorators: { status: [{
                type: NgInput
            }], tone: [{
                type: NgInput
            }], labels: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=MessageStatusBadge.js.map
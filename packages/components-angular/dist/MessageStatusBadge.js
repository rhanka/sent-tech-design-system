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
    get normalizedStatus() {
        const status = this.status;
        if (status === "sent")
            return "completed";
        if (status === "streaming")
            return "processing";
        if (status === "error")
            return "failed";
        return status;
    }
    get resolvedTone() {
        if (this.tone)
            return this.tone;
        const normalized = this.normalizedStatus;
        if (normalized === "completed")
            return "success";
        if (normalized === "failed")
            return "error";
        if (normalized === "processing")
            return "info";
        return "neutral";
    }
    get resolvedLabel() {
        if (this.label != null)
            return this.label;
        const fromLabels = this.labels?.[this.status] ?? this.labels?.[this.normalizedStatus];
        if (fromLabels != null)
            return fromLabels;
        const normalized = this.normalizedStatus;
        return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : normalized;
    }
    get hostClass() {
        return classNames("st-messageStatusBadge", `st-badge st-badge--${this.resolvedTone}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MessageStatusBadge, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: MessageStatusBadge, isStandalone: true, selector: "st-message-status-badge", inputs: { status: "status", tone: "tone", labels: "labels", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <span [class]="hostClass">
      <span class="st-messageStatusBadge__dot" aria-hidden="true"></span>{{ resolvedLabel }}</span>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MessageStatusBadge, decorators: [{
            type: Component,
            args: [{
                    selector: "st-message-status-badge",
                    standalone: true,
                    template: `
    <span [class]="hostClass">
      <span class="st-messageStatusBadge__dot" aria-hidden="true"></span>{{ resolvedLabel }}</span>
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
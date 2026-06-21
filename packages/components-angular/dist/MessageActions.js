import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class MessageActions {
    static stComponentName = "MessageActions";
    componentName = "MessageActions";
    actions = [];
    visibility;
    classInput;
    get hostClass() {
        return classNames("st-messageActions", this.visibility === "hover" ? "st-messageActions--hoverOnly" : undefined, this.classInput);
    }
    actionClass(variant) {
        return classNames("st-messageActions__action", variant === "danger" ? "st-messageActions__action--danger" : undefined);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MessageActions, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: MessageActions, isStandalone: true, selector: "st-message-actions", inputs: { actions: "actions", visibility: "visibility", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="group" aria-label="Actions du message">
      @for (action of actions ?? []; track action.id ?? $index) {
        <button
          type="button"
          [class]="actionClass(action.variant)"
          [disabled]="action.disabled ?? false"
          [attr.aria-label]="action.label ?? null"
          (click)="action.onClick && action.onClick()"
        >{{ action.label }}</button>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MessageActions, decorators: [{
            type: Component,
            args: [{
                    selector: "st-message-actions",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="group" aria-label="Actions du message">
      @for (action of actions ?? []; track action.id ?? $index) {
        <button
          type="button"
          [class]="actionClass(action.variant)"
          [disabled]="action.disabled ?? false"
          [attr.aria-label]="action.label ?? null"
          (click)="action.onClick && action.onClick()"
        >{{ action.label }}</button>
      }
    </div>
  `,
                }]
        }], propDecorators: { actions: [{
                type: NgInput
            }], visibility: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=MessageActions.js.map
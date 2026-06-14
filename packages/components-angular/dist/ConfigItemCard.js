import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class ConfigItemCard {
    static stComponentName = "ConfigItemCard";
    componentName = "ConfigItemCard";
    item;
    hasCopy;
    onCopy;
    onEdit;
    onReset;
    onDelete;
    disabled;
    classInput;
    get hostClass() {
        return ["st-configItemCard", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ConfigItemCard, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: ConfigItemCard, isStandalone: true, selector: "st-config-item-card", inputs: { item: "item", hasCopy: "hasCopy", onCopy: "onCopy", onEdit: "onEdit", onReset: "onReset", onDelete: "onDelete", disabled: "disabled", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ConfigItemCard, decorators: [{
            type: Component,
            args: [{
                    selector: "st-config-item-card",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { item: [{
                type: NgInput
            }], hasCopy: [{
                type: NgInput
            }], onCopy: [{
                type: NgInput
            }], onEdit: [{
                type: NgInput
            }], onReset: [{
                type: NgInput
            }], onDelete: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ConfigItemCard.js.map
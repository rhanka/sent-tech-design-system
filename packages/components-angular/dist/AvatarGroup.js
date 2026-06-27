import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class AvatarGroup {
    static stComponentName = "AvatarGroup";
    componentName = "AvatarGroup";
    max;
    size;
    total;
    classInput;
    get hostClass() {
        return classNames("st-avatarGroup", `st-avatarGroup--${this.size ?? "md"}`, this.classInput);
    }
    get overflow() {
        return this.total && this.max && this.total > this.max ? this.total - this.max : 0;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: AvatarGroup, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: AvatarGroup, isStandalone: true, selector: "st-avatar-group", inputs: { max: "max", size: "size", total: "total", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
      @if (overflow > 0) {
        <span class="st-avatarGroup__overflow" [attr.aria-label]="'+' + overflow">+{{ overflow }}</span>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: AvatarGroup, decorators: [{
            type: Component,
            args: [{
                    selector: "st-avatar-group",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
      @if (overflow > 0) {
        <span class="st-avatarGroup__overflow" [attr.aria-label]="'+' + overflow">+{{ overflow }}</span>
      }
    </div>
  `,
                }]
        }], propDecorators: { max: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], total: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=AvatarGroup.js.map
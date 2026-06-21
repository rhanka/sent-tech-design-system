import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { deriveInitials } from "./Header.js";
import * as i0 from "@angular/core";
export class Avatar {
    static stComponentName = "Avatar";
    componentName = "Avatar";
    name;
    src;
    alt;
    size;
    shape;
    tone;
    classInput;
    get hostClass() {
        return classNames("st-avatar", `st-avatar--${this.size ?? "md"}`, `st-avatar--${this.shape ?? "circle"}`, this.src ? "st-avatar--image" : `st-avatar--${this.tone ?? "category1"}`, this.classInput);
    }
    get initials() {
        return deriveInitials(this.name);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Avatar, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Avatar, isStandalone: true, selector: "st-avatar", inputs: { name: "name", src: "src", alt: "alt", size: "size", shape: "shape", tone: "tone", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" [attr.aria-label]="name" role="img">
      @if (src) {
        <img class="st-avatar__image" [src]="src" [alt]="alt || name" aria-hidden="false" />
      } @else {
        <span class="st-avatar__initials" aria-hidden="true">{{ initials }}</span>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Avatar, decorators: [{
            type: Component,
            args: [{
                    selector: "st-avatar",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" [attr.aria-label]="name" role="img">
      @if (src) {
        <img class="st-avatar__image" [src]="src" [alt]="alt || name" aria-hidden="false" />
      } @else {
        <span class="st-avatar__initials" aria-hidden="true">{{ initials }}</span>
      }
    </div>
  `,
                }]
        }], propDecorators: { name: [{
                type: NgInput
            }], src: [{
                type: NgInput
            }], alt: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], shape: [{
                type: NgInput
            }], tone: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Avatar.js.map
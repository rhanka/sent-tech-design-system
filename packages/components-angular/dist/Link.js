import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Link {
    static stComponentName = "Link";
    componentName = "Link";
    href;
    variant;
    standalone;
    muted;
    disabled;
    external;
    classInput;
    get hostClass() {
        return ["st-link", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Link, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Link, isStandalone: true, selector: "st-link", inputs: { href: "href", variant: "variant", standalone: "standalone", muted: "muted", disabled: "disabled", external: "external", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Link, decorators: [{
            type: Component,
            args: [{
                    selector: "st-link",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { href: [{
                type: NgInput
            }], variant: [{
                type: NgInput
            }], standalone: [{
                type: NgInput
            }], muted: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], external: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Link.js.map
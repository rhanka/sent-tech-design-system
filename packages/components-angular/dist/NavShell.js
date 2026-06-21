import { Component, Input as NgInput } from "@angular/core";
import * as i0 from "@angular/core";
export class NavShell {
    static stComponentName = "NavShell";
    componentName = "NavShell";
    variant = "rail";
    title;
    subtitle;
    label;
    open;
    side = "left";
    classInput;
    get hostClass() {
        return ["st-navShell", `st-navShell--${this.variant}`, this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavShell, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: NavShell, isStandalone: true, selector: "st-nav-shell", inputs: { variant: "variant", title: "title", subtitle: "subtitle", label: "label", open: "open", side: "side", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <aside [attr.data-st-component]="componentName" [attr.aria-label]="label || title" [class]="hostClass">
      <ng-content></ng-content>
    </aside>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavShell, decorators: [{
            type: Component,
            args: [{
                    selector: "st-nav-shell",
                    standalone: true,
                    template: `
    <aside [attr.data-st-component]="componentName" [attr.aria-label]="label || title" [class]="hostClass">
      <ng-content></ng-content>
    </aside>
  `,
                }]
        }], propDecorators: { variant: [{
                type: NgInput
            }], title: [{
                type: NgInput
            }], subtitle: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], side: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=NavShell.js.map
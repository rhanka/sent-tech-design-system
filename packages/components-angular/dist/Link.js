import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Link {
    static stComponentName = "Link";
    componentName = "Link";
    href;
    variant = "inline";
    standalone = false;
    muted = false;
    disabled = false;
    external = false;
    target;
    rel;
    classInput;
    get effectiveVariant() {
        if (this.variant !== "inline")
            return this.variant;
        if (this.standalone)
            return "standalone";
        if (this.muted)
            return "muted";
        return "inline";
    }
    get effectiveTarget() {
        return this.target ?? (this.external ? "_blank" : null);
    }
    get effectiveRel() {
        return this.rel ?? (this.external ? "noreferrer" : null);
    }
    get hostClass() {
        return classNames("st-link", `st-link--${this.effectiveVariant}`, this.disabled && "st-link--disabled", this.classInput);
    }
    handleClick(event) {
        if (this.disabled) {
            event.preventDefault();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Link, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Link, isStandalone: true, selector: "st-link", inputs: { href: "href", variant: "variant", standalone: "standalone", muted: "muted", disabled: "disabled", external: "external", target: "target", rel: "rel", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <a
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.href]="disabled ? null : href"
      [attr.target]="effectiveTarget"
      [attr.rel]="effectiveRel"
      [attr.aria-disabled]="disabled ? 'true' : null"
      (click)="handleClick($event)"
    >
      <ng-content></ng-content>
    </a>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Link, decorators: [{
            type: Component,
            args: [{
                    selector: "st-link",
                    standalone: true,
                    template: `
    <a
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.href]="disabled ? null : href"
      [attr.target]="effectiveTarget"
      [attr.rel]="effectiveRel"
      [attr.aria-disabled]="disabled ? 'true' : null"
      (click)="handleClick($event)"
    >
      <ng-content></ng-content>
    </a>
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
            }], target: [{
                type: NgInput
            }], rel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Link.js.map
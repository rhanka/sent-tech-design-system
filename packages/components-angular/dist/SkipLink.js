import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class SkipLink {
    static stComponentName = "SkipLink";
    componentName = "SkipLink";
    href;
    classInput;
    get hostClass() {
        return classNames("st-skipLink", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SkipLink, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: SkipLink, isStandalone: true, selector: "st-skip-link", inputs: { href: "href", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <a [href]="href || '#main-content'" [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content>Aller au contenu principal</ng-content>
    </a>
  `, isInline: true, styles: [":host { display: contents; }"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SkipLink, decorators: [{
            type: Component,
            args: [{ selector: "st-skip-link", standalone: true, template: `
    <a [href]="href || '#main-content'" [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content>Aller au contenu principal</ng-content>
    </a>
  `, styles: [":host { display: contents; }"] }]
        }], propDecorators: { href: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=SkipLink.js.map